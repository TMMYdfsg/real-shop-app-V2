'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BankerMarketPage() {
    const { gameState } = useGame();
    const [editingStockId, setEditingStockId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);

    if (!gameState) return <div>Loading...</div>;

    const handleUpdatePrice = async (stockId: string) => {
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_stock',
                requestId: stockId, // Using requestId as stockId slot
                amount: editPrice
            }),
        });
        setEditingStockId(null);
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1rem' }}>株式市場管理</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {gameState.stocks.map(stock => {
                    const isEditing = editingStockId === stock.id;

                    return (
                        <Card key={stock.id} padding="md" style={{ borderLeft: stock.isForbidden ? '4px solid purple' : '4px solid var(--accent-color)' }}>
                            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {stock.name} {stock.isForbidden && <span style={{ fontSize: '0.8rem', color: 'purple' }}> [闇]</span>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>現在価格</div>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editPrice}
                                            onChange={e => setEditPrice(Number(e.target.value))}
                                            style={{ padding: '0.2rem', width: '100px', fontSize: '1.2rem', fontWeight: 'bold' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stock.price}枚</div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>前回価格</div>
                                    <div>{stock.previousPrice}枚</div>
                                </div>
                            </div>

                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button size="sm" variant="success" onClick={() => handleUpdatePrice(stock.id)}>保存</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingStockId(null)}>キャンセル</Button>
                                </div>
                            ) : (
                                <Button size="sm" onClick={() => { setEditingStockId(stock.id); setEditPrice(stock.price); }}>
                                    価格操作
                                </Button>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
