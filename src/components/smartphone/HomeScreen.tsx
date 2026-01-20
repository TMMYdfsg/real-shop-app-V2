'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APPS, DOCK_APPS } from './constants';
import { useGame } from '@/context/GameContext';

interface HomeScreenProps {
    onOpenApp: (appId: string) => void;
}

// 天気アイコンマッピング
const weatherIcons: { [key: string]: string } = {
    sunny: '☀️',
    rain: '🌧️',
    heavy_rain: '⛈️',
    storm: '🌪️',
    snow: '❄️',
    heatwave: '🔥',
};

const weatherLabels: { [key: string]: string } = {
    sunny: '晴れ',
    rain: '雨',
    heavy_rain: '大雨',
    storm: '嵐',
    snow: '雪',
    heatwave: '猛暑',
};

export const HomeScreen = ({ onOpenApp }: HomeScreenProps) => {
    const { gameState, currentUser } = useGame();
    const [currentPage, setCurrentPage] = useState(0);

    // Filter out dock apps from main grid
    const gridApps = APPS.filter(app => !DOCK_APPS.includes(app.id));
    const dockApps = DOCK_APPS.map(id => APPS.find(a => a.id === id)).filter(Boolean) as typeof APPS;

    // ページング（アプリ8個ずつ）
    const appsPerPage = 8;
    const totalPages = Math.ceil(gridApps.length / appsPerPage);
    const currentApps = gridApps.slice(currentPage * appsPerPage, (currentPage + 1) * appsPerPage);

    // 環境情報
    const weather = gameState?.environment?.weather || 'sunny';
    const temperature = gameState?.environment?.temperature || 22;
    const season = gameState?.season || 'spring';

    // 通知情報（仮データ - 実際はAPIから取得）
    const unreadMessages = 3; // TODO: 実際のメッセージ数を取得
    const missedCalls = 1; // TODO: 実際の着信数を取得
    const balance = currentUser?.balance || 0;

    // 季節の背景グラデーション
    const seasonGradients: { [key: string]: string } = {
        spring: 'from-pink-400 via-rose-500 to-purple-600',
        summer: 'from-cyan-400 via-blue-500 to-indigo-600',
        autumn: 'from-orange-400 via-amber-500 to-red-600',
        winter: 'from-slate-400 via-blue-400 to-indigo-500',
    };

    return (
        <div className="w-full h-full pt-12 flex flex-col relative overflow-hidden">
            {/* Wallpaper - 季節対応 */}
            <div className={`absolute inset-0 bg-gradient-to-br ${seasonGradients[season] || seasonGradients.spring} z-0`} />
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

            {/* ウィジェットエリア (FiveM参考) */}
            <div className="relative z-10 mx-4 mt-2 space-y-3">

                {/* メインウィジェット: 時計 + 天気 */}
                <motion.div
                    className="bg-white/15 backdrop-blur-xl rounded-3xl p-4 border border-white/20 shadow-2xl"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex justify-between items-start">
                        {/* 時計 */}
                        <div className="text-white">
                            <div className="text-5xl font-extralight tracking-tight leading-none">
                                {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}
                            </div>
                            <div className="text-sm font-medium opacity-70 mt-1">
                                {new Date().toLocaleDateString('ja-JP', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        {/* 天気ウィジェット */}
                        <div className="text-right text-white">
                            <div className="text-4xl">{weatherIcons[weather] || '☀️'}</div>
                            <div className="text-2xl font-light">{temperature}°</div>
                            <div className="text-xs opacity-70">{weatherLabels[weather] || '晴れ'}</div>
                        </div>
                    </div>
                </motion.div>

                {/* サブウィジェット: 通知サマリー */}
                <motion.div
                    className="flex gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* 所持金 */}
                    <button
                        onClick={() => onOpenApp('bank')}
                        className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-3 border border-white/20 shadow-lg active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-2 text-white">
                            <span className="text-xl">💰</span>
                            <div className="text-left">
                                <div className="text-xs opacity-70">所持金</div>
                                <div className="font-bold text-sm">{balance.toLocaleString()}円</div>
                            </div>
                        </div>
                    </button>

                    {/* メッセージ通知 */}
                    <button
                        onClick={() => onOpenApp('message')}
                        className="bg-white/15 backdrop-blur-xl rounded-2xl p-3 border border-white/20 shadow-lg active:scale-95 transition-transform relative"
                    >
                        <div className="flex items-center gap-2 text-white">
                            <span className="text-xl">💬</span>
                            <div className="text-left">
                                <div className="text-xs opacity-70">メッセージ</div>
                                <div className="font-bold text-sm">{unreadMessages}件</div>
                            </div>
                        </div>
                        {unreadMessages > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg">
                                {unreadMessages}
                            </span>
                        )}
                    </button>

                    {/* 着信通知 */}
                    <button
                        onClick={() => onOpenApp('phone')}
                        className="bg-white/15 backdrop-blur-xl rounded-2xl p-3 border border-white/20 shadow-lg active:scale-95 transition-transform relative"
                    >
                        <div className="flex items-center gap-2 text-white">
                            <span className="text-xl">📞</span>
                            <div className="text-left">
                                <div className="text-xs opacity-70">着信</div>
                                <div className="font-bold text-sm">{missedCalls}件</div>
                            </div>
                        </div>
                        {missedCalls > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg">
                                {missedCalls}
                            </span>
                        )}
                    </button>
                </motion.div>
            </div>

            {/* App Grid - ページング対応 */}
            <div className="flex-1 relative z-10 mt-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        className="grid grid-cols-4 gap-x-3 gap-y-5 px-4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                    >
                        {currentApps.map((app, index) => (
                            <motion.div
                                key={app.id}
                                className="flex flex-col items-center gap-1 group"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <motion.button
                                    whileTap={{ scale: 0.85, rotateY: 10 }}
                                    whileHover={{ scale: 1.08, y: -3 }}
                                    onClick={() => onOpenApp(app.id)}
                                    className={`w-14 h-14 ${app.color} rounded-2xl flex items-center justify-center text-2xl shadow-xl border border-white/30 relative overflow-hidden`}
                                    style={{
                                        boxShadow: '0 8px 20px -5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                    }}
                                >
                                    {/* Glossy overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent h-1/2" />
                                    {/* Icon */}
                                    <span className="relative z-10">{app.icon}</span>
                                </motion.button>
                                <span className="text-[10px] font-semibold text-white drop-shadow-lg text-center leading-tight tracking-tight w-full truncate px-1">
                                    {app.name}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mb-28 z-10">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${i === currentPage
                                ? 'bg-white w-4'
                                : 'bg-white/40 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>

            {/* Dock */}
            <motion.div
                className="absolute bottom-4 left-3 right-3 h-20 bg-white/20 backdrop-blur-2xl rounded-[2rem] flex items-center justify-evenly px-2 z-20 border border-white/20 shadow-2xl"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
                {dockApps.map(app => (
                    <div key={app.id} className="relative group">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ y: -8, scale: 1.1 }}
                            onClick={() => onOpenApp(app.id)}
                            className={`w-14 h-14 ${app.color} rounded-2xl flex items-center justify-center text-2xl shadow-xl border border-white/30 relative overflow-hidden`}
                            style={{
                                boxShadow: '0 8px 20px -5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                            }}
                        >
                            {/* Glossy overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent h-1/2" />
                            <span className="relative z-10">{app.icon}</span>
                        </motion.button>
                        {/* Hover tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {app.name}
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
