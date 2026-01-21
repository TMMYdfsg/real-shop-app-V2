'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { Role } from '@/types';

export default function Home() {
  const { gameState, login, isLoading } = useGame();
  const router = useRouter();
  const [setupStep, setSetupStep] = useState(0); // 0: Check, 1: Setup Form
  const [isSetupBusy, setIsSetupBusy] = useState(false);
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
    if (isSetupBusy) return;
    if (names.some(name => !name.trim())) {
      alert("全員の名前を入力してね");
      return;
    }

    setIsSetupBusy(true);

    try {
      // 1. Prepare Full Data
      const users = names.map((name, index) => ({
        name: name.trim(),
        role: index === 0 ? 'banker' : 'player',
        id: ids[index]?.trim() || undefined,
      }));

      const setupData = {
        settings: {
          moneyMultiplier: Number(moneyMultiplier),
          startingMoney: Number(startingMoney)
        },
        users: users
      };

      // 2. Perform Full Setup in one call
      const res = await fetch('/api/setup/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Setup failed`);
      }

      // Success!
      window.location.reload();
    } catch (e: any) {
      console.error("Failed to perform setup", e);
      alert(`セットアップに失敗しました: ${e.message}`);
      setIsSetupBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ui-container ui-stack u-min-h-screen">
        <Skeleton className="u-h-140" />
        <Skeleton className="u-h-220" />
      </div>
    );
  }

  // Setup Mode
  if (gameState && gameState.users.length === 0) {
    return (
      <main className="ui-container">
        <Card>
          <CardHeader>
            <CardTitle>初期セットアップ</CardTitle>
            <CardDescription>プレイ人数と名前を入力して、ゲームを開始しよう。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="ui-stack">
              <label className="ui-inline">
                <span className="ui-subtitle">人数</span>
                <Select
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
                >
                  {[2, 3, 4].map(n => <option key={n} value={n}>{n}人</option>)}
                </Select>
              </label>

              <div className="ui-stack">
                {names.map((name, index) => (
                  <Card key={index}>
                    <CardContent>
                      <div className="ui-stack">
                        <div className="ui-inline">
                          <Chip status={index === 0 ? 'success' : 'neutral'} density="compact">
                            {index === 0 ? '銀行員' : `プレイヤー${index}`}
                          </Chip>
                        </div>
                        <Input
                          type="text"
                          placeholder="名前"
                          value={name}
                          onChange={(e) => {
                            const newNames = [...names];
                            newNames[index] = e.target.value;
                            setNames(newNames);
                          }}
                        />
                        <Input
                          type="text"
                          placeholder="ID (任意: 英数字)"
                          value={ids[index]}
                          onChange={(e) => {
                            const newIds = [...ids];
                            newIds[index] = e.target.value;
                            setIds(newIds);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card clickable onClick={() => setShowAdvanced(!showAdvanced)}>
                <CardContent>
                  <div className="ui-inline u-justify-between u-w-full">
                    <span className="ui-subtitle">⚙️ 詳細設定 (管理者用)</span>
                    <span>{showAdvanced ? '▼' : '▶'}</span>
                  </div>
                </CardContent>
              </Card>

              {showAdvanced && (
                <div className="ui-stack">
                  <label className="ui-stack">
                    <span className="ui-subtitle">開始時の所持金 (プレイヤー)</span>
                    <Input
                      type="number"
                      value={startingMoney}
                      onChange={(e) => setStartingMoney(Number(e.target.value))}
                    />
                  </label>
                  <label className="ui-stack">
                    <span className="ui-subtitle">グローバル収入倍率 (給料等)</span>
                    <Input
                      type="number"
                      step="0.1"
                      value={moneyMultiplier}
                      onChange={(e) => setMoneyMultiplier(Number(e.target.value))}
                    />
                    <span className="ui-muted">※1.0 = 通常, 2.0 = 2倍</span>
                  </label>
                </div>
              )}

              <Button onClick={handleSetupSubmit} fullWidth disabled={isSetupBusy}>
                {isSetupBusy ? '作成中...' : 'ゲームスタート！'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Login Mode
  return (
    <main className="ui-container ui-stack u-min-h-screen">
      <div className="ui-stack u-text-center">
        <div className="ui-title">Real Shop</div>
        <div className="ui-muted">経済シミュ × ライフシミュのログイン</div>
      </div>

      <div className="ui-stack u-max-w-md u-mx-auto u-w-full">
        {gameState?.users.map((user) => (
          <Card key={user.id} clickable onClick={() => handleLogin(user.id, user.role, user.name)}>
            <CardContent>
              <div className="ui-inline u-justify-between u-w-full">
                <div className="ui-stack u-gap-xs">
                  <div className="ui-subtitle">{user.name}</div>
                  <div className="ui-muted">ID: {user.id}</div>
                </div>
                <Chip status={user.role === 'banker' ? 'success' : 'neutral'}>
                  {user.role === 'banker' ? '銀行員' : 'プレイヤー'}
                </Chip>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reset Button (Debug) */}
      {/* <div style={{ marginTop: '2rem' }}>
        <Button variant="ghost" size="sm" onClick={() => fetch('/api/reset')}>リセット</Button>
      </div> */}
    </main>
  );
}
