'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getVibrationAdapter, VibrationPatterns } from '@/lib/vibration';

interface AppHeaderProps {
    title: string;
    onBack: () => void;
    rightActions?: React.ReactNode;
    variant?: 'default' | 'transparent';
}

export const AppHeader = ({
    title,
    onBack,
    rightActions,
    variant = 'default'
}: AppHeaderProps) => {
    const handleBack = () => {
        const vibration = getVibrationAdapter();
        vibration.vibrate(VibrationPatterns.tap);
        onBack();
    };

    const bgClass = variant === 'transparent'
        ? 'bg-white/80 backdrop-blur-md'
        : 'bg-white';

    return (
        <div className={`flex items-center justify-between px-4 py-3 ${bgClass} border-b border-gray-200 sticky top-0 z-10`}>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium text-sm">戻る</span>
            </motion.button>

            <h1 className="text-base font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
                {title}
            </h1>

            <div className="flex items-center gap-2">
                {rightActions}
            </div>
        </div>
    );
};
