'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

type CollectionCategory = 'furniture' | 'pets' | 'recipes' | 'insects' | 'fossils' | 'cards' | 'all';

export default function CollectionPage() {
    const { gameState } = useGame();
    const params = useParams();
    const playerId = params.id as string;
    const [selectedCategory, setSelectedCategory] = useState<CollectionCategory>('all');

    const player = gameState?.users.find(u => u.id === playerId);

    if (!player) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl text-gray-600">プレイヤーが見つかりません</p>
            </div>
        );
    }

    // コレクションデータ（仮のサンプルデータ）
    const collections = {
        furniture: player.furniture || [],
        pets: player.pets || [],
        recipes: [], // TODO: レシピシステム実装時に追加
        insects: [], // TODO: 昆虫採集システム実装時に追加
        fossils: [], // TODO: 化石発掘システム実装時に追加
        cards: player.gachaCollection || []
    };

    const categories = [
        { id: 'all' as const, name: 'すべて', emoji: '📦', count: Object.values(collections).flat().length },
        { id: 'furniture' as const, name: '家具', emoji: '🛋️', count: collections.furniture.length },
        { id: 'pets' as const, name: 'ペット', emoji: '🐶', count: collections.pets.length },
        { id: 'recipes' as const, name: 'レシピ', emoji: '📖', count: collections.recipes.length },
        { id: 'insects' as const, name: '昆虫', emoji: '🦋', count: collections.insects.length },
        { id: 'fossils' as const, name: '化石', emoji: '🦴', count: collections.fossils.length },
        { id: 'cards' as const, name: 'カード', emoji: '🎴', count: collections.cards.length }
    ];

    const getDisplayItems = () => {
        if (selectedCategory === 'all') {
            return [
                ...collections.furniture.map(id => ({ id, type: 'furniture', emoji: '🛋️', name: `家具 #${id}` })),
                ...collections.pets.map(id => ({ id, type: 'pets', emoji: '🐶', name: `ペット #${id}` })),
                ...collections.cards.map(id => ({ id, type: 'cards', emoji: '🎴', name: `カード #${id}` }))
            ];
        } else {
            return collections[selectedCategory].map(id => ({
                id,
                type: selectedCategory,
                emoji: categories.find(c => c.id === selectedCategory)?.emoji || '📦',
                name: `${categories.find(c => c.id === selectedCategory)?.name} #${id}`
            }));
        }
    };

    const displayItems = getDisplayItems();

    return (
        <div className="pb-20">
            {/* ヘッダー */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">🏆 コレクション</h1>
                <p className="text-gray-600">
                    集めたアイテムを確認できます
                </p>
            </div>

            {/* 統計カード */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card padding="md">
                    <div className="text-center">
                        <div className="text-3xl mb-2">📦</div>
                        <div className="text-2xl font-bold text-indigo-600">
                            {Object.values(collections).flat().length}
                        </div>
                        <div className="text-sm text-gray-600">総アイテム数</div>
                    </div>
                </Card>
                <Card padding="md">
                    <div className="text-center">
                        <div className="text-3xl mb-2">🎯</div>
                        <div className="text-2xl font-bold text-green-600">
                            {Object.values(collections).filter(arr => arr.length > 0).length}
                        </div>
                        <div className="text-sm text-gray-600">コンプリート</div>
                    </div>
                </Card>
                <Card padding="md">
                    <div className="text-center">
                        <div className="text-3xl mb-2">⭐</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {collections.cards.length}
                        </div>
                        <div className="text-sm text-gray-600">レアカード</div>
                    </div>
                </Card>
                <Card padding="md">
                    <div className="text-center">
                        <div className="text-3xl mb-2">🏅</div>
                        <div className="text-2xl font-bold text-orange-600">
                            {Math.floor(Object.values(collections).flat().length / 5)}
                        </div>
                        <div className="text-sm text-gray-600">達成度</div>
                    </div>
                </Card>
            </div>

            {/* カテゴリータブ */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all
                            ${selectedCategory === category.id
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }
                        `}
                    >
                        <span className="text-xl">{category.emoji}</span>
                        <span>{category.name}</span>
                        <span className={`
                            text-xs px-2 py-0.5 rounded-full
                            ${selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}
                        `}>
                            {category.count}
                        </span>
                    </motion.button>
                ))}
            </div>

            {/* コレクション表示 */}
            <Card padding="md">
                <AnimatePresence mode="wait">
                    {displayItems.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-16"
                        >
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-xl font-semibold text-gray-700 mb-2">
                                まだアイテムがありません
                            </p>
                            <p className="text-gray-500">
                                {selectedCategory === 'all'
                                    ? 'アイテムを集めて、コレクションを充実させましょう！'
                                    : `${categories.find(c => c.id === selectedCategory)?.name}を集めましょう！`}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`items-${selectedCategory}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        >
                            {displayItems.map((item, index) => (
                                <motion.div
                                    key={`${item.type}-${item.id}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200"
                                >
                                    <div className="text-5xl text-center mb-3">
                                        {item.emoji}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                            {item.name}
                                        </h3>
                                        <div className="text-xs text-gray-500">
                                            ID: {item.id.substring(0, 8)}...
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* フッター統計 */}
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>
                    現在 <span className="font-bold text-indigo-600">{displayItems.length}</span> 個のアイテムを表示中
                </p>
            </div>
        </div>
    );
}
