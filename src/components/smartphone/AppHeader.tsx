'use client';

import React from 'react';
import { createPortal } from 'react-dom';
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

    const backButton = (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className={`pointer-events-auto flex items-center gap-2 px-6 py-2.5 rounded-full shadow-lg border ${variant === 'transparent' ? 'bg-white/90 border-white/70 text-gray-800' : 'bg-white border-gray-200 text-gray-800'} backdrop-blur-md`}
        >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold text-sm">戻る</span>
        </motion.button>
    );

    const portalTarget = typeof document !== 'undefined'
        ? document.getElementById('smartphone-back-slot')
        : null;

    return (
        <>
            <div className={`flex items-center justify-between px-4 py-3 ${bgClass} border-b border-gray-200 sticky top-0 z-10`}>
                <div className="w-16" />

                <h1 className="text-base font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
                    {title}
                </h1>

                <div className="flex items-center gap-2">
                    {rightActions}
                </div>
            </div>
            {portalTarget ? createPortal(backButton, portalTarget) : null}
        </>
    );
};
