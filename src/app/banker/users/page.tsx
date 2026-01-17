'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { JOB_GAME_CONFIGS } from '@/lib/jobData';
import { JobType } from '@/lib/jobData';

export default function BankerUsersPage() {
    const { gameState } = useGame();

    if (!gameState) return <div>Loading...</div>;

    const handleJobChange = async (userId: string, newJob: string) => {
        if (!confirm(`${newJob} に強制変更しますか？`)) return;

        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'force_change_job',
                    targetUserId: userId,
                    newJob
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change job');
            }

            // Refresh data
            // Note: refreshGameState might not be available in context if not exported, checking Context.
            // If refreshGameState is not available, we can rely on standard polling or reload.
            // Assuming refreshGameState was available or we reload.
            window.location.reload();
        } catch (error) {
            console.error('Error forcing job change:', error);
            alert(`職業変更に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>ユーザー管理 (職業管理)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {gameState.users.map(user => (
                    <Card key={user.id} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.name}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>
                                {user.role === 'banker' ? (
                                    '銀行員'
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <label htmlFor={`job-select-${user.id}`} style={{ fontSize: '0.9rem' }}>職業:</label>
                                        <select
                                            id={`job-select-${user.id}`}
                                            value={user.job || 'unemployed'}
                                            onChange={(e) => handleJobChange(user.id, e.target.value)}
                                            style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        >
                                            {Object.keys(JOB_GAME_CONFIGS).map((jobKey) => (
                                                <option key={jobKey} value={jobKey}>
                                                    {JOB_GAME_CONFIGS[jobKey as JobType].name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
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
