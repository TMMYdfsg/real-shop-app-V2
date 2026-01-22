import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useRealtime } from '@/hooks/useRealtime';
import { SNSPost } from '@/types';
import { Button } from '@/components/ui/Button';
import { AppHeader } from './AppHeader';

export default function SNSApp({ onClose }: { onClose: () => void }) {
    const { currentUser, sendRequest } = useGame();
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    // Fetch posts (realtime)
    const { data: posts } = useRealtime<SNSPost[]>('/api/sns/posts', { interval: 3000 });

    const handlePost = async () => {
        if (!newPostContent.trim() || !currentUser) return;
        setIsPosting(true);
        try {
            await sendRequest('post_sns', 0, JSON.stringify({ content: newPostContent }));
            setNewPostContent('');
        } catch (e) {
            alert('投稿に失敗しました');
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        if (!currentUser) return;
        await sendRequest('like_sns', 0, JSON.stringify({ postId }));
    };

    return (
        <div className="h-full bg-slate-50 flex flex-col font-sans">
            <AppHeader title="Buzzer" onBack={onClose} />

            {/* Feed */}
            <div className="flex-1 overflow-y-auto p-0">
                {posts?.map((post) => (
                    <div key={post.id} className="p-4 border-b bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-lg">
                                👤
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 truncate">{post.authorName}</span>
                                    <span className="text-xs text-gray-400">@{post.authorId.slice(0, 8)}</span>
                                    <span className="text-xs text-gray-400">· {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-gray-800 text-sm whitespace-pre-wrap break-words">{post.content}</p>
                                <div className="mt-3 flex gap-6 text-gray-500 text-xs">
                                    <button
                                        className={`flex items-center gap-1 hover:text-red-500 ${post.likedBy.includes(currentUser?.id || '') ? 'text-red-500' : ''}`}
                                        onClick={() => handleLike(post.id)}
                                    >
                                        {post.likedBy.includes(currentUser?.id || '') ? '❤️' : '♡'} {post.likes}
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-blue-500">
                                        💬 返信
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {!posts?.length && (
                    <div className="p-10 text-center text-gray-400">
                        まだ投稿がありません。<br />最初のつぶやきを投稿しよう！
                    </div>
                )}
            </div>

            {/* Post Input */}
            <div className="p-3 bg-white border-t sticky bottom-0">
                <div className="flex gap-2">
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="いまどうしてる？"
                        className="flex-1 bg-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                    />
                    <div className="flex flex-col justify-end">
                        <button
                            onClick={handlePost}
                            disabled={!newPostContent.trim() || isPosting}
                            className="bg-blue-500 text-white rounded-full p-3 font-bold text-sm shadow-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            ✒️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
