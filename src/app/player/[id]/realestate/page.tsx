'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// CityMapを動的インポート（SSRエラー回避）
const CityMap = dynamic(() => import('@/components/map/CityMap'), {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">マップを読み込み中...</div>
});

interface SearchResult {
    lat: string;
    lon: string;
    display_name: string;
    address: {
        city?: string;
        town?: string;
        village?: string;
        country?: string;
    };
}

export default function RealEstatePage() {
    const { gameState, currentUser } = useGame();
    const [activeTab, setActiveTab] = useState<'lands' | 'properties' | 'search'>('lands');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState(0);

    const handleBuy = async (propertyId: string) => {
        if (!confirm('この不動産を購入しますか？')) return;

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'buy_property',
                requesterId: currentUser?.id,
                details: propertyId
            })
        });
    };

    // 住所検索（OpenStreetMap Nominatim API）
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`,
                {
                    headers: {
                        'User-Agent': 'RealShopApp/1.0'
                    }
                }
            );
            const data = await response.json();

            if (data && data.length > 0) {
                setSearchResult(data[0]);
                // 価格計算（緯度経度ベース + ランダム要素）
                const basePrice = 100000;
                const locationFactor = Math.abs(parseFloat(data[0].lat)) * Math.abs(parseFloat(data[0].lon));
                const randomFactor = Math.random() * 50000 + 50000;
                setEstimatedPrice(Math.floor(basePrice + (locationFactor % 100000) + randomFactor));
            } else {
                alert('住所が見つかりませんでした。別の検索語を試してください。');
                setSearchResult(null);
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('検索中にエラーが発生しました。');
        } finally {
            setIsSearching(false);
        }
    };

    // 住所指定購入
    const handleAddressPurchase = async () => {
        if (!searchResult || !currentUser) return;

        if (currentUser.balance < estimatedPrice) {
            alert('所持金が足りません！');
            return;
        }

        if (!confirm(`${searchResult.display_name}\nこの住所の土地を ${estimatedPrice.toLocaleString()}円 で購入しますか？`)) {
            return;
        }

        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'city_buy_address',
                    requesterId: currentUser.id,
                    details: JSON.stringify({
                        address: searchResult.display_name,
                        location: {
                            lat: searchResult.lat,
                            lng: searchResult.lon
                        },
                        polygon: null, // オプション
                        price: estimatedPrice
                    }),
                    amount: estimatedPrice
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('土地を購入しました！');
                setSearchResult(null);
                setSearchQuery('');
                setActiveTab('lands');
            } else {
                alert(`購入に失敗しました: ${data.message || '不明なエラー'}`);
            }
        } catch (error) {
            console.error('Purchase error:', error);
            alert('購入処理中にエラーが発生しました。');
        }
    };

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const lands = gameState.lands || [];
    const properties = gameState.properties || [];

    return (
        <div className="pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    🏠 不動産センター
                </h2>

                {/* タブ切り替え */}
                <div className="flex gap-4 border-b border-gray-200 pb-2 mb-4">
                    <button
                        onClick={() => setActiveTab('lands')}
                        className={`px-4 py-2 font-semibold ${activeTab === 'lands' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        土地 ({lands.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('properties')}
                        className={`px-4 py-2 font-semibold ${activeTab === 'properties' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        物件 ({properties.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-4 py-2 font-semibold ${activeTab === 'search' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🔍 住所検索
                    </button>
                </div>

                {/* 土地リスト */}
                {activeTab === 'lands' && (
                    <div className="space-y-4">
                        {lands.map((land: any) => {
                            const isOwned = !!land.ownerId;
                            const isMyProperty = land.ownerId === currentUser.id;
                            const ownerName = isOwned
                                ? gameState.users.find(u => u.id === land.ownerId)?.name
                                : '販売中';

                            const handleLandBuy = async () => {
                                if (!confirm(`${land.address} を購入しますか？`)) return;
                                await fetch('/api/action', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        type: 'city_buy_land',
                                        requesterId: currentUser.id,
                                        details: land.id
                                    })
                                });
                            };

                            return (
                                <Card key={land.id} padding="md" className={`border-l-4 ${isMyProperty ? 'border-green-500' : isOwned ? 'border-red-500' : 'border-blue-500'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold">{land.address}</h3>
                                            <div className="text-sm text-gray-500">{land.zoning} / {land.size}m²</div>
                                        </div>
                                        {isMyProperty ? (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">所有済</span>
                                        ) : isOwned ? (
                                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">売切れ</span>
                                        ) : (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">販売中</span>
                                        )}
                                    </div>

                                    <div className="text-sm mb-4 bg-gray-50 p-3 rounded">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">価格</span>
                                            <span className="font-bold text-lg">{land.price.toLocaleString()}枚</span>
                                        </div>
                                    </div>

                                    {!isOwned && (
                                        <Button
                                            fullWidth
                                            variant="primary"
                                            disabled={currentUser.balance < land.price}
                                            onClick={handleLandBuy}
                                        >
                                            購入する
                                        </Button>
                                    )}
                                    {isOwned && !isMyProperty && (
                                        <div className="text-right text-sm text-gray-500">
                                            所有者: {ownerName}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                        {lands.length === 0 && <div className="text-gray-500">販売中の土地はありません。</div>}
                    </div>
                )}

                {/* 物件リスト */}
                {activeTab === 'properties' && (
                    <div className="space-y-4">
                        {properties.map((prop: any) => {
                            const isOwned = !!prop.ownerId;
                            const isMyProperty = prop.ownerId === currentUser.id;
                            const ownerName = isOwned
                                ? gameState.users.find(u => u.id === prop.ownerId)?.name
                                : '販売中';

                            return (
                                <Card key={prop.id} padding="md" className={`border-l-4 ${isMyProperty ? 'border-green-500' : isOwned ? 'border-red-500' : 'border-blue-500'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold">{prop.name}</h3>
                                            <div className="text-sm text-gray-500">{prop.type}</div>
                                        </div>
                                        {isMyProperty ? (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">所有済</span>
                                        ) : isOwned ? (
                                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">売切れ</span>
                                        ) : (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">販売中</span>
                                        )}
                                    </div>

                                    <p className="text-sm mb-4 text-gray-600">{prop.description}</p>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-gray-50 p-3 rounded">
                                        <div>
                                            <span className="block text-gray-500 text-xs">価格</span>
                                            <span className="font-bold text-lg">{prop.price.toLocaleString()}枚</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs">収支/ターン</span>
                                            <span className={`font-bold text-lg ${prop.income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {prop.income >= 0 ? '+' : ''}{prop.income.toLocaleString()}枚
                                            </span>
                                        </div>
                                    </div>

                                    {!isOwned && (
                                        <Button
                                            fullWidth
                                            variant="primary"
                                            disabled={currentUser.balance < prop.price}
                                            onClick={() => handleBuy(prop.id)}
                                        >
                                            購入する ({prop.price.toLocaleString()}枚)
                                        </Button>
                                    )}
                                    {isOwned && !isMyProperty && (
                                        <div className="text-right text-sm text-gray-500">
                                            オーナー: {ownerName}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                        {properties.length === 0 && <div className="text-gray-500">販売中の物件はありません。</div>}
                    </div>
                )}

                {/* 住所検索タブ */}
                {activeTab === 'search' && (
                    <div className="space-y-6">
                        <Card padding="lg">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                🔍 住所で土地を探す
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                世界中の住所を検索して、その場所の土地を購入できます。
                            </p>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="例: 東京都千代田区丸の内"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <Button
                                    variant="primary"
                                    onClick={handleSearch}
                                    disabled={isSearching || !searchQuery.trim()}
                                    className="px-6"
                                >
                                    {isSearching ? '検索中...' : '検索'}
                                </Button>
                            </div>

                            {searchResult && (
                                <div className="mt-6 space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <h4 className="font-bold text-blue-900 mb-2">📍 検索結果</h4>
                                        <p className="text-sm text-blue-800">{searchResult.display_name}</p>
                                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-blue-700">
                                            <div>緯度: {parseFloat(searchResult.lat).toFixed(6)}</div>
                                            <div>経度: {parseFloat(searchResult.lon).toFixed(6)}</div>
                                        </div>
                                    </div>

                                    {/* マップ表示 */}
                                    <div className="h-96 rounded-xl overflow-hidden border border-gray-200">
                                        <CityMap
                                            initialLat={parseFloat(searchResult.lat)}
                                            initialLng={parseFloat(searchResult.lon)}
                                            zoom={16}
                                        />
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-600 font-semibold">推定価格</span>
                                            <span className="text-2xl font-bold text-indigo-600">{estimatedPrice.toLocaleString('ja-JP')}円</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                            <span>現在の所持金</span>
                                            <span className="font-semibold">{currentUser.balance.toLocaleString('ja-JP')}円</span>
                                        </div>
                                        <Button
                                            fullWidth
                                            variant="primary"
                                            size="lg"
                                            disabled={currentUser.balance < estimatedPrice}
                                            onClick={handleAddressPurchase}
                                        >
                                            {currentUser.balance < estimatedPrice ? '所持金不足' : 'この土地を購入する'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
