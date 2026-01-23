'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VEHICLE_CATALOG } from '@/lib/gameData';

export default function CommuteConfigPage() {
    const params = useParams();
    const router = useRouter();
    const { currentUser, refresh } = useGame();
    const playerId = params.id as string;

    const [region, setRegion] = useState<'urban' | 'rural'>('urban');
    const [distance, setDistance] = useState(5);
    const [method, setMethod] = useState<'walk' | 'bicycle' | 'train' | 'bus' | 'taxi' | 'car'>('walk');
    const [isSaving, setIsSaving] = useState(false);

    // Load initial values
    useEffect(() => {
        if (currentUser) {
            if (currentUser.region) setRegion(currentUser.region);
            if (currentUser.commuteDistance) setDistance(currentUser.commuteDistance);
            if (currentUser.commuteMethod) setMethod(currentUser.commuteMethod);
        }
    }, [currentUser]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'config_commute',
                    requesterId: playerId,
                    details: JSON.stringify({
                        region,
                        distance,
                        method,
                        // 簡易的に自宅・職場IDは固定またはランダム生成扱いで今回は省略
                        homeId: 'home_' + playerId,
                        workId: 'work_' + playerId
                    })
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('通勤設定を保存しました！');
                refresh();
                router.push(`/player/${playerId}`);
            } else {
                alert('保存に失敗しました: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert('通信エラーが発生しました');
        } finally {
            setIsSaving(false);
        }
    };

    // Commute Methods Definition
    const methods = [
        { id: 'walk', name: '徒歩', icon: '🚶', cost: 0, desc: '健康に良いが時間がかかる。' },
        { id: 'bicycle', name: '自転車', icon: '🚲', cost: 0, desc: '適度な運動。パンクに注意。', needVehicle: true },
        { id: 'bus', name: 'バス', icon: '🚌', cost: 220, desc: '時間が読めないこともある。' },
        { id: 'train', name: '電車', icon: '🚃', cost: 500, desc: '確実だが混雑がストレス。' },
        { id: 'car', name: '自家用車', icon: '🚗', cost: '燃費次第', desc: '快適だが維持費がかかる。渋滞注意。', needVehicle: true },
        { id: 'taxi', name: 'タクシー', icon: '🚕', cost: '高額', desc: '一番快適で早い。お金持ち向け。' },
    ];

    // Check availability
    const isMethodAvailable = (mId: string) => {
        if (mId === 'bicycle') {
            return currentUser?.ownedVehicles?.some(v => v.includes('bicycle'));
        }
        if (mId === 'car') {
            return currentUser?.ownedVehicles?.some(v => v.includes('car'));
        }
        return true;
    };

    if (!currentUser) return <div className="p-4 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-gray-600">
                        ← 戻る
                    </button>
                    <h1 className="font-bold text-lg">通勤ライフスタイル設定</h1>
                    <div className="w-8" />
                </div>
            </div>

            <main className="max-w-md mx-auto p-4 space-y-6">
                {/* 1. 居住地域 */}
                <Card>
                    <div className="space-y-4">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">🏡</span> 居住エリア
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setRegion('urban')}
                                className={`p-4 rounded-xl border-2 transition-all ${region === 'urban'
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">🏙️</div>
                                <div className="font-bold">都会</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    公共交通が便利。<br />駐車場が高い。
                                </div>
                            </button>
                            <button
                                onClick={() => setRegion('rural')}
                                className={`p-4 rounded-xl border-2 transition-all ${region === 'rural'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">⛰️</div>
                                <div className="font-bold">郊外</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    車が必須。<br />自然が豊か。
                                </div>
                            </button>
                        </div>
                    </div>
                </Card>

                {/* 2. 通勤距離 */}
                <Card>
                    <div className="space-y-4">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">📏</span> 通勤距離
                        </h2>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-bold text-indigo-600">
                                    {distance} <span className="text-base font-normal text-gray-500">km</span>
                                </span>
                                <span className="text-sm text-gray-500">
                                    {distance < 5 ? '近所' : distance < 15 ? '中距離' : '長距離'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                step="1"
                                value={distance}
                                onChange={(e) => setDistance(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <p className="text-xs text-gray-500">
                                ※距離が長いほど通勤費が高くなり、トラブル発生率も上がります。
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 3. 通勤手段 */}
                <Card>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="text-2xl">🚃</span> 通勤手段
                            </h2>
                            <button
                                onClick={() => router.push(`/player/${playerId}/shop/vehicles`)}
                                className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold hover:bg-orange-200"
                            >
                                乗り物を買う
                            </button>
                        </div>

                        <div className="space-y-2">
                            {methods.map((m) => {
                                const available = isMethodAvailable(m.id);
                                const isSelected = method === m.id;

                                return (
                                    <div
                                        key={m.id}
                                        onClick={() => available && setMethod(m.id as any)}
                                        className={`
                                            relative flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer
                                            ${!available ? 'opacity-50 grayscale cursor-not-allowed bg-gray-100' : ''}
                                            ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                : 'border-white hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div className="text-3xl mr-4">{m.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-800">{m.name}</span>
                                                <span className="text-sm font-semibold text-gray-600">
                                                    {typeof m.cost === 'number' ? `${m.cost}枚` : m.cost}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">{m.desc}</div>
                                            {!available && (
                                                <div className="text-xs text-red-500 font-bold mt-1">
                                                    ※所有していません
                                                </div>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="absolute right-2 top-2 text-indigo-500">
                                                ✅
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>

                {/* 免許ステータス */}
                {!currentUser.hasLicense && (
                    <Card>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">🔰</div>
                                <div>
                                    <div className="font-bold text-gray-800">運転免許未取得</div>
                                    <div className="text-xs text-gray-500">車に乗るには免許が必要です</div>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/player/${playerId}/shop/vehicles`)}
                            >
                                取得する
                            </Button>
                        </div>
                    </Card>
                )}

                <div className="pt-4">
                    <Button
                        fullWidth
                        size="lg"
                        onClick={handleSave}
                        isLoading={isSaving}
                    >
                        設定を保存する
                    </Button>
                </div>
            </main>
        </div>
    );
}
