'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';

export default function PlayerHome() {
    const { gameState, currentUser } = useGame();

    if (!gameState || !currentUser) return <div>Loading...</div>;

    // 売上ランキング
    const ranking = [...gameState.users]
        .filter(u => u.role === 'player')
        .sort((a, b) => b.balance - a.balance); // シンプルに所持金でランキング (本来は総売上等だが現状balance)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Main Stats */}
            <Card className="glass-panel" padding="lg" style={{ background: 'linear-gradient(135deg, var(--accent-color), #818cf8)', color: 'white', border: 'none' }}>
                <div style={{ marginBottom: '0.5rem', opacity: 0.9 }}>現在の所持金</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                    {currentUser.balance.toLocaleString()} 枚
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>貯金</div>
                        <div style={{ fontWeight: 'bold' }}>{currentUser.deposit}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>借金</div>
                        <div style={{ fontWeight: 'bold' }}>{currentUser.debt}</div>
                    </div>
                </div>
            </Card>

            {/* Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Card padding="sm" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>😊</div>
                    <div style={{ fontSize: '0.8rem' }}>幸福度</div>
                    <div style={{ fontWeight: 'bold' }}>{currentUser.happiness}</div>
                </Card>
                <Card padding="sm" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>⭐</div>
                    <div style={{ fontSize: '0.8rem' }}>人気度</div>
                    <div style={{ fontWeight: 'bold' }}>{currentUser.popularity}</div>
                </Card>
            </div>

            {/* Ranking */}
            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>お金持ちランキング</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ranking.map((user, index) => (
                    <div key={user.id} className="glass-panel" style={{
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        background: user.id === currentUser.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass-bg)'
                    }}>
                        <div style={{ width: '30px', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center', color: index === 0 ? '#fbbf24' : 'inherit' }}>
                            {index + 1}
                        </div>
                        <div style={{ flex: 1, fontWeight: user.id === currentUser.id ? 'bold' : 'normal' }}>
                            {user.name}
                            {user.id === currentUser.id && <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--accent-color)' }}>(あなた)</span>}
                        </div>
                        <div style={{ fontWeight: 'bold' }}>{user.balance}枚</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
