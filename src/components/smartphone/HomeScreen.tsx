'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { APPS, DOCK_APPS } from './constants';
import { useGame } from '@/context/GameContext';

// Premium Glass Icon (3D Style)
const PremiumGlassIcon = ({ app, onClick, size = "md" }: { app: typeof APPS[0], onClick: () => void, size?: "md" | "lg" }) => {
    // Size
    const containerClass = size === "lg" ? "w-[66px] h-[66px]" : "w-[60px] h-[60px]";
    const iconSizeClass = size === "lg" ? "w-8 h-8" : "w-7 h-7";

    // Logic to map basic tailwind color classes to rich gradients
    const getGradient = (colorClass: string) => {
        if (colorClass.includes('green')) return 'bg-gradient-to-br from-[#6ee7b7] to-[#15803d]';
        if (colorClass.includes('blue')) return 'bg-gradient-to-br from-[#60a5fa] to-[#1e40af]';
        if (colorClass.includes('red') || colorClass.includes('rose')) return 'bg-gradient-to-br from-[#fb7185] to-[#be123c]';
        if (colorClass.includes('orange')) return 'bg-gradient-to-br from-[#fbbf24] to-[#b45309]';
        if (colorClass.includes('purple') || colorClass.includes('violet')) return 'bg-gradient-to-br from-[#c084fc] to-[#7e22ce]';
        if (colorClass.includes('sky') || colorClass.includes('cyan')) return 'bg-gradient-to-br from-[#38bdf8] to-[#0369a1]';
        if (colorClass.includes('pink')) return 'bg-gradient-to-br from-[#f472b6] to-[#be185d]';
        if (colorClass.includes('indigo')) return 'bg-gradient-to-br from-[#818cf8] to-[#4338ca]';
        if (colorClass.includes('teal')) return 'bg-gradient-to-br from-[#2dd4bf] to-[#0f766e]';
        if (colorClass.includes('yellow')) return 'bg-gradient-to-br from-[#facc15] to-[#a16207]';
        if (colorClass.includes('slate-900') || colorClass.includes('black')) return 'bg-gradient-to-br from-[#475569] to-[#0f172a]';
        if (colorClass.includes('gray') || colorClass.includes('slate')) return 'bg-gradient-to-br from-[#94a3b8] to-[#475569]';
        return 'bg-gradient-to-br from-blue-400 to-blue-700';
    };

    const gradientClass = getGradient(app.color);

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="relative flex flex-col items-center gap-1 group"
        >
            {/* 3D Glass Body */}
            <div className={`${containerClass} rounded-[20px] ${gradientClass} relative flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.25)] ring-1 ring-white/10`}>

                {/* 1. Bevel / Inner Depth */}
                <div className="absolute inset-0 rounded-[20px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.3)]" />

                {/* 2. Top Gloss (Shininess) */}
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-[20px]" />

                {/* 3. Icon (Floats inside) */}
                <div className={`${iconSizeClass} text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] z-10 filter`}>
                    {React.isValidElement(app.icon)
                        ? React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-full h-full stroke-[2.5px]", strokeWidth: 2.5 })
                        : app.icon}
                </div>

                {/* 4. Bottom Glow (Subtle bounce light) */}
                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent rounded-b-[20px]" />
            </div>
        </motion.button>
    );
};

interface HomeScreenProps {
    onOpenApp: (appId: string) => void;
}

export const HomeScreen = ({ onOpenApp }: HomeScreenProps) => {
    const { gameState } = useGame();
    const [currentPage, setCurrentPage] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Filter out dock apps from main grid
    const gridApps = APPS.filter(app => !DOCK_APPS.includes(app.id));
    const dockApps = DOCK_APPS.map(id => APPS.find(a => a.id === id)).filter(Boolean) as typeof APPS;

    // Paging
    const appsPerPage = 20; // 4x5 grid
    const totalPages = Math.ceil(gridApps.length / appsPerPage);
    const currentApps = gridApps.slice(currentPage * appsPerPage, (currentPage + 1) * appsPerPage);

    return (
        <div className="w-full h-full pt-8 flex flex-col relative overflow-hidden text-slate-100 font-sans select-none">
            {/* Wallpaper - Strict Layout Protection */}
            <div className="absolute inset-0 z-[0] w-full h-full pointer-events-none select-none">
                {/* Immediate parent of Image must be relative + overflow-hidden + sized */}
                <div className="relative w-full h-full overflow-hidden bg-slate-900">
                    <Image
                        src="/assets/wallpaper.png"
                        alt="wallpaper"
                        fill
                        className="object-cover"
                        priority
                        sizes="380px"
                    />
                    {/* Subtle scrim for readability */}
                    <div className="absolute inset-0 bg-black/10" />
                </div>
            </div>

            {/* Content Container */}
            <div className="absolute inset-0 z-[10] flex flex-col px-4 pt-8 h-full w-full overflow-hidden">

                {/* Search Bar (Samsung Style) */}
                <div className="mt-2 mb-6 mx-1">
                    <div className="h-[46px] w-full bg-slate-200/20 backdrop-blur-md rounded-[24px] flex items-center px-5 border border-white/10 shadow-sm">
                        <span className="text-white/70 text-base font-normal">Search</span>
                        <div className="ml-auto w-1 h-4 border-r border-white/30 flex items-center gap-3 pl-3">
                            <div className="w-1 h-1 rounded-full bg-white/70" />
                        </div>
                    </div>
                </div>

                {/* App Grid */}
                <div className="flex-1 overflow-y-auto pb-20 no-scrollbar"> {/* Added overflow handling just in case */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            className="grid grid-cols-4 gap-y-6 gap-x-2 justify-items-center pb-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                            {currentApps.map((app) => (
                                <div key={app.id} className="flex flex-col items-center w-[72px]">
                                    <PremiumGlassIcon app={app} onClick={() => onOpenApp(app.id)} />
                                    <span className="text-[10px] font-medium text-white shadow-black/60 drop-shadow-md text-center w-full truncate px-0.5 tracking-tight mt-1.5">
                                        {app.name}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mb-8 z-10 shrink-0">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentPage ? 'bg-white scale-125' : 'bg-white/40'}`}
                        />
                    ))}
                </div>

                {/* Dock (Fixed at bottom) */}
                <div className="mb-5 grid grid-cols-4 gap-x-2 px-1 justify-items-center shrink-0">
                    {dockApps.map(app => (
                        <div key={app.id} className="flex flex-col items-center justify-center w-[72px]">
                            <PremiumGlassIcon app={app} size="lg" onClick={() => onOpenApp(app.id)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
