'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/components/ui/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function SNSPage() {
    const { gameState, currentUser, sendRequest } = useGame();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { addToast } = useToast();
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    // Filter to valid user/game state
    if (!gameState || !currentUser) return <div className="p-4">Loading...</div>;

    const posts = gameState.snsPosts || [];

    const handlePost = async () => {
        if (!content.trim()) return;
        setIsPosting(true);
        try {
            await sendRequest('post_sns', 0, JSON.stringify({ content }));
            setContent('');
            addToast('送信しました', 'success');
            // Optimistic update handled by server response/SWR revalidation usually, 
            // but for immediate feedback we might want to wait for revalidation or just trust the toast.
        } catch (error) {
            console.error(error);
            addToast('送信失敗', 'error');
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            await sendRequest('like_sns', 0, JSON.stringify({ postId }));
            // Optimistic UI update could be done here if we had local state for posts,
            // but for now relying on fast revalidation or SWR mutate.
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <button onClick={() => router.back()} className="text-blue-500 font-bold">
                    ← 戻る
                </button>
                <h1 className="text-xl font-black text-blue-500 tracking-tighter">Squawker</h1>
                <div className="w-8" />
            </header>

            {/* Post Input */}
            <div className="bg-white p-4 mb-2 border-b border-gray-100">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold shrink-0">
                        {currentUser.name[0]}
                    </div>
                    <div className="flex-1">
                        <textarea
                            className="w-full resize-none outline-none text-base placeholder-gray-400 min-h-[80px]"
                            placeholder="いまどうしてる？"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePost}
                                disabled={isPosting || !content.trim()}
                                className={`px-4 py-2 rounded-full font-bold text-white transition-colors ${!content.trim() ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                            >
                                {isPosting ? '送信中...' : 'Squawk'}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed */}
            <div className="flex flex-col">
                <AnimatePresence mode='popLayout'>
                    {posts.map((post) => {
                        const isLiked = post.likedBy?.includes(currentUser.id);
                        return (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                                        {/* Avatar placeholder - simple color based on ID char code? */}
                                        <div
                                            className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                                            style={{ backgroundColor: `hsl(${post.authorId.charCodeAt(0) * 10}, 70%, 50%)` }}
                                        >
                                            {post.authorName[0]}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <span className="font-bold text-gray-900 truncate">{post.authorName}</span>
                                            <span className="text-gray-500 text-sm truncate">@{post.authorId.slice(0, 8)}</span>
                                            <span className="text-gray-400 text-sm">· {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-gray-900 whitespace-pre-wrap break-words leading-relaxed mb-3">
                                            {post.content}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between text-gray-500 max-w-sm">
                                            <button className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
                                                <span className="text-xl group-hover:bg-blue-50 rounded-full p-1.5 transition-colors">💬</span>
                                                <span className="text-sm">0</span>
                                            </button>
                                            <button className="group flex items-center gap-2 hover:text-green-500 transition-colors">
                                                <span className="text-xl group-hover:bg-green-50 rounded-full p-1.5 transition-colors">🔄</span>
                                                <span className="text-sm">0</span>
                                            </button>
                                            <motion.button
                                                onClick={() => handleLike(post.id)}
                                                whileTap={{ scale: 1.2 }}
                                                className={`group flex items-center gap-2 transition-colors ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                                            >
                                                <span className={`text-xl group-hover:bg-pink-50 rounded-full p-1.5 transition-colors ${isLiked ? 'text-pink-600' : ''}`}>
                                                    {isLiked ? '❤️' : '♡'}
                                                </span>
                                                <span className="text-sm">{post.likes}</span>
                                            </motion.button>
                                            <button className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
                                                <span className="text-xl group-hover:bg-blue-50 rounded-full p-1.5 transition-colors">📤</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {posts.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-4xl mb-4">🐦</div>
                        <p>まだ投稿がありません</p>
                        <p className="text-sm mt-2">最初の投稿をしてみましょう！</p>
                    </div>
                )}
            </div>
        </div>
    );
}
