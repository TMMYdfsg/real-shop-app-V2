import React, { useState } from 'react';
import { User, GameState, Loan, EconomyState, InsuranceContract } from '@/types';

interface BankTerminalProps {
    user: User;
    economy: EconomyState;
    onClose: () => void;
    onAction: (action: string, details: any) => Promise<void>;
}

export default function BankTerminal({ user, economy, onClose, onAction }: BankTerminalProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'loan' | 'insurance'>('overview');
    const [loanAmount, setLoanAmount] = useState<number>(1000000);
    const [loanMonths, setLoanMonths] = useState<number>(12);
    const [loanPurpose, setLoanPurpose] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate Max Loan
    const creditScore = user.creditScore || 500;
    const maxLoan = creditScore * 10000;
    const interestRate = economy.interestRate + (1000 - creditScore) / 100;

    const handleLoanApply = async () => {
        if (loanAmount > maxLoan || loanAmount <= 0) return;
        setIsProcessing(true);
        await onAction('bank_loan_apply', JSON.stringify({
            amount: loanAmount,
            months: loanMonths,
            purpose: loanPurpose
        }));
        setIsProcessing(false);
    };

    const handleRepay = async (loanId: string, amount: number) => {
        setIsProcessing(true);
        await onAction('bank_repay', JSON.stringify({
            loanId,
            repaymentAmount: amount
        }));
        setIsProcessing(false);
    };

    const handleInsuranceBuy = async (type: string) => {
        if (confirm('この保険に加入しますか？（掛け捨て・自動更新なし）')) {
            setIsProcessing(true);
            await onAction('insurance_buy', JSON.stringify({ insuranceType: type }));
            setIsProcessing(false);
        }
    };

    const formatMoney = (val: number) => `¥${val.toLocaleString()}`;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span>🏛️</span>
                            <span>Real Bank & Trust</span>
                        </h2>
                        <p className="text-blue-200 text-sm">お客様の資産形成をサポートします</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center">
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-4 font-bold text-center transition-colors ${activeTab === 'overview' ? 'bg-white text-blue-900 border-t-4 border-blue-900' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        口座サマリー
                    </button>
                    <button
                        onClick={() => setActiveTab('loan')}
                        className={`flex-1 py-4 font-bold text-center transition-colors ${activeTab === 'loan' ? 'bg-white text-blue-900 border-t-4 border-blue-900' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        融資センター
                    </button>
                    <button
                        onClick={() => setActiveTab('insurance')}
                        className={`flex-1 py-4 font-bold text-center transition-colors ${activeTab === 'insurance' ? 'bg-white text-blue-900 border-t-4 border-blue-900' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        保険窓口
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Balance Card */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">普通預金残高</h3>
                                    <div className="text-4xl font-black text-gray-800 tracking-tight">
                                        {formatMoney(user.balance)}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm disabled:opacity-50" disabled>
                                            入金・振込
                                        </button>
                                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 shadow-sm disabled:opacity-50" disabled>
                                            設定
                                        </button>
                                    </div>
                                </div>

                                {/* Credit Score Card */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 text-9xl">📊</div>
                                    <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">信用スコア</h3>
                                    <div className={`text-5xl font-black tracking-tight ${(user.creditScore || 500) > 700 ? 'text-green-500' :
                                            (user.creditScore || 500) > 500 ? 'text-blue-500' : 'text-orange-500'
                                        }`}>
                                        {Math.floor(user.creditScore || 500)}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        評価: {(user.creditScore || 500) > 700 ? '優良' : (user.creditScore || 500) > 500 ? '普通' : '注意'}
                                        <br />
                                        上限融資額: {formatMoney(((user.creditScore || 500) * 10000))}
                                    </p>
                                </div>
                            </div>

                            {/* Active Loans List */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700">利用中のローン</h3>
                                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {user.loans?.filter(l => l.status === 'active').length || 0}件
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {!user.loans || user.loans.filter(l => l.status === 'active').length === 0 ? (
                                        <div className="p-8 text-center text-gray-400">借り入れはありません</div>
                                    ) : (
                                        user.loans.filter(l => l.status === 'active').map(loan => (
                                            <div key={loan.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div>
                                                    <div className="font-bold text-gray-800">{loan.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        金利 {loan.interestRate.toFixed(2)}% • 残回数 {Math.ceil(loan.remainingAmount / loan.monthlyPayment)}回
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-red-600">{formatMoney(loan.remainingAmount)}</div>
                                                    <div className="text-xs text-gray-400">月々 {formatMoney(loan.monthlyPayment)}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleRepay(loan.id, loan.remainingAmount)}
                                                    className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-2 rounded font-bold"
                                                    disabled={isProcessing || user.balance < loan.remainingAmount}
                                                >
                                                    一括返済
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LOAN TAB */}
                    {activeTab === 'loan' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Loan Simulator */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">新規融資シミュレーション</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            借入希望額 (上限: {formatMoney(maxLoan)})
                                        </label>
                                        <input
                                            type="range"
                                            min={100000}
                                            max={maxLoan}
                                            step={100000}
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="mt-2 text-3xl font-bold text-blue-600 font-mono text-center">
                                            {formatMoney(loanAmount)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">返済期間</label>
                                            <select
                                                value={loanMonths}
                                                onChange={(e) => setLoanMonths(Number(e.target.value))}
                                                className="w-full p-3 border border-gray-300 rounded-lg font-bold"
                                            >
                                                <option value={6}>6ヶ月 (短期)</option>
                                                <option value={12}>1年 (標準)</option>
                                                <option value={24}>2年</option>
                                                <option value={36}>3年</option>
                                                <option value={60}>5年</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">適用金利</label>
                                            <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg font-bold text-gray-600">
                                                {interestRate.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">利用目的</label>
                                        <input
                                            type="text"
                                            value={loanPurpose}
                                            onChange={(e) => setLoanPurpose(e.target.value)}
                                            placeholder="例: 新店舗開設資金"
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center text-sm mb-4">
                                            <span className="text-gray-500">月々の返済額（概算）</span>
                                            <span className="font-bold text-xl">
                                                {formatMoney(Math.ceil((loanAmount * (1 + (interestRate / 100) * (loanMonths / 12))) / loanMonths))}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleLoanApply}
                                            disabled={isProcessing || !loanPurpose}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95"
                                        >
                                            {isProcessing ? '審査中...' : '融資を申し込む'}
                                        </button>
                                        <p className="text-xs text-center text-gray-400 mt-3">
                                            ※審査結果によりご希望に添えない場合があります。返済計画を十分にご確認ください。
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Market Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">経済指標</h3>
                                <ul className="space-y-4">
                                    <li className="flex justify-between items-center">
                                        <span className="text-gray-500">政策金利</span>
                                        <span className="font-bold">{economy.interestRate.toFixed(2)}%</span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span className="text-gray-500">景気動向</span>
                                        <span className={`font-bold px-2 py-1 rounded text-sm ${economy.status === 'boom' ? 'bg-red-100 text-red-600' :
                                                economy.status === 'recession' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-green-100 text-green-600'
                                            }`}>
                                            {economy.status.toUpperCase()}
                                        </span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span className="text-gray-500">物価指数</span>
                                        <span className="font-bold">{economy.priceIndex.toFixed(1)}</span>
                                    </li>
                                </ul>
                                <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                                    💡 <strong>Banker's Tip:</strong><br />
                                    {economy.status === 'recession'
                                        ? "不景気時は金利が下がります。投資のチャンスかもしれません。"
                                        : "好景気は売り時ですが、金利上昇に注意してください。"}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INSURANCE TAB */}
                    {activeTab === 'insurance' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { id: 'fire', name: '店舗火災保険', cost: 5000, cover: 10000000, desc: '火災や災害による店舗の損壊を補償します。' },
                                { id: 'health', name: '医療保険', cost: 3000, cover: 500000, desc: '病気や怪我による入院・治療費を軽減します。' },
                                { id: 'worker_comp', name: '労災保険', cost: 1000, cover: 2000000, desc: '従業員の事故などによる賠償責任をカバーします。' }
                            ].map(plan => {
                                const isJoined = user.insurances?.some(i => i.type === plan.id);
                                return (
                                    <div key={plan.id} className={`bg-white rounded-xl shadow-sm border-2 p-6 flex flex-col ${isJoined ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'}`}>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                                            <p className="text-gray-500 text-sm mb-4 leading-relaxed">{plan.desc}</p>
                                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-6">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">保険料(毎月)</span>
                                                    <span className="font-bold">{formatMoney(plan.cost)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">補償限度額</span>
                                                    <span className="font-bold text-blue-600">{formatMoney(plan.cover)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleInsuranceBuy(plan.id)}
                                            disabled={isJoined || isProcessing}
                                            className={`w-full py-3 rounded-lg font-bold shadow-sm ${isJoined
                                                    ? 'bg-green-100 text-green-700 cursor-default'
                                                    : 'bg-gray-800 hover:bg-gray-900 text-white'
                                                }`}
                                        >
                                            {isJoined ? '加入済み' : '加入手続きへ'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
