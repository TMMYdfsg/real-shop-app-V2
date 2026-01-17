'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function PlayerHome() {
    const { gameState, currentUser } = useGame();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const handleNameChange = async () => {
        if (!newName.trim()) {
            alert('名前を入力してください');
            return;
        }

        try {
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'update_profile',
                    requesterId: currentUser.id,
                    details: JSON.stringify({ name: newName.trim() })
                })
            });
            setIsEditingName(false);
        } catch (error) {
            alert('名前の変更に失敗しました');
        }
    };

    // 売上ランキング
    const ranking = [...gameState.users]
        .filter(u => u.role === 'player')
        .sort((a, b) => b.balance - a.balance); // シンプルに所持金でランキング (本来は総売上等だが現状balance)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Player Name Card */}
            <Card padding="md" style={{ background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', border: '2px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontSize: '2rem' }}>👤</div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>プレイヤー名</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentUser.name}</div>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setNewName(currentUser.name);
                            setIsEditingName(true);
                        }}
                        style={{ fontSize: '1.2rem' }}
                    >
                        ✏️
                    </Button>
                </div>
            </Card>

            {/* Main Stats */}
            <Card className="glass-panel" padding="lg" style={{ background: 'linear-gradient(135deg, var(--accent-color), #818cf8)', color: 'white', border: 'none' }}>
                <div style={{ marginBottom: '0.5rem', opacity: 0.9 }}>現在の所持金</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                    {(currentUser.balance || 0).toLocaleString()} 枚
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

            {/* Name Edit Modal */}
            <Modal isOpen={isEditingName} onClose={() => setIsEditingName(false)} title="名前を変更">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>新しい名前</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="名前を入力してください"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '1rem'
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleNameChange();
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button fullWidth onClick={handleNameChange}>変更を保存</Button>
                        <Button fullWidth variant="ghost" onClick={() => setIsEditingName(false)}>キャンセル</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
