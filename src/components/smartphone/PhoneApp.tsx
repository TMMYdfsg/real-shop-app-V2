import { useState, useEffect, useCallback, useRef } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { useGame } from '@/context/GameContext';
import { getAgoraClient, createMicrophoneTrack, generateChannelName } from '@/lib/agora';
import { AppHeader } from './AppHeader';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;


interface VoiceCall {
    id: string;
    callerId: string;
    receiverId: string;
    status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'MISSED' | 'DECLINED';
    startedAt: string;
    endedAt?: string;
    caller: User;
    receiver: User;
}

interface User {
    id: string;
    name: string;
    playerIcon?: string;
    smartphone?: {
        apps?: string[];
    };
}

export default function PhoneApp({ onClose }: { onClose: () => void }) {
    const [incomingCall, setIncomingCall] = useState<VoiceCall | null>(null);
    const [activeCall, setActiveCall] = useState<VoiceCall | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [agoraClient, setAgoraClient] = useState<any>(null);
    const [microphoneTrack, setMicrophoneTrack] = useState<any>(null);
    const [hasMicPermission, setHasMicPermission] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const remoteTracksRef = useRef<any[]>([]);
    const lastEndedCallIdRef = useRef<string | null>(null);
    const speakerStateRef = useRef(false);
    const outgoingToneRef = useRef<HTMLAudioElement | null>(null);
    const outgoingToneNameRef = useRef<string | null>(null);
    // Incoming tone handled by CommunicationNotifier now for global support

    // For YouTube support
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);


    const [connectionState, setConnectionState] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
    const [isPublished, setIsPublished] = useState(false);

    const { gameState, currentUser } = useGame();

    const [httpsError, setHttpsError] = useState(false);



    const hasPhoneApp = (user?: User | null) => Array.isArray(user?.smartphone?.apps) && user!.smartphone!.apps!.includes('phone');
    const canUsePhoneApp = hasPhoneApp(currentUser as unknown as User);

    // 通話履歴と着信をリアルタイム取得
    const { data: calls, isConnected, error: connectionError } = useRealtime<VoiceCall[]>(
        '/api/calls',
        { interval: 2000, enabled: !!currentUser && canUsePhoneApp }
    );

    // SSLチェック
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
            setHttpsError(true);
        }
    }, []);

    // マイク権限チェック
    useEffect(() => {
        const checkPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(t => t.stop());
                setHasMicPermission(true);
            } catch (e) {
                console.log('Mic permission needed');
            }
        };
        checkPermission();
    }, []);

    // 着信チェック (useRealtimeのデータを使用)
    useEffect(() => {
        if (!calls || !Array.isArray(calls)) return;

        const pending = calls.find(c => c.status === 'PENDING' && c.receiverId === currentUser?.id);

        if (pending && (!incomingCall || pending.id !== incomingCall.id)) {
            setIncomingCall(pending);
        } else if (!pending && incomingCall) {
            setIncomingCall(null);
        }
    }, [calls, incomingCall, currentUser?.id]);

    const getMyId = () => currentUser?.id || '';

    const getIncomingTone = useCallback(() => {
        return currentUser?.smartphone?.settings?.incomingCallSound
            || localStorage.getItem('notification_sound')
            || 'notification_1.mp3';
    }, [currentUser?.smartphone?.settings?.incomingCallSound]);

    const getOutgoingTone = useCallback(() => {
        return currentUser?.smartphone?.settings?.outgoingCallSound
            || localStorage.getItem('notification_sound')
            || 'notification_1.mp3';
    }, [currentUser?.smartphone?.settings?.outgoingCallSound]);

    const stopTone = (ref: React.MutableRefObject<HTMLAudioElement | null>, nameRef: React.MutableRefObject<string | null>) => {
        if (ref.current) {
            ref.current.pause();
            ref.current.currentTime = 0;
        }
        ref.current = null;
        nameRef.current = null;
        setPlayingUrl(null); // Also stop Youtube
    };

    const playLoopTone = (ref: React.MutableRefObject<HTMLAudioElement | null>, nameRef: React.MutableRefObject<string | null>, filename: string) => {
        if (filename.startsWith('http')) {
            // YouTube or external URL
            stopTone(ref, nameRef); // Ensure audio is stopped
            setPlayingUrl(filename);
            return;
        }

        // Local file
        if (nameRef.current === filename) return;
        stopTone(ref, nameRef);
        const audio = new Audio(`/sounds/${filename}`);
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(() => { });
        ref.current = audio;
        nameRef.current = filename;
    };

    const playCallEndSound = useCallback((callId?: string) => {
        if (typeof window === 'undefined') return;
        if (callId && lastEndedCallIdRef.current === callId) return;
        const filename = localStorage.getItem('notification_sound') || 'notification_1.mp3';
        const audio = new Audio(`/sounds/${filename}`);
        audio.volume = 0.6;
        audio.play().catch(() => { });
        if (callId) lastEndedCallIdRef.current = callId;
    }, []);

    const setRemoteVolume = useCallback((volume: number) => {
        remoteTracksRef.current.forEach((track) => {
            if (track && typeof track.setVolume === 'function') {
                track.setVolume(volume);
            }
        });
    }, []);

    useEffect(() => {
        speakerStateRef.current = isSpeakerOn;
        setRemoteVolume(isSpeakerOn ? 100 : 60);
    }, [isSpeakerOn, setRemoteVolume]);

    /* Incoming tone is now handled globally by CommunicationNotifier
    useEffect(() => {
        if (!incomingCall || !canUsePhoneApp) {
            stopTone(incomingToneRef, incomingToneNameRef);
            return;
        }
        playLoopTone(incomingToneRef, incomingToneNameRef, getIncomingTone());
    }, [incomingCall, canUsePhoneApp, getIncomingTone]);
    */

    useEffect(() => {
        const isCalling = activeCall
            && activeCall.status === 'PENDING'
            && activeCall.caller.id === getMyId();
        if (!isCalling) {
            stopTone(outgoingToneRef, outgoingToneNameRef);
            return;
        }
        playLoopTone(outgoingToneRef, outgoingToneNameRef, getOutgoingTone());
    }, [activeCall, getOutgoingTone, getMyId]);

    useEffect(() => {
        if (!activeCall || !calls || !Array.isArray(calls)) return;
        const updated = calls.find(c => c.id === activeCall.id);
        if (!updated) return;
        if (updated.status !== activeCall.status) {
            setActiveCall(updated);
        }
        if (['ENDED', 'DECLINED', 'MISSED'].includes(updated.status)) {
            leaveVoiceChannel();
            setActiveCall(null);
            playCallEndSound(updated.id);
        }
    }, [calls, activeCall, playCallEndSound]);

    const initiateCall = async (receiverId: string) => {
        try {
            if (currentUser && !hasPhoneApp(currentUser as unknown as User)) {
                alert('電話アプリがインストールされていません');
                return;
            }
            const receiver = gameState?.users.find(u => u.id === receiverId) as User | undefined;
            if (receiver && !hasPhoneApp(receiver)) {
                alert('相手のスマホに電話アプリが入っていません');
                return;
            }
            const res = await fetch('/api/calls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(currentUser?.id ? { 'x-player-id': currentUser.id } : {})
                },
                credentials: 'include',
                body: JSON.stringify({ receiverId, playerId: currentUser?.id }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.error || '通話の開始に失敗しました');
            }
            const { call, token, channelId, uid } = await res.json();
            if (!channelId) {
                throw new Error('通話チャンネルの作成に失敗しました');
            }
            setActiveCall(call);
            const safeToken = typeof token === 'string' && token.length > 0 ? token : null;
            const safeUid = typeof uid === 'number' ? uid : null;
            await joinVoiceChannel(channelId, safeToken, safeUid);
        } catch (error) {
            console.error('Failed to initiate call:', error);
            alert(error instanceof Error ? error.message : '通話の開始に失敗しました');
        }
    };

    const answerCall = async (call: VoiceCall) => {
        try {
            const res = await fetch(`/api/calls/${call.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(currentUser?.id ? { 'x-player-id': currentUser.id } : {})
                },
                credentials: 'include',
                body: JSON.stringify({ status: 'ACTIVE', playerId: currentUser?.id }),
            });
            if (!res.ok) {
                throw new Error('通話の開始に失敗しました');
            }
            const data = await res.json();
            const token = typeof data.token === 'string' && data.token.length > 0 ? data.token : null;
            const uid = typeof data.uid === 'number' ? data.uid : null;
            setIncomingCall(null);
            setActiveCall(call);
            await joinVoiceChannel(call.id, token, uid);
        } catch (error) {
            console.error('Failed to answer call:', error);
        }
    };

    const declineCall = async (call: VoiceCall) => {
        try {
            await fetch(`/api/calls/${call.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(currentUser?.id ? { 'x-player-id': currentUser.id } : {})
                },
                credentials: 'include',
                body: JSON.stringify({ status: 'DECLINED', playerId: currentUser?.id }),
            });
            setIncomingCall(null);
            playCallEndSound(call.id);
        } catch (error) { }
    };

    const endCall = async () => {
        if (!activeCall) return;
        try {
            await fetch(`/api/calls/${activeCall.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(currentUser?.id ? { 'x-player-id': currentUser.id } : {})
                },
                credentials: 'include',
                body: JSON.stringify({
                    status: 'ENDED',
                    duration: Math.floor((Date.now() - new Date(activeCall.startedAt).getTime()) / 1000),
                    playerId: currentUser?.id,
                }),
            });
            await leaveVoiceChannel();
            setActiveCall(null);
            playCallEndSound(activeCall.id);
        } catch (error) { }
    };

    const joinVoiceChannel = async (channelId: string, token: string | null, uid: number | null) => {
        if (typeof window === 'undefined') return;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (window.location.protocol !== 'https:' && !isLocalhost) {
            setHttpsError(true);
            alert('通話にはHTTPS接続が必要です。HTTPSまたはlocalhostで実行してください。');
            return;
        }

        try {
            setConnectionState('CONNECTING');

            // Agora SDK must be loaded on client side
            const { getAgoraClient } = await import('@/lib/agora');

            const client = await getAgoraClient() as any;
            setAgoraClient(client);

            // Removing existing listeners prevents duplicates on re-join
            client.removeAllListeners();

            client.on('user-published', async (user: any, mediaType: 'audio') => {
                await client.subscribe(user, mediaType);
                if (mediaType === 'audio') {
                    user.audioTrack?.play();
                    if (typeof user.audioTrack?.setVolume === 'function') {
                        user.audioTrack.setVolume(speakerStateRef.current ? 100 : 60);
                    }
                    remoteTracksRef.current = [...remoteTracksRef.current, user.audioTrack].filter(Boolean);
                }
            });

            client.on('user-unpublished', (user: any, mediaType: 'audio') => {
                if (mediaType === 'audio' && user.audioTrack) {
                    if (typeof user.audioTrack.stop === 'function') {
                        user.audioTrack.stop();
                    }
                    remoteTracksRef.current = remoteTracksRef.current.filter((track) => track !== user.audioTrack);
                }
            });

            if (!process.env.NEXT_PUBLIC_AGORA_APP_ID) {
                throw new Error('Agora App ID is missing');
            }
            await client.join(process.env.NEXT_PUBLIC_AGORA_APP_ID, generateChannelName(channelId), token ?? null, uid ?? null);
            setConnectionState('CONNECTED');

            const track = await createMicrophoneTrack();
            setMicrophoneTrack(track);
            if (track) {
                if (typeof track.setMuted === 'function' && isMuted) {
                    track.setMuted(true);
                }
                await client.publish([track]);
                setIsPublished(true);
            }
        } catch (e) {
            console.error('Agora Connection Failed:', e);
            setConnectionState('DISCONNECTED');
            alert('通話サーバーへの接続に失敗しました。');
        }
    };

    const leaveVoiceChannel = async () => {
        stopTone(outgoingToneRef, outgoingToneNameRef);
        // stopTone(incomingToneRef, incomingToneNameRef);
        if (microphoneTrack) {
            if (typeof microphoneTrack.setMuted === 'function') {
                microphoneTrack.setMuted(true);
            }
            if (typeof microphoneTrack.stop === 'function') {
                microphoneTrack.stop();
            }
            if (typeof microphoneTrack.close === 'function') {
                microphoneTrack.close();
            }
        }
        remoteTracksRef.current.forEach((track) => {
            if (track && typeof track.stop === 'function') {
                track.stop();
            }
        });
        remoteTracksRef.current = [];
        if (agoraClient) {
            if (typeof agoraClient.removeAllListeners === 'function') {
                agoraClient.removeAllListeners();
            }
            await agoraClient.leave();
        }
        setAgoraClient(null);
        setMicrophoneTrack(null);
        setIsPublished(false);
        setConnectionState('DISCONNECTED');
    };

    const toggleMute = () => {
        if (microphoneTrack) {
            if (typeof microphoneTrack.setMuted === 'function') {
                microphoneTrack.setMuted(!isMuted);
            }
            setIsMuted(!isMuted);
        }
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn((prev) => !prev);
    };

    // --- RENDER ---

    // Active Call Screen
    if (activeCall) {
        const isCaller = activeCall.caller.id === getMyId();
        const statusLabel = activeCall.status === 'PENDING' && isCaller ? '呼び出し中...' : '通話中...';
        return (
            <div className="h-full bg-slate-900 text-white flex flex-col items-center pt-20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-600 rounded-full mb-6 flex items-center justify-center text-5xl shadow-xl">
                        👤
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                        {activeCall.caller.id === getMyId() ? activeCall.receiver.name : activeCall.caller.name}
                    </h2>
                    <p className="text-white/60 mb-2 font-medium">
                        {statusLabel}
                    </p>
                    <p className="text-white/60 mb-12 font-mono">
                        {Math.floor((Date.now() - new Date(activeCall.startedAt).getTime()) / 1000 / 60)}:
                        {String(Math.floor((Date.now() - new Date(activeCall.startedAt).getTime()) / 1000 % 60)).padStart(2, '0')}
                    </p>

                    <div className="grid grid-cols-3 gap-6 mb-12">
                        <CallButton icon="🔇" label="消音" active={isMuted} onClick={toggleMute} />
                        <CallButton icon="⌨️" label="キーパッド" onClick={() => { }} />
                        <CallButton icon="🔊" label="スピーカー" active={isSpeakerOn} onClick={toggleSpeaker} />
                    </div>

                    <button onClick={endCall} className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-2xl shadow-lg">
                        📞
                    </button>
                </div>
            </div>
        );
    }

    // Default: Contacts List
    return (
        <div className="h-full bg-white flex flex-col relative">
            {playingUrl && (
                <div style={{ display: 'none' }}>
                    <ReactPlayer url={playingUrl} playing loop volume={0.5} width={0} height={0} />
                </div>
            )}
            <AppHeader title="電話" onBack={onClose} />

            {/* Warnings */}
            {httpsError && (
                <div className="bg-red-100 p-2 text-xs text-red-600 text-center border-b border-red-200">
                    ⚠️ 音声通話にはHTTPS接続が必要です
                </div>
            )}
            {!isConnected && (
                <div className="bg-yellow-100 p-2 text-xs text-yellow-700 text-center border-b border-yellow-200 animate-pulse">
                    📡 接続を確認中...
                </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {incomingCall && (
                    <div className="sticky top-0 z-40 px-4 pt-3">
                        <div className="rounded-2xl bg-white/95 border border-emerald-200 shadow-lg p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
                                    📞
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{incomingCall.caller.name}</div>
                                    <div className="text-xs text-gray-500">着信中...</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => declineCall(incomingCall)}
                                    className="px-3 py-2 text-xs rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                                >
                                    拒否
                                </button>
                                <button
                                    onClick={() => answerCall(incomingCall)}
                                    className="px-3 py-2 text-xs rounded-full bg-emerald-500 text-white shadow hover:bg-emerald-600"
                                >
                                    応答
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="px-6 py-2 text-xs font-bold text-gray-500 bg-gray-50">連絡先</div>
                {gameState?.users
                    .filter(u => u.id !== currentUser?.id)
                    .map(u => (
                        <div
                            key={u.id}
                            className={`flex items-center justify-between p-4 border-b border-gray-100 transition ${hasPhoneApp(u as User) ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60'}`}
                            onClick={() => {
                                if (!hasPhoneApp(u as User)) {
                                    alert('相手のスマホに電話アプリが入っていません');
                                    return;
                                }
                                initiateCall(u.id);
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg text-gray-500 font-bold">
                                    {u.name[0]}
                                </div>
                                <span className="font-bold text-gray-800 text-lg">{u.name}</span>
                            </div>
                            <span className={`text-xs font-bold ${hasPhoneApp(u as User) ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {hasPhoneApp(u as User) ? '発信' : '未インストール'}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
}

const CallButton = ({ icon, label, active, onClick }: any) => (
    <div className="flex flex-col items-center gap-2">
        <button
            onClick={onClick}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${active ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
            {icon}
        </button>
        <span className="text-xs text-white/70">{label}</span>
    </div>
);
