'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AppHeader } from '../AppHeader';

export const FamilyApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser, gameState } = useGame();
    const [tab, setTab] = useState<'family' | 'matchmaking'>('family');
    const [candidates, setCandidates] = useState<any[]>([]); // NPC candidates
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

    const handleMatchmaking = async () => {
        setIsSearching(true);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'find_partner',
                    requesterId: currentUser?.id,
                    details: {}
                })
            });
            const data = await res.json();
            if (data.success && data.candidates) {
                setCandidates(data.candidates);
            } else {
                alert('パートナー候補が見つかりませんでした');
            }
        } catch (error) {
            console.error('Matchmaking error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handlePropose = async (candidateId: string) => {
        if (!currentUser) return;
        if (!confirm('本当にプロポーズしますか？\n結婚費用: 50,000枚')) return;

        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'marry_partner',
                    requesterId: currentUser.id,
                    details: { candidateId }
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('おめでとうございます！結婚しました！🎉');
                setTab('family');
                setCandidates([]);
                window.location.reload(); // Refresh to update family data
            } else {
                alert(data.error || 'プロポーズに失敗しました...');
            }
        } catch (error) {
            console.error('Proposal error:', error);
            alert('通信エラーが発生しました');
        }
    };

    if (!currentUser) return null;

    const family = currentUser.family || [];
    const hasSpouse = family.some(m => m.relation === 'spouse');

    return (
        <div className="h-full flex flex-col bg-pink-50 text-gray-900">
            <AppHeader title="Family" onBack={onBack} />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode='wait'>
                    {tab === 'family' ? (
                        <motion.div
                            key="family"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {family.length > 0 ? (
                                family.map((member: any) => (
                                    <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-pink-100 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">
                                            {member.relation === 'spouse' ? '💍' : '👶'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-800">{member.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {member.relation === 'spouse' ? '配偶者' : '子供'} ({member.age}歳)
                                            </div>
                                            <div className="text-xs text-pink-500 mt-1">
                                                親密度: {member.affection} ♥
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500 opacity-70">
                                    <div className="text-5xl mb-4">🏠</div>
                                    <p>まだ家族はいません</p>
                                    <p className="text-xs mt-2">マッチングアプリでパートナーを探してみましょう</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="matchmaking"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {!hasSpouse ? (
                                <>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-200 text-center">
                                        <h3 className="font-bold text-pink-600 text-lg mb-2">運命の人を探そう</h3>
                                        <p className="text-sm text-gray-600 mb-6">
                                            性格や年収、趣味の合うパートナーを見つけましょう。<br />
                                            結婚には資金が必要です。
                                        </p>
                                        <button
                                            onClick={handleMatchmaking}
                                            disabled={isSearching}
                                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition disabled:opacity-50"
                                        >
                                            {isSearching ? '検索中...' : '🔍 パートナーを探す (無料)'}
                                        </button>
                                    </div>

                                    {/* Candidates List */}
                                    <div className="space-y-4">
                                        {candidates.map(candidate => (
                                            <div key={candidate.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                                <div className="h-24 bg-gradient-to-r from-blue-100 to-pink-100 relative">
                                                    <div className="absolute -bottom-8 left-4 w-16 h-16 bg-white rounded-full p-1 shadow-md">
                                                        <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                                                            {candidate.gender === 'female' ? '👩' : '👨'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pt-10 px-4 pb-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-lg">{candidate.name}</h4>
                                                            <p className="text-sm text-gray-500">{candidate.age}歳 / {candidate.job}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-gray-400">年収</div>
                                                            <div className="font-bold text-green-600">{candidate.salary.toLocaleString()}枚</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {candidate.tags.map((tag: string) => (
                                                            <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => handlePropose(candidate.id)}
                                                        className="w-full bg-pink-50 text-pink-600 font-bold py-2 rounded-lg hover:bg-pink-100 transition border border-pink-200"
                                                    >
                                                        💍 プロポーズする (50,000枚)
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="text-4xl mb-2">💑</div>
                                    <h3 className="font-bold">既婚者です</h3>
                                    <p className="text-sm text-gray-500 mt-2">
                                        すでに素敵なパートナーがいます。<br />
                                        家族を大切にしましょう。
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
