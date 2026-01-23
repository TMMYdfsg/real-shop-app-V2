'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { useRealtime } from '@/hooks/useRealtime';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    Phone,
    Video,
    Camera,
    Plus,
    Search,
    MoreHorizontal,
    ChevronLeft,
    Mic,
    MicOff,
    Volume2,
    X,
    Image as ImageIcon,
    Send
} from 'lucide-react';
import { PlayerIcon } from '@/components/ui/PlayerIcon';

// Types
interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    imageUrl?: string;
    type?: 'text' | 'image';
    isRead: boolean;
    createdAt: string;
    sender: { id: string; name: string; playerIcon?: string };
    receiver: { id: string; name: string; playerIcon?: string };
}

interface VoiceCall {
    id: string;
    callerId: string;
    receiverId: string;
    status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'MISSED' | 'DECLINED';
    startedAt: string;
    endedAt?: string;
    caller: { id: string; name: string; playerIcon?: string };
    receiver: { id: string; name: string; playerIcon?: string };
}

export default function UnifiedMessengerApp({ onClose, initialTab = 'chats' }: { onClose: () => void, initialTab?: 'chats' | 'calls' | 'people' }) {
    const { currentUser, gameState, refresh } = useGame();
    const [activeTab, setActiveTab] = useState<'chats' | 'calls' | 'people'>(initialTab);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    // Agora Call State
    const [activeCall, setActiveCall] = useState<VoiceCall | null>(null);
    const [incomingCall, setIncomingCall] = useState<VoiceCall | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const hasPhoneApp = (user?: { smartphone?: { apps?: string[] } } | null) => Array.isArray(user?.smartphone?.apps) && user!.smartphone!.apps!.includes('phone');

    // Messaging Data
    const { data: conversations } = useRealtime<Message[]>(
        '/api/messages',
        { interval: 3000, enabled: !!currentUser }
    );

    const { data: messages, refetch: refetchMessages } = useRealtime<Message[]>(
        selectedUserId ? `/api/messages?userId=${selectedUserId}` : '',
        { interval: 2000, enabled: !!currentUser && !!selectedUserId }
    );

    // Call Data
    const { data: calls } = useRealtime<VoiceCall[]>(
        '/api/calls',
        { interval: 2000, enabled: !!currentUser }
    );

    // Incoming Call Check
    useEffect(() => {
        if (!calls || !Array.isArray(calls)) return;
        const pending = calls.find(c => c.status === 'PENDING' && c.receiverId === currentUser?.id);
        if (pending && (!incomingCall || pending.id !== incomingCall.id)) {
            setIncomingCall(pending);
        }
    }, [calls, incomingCall, currentUser?.id]);

    const sendMessage = async (imageUrl?: string) => {
        if (!selectedUserId || (!imageUrl && !newMessage.trim())) return;
        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedUserId,
                    content: imageUrl ? '画像が送信されました' : newMessage,
                    imageUrl,
                    type: imageUrl ? 'image' : 'text'
                }),
            });
            if (res.ok) {
                setNewMessage('');
                refetchMessages();
            }
        } finally {
            setSending(false);
        }
    };

    const initiateCall = async (receiverId: string) => {
        try {
            if (currentUser && !hasPhoneApp(currentUser as any)) {
                alert('電話アプリがインストールされていません');
                return;
            }
            const receiver = gameState?.users.find(u => u.id === receiverId) as any;
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
            const { call } = await res.json();
            setActiveCall(call);
        } catch (error) {
            alert(error instanceof Error ? error.message : '通話の開始に失敗しました');
        }
    };

    if (activeCall || incomingCall) {
        const target = incomingCall ? incomingCall.caller : (activeCall?.caller.id === currentUser?.id ? activeCall?.receiver : activeCall?.caller);
        return (
            <div className="h-full bg-slate-900 text-white flex flex-col items-center justify-between py-20 px-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-2 border-white/20 p-1 mb-6 overflow-hidden">
                        <PlayerIcon playerIcon={target?.playerIcon} playerName={target?.name || ''} size={88} />
                    </div>
                    <h2 className="text-2xl font-black mb-1">{target?.name}</h2>
                    <p className="text-white/40 text-sm font-medium">{incomingCall ? '音声通話の着信' : '通話中...'}</p>
                </div>
                <div className="relative z-10 flex flex-col gap-10 w-full items-center mb-10">
                    {incomingCall ? (
                        <div className="flex justify-around w-full max-w-xs">
                            <button onClick={() => setIncomingCall(null)} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-white"><X className="w-8 h-8" /></button>
                            <button onClick={() => { setActiveCall(incomingCall); setIncomingCall(null); }} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce active:scale-95 transition-all text-white"><Phone className="w-8 h-8 fill-current" /></button>
                        </div>
                    ) : (
                        <div className="flex justify-around w-full max-w-xs items-center text-white">
                            <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-white/10'}`}>{isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}</button>
                            <button onClick={() => setActiveCall(null)} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"><Phone className="w-8 h-8 rotate-[135deg] fill-current" /></button>
                            <button className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center"><Volume2 className="w-6 h-6" /></button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (selectedUserId) {
        const otherUser = messages?.[0]?.senderId === currentUser?.id ? messages?.[0]?.receiver : messages?.[0]?.sender;
        const targetName = otherUser?.name || gameState?.users.find(u => u.id === selectedUserId)?.name || 'User';
        return (
            <div className="h-full bg-white flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedUserId(null)} className="p-2 -ml-2 text-blue-600"><ChevronLeft className="w-7 h-7" /></button>
                        <div className="flex items-center gap-2">
                            <PlayerIcon size={36} playerName={targetName} />
                            <div>
                                <h3 className="font-black text-sm text-slate-900">{targetName}</h3>
                                <p className="text-[10px] text-green-500 font-bold">オンライン</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 no-scrollbar">
                    {messages?.map((msg) => {
                        const isMe = msg.senderId === currentUser?.id;
                        return (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!isMe && <PlayerIcon size={28} playerName={msg.sender.name} className="mt-auto" />}
                                    <div className={`px-4 py-2.5 rounded-[1.5rem] text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                                        {msg.imageUrl ? <img src={msg.imageUrl} className="rounded-xl mb-1 max-w-full h-auto" /> : msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <div className="p-4 pt-2 bg-white flex items-center gap-2 border-t border-slate-100">
                    <button className="text-blue-600"><Plus className="w-6 h-6" /></button>
                    <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Aa" className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    <button onClick={() => sendMessage()} className={`transition-all ${newMessage.trim() ? 'text-blue-600' : 'text-slate-300'}`}><Send className="w-6 h-6" /></button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-white flex flex-col font-sans overflow-hidden">
            <div className="px-6 pt-14 pb-4 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><ChevronLeft className="w-6 h-6 text-slate-800" /></button>
                    <h1 className="text-3xl font-black tracking-tighter">{activeTab === 'chats' ? 'チャット' : activeTab === 'calls' ? '通話' : 'ストーリーズ'}</h1>
                    <div className="flex gap-2"><button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><Camera className="w-5 h-5 text-slate-700" /></button></div>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    <div className="flex flex-col items-center gap-2 shrink-0"><div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200"><Plus className="w-6 h-6 text-slate-400" /></div><span className="text-[10px] font-bold text-slate-400">追加</span></div>
                    {gameState?.users.filter(u => u.id !== currentUser?.id).slice(0, 5).map(u => (
                        <div key={u.id} className="flex flex-col items-center gap-2 shrink-0"><div className="w-14 h-14 rounded-full p-0.5 border-2 border-blue-600"><PlayerIcon size={52} playerName={u.name} /></div><span className="text-[10px] font-black">{u.name.split(' ')[0]}</span></div>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === 'chats' && (
                        <motion.div key="chats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-2">
                            {conversations?.map(conv => {
                                const other = conv.senderId === currentUser?.id ? conv.receiver : conv.sender;
                                return (
                                    <button key={conv.id} onClick={() => setSelectedUserId(other.id)} className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all group">
                                        <div className="relative shrink-0"><PlayerIcon size={56} playerName={other.name} /><div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" /></div>
                                        <div className="flex-1 text-left min-w-0"><h4 className="font-black text-slate-900 mb-0.5 truncate">{other.name}</h4><p className="text-sm truncate text-slate-400 font-medium">{conv.content}</p></div>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                    {activeTab === 'calls' && (
                        <motion.div key="calls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-2">
                            {gameState?.users.filter(u => u.id !== currentUser?.id).map(u => (
                                <div key={u.id} className={`flex items-center justify-between p-3 rounded-2xl transition ${hasPhoneApp(u as any) ? 'hover:bg-slate-50' : 'opacity-60'}`}>
                                    <div className="flex items-center gap-4"><PlayerIcon size={50} playerName={u.name} /><div><h4 className="font-black text-slate-900">{u.name}</h4><p className="text-xs text-slate-400 font-bold">音声通話</p></div></div>
                                    {hasPhoneApp(u as any) ? (
                                        <button onClick={() => initiateCall(u.id)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-blue-600"><Phone className="w-5 h-5 fill-current" /></button>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-400">未インストール</span>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="bg-white/70 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center px-6 pt-3 pb-8 shrink-0">
                <TabItem icon={<MessageCircle className="fill-current" />} label="チャット" active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} />
                <TabItem icon={<Video className="fill-current" />} label="ストーリーズ" active={activeTab === 'people'} onClick={() => setActiveTab('people')} />
                <TabItem icon={<Phone className="fill-current" />} label="通話" active={activeTab === 'calls'} onClick={() => setActiveTab('calls')} />
            </div>
        </div>
    );
}

const TabItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-300'}`}>
        <div className="p-2">{React.cloneElement(icon, { size: active ? 28 : 24 })}</div>
        <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
);
