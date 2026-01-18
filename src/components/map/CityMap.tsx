'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Land, PlaceType } from '@/types';
import { generateLands } from '@/lib/cityData';
import { Button } from '@/components/ui/Button';
import { LandPurchaseModal } from '@/components/map/LandPurchaseModal';
import { PlaceConstructionModal } from '@/components/map/PlaceConstructionModal';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';

interface CityMapProps {
    initialLat?: number;
    initialLng?: number;
    zoom?: number;
    onLandSelect?: (land: Land) => void;
}

type CommuteMode = 'walk' | 'bicycle' | 'car' | 'train';

// Map Content Component (Internal)
const MapContent: React.FC<{
    onMapLoad: (map: google.maps.Map) => void;
    initialLat: number;
    initialLng: number;
    zoom: number;
}> = ({ onMapLoad, initialLat, initialLng, zoom }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>();

    useEffect(() => {
        if (ref.current && !map) {
            const newMap = new window.google.maps.Map(ref.current, {
                center: { lat: initialLat, lng: initialLng },
                zoom: zoom,
                disableDefaultUI: false,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                mapId: 'DEMO_MAP_ID', // Advanced Markers require a mapId
            });
            setMap(newMap);
            onMapLoad(newMap);
        }
    }, [initialLat, initialLng, zoom, map, onMapLoad]);

    return <div ref={ref} className="absolute inset-0 w-full h-full z-[1]" />;
};

const renderLoading = (status: Status) => {
    if (status === Status.FAILURE) return <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500 font-bold z-[1000]">Map Load Error</div>;
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-[999]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
            <p className="text-gray-600 font-medium">マップを構成中...</p>
        </div>
    );
};

const CityMap: React.FC<CityMapProps> = ({
    initialLat = 35.681236,
    initialLng = 139.767125,
    zoom = 15,
    onLandSelect
}) => {
    const router = useRouter();
    const { currentUser, gameState, refresh } = useGame();
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [lands, setLands] = useState<Land[]>([]);
    const [selectedLandId, setSelectedLandId] = useState<string | null>(null);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null); // Kept for custom errors

    // Commuting State
    const [isCommuting, setIsCommuting] = useState(false);
    const [commuteMode, setCommuteMode] = useState<CommuteMode | null>(null);
    const [commuteProgress, setCommuteProgress] = useState(0); // 0 to 100
    const [showCommuteSelection, setShowCommuteSelection] = useState(false);
    const commuteMarkerRef = useRef<google.maps.Marker | null>(null);
    const commutePolylineRef = useRef<google.maps.Polyline | null>(null);

    // Search and Dynamic Land State
    const [searchAddress, setSearchAddress] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isMapOnly, setIsMapOnly] = useState(true); // Default to Map Only

    // 土地データの初期化
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

    // 土地ポリゴンの描画
    useEffect(() => {
        if (!map || lands.length === 0) return;
        const polygons: google.maps.Polygon[] = [];
        lands.filter(land => land.polygon && land.polygon.length > 0).forEach(land => {
            const isSpecial = land.id === '5-5' || land.id === '5-15';
            const isOwned = land.ownerId === currentUser?.id;

            // 重要でない土地（空き地）のポリゴンを非表示にする
            if (!isSpecial && !isOwned) return;

            const fillColor = land.id === '5-5' ? '#3b82f6' : land.id === '5-15' ? '#10b981' : '#10b981';

            const polygon = new google.maps.Polygon({
                paths: land.polygon!.map(p => ({ lat: p.lat, lng: p.lng })),
                strokeColor: isSpecial ? '#2563eb' : '#059669',
                strokeWeight: 2,
                fillColor: fillColor,
                fillOpacity: 0.5,
                map: map,
            });
            polygon.addListener('click', () => {
                setSelectedLandId(land.id);
                if (onLandSelect) onLandSelect(land);
            });
            polygons.push(polygon);
        });
        return () => polygons.forEach(p => p.setMap(null));
    }, [map, lands, currentUser?.id]);

    // 施設マーカーの描画
    useEffect(() => {
        if (!map || !gameState?.places) return;
        const markers: any[] = [];

        const renderMarkers = async () => {
            // Use google.maps.importLibrary inside Wrapper content
            const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

            gameState.places.forEach(place => {
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

                const container = document.createElement('div');
                container.innerHTML = `<div style="font-size: 30px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${iconText}</div>`;

                const marker = new AdvancedMarkerElement({
                    position: { lat: place.location.lat, lng: place.location.lng },
                    map: map,
                    content: container,
                    title: place.name
                });
                markers.push(marker);
            });
        };

        renderMarkers();
        return () => markers.forEach(m => m.map = null);
    }, [map, gameState?.places]);

    // --- Commute Logic ---
    const startCommute = async (mode: CommuteMode) => {
        if (!map) return;
        setCommuteMode(mode);
        setShowCommuteSelection(false);
        setIsCommuting(true);
        setCommuteProgress(0);

        if (commuteMarkerRef.current) commuteMarkerRef.current.setMap(null);
        if (commutePolylineRef.current) commutePolylineRef.current.setMap(null);

        const center = map.getCenter();
        if (!center) return;

        const start = center;
        const end = {
            lat: start.lat() + (Math.random() - 0.5) * 0.02,
            lng: start.lng() + (Math.random() - 0.5) * 0.02
        };

        const { DirectionsService } = await google.maps.importLibrary('routes') as google.maps.RoutesLibrary;
        const ds = new DirectionsService();

        let travelMode = google.maps.TravelMode.WALKING;
        if (mode === 'car') travelMode = google.maps.TravelMode.DRIVING;
        else if (mode === 'bicycle') travelMode = google.maps.TravelMode.BICYCLING;
        else if (mode === 'train') travelMode = google.maps.TravelMode.TRANSIT;

        ds.route({ origin: start, destination: end, travelMode: travelMode }, async (result, status) => {
            if (status === 'OK' && result) {
                const path = result.routes[0].overview_path;
                const polyline = new google.maps.Polyline({
                    path: path, geodesic: true, strokeColor: '#4f46e5', strokeOpacity: 0.8, strokeWeight: 6, map: map
                });
                commutePolylineRef.current = polyline;

                const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
                let icon = mode === 'car' ? '🚗' : mode === 'bicycle' ? '🚲' : mode === 'train' ? '🚃' : '🚶';

                const container = document.createElement('div');
                container.innerHTML = `<div style="font-size: 35px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5))">${icon}</div>`;

                const marker = new AdvancedMarkerElement({
                    position: path[0],
                    map: map,
                    content: container,
                    zIndex: 2000
                });
                commuteMarkerRef.current = marker as any;

                let step = 0;
                const totalSteps = path.length;
                const rawSpeed = mode === 'car' ? 3 : mode === 'bicycle' ? 2 : mode === 'train' ? 5 : 1;
                const interval = setInterval(() => {
                    step += rawSpeed;
                    if (step >= totalSteps - 1) {
                        marker.position = path[totalSteps - 1];
                        setCommuteProgress(100);
                        clearInterval(interval);
                        setTimeout(() => {
                            setIsCommuting(false);
                            alert('職場に到着しました！お疲れ様です。');
                        }, 1000);
                    } else {
                        marker.position = path[step];
                        setCommuteProgress((step / totalSteps) * 100);
                        map.panTo(path[step]);
                    }
                }, 100);
            } else {
                let msg = 'ルートが見つかりませんでした。';
                if (status === 'REQUEST_DENIED') {
                    msg = 'Google Cloud Consoleで「Directions API」を有効にする必要があります。';
                }
                alert(`通勤エラー (${status}): ${msg}`);
                setIsCommuting(false);
            }
        });
    };

    // --- Geocoding & Address Purchase ---
    const handleAddressSearch = async () => {
        if (!searchAddress || !map) return;
        setIsSearching(true);
        try {
            const { Geocoder } = await google.maps.importLibrary('geocoding') as google.maps.GeocodingLibrary;
            const geocoder = new Geocoder();
            geocoder.geocode({ address: searchAddress }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const loc = results[0].geometry.location;
                    map.setCenter(loc);
                    map.setZoom(18);

                    const lat = loc.lat();
                    const lng = loc.lng();
                    const address = results[0].formatted_address;

                    const existingLand = lands.find(l =>
                        l.address === address ||
                        (Math.abs(l.location.lat - lat) < 0.0001 && Math.abs(l.location.lng - lng) < 0.0001)
                    );

                    if (existingLand) {
                        setSelectedLandId(existingLand.id);
                    } else {
                        const tempLand: Land = {
                            id: `temp_${Date.now()}`,
                            ownerId: null,
                            price: 5000000,
                            location: { lat, lng },
                            address: address,
                            isForSale: true,
                            polygon: [
                                { lat: lat - 0.0004, lng: lng - 0.0004 },
                                { lat: lat - 0.0004, lng: lng + 0.0004 },
                                { lat: lat + 0.0004, lng: lng + 0.0004 },
                                { lat: lat + 0.0004, lng: lng - 0.0004 },
                            ]
                        };
                        setLands(prev => [...prev, tempLand]);
                        setSelectedLandId(tempLand.id);
                    }
                } else {
                    let msg = '住所が見つかりませんでした。';
                    if (status === 'REQUEST_DENIED') {
                        msg = 'Google Cloud Consoleで「Geocoding API」を有効にする必要があります。';
                    }
                    alert(`検索エラー (${status}): ${msg}`);
                }
                setIsSearching(false);
            });
        } catch (error) {
            console.error('Search error:', error);
            setIsSearching(false);
        }
    };

    const handleBuyByAddress = async (land: Land) => {
        if (!currentUser) return;
        if (currentUser.balance < land.price) {
            alert('所持金が足りません！');
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
                        address: land.address,
                        location: land.location,
                        polygon: land.polygon,
                        price: land.price
                    }),
                    amount: land.price
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('住所指定で土地を購入しました！');
                setSelectedLandId(null);
                refresh();
            } else {
                alert(`購入失敗: ${data.message}`);
            }
        } catch (error) {
            console.error('Buy address error:', error);
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

    const selectedLand = lands.find(l => l.id === selectedLandId);

    return (
        <div className="fixed inset-0 w-full h-full bg-slate-100 z-0 overflow-hidden">
            <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} render={renderLoading}>
                <MapContent onMapLoad={setMap} initialLat={initialLat} initialLng={initialLng} zoom={zoom} />

                {/* Right Sidebar UI Stack */}
                {!isCommuting && !isMapOnly && (
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

                        {/* 2. Address Search */}
                        <div className="pointer-events-auto w-64 bg-white shadow-xl rounded-xl p-1.5 border border-gray-100 flex flex-col gap-2 animate-in slide-in-from-right-4 duration-500">
                            <input
                                type="text"
                                value={searchAddress}
                                onChange={(e) => setSearchAddress(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                                placeholder="購入したい住所を入力..."
                                className="w-full bg-gray-50 px-3 py-2 rounded-lg outline-none text-xs font-bold text-gray-800"
                            />
                            <Button
                                variant="primary"
                                size="sm"
                                className="w-full rounded-lg font-black text-xs h-8"
                                onClick={handleAddressSearch}
                                disabled={isSearching}
                            >
                                {isSearching ? '検索中...' : '🔍 マップ移動'}
                            </Button>
                        </div>

                        {/* 3. Commute Button */}
                        <div className="pointer-events-auto">
                            <Button variant="primary" size="lg" className="shadow-xl rounded-full px-6 flex items-center gap-2 font-bold" onClick={() => setShowCommuteSelection(true)}>
                                🏢 仕事場へ行く
                            </Button>
                        </div>

                        {/* 4. Back Button & Status */}
                        <div className="pointer-events-auto bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-4 border border-gray-100 w-48 animate-in slide-in-from-right-8 duration-600 delay-100">
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

                {/* Map Only Restore Button (When isMapOnly is true) - Right top corner */}
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

                {/* Commute Selection Overlay */}
                {showCommuteSelection && (
                    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            <h2 className="text-2xl font-black mb-6 text-center text-gray-800 tracking-tighter">通勤手段を選ぼう</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => startCommute('walk')} className="flex flex-col items-center p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                                    <span className="text-4xl mb-2 group-hover:animate-bounce">🚶</span>
                                    <span className="font-bold text-sm text-gray-700">徒歩</span>
                                    <span className="text-[10px] text-gray-400 font-medium">0円 / ゆっくり</span>
                                </button>
                                <button onClick={() => {
                                    if (currentUser?.ownedVehicles?.some(id => id.startsWith('bicycle'))) startCommute('bicycle');
                                    else alert('自転車を所有していません。ホームセンターで購入してください。');
                                }} className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all group ${currentUser?.ownedVehicles?.some(id => id.startsWith('bicycle')) ? 'border-gray-100 hover:border-indigo-500 hover:bg-indigo-50' : 'border-red-100 bg-red-50/30'}`}>
                                    <span className="text-4xl mb-2 group-hover:animate-bounce">🚲</span>
                                    <span className="font-bold text-sm text-gray-700">自転車</span>
                                    <span className={`text-[10px] font-bold ${currentUser?.ownedVehicles?.some(id => id.startsWith('bicycle')) ? 'text-gray-400' : 'text-red-500'}`}>
                                        {currentUser?.ownedVehicles?.some(id => id.startsWith('bicycle')) ? '0円 / 普通' : '未所有'}
                                    </span>
                                </button>
                                <button onClick={() => {
                                    if (currentUser?.ownedVehicles?.some(id => id.startsWith('car'))) startCommute('car');
                                    else alert('車を所有していません。ディーラーで購入してください。');
                                }} className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all group ${currentUser?.ownedVehicles?.some(id => id.startsWith('car')) ? 'border-gray-100 hover:border-indigo-500 hover:bg-indigo-50' : 'border-red-100 bg-red-50/30'}`}>
                                    <span className="text-4xl mb-2 group-hover:animate-bounce">🚗</span>
                                    <span className="font-bold text-sm text-gray-700">車</span>
                                    <span className={`text-[10px] font-bold ${currentUser?.ownedVehicles?.some(id => id.startsWith('car')) ? 'text-gray-400' : 'text-red-500'}`}>
                                        {currentUser?.ownedVehicles?.some(id => id.startsWith('car')) ? 'ガソリン代 / 早い' : '未所有'}
                                    </span>
                                </button>
                                <button onClick={() => startCommute('train')} className="flex flex-col items-center p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                                    <span className="text-4xl mb-2 group-hover:animate-bounce">🚃</span>
                                    <span className="font-bold text-sm text-gray-700">電車</span>
                                    <span className="text-[10px] text-gray-400 font-medium">運賃300円 / とても速い</span>
                                </button>
                            </div>
                            <Button fullWidth variant="outline" className="mt-8 rounded-2xl font-black h-12 border-2 hover:bg-gray-50" onClick={() => setShowCommuteSelection(false)}>キャンセル</Button>
                        </div>
                    </div>
                )}

                {/* Commuting Animation Overlay */}
                {isCommuting && (
                    <div className="absolute inset-0 z-[3000] bg-indigo-900/95 flex flex-col items-center justify-center text-white p-8 animate-in fade-in zoom-in duration-500">
                        <div className="text-center mb-16 relative">
                            <div className="text-9xl mb-8 animate-bounce filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                {commuteMode === 'car' ? '🚗' : commuteMode === 'bicycle' ? '🚲' : commuteMode === 'train' ? '🚃' : '🚶'}
                            </div>
                            <h2 className="text-5xl font-black mb-2 tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-300">WAY TO WORK</h2>
                            <div className="flex gap-2 justify-center">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" style={{ animationDelay: `${i * 150}ms` }} />
                                ))}
                            </div>
                        </div>
                        <div className="w-full max-w-md space-y-6">
                            <div className="flex justify-between items-end text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] px-1">
                                <span>Departure</span>
                                <div>{Math.floor(commuteProgress)}%</div>
                                <span>Destination</span>
                            </div>
                            <div className="w-full bg-white/5 h-6 rounded-full p-1.5 overflow-hidden backdrop-blur-xl border border-white/10 shadow-2xl">
                                <div className="bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 h-full rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(129,140,248,0.6)]" style={{ width: `${commuteProgress}%` }} />
                            </div>
                            <p className="text-center text-xs text-indigo-200/60 font-medium tracking-widest uppercase">「今日も素敵な一日になりますように」</p>
                        </div>
                    </div>
                )}

                {/* Selection Overlay */}
                {selectedLand && !isCommuting && !isMapOnly && (
                    <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 z-[1001] animate-in slide-in-from-bottom-4 duration-300">
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
                                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                                    <span className="text-2xl font-black text-indigo-600 tracking-tighter">3,000,000<span className="text-sm ml-1">円</span></span>
                                </div>
                                <Button fullWidth variant={currentUser?.ownedVehicles?.some(id => id.startsWith('car')) ? 'outline' : 'primary'} size="lg" className="rounded-xl h-12 font-bold" onClick={() => buyVehicle('car', 3000000)}>
                                    {currentUser?.ownedVehicles?.some(id => id.startsWith('car')) ? '✅ 所有済み' : '契約書にサインする'}
                                </Button>
                            </div>
                        ) : selectedLand.id === '5-15' ? (
                            <div className="space-y-4">
                                <div className="aspect-video bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl flex items-center justify-center text-6xl shadow-inner font-black text-white/50">🚲</div>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">丸の内ホームセンター：電動アシスト自転車。坂道もラクラク、健康的な通勤スタイルを。</p>
                                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                    <span className="text-2xl font-black text-emerald-600 tracking-tighter">150,000<span className="text-sm ml-1">円</span></span>
                                </div>
                                <Button fullWidth variant={currentUser?.ownedVehicles?.some(id => id.startsWith('bicycle')) ? 'outline' : 'success'} size="lg" className="rounded-xl h-12 font-bold" onClick={() => buyVehicle('bicycle', 150000)}>
                                    {currentUser?.ownedVehicles?.some(id => id.startsWith('bicycle')) ? '✅ 所有済み' : '今すぐ購入する'}
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
                                    {selectedLand.id.startsWith('temp_') ? (
                                        <Button fullWidth variant="primary" size="lg" className="rounded-xl font-bold h-12 shadow-lg shadow-indigo-100" onClick={() => handleBuyByAddress(selectedLand)}>この住所の土地を購入する</Button>
                                    ) : selectedLand.isForSale && !selectedLand.ownerId ? (
                                        <Button fullWidth variant="primary" size="lg" className="rounded-xl font-bold h-12" onClick={() => setIsPurchaseModalOpen(true)}>土地を購入する</Button>
                                    ) : selectedLand.ownerId === currentUser?.id ? (
                                        <Button fullWidth variant="success" size="lg" className="rounded-xl font-bold h-12" onClick={() => setIsConstructionModalOpen(true)}>🏢 施設を建設する</Button>
                                    ) : <Button fullWidth variant="secondary" size="lg" className="rounded-xl font-bold h-12" disabled>取引不可</Button>}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Wrapper>
            <LandPurchaseModal land={selectedLand || null} isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} onPurchase={handlePurchase} currentBalance={currentUser?.balance || 0} />
            <PlaceConstructionModal land={selectedLand || null} isOpen={isConstructionModalOpen} onClose={() => setIsConstructionModalOpen(false)} onBuild={handleBuild} />
        </div>
    );
};

export default CityMap;
