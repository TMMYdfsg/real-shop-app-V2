'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function VisitShopPage() {
    const params = useParams();
    // [targetId] を取得。Next.js 13+ app dir ではフォルダ名がキーになる。
    const targetId = params.targetId as string;

    const { gameState, currentUser } = useGame();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const seller = gameState.users.find(u => u.id === targetId);

    if (!seller) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>ショップが見つかりません (ID: {targetId})</p>
                <Button onClick={() => router.back()} style={{ marginTop: '1rem' }}>戻る</Button>
            </div>
        );
    }

    const products = (gameState.products || []).filter(p => !p.isSold && p.sellerId === seller.id);

    const handlePurchase = async (productId: string, price: number) => {
        if (!confirm('この商品を購入しますか？')) return;
        if (currentUser.balance < price) {
            alert('お金が足りません');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'purchase_product',
                    requesterId: currentUser.id,
                    amount: 0,
                    details: JSON.stringify({ productId, sellerId: seller.id })
                })
            });

            if (res.ok) {
                alert('購入しました！');
                window.location.reload();
            } else {
                alert('購入に失敗しました');
            }
        } catch (error) {
            console.error(error);
            alert('エラーが発生しました');
        } finally {
            setIsProcessing(false);
        }
    };

    const conditionLabels = {
        'new': '新品',
        'like-new': 'ほぼ新品',
        'good': '良好',
        'fair': 'やや傷あり',
        'poor': '傷あり'
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {seller.shopName || `${seller.name}のショップ`}
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>店主: {seller.name}</div>
                </div>
                <Button onClick={() => router.back()} variant="secondary">戻る</Button>
            </div>

            {products.length === 0 && (
                <Card padding="lg">
                    <p style={{ textAlign: 'center', color: '#888' }}>現在販売中の商品はありません</p>
                </Card>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {products.map(product => (
                    <Card key={product.id} padding="md">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{product.name}</h3>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{product.price.toLocaleString()}枚</div>
                        </div>

                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                            状態: <span style={{ fontWeight: 'bold' }}>{conditionLabels[product.condition || 'good']}</span>
                        </div>

                        {product.description && (
                            <p style={{ marginBottom: '0.5rem' }}>{product.description}</p>
                        )}

                        {product.comment && (
                            <div style={{ background: '#f3f4f6', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                                💬 {product.comment}
                            </div>
                        )}

                        <Button
                            onClick={() => handlePurchase(product.id, product.price)}
                            disabled={isProcessing}
                            variant="primary"
                            fullWidth
                            style={{ padding: '0.8rem' }}
                        >
                            購入する
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}
