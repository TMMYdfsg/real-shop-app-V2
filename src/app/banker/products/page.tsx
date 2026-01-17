'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CatalogItem } from '@/types';
import { motion } from 'framer-motion';

const CATEGORY_LABELS = {
    furniture: '家具',
    pet: 'ペット',
    ingredient: '食材',
    appliance: '家電',
    other: 'その他'
} as const;

const CATEGORY_EMOJIS = {
    furniture: '🛋️',
    pet: '🐶',
    ingredient: '🥕',
    appliance: '📺',
    other: '📦'
} as const;

export default function BankerProductsPage() {
    const { gameState } = useGame();
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CatalogItem['category']>('furniture');
    const [newItem, setNewItem] = useState({
        name: '',
        emoji: '',
        wholesalePrice: 100,
        stock: 10,
        description: ''
    });

    useEffect(() => {
        if (gameState?.catalogInventory) {
            setCatalog(gameState.catalogInventory);
        }
    }, [gameState]);

    const handleSave = async () => {
        if (!confirm('カタログを保存しますか？')) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_catalog',
                catalog: catalog
            })
        });
        alert('保存しました');
    };

    const handleChange = (index: number, field: keyof CatalogItem, value: any) => {
        const newCatalog = [...catalog];
        // @ts-ignore
        newCatalog[index][field] = value;
        setCatalog(newCatalog);
    };

    const handleAdd = () => {
        if (!newItem.name.trim()) {
            alert('商品名を入力してください');
            return;
        }

        const item: CatalogItem = {
            id: `catalog_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            name: newItem.name,
            category: selectedCategory,
            emoji: newItem.emoji || CATEGORY_EMOJIS[selectedCategory],
            wholesalePrice: newItem.wholesalePrice,
            stock: newItem.stock,
            description: newItem.description
        };

        setCatalog([...catalog, item]);
        setIsAddModalOpen(false);
        setNewItem({
            name: '',
            emoji: '',
            wholesalePrice: 100,
            stock: 10,
            description: ''
        });
    };

    const handleDelete = (index: number) => {
        if (!confirm('このアイテムを削除しますか？')) return;
        const newCatalog = [...catalog];
        newCatalog.splice(index, 1);
        setCatalog(newCatalog);
    };

    const groupedCatalog = catalog.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, CatalogItem[]>);

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        🏪 仕入れ先カタログ管理
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        プレイヤーが仕入れできる商品を管理します。在庫がなくなると仕入れできません。
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAddModalOpen(true)} variant="secondary">
                        + 商品追加
                    </Button>
                    <Button onClick={handleSave} variant="primary">
                        💾 保存する
                    </Button>
                </div>
            </div>

            {/* カテゴリー別表示 */}
            <div className="space-y-6">
                {Object.keys(CATEGORY_LABELS).map((cat) => {
                    const category = cat as CatalogItem['category'];
                    const items = groupedCatalog[category] || [];

                    return (
                        <Card key={category} padding="md">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="text-2xl">{CATEGORY_EMOJIS[category]}</div>
                                <h3 className="text-lg font-bold">{CATEGORY_LABELS[category]}</h3>
                                <div className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                                    {items.length}件
                                </div>
                            </div>

                            {items.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    このカテゴリーには商品がありません
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {items.map((item) => {
                                        const index = catalog.indexOf(item);
                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex gap-3 items-center border border-gray-200 p-3 rounded-lg bg-white hover:shadow-md transition-shadow"
                                            >
                                                <div className="text-3xl">{item.emoji}</div>

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">商品名</label>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">絵文字</label>
                                                        <input
                                                            type="text"
                                                            value={item.emoji}
                                                            onChange={(e) => handleChange(index, 'emoji', e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                            maxLength={2}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">卸値（仕入れ価格）</label>
                                                        <input
                                                            type="number"
                                                            value={item.wholesalePrice}
                                                            onChange={(e) => handleChange(index, 'wholesalePrice', Number(e.target.value))}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">在庫数</label>
                                                        <input
                                                            type="number"
                                                            value={item.stock}
                                                            onChange={(e) => handleChange(index, 'stock', Number(e.target.value))}
                                                            className={`w-full px-2 py-1 border rounded text-sm font-semibold
                                                                ${item.stock === 0 ? 'border-red-500 text-red-600 bg-red-50' :
                                                                    item.stock < 5 ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
                                                                        'border-green-500 text-green-600 bg-green-50'}
                                                            `}
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(index)}
                                                >
                                                    🗑️
                                                </Button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* 商品追加モーダル */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="📦 商品を追加">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">カテゴリー</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.keys(CATEGORY_LABELS).map((cat) => {
                                const category = cat as CatalogItem['category'];
                                return (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`p-3 rounded-lg border-2 transition-all ${selectedCategory === category
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">{CATEGORY_EMOJIS[category]}</div>
                                        <div className="text-xs font-semibold">{CATEGORY_LABELS[category]}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">商品名</label>
                        <input
                            type="text"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            className="w-full p-2 border rounded"
                            placeholder="例: 高級ソファ"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">絵文字（任意）</label>
                        <input
                            type="text"
                            value={newItem.emoji}
                            onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })}
                            className="w-full p-2 border rounded"
                            placeholder={`デフォルト: ${CATEGORY_EMOJIS[selectedCategory]}`}
                            maxLength={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">卸値（仕入れ価格）</label>
                            <input
                                type="number"
                                value={newItem.wholesalePrice}
                                onChange={(e) => setNewItem({ ...newItem, wholesalePrice: Number(e.target.value) })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">初期在庫数</label>
                            <input
                                type="number"
                                value={newItem.stock}
                                onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">説明（任意）</label>
                        <textarea
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            className="w-full p-2 border rounded"
                            rows={2}
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button fullWidth onClick={handleAdd}>追加</Button>
                        <Button fullWidth variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                            キャンセル
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
