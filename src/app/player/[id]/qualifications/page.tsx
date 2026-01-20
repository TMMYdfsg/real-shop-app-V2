'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QUALIFICATIONS_DATA,
    QUALIFICATION_GENRES,
    Qualification,
    KidExamQuestion
} from '@/lib/qualificationData';

export default function QualificationsPage() {
    const { currentUser, sendRequest } = useGame();
    const [selectedGenre, setSelectedGenre] = useState('all');

    // Exam State
    const [examQual, setExamQual] = useState<Qualification | null>(null);
    const [examStep, setExamStep] = useState<'intro' | 'question' | 'result'>('intro');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);

    // Hint State
    const [currentHintIndex, setCurrentHintIndex] = useState(-1); // -1: No hints shown
    const [eliminatedChoices, setEliminatedChoices] = useState<number[]>([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [lastResult, setLastResult] = useState<'correct' | 'incorrect' | null>(null);

    if (!currentUser) return <div>Loading...</div>;

    const userQuals = currentUser.qualifications || [];

    const filteredQuals = useMemo(() => {
        return QUALIFICATIONS_DATA.filter(q => {
            if (selectedGenre !== 'all' && q.genreId !== selectedGenre) return false;
            return true;
        });
    }, [selectedGenre]);

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

    const resetQuestionState = () => {
        setCurrentHintIndex(-1);
        setEliminatedChoices([]);
        setShowExplanation(false);
        setLastResult(null);
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
                // Determine if we want to treat reveal as generic hint or give-up?
                // For now, just show it.
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

        // Show explanation via reveal hint if available or just wait a bit?
        // Let's show result briefly or move next
        setTimeout(() => {
            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex >= examQual.kidExam.questions.length) {
                setExamStep('result');
                const finalScore = score + (isCorrect ? 1 : 0);
                const passed = finalScore >= Math.ceil(examQual.kidExam.questionCount * 0.6); // 60% pass

                if (passed) {
                    sendRequest('pass_exam', 0, { qualificationId: examQual.id })
                        .catch(e => console.error(e));
                }
            } else {
                setCurrentQuestionIndex(nextIndex);
                resetQuestionState();
            }
        }, 1000);
    };

    const handleCloseExam = () => {
        setExamQual(null);
        setExamStep('intro');
    };

    // Render Helpers
    const currentQuestion = examQual?.kidExam.questions[currentQuestionIndex];

    return (
        <div className="space-y-6 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                    🎓 資格・試験センター
                </h1>
                <p className="text-gray-600 mb-6 font-medium">スキルを磨いてキャリアアップを目指そう！</p>
            </motion.div>

            {/* Genre Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                <Button
                    variant={selectedGenre === 'all' ? 'primary' : 'outline'}
                    onClick={() => setSelectedGenre('all')}
                    size="sm"
                    className="whitespace-nowrap flex-shrink-0"
                >
                    すべて
                </Button>
                {QUALIFICATION_GENRES.map(genre => (
                    <Button
                        key={genre.id}
                        variant={selectedGenre === genre.id ? 'primary' : 'outline'}
                        onClick={() => setSelectedGenre(genre.id)}
                        size="sm"
                        className="whitespace-nowrap flex-shrink-0"
                    >
                        {genre.name}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuals.map(qual => {
                    const isOwned = userQuals.includes(qual.id);
                    const genre = QUALIFICATION_GENRES.find(g => g.id === qual.genreId);
                    return (
                        <Card key={qual.id} className={`flex flex-col h-full relative overflow-hidden ${isOwned ? 'border-green-500/50 bg-green-50/50' : ''}`} padding="md">
                            {isOwned && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">
                                    取得済み
                                </div>
                            )}
                            <div className="mb-3">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 mb-2 inline-block">
                                    {genre?.name || qual.genreId}
                                </span>
                                <h3 className="font-bold text-lg leading-tight">{qual.name}</h3>
                            </div>

                            <div className="space-y-2 text-sm text-gray-500 mb-4 flex-1">
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span>難易度</span>
                                    <span className="font-bold text-yellow-500 text-lg">{'★'.repeat(qual.difficultyStars)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span>受験料</span>
                                    <span className="font-bold">{qual.feeYen ? `${qual.feeYen.toLocaleString()}円` : '無料'}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => handleStartExam(qual)}
                                disabled={isOwned || (qual.feeYen !== null && currentUser.balance < qual.feeYen)}
                                variant={isOwned ? 'secondary' : 'primary'}
                                fullWidth
                                className="font-bold"
                            >
                                {isOwned ? '復習する' : '受験する'}
                            </Button>
                        </Card>
                    );
                })}
            </div>

            {/* Exam Modal */}
            <AnimatePresence>
                {examQual && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`bg-white rounded-3xl shadow-2xl w-full overflow-hidden flex flex-col transition-all duration-300 ${examStep === 'intro' ? 'max-w-sm h-auto' : 'max-w-2xl max-h-[90vh]'
                                }`}
                        >
                            {examStep !== 'intro' && (
                                <div className="p-4 bg-gray-50 border-b flex justify-between items-center sticky top-0">
                                    <h2 className="text-lg font-bold truncate pr-4">{examQual.name}</h2>
                                    <button onClick={handleCloseExam} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200">✕</button>
                                </div>
                            )}

                            {examStep === 'intro' && (
                                <div className="absolute top-2 right-2 z-10">
                                    <button onClick={handleCloseExam} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500">✕</button>
                                </div>
                            )}

                            <div className={`overflow-y-auto flex-1 ${examStep === 'intro' ? 'p-8 flex flex-col justify-center items-center' : 'p-6'}`}>
                                {examStep === 'intro' && (
                                    <div className="text-center w-full">
                                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-blue-50">
                                            📝
                                        </div>

                                        <h3 className="text-2xl font-black text-gray-800 mb-2">{examQual.name}</h3>
                                        <p className="text-sm font-bold text-gray-500 mb-6 bg-gray-100 py-1 px-3 rounded-full inline-block">
                                            合格条件: {Math.ceil(examQual.kidExam.questionCount * 0.6)}問以上正解
                                        </p>

                                        <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 mb-2 w-full max-w-[200px] mx-auto shadow-sm">
                                            <div className="text-xs font-bold text-blue-500 mb-1">受験料</div>
                                            <div className="text-2xl font-black text-blue-900 tracking-tight">
                                                {examQual.feeYen ? `¥${examQual.feeYen.toLocaleString()}` : '無料'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {examStep === 'question' && currentQuestion && (
                                    <div className="max-w-xl mx-auto space-y-6">
                                        {/* Progress */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${((currentQuestionIndex) / examQual.kidExam.questions.length) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">
                                                {currentQuestionIndex + 1}/{examQual.kidExam.questions.length}
                                            </span>
                                        </div>

                                        {/* Prompt */}
                                        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                                            <h3 className="text-xl font-bold text-center leading-relaxed">
                                                {currentQuestion.prompt}
                                            </h3>
                                        </div>

                                        {/* Hints visual area */}
                                        {currentHintIndex >= 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm"
                                            >
                                                <div className="font-bold text-yellow-700 mb-2 flex items-center gap-2">
                                                    💡 ヒント ({currentHintIndex + 1}/{currentQuestion.hints.length})
                                                </div>
                                                <ul className="space-y-2">
                                                    {currentQuestion.hints.slice(0, currentHintIndex + 1).map((hint, i) => (
                                                        <motion.li
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex gap-2"
                                                        >
                                                            {hint.type === 'text' && <span>{hint.text}</span>}
                                                            {hint.type === 'eliminate' && <span>選択肢を減らしました！</span>}
                                                            {hint.type === 'reveal' && (
                                                                <div className="font-bold text-red-500">
                                                                    答え: {hint.answer}<br />
                                                                    <span className="text-gray-700 font-normal">{hint.explanation}</span>
                                                                </div>
                                                            )}
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}

                                        {/* Hint Button */}
                                        {currentHintIndex < currentQuestion.hints.length - 1 && (
                                            <button
                                                onClick={handleUseHint}
                                                className="text-xs font-bold text-blue-500 hover:bg-blue-50 px-3 py-1 rounded-full mx-auto block transition-colors"
                                            >
                                                💡 ヒントを見る
                                            </button>
                                        )}

                                        {/* Choices */}
                                        <div className="grid grid-cols-1 gap-3">
                                            {currentQuestion.choices.map((choice, i) => {
                                                const isEliminated = eliminatedChoices.includes(i);
                                                let stateClass = 'bg-white hover:bg-gray-50 border-gray-200';

                                                if (lastResult) {
                                                    if (i === currentQuestion.answerIndex) stateClass = 'bg-green-100 border-green-500 text-green-800 font-bold';
                                                    else if (lastResult === 'incorrect') stateClass = 'opacity-50';
                                                } else if (isEliminated) {
                                                    stateClass = 'bg-gray-100 text-gray-300 pointer-events-none border-transparent';
                                                }

                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => !lastResult && !isEliminated && handleAnswer(i)}
                                                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${stateClass}`}
                                                        disabled={!!lastResult || isEliminated}
                                                    >
                                                        {choice.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {examStep === 'result' && (
                                    <div className="text-center space-y-8 py-8 animate-in zoom-in duration-300">
                                        <div className="text-8xl">
                                            {(score >= Math.ceil(examQual.kidExam.questionCount * 0.6)) ? '🎉' : '💪'}
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-black mb-2">
                                                {(score >= Math.ceil(examQual.kidExam.questionCount * 0.6)) ? '合格！！' : '不合格...'}
                                            </h3>
                                            <p className="text-xl text-gray-500 font-bold">
                                                スコア: {score} / {examQual.kidExam.questionCount}
                                            </p>
                                        </div>

                                        {(score >= Math.ceil(examQual.kidExam.questionCount * 0.6)) ? (
                                            <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-xl max-w-sm mx-auto">
                                                <div className="text-yellow-800 font-bold mb-1">GET QUALIFICATION</div>
                                                <div className="text-2xl font-black text-yellow-900">{examQual.name}</div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">
                                                あとすこし！<br />もういちど チャレンジしよう。
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer for Actions */}
                            <div className="p-4 border-t bg-gray-50 sticky bottom-0 z-10 flex flex-col gap-2">
                                {examStep === 'intro' && (
                                    <Button size="lg" className="w-full text-lg py-6 shadow-lg" onClick={() => setExamStep('question')}>
                                        試験を始める
                                    </Button>
                                )}
                                {examStep === 'result' && (
                                    <Button size="lg" className="w-full max-w-xs mx-auto text-lg py-6" onClick={handleCloseExam}>
                                        閉じる
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
