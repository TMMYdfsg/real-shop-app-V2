'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StockChart } from '@/components/stock/StockChart';

export default function StockPage() {
    const { gameState, currentUser } = useGame();
    const [amount, setAmount] = useState<{ [key: string]: string }>({});

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const handleTrade = async (stockId: string, type: 'buy_stock' | 'sell_stock') => {
        const count = Number(amount[stockId]);
        if (!count || count <= 0) return;

        const stock = gameState.stocks.find(s => s.id === stockId);
        if (!stock) return;

        // Validation
        if (type === 'buy_stock') {
            const cost = stock.price * count;
            if (currentUser.balance < cost) {
                alert('お金が足りません！');
                return;
            }
        } else {
            const currentHold = currentUser.stocks[stockId] || 0;
            if (currentHold < count) {
                alert('そんなに持っていません！');
                return;
            }
        }

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type,
                requesterId: currentUser.id,
                amount: count, // 株数
                details: stockId // 株ID
            }),
        });

        setAmount(prev => ({ ...prev, [stockId]: '' }));
        alert('申請しました！');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>株式市場</h2>
            <p style={{ color: 'var(--text-secondary)' }}>株を買って資産を増やそう！ただし暴落には気をつけて。</p>

            {gameState.stocks.map(stock => {
                const diff = stock.price - stock.previousPrice;
                const diffPercent = ((diff / stock.previousPrice) * 100).toFixed(1);
                const isUp = diff >= 0;
                const holding = currentUser.stocks[stock.id] || 0;

                return (
                    <Card key={stock.id} padding="md">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{stock.name}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    保有: {holding}株
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stock.price}枚</div>
                                <div style={{ color: isUp ? 'var(--success-color)' : 'var(--danger-color)', fontSize: '0.9rem' }}>
                                    {isUp ? '▲' : '▼'} {Math.abs(diff)} ({diffPercent}%)
                                </div>
                            </div>
                        </div>

                        {/* Price Chart */}
                        <StockChart stock={stock} />

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="number"
                                placeholder="株数"
                                value={amount[stock.id] || ''}
                                onChange={(e) => setAmount(prev => ({ ...prev, [stock.id]: e.target.value }))}
                                style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <Button onClick={() => handleTrade(stock.id, 'buy_stock')}>買う</Button>
                            <Button variant="secondary" onClick={() => handleTrade(stock.id, 'sell_stock')}>売る</Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
