'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { VEHICLE_CATALOG } from '@/lib/gameData';
import { Vehicle } from '@/types';

export default function VehicleShopPage() {
    const params = useParams();
    const router = useRouter();
    const { currentUser, refreshState } = useGame();
    const playerId = params.id as string;

    const [activeTab, setActiveTab] = useState<'bicycle' | 'car'>('bicycle');
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // 免許取得処理
    const handleGetLicense = async () => {
        if (!currentUser) return;
        if (currentUser.balance < 300000) {
            alert('お金が足りません（必要: ¥300,000）');
            return;
        }
        if (!confirm('教習所に通って免許を取得しますか？（費用: ¥300,000）')) return;

        setIsProcessing(true);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'get_license',
                    requesterId: playerId,
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                refreshState();
            } else {
                alert('エラー: ' + data.message);
            }
        } catch (e) {
            console.error(e);
            alert('通信エラー');
        } finally {
            setIsProcessing(false);
        }
    };

    // 車両購入処理
    const handlePurchase = async () => {
        if (!selectedVehicle || !currentUser) return;

        setIsProcessing(true);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'buy_vehicle',
                    requesterId: playerId,
                    details: selectedVehicle.id
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                refreshState();
                setSelectedVehicle(null);
            } else {
                alert('購入失敗: ' + (data.message || data.error));
            }
        } catch (e) {
            console.error(e);
            alert('通信エラー');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!currentUser) return <div className="p-4">Loading...</div>;

    const filteredVehicles = VEHICLE_CATALOG.filter(v => v.type === activeTab);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-gray-600">
                        ← 戻る
                    </button>
                    <h1 className="font-bold text-lg">乗り物ショップ</h1>
                    <div className="w-8" />
                </div>
            </div>

            <main className="max-w-md mx-auto p-4 space-y-6">
                {/* 資金・免許情報 */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                    <div>
                        <div className="text-xs text-gray-500">所持金</div>
                        <div className="font-bold text-xl">¥{currentUser.balance.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">運転免許</div>
                        <div className={`font-bold ${currentUser.hasLicense ? 'text-green-600' : 'text-gray-400'}`}>
                            {currentUser.hasLicense ? '取得済み ✅' : '未取得'}
                        </div>
                    </div>
                </div>

                {/* 免許センター (未取得時) */}
                {!currentUser.hasLicense && (
                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">🔰</div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">運転免許を取得しよう</h3>
                                <p className="text-sm text-gray-600">車を運転するには免許が必要です。</p>
                                <div className="font-bold text-indigo-600 mt-1">費用: ¥300,000</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button
                                fullWidth
                                onClick={handleGetLicense}
                                disabled={currentUser.balance < 300000 || isProcessing}
                            >
                                免許を取得する
                            </Button>
                        </div>
                    </Card>
                )}

                {/* カテゴリータブ */}
                <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
                    <button
                        onClick={() => setActiveTab('bicycle')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'bicycle'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        🚲 自転車
                    </button>
                    <button
                        onClick={() => setActiveTab('car')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'car'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        🚗 自動車
                    </button>
                </div>

                {/* 商品リスト */}
                <div className="grid gap-4">
                    {filteredVehicles.map(vehicle => {
                        const isOwned = currentUser.ownedVehicles?.includes(vehicle.id);
                        const canBuy = currentUser.balance >= vehicle.price;

                        return (
                            <motion.div
                                key={vehicle.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                            >
                                <div className="p-4 flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-4xl shrink-0">
                                        {vehicle.image}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg truncate">{vehicle.name}</h3>
                                            {isOwned && (
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">
                                                    所有済み
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-indigo-600 font-bold text-lg">
                                            ¥{vehicle.price.toLocaleString()}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {vehicle.description}
                                        </p>

                                        {/* スペック */}
                                        <div className="mt-2 flex gap-3 text-xs text-gray-500">
                                            <div>💨 速度: {vehicle.speed}</div>
                                            {vehicle.fuelConsumption && (
                                                <div>⛽ 燃費: {vehicle.fuelConsumption}</div>
                                            )}
                                            <div>🔧 維持費: ¥{vehicle.maintenanceCost.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 pb-4">
                                    <Button
                                        fullWidth
                                        variant={isOwned ? 'secondary' : 'primary'}
                                        disabled={isOwned || (!canBuy && !isOwned)}
                                        onClick={() => setSelectedVehicle(vehicle)}
                                    >
                                        {isOwned ? '購入済み' : canBuy ? '詳細・購入' : 'お金が足りません'}
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>

            {/* 購入確認モーダル */}
            <Modal
                isOpen={!!selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
                title="購入確認"
            >
                {selectedVehicle && (
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <div className="text-6xl mb-2">{selectedVehicle.image}</div>
                            <h3 className="text-xl font-bold">{selectedVehicle.name}</h3>
                            <div className="text-2xl font-bold text-indigo-600 mt-2">
                                ¥{selectedVehicle.price.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span>速度効果</span>
                                <span className="font-bold">{selectedVehicle.speed} (通勤時間短縮)</span>
                            </div>
                            <div className="flex justify-between">
                                <span>故障・事故率</span>
                                <span className="font-bold">{100 - selectedVehicle.reliability}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>維持費・修理費</span>
                                <span className="font-bold">¥{selectedVehicle.maintenanceCost.toLocaleString()}〜</span>
                            </div>
                            {selectedVehicle.type === 'car' && (
                                <div className="text-xs text-red-500 mt-2">
                                    ※購入時に駐車場契約が含まれます。また、ガソリン代が別途かかります。
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button fullWidth onClick={handlePurchase} isLoading={isProcessing}>
                                購入する
                            </Button>
                            <Button fullWidth variant="ghost" onClick={() => setSelectedVehicle(null)}>
                                キャンセル
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
