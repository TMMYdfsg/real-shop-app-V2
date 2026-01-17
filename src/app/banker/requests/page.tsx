'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function BankerRequestsPage() {
    const { gameState } = useGame();
    const [actioningIds, setActioningIds] = useState<Record<string, 'approve' | 'reject'>>({});

    if (!gameState) return <div>Loading...</div>;

    const pendingRequests = gameState.requests.filter(r => r.status === 'pending');

    const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
        // Set local state to show animation first
        setActioningIds(prev => ({ ...prev, [requestId]: action }));

        // Wait for animation (e.g. 800ms)
        await new Promise(resolve => setTimeout(resolve, 800));

        // Perform API call
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, requestId }),
        });

        // Cleanup local state (item will be removed from pendingRequests by SWR update)
        setActioningIds(prev => {
            const next = { ...prev };
            delete next[requestId];
            return next;
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>申請管理</h2>
                {pendingRequests.length > 0 && (
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                            if (confirm('本当に全ての申請を一括承認しますか？')) {
                                fetch('/api/admin', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action: 'approve_all_requests' }),
                                }).then(() => {
                                    alert('すべて承認しました');
                                });
                            }
                        }}
                    >
                        ✅ 一括承認
                    </Button>
                )}
            </div>
            {pendingRequests.length === 0 ? (
                <Card padding="md">
                    <p style={{ color: 'var(--text-secondary)' }}>承認待ちの申請はありません。</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <AnimatePresence mode="popLayout">
                        {pendingRequests.map(req => {
                            const user = gameState.users.find(u => u.id === req.requesterId);
                            const actionStatus = actioningIds[req.id];

                            return (
                                <motion.div
                                    key={req.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                    style={{ position: 'relative' }}
                                >
                                    <Card padding="sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--warning-color)', position: 'relative', overflow: 'hidden' }}>
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
                                            {!actionStatus && (
                                                <>
                                                    <Button size="sm" variant="success" onClick={() => handleRequest(req.id, 'approve')}>承認</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleRequest(req.id, 'reject')}>却下</Button>
                                                </>
                                            )}
                                        </div>

                                        {/* Overlay & Stamp Animation */}
                                        <AnimatePresence>
                                            {actionStatus && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    style={{
                                                        position: 'absolute', inset: 0,
                                                        background: 'rgba(255,255,255,0.8)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        zIndex: 10
                                                    }}
                                                >
                                                    <motion.div
                                                        initial={{ scale: 2, opacity: 0, rotate: -20 }}
                                                        animate={{ scale: 1, opacity: 1, rotate: -10 }}
                                                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                                        style={{
                                                            border: `5px solid ${actionStatus === 'approve' ? '#22c55e' : '#ef4444'}`,
                                                            color: actionStatus === 'approve' ? '#22c55e' : '#ef4444',
                                                            fontSize: '2rem', fontWeight: 'bold', padding: '0.5rem 2rem',
                                                            borderRadius: '10px', textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        {actionStatus === 'approve' ? 'APPROVED' : 'REJECTED'}
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
