import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Quest, QuestProgress } from '@/types';

// Hardcoded Quest Database for Display (Simulating Client-Side Knowledge or Fetched Data)
// In a real app, this might come from an API or shared constant
const QUEST_INFO: Record<string, Partial<Quest>> = {
    'quest_first_job': {
        title: 'はじめての仕事',
        description: '職安で仕事を見つけて就職しよう！',
        rewards: { money: 1000, xp: 50, popularity: 5 }
    },
    'quest_debt_free': {
        title: '借金完済',
        description: '借金を0にして自由を手に入れよう！',
        rewards: { money: 5000, xp: 100, popularity: 20 }
    }
};

interface QuestAppProps {
    onBack: () => void;
}

export const QuestApp: React.FC<QuestAppProps> = ({ onBack }) => {
    const { currentUser } = useGame();
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    // Filter quests
    const activeQuests = currentUser?.quests?.filter(q => q.status === 'active') || [];
    const completedQuests = currentUser?.quests?.filter(q => q.status === 'completed') || [];

    // Helper to get quest display info
    const getQuestInfo = (questId: string) => {
        return QUEST_INFO[questId] || { title: 'Unknown Quest', description: '???' };
    };

    return (
        <div className="h-full w-full bg-slate-900 text-white flex flex-col font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 pt-12 pb-4 shadow-md flex items-center justify-between shrink-0">
                <button onClick={onBack} className="text-white p-1 rounded-full hover:bg-white/20 transition">
                    <span className="text-xl">◀</span>
                </button>
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <span>⚔️</span> クエスト
                </h1>
                <div className="w-8"></div> {/* Spacer */}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 shrink-0">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'active' ? 'text-violet-300' : 'text-slate-400 hover:text-slate-300'}`}
                >
                    進行中 ({activeQuests.length})
                    {activeTab === 'active' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400" />}
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'completed' ? 'text-emerald-300' : 'text-slate-400 hover:text-slate-300'}`}
                >
                    達成済 ({completedQuests.length})
                    {activeTab === 'completed' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                <AnimatePresence mode="popLayout">
                    {activeTab === 'active' ? (
                        activeQuests.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center text-slate-500 mt-10"
                            >
                                <div className="text-4xl mb-2">💤</div>
                                現在進行中のクエストはありません
                            </motion.div>
                        ) : (
                            activeQuests.map((progress) => (
                                <QuestCard key={progress.questId} progress={progress} info={getQuestInfo(progress.questId)} isActive={true} />
                            ))
                        )
                    ) : (
                        completedQuests.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center text-slate-500 mt-10"
                            >
                                まだ達成したクエストはありません
                            </motion.div>
                        ) : (
                            completedQuests.map((progress) => (
                                <QuestCard key={progress.questId} progress={progress} info={getQuestInfo(progress.questId)} isActive={false} />
                            ))
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const QuestCard = ({ progress, info, isActive }: { progress: QuestProgress, info: Partial<Quest>, isActive: boolean }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                relative overflow-hidden rounded-xl border p-4
                ${isActive
                    ? 'bg-slate-800 border-white/10 shadow-lg'
                    : 'bg-emerald-900/20 border-emerald-500/30 shadow-inner opacity-80 grayscale-[0.3]'
                }
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold text-lg ${isActive ? 'text-white' : 'text-emerald-400'}`}>
                    {info.title}
                </h3>
                {!isActive && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">COMPLETED</span>}
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                {info.description}
            </p>

            {isActive && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{progress.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-violet-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Rewards */}
            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/5">
                <div className="text-xs text-slate-500 w-full mb-1">REWARDS</div>
                {info.rewards?.money && (
                    <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        💰 {info.rewards.money.toLocaleString()}
                    </span>
                )}
                {info.rewards?.xp && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        ✨ {info.rewards.xp} XP
                    </span>
                )}
                {info.rewards?.popularity && (
                    <span className="text-xs px-2 py-1 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        💖 +{info.rewards.popularity}
                    </span>
                )}
            </div>
        </motion.div>
    );
};
