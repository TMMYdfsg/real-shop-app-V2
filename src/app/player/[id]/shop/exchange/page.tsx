'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PointExchangeItem } from '@/types';

export default function ShopExchangeManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { currentUser } = useGame();

    // Local state for editing
    const [exchangeItems, setExchangeItems] = useState<PointExchangeItem[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState<Partial<PointExchangeItem>>({
        name: '',
        pointCost: 100,
        emoji: '🎁',
        description: '',
        stock: 5,
        category: 'special'
    });

    useEffect(() => {
        if (currentUser && currentUser.pointExchangeItems) {
            setExchangeItems(currentUser.pointExchangeItems);
        }
    }, [currentUser]);

    if (!currentUser) return <div>Loading...</div>;

    const handleSave = async () => {
        try {
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'update_point_exchange_items',
                    requesterId: currentUser.id,
                    details: JSON.stringify({
                        items: exchangeItems
                    })
                })
            });
            alert('設定を保存しました');
            router.back();
        } catch (error) {
            console.error(error);
            alert('保存に失敗しました');
        }
    };

    const handleAddItem = () => {
        if (!newItem.name || !newItem.pointCost) {
            alert('必須項目を入力してください');
            return;
        }

        const item: PointExchangeItem = {
            id: crypto.randomUUID(),
            shopOwnerId: currentUser.id,
            name: newItem.name || '名称未設定',
            pointCost: Number(newItem.pointCost),
            emoji: newItem.emoji || '🎁',
            description: newItem.description || '',
            stock: Number(newItem.stock) || 0,
            category: (newItem.category as any) || 'special',
            exchangedCount: 0
        };

        setExchangeItems([...exchangeItems, item]);
        setIsModalOpen(false);
        setNewItem({
            name: '',
            pointCost: 100,
            emoji: '🎁',
            description: '',
            stock: 5,
            category: 'special'
        });
    };

    const handleDeleteItem = (itemId: string) => {
        if (confirm('このアイテムを削除してもよろしいですか？')) {
            setExchangeItems(exchangeItems.filter(i => i.id !== itemId));
        }
    };

    return (
        <div className="pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => router.back()}>← 戻る</Button>
                <h2 className="text-2xl font-bold">🎁 ポイント交換所設定</h2>
            </div>

            <Card padding="md" className="mb-6 bg-yellow-50 border-yellow-200 border-2">
                <p className="text-sm text-yellow-800">
                    あなたの店のポイントカードを持つ顧客が、貯めたポイントを使って交換できる景品を設定します。<br />
                    魅力的な景品を用意して、リピーターを増やしましょう！
                </p>
            </Card>

            <div className="mb-4 flex justify-between items-center">
                <h3 className="font-bold text-lg">登録済み景品リスト ({exchangeItems.length})</h3>
                <Button onClick={() => setIsModalOpen(true)}>＋ 新規追加</Button>
            </div>

            <div className="space-y-4 mb-8">
                {exchangeItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        まだ景品が登録されていません
                    </div>
                ) : (
                    exchangeItems.map(item => (
                        <Card key={item.id} padding="sm">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">{item.emoji}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-lg">{item.name}</div>
                                    <div className="text-sm text-gray-600">{item.description}</div>
                                    <div className="flex gap-4 mt-1 text-sm">
                                        <span className="text-indigo-600 font-bold">必要Pt: {item.pointCost}pt</span>
                                        <span className={item.stock && item.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                            在庫: {item.stock}個
                                        </span>
                                        <span className="text-gray-500">交換済: {item.exchangedCount || 0}回</span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleDeleteItem(item.id)}
                                >
                                    削除
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-10 md:w-auto">
                <Button
                    variant="primary"
                    className="w-full md:w-64 shadow-lg py-4 text-lg font-bold"
                    onClick={handleSave}
                >
                    設定を保存する
                </Button>
            </div>

            {/* Add Item Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="景品の追加">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">景品名</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            placeholder="例: 限定ステッカー"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">絵文字</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={newItem.emoji}
                                onChange={e => setNewItem({ ...newItem, emoji: e.target.value })}
                                placeholder="🎁"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">必要ポイント</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={newItem.pointCost}
                                onChange={e => setNewItem({ ...newItem, pointCost: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">在庫数</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={newItem.stock}
                                onChange={e => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">カテゴリー</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={newItem.category}
                                onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
                            >
                                <option value="special">特別</option>
                                <option value="furniture">家具</option>
                                <option value="pet">ペット</option>
                                <option value="recipe">レシピ</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">説明</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            rows={3}
                            value={newItem.description}
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="景品の説明を入力..."
                        />
                    </div>

                    <div className="pt-4 flex gap-2">
                        <Button fullWidth onClick={handleAddItem}>追加</Button>
                        <Button fullWidth variant="ghost" onClick={() => setIsModalOpen(false)}>キャンセル</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
