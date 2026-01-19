'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Land, PlaceType } from '@/types';
import { generateLands } from '@/lib/cityData';
import { Button } from '@/components/ui/Button';
import { LandPurchaseModal } from '@/components/map/LandPurchaseModal';
import { PlaceConstructionModal } from '@/components/map/PlaceConstructionModal';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';

// Leaflet Icon Fix associated with Webpack/Next.js
// Referencing the Zenn article suggestion for simplicity
L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/';

interface CityMapProps {
    initialLat?: number;
    initialLng?: number;
    zoom?: number;
    onLandSelect?: (land: Land) => void;
}

type CommuteMode = 'walk' | 'bicycle' | 'car' | 'train';

// Initial View Controller
const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

export default function CityMap({
    initialLat = 35.681236,
    initialLng = 139.767125,
    zoom = 15,
    onLandSelect
}: CityMapProps) {
    const router = useRouter();
    const { currentUser, gameState, refresh } = useGame();
    const [lands, setLands] = useState<Land[]>([]);
    const [selectedLandId, setSelectedLandId] = useState<string | null>(null);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);

    // UI State
    const [isMapOnly, setIsMapOnly] = useState(true);
    const [searchAddress, setSearchAddress] = useState('');

    // Load Lands
    useEffect(() => {
        const baseLands = gameState?.lands && gameState.lands.length > 0
            ? [...gameState.lands]
            : generateLands();

        if (currentUser && currentUser.ownedLands) {
            baseLands.forEach(l => {
                if (currentUser.ownedLands.includes(l.id)) {
                    l.ownerId = currentUser.id;
                    l.isForSale = false;
                }
            });
        }
        setLands(baseLands);
    }, [currentUser, gameState?.lands]);

    const handleLandClick = (land: Land) => {
        setSelectedLandId(land.id);
        if (onLandSelect) onLandSelect(land);
    };

    const handlePurchase = async (land: Land) => {
        if (!currentUser) return;
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'city_buy_land',
                    requesterId: currentUser.id,
                    details: land.id,
                    amount: land.price
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('土地を購入しました！');
                setIsPurchaseModalOpen(false);
                setSelectedLandId(null);
                refresh();
            } else {
                alert(`購入失敗: ${data.message}`);
            }
        } catch (error) {
            console.error('Purchase error:', error);
        }
    };

    const handleBuild = async (name: string, type: PlaceType) => {
        if (!currentUser || !selectedLandId) return;
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'city_build_place',
                    requesterId: currentUser.id,
                    details: JSON.stringify({ landId: selectedLandId, name, type })
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('施設の建設を開始しました！');
                setIsConstructionModalOpen(false);
                setSelectedLandId(null);
                refresh();
            } else {
                alert(`建設失敗: ${data.message}`);
            }
        } catch (error) {
            console.error('Build error:', error);
        }
    };

    const buyVehicle = async (type: 'car' | 'bicycle', price: number) => {
        if (!currentUser) return;
        if (currentUser.balance < price) {
            alert('所持金が足りません！');
            return;
        }
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'buy_vehicle',
                    requesterId: currentUser.id,
                    details: type === 'car' ? 'car_sedan' : 'bicycle_road',
                    amount: price
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`${type === 'car' ? 'セダン' : 'ロードバイク'}を購入しました！`);
                refresh();
            } else {
                alert(`購入失敗: ${data.message}`);
            }
        } catch (error) {
            console.error('Vehicle purchase error:', error);
        }
    };

    const selectedLand = lands.find(l => l.id === selectedLandId);

    // Helpers for rendering icons
    const getPlaceIcon = (place: any) => {
        const isConstruction = place.status === 'construction';
        let iconText = '🏢';
        if (place.id === 'place_dealer') iconText = '🚗';
        else if (place.id === 'place_homecenter') iconText = '🚲';
        else if (isConstruction) iconText = '🚧';
        else {
            if (place.type === 'restaurant') iconText = '🍽️';
            else if (place.type === 'retail') iconText = '🏪';
            else if (place.type === 'service') iconText = '💇';
            else if (place.type === 'factory') iconText = '🏭';
        }
        // Leaflet DivIcon to render emoji as marker
        return L.divIcon({
            html: `<div style="font-size: 30px; line-height: 1;">${iconText}</div>`,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });
    };

    return (
        <div className="fixed inset-0 w-full h-full bg-slate-100 z-0 overflow-hidden">
            <MapContainer
                center={[initialLat, initialLng]}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Ensure map updates when props change */}
                <MapController center={[initialLat, initialLng]} zoom={zoom} />

                {/* Render Lands (Polygons) */}
                {lands.map(land => {
                    const isSpecial = land.id === '5-5' || land.id === '5-15';
                    const isOwned = land.ownerId === currentUser?.id;

                    if (!isSpecial && !isOwned && !land.polygon) return null;
                    if (!land.polygon) return null;

                    const fillColor = land.id === '5-5' ? '#3b82f6' : land.id === '5-15' ? '#10b981' : '#10b981';
                    const positions: [number, number][] = land.polygon.map(p => [p.lat, p.lng]);

                    return (
                        <Polygon
                            key={land.id}
                            positions={positions}
                            pathOptions={{
                                color: isSpecial ? '#2563eb' : '#059669',
                                fillColor: fillColor,
                                fillOpacity: 0.5,
                                weight: 2
                            }}
                            eventHandlers={{
                                click: () => handleLandClick(land)
                            }}
                        />
                    );
                })}

                {/* Render Places (Markers) */}
                {gameState?.places?.map(place => (
                    <Marker
                        key={place.id}
                        position={[place.location.lat, place.location.lng]}
                        icon={getPlaceIcon(place)}
                    >
                        <Popup>{place.name}</Popup>
                    </Marker>
                ))}

            </MapContainer>

            {/* Right Sidebar UI Stack */}
            {!isMapOnly && (
                <div className="absolute top-4 right-4 z-[1002] flex flex-col items-end gap-3 pointer-events-none">
                    {/* 1. Map Only Toggle */}
                    <div className="pointer-events-auto flex flex-col items-center">
                        <Button
                            variant="secondary"
                            className="rounded-full shadow-lg font-black w-12 h-12 flex items-center justify-center text-xl bg-white border-2 border-gray-100"
                            onClick={() => setIsMapOnly(true)}
                            title="マップのみ表示"
                        >
                            🗺️
                        </Button>
                        <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-1.5 py-0.5 rounded-full shadow-sm -mt-2 z-10">マップのみ</span>
                    </div>

                    {/* 2. Address Search (Placeholder for now as no Google API) */}
                    <div className="pointer-events-auto w-64 bg-white shadow-xl rounded-xl p-1.5 border border-gray-100 flex flex-col gap-2">
                        <input
                            type="text"
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            placeholder="住所検索 (未実装)"
                            className="w-full bg-gray-50 px-3 py-2 rounded-lg outline-none text-xs font-bold text-gray-800"
                            disabled
                        />
                        <Button
                            variant="primary"
                            size="sm"
                            className="w-full rounded-lg font-black text-xs h-8"
                            disabled
                        >
                            OpenStreetMapで検索
                        </Button>
                    </div>

                    {/* 3. Commute Button (Simplified) */}
                    <div className="pointer-events-auto">
                        <Button variant="primary" size="lg" className="shadow-xl rounded-full px-6 flex items-center gap-2 font-bold" onClick={() => alert('通勤機能は調整中です')}>
                            🏢 仕事場へ行く
                        </Button>
                    </div>

                    {/* 4. Back Button & Status */}
                    <div className="pointer-events-auto bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-4 border border-gray-100 w-48">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs font-bold text-gray-500 hover:text-gray-800 mb-3"
                            onClick={() => router.back()}
                        >
                            ← 戻る
                        </Button>

                        <div className="space-y-3">
                            <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">所持金</div>
                                <div className="font-black text-lg text-indigo-600 tracking-tight text-right">
                                    {currentUser?.balance?.toLocaleString()}<span className="text-xs text-gray-500 ml-0.5">円</span>
                                </div>
                            </div>
                            <div className="w-full h-px bg-gray-100" />
                            <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">所有物件</div>
                                <div className="font-black text-lg text-gray-700 tracking-tight text-right">
                                    {currentUser?.ownedLands?.length || 0}<span className="text-xs text-gray-500 ml-0.5">区画</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Only Restore Button */}
            {isMapOnly && (
                <div className="absolute top-4 right-2 z-[1002]">
                    <Button
                        variant="primary"
                        className="rounded-xl shadow-2xl font-black px-5 py-3 flex items-center gap-2 text-sm border-2 border-white/50 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                        onClick={() => setIsMapOnly(false)}
                        title="UIを表示"
                    >
                        👁️ View
                    </Button>
                </div>
            )}

            {/* Selection Overlay */}
            {selectedLand && !isMapOnly && (
                <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 z-[1001]">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-extrabold text-xl flex items-center gap-2">
                            {selectedLand.id === '5-5' ? '🚗 ディーラー' : selectedLand.id === '5-15' ? '🚲 ホームセンター' : '📍 土地情報'}
                        </h3>
                        <button onClick={() => setSelectedLandId(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">✕</button>
                    </div>

                    {selectedLand.id === '5-5' ? (
                        <div className="space-y-4">
                            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-6xl shadow-inner font-black text-white/50 relative overflow-hidden">🚗</div>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">丸の内正規ディーラー：最高の一台をご提案します。自家用車でワンランク上の通勤を。</p>
                            <Button fullWidth variant={currentUser?.ownedVehicles?.some(id => id.startsWith('car')) ? 'outline' : 'primary'} size="lg" className="rounded-xl h-12 font-bold" onClick={() => buyVehicle('car', 3000000)}>
                                {currentUser?.ownedVehicles?.some(id => id.startsWith('car')) ? '✅ 所有済み' : '契約書にサインする (300万円)'}
                            </Button>
                        </div>
                    ) : selectedLand.id === '5-15' ? (
                        <div className="space-y-4">
                            <div className="aspect-video bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl flex items-center justify-center text-6xl shadow-inner font-black text-white/50">🚲</div>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">丸の内ホームセンター：電動アシスト自転車。坂道もラクラク、健康的な通勤スタイルを。</p>
                            <Button fullWidth variant={currentUser?.ownedVehicles?.some(id => id.startsWith('bicycle')) ? 'outline' : 'success'} size="lg" className="rounded-xl h-12 font-bold" onClick={() => buyVehicle('bicycle', 150000)}>
                                {currentUser?.ownedVehicles?.some(id => id.startsWith('bicycle')) ? '✅ 所有済み' : '今すぐ購入する (15万円)'}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 mb-6">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Address</div>
                                <div className="text-sm font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedLand.address}</div>
                                <div className="flex justify-between items-center bg-indigo-600 p-4 rounded-2xl shadow-lg">
                                    <span className="font-bold text-white/80">価格</span>
                                    <span className="font-black text-2xl text-white tracking-tighter">{selectedLand.price.toLocaleString()}<span className="text-sm ml-1">円</span></span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {selectedLand.isForSale && !selectedLand.ownerId ? (
                                    <Button fullWidth variant="primary" size="lg" className="rounded-xl font-bold h-12" onClick={() => setIsPurchaseModalOpen(true)}>土地を購入する</Button>
                                ) : selectedLand.ownerId === currentUser?.id ? (
                                    <Button fullWidth variant="success" size="lg" className="rounded-xl font-bold h-12" onClick={() => setIsConstructionModalOpen(true)}>🏢 施設を建設する</Button>
                                ) : <Button fullWidth variant="secondary" size="lg" className="rounded-xl font-bold h-12" disabled>取引不可</Button>}
                            </div>
                        </>
                    )}
                </div>
            )}

            <LandPurchaseModal land={selectedLand || null} isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} onPurchase={handlePurchase} currentBalance={currentUser?.balance || 0} />
            <PlaceConstructionModal land={selectedLand || null} isOpen={isConstructionModalOpen} onClose={() => setIsConstructionModalOpen(false)} onBuild={handleBuild} />
        </div>
    );
}
