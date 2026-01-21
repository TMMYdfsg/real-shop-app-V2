import React from 'react';
import { motion } from 'framer-motion';

// Common Layout for all Apps to ensure consistent Glass Theme
interface GlassAppLayoutProps {
    children: React.ReactNode;
    title: string;
    onBack?: () => void;
    actionButton?: React.ReactNode;
    themeColor?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'slate' | 'pink';
    isRoot?: boolean; // If true, show hamburger/menu instead of back
}

export const GlassAppLayout = ({
    children,
    title,
    onBack,
    actionButton,
    themeColor = 'slate',
    isRoot = false
}: GlassAppLayoutProps) => {

    // Map theme colors to gradients
    const gradients = {
        blue: 'from-blue-600/90 to-indigo-700/90',
        green: 'from-emerald-600/90 to-teal-700/90',
        red: 'from-rose-600/90 to-red-700/90',
        purple: 'from-violet-600/90 to-purple-700/90',
        orange: 'from-orange-500/90 to-amber-600/90',
        slate: 'from-slate-700/90 to-slate-800/90',
        pink: 'from-pink-500/90 to-rose-600/90'
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-900/40 backdrop-blur-2xl text-slate-100 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className={`absolute top-[-20%] left-[-20%] w-[140%] h-[50%] bg-${themeColor}-500/20 blur-[100px] rounded-full pointer-events-none`} />

            {/* Header */}
            <header className={`shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-r ${gradients[themeColor]} backdrop-blur-md shadow-lg z-20`}>
                <div className="flex items-center gap-3">
                    {onBack && !isRoot && (
                        <button
                            onClick={onBack}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            ←
                        </button>
                    )}
                    <h1 className="font-bold text-lg tracking-wide text-white drop-shadow-sm truncate">{title}</h1>
                </div>
                <div>
                    {actionButton}
                </div>
            </header>

            {/* Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scrollbar-hide"
            >
                {children}
            </motion.div>
        </div>
    );
};
