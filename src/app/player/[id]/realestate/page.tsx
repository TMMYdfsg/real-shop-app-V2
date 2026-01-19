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

    // @ts-ignore
    const lands = gameState.lands || [];
    // @ts-ignore
    const properties = gameState.properties || [];

    const [activeTab, setActiveTab] = React.useState<'lands' | 'properties'>('lands');

    return (
        <div className="pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    🏠 不動産センター
                </h2>

                <div className="flex gap-4 border-b border-gray-200 pb-2 mb-4">
                    <button
                        onClick={() => setActiveTab('lands')}
                        className={`px-4 py-2 font-semibold ${activeTab === 'lands' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        土地 ({lands.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('properties')}
                        className={`px-4 py-2 font-semibold ${activeTab === 'properties' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        物件 ({properties.length})
                    </button>
                </div>

                {activeTab === 'lands' && (
                    <div className="space-y-4">
                        {lands.map((land: any) => {
                            const isOwned = !!land.ownerId;
                            const isMyProperty = land.ownerId === currentUser.id;
                            const ownerName = isOwned
                                ? gameState.users.find(u => u.id === land.ownerId)?.name
                                : '販売中';

                            // 土地購入は city_buy_land アクション
                            const handleLandBuy = async () => {
                                if (!confirm(`${land.address} を購入しますか？`)) return;
                                await fetch('/api/action', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        type: 'city_buy_land',
                                        requesterId: currentUser.id,
                                        details: land.id
                                    })
                                });
                            };

                            return (
                                <Card key={land.id} padding="md" className={`border-l-4 ${isMyProperty ? 'border-green-500' : isOwned ? 'border-red-500' : 'border-blue-500'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold">{land.address}</h3>
                                            <div className="text-sm text-gray-500">{land.zoning} / {land.size}m²</div>
                                        </div>
                                        {isMyProperty ? (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">所有済</span>
                                        ) : isOwned ? (
                                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">売切れ</span>
                                        ) : (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">販売中</span>
                                        )}
                                    </div>

                                    <div className="text-sm mb-4 bg-gray-50 p-3 rounded">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">価格</span>
                                            <span className="font-bold text-lg">{land.price.toLocaleString()}枚</span>
                                        </div>
                                    </div>

                                    {!isOwned && (
                                        <Button
                                            fullWidth
                                            variant="primary"
                                            disabled={currentUser.balance < land.price}
                                            onClick={handleLandBuy}
                                        >
                                            購入する
                                        </Button>
                                    )}
                                    {isOwned && !isMyProperty && (
                                        <div className="text-right text-sm text-gray-500">
                                            所有者: {ownerName}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                        {lands.length === 0 && <div className="text-gray-500">販売中の土地はありません。</div>}
                    </div>
                )}

                {activeTab === 'properties' && (
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
                        {properties.length === 0 && <div className="text-gray-500">販売中の物件はありません。</div>}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
