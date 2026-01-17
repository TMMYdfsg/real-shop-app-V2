'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QUIZ_DATABASE, QuizQuestion } from '@/lib/gameData';

interface QuizGameProps {
    category: string;
    difficulty?: number;
    onComplete: (score: number) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ category, difficulty = 1, onComplete }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
    const [timeLeft, setTimeLeft] = useState(30); // 1問あたりの時間ではなく全体または調整

    // Load questions based on category
    useEffect(() => {
        let q = QUIZ_DATABASE.filter(q => q.category === category || category === 'all');
        if (q.length === 0) {
            // Fallback for demo if no questions found for category
            q = QUIZ_DATABASE;
        }
        // Shuffle and pick 5
        const shuffled = [...q].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 5));
    }, [category]);

    useEffect(() => {
        if (gameState === 'playing') {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) {
                        handleFinish(score);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState, score]);

    const handleAnswer = (optionIndex: number) => {
        const currentQ = questions[currentIndex];
        let newScore = score;

        if (optionIndex === currentQ.correctIndex) {
            newScore += 1;
            setScore(newScore);
        }

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            handleFinish(newScore);
        }
    };

    const handleFinish = (finalScore: number) => {
        setGameState('finished');
        // Normalize score to 0-100
        const normalized = Math.round((finalScore / questions.length) * 100);
        setTimeout(() => {
            onComplete(normalized);
        }, 1500);
    };

    if (gameState === 'ready') {
        return (
            <div className="text-center p-8 space-y-6">
                <h2 className="text-2xl font-bold">筆記試験を開始します</h2>
                <div className="text-gray-600">
                    <p>全{questions.length}問</p>
                    <p>制限時間: 30秒</p>
                    <p>合格基準: 60点以上</p>
                </div>
                <Button size="lg" onClick={() => setGameState('playing')}>試験開始</Button>
            </div>
        );
    }

    if (gameState === 'finished') {
        const normalized = Math.round((score / questions.length) * 100);
        return (
            <div className="text-center p-8 space-y-6">
                <h2 className="text-2xl font-bold">試験終了</h2>
                <div className="text-4xl font-bold text-indigo-600">
                    {normalized}点
                </div>
                <p className="text-gray-500">採点中...</p>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    if (!currentQ) return <div>No questions loaded.</div>;

    return (
        <div className="max-w-xl mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                <span>Question {currentIndex + 1} / {questions.length}</span>
                <span>⏱️ {timeLeft}s</span>
            </div>

            <Card>
                <div className="min-h-[100px] flex items-center justify-center p-4">
                    <h3 className="text-xl font-bold text-center text-gray-800">
                        {currentQ.text}
                    </h3>
                </div>
            </Card>

            <div className="grid gap-3">
                {currentQ.options.map((option, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(idx)}
                        className="w-full p-4 bg-white border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl text-left font-bold text-gray-700 transition-colors"
                    >
                        {idx + 1}. {option}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
