'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';

export default function BankerUsersPage() {
    const { gameState } = useGame();

    if (!gameState) return <div>Loading...</div>;

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>ユーザー管理 (職業管理)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {gameState.users.map(user => (
                    <Card key={user.id} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.name}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>
                                {user.role === 'banker' ? '銀行員' : `職業: ${user.job === 'unemployed' ? '無職' : user.job}`}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div>所持金: {user.balance.toLocaleString()}</div>
                            <div>借金: {user.debt.toLocaleString()}</div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
