'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';

export default function RouletteViewPage() {
    const { gameState, currentUser } = useGame();

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const result = gameState.roulette.currentResult;
    let targetDisplay = '全員';
    if (result?.targetUserId) {
        if (result.targetUserId === currentUser.id) {
            targetDisplay = 'あなた';
        } else {
            const targetUser = gameState.users.find(u => u.id === result.targetUserId);
            targetDisplay = targetUser ? targetUser.name : '指定ユーザー';
        }
    }

    return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>ルーレット結果</h2>
            <Card padding="lg">
                {result ? (
                    <div>
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            最新の結果 ({new Date(result.timestamp).toLocaleTimeString()})
                        </div>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'var(--accent-color)',
                            padding: '2rem',
                            border: '2px solid var(--accent-color)',
                            borderRadius: '12px',
                            background: 'var(--bg-secondary)'
                        }}>
                            {result.text}
                            <div style={{ fontSize: '1rem', marginTop: '1rem', color: 'var(--text-primary)' }}>
                                対象: <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{targetDisplay}</span>
                            </div>
                        </div>
                        <p style={{ marginTop: '1rem' }}>
                            ※ 結果は自動的に反映されます
                        </p>
                    </div>
                ) : (
                    <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>
                        まだルーレットは回されていません。<br />
                        銀行員の合図を待ってね！
                    </div>
                )}
            </Card>
        </div>
    );
}
