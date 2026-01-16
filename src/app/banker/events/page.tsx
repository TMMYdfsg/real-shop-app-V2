'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RouletteControlPage() {
    const { gameState } = useGame();
    const [spinning, setSpinning] = useState(false);
    const [targetUser, setTargetUser] = useState('');
    const [ticketPrice, setTicketPrice] = useState(100);

    if (!gameState) return <div>Loading...</div>;

    const players = gameState.users.filter(u => u.role === 'player');

    const handleSpin = async () => {
        if (!targetUser) {
            alert('ユーザーを選択してください');
            return;
        }

        setSpinning(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'spin_roulette',
                requestId: targetUser, // pass user id
                amount: ticketPrice
            }),
        });
        setSpinning(false);
        alert('ルーレット結果を送信しました');
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem' }}>ルーレット制御 (チケット制)</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Control */}
                <Card padding="lg" style={{ textAlign: 'center' }}>

                    <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                        <label>対象ユーザー</label>
                        <select
                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            value={targetUser}
                            onChange={e => setTargetUser(e.target.value)}
                        >
                            <option value="">選択してください</option>
                            {players.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.balance}枚)</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                        <label>チケット代 (前金)</label>
                        <input
                            type="number"
                            value={ticketPrice}
                            onChange={e => setTicketPrice(Number(e.target.value))}
                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                        />
                    </div>

                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        border: '8px solid var(--accent-color)',
                        margin: '0 auto 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        background: spinning ? '#f3f4f6' : 'white',
                    }}>
                        {spinning ? '回転中...' : 'START'}
                    </div>

                    <Button size="lg" onClick={handleSpin} disabled={spinning || !targetUser} fullWidth>
                        回す (代金を徴収)
                    </Button>
                </Card>

                {/* Settings / Results */}
                <div>
                    <Card title="現在の設定 (確率)" padding="md" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                            ※確率は現状固定です。将来的にここから編集可能になります。
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {gameState.roulette.items.map(item => (
                                <li key={item.id} style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.text}</span>
                                    {/* Fake weight input for UI demo */}
                                    <input type="number" placeholder="%" style={{ width: '50px' }} disabled />
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}
