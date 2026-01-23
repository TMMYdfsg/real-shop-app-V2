'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { StockChart } from '@/components/stock/StockChart';

export default function BankerMarketPage() {
    const { gameState } = useGame();
    const [editingStockId, setEditingStockId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [selectedStockId, setSelectedStockId] = useState<string>('');

    useEffect(() => {
        if (gameState && !selectedStockId && gameState.stocks.length > 0) {
            setSelectedStockId(gameState.stocks[0].id);
        }
    }, [gameState?.stocks, selectedStockId]);

    const selectedStock = useMemo(() => {
        if (!gameState) return undefined;
        return gameState.stocks.find(s => s.id === selectedStockId) || gameState.stocks[0];
    }, [gameState?.stocks, selectedStockId]);

    if (!gameState) return <div className="ui-container ui-muted">Loading...</div>;

    const handleUpdatePrice = async (stockId: string) => {
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_stock',
                requestId: stockId, // Using requestId as stockId slot
                amount: editPrice
            }),
        });
        setEditingStockId(null);
    };

    return (
        <div className="ui-container ui-stack">
            <div className="ui-stack">
                <div className="ui-title">株式市場管理</div>
                <div className="ui-muted">価格調整と監視を行う管理ビューです。</div>
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
                                <CardTitle>{selectedStock.name}</CardTitle>
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
                    const isEditing = editingStockId === stock.id;

                    return (
                        <Card key={stock.id} clickable>
                            <CardHeader>
                                <div className="ui-inline u-justify-between u-w-full">
                                    <CardTitle>{stock.name}</CardTitle>
                                    <div className="ui-inline">
                                        {stock.isForbidden ? <Chip status="danger" density="compact">闇市場</Chip> : null}
                                        <Button size="sm" variant="ghost" onClick={() => setSelectedStockId(stock.id)}>
                                            チャート
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="ui-stack">
                                    <div className="ui-inline u-justify-between">
                                        <div className="ui-stack u-gap-xs">
                                            <span className="ui-muted">現在価格</span>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={editPrice}
                                                    onChange={e => setEditPrice(Number(e.target.value))}
                                                />
                                            ) : (
                                                <span className="ui-subtitle">{stock.price}枚</span>
                                            )}
                                        </div>
                                        <div className="ui-stack u-gap-xs u-text-center">
                                            <span className="ui-muted">前回価格</span>
                                            <span>{stock.previousPrice}枚</span>
                                        </div>
                                    </div>

                                    <StockChart stock={stock} />

                                    {isEditing ? (
                                        <div className="ui-inline">
                                            <Button size="sm" variant="primary" onClick={() => handleUpdatePrice(stock.id)}>保存</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingStockId(null)}>キャンセル</Button>
                                        </div>
                                    ) : (
                                        <Button size="sm" onClick={() => { setEditingStockId(stock.id); setEditPrice(stock.price); }}>
                                            価格操作
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
