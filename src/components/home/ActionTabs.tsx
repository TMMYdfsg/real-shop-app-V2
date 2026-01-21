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
        <div className="bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 overflow-hidden shadow-xl">
            {/* Tab Headers */}
            <div className="flex border-b border-white/5 bg-slate-900/20">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-4 text-sm font-bold flex flex-col items-center gap-1.5 transition-all relative ${activeTab === tab.key ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                    >
                        <span className="text-xl filter drop-shadow-md">{tab.icon}</span>
                        <span className="tracking-wide text-[11px]">{tab.label}</span>
                        {activeTab === tab.key && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
                            />
                        )}
                        {activeTab === tab.key && (
                            <div className="absolute inset-0 bg-indigo-500/5" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-5 min-h-[220px]">
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
                                    <Button fullWidth className="h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 border border-white/10 rounded-xl">
                                        <span className="mr-2">🗺️</span> 街へ出る
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/commute`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 rounded-xl">
                                        <span className="mr-2">🚃</span> 通勤
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/special`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 rounded-xl">
                                        <span className="mr-2">🛠️</span> 仕事・バイト
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/casino`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold bg-purple-900/20 border-purple-500/30 text-purple-300 hover:bg-purple-900/30 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.1)]">
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
                                    className="col-span-2 h-14 text-lg font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 rounded-xl border border-white/10"
                                >
                                    <span className="mr-2">🏦</span> 銀行窓口
                                </Button>
                                <Link href={`/player/${userId}/shop`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 rounded-xl">
                                        <span className="mr-2">🏪</span> マイショップ
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/items`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 rounded-xl">
                                        <span className="mr-2">🎒</span> 持ち物
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/stock`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 rounded-xl">
                                        <span className="mr-2">📈</span> 株取引
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/realestate`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 rounded-xl">
                                        <span className="mr-2">🏠</span> 不動産
                                    </Button>
                                </Link>
                            </>
                        )}

                        {activeTab === 'life' && (
                            <>
                                <Link href={`/player/${userId}/smartphone`} className="col-span-2">
                                    <Button fullWidth className="h-14 font-bold bg-slate-800 text-white shadow-lg shadow-black/30 hover:bg-slate-700 rounded-xl border border-slate-700">
                                        <span className="mr-2">📱</span> スマートフォン
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/room`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 rounded-xl">
                                        <span className="mr-2">🛋️</span> マイルーム
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/collection`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 rounded-xl">
                                        <span className="mr-2">📖</span> 図鑑・収集
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/points`}>
                                    <Button fullWidth variant="outline" className="h-12 font-bold bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 rounded-xl">
                                        <span className="mr-2">💳</span> ポイント
                                    </Button>
                                </Link>
                                <Link href={`/player/${userId}/config`}>
                                    <Button fullWidth variant="secondary" className="h-12 font-bold bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl border border-white/5">
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
