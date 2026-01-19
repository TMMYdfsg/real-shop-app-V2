'use client';

import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CatalogPage({ params }: { params: { id: string } }) {
    const { gameState, sendRequest, currentUser } = useGame();
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'furniture' | 'appliance' | 'pet' | 'ingredient'>('all');
    const router = useRouter();

    if (!currentUser || currentUser.id !== params.id) {
        router.push(`/player/${params.id}`);
        return null;
    }

    const catalogItems = gameState?.catalogInventory || [];
    const filteredItems = selectedCategory === 'all'
        ? catalogItems
        : catalogItems.filter(item => item.category === selectedCategory);

    const handlePurchase = async (catalogItemId: string, cost: number) => {
        if (!confirm(`${cost}枚で購入しますか？`)) return;

        try {
            await sendRequest('buy_catalog_item', 0, catalogItemId);
            alert('購入しました！マイルームで確認できます。');
        } catch (error) {
            console.error(error);
            alert('購入に失敗しました');
        }
    };

    const categoryEmojis = {
        furniture: '🪑',
        appliance: '📺',
        pet: '🐕',
        ingredient: '🍎',
        other: '📦'
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-800 mb-2">🛒 仕入れカタログ</h1>
                    <p className="text-gray-600">家具・家電・ペットなどを購入して、マイルームに飾りましょう！</p>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'furniture', 'appliance', 'pet', 'ingredient'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat as any)}
                            className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${selectedCategory === cat
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {cat === 'all' ? '全て' : cat}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map(item => {
                        const cost = item.wholesalePrice || item.price;
                        const canAfford = (currentUser.balance || 0) >= cost;
                        const inStock = item.stock === undefined || item.stock > 0;

                        return (
                            <Card key={item.id} padding="md" className="hover:shadow-xl transition">
                                <div className="flex items-start gap-3">
                                    <div className="text-4xl">{item.emoji || categoryEmojis[item.category]}</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="text-xl font-bold text-indigo-600">{cost.toLocaleString()}枚</div>
                                            {item.stock !== undefined && (
                                                <div className="text-xs text-gray-500">在庫: {item.stock}</div>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full mt-3"
                                            onClick={() => handlePurchase(item.id, cost)}
                                            disabled={!canAfford || !inStock}
                                        >
                                            {!canAfford ? '残高不足' : !inStock ? '在庫なし' : '購入する'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        カタログアイテムがありません
                    </div>
                )}
            </div>
        </div>
    );
}
