'use client';

import { useGame } from '@/context/GameContext';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TimeThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, gameState } = useGame();
    const [era, setEra] = useState<'present' | 'past' | 'future'>('present');

    // 時間帯ロジック
    const isDay = gameState?.isDay ?? true;
    const timeRemaining = gameState?.timeRemaining || 0;

    // 夕焼け判定（昼の最後30秒）
    const isSunset = isDay && timeRemaining < 30000 && timeRemaining > 0;

    // HTMLのdata-theme属性を設定（CSSカスタムプロパティを切替）
    useEffect(() => {
        const theme = isDay ? (isSunset ? 'sunset' : 'day') : 'night';
        document.documentElement.setAttribute('data-theme', theme);

        // クリーンアップ
        return () => {
            document.documentElement.removeAttribute('data-theme');
        };
    }, [isDay, isSunset]);

    useEffect(() => {
        if (currentUser?.timeEra) {
            setEra(currentUser.timeEra);
        }
    }, [currentUser?.timeEra]);

    // 時代・時間に基づくテーマスタイル
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

        // 現代 - 時間ベース
        if (!isDay) { // 夜間
            return {
                style: {
                    '--bg-primary': '#0f172a',
                    '--bg-secondary': '#1e293b',
                    '--text-primary': '#f1f5f9',
                    '--text-secondary': '#94a3b8',
                    '--glass-bg': 'rgba(15, 23, 42, 0.7)',
                    '--glass-border': 'rgba(255, 255, 255, 0.1)',
                    '--accent-color': '#818cf8',
                    '--bg-gradient': 'linear-gradient(to bottom, #0f172a, #312e81)'
                } as React.CSSProperties,
                overlay: <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('/stars.png')] animate-pulse" />
            };
        }

        if (isSunset) { // 夕焼け
            return {
                style: {
                    '--bg-primary': '#fff7ed',
                    '--bg-secondary': '#ffedd5',
                    '--text-primary': '#431407',
                    '--text-secondary': '#92400e',
                    '--glass-bg': 'rgba(255, 247, 237, 0.7)',
                    '--glass-border': 'rgba(255, 255, 255, 0.4)',
                    '--accent-color': '#f97316',
                    '--bg-gradient': 'linear-gradient(to bottom, #ffedd5, #fdba74, #f87171)'
                } as React.CSSProperties
            };
        }

        // 昼間（デフォルト）
        return {
            style: {
                '--bg-primary': '#f8fafc',
                '--bg-secondary': '#e0f2fe',
                '--text-primary': '#1e293b',
                '--text-secondary': '#64748b',
                '--glass-bg': 'rgba(255, 255, 255, 0.7)',
                '--glass-border': 'rgba(255, 255, 255, 0.5)',
                '--accent-color': '#3b82f6',
                '--bg-gradient': 'linear-gradient(to bottom, #e0f2fe, #f0f9ff)'
            } as React.CSSProperties
        };

    }, [era, isDay, isSunset]);

    const currentStyle = (themeStyles as any).style || {};

    // テキスト色の決定（夜間は白、昼間は黒）
    const textColor = !isDay ? '#f1f5f9' : (isSunset ? '#431407' : '#1e293b');

    return (
        <div
            className="min-h-screen relative transition-colors duration-1000 ease-in-out font-sans"
            style={{
                background: currentStyle['--bg-gradient'] || themeStyles.background,
                color: textColor,
                fontFamily: themeStyles.font,
                ...currentStyle
            }}
        >
            {/* 動的背景エフェクト */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {isDay && !isSunset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        {/* 雲のエフェクト */}
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
                        {/* 星のエフェクト */}
                        <div className="absolute top-10 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-20 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse-glow" style={{ animationDelay: '3s' }} />
                        <div className="absolute top-1/3 left-10 w-1 h-1 bg-white rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
                    </motion.div>
                )}
                {/* 時代オーバーレイ */}
                {era === 'past' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50 mix-blend-multiply" />}
                {era === 'future' && <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-50" />}
            </div>

            {/* コンテンツ */}
            <div className="relative z-10">
                {children}
            </div>

            {/* グローバル動的CSS変数 */}
            <style jsx global>{`
                :root {
                    --accent-color: ${currentStyle['--accent-color'] || '#3b82f6'};
                    --glass-bg: ${currentStyle['--glass-bg'] || 'rgba(255, 255, 255, 0.7)'};
                    --glass-border: ${currentStyle['--glass-border'] || 'rgba(255, 255, 255, 0.5)'};
                    --text-primary: ${currentStyle['--text-primary'] || '#1e293b'};
                    --text-secondary: ${currentStyle['--text-secondary'] || '#64748b'};
                }
            `}</style>
        </div>
    );
};
