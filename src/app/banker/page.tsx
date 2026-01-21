'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { CryptoManager } from '@/components/admin/CryptoManager';
import { RealEstateManager } from '@/components/admin/RealEstateManager';
import { CatalogManagerAdmin } from '@/components/admin/CatalogManagerAdmin';

// Styled Glass Panel Component
const GlassPanel = ({ children, className = '', title }: { children: React.ReactNode, className?: string, title?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl ${className}`}
    >
        {title && <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">{title}</h3>}
        {children}
    </motion.div>
);

export default function BankerDashboard() {
    const { gameState } = useGame();
    const router = useRouter();
    const [activeTab, setActiveTab] = React.useState<'overview' | 'crypto' | 'real_estate' | 'catalog'>('overview');
    const [showRequests, setShowRequests] = React.useState(false);

    if (!gameState) return <div className="min-h-screen flex items-center justify-center text-white">システム起動中...</div>;

    const pendingRequests = gameState.requests.filter(r => r.status === 'pending');

    const handleNextTurn = async () => {
        if (!confirm('ターンを進めますか？')) return;
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'next_turn' }),
        });
    };

    const handleFullReset = async () => {
        if (!confirm('【警告】すべてのデータを消去して初期セットアップ画面に戻りますか？\nこの操作は取り消せません。')) return;
        if (!confirm('本当にリセットしますか？')) return;

        try {
            await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'full_reset' }),
            });
            window.location.href = '/';
        } catch (error) {
            console.error('Reset failed:', error);
            alert('リセットに失敗しました');
        }
    };

    const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, requestId }),
        });
    };

    return (
        <div className="min-h-screen p-8 text-slate-100">
            {/* Mission Control Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-12 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    <div>
                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">MISSION CONTROL</h1>
                        <p className="text-sm text-slate-400">リアルショップゲーム 管理システム</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-slate-800/50 p-1.5 rounded-xl backdrop-blur-md border border-white/5">
                    {['overview', 'crypto', 'real_estate', 'catalog'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {tab === 'overview' && '📊 ダッシュボード'}
                            {tab === 'crypto' && '🚀 株・仮想通貨'}
                            {tab === 'real_estate' && '🏠 不動産'}
                            {tab === 'catalog' && '🛒 カタログ'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-12 gap-6">
                    {/* Status Bar / Game Start Alert */}
                    {gameState.settings.isGameStarted === false && (
                        <div className="col-span-12">
                            <GlassPanel className="border-l-4 border-l-amber-500 bg-amber-500/10" title="システム警告">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-amber-100">ゲーム開始待機中</h3>
                                        <p className="text-amber-200/60">プレイヤーが参加できるよう、開始を承認してください。</p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] border-none"
                                        onClick={async () => {
                                            if (confirm('ゲームを開始し、プレイヤーのロックを解除しますか？')) {
                                                await fetch('/api/admin', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ action: 'start_game' })
                                                });
                                            }
                                        }}
                                    >
                                        🚀 ゲーム開始承認
                                    </Button>
                                </div>
                            </GlassPanel>
                        </div>
                    )}

                    {/* Main Stats Grid */}
                    <div className="col-span-12 md:col-span-4 space-y-6">
                        {/* Turn Controller */}
                        <GlassPanel title="時間管理">
                            <div className="text-center mb-6">
                                <span className="text-6xl font-black tracking-tighter text-white/90">{gameState.turn}</span>
                                <span className="text-sm text-slate-500 block">現在のターン</span>
                            </div>

                            <div className={`p-4 rounded-xl mb-4 flex items-center justify-center gap-3 ${gameState.isDay ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'}`}>
                                <span className="text-2xl">{gameState.isDay ? '☀' : '🌙'}</span>
                                <span className="font-bold">{gameState.isDay ? '昼ターム (DAY)' : '夜ターム (NIGHT)'}</span>
                            </div>

                            <Button
                                className="w-full h-12 text-lg font-bold"
                                variant={gameState.isDay ? 'secondary' : 'primary'}
                                onClick={handleNextTurn}
                            >
                                {gameState.isDay ? '🌙 一日を終了する' : '☀ 次の日へ'}
                            </Button>
                        </GlassPanel>

                        {/* Request Queue */}
                        <GlassPanel title="承認待ちリクエスト">
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className={`text-5xl font-bold mb-2 ${pendingRequests.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {pendingRequests.length}
                                </div>
                                <span className="text-xs text-slate-400 uppercase tracking-widest">件の申請</span>
                            </div>
                            <Button
                                className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600"
                                onClick={() => setShowRequests(!showRequests)}
                                disabled={pendingRequests.length === 0}
                            >
                                {showRequests ? 'リストを閉じる' : '申請を確認する'}
                            </Button>
                        </GlassPanel>
                    </div>

                    {/* Central Monitoring (Players) */}
                    <div className="col-span-12 md:col-span-8">
                        <GlassPanel title="オンラインプレイヤー" className="h-full">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {gameState.users.filter(u => u.role === 'player').map(user => (
                                    <div key={user.id} className="bg-white/5 border border-white/5 hover:border-blue-500/50 transition-colors rounded-xl p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-lg">{user.name}</h4>
                                                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{user.job}</span>
                                            </div>
                                            {user.debt > 0 && <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded">借金あり</span>}
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">所持金</span>
                                                <span className="font-mono font-bold text-emerald-400">¥{(user.balance || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">借金</span>
                                                <span className="font-mono font-bold text-rose-400">¥{(user.debt || 0).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-3 flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant={user.isOff ? 'primary' : 'ghost'}
                                                className={`text-[10px] h-7 px-2 ${user.isOff ? 'bg-indigo-600' : 'bg-slate-800'}`}
                                                onClick={async () => {
                                                    if (confirm(`${user.name} を ${user.isOff ? '通常稼働' : 'お休み'} に切り替えますか？`)) {
                                                        await fetch('/api/admin', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ action: 'toggle_vacation', requestId: user.id })
                                                        });
                                                        window.location.reload();
                                                    }
                                                }}
                                            >
                                                {user.isOff ? '休暇中 (OFF)' : '稼働中 (ON)'}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant={user.isDebugAuthorized ? 'danger' : 'ghost'}
                                                className={`text-[10px] h-7 px-2 ${user.isDebugAuthorized ? 'bg-rose-600' : 'bg-slate-800 border border-slate-700'}`}
                                                onClick={async () => {
                                                    if (confirm(`${user.name} のデバッグ権限を ${user.isDebugAuthorized ? '剥奪' : '付与'} しますか？`)) {
                                                        await fetch('/api/admin', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ action: 'toggle_debug_auth', requestId: user.id })
                                                        });
                                                        window.location.reload();
                                                    }
                                                }}
                                            >
                                                デバッグ: {user.isDebugAuthorized ? '許可' : '不可'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-4 border-t border-white/5 flex gap-4">
                                <Button
                                    variant="primary"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none"
                                    onClick={() => router.push(`/player/${gameState.users.find(u => u.role === 'banker')?.id}`)}
                                >
                                    📱 スマホシミュレーターを開く
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                    onClick={handleFullReset}
                                >
                                    ⚠ 緊急リセット (データ消去)
                                </Button>
                            </div>
                        </GlassPanel>
                    </div>

                    {/* Requests List Section */}
                    {showRequests && (
                        <div className="col-span-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <GlassPanel title="受信ボックス">
                                <div className="space-y-4">
                                    {pendingRequests.map(req => {
                                        const user = gameState.users.find(u => u.id === req.requesterId);
                                        return (
                                            <div key={req.id} className="flex justify-between items-center bg-white/5 p-4 rounded-lg border-l-4 border-amber-500">
                                                <div>
                                                    <div className="font-bold text-lg">{user?.name || 'Unknown Agent'}</div>
                                                    <div className="text-sm text-slate-300">
                                                        {req.type === 'income' && `給与申請: ¥${req.amount}`}
                                                        {req.type === 'loan' && `ローン申請: ¥${req.amount}`}
                                                        {req.type === 'repay' && `返済: ¥${req.amount}`}
                                                        {req.type === 'vacation' && `休暇申請: ${req.details}`}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 border-none" onClick={() => handleRequest(req.id, 'approve')}>✓ 承認</Button>
                                                    <Button size="sm" className="bg-rose-600 hover:bg-rose-500 border-none" onClick={() => handleRequest(req.id, 'reject')}>✕ 却下</Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </GlassPanel>
                        </div>
                    )}
                </div>
            )}

            {/* Sub Managers */}
            {(activeTab === 'crypto' || activeTab === 'real_estate' || activeTab === 'catalog') && (
                <GlassPanel title={`${activeTab === 'crypto' ? '株・仮想通貨' : activeTab === 'real_estate' ? '不動産' : 'カタログ'} 管理モジュール`}>
                    {activeTab === 'crypto' && <CryptoManager />}
                    {activeTab === 'catalog' && <CatalogManagerAdmin />}
                    {/* Placeholder for real estate if needed */}
                </GlassPanel>
            )}
        </div>
    );
}
