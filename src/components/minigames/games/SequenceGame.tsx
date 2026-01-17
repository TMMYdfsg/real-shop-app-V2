'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface SequenceGameProps {
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

const ICONS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍑'];

export const SequenceGame: React.FC<SequenceGameProps> = ({ difficulty, onScoreUpdate }) => {
    const [sequence, setSequence] = useState<string[]>([]);
    const [userSequence, setUserSequence] = useState<string[]>([]);
    const [gameState, setGameState] = useState<'memorize' | 'input' | 'success' | 'fail'>('memorize');
    const [showIndex, setShowIndex] = useState(-1);

    const length = Math.min(3 + difficulty, 8); // Difficulty controls sequence length

    useEffect(() => {
        // Generate Sequence
        const newSeq = Array.from({ length }, () => ICONS[Math.floor(Math.random() * ICONS.length)]);
        setSequence(newSeq);
        setGameState('memorize');

        // Show sequence one by one
        let i = 0;
        const interval = setInterval(() => {
            setShowIndex(i);
            i++;
            if (i > length) {
                clearInterval(interval);
                setShowIndex(-1);
                setGameState('input');
            }
        }, 1000); // 1 second per item

        return () => clearInterval(interval);
    }, [difficulty, length]);

    const handleInput = (icon: string) => {
        if (gameState !== 'input') return;

        const newUserSeq = [...userSequence, icon];
        setUserSequence(newUserSeq);

        // Check correctness immediately
        const currentIndex = newUserSeq.length - 1;
        if (newUserSeq[currentIndex] !== sequence[currentIndex]) {
            setGameState('fail');
            onScoreUpdate(0);
        } else if (newUserSeq.length === sequence.length) {
            setGameState('success');
            onScoreUpdate(100 * difficulty); // Score based on difficulty
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {gameState === 'memorize' && (
                <div style={{ fontSize: '4rem', minHeight: '100px' }}>
                    {showIndex >= 0 && showIndex < sequence.length ? sequence[showIndex] : '...'}
                </div>
            )}

            {gameState === 'input' && (
                <div>
                    <div style={{ marginBottom: '1rem', minHeight: '2rem', fontSize: '2rem' }}>
                        {userSequence.join(' ')}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                        {ICONS.map(icon => (
                            <Button key={icon} variant="secondary" onClick={() => handleInput(icon)} style={{ fontSize: '2rem' }}>
                                {icon}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'success' && (
                <div style={{ color: 'green', fontSize: '2rem', fontWeight: 'bold' }}>
                    正解！ 🎉
                </div>
            )}

            {gameState === 'fail' && (
                <div style={{ color: 'red', fontSize: '2rem', fontWeight: 'bold' }}>
                    残念... 💥
                </div>
            )}
        </div>
    );
};
