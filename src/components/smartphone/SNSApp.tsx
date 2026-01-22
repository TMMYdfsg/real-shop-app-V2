'use client';

import React, { useMemo, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useRealtime } from '@/hooks/useRealtime';
import { SNSPost } from '@/types';
import { motion } from 'framer-motion';
import {
    Feather,
    MoreHorizontal,
    MessageCircle,
    Repeat2,
    Heart,
    Share,
    Image as ImageIcon,
    Sparkles,
    BadgeCheck
} from 'lucide-react';
import { PlayerIcon } from '@/components/ui/PlayerIcon';

export default function SNSApp({ onClose }: { onClose: () => void }) {
    const { currentUser, sendRequest } = useGame();
    const [compose, setCompose] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const { data: posts, refetch } = useRealtime<SNSPost[]>('/api/sns/posts', { interval: 3000 });

    const sortedPosts = useMemo(() => {
        return (posts || []).slice().sort((a, b) => b.timestamp - a.timestamp);
    }, [posts]);

    const handleLike = async (postId: string) => {
        if (!currentUser) return;
        await sendRequest('like_sns', 0, { postId });
    };

    const handlePost = async () => {
        if (!currentUser || !compose.trim()) return;
        setIsPosting(true);
        try {
            await sendRequest('post_sns', 0, { content: compose.trim() });
            setCompose('');
            setTimeout(() => refetch(), 200);
        } finally {
            setIsPosting(false);
        }
    };

    const timeAgo = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'いま';
        if (mins < 60) return `${mins}分`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}時間`;
        const days = Math.floor(hours / 24);
        return `${days}日`;
    };

    return (
        <div className="h-full bg-white text-slate-900 flex flex-col font-sans overflow-hidden">
            <div className="px-5 pt-14 pb-4 border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">←</button>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white">
                            <Feather className="w-5 h-5" />
                        </div>
                        <span className="font-black text-lg tracking-tight">Chirp</span>
                    </div>
                    <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                        <PlayerIcon size={28} playerName={currentUser?.name || 'Me'} />
                    </button>
                </div>
            </div>

            <div className="px-5 py-4 border-b border-slate-200 bg-white">
                <div className="flex gap-3">
                    <PlayerIcon size={40} playerName={currentUser?.name || 'Me'} />
                    <div className="flex-1">
                        <textarea
                            value={compose}
                            onChange={(e) => setCompose(e.target.value)}
                            placeholder="いまどうしてる？"
                            className="w-full resize-none text-sm outline-none placeholder:text-slate-400 bg-transparent"
                            rows={2}
                        />
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                <button className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                disabled={!compose.trim() || isPosting}
                                onClick={handlePost}
                                className={`px-4 py-1.5 rounded-full text-xs font-black ${compose.trim() && !isPosting ? 'bg-[#1d9bf0] text-white' : 'bg-slate-100 text-slate-400'}`}
                            >
                                {isPosting ? '投稿中...' : 'ポスト'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {sortedPosts.map((post) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-5 py-4 border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex gap-3">
                            <PlayerIcon size={44} playerName={post.authorName} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-black text-sm truncate">{post.authorName}</span>
                                        <BadgeCheck className="w-4 h-4 text-[#1d9bf0]" />
                                        <span className="text-xs text-slate-400 truncate">@player</span>
                                        <span className="text-xs text-slate-300">·</span>
                                        <span className="text-xs text-slate-400">{timeAgo(post.timestamp)}</span>
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-800 leading-relaxed mt-2 whitespace-pre-wrap">{post.content}</p>

                                <div className="mt-3 flex items-center justify-between text-slate-400">
                                    <button className="flex items-center gap-1 text-xs hover:text-[#1d9bf0]">
                                        <MessageCircle className="w-4 h-4" />
                                        返信
                                    </button>
                                    <button className="flex items-center gap-1 text-xs hover:text-emerald-500">
                                        <Repeat2 className="w-4 h-4" />
                                        再投稿
                                    </button>
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={`flex items-center gap-1 text-xs ${post.likedBy.includes(currentUser?.id || '') ? 'text-rose-500' : 'hover:text-rose-500'}`}
                                    >
                                        <Heart className={`w-4 h-4 ${post.likedBy.includes(currentUser?.id || '') ? 'fill-current' : ''}`} />
                                        {post.likes}
                                    </button>
                                    <button className="flex items-center gap-1 text-xs hover:text-slate-600">
                                        <Share className="w-4 h-4" />
                                        共有
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {!sortedPosts.length && (
                    <div className="p-10 text-center text-slate-400">
                        <Feather className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                        <p className="text-sm font-black">まだ投稿がありません</p>
                        <p className="text-xs mt-2">最初のつぶやきを投稿してみよう</p>
                    </div>
                )}
            </div>
        </div>
    );
}
