'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { APPS, DOCK_APPS } from './constants';
import { Search } from 'lucide-react';

// Premium Glass Icon (High Fidelity CSS version)
const PremiumGlassIcon = ({ app, onClick, size = "md" }: { app: typeof APPS[0], onClick: () => void, size?: "md" | "lg" }) => {
    const containerSize = size === "lg" ? "w-[68px] h-[68px]" : "w-[64px] h-[64px]";
    const iconSize = size === "lg" ? "w-8 h-8" : "w-7 h-7";

    // Dynamic High-Fidelity Gradients to match the rejected image's quality
    const getPremiumStyles = (colorClass: string) => {
        if (colorClass.includes('green')) return 'from-[#4ade80] to-[#16a34a] shadow-green-500/30';
        if (colorClass.includes('blue')) return 'from-[#60a5fa] to-[#2563eb] shadow-blue-500/30';
        if (colorClass.includes('red') || colorClass.includes('rose')) return 'from-[#fb7185] to-[#e11d48] shadow-rose-500/30';
        if (colorClass.includes('orange')) return 'from-[#fbbf24] to-[#ea580c] shadow-orange-500/30';
        if (colorClass.includes('purple') || colorClass.includes('indigo')) return 'from-[#c084fc] to-[#9333ea] shadow-purple-500/30';
        if (colorClass.includes('sky') || colorClass.includes('cyan')) return 'from-[#38bdf8] to-[#0284c7] shadow-sky-500/30';
        if (colorClass.includes('pink')) return 'from-[#f472b6] to-[#db2777] shadow-pink-500/30';
        if (colorClass.includes('teal')) return 'from-[#2dd4bf] to-[#0d9488] shadow-teal-500/30';
        if (colorClass.includes('yellow')) return 'from-[#fde047] to-[#ca8a04] shadow-yellow-500/30';
        if (colorClass.includes('slate-900') || colorClass.includes('black')) return 'from-[#475569] to-[#0f172a] shadow-slate-900/40';
        return 'from-[#94a3b8] to-[#475569] shadow-slate-500/30';
    };

    const gradientClasses = getPremiumStyles(app.color);

    return (
        <motion.button
            whileTap={{ scale: 0.92, rotate: -1 }}
            onClick={onClick}
            className="group flex flex-col items-center gap-1.5 focus:outline-none"
        >
            <div className={`
                ${containerSize} rounded-[22px] bg-gradient-to-br ${gradientClasses}
                relative flex items-center justify-center 
                shadow-lg transition-all duration-200
                group-hover:shadow-[0_0_25px_inherit] group-hover:scale-105
            `}>
                {/* 1. Bevel & Glass Layers */}
                <div className="absolute inset-0 rounded-[22px] border border-white/20" />
                <div className="absolute inset-[1px] rounded-[21px] border border-black/5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_8px_rgba(0,0,0,0.25)]" />

                {/* 2. Top Gloss Highlight */}
                <div className="absolute top-[2px] left-[4px] right-[4px] h-[35%] bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-t-[18px]" />

                {/* 3. Icon Content (Lucide or custom) */}
                <div className={`${iconSize} text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)] z-10 flex items-center justify-center`}>
                    {React.isValidElement(app.icon)
                        ? React.cloneElement(app.icon as React.ReactElement<any>, { className: "w-full h-full stroke-[2.5px]" })
                        : <span className="text-2xl">{app.icon}</span>}
                </div>
            </div>

            <span className="text-[10px] font-bold text-white shadow-black/80 drop-shadow-md text-center w-full truncate px-0.5 tracking-tight">
                {app.name}
            </span>
        </motion.button>
    );
};

interface HomeScreenProps {
    onOpenApp: (appId: string) => void;
}

export const HomeScreen = ({ onOpenApp }: HomeScreenProps) => {
    // Sort and split apps: First 16 for the main grid as per user image
    const mainGridApps = APPS.slice(0, 16);
    const otherApps = APPS.slice(16);

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#020617] font-sans select-none">

            {/* Background: Depth and Ambient Light */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_#020617_100%)]" />

                {/* Animated Light Blobs */}
                <motion.div
                    animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-10 -left-10 w-80 h-80 bg-blue-500/20 blur-[100px] rounded-full"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, -20, 0], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[20%] -right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full"
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col pt-12 px-5 z-10 relative overflow-hidden">

                {/* Modern Search Bar */}
                <div className="mb-10 w-full">
                    <div className="h-[44px] w-full bg-white/5 backdrop-blur-2xl rounded-2xl flex items-center px-4 border border-white/10 shadow-xl">
                        <Search className="w-4 h-4 text-white/30 mr-2.5" />
                        <span className="text-white/30 text-sm font-medium">アプリ検索</span>
                    </div>
                </div>

                {/* Main Content Scroll Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">

                    {/* Primary 4x4 Grid (16 apps) */}
                    <div className="grid grid-cols-4 gap-y-7 gap-x-2 justify-items-center mb-16">
                        {mainGridApps.map((app) => (
                            <div key={app.id} className="w-full flex justify-center">
                                <PremiumGlassIcon app={app} onClick={() => onOpenApp(app.id)} />
                            </div>
                        ))}
                    </div>

                    {/* "Other Apps" Section */}
                    {otherApps.length > 0 && (
                        <div className="px-1 mb-10">
                            <div className="flex items-center gap-3 mb-8">
                                <h2 className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase">その他のアプリ</h2>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>

                            <div className="grid grid-cols-4 gap-y-7 gap-x-2 justify-items-center">
                                {otherApps.map((app) => (
                                    <div key={app.id} className="w-full flex justify-center">
                                        <PremiumGlassIcon app={app} onClick={() => onOpenApp(app.id)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Small Home Indicator hint at the very bottom */}
            <div className="absolute bottom-1 w-full flex justify-center pb-2 z-20 pointer-events-none">
                <div className="w-12 h-1 bg-white/10 rounded-full" />
            </div>
        </div>
    );
};
