'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Role } from '@/types';

export default function Home() {
  const { gameState, login, isLoading } = useGame();
  const router = useRouter();
  const [setupStep, setSetupStep] = useState(0); // 0: Check, 1: Setup Form
  const [playerCount, setPlayerCount] = useState(4);
  const [names, setNames] = useState<string[]>(['', '', '', '']);
  const [ids, setIds] = useState<string[]>(['', '', '', '']); // Custom IDs

  // Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startingMoney, setStartingMoney] = useState(2000);
  const [moneyMultiplier, setMoneyMultiplier] = useState(1.0);

  useEffect(() => {
    if (!isLoading && gameState) {
      if (gameState.users.length === 0) {
        setSetupStep(1);
      } else {
        setSetupStep(0);
      }
    }
  }, [gameState, isLoading]);

  const handleLogin = (userId: string, role: Role, userName: string) => {
    if (!confirm(`${userName}さんで間違いありませんか？`)) return;

    // クッキーにIDを保存 (GameContextの初期化で使用)
    document.cookie = `playerId=${userId}; path=/; max-age=31536000; SameSite=Lax`;

    login(userId);
    if (role === 'banker') {
      router.push('/banker');
    } else {
      router.push(`/player/${userId}`);
    }
  };

  const handleSetupSubmit = async () => {
    // 1. Initialize Game Settings first
    try {
      await fetch('/api/setup/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moneyMultiplier: Number(moneyMultiplier),
          startingMoney: Number(startingMoney)
        })
      });
    } catch (e) {
      console.error("Failed to save settings", e);
      alert("設定の保存に失敗しましたが、続行します。");
    }

    // 2. Register users sequentially
    const usersToCreate = names.map((name, index) => ({
      name: name || `Player ${index + 1}`,
      role: index === 0 ? 'banker' : 'player',
      job: 'unemployed',
      id: ids[index] || undefined, // Pass custom ID if set
      initialBalance: index === 0 ? undefined : Number(startingMoney) // Pass starting money for players
    }));

    for (const user of usersToCreate) {
      await fetch('/api/setup/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
    }
    // Refresh page or wait for polling
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8">Loading...</div>
      </div>
    );
  }

  // Setup Mode
  if (gameState && gameState.users.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card title="初期セットアップ" className="max-w-md w-full" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem' }}>プレイする人数と名前を入力してね</p>

          <div style={{ marginBottom: '1rem' }}>
            <label>人数: </label>
            <select
              value={playerCount}
              onChange={(e) => {
                const count = Number(e.target.value);
                setPlayerCount(count);
                setNames(prev => {
                  const newArr = [...prev];
                  if (count > prev.length) for (let i = prev.length; i < count; i++) newArr.push('');
                  else newArr.splice(count);
                  return newArr;
                });
                setIds(prev => {
                  const newArr = [...prev];
                  if (count > prev.length) for (let i = prev.length; i < count; i++) newArr.push('');
                  else newArr.splice(count);
                  return newArr;
                });
              }}
              style={{ padding: '0.5rem', borderRadius: '4px' }}
            >
              {[2, 3, 4].map(n => <option key={n} value={n}>{n}人</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {names.map((name, index) => (
              <div key={index} style={{ padding: '0.5rem', border: '1px solid #eee', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.2rem', textAlign: 'left', fontWeight: 'bold' }}>
                  {index === 0 ? '銀行員' : `プレイヤー${index}`}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="名前"
                    value={name}
                    onChange={(e) => {
                      const newNames = [...names];
                      newNames[index] = e.target.value;
                      setNames(newNames);
                    }}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="ID (任意: 英数字)"
                    value={ids[index]}
                    onChange={(e) => {
                      const newIds = [...ids];
                      newIds[index] = e.target.value;
                      setIds(newIds);
                    }}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Admin Settings Accordion */}
          <div className="mb-6 border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-2 bg-gray-50 text-left text-sm font-bold flex justify-between items-center hover:bg-gray-100"
            >
              <span>⚙️ 詳細設定 (管理者用)</span>
              <span>{showAdvanced ? '▼' : '▶'}</span>
            </button>
            {showAdvanced && (
              <div className="p-4 bg-gray-50 space-y-4 animate-in slide-in-from-top-2">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-600">開始時の所持金 (プレイヤー)</label>
                  <input
                    type="number"
                    value={startingMoney}
                    onChange={(e) => setStartingMoney(Number(e.target.value))}
                    className="p-2 border rounded"
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-600">グローバル収入倍率 (給料等)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={moneyMultiplier}
                    onChange={(e) => setMoneyMultiplier(Number(e.target.value))}
                    className="p-2 border rounded"
                  />
                  <p className="text-xs text-gray-400">※1.0 = 通常, 2.0 = 2倍</p>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleSetupSubmit} fullWidth>
            ゲームスタート！
          </Button>
        </Card>
      </main>
    );
  }

  // Login Mode
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2rem' }}>
        Real Shop
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', width: '100%', maxWidth: '400px' }}>
        {gameState?.users.map((user) => (
          <Button
            key={user.id}
            variant={user.role === 'banker' ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            onClick={() => handleLogin(user.id, user.role, user.name)}
            style={{
              justifyContent: 'space-between',
              padding: '1.5rem',
              fontSize: '1.2rem'
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>ID: {user.id}</div>
            </div>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              {user.role === 'banker' ? '銀行員' : 'プレイヤー'}
            </span>
          </Button>
        ))}
      </div>

      {/* Reset Button (Debug) */}
      {/* <div style={{ marginTop: '2rem' }}>
        <Button variant="ghost" size="sm" onClick={() => fetch('/api/reset')}>リセット</Button>
      </div> */}
    </main>
  );
}
