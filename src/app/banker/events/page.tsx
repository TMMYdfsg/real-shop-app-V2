'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BankerEventsPage() {
    const { gameState } = useGame();
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedNpcType, setSelectedNpcType] = useState<string>('guest');

    const handleSpawn = async () => {
        if (!selectedUser) {
            alert('ユーザーを選択してください');
            return;
        }
        if (!confirm('NPCを派遣しますか？')) return;

        await fetch('/api/admin', {
            method: 'POST',
            body: JSON.stringify({
                action: 'spawn_npc',
                targetUserId: selectedUser,
                npcType: selectedNpcType
            })
        });
        alert('派遣しました');
    };



    if (!gameState) return <div>Loading...</div>;

    const players = gameState.users.filter(u => u.role === 'player');

    return (
        <div style={{ padding: '1rem' }}>
            <h2>イベント管理</h2>
            <Card padding="md" style={{ marginTop: '1rem' }}>
                <h3>NPC派遣</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>ターゲット店舗</label>
                        <select
                            style={{ padding: '0.5rem', width: '100%' }}
                            value={selectedUser}
                            onChange={e => setSelectedUser(e.target.value)}
                        >
                            <option value="">選択してください</option>
                            {players.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Shop: {p.shopName || 'No Name'})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>NPCタイプ</label>
                        <select
                            style={{ padding: '0.5rem', width: '100%' }}
                            value={selectedNpcType}
                            onChange={e => setSelectedNpcType(e.target.value)}
                        >
                            <option value="guest">一般客 (買い物)</option>
                            <option value="rich_guest">富豪 (爆買い)</option>
                            <option value="thief">怪しい男 (泥棒)</option>
                            <option value="scammer">自称投資家 (詐欺)</option>
                        </select>
                    </div>

                    <Button variant="danger" onClick={handleSpawn}>
                        NPCを派遣する
                    </Button>
                </div>
            </Card>

            <Card padding="md" style={{ marginTop: '1rem' }}>
                <h3>現在活動中のNPC</h3>
                {gameState.activeNPCs && gameState.activeNPCs.length > 0 ? (
                    <ul>
                        {gameState.activeNPCs.map(npc => {
                            const target = gameState.users.find(u => u.id === npc.targetUserId);
                            return (
                                <li key={npc.id}>
                                    {npc.name} (@{target?.name}) - 残り {Math.ceil((npc.leaveTime - Date.now()) / 1000)}秒
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>活動中のNPCはいません</p>
                )}
            </Card>


        </div>
    );
}
