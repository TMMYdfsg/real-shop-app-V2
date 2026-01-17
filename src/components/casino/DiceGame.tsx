'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface DiceProps {
    value: number;
    rolling: boolean;
}

const DiceComponent = ({ value, rolling }: DiceProps) => {
    const dots: Record<number, number[][]> = {
        1: [[50, 50]],
        2: [[20, 20], [80, 80]],
        3: [[20, 20], [50, 50], [80, 80]],
        4: [[20, 20], [20, 80], [80, 20], [80, 80]],
        5: [[20, 20], [20, 80], [50, 50], [80, 20], [80, 80]],
        6: [[20, 20], [20, 50], [20, 80], [80, 20], [80, 50], [80, 80]]
    };

    return (
        <motion.div
            animate={rolling ? {
                rotateX: [0, 360, 720, 1080],
                rotateY: [0, 360, 720, 1080],
                y: [0, -20, 0, -10, 0]
            } : {
                rotateX: 0,
                rotateY: 0,
                y: 0
            }}
            transition={{ duration: rolling ? 0.5 : 0.3, ease: "easeInOut" }}
            style={{
                width: '60px',
                height: '60px',
                background: 'white',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                display: 'flex',
                position: 'relative',
                border: '1px solid #ddd'
            }}
        >
            {dots[value]?.map((pos, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: `${pos[0]}%`,
                        top: `${pos[1]}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '10px',
                        height: '10px',
                        background: '#333',
                        borderRadius: '50%'
                    }}
                />
            ))}
        </motion.div>
    );
};

interface DiceGameProps {
    balance: number;
    onBet: (amount: number, guess: string) => Promise<any>;
}

export const Dice: React.FC<DiceGameProps> = ({ balance, onBet }) => {
    const [bet, setBet] = useState(100);
    const [isRolling, setIsRolling] = useState(false);
    const [diceValues, setDiceValues] = useState([1, 1]);
    const [lastResult, setLastResult] = useState<{ win: boolean; payout: number; sum: number } | null>(null);

    const handleGamble = async (guess: 'high' | 'low') => {
        if (balance < bet) {
            alert('所持金が足りません');
            return;
        }

        setIsRolling(true);
        setLastResult(null);

        const res = await onBet(bet, guess);

        setTimeout(() => {
            if (res.success) {
                setDiceValues(res.dice);
                setLastResult({
                    win: res.isWin,
                    payout: res.payout,
                    sum: res.sum
                });
            }
            setIsRolling(false);
        }, 800);
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#d946ef' }}>
                🎲 HIGH & LOW
            </h3>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '2rem 0', perspective: '1000px' }}>
                <DiceComponent value={diceValues[0]} rolling={isRolling} />
                <DiceComponent value={diceValues[1]} rolling={isRolling} />
            </div>

            <div style={{ height: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
                <AnimatePresence>
                    {lastResult && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: lastResult.win ? '#16a34a' : '#dc2626'
                            }}
                        >
                            {lastResult.win ? `WIN! +${lastResult.payout}枚` : 'LOSE...'}
                        </motion.div>
                    )}
                    {isRolling && (
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity }}
                            style={{ color: '#666' }}
                        >
                            Rolling...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="w-full">
                    <label className="block text-sm font-bold mb-1 text-center">賭け金 (所持金: {balance}枚)</label>
                    <div className="flex justify-center gap-2 mb-4">
                        {[100, 500, 1000].map(amt => (
                            <button
                                key={amt}
                                onClick={() => setBet(amt)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    background: bet === amt ? '#d946ef' : '#e5e7eb',
                                    color: bet === amt ? 'white' : 'black',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {amt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleGamble('low')}
                        disabled={isRolling}
                        style={{
                            padding: '1.5rem',
                            borderRadius: '12px',
                            background: '#3b82f6',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 0 #1d4ed8',
                            opacity: isRolling ? 0.5 : 1
                        }}
                    >
                        LOW
                        <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Total 2-6</div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleGamble('high')}
                        disabled={isRolling}
                        style={{
                            padding: '1.5rem',
                            borderRadius: '12px',
                            background: '#ef4444',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 0 #b91c1c',
                            opacity: isRolling ? 0.5 : 1
                        }}
                    >
                        HIGH
                        <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Total 8-12</div>
                    </motion.button>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                    合計が 7 の場合は親の総取り(負け)となります。<br />
                    配当は2倍です。
                </p>
            </div>
        </div>
    );
};
