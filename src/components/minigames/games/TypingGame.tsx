'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface TypingGameProps {
    difficulty?: number;
    onComplete: (score: number) => void;
}

const WORDS = [
    'react', 'nextjs', 'typescript', 'javascript', 'component',
    'interface', 'function', 'variable', 'constant', 'promise',
    'async', 'await', 'import', 'export', 'default',
    'render', 'state', 'effect', 'context', 'provider',
    'programming', 'developer', 'software', 'engineer', 'code',
    'algorithm', 'database', 'frontend', 'backend', 'fullstack'
];

export const TypingGame: React.FC<TypingGameProps> = ({ difficulty = 1, onComplete }) => {
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
    const [targetWords, setTargetWords] = useState<string[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [inputText, setInputText] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);

    // Performance metrics
    const [correctChars, setCorrectChars] = useState(0);
    const [totalChars, setTotalChars] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize words
    useEffect(() => {
        if (gameState === 'ready') {
            const shuffled = [...WORDS].sort(() => 0.5 - Math.random());
            setTargetWords(shuffled.slice(0, 10 + difficulty * 2));
        }
    }, [gameState, difficulty]);

    // Timer and Focus
    useEffect(() => {
        if (gameState === 'playing') {
            inputRef.current?.focus();

            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) {
                        finishGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState]);

    const finishGame = () => {
        setGameState('finished');

        // Score calculation logic
        // Base score on completed words + accuracy
        // Simple implementation: (Correct Chars / Time) * Accuracy multiplier
        // Max score ~ 100

        if (totalChars === 0) {
            setTimeout(() => onComplete(0), 1000);
            return;
        }

        const accuracy = correctChars / totalChars;
        // WPM approx = (correctChars / 5) / (30 / 60) = correctChars * 0.4
        // Let's make 100 score target around 200 chars in 30s (~80 WPM)
        const rawScore = (correctChars / 2); // 200 chars -> 100 pts
        const finalScore = Math.min(100, Math.round(rawScore * accuracy));

        setTimeout(() => onComplete(finalScore), 2000);
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const target = targetWords[currentWordIndex];
        setInputText(val);

        // Check completion
        if (val === target) {
            setScore(prev => prev + 10);
            setCorrectChars(prev => prev + val.length);
            setTotalChars(prev => prev + val.length); // Count valid chars
            setCurrentWordIndex(prev => prev + 1);
            setInputText('');

            // Completion bonus if all words done (unlikely in time but possible)
            if (currentWordIndex === targetWords.length - 1) {
                // Add remaining time bonus
                setScore(prev => prev + timeLeft * 5);
                finishGame(); // Early finish ? Or just generate more words?
                // Just stop for now
            }
        } else {
            // Typing logic: check prefix match for error highlight?
            // Simplified: just update input text. 
            // Validating accuracy on character basis here would be better but keeping simple.
            // If length increases, increment totalChars attempted
            if (val.length > inputText.length) {
                setTotalChars(prev => prev + 1);
                // Check if last char was correct
                if (val[val.length - 1] === target[val.length - 1]) {
                    setCorrectChars(prev => prev + 1);
                }
            }
        }
    };

    if (gameState === 'ready') {
        return (
            <div className="text-center p-8 space-y-6">
                <h2 className="text-2xl font-bold">タイピング試験</h2>
                <div className="text-gray-600">
                    <p>表示される単語を素早く入力してください。</p>
                    <p>制限時間: 30秒</p>
                </div>
                <Button size="lg" onClick={() => setGameState('playing')}>試験開始</Button>
            </div>
        );
    }

    if (gameState === 'finished') {
        const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
        // Re-calc final score for display consistency
        const rawScore = (correctChars / 2);
        const finalScore = Math.min(100, Math.round(rawScore * (accuracy / 100)));

        return (
            <div className="text-center p-8 space-y-6">
                <h2 className="text-2xl font-bold">試験終了</h2>
                <div className="space-y-2">
                    <div className="text-4xl font-bold text-indigo-600">{finalScore}点</div>
                    <div className="text-sm text-gray-500">
                        正解文字数: {correctChars} / 精度: {accuracy}%
                    </div>
                </div>
            </div>
        );
    }

    const currentTarget = targetWords[currentWordIndex];

    return (
        <div className="max-w-xl mx-auto p-8 space-y-8 text-center">
            <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                <span>Word {currentWordIndex + 1}</span>
                <span>⏱️ {timeLeft}s</span>
            </div>

            <div className="space-y-4">
                <div className="text-4xl font-mono font-bold tracking-wider text-gray-800 break-all min-h-[60px]">
                    {currentTarget.split('').map((char, idx) => {
                        let color = 'text-gray-800';
                        if (idx < inputText.length) {
                            color = inputText[idx] === char ? 'text-green-500' : 'text-red-500 bg-red-100';
                        }
                        return <span key={idx} className={color}>{char}</span>
                    })}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleInput}
                    className="w-full text-center text-2xl p-4 border-b-2 border-indigo-500 focus:outline-none font-mono bg-transparent"
                    placeholder="Type here..."
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                />

                <p className="text-sm text-gray-400">Enterキー不要、スペース不要</p>
            </div>

            <div className="flex justify-center gap-2 text-xs text-gray-300 font-mono">
                {targetWords.slice(currentWordIndex + 1, currentWordIndex + 4).map((w, i) => (
                    <span key={i}>{w}</span>
                ))}
            </div>
        </div>
    );
};
