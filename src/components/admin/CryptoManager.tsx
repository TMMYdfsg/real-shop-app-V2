import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const CryptoManager: React.FC = () => {
    const { gameState, sendRequest } = useGame();
    // Form States
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [price, setPrice] = useState('');
    const [volatility, setVolatility] = useState('0.1');
    const [description, setDescription] = useState('');

    // Edit Mode State
    const [editId, setEditId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const cryptos = gameState?.cryptos || [];

    const resetForm = () => {
        setName('');
        setSymbol('');
        setPrice('');
        setVolatility('0.1');
        setDescription('');
        setEditId(null);
    };

    const handleEdit = (c: any) => {
        setEditId(c.id);
        setName(c.name);
        setSymbol(c.symbol);
        setPrice(String(c.price));
        setVolatility(String(c.volatility));
        setDescription(c.description || '');
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('本当に削除しますか？\nこの操作は取り消せません。')) return;
        setLoading(true);
        try {
            await sendRequest('crypto_manage', 0, JSON.stringify({
                action: 'delete',
                cryptoId: id
            }));
            alert('削除しました');
        } catch (error) {
            console.error(error);
            alert('削除エラー');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name || !symbol || !price) return;

        setLoading(true);
        try {
            if (editId) {
                // Update
                await sendRequest('crypto_manage', 0, JSON.stringify({
                    action: 'update',
                    cryptoId: editId,
                    data: {
                        name,
                        symbol,
                        price: Number(price),
                        volatility: Number(volatility),
                        description
                    }
                }));
                alert('更新しました');
                resetForm();
            } else {
                // Create
                await sendRequest('crypto_create', 0, JSON.stringify({
                    name,
                    symbol,
                    price: Number(price),
                    volatility: Number(volatility),
                    description
                }));
                alert('作成しました');
                resetForm();
            }
        } catch (error) {
            console.error(error);
            alert('エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="仮想通貨管理" padding="md">
            <div className="space-y-6">
                {/* Form */}
                <div className={`p-4 rounded-lg border ${editId ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold">{editId ? '通貨情報を編集' : '新規通貨発行'}</h3>
                        {editId && (
                            <Button size="sm" variant="ghost" onClick={resetForm}>
                                キャンセル
                            </Button>
                        )}
                    </div>

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
                            <label className="block text-sm font-bold mb-1">価格</label>
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
                            onClick={handleSubmit}
                            disabled={loading || !name || !symbol || !price}
                            size="md"
                            variant={editId ? 'warning' : 'primary'}
                        >
                            {loading ? '処理中...' : (editId ? '更新する' : '発行する')}
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
                                        <div className="text-xs text-gray-400 mt-1">{c.description}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleEdit(c)}>編集</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>削除</Button>
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
