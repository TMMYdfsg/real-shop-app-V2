import React from 'react';
import { motion } from 'framer-motion';

interface SmartphoneShellProps {
    children: React.ReactNode;
    onHome?: () => void;
}

export const SmartphoneShell = ({ children, onHome }: SmartphoneShellProps) => {
    return (
        <div className="relative w-[375px] h-[812px] bg-black rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-gray-900 ring-4 ring-gray-800 self-center shrink-0">
            {/* Side Buttons (Visual only) */}
            <div className="absolute top-24 -left-3 w-1 h-8 bg-gray-800 rounded-l-md" /> {/* Silent */}
            <div className="absolute top-40 -left-3 w-1 h-16 bg-gray-800 rounded-l-md" /> {/* Vol Up */}
            <div className="absolute top-60 -left-3 w-1 h-16 bg-gray-800 rounded-l-md" /> {/* Vol Down */}
            <div className="absolute top-48 -right-3 w-1 h-24 bg-gray-800 rounded-r-md" /> {/* Power */}

            {/* Screen */}
            <div className="w-full h-full bg-black relative overflow-hidden rounded-[2.5rem] flex flex-col">
                {/* Dynamic Island / Notch */}
                <div className="absolute top-0 inset-x-0 h-8 z-50 flex justify-center pointer-events-none">
                    <div className="w-32 h-7 bg-black rounded-b-3xl" />
                </div>

                {/* Content */}
                <div className="block flex-1 w-full h-full relative z-0 overflow-hidden text-white">
                    {children}
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1 inset-x-0 h-4 z-50 flex justify-center pb-2 pointer-events-auto cursor-pointer" onClick={onHome}>
                    <motion.div
                        whileTap={{ scaleY: 1.5, opacity: 0.5 }}
                        className="w-32 h-1.5 bg-white/50 rounded-full backdrop-blur-md"
                    />
                </div>
            </div>
        </div>
    );
};
