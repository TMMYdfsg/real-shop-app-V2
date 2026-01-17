'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { InventoryItem, ShopItem } from '@/types';
import { INGREDIENTS } from '@/lib/gameData';

export default function ItemsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { currentUser } = useGame();

    // Listing Modal State
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [listingPrice, setListingPrice] = useState(0);

    if (!currentUser) return <div>Loading...</div>;

    const inventory = currentUser.inventory || [];

    // Helper to get item details (name, emoji)
    // In a real app, you might have a master item database helper
    const getItemDetails = (item: InventoryItem) => {
        // Quick lookup in ingredients (extend as needed for other types)
        const ingredient = INGREDIENTS.find(i => i.id === item.itemId);
        if (ingredient) return { name: ingredient.name, emoji: ingredient.emoji, type: 'ingredient' };

        // Fallback for custom items or other types
        return { name: item.name || '不明なアイテム', emoji: '📦', type: 'unknown' };
    };

    const handleSellToShop = async () => {
        if (!currentUser || !selectedItem) return;

        if (listingPrice <= 0) {
            alert('価格を正しく入力してください');
            return;
        }

        // Convert InventoryItem to ShopItem format
        // Note: In a real implementation, you might want to remove it from inventory and add to shopMenu

        try {
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'list_item_in_shop', // You need to implement this action type in backend if not exists, or simulate it
                    requesterId: currentUser.id,
                    details: JSON.stringify({
                        inventoryItemId: selectedItem.id,
                        price: listingPrice,
                        itemId: selectedItem.itemId,
                        name: selectedItem.name,
                        quantity: 1 // Default to 1 for simpliciy or selectedItem.quantity
                    })
                })
            });

            setIsListingModalOpen(false);
            setSelectedItem(null);
            setListingPrice(0);
            alert('出品しました！');
            // Refresh game state ideally
        } catch (error) {
            console.error(error);
            alert('出品に失敗しました');
        }
    };

    return (
        <div className="pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => router.back()}>← 戻る</Button>
                <h2 className="text-2xl font-bold">🎒 持ち物・出品</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inventory List */}
                <div className="md:col-span-2">
                    <Card padding="md">
                        <h3 className="font-bold mb-4 border-b pb-2">📦 アイテム一覧</h3>

                        {inventory.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                持ち物はありません
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {inventory.map((item) => {
                                    const details = getItemDetails(item);
                                    return (
                                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">{details.emoji}</div>
                                                <div>
                                                    <div className="font-bold">{details.name}</div>
                                                    <div className="text-xs text-gray-500">所持数: {item.quantity}</div>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setListingPrice(Math.round(100)); // Default price
                                                    setIsListingModalOpen(true);
                                                }}
                                            >
                                                🏪 店に出す
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Listing Modal */}
            <Modal isOpen={isListingModalOpen} onClose={() => setIsListingModalOpen(false)} title="🏪 お店に出品する">
                {selectedItem && (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded text-center">
                            <div className="text-4xl mb-2">{getItemDetails(selectedItem).emoji}</div>
                            <div className="font-bold">{getItemDetails(selectedItem).name}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">販売価格 (1個あたり)</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded text-lg font-bold"
                                value={listingPrice}
                                onChange={(e) => setListingPrice(Number(e.target.value))}
                            />
                        </div>

                        <div className="text-sm text-gray-500">
                            ※ 出品すると「持ち物」から「ショップ在庫」へ移動します。
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button fullWidth onClick={handleSellToShop}>出品する</Button>
                            <Button fullWidth variant="ghost" onClick={() => setIsListingModalOpen(false)}>キャンセル</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
