'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RoulettePreset, RouletteSettings, RouletteItem } from '@/types';

const DEFAULT_SETTINGS: RouletteSettings = {
    wheelFontSize: 14,
    resultFontSize: 22,
    spinDurationMs: 3500,
    autoScroll: true
};

const buildEmptyPreset = (name: string, id: string): RoulettePreset => ({
    id,
    name,
    items: [
        { id: 1, text: '項目を入力', effect: 'none', weight: 1, color: '#bae6fd' }
    ],
    settings: { ...DEFAULT_SETTINGS }
});

export default function BankerRoulettePage() {
    const { gameState } = useGame();
    const [presets, setPresets] = useState<RoulettePreset[]>([]);
    const [activePresetId, setActivePresetId] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [rouletteCost, setRouletteCost] = useState<number>(0);

    useEffect(() => {
        if (!gameState) return;
        const storedPresets = gameState.roulettePresets || [];
        setPresets(storedPresets);
        setActivePresetId(gameState.rouletteActivePresetId || storedPresets[0]?.id || '');
    }, [gameState]);

    const activePreset = useMemo(() => {
        return presets.find(p => p.id === activePresetId) || presets[0];
    }, [presets, activePresetId]);

    const updateActivePreset = (updater: (preset: RoulettePreset) => RoulettePreset) => {
        if (!activePreset) return;
        setPresets((prev) => prev.map(p => p.id === activePreset.id ? updater(p) : p));
    };

    const handleSpin = async () => {
        if (!confirm(`ルーレットを実行しますか？ (参加費: ${rouletteCost}枚)`)) return;
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'spin_roulette',
                requestId: selectedUser || undefined,
                amount: rouletteCost
            })
        });
        alert('ルーレットを回しました！結果はニュースを確認してください。');
    };

    const handleSave = async () => {
        if (!activePresetId) return;
        if (!confirm('変更を保存しますか？')) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_roulette_config',
                presets,
                activePresetId,
                items: activePreset?.items || []
            })
        });
        alert('保存しました');
    };

    const handleAddItem = () => {
        if (!activePreset) return;
        const nextId = activePreset.items.length > 0 ? Math.max(...activePreset.items.map(i => i.id)) + 1 : 1;
        const nextItem: RouletteItem = {
            id: nextId,
            text: `項目${nextId}`,
            effect: 'none',
            weight: 1,
            color: '#e2e8f0'
        };
        updateActivePreset((preset) => ({
            ...preset,
            items: [...preset.items, nextItem]
        }));
    };

    const handleDeleteItem = (index: number) => {
        if (!activePreset) return;
        const nextItems = activePreset.items.filter((_, i) => i !== index);
        updateActivePreset((preset) => ({
            ...preset,
            items: nextItems
        }));
    };

    const handleClearItems = () => {
        if (!activePreset) return;
        updateActivePreset((preset) => ({
            ...preset,
            items: []
        }));
    };

    const handlePresetAdd = () => {
        const name = prompt('保存名を入力してください')?.trim();
        if (!name) return;
        const id = crypto.randomUUID();
        const newPreset = buildEmptyPreset(name, id);
        setPresets((prev) => [...prev, newPreset]);
        setActivePresetId(id);
    };

    const handlePresetDelete = (presetId: string) => {
        if (!confirm('このルーレットを削除しますか？')) return;
        setPresets((prev) => prev.filter(p => p.id !== presetId));
        if (activePresetId === presetId) {
            const next = presets.find(p => p.id !== presetId);
            setActivePresetId(next?.id || '');
        }
    };

    const handlePresetRename = (presetId: string) => {
        const name = prompt('保存名を変更', presets.find(p => p.id === presetId)?.name || '')?.trim();
        if (!name) return;
        setPresets((prev) => prev.map(p => p.id === presetId ? { ...p, name } : p));
    };

    const handleItemChange = (index: number, field: keyof RouletteItem, value: string | number) => {
        if (!activePreset) return;
        const nextItems = [...activePreset.items];
        // @ts-ignore
        nextItems[index][field] = value;
        updateActivePreset((preset) => ({
            ...preset,
            items: nextItems
        }));
    };

    const handleSettingChange = (patch: Partial<RouletteSettings>) => {
        if (!activePreset) return;
        updateActivePreset((preset) => ({
            ...preset,
            settings: { ...preset.settings, ...patch }
        }));
    };

    if (!gameState) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-white text-slate-900 px-4 pb-10">
            <div className="max-w-5xl mx-auto pt-6 space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-black">ルーレット設定</h2>
                        <p className="text-sm text-slate-500">保存リストからルーレットを切替・編集できます。</p>
                    </div>
                    <Button onClick={handleSave} variant="primary">保存する</Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <Card padding="md" className="border border-slate-200 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold text-slate-600">保存リスト</div>
                            <Button size="sm" variant="secondary" onClick={handlePresetAdd}>追加</Button>
                        </div>
                        <div className="space-y-2">
                            {presets.map(preset => (
                                <div
                                    key={preset.id}
                                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${activePresetId === preset.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}
                                >
                                    <button className="flex-1 text-left font-semibold" onClick={() => setActivePresetId(preset.id)}>
                                        {preset.name}
                                    </button>
                                    <button className="text-slate-400 hover:text-slate-700" onClick={() => handlePresetRename(preset.id)}>✏️</button>
                                    <button className="ml-2 text-slate-400 hover:text-rose-500" onClick={() => handlePresetDelete(preset.id)}>✕</button>
                                </div>
                            ))}
                            {presets.length === 0 && (
                                <div className="text-xs text-slate-400">保存されたルーレットがありません。</div>
                            )}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card padding="md" className="border border-slate-200 bg-white">
                            <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
                                <div className="text-sm font-semibold text-slate-600">項目編集</div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" onClick={handleAddItem}>追加</Button>
                                    <Button size="sm" variant="danger" onClick={handleClearItems}>全て削除</Button>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {activePreset?.items.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-[40px_1fr_90px_36px] gap-2 items-center">
                                        <input
                                            type="color"
                                            value={item.color || '#e2e8f0'}
                                            onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                                            className="w-10 h-10 rounded-lg border border-slate-200"
                                        />
                                        <input
                                            type="text"
                                            value={item.text}
                                            onChange={(e) => handleItemChange(index, 'text', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                            placeholder="項目名"
                                        />
                                        <input
                                            type="number"
                                            value={item.weight || 1}
                                            onChange={(e) => handleItemChange(index, 'weight', Number(e.target.value))}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                            min="1"
                                        />
                                        <button
                                            className="w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:text-rose-500"
                                            onClick={() => handleDeleteItem(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card padding="md" className="border border-slate-200 bg-white">
                            <div className="text-sm font-semibold text-slate-600 mb-4">設定</div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <label className="text-sm text-slate-600">
                                    ルーレットのフォントサイズ
                                    <input
                                        type="number"
                                        value={activePreset?.settings?.wheelFontSize || DEFAULT_SETTINGS.wheelFontSize}
                                        onChange={(e) => handleSettingChange({ wheelFontSize: Number(e.target.value) })}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    />
                                </label>
                                <label className="text-sm text-slate-600">
                                    抽選結果のフォントサイズ
                                    <input
                                        type="number"
                                        value={activePreset?.settings?.resultFontSize || DEFAULT_SETTINGS.resultFontSize}
                                        onChange={(e) => handleSettingChange({ resultFontSize: Number(e.target.value) })}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    />
                                </label>
                                <label className="text-sm text-slate-600">
                                    抽選演出の長さ
                                    <select
                                        value={activePreset?.settings?.spinDurationMs || DEFAULT_SETTINGS.spinDurationMs}
                                        onChange={(e) => handleSettingChange({ spinDurationMs: Number(e.target.value) })}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    >
                                        <option value={2200}>短い</option>
                                        <option value={3200}>ふつう</option>
                                        <option value={4200}>長い</option>
                                        <option value={5200}>すごく長い</option>
                                    </select>
                                </label>
                                <label className="text-sm text-slate-600 flex items-center gap-3">
                                    自動でスクロール
                                    <input
                                        type="checkbox"
                                        checked={activePreset?.settings?.autoScroll ?? true}
                                        onChange={(e) => handleSettingChange({ autoScroll: e.target.checked })}
                                    />
                                </label>
                            </div>
                        </Card>

                        <Card padding="md" className="border border-slate-200 bg-white">
                            <div className="text-sm font-semibold text-slate-600 mb-4">ルーレット実行</div>
                            <div className="grid gap-4">
                                <label className="text-sm text-slate-600">
                                    ターゲットユーザー（任意）
                                    <select
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                                    >
                                        <option value="">全員</option>
                                        {gameState?.users.filter(u => u.role === 'player').map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="text-sm text-slate-600">
                                    参加費 (枚)
                                    <input
                                        type="number"
                                        value={rouletteCost}
                                        onChange={e => setRouletteCost(Number(e.target.value))}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                                        min="0"
                                    />
                                </label>
                                <Button variant="primary" onClick={handleSpin}>
                                    {selectedUser ? '選択したユーザーで回す' : '全員で回す'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
