'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export const VacationApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser, gameState } = useGame();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    if (!currentUser) return null;

    const hasPendingRequest = gameState?.requests.some(
        r => r.requesterId === currentUser.id && r.type === 'vacation' && r.status === 'pending'
    );

    const handleRequest = async () => {
        if (!reason.trim()) {
            alert('お休みの理由を入力してください');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'vacation',
                    amount: 0,
                    details: reason
                }),
            });

            if (!res.ok) throw new Error('申請に失敗しました');

            setMessage('お休みの申請を送信しました。管理者の承認をお待ちください。');
            setReason('');
        } catch (err) {
            console.error(err);
            alert('エラーが発生しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-indigo-50 text-gray-900">
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white shadow-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-2xl">←</button>
                    <h1 className="text-xl font-bold">お休み申請 (有給)</h1>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                    <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <span>🛌</span> 現在の状態
                    </h2>
                    {currentUser.isOff ? (
                        <div className="bg-green-100 text-green-700 p-3 rounded-xl font-bold text-center">
                            現在お休み中です ✨
                            <p className="text-xs font-normal mt-1">
                                理由: {currentUser.vacationReason || '未設定'}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-blue-100 text-blue-700 p-3 rounded-xl font-bold text-center">
                            通常稼働中 🏃‍♂️
                        </div>
                    )}
                </div>

                {!currentUser.isOff && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h2 className="text-lg font-bold mb-4">お休みを申請する</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            お休み中はターンが進んでも給料が発生せず、税金や健康への影響もありません。<br />
                            ※管理者の承認が必要です。
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-1 block">理由</label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    rows={3}
                                    placeholder="旅行に行くため、など"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    disabled={hasPendingRequest || isSubmitting}
                                />
                            </div>

                            {hasPendingRequest ? (
                                <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-center text-sm font-medium">
                                    ⏳ 現在承認待ちの申請があります
                                </div>
                            ) : (
                                <Button
                                    className="w-full py-4 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                    onClick={handleRequest}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '送信中...' : '有給休暇を申請する'}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-green-500 text-white rounded-xl text-center text-sm font-bold shadow-lg"
                    >
                        {message}
                    </motion.div>
                )}
            </div>
        </div>
    );
};
