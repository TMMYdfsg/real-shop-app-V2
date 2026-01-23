'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { AppHeader } from '@/components/smartphone/AppHeader';
import { Button } from '@/components/ui/Button';
import {
    QUALIFICATIONS_DATA,
    QUALIFICATION_GENRES,
    Qualification
} from '@/lib/qualificationData';

export const QualificationsApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser, sendRequest } = useGame();
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [examQual, setExamQual] = useState<Qualification | null>(null);
    const [examStep, setExamStep] = useState<'intro' | 'question' | 'result'>('intro');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [currentHintIndex, setCurrentHintIndex] = useState(-1);
    const [eliminatedChoices, setEliminatedChoices] = useState<number[]>([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [lastResult, setLastResult] = useState<'correct' | 'incorrect' | null>(null);

    const userQuals = currentUser?.qualifications || [];

    const filteredQuals = useMemo(() => {
        return QUALIFICATIONS_DATA
            .filter(q => selectedGenre === 'all' || q.genreId === selectedGenre)
            .sort((a, b) => {
                if (a.difficultyStars !== b.difficultyStars) return b.difficultyStars - a.difficultyStars;
                return a.name.localeCompare(b.name, 'ja-JP');
            });
    }, [selectedGenre]);

    if (!currentUser) return <div className="h-full">Loading...</div>;

    const resetQuestionState = () => {
        setCurrentHintIndex(-1);
        setEliminatedChoices([]);
        setShowExplanation(false);
        setLastResult(null);
    };

    const handleStartExam = (qual: Qualification) => {
        const fee = qual.feeYen || 0;
        if (currentUser.balance < fee) {
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
        resetQuestionState();
    };

    const handleUseHint = () => {
        if (!examQual) return;
        const question = examQual.kidExam.questions[currentQuestionIndex];
        const nextHintIdx = currentHintIndex + 1;
        if (nextHintIdx < question.hints.length) {
            setCurrentHintIndex(nextHintIdx);
            const hint = question.hints[nextHintIdx];
            if (hint.type === 'eliminate' && hint.removeChoiceIndexes) {
                setEliminatedChoices(prev => [...prev, ...hint.removeChoiceIndexes!]);
            }
            if (hint.type === 'reveal') {
                setShowExplanation(true);
            }
        }
    };

    const handleAnswer = (choiceIndex: number) => {
        if (!examQual) return;
        const question = examQual.kidExam.questions[currentQuestionIndex];
        const isCorrect = choiceIndex === question.answerIndex;
        if (isCorrect) {
            setScore(s => s + 1);
            setLastResult('correct');
        } else {
            setLastResult('incorrect');
        }
        setTimeout(() => {
            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex >= examQual.kidExam.questions.length) {
                setExamStep('result');
                const finalScore = score + (isCorrect ? 1 : 0);
                const passed = finalScore >= Math.ceil(examQual.kidExam.questionCount * 0.6);
                if (passed) {
                    sendRequest('pass_exam', 0, { qualificationId: examQual.id })
                        .catch(e => console.error(e));
                }
            } else {
                setCurrentQuestionIndex(nextIndex);
                resetQuestionState();
            }
        }, 800);
    };

    const handleCloseExam = () => {
        setExamQual(null);
        setExamStep('intro');
    };

    const currentQuestion = examQual?.kidExam.questions[currentQuestionIndex];

    return (
        <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
            <AppHeader title="資格・試験" onBack={onBack} />

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                <div className="px-4 py-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                        <p className="text-sm font-bold text-slate-900">現在の所持金</p>
                        <p className="text-xl font-black text-slate-900 mt-1">{currentUser.balance.toLocaleString()}枚</p>
                        <p className="text-[10px] text-slate-400 mt-1">取得済み: {userQuals.length}件</p>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide snap-x snap-mandatory">
                    <Button
                        variant={selectedGenre === 'all' ? 'primary' : 'outline'}
                        onClick={() => setSelectedGenre('all')}
                        size="sm"
                        className="whitespace-nowrap flex-shrink-0 snap-start"
                    >
                        すべて
                    </Button>
                    {QUALIFICATION_GENRES.map(genre => (
                        <Button
                            key={genre.id}
                            variant={selectedGenre === genre.id ? 'primary' : 'outline'}
                            onClick={() => setSelectedGenre(genre.id)}
                            size="sm"
                            className="whitespace-nowrap flex-shrink-0 snap-start"
                        >
                            {genre.name}
                        </Button>
                    ))}
                </div>

                <div className="px-4 pb-4 space-y-3">
                    {filteredQuals.map(qual => {
                        const isOwned = userQuals.includes(qual.id);
                        const genre = QUALIFICATION_GENRES.find(g => g.id === qual.genreId);
                        return (
                            <div key={qual.id} className={`rounded-2xl bg-white p-4 shadow-sm border ${isOwned ? 'border-emerald-200' : 'border-slate-200'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400">
                                            {genre?.name || qual.genreId}
                                        </div>
                                        <div className="text-sm font-black text-slate-900">{qual.name}</div>
                                    </div>
                                    {isOwned && (
                                        <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                            取得済み
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 mt-3">
                                    <div className="bg-slate-50 rounded-lg p-2 flex items-center justify-between">
                                        <span>難易度</span>
                                        <span className="font-bold text-yellow-500">{'★'.repeat(qual.difficultyStars)}</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-2 flex items-center justify-between">
                                        <span>受験料</span>
                                        <span className="font-bold text-slate-700">{qual.feeYen ? `${qual.feeYen.toLocaleString()}枚` : '無料'}</span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Button
                                        onClick={() => handleStartExam(qual)}
                                        disabled={isOwned || (qual.feeYen !== null && currentUser.balance < qual.feeYen)}
                                        variant={isOwned ? 'secondary' : 'primary'}
                                        fullWidth
                                        size="sm"
                                    >
                                        {isOwned ? '復習する' : '受験する'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {examQual && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`bg-white rounded-3xl shadow-2xl w-full overflow-hidden flex flex-col ${examStep === 'intro' ? 'max-w-sm' : 'max-w-2xl max-h-[90vh]'}`}
                        >
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center sticky top-0">
                                <h2 className="text-sm font-bold truncate pr-4">{examQual.name}</h2>
                                <button onClick={handleCloseExam} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200">✕</button>
                            </div>

                            <div className="overflow-y-auto flex-1 p-5">
                                {examStep === 'intro' && (
                                    <div className="text-center w-full">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-4 border-blue-50">
                                            📝
                                        </div>
                                        <h3 className="text-xl font-black text-gray-800 mb-2">{examQual.name}</h3>
                                        <p className="text-xs font-bold text-gray-500 mb-4 bg-gray-100 py-1 px-3 rounded-full inline-block">
                                            合格条件: {Math.ceil(examQual.kidExam.questionCount * 0.6)}問以上正解
                                        </p>
                                        <div className="bg-white border-2 border-blue-100 rounded-2xl p-3 mb-3 w-full max-w-[200px] mx-auto shadow-sm">
                                            <div className="text-[10px] font-bold text-blue-500 mb-1">受験料</div>
                                            <div className="text-xl font-black text-blue-900">
                                                {examQual.feeYen ? `${examQual.feeYen.toLocaleString()}枚` : '無料'}
                                            </div>
                                        </div>
                                        <Button fullWidth onClick={() => setExamStep('question')}>試験を開始</Button>
                                    </div>
                                )}

                                {examStep === 'question' && currentQuestion && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${((currentQuestionIndex) / examQual.kidExam.questions.length) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {currentQuestionIndex + 1}/{examQual.kidExam.questions.length}
                                            </span>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-2xl border text-sm font-bold">
                                            {currentQuestion.prompt}
                                        </div>

                                        <div className="grid grid-cols-1 gap-2">
                                            {currentQuestion.choices.map((choice, index) => {
                                                const eliminated = eliminatedChoices.includes(index);
                                                return (
                                                    <button
                                                        key={choice.label}
                                                        onClick={() => handleAnswer(index)}
                                                        disabled={eliminated}
                                                        className={`p-3 rounded-xl border text-left text-sm font-bold transition ${eliminated ? 'opacity-40 line-through' : 'hover:border-blue-400'} ${lastResult ? 'pointer-events-none' : ''}`}
                                                    >
                                                        {choice.label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="secondary" onClick={handleUseHint} size="sm" className="flex-1">
                                                ヒント
                                            </Button>
                                            <Button variant="secondary" onClick={handleCloseExam} size="sm" className="flex-1">
                                                終了
                                            </Button>
                                        </div>

                                        {currentHintIndex >= 0 && (
                                            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border">
                                                {currentQuestion.hints[currentHintIndex]?.text}
                                            </div>
                                        )}

                                        {showExplanation && (
                                            <div className="text-[11px] text-emerald-600 bg-emerald-50 p-3 rounded-xl border">
                                                正解: {currentQuestion.hints[currentHintIndex]?.answer}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {examStep === 'result' && (
                                    <div className="text-center space-y-4">
                                        <div className="text-4xl">🏁</div>
                                        <div className="text-xl font-black">結果: {score} / {examQual.kidExam.questions.length}</div>
                                        <div className="text-sm text-gray-500">
                                            {score >= Math.ceil(examQual.kidExam.questionCount * 0.6) ? '合格！' : '不合格...'}
                                        </div>
                                        <Button fullWidth onClick={handleCloseExam}>閉じる</Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
