'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BankerRoulettePage() {
    const { gameState } = useGame();
    const [items, setItems] = useState<{ id: number; text: string; effect: string }[]>([]);

    useEffect(() => {
        if (gameState?.roulette?.items) {
            setItems(gameState.roulette.items);
        }
    }, [gameState]);

    const handleSave = async () => {
        if (!confirm('変更を保存しますか？')) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_roulette_config',
                items: items
            })
        });
        alert('保存しました');
    };

    const handleChange = (index: number, field: string, value: string) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleAdd = () => {
        const maxId = items.length > 0 ? Math.max(...items.map(i => i.id)) : 0;
        setItems([...items, { id: maxId + 1, text: '新しい項目', effect: 'none' }]);
    };

    const handleDelete = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const effectOptions = [
        { value: 'none', label: '効果なし' },
        { value: 'bonus_1000', label: 'ボーナス (+1000)' },
        { value: 'bonus_300', label: 'ボーナス (+300)' },
        { value: 'sick_cold', label: '風邪 (-50)' },
        { value: 'lost_100', label: '財布紛失 (-100)' },
        { value: 'pop_up', label: '人気者 (+10人気)' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ルーレット設定</h2>
                <Button onClick={handleSave} variant="primary">保存する</Button>
            </div>

            <Card padding="md">
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {items.map((item, index) => (
                        <div key={item.id || index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                            <div style={{ width: '30px', textAlign: 'center' }}>#{index + 1}</div>
                            <input
                                type="text"
                                value={item.text}
                                onChange={(e) => handleChange(index, 'text', e.target.value)}
                                style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                placeholder="項目名"
                            />
                            <select
                                value={item.effect}
                                onChange={(e) => handleChange(index, 'effect', e.target.value)}
                                style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                            >
                                {effectOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <div style={{ width: '100px' }}>
                                <input
                                    type="number"
                                    value={item.weight || 1}
                                    onChange={(e) => handleChange(index, 'weight', Number(e.target.value))}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                    placeholder="確率"
                                    min="1"
                                    title="数字が大きいほど当たりやすい"
                                />
                            </div>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(index)}>削除</Button>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>※確率: 数字が大きいほど当たりやすくなります（例: 10は1の10倍当たりやすい）</p>
                    <Button variant="ghost" onClick={handleAdd} fullWidth>+ 項目を追加</Button>
                </div>
            </Card>
        </div>
    );
}
