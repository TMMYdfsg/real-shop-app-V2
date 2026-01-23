import React, { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { useRealtime } from '@/hooks/useRealtime';
import { VideoContent } from '@/types';
import { useToast } from '@/components/ui/ToastProvider';
import { AppHeader } from './AppHeader';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoApp({ onClose }: { onClose: () => void }) {
    const { currentUser, sendRequest } = useGame();
    const { data: videos, refetch } = useRealtime<VideoContent[]>('/api/video/list', { interval: 5000 });
    const { addToast } = useToast();

    // UI State
    const [view, setView] = useState<'list' | 'upload' | 'watch'>('list');
    const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
    const [likedVideoIds, setLikedVideoIds] = useState<Set<string>>(new Set());
    const [subscribedChannels, setSubscribedChannels] = useState<Set<string>>(new Set());

    // Upload State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [color, setColor] = useState('#ff0000');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const buildPoster = (color: string, title: string) => {
        const safeTitle = (title || '動画').slice(0, 24);
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='50%' text-anchor='middle' fill='white' fill-opacity='0.7' font-size='32' font-family='Arial'>${safeTitle}</text></svg>`;
        const base64 = typeof btoa !== 'undefined' ? btoa(unescape(encodeURIComponent(svg))) : Buffer.from(svg).toString('base64');
        return `data:image/svg+xml;base64,${base64}`;
    };

    // Helper: Check video duration
    const checkVideoDuration = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duration = video.duration;
                // Limit: 10 minutes (600 seconds)
                if (duration > 600) {
                    addToast('動画は10分以内でないと投稿できません', 'error');
                    resolve(false);
                } else {
                    resolve(true);
                }
            };
            video.onerror = () => {
                addToast('動画ファイルの読み込みに失敗しました', 'error');
                resolve(false);
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const handleUpload = async () => {
        if (!title.trim() || !currentUser) return;

        // Check duration if file exists
        if (file) {
            const isValidDuration = await checkVideoDuration(file);
            if (!isValidDuration) return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            let fileUrl = '';

            // 1. Upload File if selected
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/upload/video', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) throw new Error('File upload failed');
                const data = await res.json();
                fileUrl = data.url;
            }

            // 2. Register Metadata
            await sendRequest('upload_video', 0, {
                title,
                description,
                tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
                url: fileUrl,
                color
            });

            // Reset
            setView('list');
            setTitle('');
            setDescription('');
            setTagsInput('');
            setFile(null);

            // Refresh list immediately
            setTimeout(() => refetch(), 500); // Small delay to ensure DB write

            addToast('動画を投稿しました！', 'info');
        } catch (e) {
            console.error(e);
            addToast('アップロードに失敗しました', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleWatch = (video: VideoContent) => {
        setSelectedVideo(video);
        setView('watch');
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
            addToast('高評価を送信しました！', 'success');
        } catch (error) {
            console.error(error);
            addToast('エラーが発生しました', 'error');
        }
    };

    const handleSubscribeChannel = async (channelOwnerId: string) => {
        if (!currentUser) return;
        try {
            await sendRequest('subscribe_channel', 0, { channelOwnerId });
            setSubscribedChannels(prev => {
                const newSet = new Set(prev);
                if (newSet.has(channelOwnerId)) {
                    newSet.delete(channelOwnerId);
                } else {
                    newSet.add(channelOwnerId);
                }
                return newSet;
            });
            addToast('チャンネルを登録しました！', 'success');
        } catch (error) {
            console.error(error);
            addToast('エラーが発生しました', 'error');
        }
    };

    return (
        <div className="h-full bg-white flex flex-col font-sans text-gray-900">
            <AppHeader
                title="▶ Tube"
                onBack={() => {
                    if (view === 'watch') setView('list');
                    else onClose();
                }}
            />

            {/* Content Switcher */}
            {view === 'upload' && (
                <div className="p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 overflow-y-auto">
                    <h2 className="font-bold text-xl">動画をアップロード</h2>

                    {/* File Input */}
                    <div>
                        <label htmlFor="video-file" className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition block">
                            <input
                                id="video-file"
                                type="file"
                                accept="video/mp4,video/webm"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                                title="動画ファイルを選択"
                            />
                            <div className="text-4xl mb-2">📁</div>
                            <p className="font-bold text-gray-500">{file ? file.name : '動画ファイルを選択 (MP4)'}</p>
                        </label>
                    </div>

                    <div>
                        <label htmlFor="video-title" className="text-sm font-bold text-gray-500 block mb-2">タイトル (必須)</label>
                        <input
                            id="video-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="タイトルを入力してください"
                            className="w-full p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="説明"
                        className="w-full p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                    />

                    <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="タグ (カンマ区切り)"
                        className="w-full p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                    />

                    <div>
                        <label className="text-sm font-bold text-gray-500 mb-2 block">サムネイルカラー (動画がない場合)</label>
                        <div className="flex gap-2">
                            {['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-4 ${color === c ? 'border-black' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                    aria-label={`色 ${c} を選択`}
                                />
                            ))}
                        </div>
                    </div>

                    {isUploading && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>アップロード中...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-red-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-4 pb-8">
                        <button onClick={() => setView('list')} className="flex-1 py-3 text-gray-500 font-bold">キャンセル</button>
                        <button
                            onClick={handleUpload}
                            disabled={!title || isUploading}
                            className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isUploading ? 'アップロード中...' : 'アップロード'}
                        </button>
                    </div>
                </div>
            )}

            {view === 'watch' && selectedVideo && (
                <div className="flex-1 overflow-y-auto bg-black text-white">
                    {/* Video Player */}
                    <div className="aspect-video w-full bg-black sticky top-0 z-20">
                        {selectedVideo.url ? (
                            <video
                                key={selectedVideo.id + selectedVideo.url}
                                src={selectedVideo.url} // Direct src as fallback
                                controls
                                autoPlay
                                playsInline
                                webkit-playsinline="true"
                                preload="auto"
                                crossOrigin="anonymous"
                                className="w-full h-full object-contain"
                                poster={buildPoster(selectedVideo.thumbnailColor, selectedVideo.title)}
                                onError={(e) => {
                                    console.error('Video Playback Error:', e);
                                    console.log('Attempted URL:', selectedVideo.url);
                                    if (selectedVideo.url.startsWith('/uploads/') || selectedVideo.url.startsWith('/api/video/serve/')) {
                                        addToast('古いデータは再生できません。新しい投稿でお試しください。', 'warning');
                                    } else {
                                        addToast(`再生エラー: ${selectedVideo.url.substring(0, 30)}...`, 'error');
                                    }
                                }}
                            >
                                <source src={selectedVideo.url} type="video/mp4" />
                                <source src={selectedVideo.url} type="video/quicktime" />
                                <source src={selectedVideo.url} type="video/webm" />
                                お使いのブラウザはビデオタグをサポートしていません。
                            </video>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: selectedVideo.thumbnailColor || '#cccccc' }}>
                                <span className="text-white/50 font-bold">動画ファイルなし</span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                        <h1 className="text-xl font-bold mb-2">{selectedVideo.title}</h1>
                        <div className="flex items-center justify-between text-gray-400 text-xs mb-4">
                            <span>{selectedVideo.views}回視聴 • {new Date(selectedVideo.timestamp).toLocaleDateString()}</span>
                            <div className="flex gap-4">
                                <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLikeVideo(selectedVideo.id);
                                    }}
                                    className={`flex items-center gap-1 transition-colors ${likedVideoIds.has(selectedVideo.id) ? 'text-red-500' : 'hover:text-white'
                                        }`}
                                >
                                    <motion.span
                                        key={`like-${selectedVideo.id}-${likedVideoIds.has(selectedVideo.id)}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-lg"
                                    >
                                        {likedVideoIds.has(selectedVideo.id) ? '❤️' : '🤍'}
                                    </motion.span>
                                    {selectedVideo.likes}
                                </motion.button>
                                <button className="flex items-center gap-1 hover:text-white">👎</button>
                                <button className="flex items-center gap-1 hover:text-white">🔗 共有</button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-y border-gray-800 py-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center text-lg">
                                {selectedVideo.uploaderName[0]}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold">{selectedVideo.uploaderName}</div>
                                <div className="text-xs text-gray-400">登録者数 {selectedVideo.subscribers ?? 0}</div>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubscribeChannel(selectedVideo.uploaderId);
                                }}
                                className={`font-bold px-4 py-2 rounded-full text-xs transition-all ${subscribedChannels.has(selectedVideo.uploaderId)
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                            >
                                <motion.span
                                    key={`sub-${selectedVideo.uploaderId}-${subscribedChannels.has(selectedVideo.uploaderId)}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {subscribedChannels.has(selectedVideo.uploaderId) ? '登録済み' : '登録'}
                                </motion.span>
                            </motion.button>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-3 text-sm text-gray-300 whitespace-pre-wrap">
                            {selectedVideo.description || '説明なし'}
                            {selectedVideo.tags?.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {selectedVideo.tags.map((tag, i) => (
                                        <span key={i} className="text-blue-400">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {view === 'list' && (
                <div className="flex-1 overflow-y-auto p-0">
                    <div className="grid grid-cols-1 gap-0">
                        {videos?.map((video) => (
                            <div key={video.id} className="group cursor-pointer hover:bg-gray-50 pb-4" onClick={() => handleWatch(video)}>
                                {/* Thumbnail */}
                                <div className={`aspect-video w-full relative mb-2 flex items-center justify-center overflow-hidden`} style={{ backgroundColor: video.thumbnailColor }}>
                                    {video.url ? (
                                        <video
                                            src={video.url}
                                            className="w-full h-full object-cover pointer-events-none"
                                            muted
                                            playsInline
                                            crossOrigin="anonymous"
                                            preload="metadata"
                                            poster={buildPoster(video.thumbnailColor, video.title)}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-4xl">▶</div>
                                    )}
                                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">10:00</span>
                                </div>
                                {/* Meta */}
                                <div className="px-3 flex gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-sm leading-tight mb-1 line-clamp-2">{video.title}</h3>
                                        <div className="text-xs text-gray-500">
                                            {video.uploaderName} • {video.views}回視聴 • {new Date(video.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {!videos?.length && (
                        <div className="p-10 text-center text-gray-400">
                            動画がありません。<br />最初の動画を投稿しよう！
                        </div>
                    )}
                    <button
                        onClick={() => setView('upload')}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-red-500"
                    >
                        動画をアップロード
                    </button>
                </div>
            )}
        </div>
    );
}
