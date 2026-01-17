'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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

        // FileReaderでBase64に変換
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setCustomPreview(base64);
            onSelect(base64); // Base64文字列をそのまま保存
        };
        reader.readAsDataURL(file);
    };

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

                {/* カスタムアイコンのプレビュー */}
                <AnimatePresence>
                    {(customPreview || isCustomIcon) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="mt-4 flex justify-center"
                        >
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg">
                                <Image
                                    src={customPreview || selectedIcon || ''}
                                    alt="カスタムアイコン"
                                    fill
                                    sizes="96px"
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* プリセットアイコン */}
            <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">または、プリセットから選択：</p>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
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
                                <div className="w-16 h-16 mx-auto mb-2 relative">
                                    <Image
                                        src={iconPath}
                                        alt={icon.label}
                                        fill
                                        sizes="64px"
                                        unoptimized
                                        className="object-contain rounded-full"
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
        </div>
    );
};
