'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface CreateGameProps {
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

const THEMES = ['動画', '絵画', '料理', '花束', '記事', 'コード'];

export const CreateGame: React.FC<CreateGameProps> = ({ difficulty, onScoreUpdate }) => {
    const [phase, setPhase] = useState<'idle' | 'creating' | 'result'>('idle');
    const [progress, setProgress] = useState(0);
    const [theme, setTheme] = useState(THEMES[0]);
    const [views, setViews] = useState(0);

    const handleCreate = () => {
        setPhase('creating');
        setProgress(0);

        // Simulate creation process
        let p = 0;
        const interval = setInterval(() => {
            p += 5 + (Math.random() * 10);
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                finishCreation();
            }
            setProgress(p);
        }, 100); // 1-2 seconds approx
    };

    const finishCreation = () => {
        setTimeout(() => {
            setPhase('result');
            // Calc result
            const base = 1000 * difficulty;
            const rand = Math.random() * 2;
            const total = Math.floor(base * rand);
            setViews(total);
            onScoreUpdate(Math.min(100, Math.floor(total / 100)));
        }, 500);
    };

    const reset = () => {
        setPhase('idle');
        setTheme(THEMES[Math.floor(Math.random() * THEMES.length)]);
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
                {phase === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ textAlign: 'center' }}
                    >
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>次の作品: 「{theme}」</h3>
                        <Button
                            onClick={handleCreate}
                            style={{
                                padding: '2rem', borderRadius: '50%', width: '150px', height: '150px',
                                fontSize: '1.5rem', fontWeight: 'bold', boxShadow: '0 0 20px rgba(0,0,0,0.1)'
                            }}
                            variant="primary"
                        >
                            制作！
                        </Button>
                    </motion.div>
                )}

                {phase === 'creating' && (
                    <motion.div
                        key="creating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', width: '80%' }}
                    >
                        <h3 style={{ marginBottom: '1rem' }}>制作中...</h3>
                        <div style={{ width: '100%', height: '20px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div
                                style={{ height: '100%', background: '#8b5cf6' }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={{ fontSize: '4rem', marginTop: '2rem' }}
                        >
                            ⚙️
                        </motion.div>
                    </motion.div>
                )}

                {phase === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ scale: 0, rotateY: 180 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{
                            padding: '2rem', background: 'linear-gradient(135deg, #fce7f3, #e9d5ff)',
                            borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ fontSize: '1.2rem', color: '#555' }}>作品が完成しました！</div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#db2777', margin: '1rem 0' }}>
                                ❤️ {views.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#888' }}>評価獲得！</div>
                        </div>

                        <Button onClick={reset} variant="secondary">次の作品を作る</Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
