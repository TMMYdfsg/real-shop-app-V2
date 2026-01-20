'use client';

import { useGame } from '@/context/GameContext';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TimeThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, gameState } = useGame();
    const [era, setEra] = useState<'present' | 'past' | 'future'>('present');

    // Time of day logic
    const isDay = gameState?.isDay ?? true;
    const timeRemaining = gameState?.timeRemaining || 0;

    // Determine detailed time based on game logic (assuming 3 min days for example, but using isDay flag)
    // If isDay is false -> Night
    // If isDay is true -> Check remaining time for Sunset (e.g. last 30 seconds of day)
    const isSunset = isDay && timeRemaining < 30000 && timeRemaining > 0;

    useEffect(() => {
        if (currentUser?.timeEra) {
            setEra(currentUser.timeEra);
        }
    }, [currentUser?.timeEra]);

    // Current Theme Variables based on Era > Time
    const themeStyles = useMemo(() => {
        if (era === 'past') return {
            background: '#f4e4bc',
            filter: 'sepia(0.4) contrast(1.1)',
            font: "'Courier New', Courier, monospace"
        };
        if (era === 'future') return {
            background: '#050510',
            color: '#00f0ff',
            font: "'Orbitron', sans-serif"
        };

        // Present Era - Time based
        if (!isDay) { // Night
            return {
                style: {
                    '--bg-primary': '#0f172a',
                    '--bg-secondary': '#1e293b',
                    '--text-primary': '#f1f5f9',
                    '--glass-bg': 'rgba(15, 23, 42, 0.7)',
                    '--glass-border': 'rgba(255, 255, 255, 0.1)',
                    '--accent-color': '#818cf8',
                    '--bg-gradient': 'linear-gradient(to bottom, #0f172a, #312e81)'
                } as React.CSSProperties,
                overlay: <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('/stars.png')] animate-pulse" /> // Placeholder for stars
            };
        }

        if (isSunset) { // Sunset
            return {
                style: {
                    '--bg-primary': '#fff7ed',
                    '--bg-secondary': '#ffedd5',
                    '--text-primary': '#431407',
                    '--glass-bg': 'rgba(255, 247, 237, 0.7)',
                    '--glass-border': 'rgba(255, 255, 255, 0.4)',
                    '--accent-color': '#f97316',
                    '--bg-gradient': 'linear-gradient(to bottom, #ffedd5, #fdba74, #f87171)'
                } as React.CSSProperties
            };
        }

        // Day (Default)
        return {
            style: {
                '--bg-primary': '#f8fafc',
                '--bg-secondary': '#e0f2fe',
                '--text-primary': '#1e293b',
                '--glass-bg': 'rgba(255, 255, 255, 0.7)',
                '--glass-border': 'rgba(255, 255, 255, 0.5)',
                '--accent-color': '#3b82f6',
                '--bg-gradient': 'linear-gradient(to bottom, #e0f2fe, #f0f9ff)'
            } as React.CSSProperties
        };

    }, [era, isDay, isSunset]);

    // Handle Past/Future via global styles or wrapper class
    if (era !== 'present') {
        // ... (Keeping existing Pas/Future Logic logic but simplifying)
        // For now, let's focus on the "Present" UI overhaul which is the main user request.
        // We will wrap the Past/Future logic similarly.
        // (Reusing the existing logic block for strict Era compliance)
        // ...
        // Actually, let's just return the new wrapper structure. 
        // If Past/Future, we apply overrides.
    }

    const currentStyle = (themeStyles as any).style || {};

    return (
        <div
            className="min-h-screen relative transition-colors duration-1000 ease-in-out font-sans"
            style={{
                background: currentStyle['--bg-gradient'] || themeStyles.background,
                color: themeStyles.color,
                fontFamily: themeStyles.font,
                ...currentStyle
            }}
        >
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {isDay && !isSunset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        {/* Clouds or subtle particles */}
                        <div className="absolute top-20 left-20 w-32 h-12 bg-white/20 blur-xl rounded-full animate-float" />
                        <div className="absolute top-40 right-40 w-48 h-16 bg-white/30 blur-xl rounded-full animate-float" style={{ animationDelay: '2s' }} />
                    </motion.div>
                )}
                {isSunset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent"
                    />
                )}
                {!isDay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0"
                    >
                        {/* Stars would go here, simulated with small dots */}
                        <div className="absolute top-10 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-20 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse-glow" style={{ animationDelay: '3s' }} />
                        <div className="absolute top-1/3 left-10 w-1 h-1 bg-white rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
                    </motion.div>
                )}
                {/* Era Overlays */}
                {era === 'past' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50 mix-blend-multiply" />}
                {era === 'future' && <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-50" />}
            </div>

            {/* Content Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Global Styles for dynamic variables */}
            <style jsx global>{`
                :root {
                    --accent-color: ${currentStyle['--accent-color'] || '#3b82f6'};
                    --glass-bg: ${currentStyle['--glass-bg'] || 'rgba(255, 255, 255, 0.7)'};
                    --glass-border: ${currentStyle['--glass-border'] || 'rgba(255, 255, 255, 0.5)'};
                }
            `}</style>
        </div>
    );
};
