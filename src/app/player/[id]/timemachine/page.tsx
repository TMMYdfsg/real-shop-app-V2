'use client';

export const dynamic = "force-dynamic";

import React, { useMemo, useState } from 'react';
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
    const [futureTab, setFutureTab] = useState<'race' | 'slot' | 'timeline'>('race');
    const [horseBet, setHorseBet] = useState('1000');
    const [selectedHorse, setSelectedHorse] = useState(1);
    const [slotBet, setSlotBet] = useState('500');
    const [slotResult, setSlotResult] = useState<string[]>([]);

    if (!currentUser || currentUser.id !== params.id) {
        return <div className="p-8 text-center">Unauthorized</div>;
    }

    const currentEra = currentUser.timeEra || 'present';

    const horseOptions = useMemo(() => ([
        { id: 1, name: 'ネオンブレイズ', odds: 2.5 },
        { id: 2, name: 'クロノスウィング', odds: 3.2 },
        { id: 3, name: 'ルミナスラン', odds: 4.1 },
        { id: 4, name: 'オーロラステップ', odds: 5.5 }
    ]), []);

    const timelineItems = useMemo(() => ([
        { year: '2061', text: '量子ネットワークが世界標準に。情報伝送が瞬時化。' },
        { year: '2075', text: '都市AIにより渋滞・犯罪率が大幅低下。' },
        { year: '2088', text: '火星コロニー正式稼働、宇宙物流が日常化。' },
        { year: '2094', text: '感情シンクロ通信が普及、遠隔会話が没入型に。' },
        { year: '2100', text: '未来暦2100到達。個別最適化社会が完成。' }
    ]), []);

    const pastRestrictions = useMemo(() => ([
        { icon: '📵', title: 'スマホ/通信', detail: 'スマホ・SNS・動画などの通信系は利用不可。' },
        { icon: '📈', title: '株式市場', detail: '株取引・投資系の機能は停止。' },
        { icon: '🎰', title: 'カジノ', detail: '電子系ギャンブルは時代的に不可。' },
        { icon: '🛰️', title: '先端テクノロジー', detail: '現代/未来に存在する技術の多くが封印。' }
    ]), []);

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
            if (targetEra === 'past') {
                const audio = new Audio('/sounds/coingame.mp3');
                audio.volume = 0.7;
                audio.play().catch(() => { });
            }
            if (targetEra === 'future') {
                const audio = new Audio('/sounds/Cyber09-1.mp3');
                audio.volume = 0.7;
                audio.play().catch(() => { });
            }
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

    const handleFutureRace = async () => {
        if (currentEra !== 'future') return;
        const bet = Number(horseBet);
        if (!Number.isFinite(bet) || bet <= 0) {
            addToast('賭け金を入力してください', 'error');
            return;
        }
        if (bet > currentUser.balance) {
            addToast('資金が足りません', 'error');
            return;
        }
        setIsProcessing(true);
        try {
            const winner = Math.floor(Math.random() * horseOptions.length) + 1;
            const option = horseOptions.find((item) => item.id === selectedHorse);
            const payout = winner === selectedHorse && option ? Math.floor(bet * option.odds) : 0;
            await sendRequest('gamble_horse', bet, { payout, selectedHorse, winner });
            addToast(
                payout > 0
                    ? `的中！配当 ${payout.toLocaleString()} 枚`
                    : `ハズレ… 勝者は馬${winner}`,
                payout > 0 ? 'success' : 'info'
            );
            router.refresh();
        } catch (error) {
            console.error(error);
            addToast('競馬結果の処理に失敗しました', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFutureSlot = async () => {
        if (currentEra !== 'future') return;
        const bet = Number(slotBet);
        if (!Number.isFinite(bet) || bet <= 0) {
            addToast('賭け金を入力してください', 'error');
            return;
        }
        if (bet > currentUser.balance) {
            addToast('資金が足りません', 'error');
            return;
        }
        setIsProcessing(true);
        try {
            const symbols = ['◆', '▲', '●', '★', '✦', '■'];
            const result = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
            setSlotResult(result);
            const isJackpot = result.every((item) => item === result[0]);
            const isPair = !isJackpot && (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]);
            const payout = isJackpot ? bet * 6 : isPair ? bet * 2 : 0;
            const message = isJackpot ? 'ジャックポット' : isPair ? 'ペア' : 'ハズレ';
            await sendRequest('gamble_slot', bet, { payout, message });
            addToast(
                payout > 0 ? `${message}！配当 ${payout.toLocaleString()} 枚` : 'ハズレ…',
                payout > 0 ? 'success' : 'info'
            );
            router.refresh();
        } catch (error) {
            console.error(error);
            addToast('スロット結果の処理に失敗しました', 'error');
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
                        <p className="mb-6">未来の娯楽・予測プラットフォームへアクセスできます。</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                { key: 'race', label: '量子競馬' },
                                { key: 'slot', label: 'ネオンスロット' },
                                { key: 'timeline', label: '年表' }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFutureTab(tab.key as typeof futureTab)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold border ${futureTab === tab.key ? 'bg-cyan-500 text-black border-cyan-300' : 'bg-transparent text-cyan-200 border-cyan-700'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {futureTab === 'race' && (
                            <div className="space-y-4">
                                <div className="grid gap-3">
                                    {horseOptions.map((horse) => (
                                        <button
                                            key={horse.id}
                                            onClick={() => setSelectedHorse(horse.id)}
                                            className={`w-full text-left p-4 rounded-xl border transition ${selectedHorse === horse.id ? 'border-cyan-400 bg-cyan-500/20' : 'border-cyan-800 bg-white/5'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold">{horse.name}</span>
                                                <span className="text-xs text-cyan-200">オッズ x{horse.odds}</span>
                                            </div>
                                            <div className="text-[11px] text-cyan-300 mt-1">AI予測同期率: {(horse.odds * 12).toFixed(0)}%</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        value={horseBet}
                                        onChange={(e) => setHorseBet(e.target.value)}
                                        placeholder="賭け金"
                                        className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-cyan-800 text-cyan-100 text-sm"
                                    />
                                    <Button
                                        disabled={isProcessing}
                                        onClick={handleFutureRace}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-sm py-3 px-6 shadow-[0_0_15px_cyan]"
                                    >
                                        レース開始
                                    </Button>
                                </div>
                            </div>
                        )}

                        {futureTab === 'slot' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-4 text-4xl font-mono bg-black/60 rounded-2xl py-6 border border-cyan-800">
                                    {slotResult.length === 0 ? (
                                        <span className="text-cyan-200">◆ ◆ ◆</span>
                                    ) : (
                                        slotResult.map((symbol, index) => (
                                            <span key={index} className="text-cyan-100">{symbol}</span>
                                        ))
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        value={slotBet}
                                        onChange={(e) => setSlotBet(e.target.value)}
                                        placeholder="賭け金"
                                        className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-cyan-800 text-cyan-100 text-sm"
                                    />
                                    <Button
                                        disabled={isProcessing}
                                        onClick={handleFutureSlot}
                                        className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-sm py-3 px-6 shadow-[0_0_15px_rgba(217,70,239,0.8)]"
                                    >
                                        スピン
                                    </Button>
                                </div>
                                <div className="text-xs text-cyan-300">3つ揃い: x6 / 2つ揃い: x2</div>
                            </div>
                        )}

                        {futureTab === 'timeline' && (
                            <div className="space-y-3">
                                {timelineItems.map((item) => (
                                    <div key={item.year} className="p-4 rounded-xl border border-cyan-800 bg-white/5">
                                        <div className="text-xs text-cyan-300">{item.year}</div>
                                        <div className="text-sm font-bold text-cyan-100">{item.text}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6">
                            <Button
                                fullWidth
                                disabled={isProcessing}
                                onClick={handleInvestment}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-lg py-4 shadow-[0_0_15px_cyan]"
                            >
                                未来技術へ投資する (Win: x1.5~5.0 / Lose: x0)
                            </Button>
                        </div>
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
                        <p>この時代では、先端技術系の行動が制限されます。スマホやデジタル娯楽は利用不可です。</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {pastRestrictions.map((item) => (
                                <div key={item.title} className="rounded-xl border border-[#c9b48a] bg-[#fff8e8] p-3 shadow-[0_8px_18px_rgba(120,90,50,0.2)]">
                                    <div className="flex items-center gap-2 font-bold">
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.title}</span>
                                    </div>
                                    <div className="text-xs mt-1 text-[#6b4e2e]">{item.detail}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 text-center text-xs opacity-50">
                Time Machine v1.0 - Coordinates: {currentEra.toUpperCase()}
            </div>
        </div>
    );
}
