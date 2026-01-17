'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface CreateGameProps {
    difficulty: number;
    onScoreUpdate: (score: number) => void;
    jobId?: string;
}

// 花の種類と色
const FLOWERS = [
    { emoji: '🌹', name: 'バラ', color: 'red' },
    { emoji: '🌸', name: 'サクラ', color: 'pink' },
    { emoji: '🌻', name: 'ヒマワリ', color: 'yellow' },
    { emoji: '🌷', name: 'チューリップ', color: 'pink' },
    { emoji: '💐', name: 'ブーケ', color: 'multi' },
    { emoji: '🌺', name: 'ハイビスカス', color: 'red' },
    { emoji: '🏵️', name: 'バッジ', color: 'white' },
    { emoji: '🌼', name: 'デイジー', color: 'white' }
];

const isFlowerArrangeGame = (jobId?: string) => {
    return jobId === 'florist';
};

export const CreateGame: React.FC<CreateGameProps> = ({ difficulty, onScoreUpdate, jobId }) => {
    const [phase, setPhase] = useState<'idle' | 'playing' | 'result'>('idle');
    const [targetPattern, setTargetPattern] = useState<string[]>([]);
    const [playerPattern, setPlayerPattern] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);

    // フラワーアレンジゲームの場合の処理
    useEffect(() => {
        if (phase === 'playing' && isFlowerArrangeGame(jobId)) {
            // タイマー
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        finishGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [phase, jobId]);

    const startGame = () => {
        setPhase('playing');
        setTimeLeft(30);
        setPlayerPattern([]);

        // ターゲットパターン生成（難易度に応じて）
        const patternLength = Math.min(3 + difficulty, 6);
        const pattern: string[] = [];
        for (let i = 0; i < patternLength; i++) {
            pattern.push(FLOWERS[Math.floor(Math.random() * FLOWERS.length)].emoji);
        }
        setTargetPattern(pattern);
    };

    const addFlower = (flowerEmoji: string) => {
        if (playerPattern.length < targetPattern.length) {
            setPlayerPattern([...playerPattern, flowerEmoji]);
        }
    };

    const removeLastFlower = () => {
        setPlayerPattern(playerPattern.slice(0, -1));
    };

    const checkPattern = () => {
        if (playerPattern.length !== targetPattern.length) {
            alert('すべての花を配置してください！');
            return;
        }

        let correct = 0;
        for (let i = 0; i < targetPattern.length; i++) {
            if (targetPattern[i] === playerPattern[i]) {
                correct++;
            }
        }

        const scoreValue = Math.floor((correct / targetPattern.length) * 100);
        setScore(scoreValue);
        onScoreUpdate(scoreValue);
        setPhase('result');
    };

    const finishGame = () => {
        // 時間切れの場合
        let correct = 0;
        for (let i = 0; i < Math.min(targetPattern.length, playerPattern.length); i++) {
            if (targetPattern[i] === playerPattern[i]) {
                correct++;
            }
        }
        const scoreValue = Math.floor((correct / targetPattern.length) * 100);
        setScore(scoreValue);
        onScoreUpdate(scoreValue);
        setPhase('result');
    };

    const reset = () => {
        setPhase('idle');
        setPlayerPattern([]);
        setTargetPattern([]);
        setScore(0);
    };

    // フラワーアレンジゲームの場合のレンダリング
    if (isFlowerArrangeGame(jobId)) {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <AnimatePresence mode="wait">
                    {phase === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💐</div>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>フラワーアレンジメント</h3>
                            <p style={{ marginBottom: '2rem', color: '#666' }}>
                                目標のパターンと同じように花を配置しましょう！
                            </p>
                            <Button onClick={startGame} variant="primary">
                                スタート 🌸
                            </Button>
                        </motion.div>
                    )}

                    {phase === 'playing' && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ width: '100%', maxWidth: '500px' }}
                        >
                            {/* タイマー */}
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '1.5rem',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: timeLeft < 10 ? '#ef4444' : '#3b82f6'
                            }}>
                                ⏱️ {timeLeft}秒
                            </div>

                            {/* 目標パターン */}
                            <div style={{
                                marginBottom: '2rem',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #fef3c7, #fce7f3)',
                                borderRadius: '12px',
                                border: '2px dashed #f59e0b'
                            }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
                                    目標パターン
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '2.5rem'
                                }}>
                                    {targetPattern.map((flower, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            {flower}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* プレイヤーの配置 */}
                            <div style={{
                                marginBottom: '1.5rem',
                                padding: '1rem',
                                background: '#f0fdf4',
                                borderRadius: '12px',
                                border: '2px solid #86efac',
                                minHeight: '80px'
                            }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
                                    あなたの配置 ({playerPattern.length}/{targetPattern.length})
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '2.5rem',
                                    minHeight: '50px',
                                    alignItems: 'center'
                                }}>
                                    {playerPattern.map((flower, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0, y: -20 }}
                                            animate={{ scale: 1, y: 0 }}
                                        >
                                            {flower}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* 花の選択 */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                {FLOWERS.map((flower, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => addFlower(flower.emoji)}
                                        disabled={playerPattern.length >= targetPattern.length}
                                        style={{
                                            fontSize: '2rem',
                                            padding: '0.75rem',
                                            background: 'white',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            opacity: playerPattern.length >= targetPattern.length ? 0.5 : 1
                                        }}
                                    >
                                        {flower.emoji}
                                    </motion.button>
                                ))}
                            </div>

                            {/* アクションボタン */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                    onClick={removeLastFlower}
                                    variant="secondary"
                                    disabled={playerPattern.length === 0}
                                    fullWidth
                                >
                                    ← 戻す
                                </Button>
                                <Button
                                    onClick={checkPattern}
                                    variant="primary"
                                    disabled={playerPattern.length !== targetPattern.length}
                                    fullWidth
                                >
                                    完成！✓
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {phase === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 12 }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{
                                padding: '2rem',
                                background: score >= 80 ? 'linear-gradient(135deg, #fef3c7, #fce7f3)' : 'linear-gradient(135deg, #e0e7ff, #ede9fe)',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                    {score >= 80 ? '🎉' : score >= 50 ? '👍' : '💪'}
                                </div>
                                <div style={{ fontSize: '1.2rem', color: '#555', marginBottom: '0.5rem' }}>
                                    {score >= 80 ? '素晴らしい！' : score >= 50 ? '良い感じ！' : '次は頑張ろう！'}
                                </div>
                                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#db2777', margin: '1rem 0' }}>
                                    {score}点
                                </div>
                            </div>

                            <Button onClick={reset} variant="secondary">もう一度</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // デフォルトの制作ゲーム（他の職業用）
    const THEMES = ['動画', '絵画', '料理', '花束', '記事', 'コード'];
    const [defaultPhase, setDefaultPhase] = useState<'idle' | 'creating' | 'result'>('idle');
    const [progress, setProgress] = useState(0);
    const [theme, setTheme] = useState(THEMES[0]);
    const [views, setViews] = useState(0);

    const handleCreate = () => {
        setDefaultPhase('creating');
        setProgress(0);

        let p = 0;
        const interval = setInterval(() => {
            p += 5 + (Math.random() * 10);
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                finishCreation();
            }
            setProgress(p);
        }, 100);
    };

    const finishCreation = () => {
        setTimeout(() => {
            setDefaultPhase('result');
            const base = 1000 * difficulty;
            const rand = Math.random() * 2;
            const total = Math.floor(base * rand);
            setViews(total);
            onScoreUpdate(Math.min(100, Math.floor(total / 100)));
        }, 500);
    };

    const resetDefault = () => {
        setDefaultPhase('idle');
        setTheme(THEMES[Math.floor(Math.random() * THEMES.length)]);
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
                {defaultPhase === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ textAlign: 'center' }}
                    >
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>次の作品: 「{theme}」</h3>
                        <Button
                            onClick={handleCreate}
                            style={{
                                padding: '2rem', borderRadius: '50%', width: '150px', height: '150px',
                                fontSize: '1.5rem', fontWeight: 'bold', boxShadow: '0 0 20px rgba(0,0,0,0.1)'
                            }}
                            variant="primary"
                        >
                            制作！
                        </Button>
                    </motion.div>
                )}

                {defaultPhase === 'creating' && (
                    <motion.div
                        key="creating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', width: '80%' }}
                    >
                        <h3 style={{ marginBottom: '1rem' }}>制作中...</h3>
                        <div style={{ width: '100%', height: '20px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div
                                style={{ height: '100%', background: '#8b5cf6' }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={{ fontSize: '4rem', marginTop: '2rem' }}
                        >
                            ⚙️
                        </motion.div>
                    </motion.div>
                )}

                {defaultPhase === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ scale: 0, rotateY: 180 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{
                            padding: '2rem', background: 'linear-gradient(135deg, #fce7f3, #e9d5ff)',
                            borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ fontSize: '1.2rem', color: '#555' }}>作品が完成しました！</div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#db2777', margin: '1rem 0' }}>
                                ❤️ {views.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#888' }}>評価獲得！</div>
                        </div>

                        <Button onClick={resetDefault} variant="secondary">次の作品を作る</Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
