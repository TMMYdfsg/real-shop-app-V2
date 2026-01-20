import React, { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { useRealtime } from '@/hooks/useRealtime';
import { VideoContent } from '@/types';

export default function VideoApp({ onClose }: { onClose: () => void }) {
    const { currentUser, sendRequest } = useGame();
    const { data: videos } = useRealtime<VideoContent[]>('/api/video/list', { interval: 5000 });

    // UI State
    const [view, setView] = useState<'list' | 'upload' | 'watch'>('list');
    const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);

    // Upload State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [color, setColor] = useState('#ff0000');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async () => {
        if (!title.trim() || !currentUser) return;
        setIsUploading(true);

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
            await sendRequest('upload_video', 0, JSON.stringify({
                title,
                description,
                tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
                url: fileUrl,
                color
            }));

            // Reset
            setView('list');
            setTitle('');
            setDescription('');
            setTagsInput('');
            setFile(null);
        } catch (e) {
            console.error(e);
            alert('アップロードに失敗しました');
        } finally {
            setIsUploading(false);
        }
    };

    const handleWatch = (video: VideoContent) => {
        setSelectedVideo(video);
        setView('watch');
    };

    return (
        <div className="h-full bg-white flex flex-col font-sans text-gray-900">
            {/* Header */}
            <div className="bg-white p-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => {
                        if (view === 'watch') setView('list');
                        else onClose();
                    }}
                    className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"
                >
                    ⬅
                </button>
                <div className="flex items-center gap-1 font-bold text-lg">
                    <span className="text-red-600 text-2xl">▶</span> Tube
                </div>
                {view === 'list' && (
                    <button onClick={() => setView('upload')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        📹
                    </button>
                )}
            </div>

            {/* Content Switcher */}
            {view === 'upload' && (
                <div className="p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 overflow-y-auto">
                    <h2 className="font-bold text-xl">動画をアップロード</h2>

                    {/* File Input */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition relative">
                        <input
                            type="file"
                            accept="video/mp4,video/webm"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="text-4xl mb-2">📁</div>
                        <p className="font-bold text-gray-500">{file ? file.name : '動画ファイルを選択 (MP4)'}</p>
                    </div>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="タイトル (必須)"
                        className="w-full p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                    />

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
                                />
                            ))}
                        </div>
                    </div>

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
                                src={selectedVideo.url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: selectedVideo.thumbnailColor }}>
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
                                <button className="flex items-center gap-1 hover:text-white">👍 {selectedVideo.likes}</button>
                                <button className="flex items-center gap-1 hover:text-white">👎</button>
                                <button className="flex items-center gap-1 hover:text-white">🔗 共有</button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-y border-gray-800 py-3 mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center">
                                👤
                            </div>
                            <div className="flex-1">
                                <div className="font-bold">{selectedVideo.uploaderName}</div>
                                <div className="text-xs text-gray-400">チャンネル登録者数 100万人</div>
                            </div>
                            <button className="bg-white text-black font-bold px-4 py-2 rounded-full text-xs hover:bg-gray-200">
                                登録
                            </button>
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
                                        <video src={video.url} className="w-full h-full object-cover pointer-events-none" />
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
                </div>
            )}
        </div>
    );
}
