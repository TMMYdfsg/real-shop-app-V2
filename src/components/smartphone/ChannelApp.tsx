'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { useRealtime } from '@/hooks/useRealtime';
import { VideoContent } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { AppHeader } from './AppHeader';
import { Bell, Share2, ChevronLeft } from 'lucide-react';

export default function ChannelApp({ onClose, channelOwnerId }: { onClose: () => void; channelOwnerId?: string }) {
    const { gameState, currentUser, sendRequest } = useGame();
    const { data: videos, refetch } = useRealtime<VideoContent[]>('/api/video/list', { interval: 5000 });
    const [subscribedChannels, setSubscribedChannels] = useState<Set<string>>(new Set());
    const [likedVideoIds, setLikedVideoIds] = useState<Set<string>>(new Set());
    const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);

    // チャンネルオーナーを決定
    const targetOwnerId = channelOwnerId || currentUser?.id;
    const channelOwner = gameState?.users.find(u => u.id === targetOwnerId);
    const channelVideos = useMemo(() => {
        return (videos || []).filter(v => v.uploaderId === targetOwnerId).slice(0, 50);
    }, [videos, targetOwnerId]);

    const isSubscribed = channelOwner?.channelSubscribers?.includes(currentUser?.id || '') || false;

    const handleSubscribeChannel = async () => {
        if (!currentUser || !channelOwner) return;
        try {
            await sendRequest('subscribe_channel', 0, { channelOwnerId: channelOwner.id });
            setSubscribedChannels(prev => {
                const newSet = new Set(prev);
                if (newSet.has(channelOwner.id)) {
                    newSet.delete(channelOwner.id);
                } else {
                    newSet.add(channelOwner.id);
                }
                return newSet;
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleLikeVideo = async (videoId: string) => {
        if (!currentUser) return;
        try {
            await sendRequest('like_video', 0, { videoId });
            setLikedVideoIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(videoId)) {
                    newSet.delete(videoId);
                } else {
                    newSet.add(videoId);
                }
                return newSet;
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (!channelOwner) {
        return (
            <div className="h-full bg-white flex flex-col items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">😕</div>
                    <p className="text-gray-500">チャンネルが見つかりません</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        戻る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-white sticky top-0 z-50 border-b border-gray-200"
            >
                <div className="px-4 py-3">
                    <button
                        onClick={onClose}
                        className="text-blue-500 font-bold text-sm mb-3 flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        戻る
                    </button>
                </div>
            </motion.div>

            {/* Channel Header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-6 text-white"
            >
                <div className="flex items-end gap-4 mb-4">
                    <div className="text-6xl">{channelOwner.channelIcon || '📺'}</div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black">{channelOwner.name}</h1>
                        <p className="text-white/80 text-sm">
                            {channelOwner.channelSubscribers?.length || 0}人が登録
                        </p>
                    </div>
                </div>

                {currentUser?.id !== targetOwnerId && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubscribeChannel}
                        className={`w-full font-bold py-2 rounded-lg transition-all ${
                            isSubscribed
                                ? 'bg-white/30 text-white border-2 border-white'
                                : 'bg-white text-blue-500 hover:bg-gray-100'
                        }`}
                    >
                        <motion.span
                            key={`sub-button-${isSubscribed}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {isSubscribed ? '✓ 登録済み' : '登録'}
                        </motion.span>
                    </motion.button>
                )}
            </motion.div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 flex justify-around sticky top-[80px] z-40">
                <button className="flex-1 py-3 font-bold text-gray-900 border-b-2 border-blue-500 text-center">
                    動画
                </button>
            </div>

            {/* Videos Grid */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {channelVideos.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 p-2">
                            {channelVideos.map(video => (
                                <motion.div
                                    key={video.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    onClick={() => setSelectedVideo(video)}
                                    className="bg-white rounded-lg overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
                                >
                                    <div className="flex gap-3 p-2">
                                        {/* Thumbnail */}
                                        <div
                                            className="w-28 h-16 rounded flex-shrink-0 flex items-center justify-center bg-gradient-to-br relative overflow-hidden group-hover:opacity-90 transition-opacity"
                                            style={{ background: `linear-to-br, from-${video.thumbnailColor}, to-${video.thumbnailColor}88` }}
                                        >
                                            {video.url ? (
                                                <video
                                                    src={video.url}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <span className="text-white/50 text-2xl">▶</span>
                                            )}
                                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                                10:00
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-bold text-sm line-clamp-2 text-gray-900">
                                                    {video.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {video.views} 回視聴 • {new Date(video.timestamp).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 mt-2">
                                                <motion.button
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLikeVideo(video.id);
                                                    }}
                                                    className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                                                        likedVideoIds.has(video.id)
                                                            ? 'bg-red-100 text-red-600'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <motion.span
                                                        key={`like-btn-${video.id}-${likedVideoIds.has(video.id)}`}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        {likedVideoIds.has(video.id) ? '❤️' : '🤍'} {video.likes}
                                                    </motion.span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-gray-400"
                        >
                            <div className="text-4xl mb-4">📹</div>
                            <p>まだ動画がありません</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Video Detail Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedVideo(null)}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Video Player */}
                            <div className="aspect-video w-full bg-black relative">
                                {selectedVideo.url ? (
                                    <video
                                        src={selectedVideo.url}
                                        controls
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center text-white"
                                        style={{ backgroundColor: selectedVideo.thumbnailColor }}
                                    >
                                        <span className="text-4xl opacity-50">▶</span>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="p-4 space-y-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{selectedVideo.title}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedVideo.views} 回視聴 • {new Date(selectedVideo.timestamp).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleLikeVideo(selectedVideo.id)}
                                        className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                                            likedVideoIds.has(selectedVideo.id)
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        <motion.span
                                            key={`detail-like-${selectedVideo.id}-${likedVideoIds.has(selectedVideo.id)}`}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            {likedVideoIds.has(selectedVideo.id) ? '❤️' : '🤍'} {selectedVideo.likes}
                                        </motion.span>
                                    </motion.button>
                                    <button className="flex-1 py-2 rounded-lg font-bold bg-gray-100 text-gray-600 flex items-center justify-center gap-2">
                                        <Share2 className="w-4 h-4" /> 共有
                                    </button>
                                </div>

                                {selectedVideo.description && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 whitespace-pre-wrap">
                                            {selectedVideo.description}
                                        </p>
                                    </div>
                                )}

                                {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedVideo.tags.map((tag, i) => (
                                            <span key={i} className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="w-full py-2 bg-blue-500 text-white font-bold rounded-lg"
                                >
                                    閉じる
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
