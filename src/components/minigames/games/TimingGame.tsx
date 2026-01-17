'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface TimingGameProps {
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

export const TimingGame: React.FC<TimingGameProps> = ({ difficulty, onScoreUpdate }) => {
    const digitsCount = Math.min(3 + difficulty, 6);
    const [digits, setDigits] = useState<number[]>(Array(digitsCount).fill(0));
    const [locked, setLocked] = useState<boolean[]>(Array(digitsCount).fill(false));
    const [targetDigit, setTargetDigit] = useState(0); // Which digit we are locking now

    // Each digit might have a target number to hit? 
    // Simplified: Just stop anywhere is fine? No, that's not a game.
    // Cracker theme: Stop at the specific number (e.g. 7) or match a target sequence?
    // Let's say we have to match a target code randomly generated.

    const [targetCode, setTargetCode] = useState<number[]>([]);

    useEffect(() => {
        const code = Array.from({ length: digitsCount }, () => Math.floor(Math.random() * 10));
        setTargetCode(code);
    }, [digitsCount]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (targetDigit < digitsCount) {
            interval = setInterval(() => {
                setDigits(prev => {
                    const next = [...prev];
                    next[targetDigit] = (next[targetDigit] + 1) % 10;
                    return next;
                });
            }, 50); // Speed. Could depend on difficulty?
        }
        return () => clearInterval(interval);
    }, [targetDigit, digitsCount]);

    const handleStop = () => {
        if (targetDigit >= digitsCount) return;

        const currentVal = digits[targetDigit];
        const targetVal = targetCode[targetDigit];

        if (currentVal === targetVal) {
            // Success, move to next
            const newLocked = [...locked];
            newLocked[targetDigit] = true;
            setLocked(newLocked);

            if (targetDigit + 1 >= digitsCount) {
                // All cleared
                setTargetDigit(digitsCount);
                onScoreUpdate(100 * difficulty);
            } else {
                setTargetDigit(targetDigit + 1);
            }
        } else {
            // Missed! Reset or penalty?
            // Reset to start? Or just retry current?
            // Reset current digit but maybe penalty on time/score?
            // Visual shake?
            // For now, simple retry.
            // onScoreUpdate(0); // Reset score?
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem', fontSize: '1.5rem', fontFamily: 'monospace' }}>
                TARGET: <span style={{ letterSpacing: '0.5em', color: '#0f0' }}>{targetCode.join('')}</span>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '2rem'
            }}>
                {digits.map((d, i) => (
                    <div key={i} style={{
                        width: '40px',
                        height: '60px',
                        border: '2px solid',
                        borderColor: locked[i] ? '#0f0' : (i === targetDigit ? '#fff' : '#444'),
                        color: locked[i] ? '#0f0' : '#fff',
                        background: '#222',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        boxShadow: i === targetDigit ? '0 0 10px #0f0' : 'none'
                    }}>
                        {d}
                    </div>
                ))}
            </div>

            <Button
                onClick={handleStop}
                disabled={targetDigit >= digitsCount}
                variant={targetDigit >= digitsCount ? 'success' : 'primary'}
                style={{ width: '200px', height: '60px', fontSize: '1.5rem' }}
            >
                {targetDigit >= digitsCount ? 'UNLOCKED' : 'STOP!'}
            </Button>

            {targetDigit >= digitsCount && (
                <div style={{ marginTop: '1rem', color: '#0f0', fontWeight: 'bold' }}>
                    ACCESS GRANTED
                </div>
            )}
        </div>
    );
};
