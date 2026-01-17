'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../animations';

interface MemoryGameProps {
    difficulty: number;
    icons?: string[]; // Custom icons for job
    onScoreUpdate: (score: number) => void;
}

const DEFAULT_ICONS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉'];

export const MemoryGame: React.FC<MemoryGameProps> = ({ difficulty, icons = DEFAULT_ICONS, onScoreUpdate }) => {
    const [sequence, setSequence] = useState<string[]>([]);
    const [userInput, setUserInput] = useState<string[]>([]);
    const [phase, setPhase] = useState<'memorize' | 'input' | 'success' | 'fail'>('memorize');

    // Difficulty settings
    const seqLength = 3 + Math.floor(difficulty / 2);
    const speed = Math.max(500, 1500 - (difficulty * 200));

    useEffect(() => {
        // Generate sequence
        const newSeq = Array.from({ length: seqLength }, () => icons[Math.floor(Math.random() * icons.length)]);
        setSequence(newSeq);
        setPhase('memorize');
        setUserInput([]);

        // Auto switch to input after display
        const totalDuration = (newSeq.length + 1) * speed;

        // Actually, let's keep it "memorize" phase where we show them all at once or one by one?
        // User request: "アイコンが ポンポン跳ねながら順番表示" -> Motion stagger
        // Let's show all with stagger, then hide them after some time.

        const timer = setTimeout(() => {
            setPhase('input');
        }, totalDuration);

        return () => clearTimeout(timer);
    }, [difficulty, icons]);

    const handleTap = (icon: string) => {
        if (phase !== 'input') return;

        const nextIndex = userInput.length;
        const expected = sequence[nextIndex];

        if (icon === expected) {
            // Correct
            const newUserInput = [...userInput, icon];
            setUserInput(newUserInput);

            // Visual feedback handled by animation?

            if (newUserInput.length === sequence.length) {
                setPhase('success');
                onScoreUpdate(100 + (difficulty * 20)); // Bonus
            }
        } else {
            // Mistake
            setPhase('fail');
            onScoreUpdate(10); // Low score
        }
    };

    // Derived display for memorize phase or input phase
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            {phase === 'memorize' && (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '2rem', color: '#555' }}>順番を覚えて！</h3>
                    <motion.div
                        variants={variants.container}
                        initial="hidden"
                        animate="show"
                        style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
                    >
                        {sequence.map((icon, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { scale: 0, opacity: 0, y: 20 },
                                    show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' } }
                                }}
                                style={{
                                    fontSize: '4rem',
                                    background: '#f3f4f6',
                                    borderRadius: '50%',
                                    width: '100px', height: '100px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            >
                                {icon}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}

            {phase === 'input' && (
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <div style={{ marginBottom: '2rem', minHeight: '80px', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {/* Progress / Inputted Items */}
                        <AnimatePresence>
                            {userInput.map((icon, i) => (
                                <motion.div
                                    key={`input-${i}`}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    style={{
                                        fontSize: '2rem', padding: '10px',
                                        border: '2px solid #4ade80', borderRadius: '50%'
                                    }}
                                >
                                    {icon}
                                </motion.div>
                            ))}
                            {/* Placeholders for remaining */}
                            {Array.from({ length: sequence.length - userInput.length }).map((_, i) => (
                                <div key={`placeholder-${i}`} style={{ width: '50px', height: '50px', border: '2px dashed #ccc', borderRadius: '50%' }} />
                            ))}
                        </AnimatePresence>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '1rem' }}>
                        {icons.map((icon) => (
                            <motion.button
                                key={icon}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleTap(icon)}
                                style={{
                                    fontSize: '3rem',
                                    padding: '1rem',
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                {icon}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {phase === 'success' && (
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }}
                    style={{ fontSize: '10rem' }}
                >
                    🎉
                </motion.div>
            )}

            {phase === 'fail' && (
                <motion.div
                    initial={{ x: -20 }} animate={{ x: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10, repeat: 3 }}
                    style={{ fontSize: '10rem' }}
                >
                    ❌
                </motion.div>
            )}
        </div>
    );
};
