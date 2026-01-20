import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Stock, InventoryItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const ILLEGAL_ITEMS = [
    { id: 'fake_id', name: '偽造ID', price: 5000, description: '逮捕リスクを一度だけ回避する', emoji: '🆔' },
    { id: 'hacking_tool', name: 'ハッキングツール', price: 10000, description: '他人の口座から少しだけ金を抜き取る', emoji: '💻' },
    { id: 'virus_usb', name: 'ウイルスUSB', price: 2000, description: 'ライバル店に置いて評判を下げる', emoji: '💾' },
];

interface ForbiddenAppProps {
    onBack: () => void;
}

export const ForbiddenApp: React.FC<ForbiddenAppProps> = ({ onBack }) => {
    const { gameState, currentUser, sendRequest } = useGame();
    const [activeTab, setActiveTab] = useState<'stocks' | 'items'>('stocks');
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Night Check
    if (!gameState || !currentUser || gameState.isDay) {
        return (
            <div className="h-full w-full bg-black text-green-500 font-mono flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-4">404</div>
                <div className="text-xl mb-8">CONNECTION TIMED OUT</div>
                <div className="text-sm opacity-50">
                    The requested gateway is only accessible during specific hours.
                </div>
                <button
                    onClick={onBack}
                    className="mt-12 border border-green-500 px-6 py-2 hover:bg-green-500 hover:text-black transition"
                >
                    DISCONNECT
                </button>
            </div>
        );
    }

    const forbiddenStocks = gameState.stocks?.filter(s => s.isForbidden) || [];

    const handleTrade = async (mode: 'buy' | 'sell') => {
        if (!selectedStock || !amount) return;
        setLoading(true);
        try {
            // Re-use standard buy_stock/sell_stock logic, but backend might trigger police raid
            await sendRequest(
                mode === 'buy' ? 'buy_stock' : 'sell_stock',
                Number(amount), // quantity
                selectedStock.id
            );
            setAmount('');
            alert('Transaction Complete... Watch your back.');
        } catch (e) {
            console.error(e);
            alert('Transaction Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleBuyItem = async (itemId: string, price: number) => {
        if ((currentUser?.balance || 0) < price) {
            alert('Insufficient Funds');
            return;
        }
        if (!confirm('Are you sure? This transaction cannot be traced.')) return;

        setLoading(true);
        try {
            await sendRequest('buy_forbidden_item', price, { itemId });
            alert('Item Acquired.');
        } catch (e) {
            console.error(e);
            alert('Transaction Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full w-full bg-slate-950 text-red-600 font-mono flex flex-col">
            {/* Dark Web Header */}
            <div className="p-4 border-b border-red-900 flex justify-between items-center bg-black">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">☠️</span>
                    <span className="font-bold tracking-widest text-red-600">DARK_NET</span>
                </div>
                <div className="text-xs text-red-800 animate-pulse">
                    ENCRYPTED: AES-256
                </div>
                <button onClick={onBack} className="text-red-500 border border-red-900 px-2 text-xs hover:bg-red-900/30">
                    EXIT
                </button>
            </div>

            {/* Navigation */}
            <div className="flex border-b border-red-900/50 bg-black/50">
                <button
                    onClick={() => setActiveTab('stocks')}
                    className={`flex-1 py-3 text-sm font-bold ${activeTab === 'stocks' ? 'bg-red-900/20 text-red-500' : 'text-red-900 hover:text-red-700'}`}
                >
                    MARKET
                </button>
                <button
                    onClick={() => setActiveTab('items')}
                    className={`flex-1 py-3 text-sm font-bold ${activeTab === 'items' ? 'bg-red-900/20 text-red-500' : 'text-red-900 hover:text-red-700'}`}
                >
                    TOOLS
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 relative">
                {/* Background Noise/Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>

                {activeTab === 'stocks' && (
                    <div className="space-y-4">
                        <div className="text-xs text-red-800 mb-2 p-2 border border-red-900/30 bg-red-950/10">
                            WARNING: HIGH VOLATILITY DETECTED
                        </div>
                        {forbiddenStocks.map(stock => {
                            const owned = currentUser?.forbiddenStocks?.[stock.id] || currentUser?.stocks?.[stock.id] || 0;

                            return (
                                <div key={stock.id} className="border border-red-800/40 bg-black p-3 hover:border-red-600 transition group cursor-pointer" onClick={() => setSelectedStock(stock)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-red-500 group-hover:text-red-400">{stock.name}</div>
                                            <div className="text-xs text-red-800">{stock.id.toUpperCase()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-red-500">{stock.price}</div>
                                            <div className="text-xs text-red-700">OWNED: {owned}</div>
                                        </div>
                                    </div>

                                    {selectedStock?.id === stock.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="mt-4 pt-4 border-t border-red-900/50"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="QTY"
                                                    value={amount}
                                                    onChange={e => setAmount(e.target.value)}
                                                    className="w-20 bg-red-950/20 border border-red-900 text-red-500 text-center focus:outline-none focus:border-red-500"
                                                />
                                                <button
                                                    disabled={loading}
                                                    onClick={() => handleTrade('buy')}
                                                    className="flex-1 bg-red-900/30 border border-red-800 text-red-500 hover:bg-red-800 hover:text-black transition text-sm py-1"
                                                >
                                                    BUY
                                                </button>
                                                <button
                                                    disabled={loading}
                                                    onClick={() => handleTrade('sell')}
                                                    className="flex-1 bg-transparent border border-red-900 text-red-700 hover:bg-red-900/20 hover:text-red-500 transition text-sm py-1"
                                                >
                                                    SELL
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'items' && (
                    <div className="space-y-4">
                        <div className="text-xs text-red-800 mb-2 p-2 border border-red-900/30 bg-red-950/10">
                            WARNING: POSSESSION IS ILLEGAL
                        </div>
                        {ILLEGAL_ITEMS.map(item => (
                            <div key={item.id} className="border border-red-800/40 bg-black p-3 flex justify-between items-center group hover:bg-red-900/5">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl grayscale group-hover:grayscale-0 transition">{item.emoji}</span>
                                    <div>
                                        <div className="font-bold text-red-500">{item.name}</div>
                                        <div className="text-xs text-red-800">{item.description}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleBuyItem(item.id, item.price)}
                                    className="px-3 py-1 text-sm border border-red-900 text-red-600 hover:bg-red-900 hover:text-black transition"
                                >
                                    ${item.price.toLocaleString()}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-red-900/50 bg-black text-center">
                <span className="text-[10px] text-red-900 uppercase">
                    Connection Secured via Onion Routing • IP HIDDEN
                </span>
            </div>
        </div>
    );
};
