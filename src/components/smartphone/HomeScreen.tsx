'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { APPS } from './constants';
import { Search } from 'lucide-react';
import { getVibrationAdapter, VibrationPatterns } from '@/lib/vibration';

// Compact Glass Icon matching reference image
const CompactGlassIcon = ({ app, onClick }: { app: typeof APPS[0], onClick: () => void }) => {
    const handleAppClick = () => {
        const vibration = getVibrationAdapter();
        vibration.vibrate(VibrationPatterns.tap);
        onClick();
    };

    const getPremiumStyles = (colorClass: string) => {
        if (colorClass.includes('green')) return 'from-[#4ade80] to-[#16a34a]';
        if (colorClass.includes('blue')) return 'from-[#60a5fa] to-[#2563eb]';
        if (colorClass.includes('red') || colorClass.includes('rose')) return 'from-[#fb7185] to-[#e11d48]';
        if (colorClass.includes('orange')) return 'from-[#fbbf24] to-[#ea580c]';
        if (colorClass.includes('purple') || colorClass.includes('indigo')) return 'from-[#c084fc] to-[#9333ea]';
        if (colorClass.includes('sky') || colorClass.includes('cyan')) return 'from-[#38bdf8] to-[#0284c7]';
        if (colorClass.includes('pink')) return 'from-[#f472b6] to-[#db2777]';
        if (colorClass.includes('teal')) return 'from-[#2dd4bf] to-[#0d9488]';
        if (colorClass.includes('yellow')) return 'from-[#fde047] to-[#ca8a04]';
        if (colorClass.includes('slate-900') || colorClass.includes('black')) return 'from-[#475569] to-[#0f172a]';
        return 'from-[#94a3b8] to-[#475569]';
    };

    const gradientClasses = getPremiumStyles(app.color);

    return (
        <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleAppClick}
            className="group flex flex-col items-center gap-1 focus:outline-none"
        >
            <div className={`
                w-[56px] h-[56px] rounded-[18px] bg-gradient-to-br ${gradientClasses}
                relative flex items-center justify-center 
                shadow-md transition-all duration-150
            `}>
                <div className="absolute inset-0 rounded-[18px] border border-white/20" />
                <div className="absolute inset-[1px] rounded-[17px] border border-black/5 shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),inset_0_-2px_6px_rgba(0,0,0,0.2)]" />
                <div className="absolute top-[1px] left-[3px] right-[3px] h-[30%] bg-gradient-to-b from-white/25 via-white/8 to-transparent rounded-t-[16px]" />

                <div className="w-6 h-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] z-10 flex items-center justify-center">
                    {React.isValidElement(app.icon)
                        ? React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-full h-full stroke-[2.5px]" })
                        : <span className="text-xl">{app.icon}</span>}
                </div>
            </div>

            <span className="text-[9px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center w-full truncate px-0.5">
                {app.name}
            </span>
        </motion.button>
    );
};

interface HomeScreenProps {
    onOpenApp: (appId: string) => void;
}

export const HomeScreen = ({ onOpenApp }: HomeScreenProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const appsPerPage = 20; // 5 rows × 4 columns
    const totalPages = Math.ceil(APPS.length / appsPerPage);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x > threshold && currentPage > 0) {
            setCurrentPage(currentPage - 1);
        } else if (info.offset.x < -threshold && currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const getCurrentPageApps = () => {
        const startIndex = currentPage * appsPerPage;
        return APPS.slice(startIndex, startIndex + appsPerPage);
    };

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden font-sans select-none bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]">
            {/* Animated Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-indigo-500/30 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full" />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col pt-8 px-4 z-10 relative">

                {/* Search Bar - matching reference style */}
                <div className="mb-6 w-full">
                    <div className="h-[48px] w-full bg-white/10 backdrop-blur-2xl rounded-[24px] flex items-center px-5 border border-white/20 shadow-xl group transition-all hover:bg-white/15">
                        <Search className="w-4 h-4 text-white/50 mr-3" strokeWidth={2.5} />
                        <span className="text-white/50 text-[15px] font-medium">Search Apps...</span>
                    </div>
                </div>

                {/* App Grid Container with rounded corners - matching reference */}
                <div className="flex-1 relative overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={currentPage}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-0"
                        >
                            {/* Rounded container for apps */}
                            <div className="h-full bg-white/15 backdrop-blur-md rounded-[32px] border border-white/20 shadow-xl p-5 overflow-hidden">
                                {/* 5 rows × 4 columns grid */}
                                <div className="grid grid-cols-4 gap-y-5 gap-x-3 justify-items-center h-full content-start">
                                    {getCurrentPageApps().map((app) => (
                                        <div key={app.id} className="w-full flex justify-center">
                                            <CompactGlassIcon app={app} onClick={() => onOpenApp(app.id)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Page Indicators - matching reference image */}
                <div className="flex justify-center items-center gap-1.5 py-4 z-20">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <motion.div
                            key={index}
                            className={`rounded-full transition-all ${index === currentPage
                                ? 'w-2 h-2 bg-white'
                                : 'w-1.5 h-1.5 bg-white/40'
                                }`}
                            whileTap={{ scale: 1.2 }}
                            onClick={() => setCurrentPage(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
