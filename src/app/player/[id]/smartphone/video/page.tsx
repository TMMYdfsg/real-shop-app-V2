'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/components/ui/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoPage() {
    const { gameState, currentUser, sendRequest } = useGame();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { addToast } = useToast();
    const [uploadMode, setUploadMode] = useState(false);
    const [title, setTitle] = useState('');
    const [color, setColor] = useState('#ff0000');
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!gameState || !currentUser) return <div className="p-4">Loading...</div>;

    const videos = gameState.videos || [];

    const handleUpload = async () => {
        if (!title.trim()) return;
        try {
            setIsUploading(true);
            let fileUrl = '';

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload/video', {
                    method: 'POST',
                    body: formData,
                });
                if (!res.ok) {
                    throw new Error('upload failed');
                }
                const data = await res.json();
                fileUrl = data.url;
            }

            await sendRequest('upload_video', 0, { title, color, url: fileUrl, description: '', tags: [] });
            setTitle('');
            setUploadMode(false);
            setFile(null);
            addToast('動画をアップロードしました！', 'success');
        } catch (error) {
            console.error(error);
            addToast('アップロード失敗', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm">
                <button onClick={() => router.back()} className="text-gray-600">
                    ←
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-red-600 rounded-lg flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-white border-b-[4px] border-b-transparent ml-1"></div>
                    </div>
                    <span className="text-xl font-bold tracking-tighter text-gray-800">Streamer</span>
                </div>
                <div className="w-6" />
            </header>

            {/* Video List */}
            <div className="p-2 space-y-4">
                {videos.map((video) => (
                    <motion.div
                        key={video.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer group"
                        onClick={() => setSelectedVideo(video)}
                    >
                        {/* Thumbnail */}
                        <div
                            className="aspect-video w-full relative group-hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: video.thumbnailColor }}
                        >
                            {video.url ? (
                                <video
                                    src={video.url}
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-cover"
                                />
                            ) : null}
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                                {Math.floor(Math.random() * 10)}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="p-3 flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                {video.uploaderName[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{video.title}</h3>
                                <div className="text-sm text-gray-600">
                                    {video.uploaderName} • {video.views}回視聴 • {new Date(video.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {videos.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>まだ動画がありません</p>
                        <button
                            onClick={() => setUploadMode(true)}
                            className="text-red-500 font-bold mt-4"
                        >
                            最初の動画を投稿する
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setUploadMode(true)}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-red-500"
                >
                    動画をアップロード
                </button>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {uploadMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setUploadMode(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white rounded-xl p-6 w-full max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-4">動画をアップロード</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">タイトル</label>
                                    <input
                                        type="text"
                                        placeholder="動画のタイトルを入力"
                                        className="w-full border rounded-lg p-2"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">動画ファイル</label>
                                    <input
                                        type="file"
                                        accept="video/mp4,video/webm,video/quicktime"
                                        className="w-full border rounded-lg p-2 bg-white"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">サムネイルカラー</label>
                                    <div className="flex gap-2">
                                        {['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff', '#00ffff'].map((c) => (
                                            <button
                                                key={c}
                                                className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setColor(c)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button
                                    className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'アップロード中...' : 'アップロード'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Playback Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-50 flex flex-col"
                    >
                        {/* Video Player Area */}
                        <div
                            className="aspect-video w-full bg-black flex items-center justify-center relative"
                        >
                            {selectedVideo.url ? (
                                <video
                                    src={selectedVideo.url}
                                    controls
                                    autoPlay
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <>
                                    <motion.div
                                        className="w-full h-full opacity-50"
                                        style={{ backgroundColor: selectedVideo.thumbnailColor }}
                                    />
                                    <div className="absolute text-white text-4xl animate-pulse">▶ 動画なし</div>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-4 left-4 text-white text-2xl font-bold drop-shadow-md"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Details */}
                        <div className="flex-1 bg-white p-4">
                            <h2 className="text-xl font-bold mb-2">{selectedVideo.title}</h2>
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                <span>{selectedVideo.views} views</span>
                                <span>•</span>
                                <span>{new Date(selectedVideo.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-4 py-4 border-t border-b">
                                <div className="flex-1 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                    <span className="font-bold">{selectedVideo.uploaderName}</span>
                                </div>
                                <button className="bg-red-600 text-white px-4 py-2 rounded-full font-bold">
                                    登録する
                                </button>
                            </div>
                            <div className="py-4">
                                <h3 className="font-bold mb-2">おすすめ動画</h3>
                                <div className="space-y-2">
                                    {/* Mock recommendations */}
                                    <div className="h-20 bg-gray-100 rounded flex gap-2 overflow-hidden">
                                        <div className="aspect-video h-full bg-gray-300"></div>
                                        <div className="p-2">
                                            <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
                                            <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="h-20 bg-gray-100 rounded flex gap-2 overflow-hidden">
                                        <div className="aspect-video h-full bg-gray-300"></div>
                                        <div className="p-2">
                                            <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
                                            <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
