'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BankerRequestsPage() {
    const { gameState } = useGame();

    if (!gameState) return <div>Loading...</div>;

    const pendingRequests = gameState.requests.filter(r => r.status === 'pending');

    const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, requestId }),
        });
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1rem' }}>申請管理</h2>
            {pendingRequests.length === 0 ? (
                <Card padding="md">
                    <p style={{ color: 'var(--text-secondary)' }}>承認待ちの申請はありません。</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
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
                                        {req.type === 'tax' && '🧾 税金納付'}
                                        {req.type === 'bill' && '🧾 支払い'}
                                        {req.type === 'buy_stock' && '📈 株購入'}
                                        {req.type === 'sell_stock' && '📉 株売却'}
                                        {req.type === 'change_job' && '👔 転職'}
                                        {req.type === 'unlock_forbidden' && '💀 解放申請'}
                                        : <span style={{ fontWeight: 'bold' }}>{req.amount}枚</span>
                                        {req.details && <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>({req.details})</span>}
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
        </div>
    );
}
