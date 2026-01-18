import { useState, useEffect } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { useGame } from '@/context/GameContext';
import { PlayerIcon } from '@/components/ui/PlayerIcon';

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
    const { gameState, currentUser } = useGame();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [isSelectingUser, setIsSelectingUser] = useState(false);

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

    // Get selected user details safely
    const selectedUser = selectedUserId
        ? (gameState?.users.find(u => u.id === selectedUserId) ||
            (messages?.[0] ? getOtherUser(messages[0]) : null))
        : null;

    const contacts = gameState?.users.filter(u => u.id !== currentUser?.id) || [];

    const handleUserSelect = (userId: string) => {
        setSelectedUserId(userId);
        setIsSelectingUser(false);
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* 会話リスト / ユーザー選択 */}
            <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
                <div className="p-4 bg-blue-600 text-white font-bold flex justify-between items-center sticky top-0 z-10">
                    <span>💬 メッセージ</span>
                    <button
                        onClick={() => setIsSelectingUser(!isSelectingUser)}
                        className="text-white hover:text-blue-100 text-xl font-bold px-2 rounded hover:bg-white/10"
                    >
                        {isSelectingUser ? '✕' : '＋'}
                    </button>
                </div>

                {isSelectingUser ? (
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-2 text-xs font-bold text-gray-500 bg-gray-50 sticky top-0">新規メッセージ</div>
                        {contacts.map(user => (
                            <div
                                key={user.id}
                                onClick={() => handleUserSelect(user.id)}
                                className="p-3 border-b cursor-pointer hover:bg-blue-50 flex items-center gap-3 transition"
                            >
                                <PlayerIcon playerIcon={user.playerIcon} playerName={user.name} size={40} />
                                <div className="font-medium text-gray-800">{user.name}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {conversations?.map((conv) => {
                            const other = getOtherUser(conv);
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedUserId(other.id)}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedUserId === other.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {other.playerIcon || other.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold truncate">{other.name}</div>
                                            <div className="text-sm text-gray-600 truncate">
                                                {conv.content}
                                            </div>
                                        </div>
                                        {!conv.isRead && conv.receiverId === conv.receiver.id && (
                                            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {!conversations?.length && (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                メッセージはありません<br />
                                ＋ボタンから作成
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* チャット画面 */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedUserId ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200 font-bold shadow-sm flex items-center gap-2">
                            {selectedUser && (
                                <PlayerIcon playerIcon={selectedUser.playerIcon} playerName={selectedUser.name} size={32} />
                            )}
                            <span>{selectedUser?.name || 'Unknown User'}</span>
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
                                            className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${isMe
                                                ? 'bg-blue-500 text-white rounded-tr-none'
                                                : 'bg-white border border-gray-200 rounded-tl-none'
                                                }`}
                                        >
                                            <div className="break-words">{msg.content}</div>
                                            <div
                                                className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'
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
                            {messages?.length === 0 && (
                                <div className="text-center text-gray-400 text-sm mt-10">
                                    メッセージを送信して会話を開始しましょう
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="メッセージを入力..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    disabled={sending}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={sending || !newMessage.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold transition shadow-sm"
                                >
                                    送信
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="text-5xl mb-4">💬</div>
                        <div>会話を選択または新規作成してください</div>
                    </div>
                )}
            </div>
        </div>
    );
}
