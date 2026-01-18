'use client';

import { useState, useEffect } from 'react';
import { useRealtime } from '@/hooks/useRealtime';

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        playerIcon?: string;
    };
    receiver: {
        id: string;
        name: string;
        playerIcon?: string;
    };
}

export default function MessengerApp() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    // 会話リストをリアルタイム取得
    const { data: conversations, refetch: refetchConversations } = useRealtime<Message[]>(
        '/api/messages',
        { interval: 3000 }
    );

    // 選択されたユーザーとのメッセージをリアルタイム取得
    const { data: messages, refetch: refetchMessages } = useRealtime<Message[]>(
        selectedUserId ? `/api/messages?userId=${selectedUserId}` : '',
        { interval: 2000, enabled: !!selectedUserId }
    );

    const sendMessage = async () => {
        if (!selectedUserId || !newMessage.trim()) return;

        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedUserId,
                    content: newMessage,
                }),
            });

            if (res.ok) {
                setNewMessage('');
                refetchMessages();
                refetchConversations();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('メッセージの送信に失敗しました');
        } finally {
            setSending(false);
        }
    };

    const getOtherUser = (msg: Message) => {
        return msg.senderId === msg.sender.id ? msg.receiver : msg.sender;
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* 会話リスト */}
            <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-4 bg-blue-600 text-white font-bold">
                    💬 メッセージ
                </div>
                {conversations?.map((conv) => {
                    const other = getOtherUser(conv);
                    return (
                        <div
                            key={conv.id}
                            onClick={() => setSelectedUserId(other.id)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedUserId === other.id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {other.playerIcon || other.name[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold">{other.name}</div>
                                    <div className="text-sm text-gray-600 truncate">
                                        {conv.content}
                                    </div>
                                </div>
                                {!conv.isRead && conv.receiverId === conv.receiver.id && (
                                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                )}
                            </div>
                        </div>
                    );
                })}
                {!conversations?.length && (
                    <div className="p-8 text-center text-gray-500">
                        メッセージはありません
                    </div>
                )}
            </div>

            {/* チャット画面 */}
            <div className="flex-1 flex flex-col">
                {selectedUserId ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200 font-semibold">
                            {messages?.[0] && getOtherUser(messages[0]).name}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages?.map((msg) => {
                                const isMe = msg.senderId === msg.sender.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs px-4 py-2 rounded-lg ${isMe
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white border border-gray-200'
                                                }`}
                                        >
                                            <div>{msg.content}</div>
                                            <div
                                                className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'
                                                    }`}
                                            >
                                                {new Date(msg.createdAt).toLocaleTimeString('ja-JP', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="メッセージを入力..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={sending}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={sending || !newMessage.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                                >
                                    送信
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        会話を選択してください
                    </div>
                )}
            </div>
        </div>
    );
}
