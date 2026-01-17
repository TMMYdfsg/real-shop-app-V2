'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface SearchGameProps {
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

const ITEMS = ['🔑', '📱', '💎', '👓', '🧢', '🎒', '🌂', '📷', '📕', '🎁', '📦', '🧸'];

export const SearchGame: React.FC<SearchGameProps> = ({ difficulty, onScoreUpdate }) => {
    const [targetItem, setTargetItem] = useState('');
    const [gridItems, setGridItems] = useState<string[]>([]);
    const [gameState, setGameState] = useState<'playing' | 'found' | 'fail'>('playing');

    // Difficulty affects grid size and noise
    const gridSize = Math.min(3 + difficulty, 6); // 3x3 to 6x6
    const totalCells = gridSize * gridSize;

    useEffect(() => {
        const target = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        setTargetItem(target);

        // Populate grid
        const noiseCount = totalCells - 1;
        const noise = Array.from({ length: noiseCount }, () => ITEMS[Math.floor(Math.random() * ITEMS.length)]);

        // Ensure some variety? Actually pure random noise is harder.
        // Insert target at random position
        const items = [...noise];
        const targetPos = Math.floor(Math.random() * totalCells);
        items.splice(targetPos, 0, target);
        // Trim if overflow (splice adds, doesn't replace) -> actually splice(pos, 0, item) increases length
        // items is now noiseCount + 1 = totalCells. Correct.

        setGridItems(items);
        setGameState('playing');
    }, [difficulty, totalCells]);

    const handleCellClick = (item: string) => {
        if (gameState !== 'playing') return;

        if (item === targetItem) {
            setGameState('found');
            onScoreUpdate(100 * difficulty);
        } else {
            // Wrong item - maybe penalty or just shake?
            // For now, let's treat as fail? Or just reduce score potential?
            // Let's allow retries but reduce score?
            // Simplified: Fail on wrong click for "Detective/Police" strictness.
            setGameState('fail');
            onScoreUpdate(0);
        }
    };

    return (
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
                探せ: <span style={{ fontSize: '2rem', border: '2px solid red', padding: '0 5px', borderRadius: '4px' }}>{targetItem}</span>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gap: '5px',
                flex: 1,
                alignContent: 'center'
            }}>
                {gridItems.map((item, idx) => (
                    <Button
                        key={idx}
                        variant="secondary"
                        onClick={() => handleCellClick(item)}
                        style={{ fontSize: '1.5rem', padding: 0, height: '100%' }}
                    >
                        {item}
                    </Button>
                ))}
            </div>

            {gameState === 'found' && <div style={{ color: 'green', fontSize: '2rem', marginTop: '1rem' }}>発見！</div>}
            {gameState === 'fail' && <div style={{ color: 'red', fontSize: '2rem', marginTop: '1rem' }}>間違えた...</div>}
        </div>
    );
};
