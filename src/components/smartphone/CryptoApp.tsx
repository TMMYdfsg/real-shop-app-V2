import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Crypto } from '@/types';
import { StockChart } from '@/components/stock/StockChart';
import { AppHeader } from './AppHeader';

export const CryptoApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { gameState, currentUser, sendRequest } = useGame();
    const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [mode, setMode] = useState<'buy' | 'sell'>('buy');
    const [loading, setLoading] = useState(false);

    const cryptos = gameState?.cryptos || [];

    const handleTransaction = async () => {
        if (!selectedCrypto || !amount || isNaN(Number(amount))) return;

        setLoading(true);
        const cost = Number(amount);

        try {
            await sendRequest(
                mode === 'buy' ? 'crypto_buy' : 'crypto_sell',
                cost,
                JSON.stringify({
                    cryptoId: selectedCrypto.id,
                    amount: cost
                })
            );
            setAmount('');
            alert(mode === 'buy' ? '購入しました' : '売却しました');
        } catch (error) {
            console.error(error);
            alert('エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    if (selectedCrypto) {
        const holdings = currentUser?.cryptoHoldings?.[selectedCrypto.id] || 0;
        const price = selectedCrypto.price;

        return (
            <div className="h-full flex flex-col bg-slate-900 text-white p-4 overflow-y-auto">
                <button
                    onClick={() => setSelectedCrypto(null)}
                    className="mb-4 text-sm text-gray-400 hover:text-white flex items-center"
                >
                    ← 一覧に戻る
                </button>

                <div className="mb-6">
                    <div className="flex justify-between items-baseline mb-2">
                        <h2 className="text-2xl font-bold text-yellow-500">{selectedCrypto.name}</h2>
                        <span className="text-sm font-mono">{selectedCrypto.symbol}</span>
                    </div>
                    <div className="text-3xl font-bold mb-4">
                        {price.toLocaleString()} <span className="text-sm text-gray-400">Coins</span>
                    </div>

                    <div className="bg-slate-800 p-2 rounded-lg mb-4">
                        <StockChart stock={selectedCrypto} />
                    </div>

                    <div className="bg-slate-800 p-4 rounded-lg mb-4">
                        <div className="text-sm text-gray-400 mb-1">保有数</div>
                        <div className="text-xl font-mono">{holdings.toFixed(4)} {selectedCrypto.symbol}</div>
                        <div className="text-sm text-gray-500">
                            ≈ {(holdings * price).toLocaleString()} Coins
                        </div>
                    </div>
                </div>

                <div className="mt-auto bg-slate-800 p-4 rounded-t-xl">
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setMode('buy')}
                            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === 'buy'
                                ? 'bg-green-600 text-white'
                                : 'bg-slate-700 text-gray-400'
                                }`}
                        >
                            購入
                        </button>
                        <button
                            onClick={() => setMode('sell')}
                            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === 'sell'
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-700 text-gray-400'
                                }`}
                        >
                            売却
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">
                                {mode === 'buy' ? '支払う金額' : '売却して得る金額'}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="金額を入力"
                                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                                <span className="absolute right-4 top-3 text-gray-400">Coins</span>
                            </div>
                        </div>

                        {amount && (
                            <div className="text-right text-xs text-gray-400">
                                予想数量: {(Number(amount) / price).toFixed(4)} {selectedCrypto.symbol}
                            </div>
                        )}

                        <button
                            onClick={handleTransaction}
                            disabled={loading || !amount}
                            className={`w-full py-3 rounded-lg font-bold shadow-lg ${mode === 'buy'
                                ? 'bg-green-500 hover:bg-green-400'
                                : 'bg-red-500 hover:bg-red-400'
                                } disabled:opacity-50 disabled:cursor-not-allowed text-white`}
                        >
                            {loading ? '処理中...' : mode === 'buy' ? '購入確定' : '売却確定'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-900 text-white flex flex-col overflow-y-auto">
            <AppHeader title="🚀 Crypto Trade" onBack={onClose} variant="transparent" />
            <div className="p-4">

                <div className="space-y-3">
                    {cryptos.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            現在取引可能な通貨はありません
                        </div>
                    ) : (
                        cryptos.map((crypto) => {
                            const isUp = (crypto.priceHistory?.[crypto.priceHistory.length - 1] || crypto.price) >= (crypto.priceHistory?.[0] || crypto.price);

                            return (
                                <div
                                    key={crypto.id}
                                    onClick={() => setSelectedCrypto(crypto)}
                                    className="bg-slate-800 p-4 rounded-xl active:scale-95 transition-transform cursor-pointer border border-slate-700 hover:border-yellow-500/50"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${isUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {crypto.symbol[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold">{crypto.name}</div>
                                                <div className="text-xs text-gray-400">{crypto.symbol}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold">{crypto.price.toLocaleString()}</div>
                                            <div className={`text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                                {isUp ? '▲' : '▼'} {(crypto.volatility * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
