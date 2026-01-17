'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { GACHA_ITEMS, CollectionItem } from '@/lib/gameData';

export default function CollectionPage() {
    const { gameState, currentUser } = useGame();

    // Gacha State
    const [isAnimating, setIsAnimating] = useState(false);
    const [resultItem, setResultItem] = useState<CollectionItem | null>(null);
    const [showResult, setShowResult] = useState(false);

    if (!currentUser) return <div>Loading...</div>;

    const userBalance = currentUser.balance || 0;
    const userCollection = currentUser.gachaCollection || [];

    // Categorize Items
    const categories = {
        insect: { name: '昆虫', emoji: '🐞' },
        fossil: { name: '化石', emoji: '🦖' },
        card: { name: 'カード', emoji: '🃏' },
        toy: { name: 'おもちゃ', emoji: '🤖' },
        treasure: { name: 'お宝', emoji: '💎' },
    };

    const handlePlayGacha = async () => {
        if (userBalance < 100) {
            alert('お金が足りません (1回100枚)');
            return;
        }

        setIsAnimating(true);

        try {
            // API Call
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'play_gacha',
                    requesterId: currentUser.id
                })
            });

            const data = await res.json();

            // Wait for animation (2s)
            setTimeout(() => {
                setIsAnimating(false);
                if (data.success && data.item) {
                    setResultItem(data.item);
                    setShowResult(true);
                } else {
                    alert('エラーが発生しました');
                }
            }, 2000);

        } catch (error) {
            console.error(error);
            setIsAnimating(false);
            alert('通信エラー');
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
            case 'epic': return 'text-purple-500 bg-purple-50 border-purple-200';
            case 'rare': return 'text-blue-500 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold mb-2">🎰 ガチャ & コレクション</h2>
                <p className="text-gray-600">1回 100枚でレアアイテムをゲットしよう！</p>
                <div className="mt-2 font-bold text-xl text-yellow-600">
                    所持金: {(userBalance || 0).toLocaleString()}枚
                </div>
            </motion.div>

            {/* Gacha Machine */}
            <Card padding="lg" className="mb-8 text-center bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                <div className="py-8 relative">
                    <AnimatePresence>
                        {isAnimating ? (
                            <motion.div
                                key="animating"
                                animate={{
                                    rotate: [0, -5, 5, -5, 5, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="text-8xl mb-4 inline-block"
                            >
                                🔮
                            </motion.div>
                        ) : (
                            <motion.div
                                key="static"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-8xl mb-4 inline-block transform hover:scale-110 transition-transform cursor-pointer"
                                onClick={handlePlayGacha}
                            >
                                🎰
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="max-w-xs mx-auto mt-4">
                        <Button
                            size="lg"
                            fullWidth
                            variant="primary"
                            onClick={handlePlayGacha}
                            disabled={isAnimating || userBalance < 100}
                            className="shadow-lg transform hover:translate-y-[-2px] transition-all"
                        >
                            {isAnimating ? 'ガチャガチャ中...' : 'ガチャを回す (100枚)'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Collection List */}
            <div className="space-y-6">
                {(Object.entries(categories) as [string, { name: string, emoji: string }][]).map(([type, info]) => {
                    const items = GACHA_ITEMS.filter(i => i.type === type);
                    if (items.length === 0) return null;

                    const ownedCount = items.filter(i => userCollection.includes(i.id)).length;
                    const totalCount = items.length;
                    const percentage = Math.floor((ownedCount / totalCount) * 100);

                    return (
                        <Card key={type} padding="md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <span>{info.emoji}</span>
                                    <span>{info.name}</span>
                                </h3>
                                <div className="text-sm font-bold text-gray-500">
                                    {ownedCount} / {totalCount} ({percentage}%)
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {items.map(item => {
                                    const isOwned = userCollection.includes(item.id);
                                    const rarityStyle = getRarityColor(item.rarity);

                                    return (
                                        <div
                                            key={item.id}
                                            className={`
                                                relative p-2 rounded-lg border-2 text-center transition-all
                                                ${isOwned ? rarityStyle : 'bg-gray-100 border-dashed border-gray-300 opacity-60'}
                                            `}
                                        >
                                            <div className="text-3xl mb-1 filter drop-shadow-sm">
                                                {isOwned ? item.emoji : '❓'}
                                            </div>
                                            <div className="text-xs font-bold truncate">
                                                {isOwned ? item.name : '???'}
                                            </div>
                                            {isOwned && item.rarity === 'legendary' && (
                                                <span className="absolute -top-2 -right-2 text-xs">✨</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Result Modal */}
            <Modal isOpen={showResult} onClose={() => setShowResult(false)} title="🎉 GET!!">
                {resultItem && (
                    <div className="text-center py-6">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 10 }}
                            className="mb-4 relative inline-block"
                        >
                            <span className="text-9xl filter drop-shadow-xl">{resultItem.emoji}</span>
                        </motion.div>

                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold mb-2"
                        >
                            {resultItem.name}
                        </motion.h3>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 border ${getRarityColor(resultItem.rarity)}`}
                        >
                            {resultItem.rarity.toUpperCase()}
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-gray-600 mb-8"
                        >
                            {resultItem.description}
                        </motion.p>

                        <Button fullWidth onClick={() => setShowResult(false)} size="lg">OK</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
