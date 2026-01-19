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

    // 診断・デバッグ用状態
    const [connectionState, setConnectionState] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTING'>('DISCONNECTED');
    const [isPublished, setIsPublished] = useState(false);
    const [subscribedUsers, setSubscribedUsers] = useState<string[]>([]);
    const [lastError, setLastError] = useState<string | null>(null);
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [autoplayBlocked, setAutoplayBlocked] = useState(false);

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

    const renewToken = async (channelId: string) => {
        if (!agoraClient || !currentUser) {
            throw new Error('Agora client or user not available');
        }

        try {
            console.log('[Agora] Fetching new token from server...');
            const response = await fetch('/api/agora/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelName: generateChannelName(channelId),
                    uid: 0 // UIDは自動割り当て
                })
            });

            if (!response.ok) {
                throw new Error(`Token fetch failed: ${response.statusText}`);
            }

            const data = await response.json();
            const newToken = data.token;

            // Agoraクライアントにトークン更新を通知
            await agoraClient.renewToken(newToken);
            console.log('[Agora] Token renewed successfully');
            setLastError('Token更新成功 ✅');

            // 成功メッセージを3秒後にクリア
            setTimeout(() => {
                setLastError(null);
            }, 3000);
        } catch (error) {
            console.error('[Agora] Token renewal error:', error);
            throw error;
        }
    };

    const joinVoiceChannel = async (channelId: string, token: string) => {
        try {
            setConnectionState('CONNECTING');
            const client = await getAgoraClient() as any;
            setAgoraClient(client);

            // 接続状態変更イベント
            client.on('connection-state-change', (curState: string, prevState: string, reason?: string) => {
                console.log(`[Agora] Connection: ${prevState} -> ${curState}`, reason);
                setConnectionState(curState as any);
                if (reason) {
                    setLastError(`接続変更: ${reason}`);
                }
            });

            // エラーイベント
            client.on('error', (err: any) => {
                console.error('[Agora] Error:', err);
                setLastError(`Error ${err.code}: ${err.message}`);
                // Token期限切れ検出
                if (err.code === 109 || err.code === 110) {
                    alert('トークンが無効です。再接続してください。');
                }
            });

            // Token期限切れ警告（30秒前）
            client.on('token-privilege-will-expire', async () => {
                console.warn('[Agora] Token will expire soon! Renewing...');
                setLastError('Token更新中...');
                try {
                    await renewToken(channelId);
                } catch (error) {
                    console.error('[Agora] Token renewal failed:', error);
                    setLastError(`Token更新失敗: ${(error as any).message}`);
                    alert('トークン更新に失敗しました。通話を再開してください。');
                }
            });

            // リモートユーザーの音声を受信
            client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
                try {
                    await client.subscribe(user, mediaType);
                    console.log(`[Agora] Subscribed to user ${user.uid}:`, mediaType);

                    if (mediaType === 'audio' && user.audioTrack) {
                        // Autoplay対策: play()の失敗をキャッチ
                        try {
                            await user.audioTrack.play();
                            setSubscribedUsers(prev => [...new Set([...prev, user.uid])]);
                            console.log(`[Agora] Playing audio from user ${user.uid}`);
                        } catch (playError: any) {
                            console.warn('[Agora] Autoplay blocked:', playError);
                            setAutoplayBlocked(true);
                            setLastError('音声自動再生がブロックされました。クリックして再開してください。');
                        }
                    }
                } catch (error) {
                    console.error('[Agora] Subscribe error:', error);
                    setLastError(`Subscribe失敗: ${(error as any).message}`);
                }
            });

            client.on('user-unpublished', (user: any, mediaType: 'audio' | 'video') => {
                console.log(`[Agora] User ${user.uid} unpublished`, mediaType);
                setSubscribedUsers(prev => prev.filter(id => id !== user.uid));
            });

            await client.join(
                process.env.NEXT_PUBLIC_AGORA_APP_ID || 'dummy-app-id',
                generateChannelName(channelId),
                token,
                null
            );

            setConnectionState('CONNECTED');
            console.log('[Agora] Joined channel:', channelId);

            const track = await createMicrophoneTrack();
            setMicrophoneTrack(track);

            if (track && client.publish) {
                await client.publish([track as any]);
                setIsPublished(true);
                console.log('[Agora] Published microphone track');
            }
        } catch (error) {
            console.error('[Agora] Join error:', error);
            setConnectionState('DISCONNECTED');
            setLastError(`接続失敗: ${(error as any).message}`);
            alert(`通話接続エラー: ${(error as any).message}`);
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

    // Autoplay再開関数
    const resumeAutoplay = async () => {
        if (!agoraClient) return;
        try {
            // 全てのremote userの音声を再生
            const remoteUsers = agoraClient.remoteUsers || [];
            for (const user of remoteUsers) {
                if (user.audioTrack) {
                    await user.audioTrack.play();
                    console.log(`[Agora] Resumed audio for user ${user.uid}`);
                }
            }
            setAutoplayBlocked(false);
            setLastError(null);
        } catch (error) {
            console.error('[Agora] Resume autoplay failed:', error);
        }
    };

    // Filter users for the contact list (exclude self)
    const contacts = gameState?.users.filter(u => u.id !== currentUser?.id) || [];

    return (
        <div className="h-full bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col relative">
            {/* Autoplayブロック警告 */}
            {autoplayBlocked && activeCall && (
                <div className="absolute top-4 left-4 right-4 z-[65] bg-yellow-500 text-white p-4 rounded-xl shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <div className="font-bold">音声が自動再生されません</div>
                                <div className="text-sm text-yellow-100">クリックして音声を再開してください</div>
                            </div>
                        </div>
                        <button
                            onClick={resumeAutoplay}
                            className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-bold hover:bg-yellow-50 transition"
                        >
                            再生
                        </button>
                    </div>
                </div>
            )}

            {/* 診断パネルトグル */}
            {activeCall && (
                <button
                    onClick={() => setShowDiagnostics(!showDiagnostics)}
                    className="absolute top-4 right-4 z-[64] bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-700 transition"
                >
                    {showDiagnostics ? '診断非表示' : '🔧 診断'}
                </button>
            )}

            {/* 診断パネル */}
            {showDiagnostics && activeCall && (
                <div className="absolute top-16 right-4 z-[63] bg-gray-900 text-white p-4 rounded-xl shadow-2xl text-xs w-72 max-h-96 overflow-y-auto">
                    <div className="font-bold text-sm mb-3 border-b border-gray-700 pb-2">📡 接続診断</div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">接続状態:</span>
                            <span className={`font-bold ${connectionState === 'CONNECTED' ? 'text-green-400' :
                                connectionState === 'CONNECTING' ? 'text-yellow-400' :
                                    'text-red-400'
                                }`}>{connectionState}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Publish:</span>
                            <span className={isPublished ? 'text-green-400' : 'text-red-400'}>
                                {isPublished ? '✅ OK' : '❌ NO'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Subscribe:</span>
                            <span className="text-blue-400">{subscribedUsers.length} users</span>
                        </div>
                        {lastError && (
                            <div className="mt-3 p-2 bg-red-900 bg-opacity-50 rounded border border-red-700">
                                <div className="text-red-300 font-bold mb-1">⚠️ 最後のエラー:</div>
                                <div className="text-red-200 text-[10px] break-words">{lastError}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
