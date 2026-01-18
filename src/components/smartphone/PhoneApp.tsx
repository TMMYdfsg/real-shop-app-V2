import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealtime } from '@/hooks/useRealtime';
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

    // 通話履歴をリアルタイム取得
    const { data: callHistory } = useRealtime<VoiceCall[]>(
        '/api/calls',
        { interval: 5000 }
    );

    // URLパラメータからの自動応答処理
    useEffect(() => {
        const action = searchParams.get('action');
        const callId = searchParams.get('callId');

        if (action === 'answer' && callId && !isAutoAnswering && !activeCall) {
            setIsAutoAnswering(true);
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
            const res = await fetch('/api/calls');
            const calls: VoiceCall[] = await res.json();
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
        };

        const interval = setInterval(checkIncoming, 2000);
        // 初回実行
        checkIncoming();
        return () => clearInterval(interval);
    }, [incomingCall, searchParams]);

    const getMyId = () => {
        // 実際はcookieから取得
        return 'current-user-id';
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
            await fetch(`/api/calls/${call.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ACTIVE' }),
            });

            setIncomingCall(null);
            setActiveCall(call);
            await joinVoiceChannel(call.id, 'dummy-token');
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

    return (
        <div className="h-full bg-gradient-to-b from-gray-50 to-gray-100">
            {/* 着信UI */}
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

            {/* 通話中UI */}
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

            {/* 通話履歴 */}
            {!activeCall && !incomingCall && (
                <div>
                    <div className="p-4 bg-green-600 text-white font-bold">
                        📞 電話
                    </div>
                    <div className="p-4">
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="ユーザーIDを入力..."
                                className="w-full px-4 py-2 border rounded-lg"
                                onChange={(e) => setSelectedUserId(e.target.value)}
                            />
                            <button
                                onClick={() => selectedUserId && initiateCall(selectedUserId)}
                                disabled={!selectedUserId}
                                className="w-full mt-2 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300"
                            >
                                発信
                            </button>
                        </div>
                        <div className="space-y-2">
                            {callHistory?.map((call) => (
                                <div key={call.id} className="p-3 bg-white rounded-lg shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold">
                                                {call.caller.id === getMyId() ? call.receiver.name : call.caller.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {call.status === 'ENDED' && call.duration ? `${call.duration}秒` : call.status}
                                            </div>
                                        </div>
                                        <div className="text-2xl">
                                            {call.callerId === getMyId() ? '📲' : '📞'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
