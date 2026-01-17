'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';

interface DrivingGameProps {
    onComplete: (score: number, items: number) => void; // score: 0-100 (integrity), items: coins
    difficulty: number;
}

export const DrivingGame: React.FC<DrivingGameProps> = ({ onComplete, difficulty = 1 }) => {
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'crashed' | 'finished'>('ready');
    const [timeLeft, setTimeLeft] = useState(20); // 20 seconds drive
    const [score, setScore] = useState(100); // 100% integrity
    const [coins, setCoins] = useState(0); // Optional bonuses

    // Player position: 0 (left), 1 (center), 2 (right)
    const [lane, setLane] = useState(1);

    // Game loop ref
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>();

    // Objects state
    const [objects, setObjects] = useState<{ id: number, lane: number, y: number, type: 'obstacle' | 'coin' }[]>([]);
    const objectIdRef = useRef(0);
    const lastSpawnTimeRef = useRef(0);

    const PLAYER_Y = 80; // Player fixed Y position (%)

    // ============================
    // Controls
    // ============================
    const moveLeft = useCallback(() => {
        if (gameState !== 'playing') return;
        setLane(current => Math.max(0, current - 1));
    }, [gameState]);

    const moveRight = useCallback(() => {
        if (gameState !== 'playing') return;
        setLane(current => Math.min(2, current + 1));
    }, [gameState]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft();
            if (e.key === 'ArrowRight' || e.key === 'd') moveRight();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [moveLeft, moveRight]);

    // ============================
    // Game Loop
    // ============================
    const startGame = () => {
        setGameState('playing');
        startTimeRef.current = Date.now();
        lastSpawnTimeRef.current = Date.now();
        loop();
    };

    const loop = () => {
        if (gameState === 'finished' || gameState === 'crashed') return;

        const now = Date.now();

        // 1. Time management
        if (startTimeRef.current) {
            const elapsed = (now - startTimeRef.current) / 1000;
            const remaining = Math.max(0, 20 - elapsed);
            setTimeLeft(remaining);

            if (remaining <= 0) {
                endGame('finished');
                return;
            }
        }

        // 2. Spawn objects
        const spawnInterval = Math.max(500, 1500 - (difficulty * 200)); // Difficulty adjusts speed
        if (now - lastSpawnTimeRef.current > spawnInterval) {
            const type = Math.random() < 0.2 ? 'coin' : 'obstacle';
            setObjects(prev => [
                ...prev,
                {
                    id: objectIdRef.current++,
                    lane: Math.floor(Math.random() * 3),
                    y: -10, // Start above screen
                    type
                }
            ]);
            lastSpawnTimeRef.current = now;
        }

        // 3. Move objects
        const speed = 0.5 + (difficulty * 0.1); // Speed based on difficulty
        setObjects(prev => {
            const nextObjects: typeof prev = [];

            prev.forEach(obj => {
                const newY = obj.y + speed;

                // Hit detection
                let hit = false;
                if (newY > PLAYER_Y - 5 && newY < PLAYER_Y + 5 && obj.lane === lane) {
                    hit = true;
                    if (obj.type === 'obstacle') {
                        setScore(s => Math.max(0, s - 20));
                        // Crash effect could be added here
                    } else if (obj.type === 'coin') {
                        setCoins(c => c + 1);
                    }
                }

                // Keep if not hit (or coin collected) and still on screen
                if (!hit && newY < 110) {
                    nextObjects.push({ ...obj, y: newY });
                }
                // If obstacle hit, remove it (and damage dealt above)
                // If coin hit, remove it (and collected above)
            });

            return nextObjects;
        });

        requestRef.current = requestAnimationFrame(loop);
    };

    // Need to use refs for 'lane' inside requestAnimationFrame closure?
    // Actually simpler to just use setObjects functional update, and check collision inside a separate effect
    // But for smooth game loop, logic inside loop is better.
    // React state updates in loop might be slow. Simplified approach:
    // We used 'lane' state directly in the loop above which captures the INITIAL 'lane' value due to closure.
    // FIX: use a ref for current lane to access it in loop.
    const laneRef = useRef(lane);
    useEffect(() => laneRef.current = lane, [lane]);

    // Redefine loop to use refs for collision logic
    const updateGame = () => {
        setObjects(prev => {
            const speed = 0.8 + (difficulty * 0.2);
            const nextObjects: typeof prev = [];
            let hitOccurred = false;
            let coinCollected = false;

            prev.forEach(obj => {
                const newY = obj.y + speed;
                let isHit = false;

                // Collision box
                if (newY > PLAYER_Y - 8 && newY < PLAYER_Y + 8 && obj.lane === laneRef.current) {
                    isHit = true;
                    if (obj.type === 'obstacle') {
                        // HIT OBSTACLE
                        hitOccurred = true;
                    } else {
                        // HIT COIN
                        coinCollected = true;
                    }
                }

                if (!isHit && newY < 120) {
                    nextObjects.push({ ...obj, y: newY });
                }
            });

            if (hitOccurred) setScore(s => Math.max(0, s - 25));
            if (coinCollected) setCoins(c => c + 1);

            return nextObjects;
        });
    };

    useEffect(() => {
        if (gameState === 'playing') {
            const interval = setInterval(updateGame, 16); // 60fps approx
            return () => clearInterval(interval);
        }
    }, [gameState]);

    // Check game over by score
    useEffect(() => {
        if (score <= 0 && gameState === 'playing') {
            endGame('crashed');
        }
    }, [score, gameState]);

    const endGame = (status: 'crashed' | 'finished') => {
        setGameState(status);
        if (status === 'finished') {
            // Success
            setTimeout(() => onComplete(score, coins), 1500);
        } else {
            // Failed
            setTimeout(() => onComplete(0, coins), 1500);
        }
    };

    return (
        <div className="relative w-full h-[400px] bg-gray-800 rounded-lg overflow-hidden select-none">
            {/* Road Markings */}
            <div className="absolute inset-x-0 h-full flex pt-10">
                <div className="flex-1 border-r-2 border-dashed border-gray-500 h-full opacity-50"></div>
                <div className="flex-1 border-r-2 border-dashed border-gray-500 h-full opacity-50"></div>
                <div className="flex-1"></div>
            </div>

            {/* Header / HUD */}
            <div className="absolute top-0 w-full p-2 flex justify-between text-white font-bold z-10 bg-black/30">
                <div>耐久: <span className={score < 50 ? 'text-red-400' : 'text-green-400'}>{score}%</span></div>
                <div>時間: {timeLeft.toFixed(1)}s</div>
                <div>💰: {coins}</div>
            </div>

            {/* Objects */}
            {objects.map(obj => (
                <div
                    key={obj.id}
                    className="absolute transition-none"
                    style={{
                        left: `${(obj.lane * 33.33) + 16.66}%`,
                        top: `${obj.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: '2rem'
                    }}
                >
                    {obj.type === 'obstacle' ? '🚧' : '🟡'}
                </div>
            ))}

            {/* Player */}
            <motion.div
                animate={{
                    left: `${(lane * 33.33) + 16.66}%`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute text-5xl z-20"
                style={{
                    top: `${PLAYER_Y}%`,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                🚘
            </motion.div>

            {/* Start Screen */}
            {gameState === 'ready' && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-30">
                    <h2 className="text-3xl font-bold mb-4">DRIVE SAFE!</h2>
                    <p className="mb-6 text-center text-sm px-8">
                        左右キー または タップで車線変更。<br />
                        障害物を避けて職場へ急げ！
                    </p>
                    <Button onClick={startGame} size="lg">スタート</Button>
                </div>
            )}

            {/* Result Overlay */}
            {gameState === 'crashed' && (
                <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white z-30 animate-pulse">
                    <h2 className="text-4xl font-bold mb-2">事故発生！</h2>
                    <div className="text-6xl mb-4">💥</div>
                    <p>修理費がかかります...</p>
                </div>
            )}

            {gameState === 'finished' && (
                <div className="absolute inset-0 bg-green-900/80 flex flex-col items-center justify-center text-white z-30">
                    <h2 className="text-4xl font-bold mb-2">到着！</h2>
                    <p>安全運転でした。</p>
                    <div className="mt-4 text-xl">Score: {score}</div>
                </div>
            )}

            {/* Touch Controls (Invisible overlay) */}
            {gameState === 'playing' && (
                <div className="absolute inset-0 flex z-20">
                    <div className="flex-1" onClick={moveLeft}></div>
                    <div className="flex-1" onClick={moveRight}></div>
                </div>
            )}
        </div>
    );
};
