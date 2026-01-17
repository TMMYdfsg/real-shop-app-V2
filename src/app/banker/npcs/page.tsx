'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NPCTemplate, NPC } from '@/types';

export default function BankerNPCsPage() {
    const { gameState } = useGame();
    const [templates, setTemplates] = useState<NPCTemplate[]>([]);
    const [activeNPCs, setActiveNPCs] = useState<NPC[]>([]);

    useEffect(() => {
        if (gameState?.npcTemplates) {
            setTemplates(gameState.npcTemplates);
        }
        if (gameState?.activeNPCs) {
            setActiveNPCs(gameState.activeNPCs);
        } else {
            setActiveNPCs([]);
        }
    }, [gameState]);

    const handleSave = async () => {
        if (!confirm('変更を保存しますか？')) return;
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_npc_templates',
                templates: templates
            })
        });
        alert('保存しました');
    };

    const handleChange = (index: number, field: keyof NPCTemplate, value: any) => {
        const newTemplates = [...templates];
        // @ts-ignore
        newTemplates[index][field] = value;
        setTemplates(newTemplates);
    };

    const handleAdd = () => {
        setTemplates([...templates, {
            id: `npc_${Date.now()}`,
            name: '新しいNPC',
            description: '',
            duration: 60000,
            spawnRate: 10,
            actionType: 'buy',
            minPayment: 100,
            maxPayment: 500
        }]);
    };

    const handleDelete = (index: number) => {
        if (!confirm('テンプレートを削除しますか？')) return;
        const newTemplates = [...templates];
        newTemplates.splice(index, 1);
        setTemplates(newTemplates);
    };

    const handleForceDeleteNPC = async (npcId: string) => {
        if (!confirm('このNPCを強制的に消去しますか？')) return;
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete_active_npc',
                npcId: npcId
            })
        });
        // Optimistic update handled by swr next tick usually, but forced refresh might be good or just wait.
        // Also removed from local state for instant feedback
        setActiveNPCs(prev => prev.filter(n => n.id !== npcId));
    };

    const getUserName = (userId: string) => {
        return gameState?.users.find(u => u.id === userId)?.name || userId;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>NPC管理</h2>
                <Button onClick={handleSave} variant="primary">保存する</Button>
            </div>

            {/* Active NPCs Section */}
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>現在のアクティブNPC ({activeNPCs.length})</h3>
                {activeNPCs.length === 0 && <p style={{ color: '#888' }}>現在店舗にいるNPCはいません。</p>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {activeNPCs.map(npc => {
                        const template = templates.find(t => t.id === npc.templateId);
                        const role = template?.name || npc.type;
                        const timeLeft = Math.max(0, Math.floor((npc.leaveTime - Date.now()) / 1000));

                        return (
                            <Card key={npc.id} padding="sm" style={{ borderLeft: '4px solid #ef4444' }}>
                                <div style={{ fontWeight: 'bold' }}>{role} ({npc.name})</div>
                                <div style={{ fontSize: '0.8rem' }}>客: {getUserName(npc.targetUserId)}</div>
                                <div style={{ fontSize: '0.8rem', color: timeLeft > 0 ? 'green' : 'red' }}>
                                    残り時間: {timeLeft}秒 {timeLeft <= 0 && '(タイムアウト済み)'}
                                </div>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    style={{ marginTop: '0.5rem', width: '100%' }}
                                    onClick={() => handleForceDeleteNPC(npc.id)}
                                >
                                    強制退去させる
                                </Button>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>NPCテンプレート設定</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {templates.map((template, index) => (
                    <Card key={template.id} padding="md" style={{ position: 'relative' }}>
                        <Button
                            variant="danger"
                            size="sm"
                            style={{ position: 'absolute', top: '1rem', right: '1rem' }}
                            onClick={() => handleDelete(index)}
                        >
                            削除
                        </Button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>名前</label>
                                <input
                                    type="text"
                                    value={template.name}
                                    onChange={e => handleChange(index, 'name', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>説明</label>
                                <input
                                    type="text"
                                    value={template.description}
                                    onChange={e => handleChange(index, 'description', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>行動タイプ</label>
                                <select
                                    value={template.actionType}
                                    onChange={e => handleChange(index, 'actionType', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                >
                                    <option value="buy">買い物 (お金を払う)</option>
                                    <option value="steal_money">泥棒 (お金を盗む)</option>
                                    <option value="scam">詐欺 (お金を騙し取る)</option>
                                    {/* steal_items is not fully implemented yet */}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>出現確率 (%)</label>
                                <input
                                    type="number"
                                    value={template.spawnRate}
                                    onChange={e => handleChange(index, 'spawnRate', Number(e.target.value))}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                    min="0" max="100"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>滞在時間 (ms)</label>
                                <input
                                    type="number"
                                    value={template.duration}
                                    onChange={e => handleChange(index, 'duration', Number(e.target.value))}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>

                            {template.actionType === 'buy' && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>支払最小額</label>
                                        <input type="number" value={template.minPayment || 0} onChange={e => handleChange(index, 'minPayment', Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>支払最大額</label>
                                        <input type="number" value={template.maxPayment || 0} onChange={e => handleChange(index, 'maxPayment', Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    </div>
                                </>
                            )}

                            {(template.actionType === 'steal_money' || template.actionType === 'scam') && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>被害最小額</label>
                                        <input type="number" value={template.minStealAmount || 0} onChange={e => handleChange(index, 'minStealAmount', Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>被害最大額</label>
                                        <input type="number" value={template.maxStealAmount || 0} onChange={e => handleChange(index, 'maxStealAmount', Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            <Button variant="ghost" onClick={handleAdd} style={{ marginTop: '1rem', width: '100%' }}>+ NPCを追加</Button>
        </div>
    );
}
