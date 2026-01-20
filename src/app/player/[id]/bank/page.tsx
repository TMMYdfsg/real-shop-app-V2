'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function BankPage() {
    const { gameState, currentUser, sendRequest } = useGame();
    const [activeTab, setActiveTab] = useState<'account' | 'loan'>('account');
    const [amount, setAmount] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!currentUser) return <div>Loading...</div>;

    const creditScore = currentUser.creditScore || 650;
    const maxLoan = creditScore * 10000;
    const currentLoans = currentUser.loans || [];
    const activeLoan = currentLoans.find((l: any) => l.status === 'active' || l.status === 'pending');

    const handleAction = async (type: 'deposit' | 'withdraw') => {
        if (!amount || Number(amount) <= 0) return;
        setIsProcessing(true);

        // ... validation check (same as before) ...
        const val = Number(amount);
        if (type === 'deposit' && currentUser.balance < val) {
            alert('お金が足りません');
            setIsProcessing(false); return;
        }
        if (type === 'withdraw' && currentUser.deposit < val) {
            alert('貯金が足りません');
            setIsProcessing(false); return;
        }

        await sendRequest(type, val);

        alert('完了しました');
        setAmount('');
        setIsProcessing(false);
        // window.location.reload(); // Context updates automatically usually, but let's keep it safe
    };

    const handleRequestLoan = async () => {
        if (!loanAmount) return;
        setIsProcessing(true);
        await fetch('/api/action', {
            method: 'POST',
            body: JSON.stringify({
                type: 'request_loan',
                requesterId: currentUser.id,
                details: JSON.stringify({ amount: Number(loanAmount), duration: 7 })
            })
        });
        alert('融資申請を行いました');
        setLoanAmount('');
        setIsProcessing(false);
    };

    const handleRepay = async (loanId: string) => {
        const val = prompt('返済額を入力してください');
        if (!val) return;
        await fetch('/api/action', {
            method: 'POST',
            body: JSON.stringify({
                type: 'repay_loan',
                requesterId: currentUser.id,
                details: JSON.stringify({ loanId, amount: Number(val) })
            })
        });
        alert('返済しました');
    };

    // Credit Score Color
    const getScoreColor = (score: number) => {
        if (score >= 800) return 'text-green-500';
        if (score >= 700) return 'text-blue-500';
        if (score >= 600) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                    🏦 メガバンク
                </h1>
                <p className="text-gray-600 mb-6 font-medium">資産運用から融資まで、あなたのビジネスを支えます。</p>
            </motion.div>

            {/* Credit Score Banner */}
            <Card className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-slate-800 text-white" padding="lg">
                <div>
                    <div className="text-sm opacity-80">あなたの信用スコア</div>
                    <div className={`text-4xl font-bold ${getScoreColor(creditScore)}`}>{creditScore}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm opacity-80">融資限度額</div>
                    <div className="text-2xl font-bold">{maxLoan.toLocaleString()}円</div>
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab('account')}
                    className={`pb-2 px-4 font-bold ${activeTab === 'account' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                >
                    口座・入出金
                </button>
                <button
                    onClick={() => setActiveTab('loan')}
                    className={`pb-2 px-4 font-bold ${activeTab === 'loan' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                >
                    融資・ローン
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'account' ? (
                    <motion.div
                        key="account"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        <Card padding="lg" className="text-center">
                            <div className="text-sm text-gray-500 mb-2">現在の預金残高</div>
                            <div className="text-4xl font-bold text-blue-600">
                                {currentUser.deposit.toLocaleString()} <span className="text-lg text-gray-400">円</span>
                            </div>
                        </Card>

                        <Card padding="lg" className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">金額を入力</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-4 text-xl border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button size="lg" onClick={() => handleAction('deposit')} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 h-14">
                                    預け入れる
                                </Button>
                                <Button size="lg" variant="secondary" onClick={() => handleAction('withdraw')} disabled={isProcessing} className="h-14">
                                    引き出す
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                ※ 収入の{(gameState?.settings.salaryAutoSafeRate || 0.5) * 100}%は自動的に貯金されます。
                            </p>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="loan"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {activeLoan ? (
                            <Card padding="lg" className="border-l-4 border-yellow-500">
                                <h3 className="font-bold text-lg mb-4">現在の融資状況</h3>
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between">
                                        <span>借入額</span>
                                        <span className="font-bold">{activeLoan.amount.toLocaleString()}円</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>ステータス</span>
                                        <span className="font-bold uppercase text-yellow-600">{activeLoan.status}</span>
                                    </div>
                                </div>
                                {activeLoan.status === 'active' && (
                                    <Button fullWidth onClick={() => handleRepay(activeLoan.id)}>
                                        返済する
                                    </Button>
                                )}
                                {activeLoan.status === 'pending' && (
                                    <div className="text-center text-sm text-gray-500 bg-gray-100 p-2 rounded">
                                        審査中です。しばらくお待ちください。
                                    </div>
                                )}
                            </Card>
                        ) : (
                            <Card padding="lg">
                                <h3 className="font-bold text-lg mb-4">新規融資の申し込み</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    事業拡大のための資金を借り入れることができます。<br />
                                    信用スコアに基づき、最大 <strong>{maxLoan.toLocaleString()}円</strong> まで申請可能です。
                                </p>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold mb-2">希望借入額</label>
                                    <input
                                        type="number"
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(e.target.value)}
                                        className="w-full p-3 border rounded-lg"
                                        placeholder={`最大 ${maxLoan}`}
                                    />
                                </div>
                                <Button
                                    fullWidth
                                    onClick={handleRequestLoan}
                                    disabled={!loanAmount || Number(loanAmount) > maxLoan}
                                >
                                    審査を申し込む
                                </Button>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
