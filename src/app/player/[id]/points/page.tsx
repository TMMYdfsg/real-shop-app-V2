'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PointsPage() {
    const { gameState, currentUser } = useGame();

    // ユーザー名を解決するためのマップ
    const shopNames: { [id: string]: string } = {};
    if (gameState) {
        gameState.users.forEach(u => {
            shopNames[u.id] = u.name;
        });
    }

    if (!currentUser) return <div>Loading...</div>;

    const cards = currentUser.pointCards || [];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ポイントカード</h2>
                <Button size="sm" onClick={() => window.location.href = `${window.location.pathname}/exchange`}>
                    🎁 交換所へ
                </Button>
            </div>

            {cards.length === 0 && (
                <Card padding="lg">
                    <p style={{ textAlign: 'center', color: '#888' }}>まだポイントカードを持っていません</p>
                </Card>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {cards.map((card, index) => (
                    <Card key={index} padding="md" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fff 100%)', border: '2px solid #fbbf24' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {shopNames[card.shopOwnerId] || '不明なお店'} のポイントカード
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>
                                {card.points} pt
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {/* スタンプ表示 (簡易) */}
                            {Array.from({ length: Math.min(card.points, 10) }).map((_, i) => (
                                <div key={i} style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '0.8rem'
                                }}>
                                    済
                                </div>
                            ))}
                            {card.points > 10 && <div style={{ alignSelf: 'center', color: '#666' }}>+{card.points - 10}</div>}
                        </div>

                        <div style={{ marginTop: '1rem', borderTop: '1px dashed #ccc', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                ※ 100円で1ポイント
                            </p>
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => window.location.href = `${window.location.pathname}/exchange/${card.shopOwnerId}`}
                            >
                                🎁 このお店で交換
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
