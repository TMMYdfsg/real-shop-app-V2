'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StockChart } from '@/components/stock/StockChart';

export default function StockPage() {
    const { gameState, currentUser, sendRequest } = useGame();
    const [amount, setAmount] = useState<{ [key: string]: string }>({});
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [selectedStockId, setSelectedStockId] = useState<string>('');

    useEffect(() => {
        if (!currentUser || currentUser.timeEra === 'past') return;
        let isMounted = true;

        const tick = async () => {
            if (!isMounted) return;
            try {
                await sendRequest('stock_tick', 0, {});
            } catch (error) {
                console.error('Stock tick failed', error);
            }
        };

        tick();
        const interval = setInterval(tick, 10000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [currentUser?.id, currentUser?.timeEra, sendRequest]);

    useEffect(() => {
        if (!selectedStockId && gameState?.stocks?.length) {
            setSelectedStockId(gameState.stocks[0].id);
        }
    }, [gameState?.stocks, selectedStockId]);

    const selectedStock = useMemo(() => {
        if (!gameState) return null;
        return gameState.stocks.find(s => s.id === selectedStockId) || gameState.stocks[0];
    }, [gameState, selectedStockId]);

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const handleTrade = async (stockId: string, type: 'buy_stock' | 'sell_stock') => {
        const count = Number(amount[stockId]);
        if (!count || count <= 0) return;

        const stock = gameState.stocks.find(s => s.id === stockId);
        if (!stock) return;

        // Validation
        if (type === 'buy_stock') {
            const cost = stock.price * count;
            if (currentUser.balance < cost) {
                alert('お金が足りません！');
                return;
            }
        } else {
            const currentHold = currentUser.stocks[stockId] || 0;
            if (currentHold < count) {
                alert('そんなに持っていません！');
                return;
            }
        }

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type,
                requesterId: currentUser.id,
                amount: count, // 株数
                details: stockId // 株ID
            }),
        });

        setAmount(prev => ({ ...prev, [stockId]: '' }));
        alert('申請しました！');
    };

    return (
        <div className="ui-stack">
            <div className="ui-stack">
                <div className="ui-title">株式市場</div>
                <div className="ui-muted">株を買って資産を増やそう！ただし暴落には気をつけて。</div>
            </div>

            <div className="ui-inline">
                <Button size="sm" variant={viewMode === 'board' ? 'primary' : 'secondary'} onClick={() => setViewMode('board')}>
                    ボード
                </Button>
                <Button size="sm" variant={viewMode === 'list' ? 'primary' : 'secondary'} onClick={() => setViewMode('list')}>
                    一覧
                </Button>
            </div>

            {viewMode === 'board' && selectedStock ? (
                <Card padding="lg">
                    <div className="ui-stack">
                        <div className="ui-inline u-justify-between u-w-full">
                            <div className="ui-stack u-gap-xs">
                                <div className="ui-subtitle">{selectedStock.name}</div>
                                <div className="ui-muted text-sm">
                                    {selectedStock.category ? `ジャンル: ${selectedStock.category}` : 'ジャンル: 未設定'}
                                </div>
                            </div>
                            <div className="ui-stack u-gap-xs u-text-center">
                                <span className="ui-muted">現在価格</span>
                                <span className="ui-subtitle">{selectedStock.price}枚</span>
                            </div>
                        </div>
                        <StockChart stock={selectedStock} />
                    </div>
                </Card>
            ) : null}

            <div className={viewMode === 'board' ? 'ui-grid' : 'ui-stack'}>
                {gameState.stocks.map(stock => {
                    const diff = stock.price - stock.previousPrice;
                    const diffPercent = ((diff / stock.previousPrice) * 100).toFixed(1);
                    const isUp = diff >= 0;
                    const holding = currentUser.stocks[stock.id] || 0;

                    return (
                        <Card key={stock.id} padding="md" clickable>
                            <div className="ui-stack">
                                <div className="ui-inline u-justify-between">
                                    <div>
                                        <div className="ui-subtitle">{stock.name}</div>
                                        {stock.category && (
                                            <div className="ui-muted text-xs">
                                                ジャンル: {stock.category}
                                                {stock.marketCap ? ` / 規模: ${stock.marketCap}` : ''}
                                            </div>
                                        )}
                                        <div className="ui-muted text-xs">保有: {holding}株</div>
                                    </div>
                                    <div className="u-text-center">
                                        <div className="text-lg font-bold">{stock.price}枚</div>
                                        <div className="text-xs">
                                            {isUp ? '▲' : '▼'} {Math.abs(diff)} ({diffPercent}%)
                                        </div>
                                    </div>
                                </div>

                                <StockChart stock={stock} />

                                <div className="ui-inline">
                                    <input
                                        type="number"
                                        placeholder="株数"
                                        value={amount[stock.id] || ''}
                                        onChange={(e) => setAmount(prev => ({ ...prev, [stock.id]: e.target.value }))}
                                        className="ui-input"
                                        style={{ width: '96px' }}
                                    />
                                    <Button onClick={() => handleTrade(stock.id, 'buy_stock')}>買う</Button>
                                    <Button variant="secondary" onClick={() => handleTrade(stock.id, 'sell_stock')}>売る</Button>
                                    <Button variant="ghost" onClick={() => setSelectedStockId(stock.id)}>拡大</Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
