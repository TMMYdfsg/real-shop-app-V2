'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useRealtime } from '@/hooks/useRealtime';
import { SNSPost } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    MoreHorizontal,
    MessageCircle,
    Share2,
    Clock,
    Globe,
    Users,
    Zap
} from 'lucide-react';
import { PlayerIcon } from '@/components/ui/PlayerIcon';

export default function SNSApp({ onClose }: { onClose: () => void }) {
    const { currentUser, sendRequest, gameState } = useGame();
    const [viewMode, setViewMode] = useState<'my-friends' | 'discovery'>('discovery');
    const [isPosting, setIsPosting] = useState(false);
    const [timer, setTimer] = useState("01:42"); // Mock BeReal timer

    // Fetch posts (realtime)
    const { data: posts } = useRealtime<SNSPost[]>('/api/sns/posts', { interval: 3000 });

    const handleLike = async (postId: string) => {
        if (!currentUser) return;
        await sendRequest('like_sns', 0, JSON.stringify({ postId }));
    };

    return (
        <div className="h-full bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
            {/* BeReal Header */}
            <div className="px-6 pt-14 pb-4 shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center font-bold text-xl">←</button>
                    <h1 className="text-xl font-black tracking-tighter">BeReal.</h1>
                    <button className="w-8 h-8 flex items-center justify-center">
                        <PlayerIcon size={32} playerName={currentUser?.name || 'Me'} className="border border-white/20" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center gap-6 mb-4">
                    <button
                        onClick={() => setViewMode('my-friends')}
                        className={`text-xs font-black transition-all ${viewMode === 'my-friends' ? 'text-white scale-110' : 'text-white/40'}`}
                    >
                        My Friends
                    </button>
                    <button
                        onClick={() => setViewMode('discovery')}
                        className={`text-xs font-black transition-all ${viewMode === 'discovery' ? 'text-white scale-110' : 'text-white/40'}`}
                    >
                        Discovery
                    </button>
                </div>

                {/* BeReal Timer Mock */}
                <div className="flex justify-center">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10 ring-2 ring-yellow-400/20">
                        <Zap className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-black tracking-widest font-mono">{timer}</span>
                    </div>
                </div>
            </div>

            {/* Feed Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-10 py-6">
                {posts?.map((post) => (
                    <BeRealPost
                        key={post.id}
                        post={post}
                        isMe={post.authorId === currentUser?.id}
                        onLike={() => handleLike(post.id)}
                    />
                ))}

                {!posts?.length && (
                    <div className="px-10 text-center text-white/40 pt-20">
                        <Camera className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-black">Time to BeReal.</p>
                        <p className="text-xs font-medium mt-1 uppercase tracking-widest opacity-60">No posts yet</p>
                    </div>
                )}
            </div>

            {/* Post Action Button */}
            <div className="p-8 flex justify-center sticky bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] ring-4 ring-white/10"
                >
                    <div className="w-10 h-10 rounded-full border-4 border-black" />
                </motion.button>
            </div>
        </div>
    );
}

const BeRealPost = ({ post, isMe, onLike }: { post: SNSPost, isMe: boolean, onLike: () => void }) => {
    const [showOverlay, setShowOverlay] = useState(true);

    return (
        <div className="px-4">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-3">
                    <PlayerIcon size={36} playerName={post.authorName} className="border border-white/10" />
                    <div>
                        <h3 className="text-sm font-black">{post.authorName}</h3>
                        <div className="flex items-center gap-1.5 opacity-40">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold">2 min late</span>
                        </div>
                    </div>
                </div>
                <button className="p-2 -mr-2 text-white/40"><MoreHorizontal className="w-5 h-5" /></button>
            </div>

            {/* Dual Camera Image View */}
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
                {/* Main Image (Back Camera) */}
                <div className="absolute inset-0 flex items-center justify-center text-white/5">
                    <ImageIcon className="w-20 h-20" />
                    {/* In a real app, this would be the actual post content */}
                </div>

                {/* Visual Placeholder Content */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 select-none">
                        SIMULATED CONTENT • SIMULATED CONTENT • SIMULATED CONTENT
                    </p>
                </div>

                {/* Content Text overlay (since our DB stores text-mostly) */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-sm font-medium leading-relaxed drop-shadow-md">{post.content}</p>
                </div>

                {/* Front Camera Overlay (Swapable) */}
                <AnimatePresence>
                    {showOverlay && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-4 left-4 w-[28%] aspect-[3/4] rounded-2xl bg-slate-800 border-2 border-black shadow-xl overflow-hidden z-20 overflow-hidden"
                            onClick={() => setShowOverlay(false)}
                        >
                            <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                                <PlayerIcon size={80} playerName={post.authorName} className="opacity-40 grayscale" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Interaction Footer */}
            <div className="mt-3 flex items-center gap-4 px-1">
                <button
                    onClick={onLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${post.likedBy.includes(post.authorId) ? 'bg-white text-black' : 'bg-white/10 text-white'
                        }`}
                >
                    <span className="text-xs font-black">😊</span>
                    {post.likes > 0 && <span className="text-[10px] font-black">{post.likes}</span>}
                </button>
                <div className="flex-1" />
                <button className="text-white/40"><MessageCircle className="w-5 h-5" /></button>
                <button className="text-white/40"><Share2 className="w-5 h-5" /></button>
            </div>
        </div>
    );
};

const ImageIcon = ({ className }: { className?: string }) => (
    <div className={className}>
        <div className="w-full h-full border-4 border-dotted border-current rounded-3xl flex items-center justify-center">
            <Camera className="w-1/2 h-1/2 opacity-20" />
        </div>
    </div>
);
