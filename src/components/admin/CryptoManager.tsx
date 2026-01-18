import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const CryptoManager: React.FC = () => {
    const { gameState, sendRequest } = useGame();
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [price, setPrice] = useState('');
    const [volatility, setVolatility] = useState('0.1');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const cryptos = gameState.cryptos || [];

    const handleCreate = async () => {
        if (!name || !symbol || !price) return;

        setLoading(true);
        try {
            await sendRequest('crypto_create', 0, JSON.stringify({
                name,
                symbol,
                price: Number(price),
                volatility: Number(volatility),
                description
            }));

            // Reset form
            setName('');
            setSymbol('');
            setPrice('');
            setDescription('');
            alert('作成しました');
        } catch (error) {
            console.error(error);
            alert('作成エラー');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="仮想通貨管理" padding="md">
            <div className="space-y-6">
                {/* Create Form */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold mb-3">新規通貨発行</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">通貨名</label>
                            <input
                                className="w-full border p-2 rounded"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="例: ビットコイン"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">単位 (Symbol)</label>
                            <input
                                className="w-full border p-2 rounded"
                                value={symbol}
                                onChange={e => setSymbol(e.target.value)}
                                placeholder="例: BTC"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">初期価格</label>
                            <input
                                type="number"
                                className="w-full border p-2 rounded"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="1000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">変動率 (0.0-1.0)</label>
                            <input
                                type="number"
                                step="0.05"
                                className="w-full border p-2 rounded"
                                value={volatility}
                                onChange={e => setVolatility(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold mb-1">説明</label>
                            <input
                                className="w-full border p-2 rounded"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="通貨の説明"
                            />
                        </div>
                    </div>
                    <div className="mt-4 text-right">
                        <Button
                            onClick={handleCreate}
                            disabled={loading || !name || !symbol || !price}
                            size="md"
                            variant="primary"
                        >
                            {loading ? '作成中...' : '発行する'}
                        </Button>
                    </div>
                </div>

                {/* List */}
                <div>
                    <h3 className="font-bold mb-2">発行済み通貨リスト ({cryptos.length})</h3>
                    {cryptos.length === 0 ? (
                        <div className="text-gray-500 text-sm">まだ通貨はありません</div>
                    ) : (
                        <div className="space-y-2">
                            {cryptos.map(c => (
                                <div key={c.id} className="flex justify-between items-center bg-white p-3 rounded border shadow-sm">
                                    <div>
                                        <div className="font-bold text-lg">{c.name} <span className="text-sm font-normal text-gray-500">({c.symbol})</span></div>
                                        <div className="text-sm text-gray-600">価格: {c.price.toLocaleString()} | 変動: {c.volatility}</div>
                                    </div>
                                    <div className="text-right">
                                        {/* Edit/Delete buttons placeholders */}
                                        <span className="text-xs text-slate-400">ID: {c.id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
