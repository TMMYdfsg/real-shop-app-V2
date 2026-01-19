'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGame } from '@/context/GameContext';
import { Land, Property } from '@/types';

export default function BankerRealEstatePage() {
    const { gameState } = useGame();
    const [activeTab, setActiveTab] = useState<'lands' | 'properties'>('lands');

    // データはGameStateから取得 (Phase 1)
    const lands = gameState?.lands || [];
    const properties = gameState?.properties || [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">🏠 不動産管理センター</h1>

            {/* タブ切り替え */}
            <div className="flex gap-4 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab('lands')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'lands' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    土地区画 ({lands.length})
                </button>
                <button
                    onClick={() => setActiveTab('properties')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'properties' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    物件リスト ({properties.length})
                </button>
            </div>

            {/* 土地リスト */}
            {activeTab === 'lands' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lands.map((land) => {
                        const owner = gameState?.users.find(u => u.id === land.ownerId);
                        return (
                            <Card key={land.id} padding="md" className="border hover:shadow-lg transition-shadow">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">{land.address}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${land.isForSale ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {land.isForSale ? '販売中' : '売却済'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div>価格: {land.price.toLocaleString()} 枚</div>
                                        <div>所有者: {owner ? owner.name : 'なし (システム管理)'}</div>
                                        <div>広さ: {land.size}m²</div>
                                        <div>用途地域: {land.zoning}</div>
                                    </div>
                                    <div className="pt-2">
                                        <Button variant="outline" size="sm" className="w-full">
                                            詳細・編集 (未実装)
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    {lands.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-500">
                            登録されている土地がありません。
                        </div>
                    )}
                </div>
            )}

            {/* 物件リスト (Properties) */}
            {activeTab === 'properties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((prop) => (
                        <Card key={prop.id} padding="md">
                            <h3 className="font-bold">{prop.name}</h3>
                            <p className="text-sm text-gray-600">{prop.type}</p>
                            <p>価格: {prop.price.toLocaleString()}</p>
                            <p>収益: {prop.income.toLocaleString()}/ターン</p>
                        </Card>
                    ))}
                    {properties.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-500">
                            登録されている物件がありません。
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
