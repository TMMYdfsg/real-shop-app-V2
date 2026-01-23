'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { RouletteWheel } from '@/components/minigames/RouletteWheel';

export default function RouletteViewPage() {
    const { gameState, currentUser } = useGame();
    const [isSpinning, setIsSpinning] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const lastResultTimeRef = useRef<number>(0);
    const [spinTargetIndex, setSpinTargetIndex] = useState<number | null>(null);

    const items = useMemo(() => {
        if (!gameState?.roulette.items || gameState.roulette.items.length === 0) {
            return [{ id: 1, text: 'No Data', effect: 'none', weight: 1, color: '#e2e8f0' }];
        }
        return gameState.roulette.items;
    }, [gameState?.roulette.items]);

    const activePreset = useMemo(() => {
        if (!gameState?.roulettePresets?.length) return null;
        return gameState.roulettePresets.find(p => p.id === gameState.rouletteActivePresetId) || gameState.roulettePresets[0];
    }, [gameState?.roulettePresets, gameState?.rouletteActivePresetId]);

    useEffect(() => {
        if (!gameState?.roulette.currentResult) return;
        const result = gameState.roulette.currentResult;

        if (result.timestamp > lastResultTimeRef.current) {
            const idx = items.findIndex(i => i.text === result.text);
            if (idx !== -1) {
                lastResultTimeRef.current = result.timestamp;
                setSpinTargetIndex(idx);
                setShowResult(false);
                setIsSpinning(true);
            }
        } else if (!isSpinning && !showResult) {
            setShowResult(true);
            setSpinTargetIndex(items.findIndex(i => i.text === result.text));
        }
    }, [gameState?.roulette.currentResult, items, isSpinning, showResult]);

    const handleSpinComplete = () => {
        setIsSpinning(false);
        setShowResult(true);
        const audio = new Audio('/sounds/fanfare.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });
    };

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const result = gameState.roulette.currentResult;
    let targetDisplay = '全員';
    if (result?.targetUserId) {
        if (result.targetUserId === currentUser.id) {
            targetDisplay = 'あなた';
        } else {
            const targetUser = gameState.users.find(u => u.id === result.targetUserId);
            targetDisplay = targetUser ? targetUser.name : '指定ユーザー';
        }
    }

    return (
        <div className="min-h-[80vh] bg-white text-slate-900 px-4 pb-12">
            <div className="max-w-3xl mx-auto">
                <div className="pt-6 pb-4 flex flex-col gap-2">
                    <h2 className="text-2xl font-black">ルーレット</h2>
                    <div className="text-sm text-slate-500">
                        現在のルーレット: <span className="font-semibold text-slate-800">{activePreset?.name || '未設定'}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <RouletteWheel
                        items={items}
                        resultIndex={spinTargetIndex}
                        isSpinning={isSpinning}
                        onComplete={handleSpinComplete}
                        fontSize={activePreset?.settings?.wheelFontSize || 14}
                        spinDurationMs={activePreset?.settings?.spinDurationMs || 3200}
                    />

                    <Card padding="md" className="w-full max-w-xl bg-white border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-500 mb-3">景品リスト</h3>
                        <div className="grid grid-cols-[min-content_1fr_min-content] gap-3 items-center">
                            {items.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <div
                                        className="w-6 h-6 rounded-full border border-slate-200"
                                        style={{ background: item.color || '#e2e8f0' }}
                                    />
                                    <div className={`text-sm ${item.text === result?.text ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                        {item.text}
                                    </div>
                                    <div className="text-xs text-slate-400">{item.weight || 1}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    </Card>

                    {showResult && result && (
                        <Card padding="lg" className="w-full max-w-xl border-2 border-amber-300 bg-white">
                            <div className="text-xs text-slate-500 mb-2">{new Date(result.timestamp).toLocaleTimeString()}</div>
                            <div
                                className="font-black text-slate-900 text-center rounded-xl border border-slate-200 bg-slate-50 py-3"
                                style={{ fontSize: activePreset?.settings?.resultFontSize || 20 }}
                            >
                                {result.text}
                            </div>
                            <div className="mt-3 text-sm text-slate-600 text-center">
                                対象: <span className="font-bold text-rose-500">{targetDisplay}</span>
                            </div>
                            {result.roulettePresetName && (
                                <div className="mt-2 text-xs text-slate-500 text-center">
                                    ルーレット名: {result.roulettePresetName}
                                </div>
                            )}
                        </Card>
                    )}

                    {!isSpinning && !showResult && !result && (
                        <div className="text-sm text-slate-400">銀行員の合図を待ってください...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
