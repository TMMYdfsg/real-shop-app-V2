'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';

export default function RankingPage() {
    const { gameState, currentUser } = useGame();

    if (!gameState || !currentUser) return <div>Loading...</div>;

    // 総資産でソート（残高 + 貯金 + 株保有額）
    const rankedByWealth = [...gameState.users]
        .filter(u => u.role === 'player')
        .map(u => {
            // 株保有額の計算
            const stockValue = (u.stocks || []).reduce((sum: number, s: { stockId: string; quantity: number }) => {
                const stock = gameState.stocks.find(st => st.id === s.stockId);
                return sum + (s.quantity * (stock?.price || 0));
            }, 0);

            return {
                ...u,
                totalWealth: u.balance + u.deposit + stockValue
            };
        })
        .sort((a, b) => b.totalWealth - a.totalWealth);

    // 人気度でソート
    const rankedByRating = [...gameState.users]
        .filter(u => u.role === 'player')
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const getRankIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `${rank}位`;
    };

    const myWealthRank = rankedByWealth.findIndex(u => u.id === currentUser.id) + 1;
    const myRatingRank = rankedByRating.findIndex(u => u.id === currentUser.id) + 1;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>ランキング</h2>

            {/* 自分の順位 */}
            <Card padding="md" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: 'white', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>総資産順位</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{getRankIcon(myWealthRank)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>人気度順位</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{getRankIcon(myRatingRank)}</div>
                    </div>
                </div>
            </Card>

            {/* 総資産ランキング */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>💰 総資産ランキング</h3>
            <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
                {rankedByWealth.map((user, index) => (
                    <Card
                        key={user.id}
                        padding="md"
                        style={{
                            background: user.id === currentUser.id ? '#fef3c7' : 'white',
                            border: user.id === currentUser.id ? '2px solid #fbbf24' : '1px solid #e5e7eb'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '3rem' }}>
                                    {getRankIcon(index + 1)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.job}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                    {user.totalWealth.toLocaleString()}枚
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                    現金: {user.balance.toLocaleString()} / 貯金: {user.deposit.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* 人気度ランキング */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>⭐ 人気度ランキング</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
                {rankedByRating.map((user, index) => (
                    <Card
                        key={user.id}
                        padding="md"
                        style={{
                            background: user.id === currentUser.id ? '#fef3c7' : 'white',
                            border: user.id === currentUser.id ? '2px solid #fbbf24' : '1px solid #e5e7eb'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '3rem' }}>
                                    {getRankIcon(index + 1)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.shopName || `${user.name}のショップ`}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>
                                    ⭐ {user.rating || 0}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
