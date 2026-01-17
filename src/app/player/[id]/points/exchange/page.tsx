'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { motion } from 'framer-motion';

// 交換可能なアイテム定義
const EXCHANGE_ITEMS = [
    {
        id: 'ex_golden_statue',
        name: '金の像',
        emoji: '🗿',
        description: '純金製の像。高く売れるかも？',
        price: 5000, // 売値
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
];

export default function PointsExchangePage() {
    const { gameState, currentUser } = useGame();
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [showResult, setShowResult] = useState(false);

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const currentPoints = currentUser.catalogPoints || 0;

    const handleExchange = async (item: typeof EXCHANGE_ITEMS[0]) => {
        if (currentPoints < item.costPoints) {
            alert('ポイントが足りません');
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

    return (
        <div className="pb-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold mb-2">💎 ポイント交換所</h2>
                <p className="text-gray-600">貯めたカタログポイントでレア商品をGET！</p>

                <div className="mt-4 bg-gradient-to-r from-yellow-100 to-yellow-200 p-4 rounded-lg inline-block shadow-md">
                    <div className="text-sm font-bold text-yellow-800">現在の所有ポイント</div>
                    <div className="text-4xl font-black text-yellow-600">
                        {currentPoints.toLocaleString()} <span className="text-xl">pt</span>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-4">
                {EXCHANGE_ITEMS.map((item) => (
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
                                onClick={() => handleExchange(item)}
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
