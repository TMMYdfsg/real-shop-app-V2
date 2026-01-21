'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { CryptoManager } from '@/components/admin/CryptoManager';
import { CatalogManagerAdmin } from '@/components/admin/CatalogManagerAdmin';

// Professional Dashboard Card
const DashboardCard = ({ children, className = '', title, icon }: { children: React.ReactNode, className?: string, title?: string, icon?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow ${className}`}
    >
        {title && (
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                {icon && <span className="text-xl">{icon}</span>}
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
            </div>
        )}
        {children}
    </motion.div>
);

export default function BankerDashboard() {
    const { gameState } = useGame();
    const router = useRouter();
    const [activeTab, setActiveTab] = React.useState<'overview' | 'crypto' | 'real_estate' | 'catalog'>('overview');
    const [showRequests, setShowRequests] = React.useState(false);

    if (!gameState) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                システム接続中...
            </div>
        </div>
    );

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
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">
                        🏦
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 leading-tight">銀行管理システム</h1>
                        <p className="text-xs text-slate-400 font-bold">Real Bank & Trust Admin</p>
                    </div>
                </div>

                <div className="hidden md:flex bg-slate-100 p-1.5 rounded-xl">
                    {[
                        { id: 'overview', label: 'ダッシュボード', icon: '📊' },
                        { id: 'crypto', label: '市場取引', icon: '📈' },
                        { id: 'real_estate', label: '不動産', icon: '🏠' },
                        { id: 'catalog', label: 'カタログ', icon: '🛒' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-12 gap-6">

                        {/* Game Start Controller */}
                        {gameState.settings.isGameStarted === false && (
                            <div className="col-span-12">
                                <motion.div
                                    className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-100 text-amber-600 rounded-full text-2xl">⚠️</div>
                                        <div>
                                            <h3 className="text-lg font-bold text-amber-800">ゲーム開始待機中</h3>
                                            <p className="text-amber-700/80 text-sm">現在プレイヤーはロックされています。「ゲーム開始」を押すと参加可能になります。</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold border-none shadow-lg shadow-amber-200"
                                        onClick={async () => {
                                            if (confirm('ゲームを正式に開始しますか？')) {
                                                await fetch('/api/admin', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ action: 'start_game' })
                                                });
                                            }
                                        }}
                                    >
                                        🚀 ゲームを開始する
                                    </Button>
                                </motion.div>
                            </div>
                        )}

                        {/* Left Column: Controls */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">

                            {/* Time Control */}
                            <DashboardCard title="時間・ターン管理" icon="⏱️">
                                <div className="text-center mb-6 py-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">CURRENT TURN</div>
                                    <span className="text-6xl font-black text-slate-700 tracking-tighter">{gameState.turn}</span>
                                </div>

                                <div className={`p-4 rounded-xl mb-6 flex items-center justify-center gap-3 font-bold text-lg transition-colors ${gameState.isDay
                                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    }`}>
                                    <span className="text-2xl">{gameState.isDay ? '☀' : '🌙'}</span>
                                    <span>{gameState.isDay ? '現在: 昼 (ACTIVITY)' : '現在: 夜 (SLEEP)'}</span>
                                </div>

                                <Button
                                    className={`w-full h-14 text-lg font-bold shadow-lg transition-transform active:scale-95 ${gameState.isDay
                                            ? 'bg-slate-800 hover:bg-slate-700 text-white'
                                            : 'bg-amber-500 hover:bg-amber-400 text-white'
                                        }`}
                                    onClick={handleNextTurn}
                                >
                                    {gameState.isDay ? '🌙 一日を終了する (夜へ)' : '☀ 次の日を始める (昼へ)'}
                                </Button>
                            </DashboardCard>

                            {/* Request Box */}
                            <DashboardCard title="承認待ちリクエスト" icon="📫">
                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className={`text-6xl font-black mb-2 transition-colors ${pendingRequests.length > 0 ? 'text-rose-500' : 'text-slate-200'
                                        }`}>
                                        {pendingRequests.length}
                                    </div>
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">PENDING REQUESTS</span>
                                </div>
                                <Button
                                    className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 font-bold"
                                    onClick={() => setShowRequests(!showRequests)}
                                    disabled={pendingRequests.length === 0}
                                >
                                    {showRequests ? 'リストを閉じる' : '申請を確認する'}
                                </Button>

                                <AnimatePresence>
                                    {showRequests && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-4 space-y-3"
                                        >
                                            {pendingRequests.map(req => {
                                                const user = gameState.users.find(u => u.id === req.requesterId);
                                                return (
                                                    <div key={req.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm text-sm">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-bold text-slate-700">{user?.name}</span>
                                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                                                {req.type === 'income' ? '給与' : req.type === 'loan' ? '融資' : 'その他'}
                                                            </span>
                                                        </div>
                                                        <div className="mb-3 text-slate-600">
                                                            請求額: <span className="font-mono font-bold">¥{req.amount}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 border-none text-white h-8" onClick={() => handleRequest(req.id, 'approve')}>承認</Button>
                                                            <Button size="sm" className="bg-rose-500 hover:bg-rose-600 border-none text-white h-8" onClick={() => handleRequest(req.id, 'reject')}>却下</Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </DashboardCard>
                        </div>

                        {/* Right Column: Player Management */}
                        <div className="col-span-12 lg:col-span-8">
                            <DashboardCard title="プレイヤー管理" icon="👥" className="h-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {gameState.users.filter(u => u.role === 'player').map(user => (
                                        <div key={user.id} className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-lg text-slate-800">{user.name}</h4>
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{user.job}</span>
                                                </div>
                                                {user.debt > 0 && (
                                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">借金あり</span>
                                                )}
                                            </div>

                                            <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-lg">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500 font-bold text-xs">所持金</span>
                                                    <span className="font-mono font-bold text-slate-700">¥{(user.balance || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500 font-bold text-xs">借金</span>
                                                    <span className="font-mono font-bold text-rose-500">¥{(user.debt || 0).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={user.isOff ? 'primary' : 'outline'}
                                                    className={`text-[10px] h-8 px-3 rounded-lg ${user.isOff ? 'bg-indigo-600 border-none' : 'border-slate-200 text-slate-500'}`}
                                                    onClick={async () => {
                                                        if (confirm(`${user.name} のステータスを ${user.isOff ? '稼働中' : '休暇中'} に変更しますか？`)) {
                                                            await fetch('/api/admin', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ action: 'toggle_vacation', requestId: user.id })
                                                            });
                                                            window.location.reload();
                                                        }
                                                    }}
                                                >
                                                    {user.isOff ? '🌴 休暇中' : '🏢 稼働中'}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className={`text-[10px] h-8 px-3 rounded-lg border flex-1 ${user.isDebugAuthorized
                                                            ? 'bg-rose-50 text-rose-600 border-rose-200 font-bold'
                                                            : 'bg-white text-slate-400 border-slate-200'
                                                        }`}
                                                    onClick={async () => {
                                                        if (confirm(`${user.name} のデバッグ権限を操作しますか？`)) {
                                                            await fetch('/api/admin', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ action: 'toggle_debug_auth', requestId: user.id })
                                                            });
                                                            window.location.reload();
                                                        }
                                                    }}
                                                >
                                                    {user.isDebugAuthorized ? '🔧 Debug: ON' : 'Debug: OFF'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                                    <Button
                                        className="flex-1 h-12 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-700"
                                        onClick={() => {
                                            const bankerId = gameState.users.find(u => u.role === 'banker')?.id;
                                            if (bankerId) router.push(`/player/${bankerId}`);
                                        }}
                                    >
                                        📱 スマホシミュレーター (プレイヤー画面へ)
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="text-rose-500 font-bold hover:bg-rose-50 px-6 rounded-xl"
                                        onClick={handleFullReset}
                                    >
                                        💣 データ全消去
                                    </Button>
                                </div>
                            </DashboardCard>
                        </div>
                    </div>
                )}

                {/* Sub Managers */}
                {(activeTab === 'crypto' || activeTab === 'real_estate' || activeTab === 'catalog') && (
                    <DashboardCard title={`${activeTab === 'crypto' ? '市場取引' : activeTab === 'real_estate' ? '不動産管理' : '商品カタログ'} モジュール`} icon="🛠️">
                        {activeTab === 'crypto' && <CryptoManager />}
                        {activeTab === 'catalog' && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <CatalogManagerAdmin />
                            </div>
                        )}
                        {/* Placeholder for real estate */}
                        {activeTab === 'real_estate' && (
                            <div className="text-center py-20 text-slate-400">
                                <div className="text-4xl mb-4">🚧</div>
                                <p className="font-bold">不動産管理機能は現在メンテナンス中です</p>
                            </div>
                        )}
                    </DashboardCard>
                )}
            </div>
        </div>
    );
}
