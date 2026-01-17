'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { PointExchangeItem } from '@/types';

export default function ShopPointExchangePage({ params }: { params: Promise<{ id: string; shopId: string }> }) {
    const { id, shopId } = use(params);
    const router = useRouter();
    const { gameState, currentUser } = useGame();

    const [shopOwner, setShopOwner] = useState<any>(null);
    const [myPoints, setMyPoints] = useState(0);
    const [exchangeItems, setExchangeItems] = useState<PointExchangeItem[]>([]);

    // Result Modal
    const [resultMessage, setResultMessage] = useState('');
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        if (gameState && currentUser && shopId) {
            const owner = gameState.users.find(u => u.id === shopId);
            if (owner) {
                setShopOwner(owner);
                setExchangeItems(owner.pointExchangeItems || []);
            }

            const card = currentUser.pointCards?.find(c => c.shopOwnerId === shopId);
            setMyPoints(card ? card.points : 0);
        }
    }, [gameState, currentUser, shopId]);

    if (!currentUser || !shopOwner) return <div>Loading...</div>;

    const handleExchange = async (item: PointExchangeItem) => {
        if (myPoints < item.pointCost) {
            alert('ポイントが足りません');
            return;
        }

        if (item.stock !== undefined && item.stock <= 0) {
            alert('在庫切れです');
            return;
        }

        if (!confirm(`${item.name}を ${item.pointCost}pt で交換しますか？`)) return;

        try {
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'exchange_shop_item',
                    requesterId: currentUser.id,
                    details: JSON.stringify({
                        shopOwnerId: shopId,
                        itemId: item.id
                    })
                })
            });

            setResultMessage(`${item.name} を手に入れました！\n持ち物に追加されました。`);
            setShowResult(true);
        } catch (error) {
            console.error(error);
            alert('交換に失敗しました');
        }
    };

    return (
        <div className="pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" onClick={() => router.back()}>← 戻る</Button>
                    <h2 className="text-xl font-bold truncate">
                        {shopOwner.shopName || shopOwner.name} の交換所
                    </h2>
                </div>

                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-lg shadow-inner border border-yellow-300 flex justify-between items-center">
                    <div>
                        <div className="text-sm font-bold text-yellow-800">あなたの所持ポイント</div>
                        <div className="text-3xl font-black text-orange-600">
                            {myPoints} <span className="text-lg">pt</span>
                        </div>
                    </div>
                    <div className="text-4xl">🎫</div>
                </div>
            </motion.div>

            {/* Exchange Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exchangeItems.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        <div className="text-4xl mb-2">😢</div>
                        <p>現在交換できるアイテムはありません</p>
                    </div>
                ) : (
                    exchangeItems.map((item, index) => {
                        const canAfford = myPoints >= item.pointCost;
                        const inStock = item.stock === undefined || item.stock > 0;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card padding="md" className={!inStock ? 'opacity-60 bg-gray-100' : ''}>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-lg shadow-sm border text-5xl">
                                            {item.emoji}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg">{item.name}</h3>
                                                {item.stock !== undefined && (
                                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        残: {item.stock}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2 min-h-[2.5em]">
                                                {item.description}
                                            </p>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="font-bold text-orange-600 text-xl">
                                                    {item.pointCost} pt
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleExchange(item)}
                                                    disabled={!canAfford || !inStock}
                                                    variant={canAfford && inStock ? 'primary' : 'secondary'}
                                                >
                                                    {!inStock ? '品切れ' : !canAfford ? '不足' : '交換'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>

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
