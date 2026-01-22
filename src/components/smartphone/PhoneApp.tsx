import { useState, useEffect } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { useGame } from '@/context/GameContext';
import { getAgoraClient, createMicrophoneTrack, generateChannelName } from '@/lib/agora';
import { AppHeader } from './AppHeader';

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
}

export default function PhoneApp({ onClose }: { onClose: () => void }) {
    const [incomingCall, setIncomingCall] = useState<VoiceCall | null>(null);
    const [activeCall, setActiveCall] = useState<VoiceCall | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [agoraClient, setAgoraClient] = useState<any>(null);
    const [microphoneTrack, setMicrophoneTrack] = useState<any>(null);
    const [hasMicPermission, setHasMicPermission] = useState(false);

    const [connectionState, setConnectionState] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
    const [isPublished, setIsPublished] = useState(false);

    const { gameState, currentUser } = useGame();

    const [httpsError, setHttpsError] = useState(false);



    // 通話履歴と着信をリアルタイム取得
    const { data: calls, isConnected, error: connectionError } = useRealtime<VoiceCall[]>(
        '/api/calls',
        { interval: 2000, enabled: !!currentUser }
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
        }
    }, [calls, incomingCall, currentUser?.id]);

    const getMyId = () => currentUser?.id || '';

    const initiateCall = async (receiverId: string) => {
        try {
            const res = await fetch('/api/calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId }),
            });
            const { call, token, channelId } = await res.json();
            setActiveCall(call);
            await joinVoiceChannel(channelId, token);
        } catch (error) {
            console.error('Failed to initiate call:', error);
            alert('通話の開始に失敗しました');
        }
    };

    const answerCall = async (call: VoiceCall) => {
        try {
            const res = await fetch(`/api/calls/${call.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ACTIVE' }),
            });
            const data = await res.json();
            const token = data.token;
            setIncomingCall(null);
            setActiveCall(call);
            await joinVoiceChannel(call.id, token || 'dummy-token');
        } catch (error) {
            console.error('Failed to answer call:', error);
        }
    };

    const declineCall = async (call: VoiceCall) => {
        try {
            await fetch(`/api/calls/${call.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'DECLINED' }),
            });
            setIncomingCall(null);
        } catch (error) { }
    };

    const endCall = async () => {
        if (!activeCall) return;
        try {
            await fetch(`/api/calls/${activeCall.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'ENDED',
                    duration: Math.floor((Date.now() - new Date(activeCall.startedAt).getTime()) / 1000),
                }),
            });
            await leaveVoiceChannel();
            setActiveCall(null);
        } catch (error) { }
    };

    const joinVoiceChannel = async (channelId: string, token: string) => {
        if (typeof window === 'undefined') return;

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
                if (mediaType === 'audio') user.audioTrack?.play();
            });

            await client.join(process.env.NEXT_PUBLIC_AGORA_APP_ID!, generateChannelName(channelId), token, null);
            setConnectionState('CONNECTED');

            const track = await createMicrophoneTrack();
            setMicrophoneTrack(track);
            if (track) {
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
        microphoneTrack?.close();
        agoraClient?.leave();
        setAgoraClient(null);
        setMicrophoneTrack(null);
        setIsPublished(false);
        setConnectionState('DISCONNECTED');
    };

    const toggleMute = () => {
        if (microphoneTrack) {
            microphoneTrack.setMuted(!isMuted);
            setIsMuted(!isMuted);
        }
    };

    // --- RENDER ---

    // Incoming Call Modal
    if (incomingCall) {
        return (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white">
                    <div className="w-24 h-24 bg-gray-700 rounded-full mb-4 flex items-center justify-center text-4xl animate-pulse">
                        📞
                    </div>
                    <h2 className="text-3xl font-light mb-2">{incomingCall.caller.name}</h2>
                    <p className="text-gray-400 mb-12">スマートフォン...</p>

                    <div className="flex w-full justify-between px-8 mt-auto mb-20">
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={() => declineCall(incomingCall)} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition">
                                ✖
                            </button>
                            <span className="text-xs">拒否</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={() => answerCall(incomingCall)} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition animate-bounce">
                                📞
                            </button>
                            <span className="text-xs">応答</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Active Call Screen
    if (activeCall) {
        return (
            <div className="h-full bg-slate-900 text-white flex flex-col items-center pt-20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-600 rounded-full mb-6 flex items-center justify-center text-5xl shadow-xl">
                        👤
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                        {activeCall.caller.id === getMyId() ? activeCall.receiver.name : activeCall.caller.name}
                    </h2>
                    <p className="text-white/60 mb-12 font-mono">
                        {Math.floor((Date.now() - new Date(activeCall.startedAt).getTime()) / 1000 / 60)}:
                        {String(Math.floor((Date.now() - new Date(activeCall.startedAt).getTime()) / 1000 % 60)).padStart(2, '0')}
                    </p>

                    <div className="grid grid-cols-3 gap-6 mb-12">
                        <CallButton icon="🔇" label="消音" active={isMuted} onClick={toggleMute} />
                        <CallButton icon="⌨️" label="キーパッド" onClick={() => { }} />
                        <CallButton icon="🔊" label="スピーカー" onClick={() => { }} />
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
        <div className="h-full bg-white flex flex-col">
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
                <div className="px-6 py-2 text-xs font-bold text-gray-500 bg-gray-50">連絡先</div>
                {gameState?.users
                    .filter(u => u.id !== currentUser?.id)
                    .map(u => (
                        <div key={u.id} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer" onClick={() => initiateCall(u.id)}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg text-gray-500 font-bold">
                                    {u.name[0]}
                                </div>
                                <span className="font-bold text-gray-800 text-lg">{u.name}</span>
                            </div>
                            <button className="text-green-500 text-2xl">�</button>
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
