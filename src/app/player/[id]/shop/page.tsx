'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Product } from '@/types';

export default function PlayerShopPage() {
    const { gameState, currentUser } = useGame();
    const [products, setProducts] = useState<Product[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    // フォーム用State
    const [formName, setFormName] = useState('');
    const [formPrice, setFormPrice] = useState(0);
    const [formDescription, setFormDescription] = useState('');
    const [formCondition, setFormCondition] = useState<'new' | 'like-new' | 'good' | 'fair' | 'poor'>('good');
    const [formComment, setFormComment] = useState('');

    useEffect(() => {
        if (gameState && currentUser) {
            const myProducts = (gameState.products || []).filter(p => p.sellerId === currentUser.id);
            setProducts(myProducts);
        }
    }, [gameState, currentUser]);

    const resetForm = () => {
        setFormName('');
        setFormPrice(0);
        setFormDescription('');
        setFormCondition('good');
        setFormComment('');
        setEditProduct(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleOpenEdit = (product: Product) => {
        setEditProduct(product);
        setFormName(product.name);
        setFormPrice(product.price);
        setFormDescription(product.description || '');
        setFormCondition(product.condition || 'good');
        setFormComment(product.comment || '');
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!currentUser) return;

        let updatedProducts = [...(gameState?.products || [])];

        if (editProduct) {
            // 編集
            const index = updatedProducts.findIndex(p => p.id === editProduct.id);
            if (index !== -1) {
                updatedProducts[index] = {
                    ...updatedProducts[index],
                    name: formName,
                    price: formPrice,
                    description: formDescription,
                    condition: formCondition,
                    comment: formComment
                };
            }
        } else {
            // 新規追加
            const newProduct: Product = {
                id: Math.random().toString(36).substring(7),
                sellerId: currentUser.id,
                name: formName,
                price: formPrice,
                isSold: false,
                description: formDescription,
                condition: formCondition,
                comment: formComment,
                createdAt: Date.now()
            };
            updatedProducts.push(newProduct);
        }

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_products',
                products: updatedProducts
            })
        });

        setShowAddModal(false);
        resetForm();
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('本当に削除しますか？')) return;

        const updatedProducts = (gameState?.products || []).filter(p => p.id !== productId);

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_products',
                products: updatedProducts
            })
        });
    };

    const conditionLabels = {
        'new': '新品',
        'like-new': 'ほぼ新品',
        'good': '良好',
        'fair': 'やや傷あり',
        'poor': '傷あり'
    };

    if (!currentUser) return <div>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>マイショップ</h2>
                <Button onClick={handleOpenAdd} variant="primary">+ 商品を出品</Button>
            </div>

            {products.length === 0 && (
                <Card padding="lg">
                    <p style={{ textAlign: 'center', color: '#888' }}>まだ商品を出品していません</p>
                </Card>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {products.map(product => (
                    <Card key={product.id} padding="md">
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{product.name}</h3>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{product.price.toLocaleString()}枚</div>
                                </div>

                                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                                    状態: <span style={{ fontWeight: 'bold' }}>{conditionLabels[product.condition || 'good']}</span>
                                    {product.isSold && <span style={{ marginLeft: '1rem', color: '#22c55e', fontWeight: 'bold' }}>✓ 販売済み</span>}
                                </div>

                                {product.description && (
                                    <p style={{ marginBottom: '0.5rem' }}>{product.description}</p>
                                )}

                                {product.comment && (
                                    <div style={{ background: '#f3f4f6', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                        💬 {product.comment}
                                    </div>
                                )}

                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    {!product.isSold && (
                                        <>
                                            <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(product)}>編集</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>削除</Button>
                                        </>
                                    )}
                                    {product.isSold && product.soldAt && (
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                            {new Date(product.soldAt).toLocaleString()} に販売
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* 追加/編集モーダル */}
            <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title={editProduct ? '商品を編集' : '商品を出品'}>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>商品名</label>
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                            placeholder="例: 消しゴム"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>価格（枚）</label>
                        <input
                            type="number"
                            value={formPrice}
                            onChange={(e) => setFormPrice(Number(e.target.value))}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                            min="0"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>商品の状態</label>
                        <select
                            value={formCondition}
                            onChange={(e) => setFormCondition(e.target.value as any)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            {Object.entries(conditionLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>商品説明</label>
                        <textarea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
                            placeholder="商品の詳細を入力してください"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>一言コメント</label>
                        <input
                            type="text"
                            value={formComment}
                            onChange={(e) => setFormComment(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                            placeholder="例: おまけ付き！"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <Button onClick={handleSave} variant="primary" fullWidth disabled={!formName || formPrice <= 0}>
                            {editProduct ? '更新' : '出品'}
                        </Button>
                        <Button onClick={() => { setShowAddModal(false); resetForm(); }} variant="ghost" fullWidth>
                            キャンセル
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
