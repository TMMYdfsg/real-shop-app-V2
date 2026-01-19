'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { CryptoManager } from '@/components/admin/CryptoManager';
import { RealEstateManager } from '@/components/admin/RealEstateManager';
import { CatalogManagerAdmin } from '@/components/admin/CatalogManagerAdmin';

export default function BankerDashboard() {
    const { gameState } = useGame();
    const [activeTab, setActiveTab] = React.useState<'overview' | 'crypto' | 'real_estate' | 'catalog'>('overview');
    const [showRequests, setShowRequests] = React.useState(false);

    if (!gameState) return <div>Loading...</div>;

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
            // Force reload to clear context and redirect to setup
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
        <div className="p-4 space-y-6">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-black text-gray-800">Banker Dashboard</h1>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📊 概要・申請
                    </button>
                    <button
                        onClick={() => setActiveTab('crypto')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'crypto' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🚀 仮想通貨管理
                    </button>
                    <button
                        onClick={() => setActiveTab('real_estate')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'real_estate' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🏠 不動産管理
                    </button>
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'catalog' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🛒 カタログ管理
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        {/* Turn Card */}
                        <Card title="現在のターン" padding="md">
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>Turn {gameState.turn}</div>
                            <div style={{ color: gameState.isDay ? '#eab308' : '#6366f1', fontWeight: 'bold', marginBottom: '1rem' }}>
                                {gameState.isDay ? '☀ 昼 (活動中)' : '🌙 夜 (休憩中)'}
                            </div>
                            <Button
                                size="sm"
                                variant={gameState.isDay ? 'secondary' : 'primary'}
                                onClick={handleNextTurn}
                            >
                                {gameState.isDay ? '夜にする (活動終了)' : '次の日へ (朝にする)'}
                            </Button>
                        </Card>

                        {/* Requests Card */}
                        <Card title="承認待ちの申請" padding="md">
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: pendingRequests.length > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                                {pendingRequests.length}件
                            </div>
                            <Button
                                size="sm"
                                variant="danger"
                                style={{ marginTop: '0.5rem' }}
                                onClick={() => setShowRequests(!showRequests)}
                                disabled={pendingRequests.length === 0}
                            >
                                {showRequests ? '閉じる' : '確認する'}
                            </Button>
                        </Card>

                        {/* Players Card */}
                        <Card title="参加プレイヤー" padding="md">
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{gameState.users.filter(u => u.role === 'player').length}人</div>
                            <div className="text-sm text-gray-500 mt-2">現在のアクティブユーザー</div>
                            <Button
                                size="sm"
                                variant="danger"
                                className="mt-4 w-full"
                                onClick={handleFullReset}
                            >
                                🗑️ 完全リセット (最初へ戻る)
                            </Button>
                        </Card>
                    </div>

                    {/* Requests List Section */}
                    {showRequests && (
                        <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s' }}>
                            <h2 style={{ marginBottom: '1rem' }}>申請リスト</h2>
                            {pendingRequests.map(req => {
                                const user = gameState.users.find(u => u.id === req.requesterId);
                                return (
                                    <Card key={req.id} padding="sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--warning-color)' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{user?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.9rem' }}>
                                                {req.type === 'income' && '💰 稼ぎ申請'}
                                                {req.type === 'loan' && '💸 借金申請'}
                                                {req.type === 'repay' && '↩️ 返済申請'}
                                                {req.type === 'tax' && '🧾 支払い'}
                                                : <span style={{ fontWeight: 'bold' }}>{req.amount}枚</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button size="sm" variant="success" onClick={() => handleRequest(req.id, 'approve')}>承認</Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleRequest(req.id, 'reject')}>却下</Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    <h2 style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.25rem' }}>プレイヤー状況</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {gameState.users.filter(u => u.role === 'player').map(user => (
                            <Card key={user.id} title={user.name + (user.debt > 0 ? ' ⚠️借金あり' : '')} padding="sm">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>所持金:</span>
                                    <span style={{ fontWeight: 'bold' }}>{(user.balance || 0).toLocaleString()}枚</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>借金:</span>
                                    <span style={{ color: user.debt > 0 ? 'var(--danger-color)' : 'inherit', fontWeight: user.debt > 0 ? 'bold' : 'normal' }}>{(user.debt || 0).toLocaleString()}枚</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>職業:</span>
                                    <span>{user.job}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Crypto Manager Tab */}
            {activeTab === 'crypto' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <CryptoManager />
                </div>
            )}

            {/* Real Estate Manager Tab */}
            {activeTab === 'real_estate' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <RealEstateManager />
                </div>
            )}

            {/* Catalog Manager Tab */}
            {activeTab === 'catalog' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <CatalogManagerAdmin />
                </div>
            )}
        </div>
    );
}
