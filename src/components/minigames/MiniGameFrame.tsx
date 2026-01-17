'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { variants, transitions } from './animations';

interface MiniGameFrameProps {
    gameState: 'intro' | 'countdown' | 'playing' | 'result';
    score: number;
    timeLeft: number;
    duration: number;
    title: string;
    description: string;
    difficulty: number;
    onStart: () => void;
    onClose: () => void;
    onConfirmResult: () => void;
    children: React.ReactNode;
}

export const MiniGameFrame: React.FC<MiniGameFrameProps> = ({
    gameState,
    score,
    timeLeft,
    duration,
    title,
    description,
    difficulty,
    onStart,
    onClose,
    onConfirmResult,
    children
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                backdropFilter: 'blur(5px)'
            }}
        >
            <AnimatePresence mode="wait">
                {gameState === 'intro' && (
                    <motion.div key="intro" variants={variants.popIn} initial="initial" animate="animate" exit="exit">
                        <Card padding="lg" style={{ width: '90vw', maxWidth: '500px', textAlign: 'center', border: '2px solid rgba(255,255,255,0.1)' }}>
                            <motion.h2
                                initial={{ y: -20 }} animate={{ y: 0 }}
                                style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}
                            >
                                {title}
                            </motion.h2>
                            <p style={{ margin: '1rem 0', fontSize: '1.2rem', color: '#888' }}>{description}</p>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '2rem 0' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#666' }}>TIME</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{duration}s</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#666' }}>LVL</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{'⭐'.repeat(difficulty)}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Button variant="secondary" onClick={onClose}>やめる</Button>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="primary" onClick={onStart} style={{ padding: '0.8rem 2rem', fontSize: '1.2rem' }}>
                                        仕事開始！
                                    </Button>
                                </motion.div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {gameState === 'countdown' && (
                    <motion.div
                        key="countdown"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 2 }}
                        style={{ fontSize: '8rem', fontWeight: 'bold', color: 'white', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}
                    >
                        {/* The logic handles the number, this is just the container potentially. 
                            Actually, the parent handles the number change, we just animate the container?
                            Or we just pass children which is the number.
                        */}
                        {children}
                    </motion.div>
                )}

                {gameState === 'playing' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ width: '100%', maxWidth: '600px', height: '100%', display: 'flex', flexDirection: 'column', padding: '20px' }}
                    >
                        {/* HUD */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginBottom: '1rem', color: 'white'
                        }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                                ⏱️ <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.2rem' }}>{timeLeft}s</span>
                            </div>
                            <div style={{ background: 'rgba(255,215,0,0.2)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid rgba(255,215,0,0.5)' }}>
                                🏆 <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#feeb39' }}>{score}</span>
                            </div>
                        </div>

                        {/* Game Content Area */}
                        <div style={{
                            flex: 1,
                            background: 'white',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            {children}
                        </div>
                    </motion.div>
                )}

                {gameState === 'result' && (
                    <motion.div key="result" variants={variants.popIn} initial="initial" animate="animate" exit="exit">
                        <Card padding="lg" style={{ width: '90vw', maxWidth: '400px', textAlign: 'center' }}>
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                                style={{ fontSize: '5rem', marginBottom: '1rem' }}
                            >
                                {score > 50 ? '🎉' : '😓'}
                            </motion.div>

                            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                {score > 50 ? 'Great Job!' : 'Finished!'}
                            </h2>

                            <div style={{ fontSize: '4rem', fontWeight: '900', color: score > 50 ? '#f59e0b' : '#6b7280', margin: '1rem 0' }}>
                                {score}
                            </div>

                            <div style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
                                {score > 80 ? '完璧な仕事ぶりです！' : score > 50 ? 'まずまずの成果です。' : '次はもっと頑張りましょう。'}
                            </div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button fullWidth variant="primary" onClick={onConfirmResult} style={{ padding: '1rem', fontSize: '1.2rem' }}>
                                    報酬を受け取る
                                </Button>
                            </motion.div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
