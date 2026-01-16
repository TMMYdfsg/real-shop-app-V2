'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BankPage() {
    const { gameState, currentUser } = useGame();
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!currentUser) return <div>Loading...</div>;

    const handleAction = async (type: 'deposit' | 'withdraw') => {
        if (!amount || Number(amount) <= 0) return;
        setIsProcessing(true);

        const val = Number(amount);
        if (type === 'deposit' && currentUser.balance < val) {
            alert('お金が足りません');
            setIsProcessing(false);
            return;
        }
        if (type === 'withdraw' && currentUser.deposit < val) {
            alert('貯金が足りません');
            setIsProcessing(false);
            return;
        }

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: type,
                requesterId: currentUser.id,
                amount: val
            })
        });

        alert('完了しました');
        setAmount('');
        setIsProcessing(false);
        window.location.reload();
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>貯金 (銀行)</h2>

            <Card padding="lg" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>現在の貯金額</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {currentUser.deposit.toLocaleString()} 枚
                </div>
            </Card>

            <Card padding="lg">
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>金額を入力</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        placeholder="0"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Button
                        onClick={() => handleAction('deposit')}
                        disabled={isProcessing || !amount}
                        style={{ height: '60px', fontSize: '1.2rem', background: '#3b82f6' }}
                    >
                        預ける
                    </Button>
                    <Button
                        onClick={() => handleAction('withdraw')}
                        disabled={isProcessing || !amount}
                        variant="secondary"
                        style={{ height: '60px', fontSize: '1.2rem' }}
                    >
                        引き出す
                    </Button>
                </div>
            </Card>

            <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                ※ 収入の{gameState?.settings.salaryAutoSafeRate ? gameState.settings.salaryAutoSafeRate * 100 : 50}%は自動的に貯金されます。<br />
                ※ 貯金は安全ですが、イベントで没収される可能性もあります（未実装）。
            </div>
        </div>
    );
}
