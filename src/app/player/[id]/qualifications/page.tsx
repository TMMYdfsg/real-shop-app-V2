'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { QUALIFICATIONS } from '@/lib/gameData';
import { Qualification } from '@/types';
import { QuizGame } from '@/components/minigames/games/QuizGame';
import { TypingGame } from '@/components/minigames/games/TypingGame';
import { DrivingGame } from '@/components/minigames/games/DrivingGame';
import Confetti from 'react-confetti';

export default function QualificationsPage() {
    const params = useParams();
    const router = useRouter();
    const { currentUser, refresh } = useGame();
    const playerId = params.id as string;

    const [selectedQual, setSelectedQual] = useState<Qualification | null>(null);
    const [examState, setExamState] = useState<'idle' | 'playing' | 'result'>('idle');
    const [examResult, setExamResult] = useState<any>(null);
    const [minigameScore, setMinigameScore] = useState(0);

    const handleStartExam = () => {
        if (!selectedQual || !currentUser) return;
        if (currentUser.balance < selectedQual.examFee) {
            alert('受験料が足りません');
            return;
        }
        setExamState('playing');
    };

    const handleMinigameComplete = async (score: number, coins?: number) => {
        setMinigameScore(score);

        // Submit result
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'process_exam',
                    requesterId: playerId,
                    details: JSON.stringify({
                        qualificationId: selectedQual?.id,
                        score: score
                    })
                })
            });
            const data = await res.json();
            setExamResult(data);
            setExamState('result');
            refresh();
        } catch (e) {
            console.error(e);
            alert('通信エラー');
            setExamState('idle'); // Retry or close
        }
    };

    const renderMinigame = () => {
        if (!selectedQual) return null;

        switch (selectedQual.minigameType) {
            case 'driving':
                return <DrivingGame difficulty={selectedQual.difficulty} onComplete={(s) => handleMinigameComplete(s)} />;
            case 'typing':
                return <TypingGame difficulty={selectedQual.difficulty} onComplete={handleMinigameComplete} />;
            case 'quiz':
            default:
                // Category matching
                return <QuizGame category={selectedQual.category} difficulty={selectedQual.difficulty} onComplete={handleMinigameComplete} />;
        }
    };

    if (!currentUser) return <div className="p-4">Loading...</div>;

    const ownedQuals = currentUser.qualifications || [];

    // Group by category for nicer UI
    const categories = Array.from(new Set(QUALIFICATIONS.map(q => q.category)));

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-gray-600">
                        ← 戻る
                    </button>
                    <h1 className="font-bold text-lg">資格・検定センター</h1>
                    <div className="w-8" />
                </div>
            </div>

            <main className="max-w-md mx-auto p-4 space-y-6">

                {/* Stats */}
                <div className="flex gap-4 overflow-x-auto pb-2">
                    <Card className="min-w-[150px]">
                        <div className="text-xs text-gray-500">取得資格数</div>
                        <div className="text-2xl font-bold">{ownedQuals.length}</div>
                    </Card>
                    <Card className="min-w-[150px]">
                        <div className="text-xs text-gray-500">学習レベル</div>
                        <div className="text-2xl font-bold">1</div>
                    </Card>
                </div>

                {categories.map(cat => (
                    <div key={cat} className="space-y-2">
                        <h2 className="font-bold text-gray-700 capitalize border-l-4 border-indigo-500 pl-2">
                            {cat === 'driving' ? '運転・免許' :
                                cat === 'business' ? 'ビジネス・IT' :
                                    cat === 'language' ? '語学' :
                                        cat === 'food' ? '飲食・調理' : cat}
                        </h2>

                        <div className="space-y-3">
                            {QUALIFICATIONS.filter(q => q.category === cat).map(qual => {
                                const isOwned = ownedQuals.includes(qual.id);
                                const canAfford = currentUser.balance >= qual.examFee;

                                return (
                                    <motion.div
                                        key={qual.id}
                                        layout
                                        className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${isOwned ? 'border-green-500' : 'border-gray-200'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-lg flex items-center gap-2">
                                                    {qual.name}
                                                    {isOwned && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">取得済</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{qual.description}</p>

                                                <div className="flex gap-2 mt-2 text-xs">
                                                    <span className="bg-gray-100 px-2 py-1 rounded">難易度: {'★'.repeat(qual.difficulty)}</span>
                                                    <span className="bg-gray-100 px-2 py-1 rounded">費用: ¥{qual.examFee.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {!isOwned && (
                                                <Button
                                                    size="sm"
                                                    disabled={!canAfford}
                                                    onClick={() => {
                                                        setSelectedQual(qual);
                                                        setExamState('idle');
                                                    }}
                                                >
                                                    受験
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </main>

            {/* Exam Modal */}
            <Modal
                isOpen={!!selectedQual}
                onClose={() => {
                    if (examState !== 'playing') {
                        setSelectedQual(null);
                        setExamState('idle');
                        setExamResult(null);
                    }
                }}
                title={examState === 'result' ? '試験結果' : selectedQual?.name || ''}
            >
                {selectedQual && (
                    <div className="min-h-[300px]">
                        {/* 1. Introduction */}
                        {examState === 'idle' && (
                            <div className="space-y-6 text-center py-4">
                                <div>
                                    <div className="text-4xl mb-4">🎓</div>
                                    <h3 className="text-xl font-bold">受験しますか？</h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        試験形式:
                                        {selectedQual.minigameType === 'quiz' ? ' 筆記試験 (4択クイズ)' :
                                            selectedQual.minigameType === 'typing' ? ' 実技試験 (タイピング)' :
                                                selectedQual.minigameType === 'driving' ? ' 実技試験 (運転技能)' : ' その他'}
                                    </p>
                                </div>

                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>現在の所持金</span>
                                        <span className="font-bold">¥{currentUser.balance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2 text-red-600">
                                        <span>受験料</span>
                                        <span className="font-bold">-¥{selectedQual.examFee.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-indigo-200 my-2"></div>
                                    <div className="flex justify-between font-bold">
                                        <span>支払い後残高</span>
                                        <span>¥{(currentUser.balance - selectedQual.examFee).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button fullWidth onClick={handleStartExam}>
                                        受験料を払って開始
                                    </Button>
                                    <Button fullWidth variant="ghost" onClick={() => setSelectedQual(null)}>
                                        やめる
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 2. Playing */}
                        {examState === 'playing' && (
                            <div>
                                {renderMinigame()}
                            </div>
                        )}

                        {/* 3. Result */}
                        {examState === 'result' && examResult && (
                            <div className="text-center space-y-6 py-4">
                                {examResult.passed && <Confetti numberOfPieces={200} recycle={false} />}

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-6xl"
                                >
                                    {examResult.passed ? '🈴' : '😢'}
                                </motion.div>

                                <div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        {examResult.passed ? '合格！！' : '不合格...'}
                                    </h2>
                                    <p className="text-gray-600">
                                        {examResult.message}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                    <div className="flex justify-between mb-1">
                                        <span>スコア</span>
                                        <span className="font-bold">{minigameScore}点</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>日時</span>
                                        <span>{new Date().toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button fullWidth onClick={() => {
                                    setSelectedQual(null);
                                    setExamState('idle');
                                    setExamResult(null);
                                }}>
                                    閉じる
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
