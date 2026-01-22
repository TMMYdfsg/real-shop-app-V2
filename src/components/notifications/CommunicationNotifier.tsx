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
    myId: string;
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

    // デスクトップ通知の許可をリクエスト
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, []);

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

                // デスクトップ通知
                showDesktopNotification(
                    `New Message from ${notif.latestMessage.sender.name}`,
                    notif.latestMessage.content
                );
            }
        }
    }, [notif?.latestMessage, isCommunicationPage]);

    const showDesktopNotification = (title: string, body: string) => {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
                const n = new Notification(title, {
                    body: body,
                    icon: '/icons/icon-192x192.png', // PWAアイコンがあれば
                    silent: true
                });

                n.onclick = () => {
                    window.focus();
                    n.close();
                    if (notif?.myId) {
                        router.push(`/player/${notif.myId}?app=messenger`); // app=message に統一した方が良いが、Notifier上は一旦 messenger で query param処理側で吸収するか、統一する
                    }
                };
            } catch (e) {
                console.error('Desktop notification failed:', e);
            }
        }
    };

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
        if (notif?.myId) {
            router.push(`/player/${notif.myId}?app=message`);
        }
    };

    const handleAnswerCall = (callId: string) => {
        if (notif?.myId) {
            router.push(`/player/${notif.myId}?app=phone&action=answer&callId=${callId}`);
        }
    };

    return (
        <>
            {/* メッセージ通知トースト (右上) */}
            {showMsgToast && notif?.latestMessage && (
                <div
                    className="fixed top-20 right-4 z-[9999] glass-dark rounded-2xl shadow-2xl p-4 border border-white/10 animate-slide-in-right cursor-pointer hover:bg-white/10 transition-all max-w-sm w-full"
                    onClick={handleMessageClick}
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0 border border-indigo-500/30">
                            <span className="text-xl text-indigo-400">📩</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">New Message</div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowMsgToast(false); }}
                                    className="text-white/40 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="font-bold text-white text-md">
                                {notif.latestMessage.sender.name}
                            </div>
                            <div className="text-sm text-slate-400 line-clamp-2 mt-0.5">
                                {notif.latestMessage.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 着信全画面オーバーレイ/カード (右下) */}
            {notif?.incomingCall && (
                <div className="fixed inset-x-4 bottom-24 lg:right-4 lg:left-auto lg:w-96 z-[9999] glass-dark border border-white/20 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-8 animate-bounce-subtle">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-[0_0_40px_rgba(52,211,153,0.3)] animate-pulse">
                            📞
                        </div>
                        <div className="text-xs font-black text-green-400 uppercase tracking-[0.2em] mb-2">Incoming Call</div>
                        <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{notif.incomingCall.caller.name}</h3>
                        <p className="text-slate-400 text-sm mb-8 font-medium">Apple iPhone</p>

                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => handleAnswerCall(notif.incomingCall!.id)}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl transition transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">📞</span> Answer
                            </button>
                            <button
                                onClick={() => setShowMsgToast(false)} // Assume ignore for now
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 p-4 rounded-2xl transition border border-red-500/30"
                            >
                                Ignore
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
