'use client';

import React, { useState, useEffect } from 'react';
import { MiniGameConfig, JobType } from '@/types';
import { JobType as JobTypeData } from '@/lib/jobData';
import { MiniGameFrame } from './MiniGameFrame';

// New Animated Components
import { MemoryGame } from './types/MemoryGame'; // Type A
import { SearchGame } from './types/SearchGame'; // Type B
import { TapGame } from './types/TapGame';     // Type C
import { ChoiceGame } from './types/ChoiceGame'; // Type D
import { CreateGame } from './types/CreateGame'; // Type E

import { BakerGame } from './BakerGame';
import { DoctorGame } from './DoctorGame';
import { YoutuberGame } from './YoutuberGame';

// ... (existing imports, keep MemoryGame etc)

interface MiniGameContainerProps {
    config: MiniGameConfig;
    onClose: () => void;
    onComplete: (score: number, isWin: boolean) => void;
}

export const MiniGameContainer: React.FC<MiniGameContainerProps> = ({ config, onClose, onComplete }) => {
    const [gameState, setGameState] = useState<'countdown' | 'playing' | 'result'>('countdown');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(config.duration || 60);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (gameState === 'countdown') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setGameState('playing');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'playing') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setGameState('result');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState]);

    const handleScoreUpdate = (newScore: number) => {
        setScore(newScore);
    };

    const renderGameContent = () => {
        // 1. Job Specific Overrides
        const jobId = config.jobId as JobType | undefined;

        if (jobId === 'bakery' || jobId === 'cake_shop' || jobId === 'pastry_shop' || jobId === 'wagashi_shop') {
            return <BakerGame difficulty={config.difficulty} onScoreUpdate={handleScoreUpdate} />;
        }

        if (jobId === 'doctor') {
            return <DoctorGame difficulty={config.difficulty} onScoreUpdate={handleScoreUpdate} />;
        }

        if (jobId === 'youtuber') {
            return <YoutuberGame onComplete={(s) => handleScoreUpdate(s)} onExit={onClose} />;
        }

        // 2. Generic Type Fallback
        switch (config.type) {
            case 'sequence':
                return <MemoryGame difficulty={config.difficulty} onScoreUpdate={handleScoreUpdate} />;

            case 'search':
                return <SearchGame difficulty={config.difficulty} onScoreUpdate={handleScoreUpdate} />;

            case 'tap':
            case 'timing':
                return <TapGame difficulty={config.difficulty} jobId={jobId} onScoreUpdate={handleScoreUpdate} />;

            case 'choice':
                return <ChoiceGame jobId={jobId as unknown as JobTypeData} difficulty={config.difficulty} onScoreUpdate={handleScoreUpdate} />;

            case 'input':
            case 'puzzle':
                return <CreateGame difficulty={config.difficulty} jobId={jobId} onScoreUpdate={handleScoreUpdate} />;

            // Fallback
            default:
                return <MemoryGame difficulty={config.difficulty} onScoreUpdate={handleScoreUpdate} />;
        }
    };

    return (
        <MiniGameFrame
            gameState={gameState}
            score={score}
            timeLeft={timeLeft}
            duration={config.duration}
            title={config.name}
            description={config.description}
            difficulty={config.difficulty}
            onStart={() => setGameState('countdown')}
            onClose={onClose}
            onConfirmResult={() => onComplete(score, score > 50)}
        >
            {gameState === 'countdown' ? (
                <div className="flex items-center justify-center h-full text-6xl font-bold animate-pulse text-white">
                    {countdown}
                </div>
            ) : (
                renderGameContent()
            )}
        </MiniGameFrame>
    );
};
