'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useRealtime } from '@/hooks/useRealtime';

interface NotificationData {
    hasUnreadMessages: boolean;
    unreadCount: number;
    latestMessage: {
        id: string;
        content: string;
        sender: {
            name: string;
        };
    } | null;
    incomingCall: {
        id: string;
        caller: {
            name: string;
        };
    } | null;
}

export default function CommunicationNotifier() {
    const router = useRouter();
    const pathname = usePathname();
    const [showMsgToast, setShowMsgToast] = useState(false);
    const lastMessageIdRef = useRef<string | null>(null);

    // すでにスマホアプリ画面にいる場合は通知を抑制（邪魔になるため）
    const isCommunicationPage = pathname?.includes('/smartphone');

    const { data: notif } = useRealtime<NotificationData>('/api/notifications', {
        interval: 3000,
        enabled: !pathname?.includes('/login'), // ログイン画面では無効
    });

    useEffect(() => {
        if (notif?.latestMessage && !isCommunicationPage) {
            // 新しいメッセージIDならトースト表示
            if (notif.latestMessage.id !== lastMessageIdRef.current) {
                lastMessageIdRef.current = notif.latestMessage.id;
                setShowMsgToast(true);

                // 5秒後に自動で消す
                setTimeout(() => setShowMsgToast(false), 5000);

                // 通知音（控えめに）
                playNotificationSound();
            }
        }
    }, [notif?.latestMessage, isCommunicationPage]);

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/sounds/notification.mp3'); // 将来的にファイル配置
            audio.volume = 0.5;
            audio.play().catch(() => { }); // ユーザー操作前だと再生されない場合があるためcatch
        } catch (e) {
            // ignore
        }
    };

    const handleMessageClick = () => {
        setShowMsgToast(false);
        router.push('/smartphone?app=messenger');
    };

    const handleAnswerCall = (callId: string) => {
        router.push(`/smartphone?app=phone&action=answer&callId=${callId}`);
    };

    return (
        <>
            {/* メッセージ通知トースト (右上) */}
            {showMsgToast && notif?.latestMessage && (
                <div
                    className="fixed top-20 right-4 z-[9999] bg-white rounded-lg shadow-xl p-4 border-l-4 border-blue-500 animate-slide-in-right cursor-pointer hover:bg-gray-50 transition max-w-sm w-full"
                    onClick={handleMessageClick}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="font-bold text-gray-800 flex items-center gap-2">
                                📩 新着メッセージ ({notif.unreadCount})
                            </div>
                            <div className="text-sm font-semibold text-blue-600 mt-1">
                                {notif.latestMessage.sender.name}
                            </div>
                            <div className="text-sm text-gray-600 truncate mt-1">
                                {notif.latestMessage.content}
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMsgToast(false); }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* 着信全画面オーバーレイ/カード (右下) */}
            {notif?.incomingCall && (
                <div className="fixed bottom-24 right-4 z-[9999] bg-gray-900 text-white rounded-xl shadow-2xl p-6 w-80 animate-bounce-subtle border border-gray-700">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-3xl mb-3 animate-pulse">
                            📞
                        </div>
                        <h3 className="text-xl font-bold mb-1">{notif.incomingCall.caller.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">から着信中...</p>

                        <button
                            onClick={() => handleAnswerCall(notif.incomingCall!.id)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-lg mb-2"
                        >
                            すぐに応答する
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                            ※他のページにいても応答できます
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
