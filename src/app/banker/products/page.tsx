'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types';

export default function BankerProductsPage() {
    const { gameState } = useGame();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (gameState?.products) {
            setProducts(gameState.products);
        }
    }, [gameState]);

    const handleSave = async () => {
        if (!confirm('変更を保存しますか？')) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_products',
                products: products
            })
        });
        alert('保存しました');
    };

    const handleChange = (index: number, field: string, value: any) => {
        const newProducts = [...products];
        // @ts-ignore
        newProducts[index][field] = value;
        setProducts(newProducts);
    };

    const handleAdd = () => {
        const newProduct: Product = {
            id: Math.random().toString(36).substring(7),
            sellerId: 'banker',
            name: '新しい商品',
            price: 100,
            isSold: false
        };
        setProducts([...products, newProduct]);
    };

    const handleDelete = (index: number) => {
        const newProducts = [...products];
        newProducts.splice(index, 1);
        setProducts(newProducts);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>商品管理</h2>
                <Button onClick={handleSave} variant="primary">保存する</Button>
            </div>

            <Card padding="md">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {products.map((product, index) => (
                        <div key={product.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid #eee', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>商品名</label>
                                <input
                                    type="text"
                                    value={product.name}
                                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ width: '100px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>価格</label>
                                <input
                                    type="number"
                                    value={product.price}
                                    onChange={(e) => handleChange(index, 'price', Number(e.target.value))}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '100%' }}>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(index)}>削除</Button>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>商品がありません</p>}
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <Button variant="ghost" onClick={handleAdd} fullWidth>+ 商品を追加</Button>
                </div>
            </Card>
        </div>
    );
}
