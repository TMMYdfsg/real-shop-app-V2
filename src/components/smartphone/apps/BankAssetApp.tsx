'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    PieChart,
    Shield,
    CreditCard,
    TrendingUp,
    ChevronRight,
    Bell,
    Settings,
    PlusCircle
} from 'lucide-react';
import { AppHeader } from '../AppHeader';
import { BiometricAuth } from '@/components/smartphone/BiometricAuth';

interface BankAssetAppProps {
    onBack: () => void;
}

export const BankAssetApp: React.FC<BankAssetAppProps> = ({ onBack }) => {
    const { currentUser, gameState, sendRequest } = useGame();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<'home' | 'history' | 'assets' | 'menu'>('home');

    if (!currentUser || !gameState) return null;

    // Calculate total assets
    const cashBalance = currentUser.balance || 0;
    const cryptoValue = Object.entries(currentUser.cryptoHoldings || {}).reduce((total, [id, amount]) => {
        const crypto = gameState.cryptos?.find(c => c.id === id);
        return total + (amount * (crypto?.price || 0));
    }, 0);
    const totalAssets = cashBalance + cryptoValue;

    if (!isAuthenticated) {
        return <BiometricAuth onAuthenticated={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="h-full w-full bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
            {/* Custom SMBC Style Header inside the app area */}
            <div className="bg-emerald-800 text-white px-4 pt-12 pb-6 rounded-b-[2.5rem] shadow-lg relative shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-emerald-200" />
                        </div>
                        <span className="font-bold tracking-tight text-lg">Olive</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Balance Display */}
                <div className="px-2">
                    <p className="text-emerald-200 text-xs font-medium mb-1 uppercase tracking-widest">Total Assets</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black tracking-tight">
                            {totalAssets.toLocaleString()}枚
                        </h2>
                        <span className="text-emerald-200 text-sm font-bold">JPY</span>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                            <span className="text-xs font-bold">Cash: {cashBalance.toLocaleString()}枚</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                            <span className="text-xs font-bold">Crypto: {Math.floor(cryptoValue).toLocaleString()}枚</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 -mt-6 flex justify-between gap-4 shrink-0">
                <QuickActionButton icon={<ArrowUpRight className="w-6 h-6" />} label="振込" color="bg-white" textColor="text-emerald-700" />
                <QuickActionButton icon={<PlusCircle className="w-6 h-6" />} label="チャージ" color="bg-emerald-600" textColor="text-white" />
                <QuickActionButton icon={<PieChart className="w-6 h-6" />} label="資産管理" color="bg-white" textColor="text-emerald-700" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 pb-24">
                {/* Account Cards */}
                <section>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Accounts</h3>
                    <div className="space-y-4">
                        <AccountCard
                            title="普通預金"
                            subtitle="三井住友銀行 本店"
                            amount={cashBalance}
                            type="cash"
                        />
                        <AccountCard
                            title="暗号資産ウォレット"
                            subtitle={`${Object.keys(currentUser.cryptoHoldings || {}).length} 通貨保有中`}
                            amount={cryptoValue}
                            type="crypto"
                        />
                    </div>
                </section>

                {/* News / Campaigns */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Offers</h3>
                        <button className="text-xs text-emerald-600 font-bold">See all</button>
                    </div>
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">Vポイントが貯まる！</h4>
                            <p className="text-xs text-slate-500">Oliveフレキシブルペイのご利用で...</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                </section>
            </div>

            {/* Bottom Tab Bar (Custom) */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center px-4 py-3 pb-8 rounded-t-[2.5rem] shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <TabItem icon={<Wallet />} label="ホーム" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <TabItem icon={<History />} label="履歴" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                <TabItem icon={<PieChart />} label="資産" active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
                <TabItem icon={<PlusCircle />} label="メニュー" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
            </div>
        </div>
    );
};

const QuickActionButton = ({ icon, label, color, textColor }: { icon: React.ReactNode, label: string, color: string, textColor: string }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        className={`flex-1 ${color} ${textColor} aspect-square rounded-[2rem] shadow-md flex flex-col items-center justify-center gap-2 border border-slate-100`}
    >
        <div className="p-2 rounded-xl bg-opacity-10">
            {icon}
        </div>
        <span className="text-xs font-black tracking-tight">{label}</span>
    </motion.button>
);

const AccountCard = ({ title, subtitle, amount, type }: { title: string, subtitle: string, amount: number, type: 'cash' | 'crypto' }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex justify-between items-center group cursor-pointer"
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'cash' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'}`}>
                {type === 'cash' ? <CreditCard className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
            <div>
                <h4 className="font-bold text-slate-800">{title}</h4>
                <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
            </div>
        </div>
        <div className="text-right flex items-center gap-3">
            <div>
                <p className="text-lg font-black text-slate-800">{Math.floor(amount).toLocaleString()}枚</p>
                <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-500">
                    <TrendingUp className="w-2 h-2" />
                    <span>+0.2%</span>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
        </div>
    </motion.div>
);

const TabItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-700' : 'text-slate-300'}`}
    >
        <div className={`${active ? 'bg-emerald-50 p-2 rounded-xl' : ''} transition-all`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" }) : icon}
        </div>
        <span className={`text-[10px] font-black tracking-tight ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
);
