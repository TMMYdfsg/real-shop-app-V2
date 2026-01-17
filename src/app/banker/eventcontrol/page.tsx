'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { EVENT_TEMPLATES, PLAYER_EVENT_TEMPLATES } from '@/lib/eventData';

export default function EventControlPage() {
    const { gameState } = useGame();
    const [selectedEventTemplate, setSelectedEventTemplate] = useState<number>(0);
    const [targetUserId, setTargetUserId] = useState<string>('');

    const handleTriggerEvent = async (isPlayerSpecific: boolean = false) => {
        const template = isPlayerSpecific
            ? PLAYER_EVENT_TEMPLATES[selectedEventTemplate]
            : EVENT_TEMPLATES[selectedEventTemplate];

        if (!template) return;

        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'trigger_event',
                eventTemplate: template,
                targetUserId: isPlayerSpecific ? targetUserId : undefined
            })
        });
    };

    const handleEndEvent = async (eventId: string) => {
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'end_event',
                eventId
            })
        });
    };

    if (!gameState) return <div>Loading...</div>;

    const activeEvents = gameState.activeEvents || [];

    return (
        <div className="p-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold mb-6">🎭 大規模イベント管理</h2>

                {/* アクティブイベント */}
                <Card padding="md" className="mb-6">
                    <h3 className="text-xl font-bold mb-4">現在発生中のイベント</h3>
                    {activeEvents.length === 0 ? (
                        <p className="text-gray-500">現在発生中のイベントはありません</p>
                    ) : (
                        <div className="space-y-3">
                            {activeEvents.map(event => {
                                const remainingTime = Math.max(0, event.startTime + event.duration - Date.now());
                                const remainingSec = Math.ceil(remainingTime / 1000);
                                const targetUser = event.targetUserId
                                    ? gameState.users.find(u => u.id === event.targetUserId)
                                    : null;

                                return (
                                    <div key={event.id} className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-bold text-lg">{event.name}</div>
                                            <div className="text-sm text-gray-600">{event.description}</div>
                                            {targetUser && (
                                                <div className="text-xs text-purple-600 mt-1">対象: {targetUser.name}</div>
                                            )}
                                            <div className="text-xs text-gray-500 mt-1">
                                                残り時間: {remainingSec}秒 | 種類: {event.type}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleEndEvent(event.id)}
                                        >
                                            終了
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {/* グローバルイベント発動 */}
                <Card padding="md" className="mb-6">
                    <h3 className="text-xl font-bold mb-4">グローバルイベントを発動</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">イベントを選択</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedEventTemplate}
                                onChange={e => setSelectedEventTemplate(Number(e.target.value))}
                            >
                                {EVENT_TEMPLATES.map((template, idx) => (
                                    <option key={idx} value={idx}>
                                        {template.name} - {template.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button fullWidth variant="primary" onClick={() => handleTriggerEvent(false)}>
                            イベント発動
                        </Button>
                    </div>
                </Card>

                {/* プレイヤー個別イベント */}
                <Card padding="md">
                    <h3 className="text-xl font-bold mb-4">プレイヤー個別イベント</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">対象プレイヤー</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={targetUserId}
                                onChange={e => setTargetUserId(e.target.value)}
                            >
                                <option value="">プレイヤーを選択...</option>
                                {gameState.users.filter(u => u.role === 'player').map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">イベントを選択</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedEventTemplate}
                                onChange={e => setSelectedEventTemplate(Number(e.target.value))}
                            >
                                {PLAYER_EVENT_TEMPLATES.map((template, idx) => (
                                    <option key={idx} value={idx}>
                                        {template.name} - {template.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            fullWidth
                            variant="secondary"
                            disabled={!targetUserId}
                            onClick={() => handleTriggerEvent(true)}
                        >
                            個別イベント発動
                        </Button>
                    </div>
                </Card>

                {/* クイックアクション */}
                <Card padding="md">
                    <h3 className="text-xl font-bold mb-4">⚡ クイックアクション</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="success"
                            onClick={() => {
                                fetch('/api/admin', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        action: 'trigger_event',
                                        eventTemplate: EVENT_TEMPLATES.find(e => e.type === 'grant')
                                    })
                                });
                            }}
                        >
                            💰 給付金配布
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                fetch('/api/admin', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        action: 'trigger_event',
                                        eventTemplate: EVENT_TEMPLATES.find(e => e.type === 'epidemic')
                                    })
                                });
                            }}
                        >
                            😷 疫病発生
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                fetch('/api/admin', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        action: 'trigger_event',
                                        eventTemplate: EVENT_TEMPLATES.find(e => e.type === 'boom')
                                    })
                                });
                            }}
                        >
                            📈 好景気発動
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                fetch('/api/admin', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        action: 'trigger_event',
                                        eventTemplate: EVENT_TEMPLATES.find(e => e.type === 'festival')
                                    })
                                });
                            }}
                        >
                            🎉 お祭り開催
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
