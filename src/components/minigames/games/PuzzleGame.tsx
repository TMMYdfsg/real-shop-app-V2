'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface PuzzleGameProps {
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ difficulty, onScoreUpdate }) => {
    // Simple Slider Puzzle (3x3 - 1 empty)
    // Numbers 1-8. 0 is empty.
    const SIZE = 3;
    const [board, setBoard] = useState<number[]>([]);
    const [solvedBoard, setSolvedBoard] = useState<number[]>([]);
    const [isSolved, setIsSolved] = useState(false);
    const [moves, setMoves] = useState(0);

    useEffect(() => {
        // Initialize solved state
        const initial = Array.from({ length: SIZE * SIZE }, (_, i) => (i + 1) % (SIZE * SIZE));
        setSolvedBoard([...initial]); // [1, 2, 3, 4, 5, 6, 7, 8, 0]

        // Shuffle
        let current = [...initial];
        // Make solvable shuffle by simulating random moves
        let emptyIdx = SIZE * SIZE - 1;
        const shuffleMoves = 20 * difficulty;

        for (let i = 0; i < shuffleMoves; i++) {
            const neighbors = getNeighbors(emptyIdx, SIZE);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];

            // Swap
            [current[emptyIdx], current[randomNeighbor]] = [current[randomNeighbor], current[emptyIdx]];
            emptyIdx = randomNeighbor;
        }

        setBoard(current);
        setMoves(0);
        setIsSolved(false);
    }, [difficulty]);

    const getNeighbors = (index: number, size: number) => {
        const neighbors = [];
        const x = index % size;
        const y = Math.floor(index / size);

        if (x > 0) neighbors.push(index - 1);
        if (x < size - 1) neighbors.push(index + 1);
        if (y > 0) neighbors.push(index - size);
        if (y < size - 1) neighbors.push(index + size);
        return neighbors;
    };

    const handleTileClick = (index: number) => {
        if (isSolved) return;

        const emptyIndex = board.indexOf(0);
        const neighbors = getNeighbors(emptyIndex, SIZE);

        if (neighbors.includes(index)) {
            const newBoard = [...board];
            [newBoard[emptyIndex], newBoard[index]] = [newBoard[index], newBoard[emptyIndex]];
            setBoard(newBoard);
            setMoves(m => m + 1);

            // Check if solved
            if (newBoard.every((val, i) => val === solvedBoard[i])) {
                setIsSolved(true);
                // Score based on moves? Or just completion?
                // Base 100, minus moves penalty?
                // Or just clear = 100
                onScoreUpdate(100);
            } else {
                onScoreUpdate(0);
            }
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
                {isSolved ? <span style={{ color: 'green', fontWeight: 'bold' }}>完成！</span> : '正しい順序に並べ替えよう'}
                <br /> Moves: {moves}
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
                gap: '5px',
                maxWidth: '300px',
                margin: '0 auto',
                aspectRatio: '1/1'
            }}>
                {board.map((num, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleTileClick(idx)}
                        style={{
                            background: num === 0 ? 'transparent' : '#3b82f6',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            cursor: num === 0 ? 'default' : 'pointer',
                            opacity: num === 0 ? 0 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {num !== 0 && num}
                    </div>
                ))}
            </div>
        </div>
    );
};
