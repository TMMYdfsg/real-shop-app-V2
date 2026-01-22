'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useRealtime } from '@/hooks/useRealtime';
import { motion, AnimatePresence } from 'framer-motion';
import { AppHeader } from './AppHeader';

// News Item Type
interface NewsItem {
    id: string;
    type: 'land_sale' | 'disaster' | 'economy' | 'event' | 'achievement' | 'market' | 'system';
    title: string;
    content: string;
    timestamp: number;
    icon?: string;
    relatedUserId?: string;
    relatedUserName?: string;
}

// Tab Types
type NewsTab = 'all' | 'economy' | 'events' | 'players';

export default function NewsApp({ onClose }: { onClose: () => void }) {
    const { gameState, currentUser } = useGame();
    const [activeTab, setActiveTab] = useState<NewsTab>('all');

    // Fetch news from API
    const { data: newsData } = useRealtime<NewsItem[]>('/api/news', { interval: 5000 });

    // Generate mock news from game state if API returns nothing
    const generateLocalNews = (): NewsItem[] => {
        if (!gameState) return [];
        const news: NewsItem[] = [];
        const now = Date.now();

        // Recent transactions as news
        gameState.users.forEach(user => {
            user.transactions?.slice(-3).forEach((tx, i) => {
                if (tx.description?.includes('土地') || tx.description?.includes('購入')) {
                    news.push({
                        id: `tx-${user.id}-${i}`,
                        type: 'land_sale',
                        title: '🏠 不動産取引',
                        content: `${user.name} が新しい土地を購入しました`,
                        timestamp: now - (i * 60000),
                        relatedUserId: user.id,
                        relatedUserName: user.name
                    });
                }
            });
        });

        // Economy news
        if (gameState.economy) {
            news.push({
                id: 'economy-rate',
                type: 'economy',
                title: '📊 経済指標更新',
                content: `現在の金利: ${(gameState.economy.interestRate * 100).toFixed(1)}% / 物価指数: ${gameState.economy.priceIndex}`,
                timestamp: now - 120000,
                icon: '📈'
            });
        }

        // Active events
        gameState.activeEvents?.forEach((event, i) => {
            news.push({
                id: `event-${i}`,
                type: 'event',
                title: `🎉 ${event.name}`,
                content: event.description || 'イベント開催中！',
                timestamp: now - (i * 180000),
                icon: '🎊'
            });
        });

        // Weather as news
        const weather = gameState.environment?.weather;
        if (weather) {
            news.push({
                id: 'weather',
                type: 'system',
                title: '🌤️ 天気予報',
                content: `現在の天気: ${weather}`,
                timestamp: now - 300000,
                icon: weather === 'sunny' ? '☀️' : weather === 'rain' ? '🌧️' : '⛅'
            });
        }

        return news.sort((a, b) => b.timestamp - a.timestamp);
    };

    const allNews = newsData?.length ? newsData : generateLocalNews();

    // Filter news by tab
    const filteredNews = allNews.filter(item => {
        if (activeTab === 'all') return true;
        if (activeTab === 'economy') return item.type === 'economy' || item.type === 'market';
        if (activeTab === 'events') return item.type === 'event' || item.type === 'disaster';
        if (activeTab === 'players') return item.type === 'land_sale' || item.type === 'achievement';
        return true;
    });

    const getNewsColor = (type: NewsItem['type']) => {
        switch (type) {
            case 'land_sale': return 'border-l-green-500 bg-green-50';
            case 'disaster': return 'border-l-red-500 bg-red-50';
            case 'economy': return 'border-l-blue-500 bg-blue-50';
            case 'event': return 'border-l-purple-500 bg-purple-50';
            case 'achievement': return 'border-l-yellow-500 bg-yellow-50';
            case 'market': return 'border-l-indigo-500 bg-indigo-50';
            default: return 'border-l-gray-400 bg-gray-50';
        }
    };

    const tabs: { key: NewsTab; label: string; icon: string }[] = [
        { key: 'all', label: 'すべて', icon: '📰' },
        { key: 'economy', label: '経済', icon: '📈' },
        { key: 'events', label: 'イベント', icon: '🎉' },
        { key: 'players', label: 'プレイヤー', icon: '👥' },
    ];

    return (
        <div className="h-full bg-slate-100 flex flex-col font-sans">
            <AppHeader title="📰 ワールドニュース" onBack={onClose} />

            {/* Tabs */}
            <div className="bg-white border-b flex">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 text-xs font-bold flex flex-col items-center gap-1 transition-colors ${activeTab === tab.key
                            ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* News Feed */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <AnimatePresence>
                    {filteredNews.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden ${getNewsColor(item.type)}`}
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
                                    <span className="text-xs text-gray-400">
                                        {formatTimestamp(item.timestamp)}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.content}</p>
                                {item.relatedUserName && (
                                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                        <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">👤</span>
                                        {item.relatedUserName}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredNews.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <div className="text-4xl mb-2">📭</div>
                        ニュースがありません
                    </div>
                )}
            </div>

            {/* Breaking News Ticker (if urgent) */}
            {gameState?.activeEvents && gameState.activeEvents.length > 0 && (
                <div className="bg-red-600 text-white py-2 px-4 flex items-center gap-2 overflow-hidden">
                    <span className="font-black text-xs animate-pulse">🔴 LIVE</span>
                    <div className="overflow-hidden whitespace-nowrap">
                        <motion.div
                            animate={{ x: ['100%', '-100%'] }}
                            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                            className="font-bold text-sm"
                        >
                            {gameState.activeEvents.map(e => e.name).join(' ● ')}
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper
function formatTimestamp(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60000) return '今';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
    return new Date(ts).toLocaleDateString();
}
