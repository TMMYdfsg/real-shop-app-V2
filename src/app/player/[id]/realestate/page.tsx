'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function RealEstatePage() {
    const { gameState, currentUser } = useGame();

    const handleBuy = async (propertyId: string) => {
        if (!confirm('この不動産を購入しますか？')) return;

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'buy_property',
                requesterId: currentUser?.id,
                details: propertyId
            })
        });
    };

    if (!gameState || !currentUser) return <div>Loading...</div>;

    // GameState type definition update should allow properties access
    // @ts-ignore // Ignore if type update hasn't propagated fully in IDE cache
    const properties = gameState.properties || [];

    return (
        <div className="pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    🏠 不動産センター
                </h2>

                <div className="space-y-4">
                    {properties.map((prop: any) => { // Use any temporarily if type issue persists
                        const isOwned = !!prop.ownerId;
                        const isMyProperty = prop.ownerId === currentUser.id;
                        const ownerName = isOwned
                            ? gameState.users.find(u => u.id === prop.ownerId)?.name
                            : '販売中';

                        return (
                            <Card key={prop.id} padding="md" className={`border-l-4 ${isMyProperty ? 'border-green-500' : isOwned ? 'border-red-500' : 'border-blue-500'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold">{prop.name}</h3>
                                        <div className="text-sm text-gray-500">{prop.type}</div>
                                    </div>
                                    {isMyProperty ? (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">所有済</span>
                                    ) : isOwned ? (
                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">売切れ</span>
                                    ) : (
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">販売中</span>
                                    )}
                                </div>

                                <p className="text-sm mb-4 text-gray-600">{prop.description}</p>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-gray-50 p-3 rounded">
                                    <div>
                                        <span className="block text-gray-500 text-xs">価格</span>
                                        <span className="font-bold text-lg">{prop.price.toLocaleString()}枚</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs">収支/ターン</span>
                                        <span className={`font-bold text-lg ${prop.income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {prop.income >= 0 ? '+' : ''}{prop.income.toLocaleString()}枚
                                        </span>
                                    </div>
                                </div>

                                {!isOwned && (
                                    <Button
                                        fullWidth
                                        variant="primary"
                                        disabled={currentUser.balance < prop.price}
                                        onClick={() => handleBuy(prop.id)}
                                    >
                                        購入する ({prop.price.toLocaleString()}枚)
                                    </Button>
                                )}
                                {isOwned && !isMyProperty && (
                                    <div className="text-right text-sm text-gray-500">
                                        オーナー: {ownerName}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
