
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

// App Icons
const APPS = [
    { id: 'job_board', name: '求人', icon: '💼', color: 'bg-blue-500' },
    { id: 'bank', name: '銀行', icon: '🏦', color: 'bg-green-600' }, // Opens Modal
    { id: 'map', name: '地図', icon: '🗺️', color: 'bg-yellow-500' }, // Opens External
    { id: 'status', name: '生活', icon: '❤️', color: 'bg-pink-500' },
    { id: 'audit', name: '行動記録', icon: '📜', color: 'bg-gray-600' }, // New
    { id: 'shopping', name: '通販', icon: '🛒', color: 'bg-orange-500' }, // Future
    { id: 'message', name: '連絡', icon: '📞', color: 'bg-green-400' }, // Future
];

interface SmartphoneProps {
    onOpenApp: (appId: string) => void;
}

export const Smartphone: React.FC<SmartphoneProps> = ({ onOpenApp }) => {
    const { currentUser } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const [currentApp, setCurrentApp] = useState<string | null>(null);

    // Battery visualization
    const batteryLevel = currentUser?.smartphone?.battery ?? 100;

    const togglePhone = () => {
        setIsOpen(!isOpen);
        if (isOpen) setCurrentApp(null); // Close app when phone closes
    };

    const handleAppClick = (appId: string) => {
        // All apps now open in external windows/modals
        onOpenApp(appId);
        setIsOpen(false); // Close the phone menu after launching
    };

    const handleBack = () => {
        setCurrentApp(null);
    };

    if (!currentUser) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Phone Body */}
            {isOpen && (
                <div className="mb-4 w-80 h-[500px] bg-gray-900 border-8 border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative transform transition-all duration-300 origin-bottom-right animate-in fade-in slide-in-from-bottom-10">
                    {/* Status Bar */}
                    <div className="w-full h-8 bg-black flex justify-between items-center px-4 text-xs text-white z-30 relative rounded-t-2xl">
                        <span className="font-mono">{new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-1">
                            <span>5G</span>
                            <div className={`w-6 h-3 border border-white rounded-sm flex items-center px-0.5 ${batteryLevel < 20 ? 'border-red-500' : ''}`}>
                                <div
                                    className={`h-2 w-full ${batteryLevel < 20 ? 'bg-red-500' : 'bg-white'}`}
                                    style={{ width: `${batteryLevel}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>

                    {/* Screen Content */}
                    <div className="w-full h-full pt-8 overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white relative">

                        {/* Home Screen */}
                        <div className="p-4 grid grid-cols-3 gap-6 mt-12 place-items-center">
                            {APPS.map((app, i) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        delay: i * 0.05,
                                        type: 'spring',
                                        stiffness: 260,
                                        damping: 20
                                    }}
                                    className="flex flex-col items-center gap-2 cursor-pointer group w-24"
                                    onClick={() => handleAppClick(app.id)}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`w-20 h-20 ${app.color} rounded-3xl flex items-center justify-center text-4xl shadow-xl border border-white/10`}
                                    >
                                        {app.icon}
                                    </motion.div>
                                    <span className="text-xs text-white font-bold drop-shadow-md tracking-wide w-full text-center">
                                        {app.name}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Dock (Static at bottom on Home Screen) */}
                        <div className="absolute bottom-4 left-4 right-4 h-20 bg-white/10 rounded-3xl backdrop-blur-md grid grid-cols-4 gap-4 p-3 z-10">
                            <div onClick={() => handleAppClick('phone')} className="w-full h-full bg-green-500 rounded-xl flex items-center justify-center text-2xl cursor-pointer hover:bg-green-400">📞</div>
                            <div className="w-full h-full bg-blue-400 rounded-xl flex items-center justify-center text-2xl cursor-pointer hover:bg-blue-300">🌐</div>
                            <div className="w-full h-full bg-gray-700 rounded-xl flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-600">⚙️</div>
                        </div>
                    </div>

                    {/* Home Bar */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full cursor-pointer z-50 hover:bg-gray-300" onClick={handleBack}></div>
                </div>
            )}

            {/* Toggle Button (Floating Action Button) */}
            <button
                onClick={togglePhone}
                className="w-16 h-16 bg-gray-900 text-white rounded-full shadow-lg border-4 border-gray-700 flex items-center justify-center text-3xl hover:scale-105 transition-transform active:scale-95"
            >
                📱
            </button>
        </div>
    );
};
