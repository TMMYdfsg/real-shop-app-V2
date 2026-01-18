'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface Horse {
    id: number;
    name: string;
    emoji: string;
    odds: number;
    position: number;
}

interface HorseRaceGameProps {
    balance: number;
    onBet: (amount: number, details: string) => Promise<any>;
}

const HORSES: Omit<Horse, 'position'>[] = [
    { id: 1, name: 'サンダーボルト', emoji: '🐴', odds: 2.5 },
    { id: 2, name: 'ロケット号', emoji: '🏇', odds: 3.0 },
    { id: 3, name: 'ダイヤモンド', emoji: '💎', odds: 4.5 },
    { id: 4, name: 'ライトニング', emoji: '⚡', odds: 6.0 },
    { id: 5, name: 'ダークホース', emoji: '🌑', odds: 10.0 }
];

export const HorseRaceGame: React.FC<HorseRaceGameProps> = ({ balance, onBet }) => {
    const [bet, setBet] = useState(100);
    const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
    const [raceState, setRaceState] = useState<'betting' | 'racing' | 'finished'>('betting');
    const [horses, setHorses] = useState<Horse[]>(HORSES.map(h => ({ ...h, position: 0 })));
    const [winner, setWinner] = useState<number | null>(null);
    const [result, setResult] = useState<{ win: boolean; payout: number } | null>(null);

    const startRace = async () => {
        if (!selectedHorse) {
            alert('馬を選択してください');
            return;
        }
        if (balance < bet) {
            alert('所持金が足りません');
            return;
        }

        setRaceState('racing');
        setResult(null);
        setWinner(null);

        // Reset positions
        const racingHorses = HORSES.map(h => ({ ...h, position: 0 }));
        setHorses(racingHorses);

        // Simulate race
        const raceLength = 100;
        const updateInterval = 50;
        let raceFinished = false;
        let winningHorse: number | null = null;

        while (!raceFinished) {
            await new Promise(resolve => setTimeout(resolve, updateInterval));

            setHorses(prev => {
                const updated = prev.map(horse => {
                    // Random speed boost (inversely proportional to odds)
                    const baseSpeed = 2 + (Math.random() * 3);
                    const oddsBonus = (10 - horse.odds) * 0.1; // Lower odds = slightly faster
                    const newPosition = horse.position + baseSpeed + oddsBonus + (Math.random() * 2);

                    if (newPosition >= raceLength && !winningHorse) {
                        winningHorse = horse.id;
                        raceFinished = true;
                    }

                    return { ...horse, position: Math.min(newPosition, raceLength) };
                });
                return updated;
            });
        }

        // Race finished
        setWinner(winningHorse);
        setRaceState('finished');

        // Calculate result
        const win = winningHorse === selectedHorse;
        const winningHorseData = HORSES.find(h => h.id === winningHorse);
        const payout = win ? Math.floor(bet * (winningHorseData?.odds || 0)) : 0;

        setResult({ win, payout });

        // Call API
        await onBet(bet, JSON.stringify({
            selectedHorse,
            winner: winningHorse,
            payout,
            odds: winningHorseData?.odds
        }));
    };

    const reset = () => {
        setRaceState('betting');
        setHorses(HORSES.map(h => ({ ...h, position: 0 })));
        setWinner(null);
        setResult(null);
        setSelectedHorse(null);
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#16a34a' }}>
                🏇 競馬レース
            </h3>

            {/* Race Track */}
            <div style={{
                background: 'linear-gradient(to bottom, #86efac 0%, #4ade80 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                position: 'relative',
                minHeight: '250px'
            }}>
                {horses.map((horse, index) => (
                    <div key={horse.id} style={{
                        position: 'relative',
                        marginBottom: '0.8rem',
                        height: '40px',
                        background: index % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: selectedHorse === horse.id ? '3px solid #fbbf24' : '1px solid rgba(255,255,255,0.3)'
                    }}>
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            background: 'white',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            marginLeft: '0.3rem',
                            zIndex: 1
                        }}>
                            {horse.id}. {horse.name}
                        </div>

                        <motion.div
                            animate={{ left: `${horse.position}%` }}
                            transition={{ ease: 'linear', duration: 0.05 }}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '2rem'
                            }}
                        >
                            {horse.emoji}
                        </motion.div>

                        {/* Finish Line */}
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '3px',
                            background: '#ef4444',
                            borderLeft: '2px dashed white'
                        }} />
                    </div>
                ))}

                {/* Winner Announcement */}
                <AnimatePresence>
                    {winner && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'rgba(0,0,0,0.8)',
                                color: 'white',
                                padding: '1.5rem 2rem',
                                borderRadius: '12px',
                                textAlign: 'center',
                                zIndex: 10
                            }}
                        >
                            <div className="text-2xl font-bold mb-2">🏁 レース終了!</div>
                            <div className="text-xl">
                                優勝: {HORSES.find(h => h.id === winner)?.name}
                            </div>
                            {result && (
                                <div className="text-3xl font-bold mt-2" style={{ color: result.win ? '#4ade80' : '#ef4444' }}>
                                    {result.win ? `WIN! +${result.payout}枚` : 'LOSE...'}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Horse Selection */}
            {raceState === 'betting' && (
                <div className="mb-4">
                    <div className="text-sm font-bold mb-2">馬を選択:</div>
                    <div className="grid grid-cols-1 gap-2">
                        {HORSES.map(horse => (
                            <button
                                key={horse.id}
                                onClick={() => setSelectedHorse(horse.id)}
                                style={{
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    background: selectedHorse === horse.id ? '#fbbf24' : '#f3f4f6',
                                    border: selectedHorse === horse.id ? '2px solid #f59e0b' : '1px solid #d1d5db',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span>
                                    {horse.emoji} {horse.id}. {horse.name}
                                </span>
                                <span style={{ color: '#16a34a' }}>
                                    x{horse.odds} 倍
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Bet Controls */}
            <div className="space-y-4">
                {raceState === 'betting' && (
                    <>
                        <div>
                            <label className="block text-sm font-bold mb-2">賭け金 (所持金: {balance}枚)</label>
                            <div className="flex gap-2 justify-center">
                                {[100, 500, 1000, 5000].map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setBet(amt)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            background: bet === amt ? '#16a34a' : '#e5e7eb',
                                            color: bet === amt ? 'white' : 'black',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {amt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button
                            fullWidth
                            variant="success"
                            onClick={startRace}
                            disabled={!selectedHorse || balance < bet}
                            style={{ fontSize: '1.2rem', padding: '1rem' }}
                        >
                            レース開始 ({bet}枚)
                        </Button>
                    </>
                )}

                {raceState === 'racing' && (
                    <div className="text-center text-lg font-bold text-green-600">
                        レース中...
                    </div>
                )}

                {raceState === 'finished' && (
                    <Button fullWidth variant="primary" onClick={reset}>
                        次のレース
                    </Button>
                )}
            </div>
        </div>
    );
};
