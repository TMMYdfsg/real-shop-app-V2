'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BankerTimerPage() {
    const { gameState } = useGame();
    const [editDays, setEditDays] = useState(0);
    const [editHours, setEditHours] = useState(0);
    const [editMinutes, setEditMinutes] = useState(5);
    const [editSeconds, setEditSeconds] = useState(0);

    if (!gameState) return <div>Loading...</div>;

    const remaining = isNaN(gameState.timeRemaining) ? 0 : gameState.timeRemaining;

    // Calculate display time
    const d = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((remaining % (1000 * 60)) / 1000);

    // API Call helper
    const callAction = async (type: string, details?: any) => {
        await fetch('/api/action', {
            method: 'POST',
            body: JSON.stringify({
                type,
                requesterId: 'banker',
                amount: 0,
                details: details ? JSON.stringify(details) : undefined
            })
        });
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>⏱️ タイマー管理</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {/* 現在のステータス */}
                <Card padding="lg">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>現在の状況</div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {d > 0 && <span>{d}日 </span>}
                            {h > 0 && <span>{h}時間 </span>}
                            {m}分
                            {s.toString().padStart(2, '0')}秒
                        </div>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: gameState.isTimerRunning ? '#10b981' : '#ef4444',
                            marginTop: '0.5rem'
                        }}>
                            {gameState.isTimerRunning ? '▶ 進行中' : '⏸ 停止中'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                        {gameState.isTimerRunning ? (
                            <Button variant="danger" onClick={() => callAction('timer_stop')}>
                                ⏸ 一時停止
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={() => callAction('timer_start')}>
                                ▶ 再開
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => callAction('timer_reset')}>
                            🔄 リセット (初期設定へ)
                        </Button>
                    </div>
                </Card>

                {/* 時間編集 */}
                <Card padding="md">
                    <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>時間を指定して変更</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {/* Days */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input
                                type="number"
                                value={editDays}
                                onChange={(e) => setEditDays(Number(e.target.value))}
                                min={0}
                                style={{ padding: '0.5rem', width: '60px', fontSize: '1.2rem' }}
                            />
                            <span>日</span>
                        </div>
                        {/* Hours */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input
                                type="number"
                                value={editHours}
                                onChange={(e) => setEditHours(Number(e.target.value))}
                                min={0}
                                style={{ padding: '0.5rem', width: '60px', fontSize: '1.2rem' }}
                            />
                            <span>時間</span>
                        </div>
                        {/* Minutes */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input
                                type="number"
                                value={editMinutes}
                                onChange={(e) => setEditMinutes(Number(e.target.value))}
                                min={0}
                                style={{ padding: '0.5rem', width: '70px', fontSize: '1.2rem' }}
                            />
                            <span>分</span>
                        </div>
                        {/* Seconds */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input
                                type="number"
                                value={editSeconds}
                                onChange={(e) => setEditSeconds(Number(e.target.value))}
                                min={0} max={59}
                                style={{ padding: '0.5rem', width: '70px', fontSize: '1.2rem' }}
                            />
                            <span>秒</span>
                        </div>

                        <div style={{ marginLeft: 'auto' }}>
                            <Button
                                size="sm"
                                onClick={() => callAction('timer_update', {
                                    days: editDays,
                                    hours: editHours,
                                    minutes: editMinutes,
                                    seconds: editSeconds
                                })}
                            >
                                適用
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
