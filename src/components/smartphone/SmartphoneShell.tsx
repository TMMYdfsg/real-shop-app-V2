import React from 'react';
import { getVibrationAdapter, VibrationPatterns } from '@/lib/vibration';

interface SmartphoneShellProps {
    children: React.ReactNode;
    onHome?: () => void;
    screenStyle?: React.CSSProperties;
    screenClassName?: string;
    toneOverlay?: React.ReactNode;
}

export const SmartphoneShell = ({ children, onHome, screenStyle, screenClassName, toneOverlay }: SmartphoneShellProps) => {
    const handleHomeClick = () => {
        const vibration = getVibrationAdapter();
        vibration.vibrate(VibrationPatterns.tap);
        onHome?.();
    };

    return (
        <div
            className="relative w-[340px] h-[740px] max-[480px]:w-[300px] max-[480px]:h-[640px] rounded-[3.5rem] bg-[#121212] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.6)] p-[14px] shrink-0 self-center border-[6px] border-[#333] ring-1 ring-white/10"
        >
            {/* 1. Screen Container (The strict clipping boundary) */}
            {(() => {
                const mergedStyle: React.CSSProperties = { ...screenStyle };
                if (screenStyle?.transform) {
                    mergedStyle.transform = `translateZ(0) ${screenStyle.transform}`;
                } else {
                    mergedStyle.transform = 'translateZ(0)';
                }
                return (
                    <div
                        className={`relative w-full h-full bg-black rounded-[2.8rem] overflow-hidden z-0 shadow-inner ring-1 ring-white/5 ${screenClassName || ''}`}
                        style={mergedStyle}
                    >
                {/* Back button portal slot */}
                <div id="smartphone-back-slot" className="absolute bottom-12 left-0 right-0 z-40 flex justify-center pointer-events-none" />
                {/* Content */}
                {children}
                {toneOverlay}

                {/* Home Indicator (Inside screen) */}
                <div
                    className="absolute bottom-2 left-0 right-0 h-8 flex justify-center items-end pb-2 z-50 cursor-pointer"
                    onClick={handleHomeClick}
                >
                    <div className="w-32 h-1.5 bg-white/40 rounded-full backdrop-blur-md transition-all active:scale-x-110 active:bg-white/60" />
                </div>
                    </div>
                );
            })()}

            {/* 2. Bezel & Hardware Details (Overlay) */}
            {/* Dynamic Island / Notch */}
            <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[110px] h-[32px] bg-black rounded-b-[20px] z-50 pointer-events-none">
                <div className="absolute top-[6px] right-[24px] w-2 h-2 rounded-full bg-[#1a1a1a] ring-1 ring-white/5" /> {/* Camera lens effect */}
                <div className="absolute top-[6px] right-[10px] w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />
            </div>

            {/* Side Buttons (Physical) */}
            <div className="absolute top-28 -left-[8px] w-[3px] h-7 bg-[#444] rounded-l-md shadow-sm" />
            <div className="absolute top-44 -left-[8px] w-[3px] h-14 bg-[#444] rounded-l-md shadow-sm" />
            <div className="absolute top-52 -right-[8px] w-[3px] h-20 bg-[#444] rounded-r-md shadow-sm" />

            {/* 3. Gloss & Frame Reflections */}
            <div className="absolute inset-0 rounded-[3.5rem] ring-1 ring-white/5 pointer-events-none z-50" />
            {/* Corner reflections */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-tr-[3.5rem] pointer-events-none z-50 opacity-50" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/5 to-transparent rounded-bl-[3.5rem] pointer-events-none z-50 opacity-50" />
        </div>
    );
};
