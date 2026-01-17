'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface ActionGameProps {
    difficulty?: number;
    onComplete: (score: number) => void;
}

export const ActionGame: React.FC<ActionGameProps> = ({ difficulty = 1, onComplete }) => {
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [cursorPos, setCursorPos] = useState(0); // 0-100%
    const [movingRight, setMovingRight] = useState(true);
    const [targetZone, setTargetZone] = useState({ start: 40, width: 20 });
    const [successCount, setSuccessCount] = useState(0);
    const [round, setRound] = useState(0);

    const requestRef = useRef<number | null>(null);

    // Init new target
    const nextTarget = () => {
        const width = Math.max(5, 25 - (difficulty * 4)); // Diff 1: 21%, Diff 5: 5%
        const start = Math.random() * (90 - width) + 5;
        setTargetZone({ start, width });
        setRound(r => r + 1);
    };

    // Game Loop
    useEffect(() => {
        if (gameState === 'playing') {
            nextTarget();

            const speed = 0.5 + (difficulty * 0.3); // movement speed
            let pos = 0;
            let dir = 1;

            const animate = () => {
                pos += speed * dir;
                if (pos >= 100) { pos = 100; dir = -1; }
                if (pos <= 0) { pos = 0; dir = 1; }

                setCursorPos(pos);
                requestRef.current = requestAnimationFrame(animate);
            };
            requestRef.current = requestAnimationFrame(animate);

            // Timer
            const timer = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 0) {
                        setGameState('finished');
                        if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);

            return () => {
                clearInterval(timer);
                if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
            };
        }
    }, [gameState, difficulty]); // Should not depend on difficulty changing mid-game, but ok

    useEffect(() => {
        if (gameState === 'finished') {
            // Calc score
            // Max score around 10 successes?
            const finalScore = Math.min(100, successCount * 10);
            setTimeout(() => onComplete(finalScore), 1500);
        }
    }, [gameState, successCount, onComplete]);

    const handleAction = () => {
        if (gameState !== 'playing') return;

        // Check hit
        const hit = cursorPos >= targetZone.start && cursorPos <= (targetZone.start + targetZone.width);

        if (hit) {
            setSuccessCount(c => c + 1);
            // Visual feedback?
        }

        // Next round regardless of hit/miss? Or penalty?
        // Let's just go next immediately
        nextTarget();
    };

    if (gameState === 'ready') {
        return (
            <div className="text-center p-8 space-y-6">
                <h2 className="text-2xl font-bold">実技試験（タイミング）</h2>
                <div className="text-gray-600">
                    <p>動くバーを緑のゾーンに合わせて止めてください。</p>
                    <p>制限時間: 20秒</p>
                </div>
                <Button size="lg" onClick={() => setGameState('playing')}>試験開始</Button>
            </div>
        );
    }

    if (gameState === 'finished') {
        const finalScore = Math.min(100, successCount * 10);
        return (
            <div className="text-center p-8 space-y-6">
                <h2 className="text-2xl font-bold">試験終了</h2>
                <div className="text-4xl font-bold text-indigo-600">{finalScore}点</div>
                <p>成功回数: {successCount}回</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-8 space-y-8 select-none">
            <div className="flex justify-between font-bold text-gray-500">
                <span>Success: {successCount}</span>
                <span>⏱️ {timeLeft}s</span>
            </div>

            <div className="relative h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
                {/* Target Zone */}
                <div
                    className="absolute top-0 bottom-0 bg-green-500 opacity-50"
                    style={{
                        left: `${targetZone.start}%`,
                        width: `${targetZone.width}%`
                    }}
                />

                {/* Cursor */}
                <div
                    className="absolute top-0 bottom-0 w-2 bg-red-600 shadow-lg"
                    style={{ left: `${cursorPos}%` }}
                />
            </div>

            <Button size="lg" fullWidth className="h-24 text-2xl" onClick={handleAction}>
                STOP!
            </Button>

            <p className="text-center text-xs text-gray-400">
                Tap or Click to stop
            </p>
        </div>
    );
};
