'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TapGameProps {
    difficulty: number;
    jobId?: string; // Job IDを受け取る
    onScoreUpdate: (score: number) => void;
}

export const TapGame: React.FC<TapGameProps> = ({ difficulty, jobId, onScoreUpdate }) => {
    const [count, setCount] = useState(0);
    const [particles, setParticles] = useState<{ id: number, x: number, y: number }[]>([]);
    const [matrixChars, setMatrixChars] = useState<string[]>([]);

    // ハッカー風ジョブかどうか
    const isHackerStyle = jobId === 'programmer' || jobId === 'hacker' || jobId === 'cracker';

    // Target taps
    const target = 20 * difficulty;

    // Matrix rain effect
    useEffect(() => {
        if (!isHackerStyle) return;

        const chars = '01アイウエオカキクケコABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const interval = setInterval(() => {
            const newChars = Array.from({ length: 30 }, () =>
                chars[Math.floor(Math.random() * chars.length)]
            );
            setMatrixChars(newChars);
        }, 100);

        return () => clearInterval(interval);
    }, [isHackerStyle]);

    const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
        const newCount = count + 1;
        setCount(newCount);

        // Add particle
        const x = Math.random() * 100 - 50;
        const y = Math.random() * 100 - 50;
        const id = Date.now() + Math.random();

        setParticles(prev => [...prev.slice(-10), { id, x, y }]);

        if (newCount >= target) {
            onScoreUpdate(100 * difficulty + (newCount - target)); // Bonus
        } else {
            onScoreUpdate(0); // Not finished
        }
    };

    const progress = Math.min((count / target) * 100, 100);
    const isCompleted = count >= target;

    // ハッカー風スタイル
    if (isHackerStyle) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem',
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Matrix Rain Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.1,
                    pointerEvents: 'none',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(15, 1fr)',
                    fontSize: '1rem',
                    color: '#0f0',
                    overflow: 'hidden'
                }}>
                    {matrixChars.map((char, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 600, opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                        >
                            {char}
                        </motion.div>
                    ))}
                </div>

                {/* Terminal Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        fontFamily: 'monospace',
                        color: '#0f0',
                        fontSize: '1.2rem',
                        textShadow: '0 0 10px #0f0',
                        border: '1px solid #0f0',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        background: 'rgba(0, 255, 0, 0.05)'
                    }}
                >
                    {jobId === 'programmer' && '> EXECUTING: code_generation.sh'}
                    {jobId === 'hacker' && '> ACCESSING: mainframe.sys'}
                    {jobId === 'cracker' && '> BREAKING: encryption.key'}
                </motion.div>

                {/* Progress Bar - Terminal Style */}
                <div style={{ width: '80%', maxWidth: '500px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        fontFamily: 'monospace',
                        color: '#0f0',
                        fontSize: '0.9rem',
                        textShadow: '0 0 5px #0f0'
                    }}>
                        <span>[PROGRESS]</span>
                        <span>{Math.floor(progress)}%</span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '30px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '4px',
                        border: '1px solid #0f0',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            style={{
                                height: '100%',
                                background: isCompleted
                                    ? 'linear-gradient(90deg, #00ff00, #00aa00)'
                                    : 'linear-gradient(90deg, #00ff00, #00ff88)',
                                boxShadow: '0 0 20px #0f0'
                            }}
                        />
                        {/* Scanning line effect */}
                        <motion.div
                            animate={{
                                x: ['0%', '100%'],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '20px',
                                height: '100%',
                                background: 'rgba(255, 255, 255, 0.5)',
                                filter: 'blur(5px)'
                            }}
                        />
                    </div>
                </div>

                {/* Main Button - Cyber Style */}
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTap}
                        style={{
                            width: '250px',
                            height: '250px',
                            borderRadius: '12px',
                            border: '2px solid #0f0',
                            background: isCompleted
                                ? 'linear-gradient(135deg, #003300, #00ff00)'
                                : 'linear-gradient(135deg, #001100, #003300)',
                            color: '#0f0',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                            boxShadow: isCompleted
                                ? '0 0 40px #0f0, inset 0 0 20px #0f0'
                                : '0 0 20px #0f0, inset 0 0 10px #003300',
                            position: 'relative',
                            textShadow: '0 0 10px #0f0',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                    >
                        {isCompleted ? (
                            <>
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✓ ACCESS GRANTED</div>
                                <div style={{ fontSize: '1rem' }}>BONUS MODE</div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                                    {jobId === 'programmer' && '⌨️'}
                                    {jobId === 'hacker' && '💻'}
                                    {jobId === 'cracker' && '🔓'}
                                </div>
                                <div>EXECUTE</div>
                                <div style={{ fontSize: '1rem', marginTop: '10px', opacity: 0.7 }}>
                                    {count} / {target}
                                </div>
                            </>
                        )}

                        {/* Glitch effect on hover */}
                        <motion.div
                            animate={{
                                opacity: [0, 0.3, 0]
                            }}
                            transition={{
                                duration: 0.1,
                                repeat: Infinity,
                                repeatDelay: 3
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: '#0f0',
                                mixBlendMode: 'overlay',
                                borderRadius: '12px'
                            }}
                        />
                    </motion.button>

                    {/* Cyber Particles */}
                    <AnimatePresence>
                        {particles.map(p => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                                animate={{ opacity: 0, scale: 2, x: p.x * 2, y: p.y * 2 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{
                                    position: 'absolute',
                                    top: '50%', left: '50%',
                                    width: '10px', height: '10px',
                                    background: '#0f0',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 10px #0f0',
                                    pointerEvents: 'none',
                                    zIndex: 0
                                }}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {isCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            color: '#0f0',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            fontFamily: 'monospace',
                            textShadow: '0 0 10px #0f0',
                            textAlign: 'center'
                        }}
                    >
                        {'>'} SYSTEM COMPROMISED. EXTRACTING DATA...
                    </motion.div>
                )}
            </div>
        );
    }

    // 通常スタイル（既存）
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            <div style={{ width: '100%', padding: '0 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    <span>PROGRESS</span>
                    <span>{Math.floor(progress)}%</span>
                </div>
                <div style={{ width: '100%', height: '20px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{
                            height: '100%',
                            background: isCompleted ? '#22c55e' : '#3b82f6',
                            backgroundImage: isCompleted
                                ? 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)'
                                : 'none',
                            backgroundSize: '1rem 1rem'
                        }}
                    />
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleTap}
                    style={{
                        width: '200px', height: '200px',
                        borderRadius: '50%',
                        border: 'none',
                        background: isCompleted ? '#22c55e' : '#ef4444',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        position: 'relative',
                        zIndex: 1,
                        outline: 'none'
                    }}
                >
                    {isCompleted ? 'COMPLETE!' : 'TAP!!'}
                    <br />
                    <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>
                        {count} / {target}
                    </span>
                </motion.button>

                {/* Particles */}
                <AnimatePresence>
                    {particles.map(p => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                            animate={{ opacity: 0, scale: 2, x: p.x * 2, y: p.y * 2 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                position: 'absolute',
                                top: '50%', left: '50%',
                                width: '20px', height: '20px',
                                background: '#fbbf24',
                                borderRadius: '50%',
                                pointerEvents: 'none',
                                zIndex: 0
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {isCompleted && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.5rem' }}
                >
                    ボーナスゾーン突入！連打でスコア稼ぎ！
                </motion.div>
            )}
        </div>
    );
};
