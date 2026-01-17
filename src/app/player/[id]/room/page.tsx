'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { FURNITURE_ITEMS, PET_ITEMS } from '@/lib/gameData';

export default function RoomPage() {
    const { currentUser } = useGame();

    if (!currentUser) return <div>Loading...</div>;

    const furniture = currentUser.furniture || [];
    const pets = currentUser.pets || [];

    const totalHappiness = [
        ...furniture.map(id => FURNITURE_ITEMS.find(f => f.id === id)?.happinessBonus || 0),
        ...pets.map(id => PET_ITEMS.find(p => p.id === id)?.happinessBonus || 0)
    ].reduce((sum, val) => sum + val, 0);

    const handleBuyFurniture = async (itemId: string) => {
        const item = FURNITURE_ITEMS.find(f => f.id === itemId);
        if (!item) return;

        if (!confirm(`${item.name}を${item.price}枚で購入しますか？\n幸福度+${item.happinessBonus}`)) return;

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'buy_furniture',
                requesterId: currentUser.id,
                details: itemId
            })
        });
    };

    const handleBuyPet = async (petId: string) => {
        const pet = PET_ITEMS.find(p => p.id === petId);
        if (!pet) return;

        if (!confirm(`${pet.name}を${pet.price}枚で購入しますか？\n幸福度+${pet.happinessBonus}`)) return;

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'buy_pet',
                requesterId: currentUser.id,
                details: petId
            })
        });
    };

    return (
        <div className="pb-20">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mb-4"
            >
                🏠 マイルーム
            </motion.h2>

            {/* Happiness Summary */}
            <Card padding="md" className="mb-6 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="text-center">
                    <div className="text-sm text-gray-600">💖 幸福度ボーナス</div>
                    <div className="text-4xl font-bold text-purple-600">+{totalHappiness}</div>
                </div>
            </Card>

            {/* Owned Items */}
            <Card padding="md" className="mb-6">
                <h3 className="font-bold mb-3">🛋️ 所持家具</h3>
                {furniture.length === 0 ? (
                    <div className="text-gray-500 text-sm">家具がありません</div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {furniture.map(id => {
                            const item = FURNITURE_ITEMS.find(f => f.id === id);
                            if (!item) return null;
                            return (
                                <div key={id} className="bg-green-50 p-3 rounded text-center border-2 border-green-300">
                                    <div className="text-3xl">{item.emoji}</div>
                                    <div className="text-xs font-bold mt-1">{item.name}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            <Card padding="md" className="mb-6">
                <h3 className="font-bold mb-3">🐾 ペット</h3>
                {pets.length === 0 ? (
                    <div className="text-gray-500 text-sm">ペットがいません</div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {pets.map(id => {
                            const pet = PET_ITEMS.find(p => p.id === id);
                            if (!pet) return null;
                            return (
                                <div key={id} className="bg-blue-50 p-3 rounded text-center border-2 border-blue-300">
                                    <div className="text-3xl">{pet.emoji}</div>
                                    <div className="text-xs font-bold mt-1">{pet.name}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Shop - Furniture */}
            <Card padding="md" className="mb-6">
                <h3 className="font-bold mb-3">🛍️ 家具を買う</h3>
                <div className="space-y-2">
                    {FURNITURE_ITEMS.map(item => {
                        const owned = furniture.includes(item.id);
                        return (
                            <Card key={item.id} padding="sm" className={owned ? 'opacity-50' : ''}>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{item.emoji}</span>
                                    <div className="flex-1">
                                        <div className="font-bold">{item.name}</div>
                                        <div className="text-xs text-gray-600">幸福度+{item.happinessBonus}</div>
                                    </div>
                                    <div className="text-blue-600 font-bold">{item.price}枚</div>
                                    <Button
                                        size="sm"
                                        disabled={owned}
                                        onClick={() => handleBuyFurniture(item.id)}
                                    >
                                        {owned ? '所持済' : '購入'}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </Card>

            {/* Shop - Pets */}
            <Card padding="md">
                <h3 className="font-bold mb-3">🐾 ペットを飼う</h3>
                <div className="space-y-2">
                    {PET_ITEMS.map(pet => {
                        const owned = pets.includes(pet.id);
                        return (
                            <Card key={pet.id} padding="sm" className={owned ? 'opacity-50' : ''}>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{pet.emoji}</span>
                                    <div className="flex-1">
                                        <div className="font-bold">{pet.name}</div>
                                        <div className="text-xs text-gray-600">幸福度+{pet.happinessBonus}</div>
                                    </div>
                                    <div className="text-blue-600 font-bold">{pet.price}枚</div>
                                    <Button
                                        size="sm"
                                        disabled={owned}
                                        onClick={() => handleBuyPet(pet.id)}
                                    >
                                        {owned ? '飼育中' : '購入'}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
