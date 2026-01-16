'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DebtPage() {
    const { currentUser } = useGame();
    const [borrowAmount, setBorrowAmount] = useState('');
    const [repayAmount, setRepayAmount] = useState('');

    if (!currentUser) return <div>Loading...</div>;

    const handleAction = async (type: 'loan' | 'repay', amountStr: string) => {
        const amount = Number(amountStr);
        if (!amount || amount <= 0) return;

        if (type === 'repay' && amount > currentUser.balance) {
            alert('お金が足りません！');
            return;
        }

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type,
                requesterId: currentUser.id,
                amount,
            }),
        });

        setBorrowAmount('');
        setRepayAmount('');
        alert('申請しました！銀行員に承認してもらってね。');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>借金・ローン</h2>

            {/* Current Debt */}
            <Card className="glass-panel" padding="lg" style={{ background: '#fecaca', color: '#b91c1c', border: 'none' }}>
                <div style={{ opacity: 0.9 }}>現在の借金総額</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                    {currentUser.debt.toLocaleString()} 枚
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    ※ 夜になると自動で利子がつきます
                </div>
            </Card>

            {/* Borrow */}
            <Card title="お金を借りる" padding="md">
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    困ったときは銀行からお金を借りることができます。
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="number"
                        placeholder="借りたい枚数"
                        value={borrowAmount}
                        onChange={(e) => setBorrowAmount(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1, fontSize: '1rem' }}
                    />
                    <Button onClick={() => handleAction('loan', borrowAmount)}>申請</Button>
                </div>
            </Card>

            {/* Repay */}
            <Card title="借金を返す" padding="md">
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    お金があるときに少しずつ返そう。
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="number"
                        placeholder="返す枚数"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1, fontSize: '1rem' }}
                    />
                    <Button variant="success" onClick={() => handleAction('repay', repayAmount)}>返済申請</Button>
                </div>
            </Card>
        </div>
    );
}
