'use client';

import { useGame } from '@/context/GameContext';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TimeThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, gameState } = useGame();
    const [era, setEra] = useState<'present' | 'past' | 'future'>('present');
    const uiThemeRaw = currentUser?.smartphone?.settings?.uiTheme || 'default';
    const uiTheme = uiThemeRaw === 'nintendo'
        ? 'nintendo_switch'
        : uiThemeRaw === 'circus'
            ? 'digital_circus'
            : uiThemeRaw === 'lollipop'
                ? 'kawaii_lollipop'
                : uiThemeRaw;

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

    useEffect(() => {
        document.documentElement.setAttribute('data-era', era);
        return () => {
            document.documentElement.removeAttribute('data-era');
        };
    }, [era]);

    useEffect(() => {
        document.documentElement.setAttribute('data-ui-theme', uiTheme);
        return () => {
            document.documentElement.removeAttribute('data-ui-theme');
        };
    }, [uiTheme]);

    // 時代・時間に基づくテーマスタイル
    const themeStyles = useMemo(() => {
        if (era === 'past') return {
            style: {
                '--bg': '#f4e4bc',
                '--surface': '#fbf2d6',
                '--surface-2': '#f1e0b5',
                '--surface-3': '#e7d1a1',
                '--text': '#3b2f1f',
                '--text-muted': '#6b5b3e',
                '--border': '#d9c18f',
                '--border-strong': '#bfa979',
                '--primary': '#8b5e34',
                '--primary-2': '#b07a3f',
                '--primary-contrast': '#fff7e6',
                '--shadow': '67 40 24',
                '--glass-bg': 'rgba(244, 228, 188, 0.7)',
                '--glass-border': 'rgba(139, 94, 52, 0.3)'
            } as React.CSSProperties,
            background: '#f4e4bc',
            filter: 'sepia(0.4) contrast(1.1)',
            font: "'Courier New', Courier, monospace"
        };
        if (era === 'future') return {
            style: {
                '--bg': '#050510',
                '--surface': '#0b1026',
                '--surface-2': '#0f1b3d',
                '--surface-3': '#14224a',
                '--text': '#e0f7ff',
                '--text-muted': '#7dd3fc',
                '--border': '#1e3a5f',
                '--border-strong': '#38bdf8',
                '--primary': '#22d3ee',
                '--primary-2': '#a855f7',
                '--primary-contrast': '#020617',
                '--shadow': '2 8 23',
                '--glass-bg': 'rgba(8, 13, 33, 0.7)',
                '--glass-border': 'rgba(56, 189, 248, 0.2)'
            } as React.CSSProperties,
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

    const uiThemeStyles = useMemo(() => {
        switch (uiTheme) {
            case 'mario':
                return {
                    style: {
                        '--bg': '#6ecbff',
                        '--surface': '#ffffff',
                        '--surface-2': '#f2f8ff',
                        '--surface-3': '#e7f1ff',
                        '--text': '#1f2a44',
                        '--text-muted': '#4a5a7a',
                        '--border': '#cddaf0',
                        '--border-strong': '#9fb3d9',
                        '--primary': '#e53935',
                        '--primary-2': '#ffcc00',
                        '--primary-contrast': '#ffffff',
                        '--shadow': '24 48 96',
                        '--glass-bg': 'rgba(255, 255, 255, 0.85)',
                        '--glass-border': 'rgba(255, 255, 255, 0.55)'
                    } as React.CSSProperties,
                    background:
                        'linear-gradient(180deg, #6ecbff 0%, #aee7ff 60%, #7ed957 60%, #7ed957 100%),' +
                        'repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 14px, transparent 14px 28px)'
                };
            case 'nintendo_switch':
                return {
                    style: {
                        '--bg': '#f2f2f2',
                        '--surface': '#ffffff',
                        '--surface-2': '#ededed',
                        '--surface-3': '#e2e2e2',
                        '--text': '#222222',
                        '--text-muted': '#666666',
                        '--border': '#d0d0d0',
                        '--border-strong': '#b4b4b4',
                        '--primary': '#00b3ff',
                        '--primary-2': '#ff3b3b',
                        '--primary-contrast': '#ffffff',
                        '--shadow': '24 24 24',
                        '--glass-bg': 'rgba(255, 255, 255, 0.85)',
                        '--glass-border': 'rgba(0, 0, 0, 0.08)'
                    } as React.CSSProperties,
                    background:
                        'linear-gradient(135deg, #f5f5f5 0%, #e9ecef 100%),' +
                        'radial-gradient(circle at 20% 20%, rgba(0,179,255,0.15), transparent 45%),' +
                        'radial-gradient(circle at 80% 10%, rgba(255,59,59,0.18), transparent 40%)'
                };
            case 'minecraft':
                return {
                    style: {
                        '--bg': '#1f1f1f',
                        '--surface': '#2c2c2c',
                        '--surface-2': '#3b3b3b',
                        '--surface-3': '#4a4a4a',
                        '--text': '#f2f2f2',
                        '--text-muted': '#b9b9b9',
                        '--border': '#6b6b6b',
                        '--border-strong': '#8c8c8c',
                        '--primary': '#4caf50',
                        '--primary-2': '#2e7d32',
                        '--primary-contrast': '#0f0f0f',
                        '--shadow': '0 0 0',
                        '--glass-bg': 'rgba(44, 44, 44, 0.9)',
                        '--glass-border': 'rgba(255, 255, 255, 0.08)'
                    } as React.CSSProperties,
                    background:
                        'linear-gradient(180deg, #3b4f2f 0%, #3b4f2f 45%, #5b3a1f 45%, #5b3a1f 100%),' +
                        'repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 16px, transparent 16px 32px)'
                };
            case 'pokemon':
                return {
                    style: {
                        '--bg': '#fdf6f6',
                        '--surface': '#ffffff',
                        '--surface-2': '#ffecec',
                        '--surface-3': '#ffd5d5',
                        '--text': '#1a1a1a',
                        '--text-muted': '#6b6b6b',
                        '--border': '#e8bcbc',
                        '--border-strong': '#d58f8f',
                        '--primary': '#e53935',
                        '--primary-2': '#1e88e5',
                        '--primary-contrast': '#ffffff',
                        '--shadow': '34 24 24',
                        '--glass-bg': 'rgba(255, 255, 255, 0.88)',
                        '--glass-border': 'rgba(229, 57, 53, 0.2)'
                    } as React.CSSProperties,
                    background:
                        'radial-gradient(circle at 50% 20%, rgba(229,57,53,0.25), transparent 45%),' +
                        'linear-gradient(180deg, #ffffff 0%, #ffecec 60%, #ffefef 100%)'
                };
            case 'sumikko':
                return {
                    style: {
                        '--bg': '#fff7f0',
                        '--surface': '#fffdf7',
                        '--surface-2': '#f7efe6',
                        '--surface-3': '#efe3d6',
                        '--text': '#5b4a3a',
                        '--text-muted': '#907a66',
                        '--border': '#e3d2c1',
                        '--border-strong': '#d1bda8',
                        '--primary': '#f4a5c0',
                        '--primary-2': '#a7d8c9',
                        '--primary-contrast': '#5b4a3a',
                        '--shadow': '120 100 80',
                        '--glass-bg': 'rgba(255, 253, 247, 0.92)',
                        '--glass-border': 'rgba(244, 165, 192, 0.25)'
                    } as React.CSSProperties,
                    background:
                        'linear-gradient(135deg, #fff7f0 0%, #fce4ec 45%, #e8f5e9 100%),' +
                        'radial-gradient(circle at 10% 80%, rgba(255,255,255,0.6), transparent 40%)'
                };
            case 'digital_circus':
                return {
                    style: {
                        '--bg': '#1b0f1f',
                        '--surface': '#2b162f',
                        '--surface-2': '#3a1d3f',
                        '--surface-3': '#4a2451',
                        '--text': '#fdf3ff',
                        '--text-muted': '#c2a7cc',
                        '--border': '#5c2b66',
                        '--border-strong': '#7a3a86',
                        '--primary': '#ff3b3b',
                        '--primary-2': '#1e88e5',
                        '--primary-contrast': '#fff1f1',
                        '--shadow': '30 0 50',
                        '--glass-bg': 'rgba(39, 18, 46, 0.85)',
                        '--glass-border': 'rgba(255, 59, 59, 0.2)'
                    } as React.CSSProperties,
                    background:
                        'repeating-linear-gradient(90deg, rgba(255,59,59,0.25) 0 40px, rgba(30,136,229,0.25) 40px 80px),' +
                        'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.2), transparent 35%)'
                };
            case 'kawaii_lollipop':
                return {
                    style: {
                        '--bg': '#fff0fb',
                        '--surface': '#ffffff',
                        '--surface-2': '#ffe5f7',
                        '--surface-3': '#ffd0ef',
                        '--text': '#5a2d5f',
                        '--text-muted': '#a35d9b',
                        '--border': '#f5b2df',
                        '--border-strong': '#e68cc7',
                        '--primary': '#ff7eb6',
                        '--primary-2': '#6dd5ff',
                        '--primary-contrast': '#5a2d5f',
                        '--shadow': '120 50 120',
                        '--glass-bg': 'rgba(255, 255, 255, 0.9)',
                        '--glass-border': 'rgba(255, 126, 182, 0.25)'
                    } as React.CSSProperties,
                    background:
                        'linear-gradient(135deg, #ffd6f6 0%, #c6e7ff 100%),' +
                        'radial-gradient(circle at 85% 25%, rgba(255,255,255,0.6), transparent 40%)'
                };
            case 'labubu':
                return {
                    style: {
                        '--bg': '#f5f0e6',
                        '--surface': '#fff9f0',
                        '--surface-2': '#efe6d8',
                        '--surface-3': '#e4d6c4',
                        '--text': '#4b3b2b',
                        '--text-muted': '#7e6a54',
                        '--border': '#d6c4ac',
                        '--border-strong': '#c2ab92',
                        '--primary': '#8cc5a3',
                        '--primary-2': '#f4b183',
                        '--primary-contrast': '#3d2f1f',
                        '--shadow': '90 70 40',
                        '--glass-bg': 'rgba(255, 249, 240, 0.9)',
                        '--glass-border': 'rgba(140, 197, 163, 0.25)'
                    } as React.CSSProperties,
                    background:
                        'linear-gradient(135deg, #f5f0e6 0%, #e9f5e9 45%, #ffe3d1 100%),' +
                        'repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0 12px, transparent 12px 24px)'
                };
            case 'windows':
                return {
                    style: {
                        '--bg': '#0b3d91',
                        '--surface': '#f0f0f0',
                        '--surface-2': '#dcdcdc',
                        '--surface-3': '#c7c7c7',
                        '--text': '#1f2937',
                        '--text-muted': '#4b5563',
                        '--border': '#9aa3ad',
                        '--border-strong': '#7b8794',
                        '--primary': '#1d4ed8',
                        '--primary-2': '#2563eb',
                        '--primary-contrast': '#ffffff',
                        '--shadow': '0 0 0',
                        '--glass-bg': 'rgba(240, 240, 240, 0.95)',
                        '--glass-border': 'rgba(0, 0, 0, 0.12)'
                    } as React.CSSProperties,
                    background:
                        'linear-gradient(135deg, #0b3d91 0%, #1d4ed8 55%, #0f172a 100%)'
                };
            case 'animal_crossing':
                return {
                    style: {
                        '--bg': '#e9f7e1',
                        '--surface': '#fffdf4',
                        '--surface-2': '#f4f1e6',
                        '--surface-3': '#e6e0d3',
                        '--text': '#3f3a2c',
                        '--text-muted': '#7b705b',
                        '--border': '#d7cbb0',
                        '--border-strong': '#bfae88',
                        '--primary': '#6fbf73',
                        '--primary-2': '#f4c67a',
                        '--primary-contrast': '#3f3a2c',
                        '--shadow': '110 90 60',
                        '--glass-bg': 'rgba(255, 253, 244, 0.9)',
                        '--glass-border': 'rgba(111, 191, 115, 0.22)'
                    } as React.CSSProperties,
                    background:
                        'linear-gradient(180deg, #e9f7e1 0%, #d8f1c8 60%, #f6e6b5 100%)'
                };
            default:
                return null;
        }
    }, [uiTheme]);

    const currentStyle = { ...(themeStyles as any).style, ...(uiThemeStyles?.style || {}) } as React.CSSProperties;

    // テキスト色の決定（夜間は白、昼間は黒）
    const textColor = (themeStyles as any).color || (!isDay ? '#f1f5f9' : (isSunset ? '#431407' : '#1e293b'));

    return (
        <div
            className={`min-h-screen relative transition-colors duration-1000 ease-in-out font-sans ui-theme-${uiTheme}`}
            style={{
                background: (uiThemeStyles as any)?.background || currentStyle['--bg-gradient'] || themeStyles.background,
                color: textColor,
                fontFamily: uiTheme === 'minecraft'
                    ? "'Press Start 2P', 'Pixelify Sans', ui-monospace, monospace"
                    : (uiTheme === 'mario'
                        ? "'Press Start 2P', 'Changa One', ui-sans-serif"
                        : (uiTheme === 'nintendo'
                            ? "'Noto Sans JP', 'M PLUS 1p', ui-sans-serif"
                            : (uiTheme === 'pokemon'
                                ? "'Press Start 2P', 'Pixelify Sans', ui-monospace, monospace"
                                : (uiTheme === 'sumikko'
                                    ? "'M PLUS Rounded 1c', ui-sans-serif"
                                    : (uiTheme === 'circus'
                                        ? "'Rubik Glitch', 'Creepster', ui-sans-serif"
                                        : (uiTheme === 'lollipop'
                                            ? "'Cherry Bomb One', 'M PLUS Rounded 1c', ui-sans-serif"
                                            : (uiTheme === 'labubu'
                                                ? "'Coming Soon', 'Rock Salt', ui-sans-serif"
                                                : (uiTheme === 'windows'
                                                    ? "'Segoe UI', Tahoma, ui-sans-serif"
                                                    : (uiTheme === 'animal_crossing'
                                                        ? "'M PLUS Rounded 1c', ui-sans-serif"
                                                        : themeStyles.font))))))))),
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
