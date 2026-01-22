'use client';

export const dynamic = "force-dynamic";

import React, { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/kpi/StatCard';
import nextDynamic from 'next/dynamic';

// Dynamic import for BankTerminal to avoid SSR issues if any
const BankTerminal = nextDynamic(() => import('@/components/banking/BankTerminal'), { ssr: false });

export default function PlayerHome({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params using React.use()
    const { id } = use(params);
    const { gameState, currentUser, refresh } = useGame();
    const [isBankOpen, setIsBankOpen] = useState(false);

    if (!gameState) return <div className="ui-container ui-muted">Loading world data...</div>;

    // Game Start Lock (Check this FIRST, before currentUser check)
    if (gameState.settings.isGameStarted === false) {
        return (
            <div className="night-overlay">
                <div className="u-text-center u-max-w-md">
                    <div className="ui-title">🛑</div>
                    <h1 className="ui-title">準備中</h1>
                    <p className="ui-muted">
                        ゲームが初期化されました。<br />
                        管理者がゲームを開始するまで<br />
                        しばらくお待ちください。
                    </p>
                    <div className="ui-muted">Waiting for admin...</div>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="ui-container">
                <Card>
                    <CardHeader>
                        <CardTitle>ユーザーエラー</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="ui-muted">ユーザー情報が見つかりませんでした。ゲームがリセットされた可能性があります。</p>
                        <div className="u-mt-4">
                            <Button onClick={() => window.location.href = '/'}>
                                トップに戻る
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleBankAction = async (type: string, details: any) => {
        try {
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    requesterId: currentUser.id,
                    details
                })
            });
            await refresh();
        } catch (error) {
            console.error('Bank action failed:', error);
        }
    };

    const kpis = [
        { label: '資産', value: `${currentUser.balance.toLocaleString()}枚`, icon: '💰' },
        { label: '預金', value: `${currentUser.deposit.toLocaleString()}枚`, icon: '🏦' },
        { label: '借金', value: `${currentUser.debt.toLocaleString()}枚`, icon: '💸' },
        { label: '幸福', value: `${currentUser.happiness}`, icon: '😊' },
        { label: '信用', value: `${currentUser.popularity}`, icon: '📈' },
    ];

    const actions = [
        { label: '仕事をする', href: `${currentUser.id}/special`, badge: '収入' },
        { label: 'マイショップ', href: `${currentUser.id}/shop`, badge: '経営' },
        { label: '投資・株', href: `${currentUser.id}/stock`, badge: '投資' },
        { label: '交流・移動', href: `${currentUser.id}/map`, badge: 'ライフ' },
    ];

    const marketRows = useMemo(() => {
        return gameState.stocks.slice(0, 5).map((stock) => ({
            id: stock.id,
            name: stock.name,
            price: stock.price,
            previous: stock.previousPrice,
        }));
    }, [gameState.stocks]);

    const columns = [
        { key: 'name', header: '銘柄' },
        {
            key: 'price',
            header: '価格',
            render: (row: { price: number }) => `${row.price.toLocaleString()}枚`,
        },
        {
            key: 'previous',
            header: '変化',
            render: (row: { price: number; previous: number }) => {
                const diff = row.price - row.previous;
                const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
                const label = `${diff >= 0 ? '+' : ''}${diff.toLocaleString()}`;
                return <Chip status={trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'neutral'}>{label}</Chip>;
            },
        },
    ];

    // Main Dashboard Interface
    return (
        <div className="ui-stack u-max-w-lg u-mx-auto">
            <div className="ui-stack">
                <div className="ui-subtitle">今日のダッシュボード</div>
                <div className="ui-muted">経済とライフの両面から状況を確認できます。</div>
            </div>

            <div className="ui-grid">
                {kpis.map((kpi) => (
                    <StatCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>今日の行動</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="ui-grid">
                        {actions.map((action) => (
                            <Link key={action.label} href={`/player/${action.href}`}>
                                <Card clickable>
                                    <CardContent>
                                        <div className="ui-stack">
                                            <div className="ui-inline u-justify-between">
                                                <div className="ui-subtitle">{action.label}</div>
                                                <Chip density="compact">{action.badge}</Chip>
                                            </div>
                                            <span className="ui-muted">今すぐ行動する →</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>市場トレンド</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={marketRows}
                        columns={columns}
                        rowKey={(row) => row.id}
                        density="compact"
                        emptyMessage="市場データがまだありません。"
                    />
                    <Button size="sm" onClick={() => setIsBankOpen(true)}>
                        銀行端末を開く
                    </Button>
                </CardContent>
            </Card>

            {isBankOpen && (
                <BankTerminal
                    user={currentUser}
                    economy={gameState.economy}
                    onClose={() => setIsBankOpen(false)}
                    onAction={handleBankAction}
                />
            )}
        </div>
    );
}
