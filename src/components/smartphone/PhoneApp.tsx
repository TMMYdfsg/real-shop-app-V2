import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealtime } from '@/hooks/useRealtime';
import { useGame } from '@/context/GameContext';
import { getAgoraClient, createMicrophoneTrack, generateChannelName } from '@/lib/agora';

interface VoiceCall {
    id: string;
    callerId: string;
    receiverId: string;
    status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'MISSED' | 'DECLINED';
    startedAt: string;
    endedAt?: string;
    duration?: number;
    caller: User;
    receiver: User;
}

interface User {
    id: string;
    name: string;
    playerIcon?: string;
}

export default function PhoneApp() {
    const searchParams = useSearchParams();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [incomingCall, setIncomingCall] = useState<VoiceCall | null>(null);
    const [activeCall, setActiveCall] = useState<VoiceCall | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [agoraClient, setAgoraClient] = useState<any>(null);
    const [microphoneTrack, setMicrophoneTrack] = useState<any>(null);
    const [isAutoAnswering, setIsAutoAnswering] = useState(false);
    const [hasMicPermission, setHasMicPermission] = useState(false);
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

    const { gameState, currentUser } = useGame();

    // 通話履歴をリアルタイム取得（ログイン時のみ）
    const { data: callHistory } = useRealtime<VoiceCall[]>(
        '/api/calls',
        { interval: 5000, enabled: !!currentUser }
    );

    // マイク権限チェック
    useEffect(() => {
        const checkPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(t => t.stop()); // すぐに止める
                setHasMicPermission(true);
            } catch (e) {
                console.log('Mic permission needed');
                setHasMicPermission(false);
                setShowPermissionPrompt(true);
            }
        };
        checkPermission();
    }, []);

    const requestPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(t => t.stop());
            setHasMicPermission(true);
            setShowPermissionPrompt(false);
        } catch (e) {
            alert('マイクの使用が許可されていません。ブラウザの設定を確認してください。');
        }
    };

    // URLパラメータからの自動応答処理
    useEffect(() => {
        const action = searchParams.get('action');
        const callId = searchParams.get('callId');

        if (action === 'answer' && callId && !isAutoAnswering && !activeCall) {
            setIsAutoAnswering(true);
            // マイク権限がない場合はここで止まるかもしれないが、ユーザーインタラクションが必要
            if (!hasMicPermission) {
                setShowPermissionPrompt(true);
                return;
            }
            // ... (rest of auto answer logic)
            // 本来はAPIで対象のcallを取得すべきだが、簡易的に履歴/着信から探すか、APIコールする
            // ここでは直接応答APIを叩く
            const autoAnswer = async () => {
                try {
                    // 通話情報を取得（詳細APIがないため履歴から探すか、POSTでjoin）
                    // 簡易実装: 既に応答ロジックがあるのでそれを活用したいが、callオブジェクトが必要
                    // ここでは直接 joinVoiceChannel する
                    // 注意: 相手の情報などが取れないため、本来は GET /api/calls/:id が必要
                    // 一旦保留: UI側でincomingCallとして検知されるのを待つのが安全
                } catch (e) {
                    console.error('Auto answer failed:', e);
                }
            };
            autoAnswer();
        }
    }, [searchParams, isAutoAnswering, activeCall]);

    // 着信をチェック（pollingで簡易実装）
    useEffect(() => {
        const checkIncoming = async () => {
            try {
                const res = await fetch('/api/calls');
                if (!res.ok) {
                    // 401 or other errors - user not logged in or API error
                    return;
                }
                const calls: VoiceCall[] = await res.json();
                if (!Array.isArray(calls)) {
                    // Unexpected response format
                    return;
                }
                const pending = calls.find(c => c.status === 'PENDING' && c.receiverId === getMyId());

                // 自動応答の処理（通知から遷移してきた場合）
                const action = searchParams.get('action');
                const callId = searchParams.get('callId');

                if (pending && (!incomingCall || pending.id !== incomingCall.id)) {
                    if (action === 'answer' && callId === pending.id) {
                        // 自動応答
                        answerCall(pending);
                        // URLパラメータをクリアするとより良い
                    } else {
                        setIncomingCall(pending);
                        playRingtone();
                    }
                }
            } catch (error) {
                // Network error or JSON parse error - silently ignore
                console.debug('[PhoneApp] checkIncoming error:', error);
            }
        };

        const interval = setInterval(checkIncoming, 2000);
        // 初回実行
        checkIncoming();
        return () => clearInterval(interval);
    }, [incomingCall, searchParams]);

    const getMyId = () => {
        return currentUser?.id || '';
    };

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
            // ステータスをACTIVEに更新
            const res = await fetch(`/api/calls/${call.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ACTIVE' }),
            });
            const data = await res.json();
            const token = data.token; // APIからトークンを取得

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
        } catch (error) {
            console.error('Failed to decline call:', error);
        }
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
        } catch (error) {
            console.error('Failed to end call:', error);
        }
    };

    const joinVoiceChannel = async (channelId: string, token: string) => {
        try {
            const client = await getAgoraClient();
            setAgoraClient(client);

            await client.join(
                process.env.NEXT_PUBLIC_AGORA_APP_ID || 'dummy-app-id',
                generateChannelName(channelId),
                token,
                null
            );

            const track = await createMicrophoneTrack();
            setMicrophoneTrack(track);

            if (track && client.publish) {
                await client.publish([track as any]);
            }

            console.log('[Phone] Joined voice channel:', channelId);
        } catch (error) {
            console.error('[Phone] Failed to join voice channel:', error);
        }
    };

    const leaveVoiceChannel = async () => {
        try {
            if (microphoneTrack?.close) {
                microphoneTrack.close();
            }
            if (agoraClient?.leave) {
                await agoraClient.leave();
            }
            setAgoraClient(null);
            setMicrophoneTrack(null);
        } catch (error) {
            console.error('[Phone] Failed to leave voice channel:', error);
        }
    };

    const toggleMute = () => {
        if (microphoneTrack?.setMuted) {
            microphoneTrack.setMuted(!isMuted);
            setIsMuted(!isMuted);
        }
    };

    const playRingtone = () => {
        // 着信音を再生（将来実装）
        console.log('[Phone] 📞 Incoming call!');
    };

    // Filter users for the contact list (exclude self)
    const contacts = gameState?.users.filter(u => u.id !== currentUser?.id) || [];

    return (
        <div className="h-full bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col relative">
            {/* マイク権限プロンプト */}
            {showPermissionPrompt && !hasMicPermission && (
                <div className="absolute inset-0 z-[60] bg-black bg-opacity-90 flex flex-col items-center justify-center p-6 text-center text-white">
                    <div className="text-6xl mb-4">🎙️</div>
                    <h2 className="text-2xl font-bold mb-2">マイクの許可が必要です</h2>
                    <p className="text-gray-300 mb-6">
                        通話機能を使用するには、マイクへのアクセスを許可してください。
                    </p>
                    <button
                        onClick={requestPermission}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105"
                    >
                        マイクの使用を許可する
                    </button>
                    <button
                        onClick={() => setShowPermissionPrompt(false)}
                        className="mt-4 text-sm text-gray-400 underline"
                    >
                        閉じる（通話機能は使えません）
                    </button>
                </div>
            )}

            {/* ... Incoming/Active Call UI (unchanged) ... */}
            {incomingCall && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl">
                            📞
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{incomingCall.caller.name}</h2>
                        <p className="text-gray-600 mb-6">からの着信</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => declineCall(incomingCall)}
                                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                            >
                                拒否
                            </button>
                            <button
                                onClick={() => answerCall(incomingCall)}
                                className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
                            >
                                応答
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeCall && (
                <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-purple-600 text-white">
                    <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full mb-6 flex items-center justify-center text-6xl">
                        👤
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                        {activeCall.caller.id === getMyId() ? activeCall.receiver.name : activeCall.caller.name}
                    </h2>
                    <p className="text-blue-100 mb-8">通話中...</p>
                    <div className="flex gap-6">
                        <button
                            onClick={toggleMute}
                            className={`w-16 h-16 rounded-full flex items-center justify-center ${isMuted ? 'bg-red-500' : 'bg-white bg-opacity-20'
                                }`}
                        >
                            {isMuted ? '🔇' : '🎤'}
                        </button>
                        <button
                            onClick={endCall}
                            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                            📞
                        </button>
                    </div>
                </div>
            )}

            {/* Contacts & History List */}
            {!activeCall && !incomingCall && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 bg-green-600 text-white font-bold flex justify-between items-center">
                        <span>📞 電話</span>
                        {/* Tab Switcher could go here if needed */}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Contact List Section */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">連絡先</h3>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {contacts.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                                                {user.playerIcon || '👤'}
                                            </div>
                                            <div className="font-medium text-gray-800">{user.name}</div>
                                        </div>
                                        <button
                                            onClick={() => initiateCall(user.id)}
                                            className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition"
                                        >
                                            📞
                                        </button>
                                    </div>
                                ))}
                                {contacts.length === 0 && (
                                    <div className="p-4 text-center text-gray-400 text-sm">ユーザーがいません</div>
                                )}
                            </div>
                        </div>

                        {/* History Section */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">履歴</h3>
                            <div className="space-y-2">
                                {callHistory?.map((call) => (
                                    <div key={call.id} className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {call.caller.id === getMyId() ? call.receiver.name : call.caller.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {call.status === 'ENDED'
                                                    ? `${call.duration}秒通話`
                                                    : (call.status === 'MISSED' ? '不在着信' : call.status)}
                                                <span className="mx-1">•</span>
                                                {new Date(call.startedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className={`text-xl ${call.callerId === getMyId() ? 'text-blue-400' : (call.status === 'MISSED' ? 'text-red-400' : 'text-green-400')}`}>
                                            {call.callerId === getMyId() ? '↗️' : (call.status === 'MISSED' ? '↙️' : '↙️')}
                                        </div>
                                    </div>
                                ))}
                                {!callHistory?.length && (
                                    <div className="text-center text-gray-400 text-sm py-4">履歴はありません</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
