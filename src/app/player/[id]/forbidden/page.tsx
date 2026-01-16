'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ForbiddenMarketPage() {
    const { gameState, currentUser } = useGame();
    const [amount, setAmount] = useState<{ [key: string]: string }>({});

    if (!gameState || !currentUser) return <div>Loading...</div>;

    if (!currentUser.isForbiddenUnlocked) {
        return <div>アクセス権限がありません。</div>;
    }

    const handleTrade = async (stockId: string, type: 'buy_stock' | 'sell_stock') => {
        const count = Number(amount[stockId]);
        if (!count || count <= 0) return;

        const stock = gameState.stocks.find(s => s.id === stockId);
        if (!stock) return;

        // Validation
        if (type === 'buy_stock') {
            const cost = stock.price * count;
            if (currentUser.balance < cost) {
                alert('資金不足です...');
                return;
            }
        } else {
            const currentHold = currentUser.stocks[stockId] || 0;
            if (currentHold < count) {
                alert('保有数が足りません...');
                return;
            }
        }

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type,
                requesterId: currentUser.id,
                amount: count,
                details: stockId
            }),
        });

        setAmount(prev => ({ ...prev, [stockId]: '' }));
        alert('闇の取引を申請しました...');
    };

    const forbiddenStocks = gameState.stocks.filter(s => s.isForbidden);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#ccc' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>禁断の市場 💀</h2>
            <p style={{ fontSize: '0.9rem' }}>ここは通常の市場ではありません。価格変動は激しく、全てを失う可能性があります。</p>

            {forbiddenStocks.map(stock => {
                const diff = stock.price - stock.previousPrice;
                const diffPercent = ((diff / stock.previousPrice) * 100).toFixed(1);
                const isUp = diff >= 0;
                const holding = currentUser.stocks[stock.id] || 0;

                return (
                    <Card key={stock.id} padding="md" style={{ background: '#1c1c1c', border: '1px solid #444', color: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#ef4444' }}>{stock.name}</div>
                                <div style={{ fontSize: '0.9rem', color: '#888' }}>
                                    保有: {holding}株
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stock.price}枚</div>
                                <div style={{ color: isUp ? '#22c55e' : '#ef4444', fontSize: '0.9rem' }}>
                                    {isUp ? '▲' : '▼'} {Math.abs(diff)} ({diffPercent}%)
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="number"
                                placeholder="闇株数"
                                value={amount[stock.id] || ''}
                                onChange={(e) => setAmount(prev => ({ ...prev, [stock.id]: e.target.value }))}
                                style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#333', color: 'white' }}
                            />
                            <Button onClick={() => handleTrade(stock.id, 'buy_stock')} style={{ background: '#ef4444' }}>買う</Button>
                            <Button variant="secondary" onClick={() => handleTrade(stock.id, 'sell_stock')} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>売る</Button>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                            ボラティリティ: {(stock.volatility * 100).toFixed(0)}%
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
