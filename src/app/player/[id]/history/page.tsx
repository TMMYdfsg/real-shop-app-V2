'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function HistoryPage() {
    const { gameState, currentUser } = useGame();
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (currentUser && currentUser.transactions) {
            // 新しい順にソート
            const sorted = [...currentUser.transactions].sort((a, b) => b.timestamp - a.timestamp);
            setHistory(sorted);
        }
    }, [currentUser]);

    if (!currentUser) return <div>Loading...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>取引履歴 (レシート)</h2>

            {history.length === 0 && (
                <Card padding="lg">
                    <p style={{ textAlign: 'center', color: '#888' }}>履歴はまだありません</p>
                </Card>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {history.map(item => (
                    <Card key={item.id} padding="md" style={{
                        borderLeft: `5px solid ${item.type === 'income' ? '#22c55e' :
                                item.type === 'payment' ? '#ef4444' :
                                    item.type === 'deposit' ? '#3b82f6' : '#888'
                            }`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>{new Date(item.timestamp).toLocaleString()}</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.description}</div>
                            </div>
                            <div style={{
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: item.type === 'income' ? '#22c55e' : '#ef4444'
                            }}>
                                {item.type === 'income' ? '+' : '-'} {item.amount.toLocaleString()} 枚
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
