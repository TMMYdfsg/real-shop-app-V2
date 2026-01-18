'use client';

import React, { useState } from 'react';
import { PointExchangeItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';

interface PointExchangeManagerProps {
    currentItems: PointExchangeItem[];
    onUpdate: (items: PointExchangeItem[]) => void;
    shopOwnerId: string;
}

const CATEGORIES = [
    { id: 'furniture' as const, name: '家具', emoji: '🛋️' },
    { id: 'pet' as const, name: 'ペット', emoji: '🐶' },
    { id: 'recipe' as const, name: 'レシピ', emoji: '📖' },
    { id: 'special' as const, name: '特別アイテム', emoji: '✨' }
];

export const PointExchangeManager: React.FC<PointExchangeManagerProps> = ({ currentItems, onUpdate, shopOwnerId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PointExchangeItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'special' as PointExchangeItem['category'],
        pointCost: 100,
        emoji: '🎁',
        stock: 10
    });

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            category: 'special',
            pointCost: 100,
            emoji: '🎁',
            stock: 10
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item: PointExchangeItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            category: item.category,
            pointCost: item.pointCost,
            emoji: item.emoji || '🎁',
            stock: item.stock || 0
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const newItem: PointExchangeItem = {
            id: editingItem?.id || `item-${Date.now()}`,
            shopOwnerId,
            ...formData,
            exchangedCount: editingItem?.exchangedCount || 0
        };

        let updatedItems: PointExchangeItem[];
        if (editingItem) {
            updatedItems = currentItems.map(item =>
                item.id === editingItem.id ? newItem : item
            );
        } else {
            updatedItems = [...currentItems, newItem];
        }

        onUpdate(updatedItems);
        setIsModalOpen(false);
    };

    const handleDelete = (itemId: string) => {
        if (!confirm('このアイテムを削除しますか？')) return;
        onUpdate(currentItems.filter(item => item.id !== itemId));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">ポイント交換所管理</h2>
                <Button onClick={handleAdd}>+ アイテム追加</Button>
            </div>

            {currentItems.length === 0 ? (
                <Card padding="lg">
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">🎁</div>
                        <p className="text-gray-600">交換アイテムがありません</p>
                        <p className="text-sm text-gray-500 mt-2">
                            「+ アイテム追加」ボタンから交換アイテムを追加しましょう
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card padding="md">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="text-3xl">{item.emoji}</div>
                                        <div>
                                            <h3 className="font-bold">{item.name}</h3>
                                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                                {CATEGORIES.find(c => c.id === item.category)?.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {item.description && (
                                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                )}

                                <div className="bg-indigo-50 p-3 rounded-lg mb-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">必要ポイント</span>
                                        <span className="text-xl font-bold text-indigo-600">
                                            {item.pointCost}pt
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm mb-3">
                                    <span>在庫: <span className="font-bold">{item.stock || 0}</span></span>
                                    <span>交換数: <span className="font-bold">{item.exchangedCount || 0}</span></span>
                                </div>

                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(item)} fullWidth>
                                        編集
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)} fullWidth>
                                        削除
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* 編集モーダル */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'アイテム編集' : 'アイテム追加'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">アイテム名</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="例: 特別クーポン"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">説明</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20 resize-none"
                            placeholder="アイテムの説明..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">カテゴリー</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as PointExchangeItem['category'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.emoji} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">絵文字</label>
                        <input
                            type="text"
                            value={formData.emoji}
                            onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-2xl"
                            placeholder="🎁"
                            maxLength={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">必要ポイント</label>
                        <input
                            type="number"
                            value={formData.pointCost}
                            onChange={(e) => setFormData({ ...formData, pointCost: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">在庫数</label>
                        <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            min="0"
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button onClick={() => setIsModalOpen(false)} variant="secondary" fullWidth>
                            キャンセル
                        </Button>
                        <Button onClick={handleSave} variant="primary" fullWidth disabled={!formData.name}>
                            {editingItem ? '更新' : '追加'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
