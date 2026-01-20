'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { VEHICLE_CATALOG } from '@/lib/gameData';
import { Vehicle } from '@/types';

// 通勤手段の定義
const COMMUTE_METHODS = {
    walk: { name: '徒歩', emoji: '🚶', cost: 0, time: 60, stress: 5, description: '健康的だが時間がかかる' },
    bicycle: { name: '自転車', emoji: '🚲', cost: 0, time: 30, stress: 2, description: '風を切って走ろう（所有が必要）' },
    train: { name: '電車', emoji: '🚃', cost: 16800, time: 40, stress: 15, description: '通勤定期券（1ヶ月）' }, // cost is monthly
    bus: { name: 'バス', emoji: '🚌', cost: 12000, time: 50, stress: 10, description: 'バス定期券（1ヶ月）' },
    car: { name: '自家用車', emoji: '🚗', cost: 30000, time: 20, stress: 3, description: '快適だが維持費がかかる（所有が必要）' },
    taxi: { name: 'タクシー', emoji: '🚕', cost: 120000, time: 20, stress: 0, description: '超快適だが非常に高価' }
};

export default function CommutePage() {
    const { currentUser, sendRequest } = useGame();
    const [activeTab, setActiveTab] = useState<'status' | 'method' | 'shop'>('status');

    if (!currentUser) return <div>Loading...</div>;

    const currentMethodKey = currentUser.commuteMethod || 'walk';
    const currentMethod = COMMUTE_METHODS[currentMethodKey as keyof typeof COMMUTE_METHODS] || COMMUTE_METHODS.walk;

    // 所有している乗り物
    const ownedVehicleIds = currentUser.ownedVehicles || [];
    const ownedVehicles = ownedVehicleIds
        .map(id => VEHICLE_CATALOG.find(v => v.id === id))
        .filter(Boolean) as Vehicle[];

    const handleMethodChange = async (method: string, vehicleId?: string) => {
        if (!confirm(`通勤手段を「${COMMUTE_METHODS[method as keyof typeof COMMUTE_METHODS].name}」に変更しますか？`)) return;

        await sendRequest('change_commute_method', 0, JSON.stringify({
            method,
            vehicleId
        }));
        alert('通勤手段を変更しました！');
    };

    const handleBuyVehicle = async (vehicle: Vehicle) => {
        if (currentUser.balance < vehicle.price) {
            alert('お金が足りません！');
            return;
        }
        if (!confirm(`${vehicle.name} (${vehicle.price.toLocaleString()}円) を購入しますか？`)) return;

        await sendRequest('buy_vehicle', 0, JSON.stringify({ vehicleId: vehicle.id }));
        alert('購入しました！');
    };

    return (
        <div className="space-y-6 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                    🚃 通勤センター
                </h1>
                <p className="text-gray-600 mb-6 font-medium">最適な通勤スタイルを見つけよう！</p>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('status')}
                    className={`px-4 py-2 font-bold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'status' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    📊 ステータス
                </button>
                <button
                    onClick={() => setActiveTab('method')}
                    className={`px-4 py-2 font-bold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'method' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    🔄 手段変更
                </button>
                <button
                    onClick={() => setActiveTab('shop')}
                    className={`px-4 py-2 font-bold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'shop' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    🏪 車両販売店
                </button>
            </div>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'status' && (
                        <motion.div
                            key="status"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <Card padding="lg" className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
                                <div className="flex items-center gap-6">
                                    <div className="text-6xl">{currentMethod.emoji}</div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-500 mb-1">現在の通勤手段</div>
                                        <div className="kind-bold text-2xl mb-2">{currentMethod.name}</div>
                                        <p className="text-sm text-gray-600">{currentMethod.description}</p>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <div>
                                            <span className="text-xs text-gray-500 block">通勤時間</span>
                                            <span className="font-bold text-xl">{currentMethod.time}分</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">月額コスト</span>
                                            <span className="font-bold text-xl text-red-500">{currentMethod.cost.toLocaleString()}円</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card padding="md">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">🚗 所有車両</h3>
                                    {ownedVehicles.length > 0 ? (
                                        <div className="space-y-3">
                                            {ownedVehicles.map(v => (
                                                <div key={v.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                                                    <div className="text-2xl">{v.image}</div>
                                                    <div>
                                                        <div className="font-bold text-sm">{v.name}</div>
                                                        <div className="text-xs text-gray-500">{v.type === 'car' ? '自動車' : '自転車'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400 py-4">車両を持っていません</div>
                                    )}
                                </Card>

                                <Card padding="md">
                                    <h3 className="font-bold mb-4">📈 通勤データ</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-600">ストレス負荷</span>
                                            <span className="font-bold">{currentMethod.stress} / 100</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-600">遅刻リスク</span>
                                            <span className="font-bold">{currentMethodKey === 'train' || currentMethodKey === 'bus' ? '中' : '低'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">通勤距離</span>
                                            <span className="font-bold">{currentUser.commuteDistance || 15} km</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'method' && (
                        <motion.div
                            key="method"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                        >
                            <h3 className="font-bold text-lg mb-4">通勤手段を選ぶ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* 公共交通機関 & 徒歩 */}
                                {(['walk', 'train', 'bus', 'taxi'] as const).map(key => {
                                    const method = COMMUTE_METHODS[key];
                                    const isActive = currentMethodKey === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleMethodChange(key)}
                                            disabled={isActive}
                                            className={`
                                                p-4 rounded-xl border-2 text-left transition-all relative
                                                ${isActive
                                                    ? 'border-indigo-500 bg-indigo-50 cursor-default'
                                                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                                }
                                            `}
                                        >
                                            {isActive && <div className="absolute top-2 right-2 text-xs font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">選択中</div>}
                                            <div className="text-3xl mb-2">{method.emoji}</div>
                                            <div className="font-bold text-lg">{method.name}</div>
                                            <div className="flex justify-between text-sm mt-2 text-gray-500">
                                                <span>⏱️ {method.time}分</span>
                                                <span>💸 {method.cost > 0 ? `${method.cost.toLocaleString()}円/月` : '無料'}</span>
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* 自転車 (所有チェック) */}
                                {ownedVehicles.filter(v => v.type === 'bicycle').map(v => {
                                    const method = COMMUTE_METHODS.bicycle;
                                    const isActive = currentMethodKey === 'bicycle' && currentUser.ownedVehicles?.includes(v.id); // Strictly, we don't store vehicleId in commuteMethod properly yet in types, assuming generic 'bicycle'
                                    // Note: API stores vehicleId only if we expand user model. 
                                    // For now, allow selecting 'bicycle' generally if any owned, OR specific.
                                    // Simplification: Button to use THIS bike
                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => handleMethodChange('bicycle', v.id)}
                                            className={`
                                                p-4 rounded-xl border-2 text-left transition-all border-gray-200 hover:border-green-300 hover:shadow-md bg-green-50
                                            `}
                                        >
                                            <div className="text-3xl mb-2">{v.image}</div>
                                            <div className="font-bold text-lg">{v.name}を使う</div>
                                            <div className="flex justify-between text-sm mt-2 text-gray-500">
                                                <span>⏱️ {method.time}分</span>
                                                <span>💰 無料</span>
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* 車 (所有チェック) */}
                                {ownedVehicles.filter(v => v.type === 'car').map(v => {
                                    const method = COMMUTE_METHODS.car;
                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => handleMethodChange('car', v.id)}
                                            className={`
                                                p-4 rounded-xl border-2 text-left transition-all border-gray-200 hover:border-blue-300 hover:shadow-md bg-blue-50
                                            `}
                                        >
                                            <div className="text-3xl mb-2">{v.image}</div>
                                            <div className="font-bold text-lg">{v.name}を使う</div>
                                            <div className="flex justify-between text-sm mt-2 text-gray-500">
                                                <span>⏱️ {method.time}分</span>
                                                <span>⛽ 維持費あり</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {ownedVehicles.length === 0 && (
                                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                                    💡 自転車や車を購入すると、選択肢が増えます（「車両販売店」タブへ）
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'shop' && (
                        <motion.div
                            key="shop"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {VEHICLE_CATALOG.map(item => {
                                    const isOwned = ownedVehicleIds.includes(item.id);
                                    return (
                                        <Card key={item.id} padding="none" className="overflow-hidden flex flex-col h-full border hover:border-indigo-300 transition-all">
                                            <div className="h-32 bg-gray-100 flex items-center justify-center text-6xl">
                                                {item.image}
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600 mb-1 inline-block">
                                                            {item.type === 'bicycle' ? '自転車' : '自動車'}
                                                        </span>
                                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-4 flex-1">{item.description}</p>

                                                <div className="space-y-2 text-sm text-gray-500 mb-4">
                                                    <div className="flex justify-between">
                                                        <span>速度</span>
                                                        <span className="font-bold">{item.speed} km/h</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>維持費</span>
                                                        <span className="font-bold">{item.maintenanceCost.toLocaleString()}円/月</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => handleBuyVehicle(item)}
                                                    disabled={isOwned || currentUser.balance < item.price}
                                                    variant={isOwned ? 'secondary' : 'primary'}
                                                    fullWidth
                                                >
                                                    {isOwned ? '購入済み' : `${item.price.toLocaleString()}円で購入`}
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
