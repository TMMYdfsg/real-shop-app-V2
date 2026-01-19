'use client';

import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function CatalogManagerAdmin() {
    const { gameState, refresh } = useGame();
    const [form, setForm] = useState({
        name: '',
        category: 'furniture' as 'furniture' | 'appliance' | 'pet' | 'ingredient' | 'other',
        price: 1000,
        wholesalePrice: 800,
        description: '',
        emoji: '📦',
        stock: 100,
        rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary'
    });

    const catalogItems = gameState?.catalogInventory || [];

    const handleAdd = async () => {
        if (!form.name) return alert('名前を入力してください');

        try {
            await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_catalog_item',
                    item: form
                })
            });
            alert('カタログアイテムを追加しました');
            setForm({
                name: '',
                category: 'furniture',
                price: 1000,
                wholesalePrice: 800,
                description: '',
                emoji: '📦',
                stock: 100,
                rarity: 'common'
            });
            refresh();
        } catch (error) {
            console.error(error);
            alert('追加に失敗しました');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('削除しますか？')) return;

        try {
            await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete_catalog_item',
                    itemId: id
                })
            });
            refresh();
        } catch (error) {
            console.error(error);
            alert('削除に失敗しました');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">🛒 カタログアイテム管理</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form */}
                <Card title="新規アイテム追加" padding="md">
                    <div className="space-y-4">
                        <div>
                            <label className="block font-bold mb-1">名前</label>
                            <input
                                className="w-full border rounded p-2"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="例: ソファー"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold mb-1">カテゴリ</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value as any })}
                                >
                                    <option value="furniture">家具</option>
                                    <option value="appliance">家電</option>
                                    <option value="pet">ペット</option>
                                    <option value="ingredient">食材</option>
                                    <option value="other">その他</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">絵文字</label>
                                <input
                                    className="w-full border rounded p-2"
                                    value={form.emoji}
                                    onChange={e => setForm({ ...form, emoji: e.target.value })}
                                    placeholder="🪑"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold mb-1">販売価格</label>
                                <input
                                    type="number"
                                    className="w-full border rounded p-2"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">卸値</label>
                                <input
                                    type="number"
                                    className="w-full border rounded p-2"
                                    value={form.wholesalePrice}
                                    onChange={e => setForm({ ...form, wholesalePrice: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold mb-1">在庫</label>
                                <input
                                    type="number"
                                    className="w-full border rounded p-2"
                                    value={form.stock}
                                    onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">レアリティ</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={form.rarity}
                                    onChange={e => setForm({ ...form, rarity: e.target.value as any })}
                                >
                                    <option value="common">Common</option>
                                    <option value="rare">Rare</option>
                                    <option value="epic">Epic</option>
                                    <option value="legendary">Legendary</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block font-bold mb-1">説明</label>
                            <textarea
                                className="w-full border rounded p-2 h-20"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleAdd} className="w-full">追加する</Button>
                    </div>
                </Card>

                {/* List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">登録済みアイテム ({catalogItems.length})</h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {catalogItems.map(item => (
                            <Card key={item.id} padding="sm" className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{item.emoji}</div>
                                    <div>
                                        <div className="font-bold">{item.name}</div>
                                        <div className="text-sm text-gray-600">
                                            {item.category} | {(item.wholesalePrice || item.price).toLocaleString()}枚 | 在庫: {item.stock}
                                        </div>
                                    </div>
                                </div>
                                <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>削除</Button>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
