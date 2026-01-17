'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { DrivingGame } from '@/components/minigames/games/DrivingGame';
import Confetti from 'react-confetti';

export default function CommuteRunPage() {
    const params = useParams();
    const router = useRouter();
    const { currentUser, refresh } = useGame();
    const playerId = params.id as string;

    const [status, setStatus] = useState<'idle' | 'minigame' | 'commuting' | 'result'>('idle');
    const [minigameScore, setMinigameScore] = useState<number | undefined>(undefined);
    const [result, setResult] = useState<any>(null);
    const [animationText, setAnimationText] = useState('');

    useEffect(() => {
        if (!currentUser) return;
        if (!currentUser.commuteMethod) {
            alert('通勤設定がされていません。設定画面へ移動します。');
            router.push(`/player/${playerId}/commute/config`);
        }
    }, [currentUser, router, playerId]);

    const handleStartCommute = () => {
        if (!currentUser) return;

        // Check for minigame trigger (Car only, 30% chance or forced for testing)
        // 今回はデモのため確率高め(50%)にしておく
        if (currentUser.commuteMethod === 'car' && Math.random() < 0.5) {
            setStatus('minigame');
        } else {
            executeCommute();
        }
    };

    const handleMinigameComplete = (score: number, items: number) => {
        setMinigameScore(score);
        executeCommute(score);
    };

    const executeCommute = async (score?: number) => {
        setStatus('commuting');
        setAnimationText('出勤中...');

        try {
            // アニメーション用ウェイト
            await new Promise(r => setTimeout(r, 2000));

            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'commute',
                    requesterId: playerId,
                    details: JSON.stringify({
                        minigameScore: score
                    })
                })
            });
            const data = await res.json();
            setResult(data);
            setStatus('result');
            refresh();
        } catch (e) {
            console.error(e);
            alert('通信エラー');
            setStatus('idle');
        }
    };

    if (!currentUser) return <div className="p-4">Loading...</div>;

    // Icon mapping
    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'walk': return '🚶';
            case 'bicycle': return '🚲';
            case 'train': return '🚃';
            case 'bus': return '🚌';
            case 'taxi': return '🚕';
            case 'car': return '🚗';
            default: return '🏃';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
            {/* Background Animation Elements */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute top-20 left-0 w-full h-32 bg-gray-300 transform -skew-y-3"></div>
                <div className="absolute bottom-20 left-0 w-full h-32 bg-gray-300 transform skew-y-3"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">

                {/* IDLE */}
                {status === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-6"
                    >
                        <h1 className="text-2xl font-bold text-gray-800">今日も一日がんばろう！</h1>

                        <div className="py-6">
                            <div className="text-6xl mb-2 animate-bounce">
                                {getMethodIcon(currentUser.commuteMethod || 'walk')}
                            </div>
                            <div className="text-gray-500">
                                通勤手段: <span className="font-bold text-gray-800">
                                    {currentUser.commuteMethod === 'car' ? '自家用車' :
                                        currentUser.commuteMethod === 'train' ? '電車' :
                                            currentUser.commuteMethod === 'bus' ? 'バス' :
                                                currentUser.commuteMethod === 'bicycle' ? '自転車' : '徒歩'}
                                </span>
                            </div>
                            {currentUser.commuteDistance && (
                                <div className="text-sm text-gray-400">
                                    距離: {currentUser.commuteDistance}km
                                </div>
                            )}
                        </div>

                        <Button size="lg" fullWidth onClick={handleStartCommute}>
                            出勤する
                        </Button>

                        <div className="pt-2">
                            <button
                                onClick={() => router.push(`/player/${playerId}/commute/config`)}
                                className="text-sm text-gray-500 underline hover:text-indigo-600"
                            >
                                設定を変更する
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* MINIGAME */}
                {status === 'minigame' && (
                    <div className="w-full max-w-md space-y-4">
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
                            <p className="font-bold">🚨 運転チャレンジ！</p>
                            <p className="text-sm">安全運転でボーナス獲得 & 事故回避！</p>
                        </div>
                        <DrivingGame
                            difficulty={1}
                            onComplete={handleMinigameComplete}
                        />
                    </div>
                )}

                {/* COMMUTING ANIMATION */}
                {status === 'commuting' && (
                    <div className="text-center">
                        <motion.div
                            animate={{ x: [-100, 100, -100] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="text-6xl mb-4"
                        >
                            {getMethodIcon(currentUser.commuteMethod || 'walk')}
                        </motion.div>
                        <h2 className="text-2xl font-bold text-gray-700 animate-pulse">
                            {animationText}
                        </h2>
                    </div>
                )}

                {/* RESULT */}
                {status === 'result' && result && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full space-y-4 relative overflow-hidden"
                    >
                        {/* Bonus Confetti */}
                        {result.minigameBonus > 0 && <Confetti numberOfPieces={100} recycle={false} />}

                        <div className="text-center pb-4 border-b border-gray-100">
                            <div className="text-4xl mb-2">
                                {result.late ? '😰' : result.event ? '😲' : '✨'}
                            </div>
                            <h2 className="text-xl font-bold">
                                {result.late ? '遅刻しました...' : '到着しました！'}
                            </h2>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-600">{result.message}</p>
                            </div>

                            {result.cost > 0 && (
                                <div className="flex justify-between text-red-500 font-bold">
                                    <span>通勤コスト</span>
                                    <span>-¥{result.cost.toLocaleString()}</span>
                                </div>
                            )}

                            {result.minigameBonus > 0 && (
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>安全運転ボーナス</span>
                                    <span>+¥{result.minigameBonus.toLocaleString()}</span>
                                </div>
                            )}

                            {result.event && result.event.effects.stress && (
                                <div className="flex justify-between text-orange-500">
                                    <span>ストレス</span>
                                    <span>+{result.event.effects.stress}</span>
                                </div>
                            )}
                        </div>

                        <Button
                            fullWidth
                            onClick={() => router.push(`/player/${playerId}`)}
                        >
                            ダッシュボードへ
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
