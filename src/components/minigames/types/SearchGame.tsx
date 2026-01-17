'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface SearchGameProps {
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

const ITEMS = ['🔑', '📱', '💎', '👓', '🧢', '🎒', '🌂', '📷', '📕', '🎁', '📦', '🧸', '🔦', '🔎', '🕯️', '🧹'];

export const SearchGame: React.FC<SearchGameProps> = ({ difficulty, onScoreUpdate }) => {
    const [targetItem, setTargetItem] = useState('');
    const [gridItems, setGridItems] = useState<string[]>([]);
    const [gameState, setGameState] = useState<'playing' | 'found' | 'fail'>('playing');

    // Difficulty affects grid size
    // 1-2: 4x4, 3-4: 5x5, 5: 6x6
    const gridSize = Math.min(3 + Math.ceil(difficulty / 1.5), 6);
    const totalCells = gridSize * gridSize;

    useEffect(() => {
        const target = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        setTargetItem(target);

        // Populate grid
        const noiseCount = totalCells - 1;
        const noise = Array.from({ length: noiseCount }, () => ITEMS[Math.floor(Math.random() * ITEMS.length)]);

        const items = [...noise];
        const targetPos = Math.floor(Math.random() * totalCells);
        items.splice(targetPos, 0, target);

        setGridItems(items.slice(0, totalCells));
        setGameState('playing');
    }, [difficulty, totalCells]);

    const handleCellClick = (item: string) => {
        if (gameState !== 'playing') return;

        if (item === targetItem) {
            setGameState('found');
            onScoreUpdate(100 * difficulty);
        } else {
            // Wrong item - Shake effect handled by parent/local state?
            // For now, let's just penalty or fail.
            // Strict mode: Fail immediately
            setGameState('fail');
            onScoreUpdate(10);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ marginBottom: '1rem', fontSize: '1.2rem', textAlign: 'center' }}
            >
                探せ:
                <motion.span
                    key={targetItem}
                    initial={{ scale: 1.5, color: '#ff0000' }}
                    animate={{ scale: 1, color: '#000000' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    style={{
                        fontSize: '3rem',
                        border: '3px solid #ef4444',
                        padding: '5px 15px',
                        borderRadius: '10px',
                        marginLeft: '10px',
                        display: 'inline-block',
                        background: '#fee2e2'
                    }}
                >
                    {targetItem}
                </motion.span>
            </motion.div>

            <motion.div
                key={gridSize} // Reset animation when size changes
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.03 }
                    }
                }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gap: '8px',
                    width: '100%',
                    maxWidth: '400px',
                    aspectRatio: '1/1'
                }}
            >
                {gridItems.map((item, idx) => (
                    <motion.button
                        key={`${idx}-${item}`} // Unique key for animation
                        variants={{
                            hidden: { scale: 0, opacity: 0 },
                            show: { scale: 1, opacity: 1 }
                        }}
                        whileHover={{ scale: 1.1, zIndex: 10, backgroundColor: '#e5e7eb' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCellClick(item)}
                        disabled={gameState !== 'playing'}
                        style={{
                            fontSize: '2rem',
                            padding: 0,
                            height: '100%',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {item}
                    </motion.button>
                ))}
            </motion.div>

            <AnimatePresence>
                {gameState === 'found' && (
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            color: '#22c55e', fontSize: '8rem', pointerEvents: 'none',
                            textShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}
                    >
                        ⭕
                    </motion.div>
                )}
                {gameState === 'fail' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            color: '#ef4444', fontSize: '8rem', pointerEvents: 'none',
                            textShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}
                    >
                        ✖
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
