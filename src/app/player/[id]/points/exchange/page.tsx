'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { PointExchangeItem } from '@/types';

type CategoryFilter = 'all' | 'fixed' | 'furniture' | 'pet' | 'recipe' | 'special';

// 固定アイテム（システム提供）
const FIXED_EXCHANGE_ITEMS = [
    {
        id: 'ex_golden_statue',
        name: '金の像',
        emoji: '🗿',
        description: '純金製の像。高く売れるかも？',
        price: 5000,
        costPoints: 500,
        type: 'furniture'
    },
    {
        id: 'ex_luxury_chair',
        name: '王様の椅子',
        emoji: '💺',
        description: '座り心地抜群の高級椅子。',
        price: 2000,
        costPoints: 200,
        type: 'furniture'
    },
    {
        id: 'ex_mystery_box',
        name: '謎の箱',
        emoji: '🎁',
        description: '中身は開けてからのお楽しみ？（ただの箱です）',
        price: 1000,
        costPoints: 100,
        type: 'furniture'
    },
    {
        id: 'ticket_ur',
        name: 'UR確定チケット',
        emoji: '🎟️',
        description: 'コレクションガチャでURが必ず出ます。',
        price: 0,
        costPoints: 10000,
        type: 'gacha_ticket'
    },
];

export default function PointsExchangePage() {
    const { gameState, currentUser } = useGame();
    const params = useParams();
    const playerId = params.id as string;

    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [showResult, setShowResult] = useState(false);

    if (!gameState || !currentUser || currentUser.id !== playerId) {
        return <div className="flex items-center justify-center min-h-screen">
            <p className="text-xl text-gray-600">Loading...</p>
        </div>;
    }

    const currentPoints = currentUser.catalogPoints || 0;
    const loyaltyPoints = currentUser.loyaltyPoints || 0;

    // ユーザー提供アイテムを集める
    const userProvidedItems: Array<PointExchangeItem & { ownerId: string; ownerName: string }> = [];
    gameState.users.forEach(user => {
        if (user.pointExchangeItems && user.pointExchangeItems.length > 0) {
            user.pointExchangeItems.forEach(item => {
                userProvidedItems.push({
                    ...item,
                    ownerId: user.id,
                    ownerName: user.shopName || user.name
                });
            });
        }
    });

    // フィルタリング
    const getFilteredItems = () => {
        if (selectedCategory === 'all') {
            return { fixed: FIXED_EXCHANGE_ITEMS, user: userProvidedItems };
        } else if (selectedCategory === 'fixed') {
            return { fixed: FIXED_EXCHANGE_ITEMS, user: [] };
        } else {
            return {
                fixed: [],
                user: userProvidedItems.filter(item => item.category === selectedCategory)
            };
        }
    };

    const { fixed: filteredFixedItems, user: filteredUserItems } = getFilteredItems();

    const categories = [
        { id: 'all' as const, name: 'すべて', emoji: '📦' },
        { id: 'fixed' as const, name: 'システム', emoji: '🏪' },
        { id: 'furniture' as const, name: '家具', emoji: '🛋️' },
        { id: 'pet' as const, name: 'ペット', emoji: '🐶' },
        { id: 'recipe' as const, name: 'レシピ', emoji: '📖' },
        { id: 'special' as const, name: '特別', emoji: '✨' }
    ];

    // 固定アイテム交換
    const handleFixedExchange = async (item: typeof FIXED_EXCHANGE_ITEMS[0]) => {
        if (currentPoints < item.costPoints) {
            alert('カタログポイントが足りません');
            return;
        }

        if (!confirm(`${item.name}を ${item.costPoints}pt で交換しますか？`)) return;

        setIsProcessing(true);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'exchange_points',
                    requesterId: currentUser.id,
                    details: JSON.stringify({
                        itemId: item.id,
                        pointsCost: item.costPoints,
                        itemType: item.type,
                        itemData: item
                    })
                })
            });

            if (res.ok) {
                setResultMessage(`${item.name} を手に入れました！\nマイショップの商品一覧に追加されました。`);
                setShowResult(true);
            } else {
                alert('交換に失敗しました');
            }
        } catch (error) {
            console.error(error);
            alert('通信エラーが発生しました');
        } finally {
            setIsProcessing(false);
        }
    };

    // ユーザー提供アイテム交換
    const handleUserExchange = async (item: PointExchangeItem & { ownerId: string }) => {
        if (loyaltyPoints < item.pointCost) {
            alert('ロイヤルティポイントが不足しています！');
            return;
        }

        if ((item.stock || 0) <= 0) {
            alert('在庫がありません！');
            return;
        }

        if (!confirm(`${item.pointCost}ポイントで「${item.name}」と交換しますか？`)) {
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch('/api/action', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'exchange_user_item',
                    requesterId: currentUser.id,
                    details: JSON.stringify({
                        itemId: item.id,
                        ownerId: item.ownerId
                    })
                })
            });

            if (response.ok) {
                setResultMessage(`「${item.name}」と交換しました！`);
                setShowResult(true);
            } else {
                alert('交換に失敗しました');
            }
        } catch (error) {
            console.error('Exchange error:', error);
            alert('エラーが発生しました');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold mb-2">💎 ポイント交換所</h2>
                <p className="text-gray-600">貯めたポイントでレア商品やユーザー提供アイテムをGET！</p>

                <div className="mt-4 flex gap-4 justify-center flex-wrap">
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md">
                        <div className="text-sm font-bold text-yellow-800">カタログポイント</div>
                        <div className="text-3xl font-black text-yellow-600">
                            {currentPoints.toLocaleString()} <span className="text-lg">pt</span>
                        </div>
                        <div className="text-xs text-yellow-700">システムアイテム用</div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-200 p-4 rounded-lg shadow-md">
                        <div className="text-sm font-bold text-indigo-800">ロイヤルティポイント</div>
                        <div className="text-3xl font-black text-indigo-600">
                            {loyaltyPoints.toLocaleString()} <span className="text-lg">pt</span>
                        </div>
                        <div className="text-xs text-indigo-700">ユーザーアイテム用</div>
                    </div>
                </div>
            </motion.div>

            {/* カテゴリーフィルター */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map(category => (
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
                    </motion.button>
                ))}
            </div>

            {/* システム提供アイテム */}
            {filteredFixedItems.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">🏪 システム提供アイテム</h3>
                    <div className="grid gap-4">
                        {filteredFixedItems.map((item) => (
                            <Card key={item.id} padding="md" className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="text-6xl filter drop-shadow-md">
                                    {item.emoji}
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="font-bold text-xl">{item.name}</h3>
                                    <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                                    <div className="text-xs text-green-600 font-bold">
                                        売値: {item.price.toLocaleString()}枚
                                    </div>
                                </div>
                                <div className="text-center min-w-[120px]">
                                    <div className="font-bold text-xl text-yellow-600 mb-2">
                                        {item.costPoints} pt
                                    </div>
                                    <Button
                                        onClick={() => handleFixedExchange(item)}
                                        disabled={isProcessing || currentPoints < item.costPoints}
                                        variant={currentPoints >= item.costPoints ? 'primary' : 'secondary'}
                                        fullWidth
                                    >
                                        {currentPoints >= item.costPoints ? '交換する' : 'ポイント不足'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ユーザー提供アイテム */}
            {filteredUserItems.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">👥 ユーザー提供アイテム</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUserItems.map((item, index) => {
                            const canAfford = loyaltyPoints >= item.pointCost;
                            const inStock = (item.stock || 0) > 0;

                            return (
                                <motion.div
                                    key={`${item.ownerId}-${item.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card padding="md" className={!inStock ? 'opacity-60' : ''}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-4xl">{item.emoji}</div>
                                            <div className={`text-xs px-2 py-1 rounded ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {inStock ? `在庫${item.stock}` : '在庫切れ'}
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                        <p className="text-xs text-gray-500 mb-2">
                                            提供: {item.ownerName}
                                        </p>

                                        {item.description && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg mb-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">必要ポイント</span>
                                                <span className="text-2xl font-bold text-indigo-600">
                                                    {item.pointCost}pt
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handleUserExchange(item)}
                                            disabled={!canAfford || !inStock || isProcessing}
                                            variant={canAfford && inStock ? 'primary' : 'secondary'}
                                            fullWidth
                                        >
                                            {!inStock ? '在庫切れ' : !canAfford ? 'ポイント不足' : '交換する'}
                                        </Button>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* アイテムがない場合 */}
            {filteredFixedItems.length === 0 && filteredUserItems.length === 0 && (
                <Card padding="lg">
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-xl text-gray-700 mb-2">
                            {selectedCategory === 'all' ? '交換アイテムがありません' : 'このカテゴリーにアイテムがありません'}
                        </p>
                        <p className="text-gray-500">
                            他のカテゴリーをチェックしてみましょう
                        </p>
                    </div>
                </Card>
            )}

            <Modal isOpen={showResult} onClose={() => { setShowResult(false); window.location.reload(); }} title="🎉 交換完了！">
                <div className="text-center py-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-6xl mb-4"
                    >
                        🎁
                    </motion.div>
                    <p className="text-lg whitespace-pre-wrap font-bold text-gray-800">
                        {resultMessage}
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => { setShowResult(false); window.location.reload(); }} fullWidth>OK</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
