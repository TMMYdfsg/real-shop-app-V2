'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import { getCroppedImg, CroppedArea } from '@/lib/imageCrop';
import { Modal } from './Modal';
import { Button } from './Button';

interface IconSelectorProps {
    selectedIcon?: string;
    onSelect: (iconName: string) => void;
}

const AVAILABLE_ICONS = [
    { name: 'icon1.png', label: 'スマイル' },
    { name: 'icon2.png', label: 'パンダ' },
    { name: 'icon3.png', label: 'ロボット' },
    { name: 'icon4.png', label: 'ユニコーン' },
    { name: 'default.png', label: 'デフォルト' },
];

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon = 'default.png', onSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [customPreview, setCustomPreview] = useState<string | null>(null);

    // クロップ関連の状態
    const [isCropping, setIsCropping] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

    // カスタムアイコンかどうかチェック（Base64形式）
    const isCustomIcon = selectedIcon?.startsWith('data:image');

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    }, []);

    const handleFile = (file: File) => {
        // 画像ファイルのみ許可
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルのみアップロードできます');
            return;
        }

        // ファイルサイズチェック（最大2MB）
        if (file.size > 2 * 1024 * 1024) {
            alert('画像サイズは2MB以下にしてください');
            return;
        }

        // FileReaderでBase64に変換してクロップエディターを開く
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setImageToCrop(base64);
            setIsCropping(true);
        };
        reader.readAsDataURL(file);
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CroppedArea) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropConfirm = async () => {
        if (!imageToCrop || !croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels, 128);
            setCustomPreview(croppedImage);
            onSelect(croppedImage);
            setIsCropping(false);
            setImageToCrop(null);
        } catch (e) {
            console.error('画像のクロップに失敗しました', e);
            alert('画像のクロップに失敗しました');
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    // Enterキーで確定できるようにする
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isCropping && e.key === 'Enter') {
                e.preventDefault();
                handleCropConfirm();
            }
        };

        if (isCropping) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCropping, handleCropConfirm]);

    return (
        <div className="space-y-4">
            {/* カスタムアップロードゾーン */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center transition-all
                    ${isDragging
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }
                `}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="pointer-events-none">
                    <motion.div
                        animate={{ scale: isDragging ? 1.1 : 1 }}
                        className="text-4xl mb-2"
                    >
                        📸
                    </motion.div>
                    <p className="text-sm font-semibold text-gray-700">
                        {isDragging ? '画像をドロップ！' : 'カスタムアイコンをアップロード'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        クリックまたはドラッグ&ドロップ（最大2MB）
                    </p>
                </div>
            </div>

            {/* プリセットアイコン */}
            <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">アイコンを選択：</p>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {/* カスタムアイコンのプレビュー（グリッド内） */}
                    {(customPreview || isCustomIcon) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (customPreview) {
                                    onSelect(customPreview);
                                }
                            }}
                            className={`
                                cursor-pointer rounded-lg p-3 text-center transition-all
                                ${(isCustomIcon && !customPreview) || (customPreview && selectedIcon === customPreview)
                                    ? 'bg-indigo-100 border-2 border-indigo-500 shadow-lg'
                                    : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                                }
                            `}
                        >
                            <div className="w-16 h-16 mx-auto mb-2 relative rounded-full overflow-hidden shrink-0 ring-2 ring-offset-2 ring-indigo-400">
                                <Image
                                    src={customPreview || selectedIcon || ''}
                                    alt="カスタムアイコン"
                                    width={64}
                                    height={64}
                                    unoptimized
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-xs font-semibold text-gray-700">
                                カスタム
                            </div>
                            {((isCustomIcon && !customPreview) || (customPreview && selectedIcon === customPreview)) && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mt-1 text-indigo-600 text-lg"
                                >
                                    ✓
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {AVAILABLE_ICONS.map((icon) => {
                        const iconPath = `/icons/player/${icon.name}`;
                        const isSelected = selectedIcon === iconPath || selectedIcon === icon.name;

                        return (
                            <motion.div
                                key={icon.name}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setCustomPreview(null);
                                    onSelect(icon.name);
                                }}
                                className={`
                                    cursor-pointer rounded-lg p-3 text-center transition-all
                                    ${isSelected
                                        ? 'bg-indigo-100 border-2 border-indigo-500 shadow-lg'
                                        : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                                    }
                                `}
                            >
                                <div className="w-16 h-16 mx-auto mb-2 relative rounded-full overflow-hidden shrink-0">
                                    <Image
                                        src={iconPath}
                                        alt={icon.label}
                                        width={64}
                                        height={64}
                                        unoptimized
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/icons/player/default.png';
                                        }}
                                    />
                                </div>
                                <div className="text-xs font-semibold text-gray-700">
                                    {icon.label}
                                </div>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="mt-1 text-indigo-600 text-lg"
                                    >
                                        ✓
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 画像クロップモーダル */}
            <Modal isOpen={isCropping} onClose={handleCropCancel} title="📸 アイコンを調整">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        画像をドラッグして位置を調整し、スライダーでズームできます。
                    </p>

                    {/* クロップエリア */}
                    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                        {imageToCrop && (
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        )}
                    </div>

                    {/* ズームスライダー */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            ズーム
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* ボタン */}
                    <div className="flex gap-2 pt-4 relative z-50">
                        <Button fullWidth onClick={handleCropConfirm}>
                            確定 (Enter)
                        </Button>
                        <Button fullWidth variant="ghost" onClick={handleCropCancel}>
                            キャンセル
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
