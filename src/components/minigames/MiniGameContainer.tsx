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

interface MiniGameContainerProps {
    config: MiniGameConfig;
    onComplete: (score: number, success: boolean) => void;
    onClose: () => void;
}

export const MiniGameContainer: React.FC<MiniGameContainerProps> = ({ config, onComplete, onClose }) => {
    const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'result'>('intro');
    const [timeLeft, setTimeLeft] = useState(config.duration);
    const [score, setScore] = useState(0);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState === 'countdown') {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setGameState('playing');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (gameState === 'playing') {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0) {
                        setGameState('result');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [gameState]);

    const handleScoreUpdate = (newScore: number) => {
        setScore(newScore);
        // Ensure we don't end game automatically unless desired by child, 
        // typically children just update score, game ends on time or explicit finish.
        // Some games like Puzzle might end early?
        // Let's keep it time-based for mostly consistency or max score cap.
        // For now, allow score updates freely.
    };

    const renderGameContent = () => {
        // Mapping old types/configs to new Components based on "Animation Type" logic
        // If config.type is explicitly one of the new types, use it.
        // Or map existing ones.

        switch (config.type) {
            case 'sequence':
                return <MemoryGame difficulty={config.difficulty} onScoreUpdate={handleScoreUpdate} />;

            case 'search':
                return <SearchGame difficulty={config.difficulty} onScoreUpdate={handleScoreUpdate} />;

            case 'tap':
            case 'timing':
                return <TapGame difficulty={config.difficulty} jobId={config.jobId} onScoreUpdate={handleScoreUpdate} />;

            case 'choice':
                return <ChoiceGame jobId={config.jobId as unknown as JobTypeData} difficulty={config.difficulty} onScoreUpdate={handleScoreUpdate} />;

            case 'input':
            case 'puzzle':
                return <CreateGame difficulty={config.difficulty} jobId={config.jobId} onScoreUpdate={handleScoreUpdate} />;

            // Fallback
            default:
                // Use MemoryGame as default fallback purely
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
            {gameState === 'countdown' ? countdown : renderGameContent()}
        </MiniGameFrame>
    );
};
