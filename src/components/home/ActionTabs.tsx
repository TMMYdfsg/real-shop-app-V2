'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ActionTabsProps {
    userId: string;
    onOpenBank: () => void;
}

type TabKey = 'move' | 'manage' | 'life';

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'move', label: '移動', icon: '🗺️' },
    { key: 'manage', label: '経営・資産', icon: '💼' },
    { key: 'life', label: '生活・設定', icon: '🏠' },
];

export const ActionTabs = ({ userId, onOpenBank }: ActionTabsProps) => {
    const [activeTab, setActiveTab] = useState<TabKey>('move');

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-slate-200/60">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 text-sm font-bold flex flex-col items-center gap-1 transition-colors relative ${activeTab === tab.key ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <span className="text-xl">{tab.icon}</span>
                        {tab.label}
                        {activeTab === tab.key && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 min-h-[200px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-2 gap-3"
                    >
                        {activeTab === 'move' && (
                            <>
                                <Link href={`/player/${userId}/map`} className="col-span-2">
                                    <Button fullWidth className="h-14 text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                                        <span className="mr-2">🗺️</span> 街へ出る
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/commute`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold border-2">
                                        <span className="mr-2">🚃</span> 通勤
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/special`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold border-2">
                                        <span className="mr-2">🛠️</span> 仕事・バイト
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/casino`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold border-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200">
                                        <span className="mr-2">🎰</span> カジノ
                                    </Button>
                                </Link>
                            </>
                        )}

                        {activeTab === 'manage' && (
                            <>
                                <Button
                                    onClick={onOpenBank}
                                    fullWidth
                                    className="col-span-2 h-14 text-lg font-bold bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                                >
                                    <span className="mr-2">🏦</span> 銀行窓口
                                </Button>
                                <Link href={`/player/${userId}/shop`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold border-2">
                                        <span className="mr-2">🏪</span> マイショップ
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/items`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold border-2">
                                        <span className="mr-2">🎒</span> 持ち物
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/stock`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold border-2">
                                        <span className="mr-2">📈</span> 株取引
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/realestate`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold border-2">
                                        <span className="mr-2">🏠</span> 不動産
                                    </Button>
                                </Link>
                            </>
                        )}

                        {activeTab === 'life' && (
                            <>
                                <Link href={`/player/${userId}/smartphone`} className="col-span-2">
                                    <Button fullWidth className="h-12 font-bold bg-slate-800 text-white shadow-md hover:bg-slate-900">
                                        <span className="mr-2">📱</span> スマートフォン
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/room`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold border-2">
                                        <span className="mr-2">🛋️</span> マイルーム
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/collection`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold border-2">
                                        <span className="mr-2">📖</span> 図鑑・収集
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/points`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold border-2">
                                        <span className="mr-2">💳</span> ポイント
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/config`}>
                                    <Button fullWidth variant="secondary" className="h-12 font-bold">
                                        <span className="mr-2">⚙️</span> 設定
                                    </Button>
                                </Link>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
