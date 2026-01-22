'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AppHeader } from '../AppHeader';
import { Camera, RefreshCw, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';

type CameraFacing = 'user' | 'environment';

export const CameraApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser } = useGame();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [facingMode, setFacingMode] = useState<CameraFacing>('environment');
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [activeTab, setActiveTab] = useState<'camera' | 'gallery'>('camera');
    const [gallery, setGallery] = useState<string[]>([]);
    const [viewer, setViewer] = useState<string | null>(null);

    const storageKey = `smartphone_gallery_${currentUser?.id || 'guest'}`;

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setGallery(JSON.parse(saved));
            } catch {
                setGallery([]);
            }
        }
    }, [storageKey]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(gallery));
    }, [gallery, storageKey]);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
                setIsActive(true);
            } catch (error) {
                console.error('Camera permission error:', error);
                setHasPermission(false);
            }
        };

        if (activeTab === 'camera') {
            startCamera();
        }

        return () => {
            const stream = videoRef.current?.srcObject as MediaStream | null;
            stream?.getTracks().forEach(track => track.stop());
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setIsActive(false);
        };
    }, [activeTab, facingMode]);

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const width = video.videoWidth || 720;
        const height = video.videoHeight || 1280;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setGallery((prev) => [dataUrl, ...prev].slice(0, 60));
        setActiveTab('gallery');
    };

    const toggleCamera = () => {
        setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    };

    return (
        <div className="h-full bg-black text-white flex flex-col font-sans overflow-hidden">
            <AppHeader title="カメラ" onBack={onBack} variant="transparent" />

            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-black/60">
                <button
                    onClick={() => setActiveTab('camera')}
                    className={`px-4 py-1.5 rounded-full text-xs font-black ${activeTab === 'camera' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                >
                    カメラ
                </button>
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-4 py-1.5 rounded-full text-xs font-black ${activeTab === 'gallery' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                >
                    ギャラリー
                </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
                {activeTab === 'camera' && (
                    <div className="absolute inset-0 bg-black">
                        {hasPermission === false && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                                <Camera className="w-10 h-10 mb-3 text-white/40" />
                                <p className="text-sm font-bold text-white/80">カメラ権限が必要です</p>
                                <p className="text-xs text-white/40 mt-2">ブラウザ設定で許可してください</p>
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <div className="absolute inset-0 bg-black p-4 overflow-y-auto no-scrollbar">
                        {gallery.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/40 text-center">
                                <ImageIcon className="w-10 h-10 mb-3" />
                                <p className="text-sm font-bold">写真がありません</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {gallery.map((src, index) => (
                                    <button key={`${src}-${index}`} onClick={() => setViewer(src)}>
                                        <img src={src} className="w-full h-28 object-cover rounded-xl" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {activeTab === 'camera' && (
                <div className="px-6 py-6 bg-black/80 flex items-center justify-between">
                    <button
                        onClick={toggleCamera}
                        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={capturePhoto}
                        className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
                    >
                        <div className="w-12 h-12 rounded-full bg-white" />
                    </motion.button>
                    <div className="w-12 h-12" />
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            <AnimatePresence>
                {viewer && (
                    <motion.div
                        key="viewer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 flex items-center justify-center z-50"
                    >
                        <img src={viewer} className="max-h-[80%] max-w-[90%] rounded-2xl object-contain" />
                        <button
                            onClick={() => setViewer(null)}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
