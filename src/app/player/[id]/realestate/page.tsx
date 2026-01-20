'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PlaceConstructionModal } from '@/components/map/PlaceConstructionModal';
import { JapanPrefectureModal } from '@/components/map/JapanPrefectureModal';
import { BuildingCategory, CompanyType } from '@/types';

// CityMapを動的インポート（SSRエラー回避）
const CityMap = dynamic(() => import('@/components/map/CityMap'), {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">Loading Map...</div>
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

// 国名から地域IDを導出
const COUNTRY_REGION_MAP: Record<string, string> = {
    "日本": "region_asia", "中国": "region_asia", "インド": "region_asia", "韓国": "region_asia", "タイ": "region_asia",
    "ベトナム": "region_asia", "フィリピン": "region_asia", "インドネシア": "region_asia", "マレーシア": "region_asia",
    "オーストラリア": "region_oceania", "ニュージーランド": "region_oceania",
    "アメリカ合衆国": "region_north_america", "カナダ": "region_north_america", "メキシコ": "region_north_america",
    "ブラジル": "region_south_america", "アルゼンチン": "region_south_america", "チリ": "region_south_america",
    "イギリス": "region_europe", "フランス": "region_europe", "ドイツ": "region_europe", "イタリア": "region_europe", "スペイン": "region_europe",
    "ナイジェリア": "region_africa", "エジプト": "region_africa", "南アフリカ": "region_africa", "ケニア": "region_africa"
};

const getRegionId = (land: { id: string; address: string; regionId?: string }): string | undefined => {
    if (land.regionId) return land.regionId;
    if (land.id.startsWith('region_')) return land.id;
    if (!land.id.startsWith('country_') && !land.id.startsWith('region_')) return 'japan';
    if (land.id.startsWith('country_')) {
        const countryName = land.id.replace('country_', '');
        return COUNTRY_REGION_MAP[countryName] || undefined;
    }
    return COUNTRY_REGION_MAP[land.address] || undefined;
};

// 土地詳細モーダル (Animated)
const LandDetailModal = ({ land, onClose, onBuy, onBuild, isOwned, isMyProperty, ownerName, canBuy }: { land: any, onClose: () => void, onBuy: () => void, onBuild: () => void, isOwned: boolean, isMyProperty: boolean, ownerName: string, canBuy: boolean }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 relative shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 text-6xl">
                        🏰
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors">
                        ✕
                    </button>
                    <div className="absolute bottom-4 left-4 text-white">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">{getRegionId(land)}</span>
                        <h2 className="text-2xl font-black shadow-black/50 drop-shadow-md">{land.address}</h2>
                    </div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 font-bold uppercase">Price</p>
                            <p className="text-xl font-bold text-indigo-600">{land.price.toLocaleString()}<span className="text-xs ml-1">枚</span></p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 font-bold uppercase">Size</p>
                            <p className="text-xl font-bold text-gray-700">{land.size || 100}<span className="text-xs ml-1">m²</span></p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 font-bold uppercase">Zoning</p>
                            <p className="font-bold text-gray-700">{land.zoning || 'Residential'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 font-bold uppercase">Owner</p>
                            <p className={`font-bold ${isOwned ? 'text-green-600' : 'text-blue-500'}`}>
                                {isOwned ? ownerName : '販売中'}
                            </p>
                        </div>
                    </div>

                    {isMyProperty && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                                ✅ あなたの所有地です
                            </h4>
                            <p className="text-xs text-green-700">この土地に建物を建設したり、売却することができます。</p>
                        </div>
                    )}

                    {!isOwned && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                💎 購入可能
                            </h4>
                            <p className="text-xs text-blue-700">この土地を購入して、不動産ビジネスを始めましょう。</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 flex flex-col gap-3">
                    {!isOwned && (
                        <Button
                            fullWidth
                            variant="primary"
                            onClick={onBuy}
                            disabled={!canBuy}
                            className="h-12 text-lg font-bold shadow-lg shadow-indigo-200"
                        >
                            {canBuy ? '購入する' : '資金不足'}
                        </Button>
                    )}
                    {isMyProperty && (
                        <Button
                            fullWidth
                            variant="secondary"
                            onClick={onBuild}
                            className="h-12 font-bold"
                        >
                            🏗️ 建設する
                        </Button>
                    )}
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        閉じる
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function RealEstatePage() {
    const { gameState, currentUser, refresh } = useGame();
    const [activeTab, setActiveTab] = useState<'lands' | 'properties' | 'search'>('lands');

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState(0);

    // Construction Modal State
    const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);
    const [isJapanModalOpen, setIsJapanModalOpen] = useState(false);
    const [selectedLandForBuild, setSelectedLandForBuild] = useState<any>(null);
    const [selectedDetailLand, setSelectedDetailLand] = useState<any>(null);

    // Regional Filter State
    const [activeRegion, setActiveRegion] = useState<string>('japan');
    const [landSearchTerm, setLandSearchTerm] = useState('');


    const handleOpenBuildModal = (land: any) => {
        setSelectedLandForBuild(land);
        setIsConstructionModalOpen(true);
    };

    const handleBuildSubmit = async (name: string, type: BuildingCategory, companyType?: CompanyType) => {
        if (!selectedLandForBuild || !currentUser) return;

        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'city_build_place',
                    requesterId: currentUser.id,
                    details: JSON.stringify({
                        landId: selectedLandForBuild.id,
                        buildingType: type,
                        buildingName: name,
                        companyType: companyType
                    })
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                refresh();
                setIsConstructionModalOpen(false);
                setSelectedLandForBuild(null);
            } else {
                alert(`建設失敗: ${data.message}`);
            }
        } catch (e) {
            console.error(e);
            alert('建設エラー');
        }
    };

    const handleBuy = async (propertyId: string) => {
        if (!confirm('この物件を購入しますか？')) return;
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'buy_property',
                    requesterId: currentUser?.id ?? 'guest',
                    details: propertyId
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert('購入しました！');
                refresh();
            } else {
                alert(`購入失敗: ${data.message}`);
            }
        } catch (e) {
            console.error(e);
            alert('購入エラー');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                setSearchResult(data[0]);
                setEstimatedPrice(Math.floor(Math.random() * 5000000) + 1000000);
            } else {
                alert('見つかりませんでした');
                setSearchResult(null);
            }
        } catch (e) {
            console.error(e);
            alert('検索エラー');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddressPurchase = async () => {
        if (!searchResult || !currentUser) return;
        if (!confirm(`${searchResult.display_name} を購入しますか？`)) return;

        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'city_buy_land',
                    requesterId: currentUser.id,
                    details: searchResult.display_name,
                    amount: estimatedPrice
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('購入しました！');
                setSearchResult(null);
                setSearchQuery('');
                refresh();
            } else {
                alert(data.message || '購入失敗');
            }
        } catch (e) {
            console.error(e);
            alert('購入エラー');
        }
    };

    if (!gameState || !currentUser) return <div className="p-8 text-center text-gray-500 font-bold">Loading...</div>;

    // Sort lands: My Lands first, then others
    const lands = [...(gameState.lands || [])].sort((a: any, b: any) => {
        if (a.ownerId === currentUser.id && b.ownerId !== currentUser.id) return -1;
        if (a.ownerId !== currentUser.id && b.ownerId === currentUser.id) return 1;
        return 0;
    });

    const properties = gameState.properties || [];

    return (
        <div className="pb-24 p-4 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-gray-800">
                    🏠 不動産センター
                </h2>

                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                    {(['lands', 'properties', 'search'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === tab ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'lands' ? '土地' : tab === 'properties' ? '物件' : '検索'}
                        </button>
                    ))}
                </div>

                {/* 土地リスト */}
                {activeTab === 'lands' && (
                    <div className="space-y-4">
                        {/* Regional Tabs */}
                        <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-lg">
                            {[
                                { id: 'japan', name: '🇯🇵 日本' },
                                { id: 'region_asia', name: '🌏 アジア' },
                                { id: 'region_europe', name: '🇪🇺 欧州' },
                                { id: 'region_africa', name: '🌍 アフリカ' },
                                { id: 'region_oceania', name: '🇦🇺 オセアニア' },
                                { id: 'region_north_america', name: '🇺🇸 北米' },
                                { id: 'region_south_america', name: '🇧🇷 南米' },
                                { id: 'all', name: '🌐 すべて' }
                            ].map(reg => (
                                <button
                                    key={reg.id}
                                    onClick={() => setActiveRegion(reg.id)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeRegion === reg.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                                >
                                    {reg.name}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="国名、都道府県名で検索..."
                                className="w-full p-2 pl-9 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={landSearchTerm}
                                onChange={e => setLandSearchTerm(e.target.value)}
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                            {landSearchTerm && (
                                <button
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    onClick={() => setLandSearchTerm('')}
                                >✕</button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                                let filtered = lands;

                                // 地域フィルター
                                if (activeRegion !== 'all') {
                                    filtered = filtered.filter(l => {
                                        const landRegion = getRegionId(l);
                                        if (activeRegion === 'japan') {
                                            return l.id === 'country_日本' || landRegion === 'japan';
                                        }
                                        return landRegion === activeRegion;
                                    });
                                }

                                // 検索フィルター
                                if (landSearchTerm) {
                                    const s = landSearchTerm.toLowerCase();
                                    filtered = filtered.filter(l =>
                                        l.address.toLowerCase().includes(s) ||
                                        l.id.toLowerCase().includes(s)
                                    );
                                }

                                if (filtered.length === 0) {
                                    return <div className="col-span-full p-8 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">候補が見つかりません</div>;
                                }

                                return filtered.slice(0, 50).map((land: any) => {
                                    const isOwned = !!land.ownerId && land.ownerId !== 'public' && land.ownerId !== '';
                                    const isMyProperty = land.ownerId === currentUser.id;
                                    const place = gameState.places?.find(p => p.id === land.placeId);

                                    return (
                                        <Card
                                            key={land.id}
                                            className={`overflow-hidden border-2 transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${isMyProperty ? 'border-green-500 shadow-md bg-green-50/10' : 'border-transparent'}`}
                                            padding="md"
                                            onClick={() => setSelectedDetailLand(land)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">
                                                        {place ? '🏙️' : (isMyProperty ? '🏠' : '🏞️')}
                                                    </span>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 line-clamp-1">{land.address}</h3>
                                                        <span className="text-xs text-gray-400 font-mono">{land.id}</span>
                                                    </div>
                                                </div>
                                                {isMyProperty ? (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">所有済</span>
                                                ) : isOwned ? (
                                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">売切れ</span>
                                                ) : (
                                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">販売中</span>
                                                )}
                                            </div>

                                            <div className="mt-4 flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase">Price</p>
                                                    <p className="text-xl font-bold text-indigo-600">{land.price.toLocaleString()}<span className="text-xs ml-1">枚</span></p>
                                                </div>
                                                <div className="text-right">
                                                    {place && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">{place.name}</span>}
                                                </div>
                                            </div>

                                            {!place && !isMyProperty && (
                                                <div className="mt-3 text-center text-xs text-indigo-500 font-bold border-t border-indigo-50 pt-2">
                                                    タップで詳細を表示
                                                </div>
                                            )}
                                        </Card>
                                    );
                                });

                            })()}
                        </div>
                    </div>
                )}

                {activeTab === 'properties' && (
                    <div className="space-y-4">
                        {properties.map((prop: any) => {
                            const isOwned = !!prop.ownerId;
                            const isMyProperty = prop.ownerId === currentUser.id;
                            const ownerName = isOwned ? gameState.users.find(u => u.id === prop.ownerId)?.name : '販売中';
                            return (
                                <Card key={prop.id} className={`overflow-hidden border-2 transition-all ${isMyProperty ? 'border-green-500 shadow-md' : 'border-transparent'}`} padding="md">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{prop.name}</h3>
                                            <p className="text-xs text-gray-500">{prop.type}</p>
                                        </div>
                                        {isMyProperty && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">所有済</span>}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">{prop.description}</p>
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price</p>
                                            <p className="font-bold text-indigo-600">{prop.price.toLocaleString()}枚</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Income/Turn</p>
                                            <p className="font-bold text-green-600">+{prop.income.toLocaleString()}枚</p>
                                        </div>
                                    </div>
                                    {!isOwned && (
                                        <Button className="mt-4" fullWidth onClick={() => handleBuy(prop.id)} disabled={currentUser.balance < prop.price}>購入する</Button>
                                    )}
                                    {isOwned && !isMyProperty && (
                                        <p className="text-xs text-right text-gray-400 mt-2 italic">Owner: {ownerName}</p>
                                    )}
                                </Card>
                            );
                        })}
                        {properties.length === 0 && <p className="text-center text-gray-400 py-10 font-bold">投資物件が見つかりません。</p>}
                    </div>
                )}

                {activeTab === 'search' && (
                    <div className="space-y-4">
                        <Card padding="lg">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">🔍 住所で土地を探す</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="住所を入力してください..."
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleSearch} disabled={isSearching}>
                                    {isSearching ? '...' : '検索'}
                                </Button>
                            </div>

                            {searchResult && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 space-y-4">
                                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                                        <p className="text-xs font-bold text-indigo-900 leading-relaxed">{searchResult.display_name}</p>
                                    </div>

                                    <div className="h-64 rounded-xl overflow-hidden border border-gray-100">
                                        <CityMap initialLat={parseFloat(searchResult.lat)} initialLng={parseFloat(searchResult.lon)} zoom={16} />
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Purchase Fee</p>
                                            <p className="text-xl font-bold text-indigo-600">{estimatedPrice.toLocaleString()}<span className="text-xs ml-1">枚</span></p>
                                        </div>
                                        <Button variant="primary" onClick={handleAddressPurchase} disabled={currentUser.balance < estimatedPrice}>
                                            {currentUser.balance < estimatedPrice ? '資金不足' : '購入する'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </Card>
                    </div>
                )}
            </motion.div>

            <PlaceConstructionModal
                isOpen={isConstructionModalOpen}
                onClose={() => setIsConstructionModalOpen(false)}
                land={selectedLandForBuild}
                onBuild={handleBuildSubmit}
            />

            <JapanPrefectureModal
                isOpen={isJapanModalOpen}
                onClose={() => setIsJapanModalOpen(false)}
                prefectures={gameState.lands.filter(l => !l.id.startsWith('country_'))}
                currentBalance={currentUser.balance}
                onSelect={(prefecture) => {
                    setIsJapanModalOpen(false);
                    // 選択された都道府県を購入する
                    (async () => {
                        if (!confirm(`${prefecture.address} を購入しますか？`)) return;
                        try {
                            const res = await fetch('/api/action', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    type: 'city_buy_land',
                                    requesterId: currentUser.id,
                                    details: prefecture.id,
                                    amount: prefecture.price
                                })
                            });
                            const data = await res.json();
                            if (data.success) {
                                alert(data.message);
                                refresh();
                            } else {
                                alert(`購入失敗: ${data.message}`);
                            }
                        } catch (e) {
                            console.error(e);
                            alert('購入エラー');
                        }
                    })();
                }}
            />

            {/* Detailed Land Modal */}
            <AnimatePresence>
                {selectedDetailLand && (
                    <LandDetailModal
                        land={selectedDetailLand}
                        onClose={() => setSelectedDetailLand(null)}
                        isOwned={!!selectedDetailLand.ownerId}
                        isMyProperty={selectedDetailLand.ownerId === currentUser.id}
                        ownerName={selectedDetailLand.ownerId ? gameState.users.find(u => u.id === selectedDetailLand.ownerId)?.name || '未知の所有者' : '販売中'}
                        canBuy={currentUser.balance >= selectedDetailLand.price}
                        onBuy={() => {
                            if (selectedDetailLand.id === 'country_日本') {
                                setSelectedDetailLand(null);
                                setIsJapanModalOpen(true);
                            } else {
                                setSelectedDetailLand(null); // Close this modal
                                // Need to trigger buy logic. Since I don't have handleLandBuy exposed or generic enough here (it was creating closures in the loop), 
                                // I will replicate the simple buy fetch here or assume existing handleLandBuy works if it doesn't depend on closure.
                                // The previous loop used handleLandBuy which was NOT defined in the snippets I saw!
                                // Wait, handleLandBuy was NOT visually present in the loop snippets I replaced. 
                                // Ah, in the original file view, lines 345 calls handleLandBuy().
                                // Where is handleLandBuy defined?
                                // I need to verify if handleLandBuy is defined in the component scope.
                                // If not, I must implement it inline here.
                                (async () => {
                                    if (!confirm(`${selectedDetailLand.address} を購入しますか？`)) return;
                                    try {
                                        const res = await fetch('/api/action', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                type: 'city_buy_land',
                                                requesterId: currentUser.id,
                                                details: selectedDetailLand.id,
                                                amount: selectedDetailLand.price
                                            })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            alert(data.message);
                                            refresh();
                                        } else {
                                            alert(`購入失敗: ${data.message}`);
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        alert('購入エラー');
                                    }
                                })();
                            }
                        }}
                        onBuild={() => {
                            setSelectedDetailLand(null);
                            handleOpenBuildModal(selectedDetailLand);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
