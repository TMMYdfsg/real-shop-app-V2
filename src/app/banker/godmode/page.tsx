'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function GodModePage() {
    const { gameState, refresh } = useGame();
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [balanceInput, setBalanceInput] = useState('');
    const [depositInput, setDepositInput] = useState('');
    const [debtInput, setDebtInput] = useState('');
    const [healthInput, setHealthInput] = useState('');
    const [happinessInput, setHappinessInput] = useState('');

    if (!gameState) {
        return <div>Loading...</div>;
    }

    const selectedUser = gameState.users.find(u => u.id === selectedUserId);

    const handleUpdateBalance = async () => {
        if (!selectedUserId || !balanceInput) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'god_mode_update',
                userId: selectedUserId,
                updates: { balance: parseInt(balanceInput) }
            })
        });

        setBalanceInput('');
        await refresh();
        alert('残高を更新しました');
    };

    const handleUpdateDeposit = async () => {
        if (!selectedUserId || !depositInput) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'god_mode_update',
                userId: selectedUserId,
                updates: { deposit: parseInt(depositInput) }
            })
        });

        setDepositInput('');
        await refresh();
        alert('預金を更新しました');
    };

    const handleUpdateDebt = async () => {
        if (!selectedUserId || !debtInput) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'god_mode_update',
                userId: selectedUserId,
                updates: { debt: parseInt(debtInput) }
            })
        });

        setDebtInput('');
        await refresh();
        alert('借金を更新しました');
    };

    const handleUpdateHealth = async () => {
        if (!selectedUserId || !healthInput) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'god_mode_update',
                userId: selectedUserId,
                updates: { health: parseInt(healthInput) }
            })
        });

        setHealthInput('');
        await refresh();
        alert('体力を更新しました');
    };

    const handleUpdateHappiness = async () => {
        if (!selectedUserId || !happinessInput) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'god_mode_update',
                userId: selectedUserId,
                updates: { happiness: parseInt(happinessInput) }
            })
        });

        setHappinessInput('');
        await refresh();
        alert('幸福度を更新しました');
    };

    const handleResetAll = async () => {
        if (!confirm('本当に全ユーザーをリセットしますか？この操作は取り消せません。')) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'god_mode_reset_all'
            })
        });

        await refresh();
        alert('全ユーザーをリセットしました');
    };

    return (
        <div className="pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                    ⚡️ 神モード
                    <span className="text-sm font-normal text-gray-600 ml-2">(すべてのパラメータを操作可能)</span>
                </h2>

                {/* Warning */}
                <Card padding="md" className="mb-6 bg-red-50 border-2 border-red-300">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <div className="font-bold text-red-700">警告</div>
                            <div className="text-sm text-red-600">
                                この画面では全ユーザーのあらゆるパラメータを自由に操作できます。慎重に使用してください。
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Global Money Multiplier */}
                <Card padding="lg" className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <span className="text-2xl">💰</span>
                        グローバル収入倍率
                        <span className="text-sm font-normal text-gray-600">
                            （全プレイヤーの収入に適用）
                        </span>
                    </h3>

                    <div className="bg-white/80 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-600">現在の倍率</span>
                            <span className="text-3xl font-black text-amber-600">
                                {(gameState.settings?.moneyMultiplier || 1).toLocaleString()}x
                            </span>
                        </div>

                        {/* Input with Range */}
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="10000000"
                                    value={gameState.settings?.moneyMultiplier || 1}
                                    onChange={async (e) => {
                                        const value = Math.max(1, Math.min(10000000, parseInt(e.target.value) || 1));
                                        await fetch('/api/admin', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                type: 'update_settings',
                                                updates: { moneyMultiplier: value }
                                            })
                                        })
                                        await fetch('/api/admin', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                type: 'update_settings',
                                                updates: { moneyMultiplier: value }
                                            })
                                        });
                                        await refresh();
                                    }}
                                    className="flex-1 p-3 border-2 border-amber-300 rounded-lg text-xl font-bold text-center"
                                />
                                <Button
                                    variant="primary"
                                    className="bg-amber-500 hover:bg-amber-600"
                                    onClick={async () => {
                                        const input = document.querySelector('input[max="10000000"]') as HTMLInputElement;
                                        const value = parseInt(input?.value) || 1;
                                        await fetch('/api/admin', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                type: 'update_settings',
                                                updates: { moneyMultiplier: value }
                                            })
                                        });
                                        await refresh();
                                        alert(`収入倍率を ${value.toLocaleString()}x に設定しました`);
                                    }}
                                >
                                    適用
                                </Button>
                            </div>

                            {/* Preset Buttons */}
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 10, 100, 1000].map(mult => (
                                    <Button
                                        key={mult}
                                        variant={gameState.settings?.moneyMultiplier === mult ? 'primary' : 'outline'}
                                        className={gameState.settings?.moneyMultiplier === mult ? 'bg-amber-500' : ''}
                                        onClick={async () => {
                                            await fetch('/api/admin', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    type: 'update_settings',
                                                    updates: { moneyMultiplier: mult }
                                                })
                                            });
                                            await refresh();
                                            alert(`収入倍率を ${mult}x に設定しました`);
                                        }}
                                    >
                                        {mult}x
                                    </Button>
                                ))}
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[10000, 100000, 1000000, 10000000].map(mult => (
                                    <Button
                                        key={mult}
                                        variant={gameState.settings?.moneyMultiplier === mult ? 'primary' : 'outline'}
                                        className={`text-xs ${gameState.settings?.moneyMultiplier === mult ? 'bg-amber-500' : ''}`}
                                        onClick={async () => {
                                            await fetch('/api/admin', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    type: 'update_settings',
                                                    updates: { moneyMultiplier: mult }
                                                })
                                            });
                                            await refresh();
                                            alert(`収入倍率を ${mult.toLocaleString()}x に設定しました`);
                                        }}
                                    >
                                        {mult >= 1000000 ? `${mult / 1000000}M` : `${mult / 1000}K`}x
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-3">
                            ※ この倍率は給与、ショップ売上、NPC購入などすべての収入に適用されます
                        </p>
                    </div>
                </Card>

                {/* User Selection */}
                <Card padding="lg" className="mb-6">
                    <h3 className="font-bold text-xl mb-4">1. ユーザーを選択</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {gameState.users.map(user => (
                            <motion.button
                                key={user.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedUserId(user.id)}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedUserId === user.id
                                    ? 'bg-blue-100 border-blue-500 shadow-lg'
                                    : 'bg-white border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="font-bold">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.job}</div>
                                <div className="text-sm mt-2 font-semibold text-blue-600">
                                    {(user.balance || 0).toLocaleString()}枚
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </Card>

                {/* Parameter Controls */}
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                    >
                        <Card padding="lg">
                            <h3 className="font-bold text-xl mb-4">
                                2. {selectedUser.name} のパラメータ操作
                            </h3>

                            {/* Current Status */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">現在の残高</div>
                                        <div className="font-bold text-lg">{(selectedUser.balance || 0).toLocaleString()}枚</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">預金</div>
                                        <div className="font-bold text-lg">{(selectedUser.deposit || 0).toLocaleString()}枚</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">借金</div>
                                        <div className="font-bold text-lg text-red-600">{(selectedUser.debt || 0).toLocaleString()}枚</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">体力</div>
                                        <div className="font-bold text-lg">{selectedUser.health || 100}/100</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">幸福度</div>
                                        <div className="font-bold text-lg">{selectedUser.happiness || 50}/100</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">人気度</div>
                                        <div className="font-bold text-lg">{selectedUser.popularity || 0}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Balance Control */}
                            <div className="mb-4">
                                <label className="block font-bold mb-2">💰 残高を設定</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={balanceInput}
                                        onChange={(e) => setBalanceInput(e.target.value)}
                                        placeholder="新しい残高を入力"
                                        className="flex-1 p-3 border-2 rounded-lg"
                                    />
                                    <Button onClick={handleUpdateBalance} variant="primary">
                                        更新
                                    </Button>
                                </div>
                            </div>

                            {/* Deposit Control */}
                            <div className="mb-4">
                                <label className="block font-bold mb-2">🏦 預金を設定</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={depositInput}
                                        onChange={(e) => setDepositInput(e.target.value)}
                                        placeholder="新しい預金額を入力"
                                        className="flex-1 p-3 border-2 rounded-lg"
                                    />
                                    <Button onClick={handleUpdateDeposit} variant="primary">
                                        更新
                                    </Button>
                                </div>
                            </div>

                            {/* Debt Control */}
                            <div className="mb-4">
                                <label className="block font-bold mb-2">💸 借金を設定</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={debtInput}
                                        onChange={(e) => setDebtInput(e.target.value)}
                                        placeholder="新しい借金額を入力"
                                        className="flex-1 p-3 border-2 rounded-lg"
                                    />
                                    <Button onClick={handleUpdateDebt} variant="danger">
                                        更新
                                    </Button>
                                </div>
                            </div>

                            {/* Health Control */}
                            <div className="mb-4">
                                <label className="block font-bold mb-2">❤️ 体力を設定 (0-100)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={healthInput}
                                        onChange={(e) => setHealthInput(e.target.value)}
                                        placeholder="体力を入力"
                                        className="flex-1 p-3 border-2 rounded-lg"
                                        min="0"
                                        max="100"
                                    />
                                    <Button onClick={handleUpdateHealth} variant="primary">
                                        更新
                                    </Button>
                                </div>
                            </div>

                            {/* Happiness Control */}
                            <div className="mb-4">
                                <label className="block font-bold mb-2">😊 幸福度を設定 (0-100)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={happinessInput}
                                        onChange={(e) => setHappinessInput(e.target.value)}
                                        placeholder="幸福度を入力"
                                        className="flex-1 p-3 border-2 rounded-lg"
                                        min="0"
                                        max="100"
                                    />
                                    <Button onClick={handleUpdateHappiness} variant="primary">
                                        更新
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card padding="lg">
                            <h3 className="font-bold text-xl mb-4">3. クイックアクション</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <Button
                                    onClick={() => {
                                        setBalanceInput('1000000');
                                        handleUpdateBalance();
                                    }}
                                    variant="primary"
                                    fullWidth
                                >
                                    💰 100万枚付与
                                </Button>
                                <Button
                                    onClick={() => {
                                        setBalanceInput('0');
                                        handleUpdateBalance();
                                    }}
                                    variant="danger"
                                    fullWidth
                                >
                                    💸 残高を0に
                                </Button>
                                <Button
                                    onClick={() => {
                                        setDebtInput('0');
                                        handleUpdateDebt();
                                    }}
                                    variant="primary"
                                    fullWidth
                                >
                                    ✨ 借金を帳消し
                                </Button>
                                <Button
                                    onClick={() => {
                                        setHealthInput('100');
                                        handleUpdateHealth();
                                    }}
                                    variant="primary"
                                    fullWidth
                                >
                                    ❤️ 体力MAX
                                </Button>
                                <Button
                                    onClick={() => {
                                        setHappinessInput('100');
                                        handleUpdateHappiness();
                                    }}
                                    variant="primary"
                                    fullWidth
                                >
                                    😊幸福度MAX
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Danger Zone */}
                <Card padding="lg" className="mt-6 bg-red-50 border-2 border-red-300">
                    <h3 className="font-bold text-xl mb-4 text-red-700">⚠️ 危険ゾーン</h3>
                    <Button
                        onClick={handleResetAll}
                        variant="danger"
                        fullWidth
                    >
                        🔄 全ユーザーリセット（残高・預金・借金を初期化）
                    </Button>
                </Card>
            </motion.div>
        </div>
    );
}
