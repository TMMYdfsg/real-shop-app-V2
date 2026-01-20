'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { QUALIFICATIONS, QUIZ_DATABASE } from '@/lib/gameData';
import { Qualification } from '@/types';

// Categories for filter
const CATEGORIES = [
    { id: 'all', label: 'すべて' },
    { id: 'driving', label: '運転免許' },
    { id: 'business', label: 'ビジネス' },
    { id: 'language', label: '語学' },
    { id: 'food', label: '飲食' },
    { id: 'medical', label: '医療' },
    { id: 'creative', label: 'クリエイティブ' },
];

export default function QualificationsPage() {
    const { currentUser, sendRequest } = useGame();
    const [activeTab, setActiveTab] = useState('list');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [examQual, setExamQual] = useState<Qualification | null>(null);
    const [examStep, setExamStep] = useState<'intro' | 'question' | 'result'>('intro');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);

    if (!currentUser) return <div>Loading...</div>;

    const userQuals = currentUser.qualifications || [];

    const filteredQuals = QUALIFICATIONS.filter(q => {
        if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
        return true;
    });

    const categories = Array.from(new Set(QUALIFICATIONS.map(q => q.category)));

    const handleStartExam = (qual: Qualification) => {
        if (currentUser.balance < qual.examFee) {
            alert('受験料が足りません！');
            return;
        }
        if (userQuals.includes(qual.id)) {
            alert('すでに取得しています');
            return;
        }
        setExamQual(qual);
        setExamStep('intro');
        setScore(0);
        setCurrentQuestionIndex(0);
    };

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) setScore(s => s + 1);

        const nextIndex = currentQuestionIndex + 1;
        // Mock 3 questions
        if (nextIndex >= 3) {
            setExamStep('result');
            // Check pass condition (e.g. 2/3)
            const passed = (score + (isCorrect ? 1 : 0)) >= 2;
            if (passed && examQual) {
                // Call API
                sendRequest('pass_exam', 0, JSON.stringify({ qualificationId: examQual.id }))
                    .then(() => {
                        // Success handled by UI showing new state
                    });
            }
        } else {
            setCurrentQuestionIndex(nextIndex);
        }
    };

    // Close Modal
    const handleCloseExam = () => {
        setExamQual(null);
        setExamStep('intro');
    };

    return (
        <div className="space-y-6 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                    🎓 資格・試験センター
                </h1>
                <p className="text-gray-600 mb-6 font-medium">スキルを磨いてキャリアアップを目指そう！</p>
            </motion.div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map(cat => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
                        onClick={() => setSelectedCategory(cat.id)}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        {cat.label}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuals.map(qual => {
                    const isOwned = userQuals.includes(qual.id);
                    return (
                        <Card key={qual.id} className={`flex flex-col h-full ${isOwned ? 'border-green-500/50 bg-green-50/50' : ''}`} padding="md">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600 mb-1 inline-block">
                                        {qual.category.toUpperCase()}
                                    </span>
                                    <h3 className="font-bold text-lg">{qual.name}</h3>
                                </div>
                                {isOwned && <span className="text-2xl">✅</span>}
                            </div>

                            <p className="text-sm text-gray-600 mb-4 flex-1">{qual.description}</p>

                            <div className="space-y-2 text-sm text-gray-500 mb-4">
                                <div className="flex justify-between">
                                    <span>難易度</span>
                                    <span className="font-bold text-yellow-500">{'★'.repeat(qual.difficulty)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>受験料</span>
                                    <span className="font-bold">{qual.examFee.toLocaleString()}円</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => handleStartExam(qual)}
                                disabled={isOwned || currentUser.balance < qual.examFee}
                                variant={isOwned ? 'secondary' : 'primary'}
                                fullWidth
                            >
                                {isOwned ? '取得済み' : '受験する'}
                            </Button>
                        </Card>
                    );
                })}
            </div>

            {/* Exam Modal */}
            <AnimatePresence>
                {examQual && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold">{examQual.name} 試験</h2>
                                    <button onClick={handleCloseExam} className="text-gray-500 hover:text-gray-700">✕</button>
                                </div>

                                {examStep === 'intro' && (
                                    <div className="text-center space-y-4">
                                        <p>この試験は3問のクイズ形式で行われます。<br />2問以上正解で合格です。</p>
                                        <div className="text-xl font-bold text-red-500">受験料: {examQual.examFee.toLocaleString()}円</div>
                                        <Button size="lg" fullWidth onClick={() => setExamStep('question')}>
                                            試験開始！
                                        </Button>
                                    </div>
                                )}

                                {examStep === 'question' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>問題 {currentQuestionIndex + 1} / 3</span>
                                            <span>Score: {score}</span>
                                        </div>

                                        {/* Mock Question Logic - Pick random from DB or generic */}
                                        <div className="text-lg font-bold min-h-[60px]">
                                            {/* In real app, filter QUIZ_DATABASE by category. For now, use generic placeholder if DB empty or mismatch */}
                                            {QUIZ_DATABASE.find(q => q.category === examQual.category || 'general') ?
                                                // Find real question logic or...
                                                // Simplified for this task:
                                                `Q. ${examQual.category} に関する重要な知識として正しいものは？`
                                                : '知識を問う問題です。'}
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {['正しい選択肢', '誤った選択肢A', '誤った選択肢B', '誤った選択肢C'].map((opt, i) => (
                                                <Button key={i} variant="outline" onClick={() => handleAnswer(i === 0)} className="justify-start h-auto py-3">
                                                    {i + 1}. {opt}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {examStep === 'result' && (
                                    <div className="text-center space-y-6">
                                        <div className="text-6xl mb-4">
                                            {(score >= 2) ? '🎉' : '😢'}
                                        </div>
                                        <h3 className="text-3xl font-bold">
                                            {(score >= 2) ? '合格！！' : '不合格...'}
                                        </h3>
                                        <p className="text-gray-600">
                                            正解数: {score} / 3<br />
                                            {(score >= 2) ? '資格を取得しました！' : '再挑戦をお待ちしています。'}
                                        </p>
                                        <Button size="lg" fullWidth onClick={handleCloseExam}>
                                            閉じる
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
