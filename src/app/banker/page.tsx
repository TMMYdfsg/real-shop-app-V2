'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BankerDashboard() {
    const { gameState } = useGame();
    const [showRequests, setShowRequests] = React.useState(false);

    if (!gameState) return <div>Loading...</div>;

    const pendingRequests = gameState.requests.filter(r => r.status === 'pending');

    const handleNextTurn = async () => {
        if (!confirm('ターンを進めますか？')) return;
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'next_turn' }),
        });
    };

    const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, requestId }),
        });
    };

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {/* Turn Card */}
                <Card title="現在のターン" padding="md">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>Turn {gameState.turn}</div>
                    <div style={{ color: gameState.isDay ? '#eab308' : '#6366f1', fontWeight: 'bold', marginBottom: '1rem' }}>
                        {gameState.isDay ? '☀ 昼 (活動中)' : '🌙 夜 (休憩中)'}
                    </div>
                    <Button
                        size="sm"
                        variant={gameState.isDay ? 'secondary' : 'primary'}
                        onClick={handleNextTurn}
                    >
                        {gameState.isDay ? '夜にする (活動終了)' : '次の日へ (朝にする)'}
                    </Button>
                </Card>

                {/* Requests Card */}
                <Card title="承認待ちの申請" padding="md">
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: pendingRequests.length > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                        {pendingRequests.length}件
                    </div>
                    <Button
                        size="sm"
                        variant="danger"
                        style={{ marginTop: '0.5rem' }}
                        onClick={() => setShowRequests(!showRequests)}
                        disabled={pendingRequests.length === 0}
                    >
                        {showRequests ? '閉じる' : '確認する'}
                    </Button>
                </Card>

                {/* Players Card */}
                <Card title="参加プレイヤー" padding="md">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{gameState.users.filter(u => u.role === 'player').length}人</div>
                </Card>
            </div>

            {/* Requests List Section */}
            {showRequests && (
                <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s' }}>
                    <h2 style={{ marginBottom: '1rem' }}>申請リスト</h2>
                    {pendingRequests.map(req => {
                        const user = gameState.users.find(u => u.id === req.requesterId);
                        return (
                            <Card key={req.id} padding="sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--warning-color)' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{user?.name || 'Unknown'}</div>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        {req.type === 'income' && '💰 稼ぎ申請'}
                                        {req.type === 'loan' && '💸 借金申請'}
                                        {req.type === 'repay' && '↩️ 返済申請'}
                                        {req.type === 'tax' && '🧾 支払い'}
                                        : <span style={{ fontWeight: 'bold' }}>{req.amount}枚</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button size="sm" variant="success" onClick={() => handleRequest(req.id, 'approve')}>承認</Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleRequest(req.id, 'reject')}>却下</Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <h2 style={{ marginBottom: '1rem' }}>プレイヤー状況</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {gameState.users.filter(u => u.role === 'player').map(user => (
                    <Card key={user.id} title={user.name + (user.debt > 0 ? ' ⚠️借金あり' : '')} padding="sm">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>所持金:</span>
                            <span style={{ fontWeight: 'bold' }}>{user.balance.toLocaleString()}枚</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>借金:</span>
                            <span style={{ color: user.debt > 0 ? 'var(--danger-color)' : 'inherit', fontWeight: user.debt > 0 ? 'bold' : 'normal' }}>{user.debt.toLocaleString()}枚</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>職業:</span>
                            <span>{user.job}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
