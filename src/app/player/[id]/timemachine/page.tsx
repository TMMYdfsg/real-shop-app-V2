'use client';

export const dynamic = "force-dynamic";

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/ToastProvider';

export default function TimeMachinePage() {
    const { gameState, currentUser, sendRequest } = useGame();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { addToast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    if (!currentUser || currentUser.id !== params.id) {
        return <div className="p-8 text-center">Unauthorized</div>;
    }

    const currentEra = currentUser.timeEra || 'present';

    const handleTravel = async (targetEra: 'present' | 'past' | 'future') => {
        if (targetEra === currentEra) return;

        // Cost calculation
        // Present -> Past/Future: 10% of balance (min 1000)
        // Past/Future -> Present: Free? Or fixed cost? Let's say free to return for now.
        // Past <-> Future: Expensive? 

        let cost = 0;
        if (targetEra !== 'present' && currentEra === 'present') {
            cost = Math.max(1000, Math.floor(currentUser.balance * 0.1));
        } else if (targetEra !== 'present' && currentEra !== 'present') {
            cost = Math.max(5000, Math.floor(currentUser.balance * 0.2));
        }

        if (currentUser.balance < cost) {
            addToast(`エネルギー不足... 資金が${cost}枚必要です`, 'error');
            return;
        }

        if (!confirm(`${targetEra === 'past' ? '過去' : targetEra === 'future' ? '未来' : '現在'}へ移動しますか？\n消費: ${cost}枚`)) return;

        setIsProcessing(true);
        try {
            await sendRequest('travel_time', 0, JSON.stringify({ targetEra, cost }));
            addToast('時間移動に成功しました', 'success');
            router.refresh();
        } catch (error) {
            console.error(error);
            addToast('移動に失敗しました', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInvestment = async () => {
        const amountStr = prompt('未来への投資額を入力してください（危険度高）\n※成功すれば倍増、失敗すれば全額損失');
        if (!amountStr) return;
        const amount = Number(amountStr);

        if (isNaN(amount) || amount <= 0) return;
        if (amount > currentUser.balance) {
            addToast('資金が足りません', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'future_investment',
                    requesterId: currentUser.id,
                    details: JSON.stringify({ amount })
                })
            });
            const data = await res.json();
            if (data.success) {
                addToast(data.message, data.profit > 0 ? 'success' : 'info');
                router.refresh();
            } else {
                addToast('エラー: ' + data.message, 'error');
            }
        } catch (e) {
            addToast('通信エラー', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pb-24">
            <h1 className="text-3xl font-bold mb-6 text-center">TIME MACHINE</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* PAST */}
                <Card
                    padding="lg"
                    className={`relative overflow-hidden cursor-pointer transition-all hover:scale-105 ${currentEra === 'past' ? 'ring-4 ring-amber-500' : 'opacity-70 grayscale hover:grayscale-0'}`}
                    onClick={() => handleTravel('past')}
                >
                    <div className="absolute inset-0 bg-sepia-200 opacity-20 pointer-events-none"></div>
                    <div className="text-4xl mb-4 text-center">🕰️</div>
                    <h2 className="text-xl font-bold text-center mb-2 font-serif">PAST (1950s)</h2>
                    <p className="text-sm text-center">古き良き時代。</p>
                    {currentEra !== 'past' && (
                        <div className="mt-4 text-center text-xs font-bold bg-amber-100 text-amber-900 py-1 rounded">
                            移動コスト: 変動
                        </div>
                    )}
                </Card>

                {/* PRESENT */}
                <Card
                    padding="lg"
                    className={`relative overflow-hidden cursor-pointer transition-all hover:scale-105 ${currentEra === 'present' ? 'ring-4 ring-green-500' : 'opacity-70 grayscale hover:grayscale-0'}`}
                    onClick={() => handleTravel('present')}
                >
                    <div className="text-4xl mb-4 text-center">🏠</div>
                    <h2 className="text-xl font-bold text-center mb-2">PRESENT</h2>
                    <p className="text-sm text-center">我々の生きる現在。</p>
                </Card>

                {/* FUTURE */}
                <Card
                    padding="lg"
                    className={`relative overflow-hidden cursor-pointer transition-all hover:scale-105 ${currentEra === 'future' ? 'ring-4 ring-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.5)]' : 'opacity-70 grayscale hover:grayscale-0'}`}
                    onClick={() => handleTravel('future')}
                >
                    <div className="text-4xl mb-4 text-center">🚀</div>
                    <h2 className="text-xl font-bold text-center mb-2 font-mono">FUTURE</h2>
                    <p className="text-sm text-center">未知なるテクノロジー。</p>
                    {currentEra !== 'future' && (
                        <div className="mt-4 text-center text-xs font-bold bg-cyan-900 text-cyan-100 py-1 rounded">
                            移動コスト: 変動
                        </div>
                    )}
                </Card>
            </div>

            {/* ERA SPECIFIC ACTIONS */}
            <AnimatePresence mode="wait">
                {currentEra === 'future' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-6 bg-black/80 rounded-xl border border-cyan-500/50 shadow-lg text-cyan-50"
                    >
                        <h3 className="text-2xl font-bold mb-4 font-mono text-cyan-400">FUTURE TERMINAL</h3>
                        <p className="mb-6">未来の株式市場へのアクセスが可能です。ハイリスク・ハイリターンな投資を行いますか？</p>
                        <Button
                            fullWidth
                            disabled={isProcessing}
                            onClick={handleInvestment}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-lg py-4 shadow-[0_0_15px_cyan]"
                        >
                            未来技術へ投資する (Win: x1.5~5.0 / Lose: x0)
                        </Button>
                    </motion.div>
                )}

                {currentEra === 'past' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-6 bg-[#fdf6e3] rounded-xl border-4 border-double border-[#8b4513] text-[#5d4037]"
                    >
                        <h3 className="text-2xl font-bold mb-4 font-serif text-[#8b4513]">OLD NEWSPAPER</h3>
                        <p className="mb-4 font-serif italic">"本日のニュース: 高度経済成長の波、到る。"</p>
                        <p>この時代では、物価が少し安く感じるかもしれません...（未実装: 物価変動ロジック）</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 text-center text-xs opacity-50">
                Time Machine v1.0 - Coordinates: {currentEra.toUpperCase()}
            </div>
        </div>
    );
}
