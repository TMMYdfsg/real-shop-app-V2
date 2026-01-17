'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface SlotGameProps {
    balance: number;
    onBet: (amount: number, details: string) => Promise<any>;
}

const SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎', '7️⃣'];
const REEL_COUNT = 3;

export const SlotGame: React.FC<SlotGameProps> = ({ balance, onBet }) => {
    const [bet, setBet] = useState(100);
    const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<{ win: boolean; payout: number; message: string } | null>(null);

    const spin = async () => {
        if (balance < bet) {
            alert('所持金が足りません');
            return;
        }

        setIsSpinning(true);
        setResult(null);

        // Animate spinning
        const spinDuration = 2000;
        const interval = 100;
        const iterations = spinDuration / interval;

        for (let i = 0; i < iterations; i++) {
            setReels([
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
            ]);
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        // Final result
        const finalReels = [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ];

        setReels(finalReels);
        setIsSpinning(false);

        // Calculate win
        let payout = 0;
        let message = '';
        let win = false;

        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
            // All 3 match
            win = true;
            if (finalReels[0] === '7️⃣') {
                payout = bet * 100; // Jackpot!
                message = '🎰 JACKPOT!! 100倍配当！';
            } else if (finalReels[0] === '💎') {
                payout = bet * 50;
                message = '💎 ダイヤモンド! 50倍配当！';
            } else if (finalReels[0] === '⭐') {
                payout = bet * 20;
                message = '⭐ スター! 20倍配当！';
            } else {
                payout = bet * 10;
                message = `${finalReels[0]} トリプル! 10倍配当！`;
            }
        } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
            // 2 match
            payout = bet * 2;
            message = 'ペア! 2倍配当';
            win = true;
        } else {
            message = 'ハズレ...';
        }

        setResult({ win, payout, message });

        // Call API
        await onBet(bet, JSON.stringify({ reels: finalReels, payout, message }));
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#dc2626' }}>
                🎰 スロットマシン
            </h3>

            {/* Slot Machine Display */}
            <div style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                }}>
                    {reels.map((symbol, i) => (
                        <motion.div
                            key={i}
                            animate={isSpinning ? {
                                y: [0, -20, 0]
                            } : {}}
                            transition={{
                                duration: 0.1,
                                repeat: isSpinning ? Infinity : 0
                            }}
                            style={{
                                width: '100px',
                                height: '100px',
                                background: 'white',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3.5rem',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                border: '3px solid #f87171'
                            }}
                        >
                            {symbol}
                        </motion.div>
                    ))}
                </div>

                {/* Result Message */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="text-center text-xl font-bold"
                            style={{
                                color: result.win ? '#16a34a' : '#dc2626',
                                marginTop: '1rem'
                            }}
                        >
                            {result.message}
                            {result.win && <div className="text-2xl mt-2">+{result.payout}枚</div>}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Paytable */}
            <div className="text-xs text-gray-600 mb-4 p-3 bg-gray-50 rounded" style={{ fontSize: '0.75rem' }}>
                <div className="font-bold mb-2">配当表:</div>
                <div>7️⃣7️⃣7️⃣ → x100 (JACKPOT)</div>
                <div>💎💎💎 → x50</div>
                <div>⭐⭐⭐ → x20</div>
                <div>その他トリプル → x10</div>
                <div>ペア(2つ揃い) → x2</div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-2">賭け金 (所持金: {balance}枚)</label>
                    <div className="flex gap-2 justify-center mb-4">
                        {[100, 500, 1000, 5000].map(amt => (
                            <button
                                key={amt}
                                onClick={() => setBet(amt)}
                                disabled={isSpinning}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: bet === amt ? '#dc2626' : '#e5e7eb',
                                    color: bet === amt ? 'white' : 'black',
                                    fontWeight: 'bold',
                                    opacity: isSpinning ? 0.5 : 1
                                }}
                            >
                                {amt}
                            </button>
                        ))}
                    </div>
                </div>
                <Button
                    fullWidth
                    variant="danger"
                    onClick={spin}
                    disabled={isSpinning || balance < bet}
                    style={{ fontSize: '1.2rem', padding: '1rem' }}
                >
                    {isSpinning ? '回転中...' : `スピン (${bet}枚)`}
                </Button>
            </div>
        </div>
    );
};
