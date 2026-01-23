'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow, Marker, MarkerClusterer } from '@react-google-maps/api';
import { Land } from '@/types';
import { generateLands } from '@/lib/cityData';
import { Button } from '@/components/ui/Button';
import { LandPurchaseModal } from '@/components/map/LandPurchaseModal';
import { PlaceConstructionModal } from '@/components/map/PlaceConstructionModal';
import { JapanPrefectureModal } from '@/components/map/JapanPrefectureModal';
import { RegionModal } from '@/components/map/RegionModal';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';

interface CityMapProps {
    initialLat?: number;
    initialLng?: number;
    zoom?: number;
    onLandSelect?: (land: Land) => void;
    context?: 'global' | 'shop'; // 追加: コンテキストによって表示を切り替える
}

// Google Maps用のスタイル（落ち着いた色調）
const mapStyles = [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

export default function CityMap({
    initialLat = 20.0,  // 世界全体が見やすい位置（アジア中心）
    initialLng = 130.0,
    zoom: initialZoom = 3,           // 世界地図レベル
    onLandSelect,
    context = 'global'
}: CityMapProps) {
    const router = useRouter();
    const { currentUser, gameState, refresh } = useGame();
    const [selectedLandId, setSelectedLandId] = useState<string | null>(null);
    const [infoWindowPosition, setInfoWindowPosition] = useState<google.maps.LatLngLiteral | null>(null);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);
    const [isJapanModalOpen, setIsJapanModalOpen] = useState(false);
    const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(initialZoom);

    // マップロード状態
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = React.useState<google.maps.Map | null>(null);

    const onLoad = React.useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    // 土地データの初期化（メモ化して計算負荷軽減）
    const lands = useMemo(() => {
        // cityDataから全土地データを取得
        const initialLands = generateLands();

        // サーバーから最新の状態を取得してマージ
        if (gameState?.lands) {
            return initialLands.map(land => {
                const serverLand = gameState.lands.find(sl => sl.id === land.id);
                if (serverLand) {
                    return { ...land, ...serverLand };
                }
                return land;
            });
        }
        return initialLands;
    }, [gameState?.lands]);

    // Auto-Geocoding Logic (Self-Healing)
    useEffect(() => {
        if (!isLoaded || !lands.length) return;

        // lat, lng が 0 (未設定) の土地を抽出
        const pendingLands = lands.filter(l => l.location.lat === 0 && l.location.lng === 0);

        if (pendingLands.length > 0) {
            console.log(`Auto-Geocoding started for ${pendingLands.length} lands...`);
            const geocoder = new google.maps.Geocoder();
            let isCancelled = false;

            const processGeocoding = async () => {
                for (const land of pendingLands) {
                    if (isCancelled) break;
                    try {
                        await new Promise(r => setTimeout(r, 1500)); // Rate limit 緩めに
                        const result = await geocoder.geocode({ address: land.address });
                        if (result.results && result.results.length > 0) {
                            const loc = result.results[0].geometry.location;
                            const lat = loc.lat();
                            const lng = loc.lng();

                            await fetch('/api/action', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    type: 'city_update_land_coord',
                                    requesterId: currentUser?.id || 'system',
                                    details: JSON.stringify({ landId: land.id, lat, lng })
                                })
                            });
                        }
                    } catch (e) { console.error(e); }
                }
            };
            processGeocoding();
            return () => { isCancelled = true; };
        }
    }, [isLoaded, lands.length]);

    const handleLandClick = (land: Land) => {
        setSelectedLandId(land.id);
        // setInfoWindowPosition(land.location); // 不要：selectedLandから直接計算
        if (onLandSelect) {
            onLandSelect(land);
        }
    };

    const handlePurchase = async (land: Land) => {
        setIsPurchaseModalOpen(false);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'city_buy_land',
                    requesterId: currentUser?.id,
                    amount: land.price,
                    details: land.id
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                refresh(); // ゲーム状態更新
            } else {
                alert(`購入失敗: ${data.message}`);
            }
        } catch (error) {
            console.error('Purchase error:', error);
            alert('購入エラーが発生しました');
        }
    };

    const selectedLand = useMemo(() =>
        lands.find(l => l.id === selectedLandId),
        [lands, selectedLandId]
    );

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100vh'
    };

    if (!isLoaded) return <div>Loading Map...</div>;

    return (
        <div style={{ position: 'fixed', inset: 0, width: '100%', height: '100vh', zIndex: 0 }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={{ lat: initialLat, lng: initialLng }}
                zoom={initialZoom}
                options={{
                    styles: mapStyles,
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    minZoom: 2,
                    maxZoom: 18,
                }}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onZoomChanged={() => {
                    if (map) {
                        setCurrentZoom(map.getZoom() || initialZoom);
                    }
                }}
            >
                <MarkerClusterer>
                    {(clusterer) => (
                        <>
                            {lands.map((land) => {
                                // 座標未定の場合は表示しない
                                if (land.location.lat === 0 && land.location.lng === 0) return null;

                                // 表示フィルタ
                                const isRegion = land.id.startsWith('region_');
                                const isOwnedByAny = !!land.ownerId;
                                const isOwnedByMe = land.ownerId === currentUser?.id;

                                // 【追加】グローバル表示時は、所有されていない国・地域は非表示
                                if (context === 'global' && (isRegion || land.id.startsWith('country_')) && !isOwnedByAny) {
                                    return null;
                                }

                                // 低ズーム時は、地域マーカーか自分の所有地のみ表示
                                if (currentZoom <= 4 && !isRegion && !isOwnedByMe) {
                                    return null;
                                }

                                // 都道府県マーカーは通常非表示（日本マーカーからアクセス）
                                // ただし所有している場合は表示
                                const isPrefecture = !land.id.startsWith('country_') && !land.id.startsWith('region_');
                                if (isPrefecture && !isOwnedByMe) return null;

                                // ピンの色分け
                                let iconUrl = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // Default

                                if (isRegion) {
                                    iconUrl = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"; // Region
                                } else {
                                    // Place情報があればそれに基づき色変更
                                    const place = gameState?.places?.find(p => p.id === land.placeId);

                                    if (place) {
                                        if (place.buildingCategory === 'house') {
                                            iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
                                        } else if (place.buildingCategory === 'company') {
                                            iconUrl = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
                                        } else if (place.buildingCategory === 'shop') {
                                            iconUrl = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
                                        }
                                    } else if (land.ownerId) {
                                        if (land.ownerId === currentUser?.id) {
                                            iconUrl = "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
                                        } else {
                                            iconUrl = "http://maps.google.com/mapfiles/ms/icons/pink-dot.png";
                                        }
                                    }
                                }

                                return (
                                    <Marker
                                        key={land.id}
                                        position={land.location}
                                        onClick={() => {
                                            if (isRegion) {
                                                setSelectedLandId(land.id);
                                                setIsRegionModalOpen(true);
                                            } else {
                                                handleLandClick(land);
                                            }
                                        }}
                                        icon={iconUrl}
                                        clusterer={clusterer}
                                        label={isRegion ? { text: land.address, color: '#333', fontWeight: 'bold' } : undefined}
                                    />
                                );
                            })}
                        </>
                    )}
                </MarkerClusterer>


                {/* InfoWindow for selected land */}
                {selectedLand && (
                    <InfoWindow
                        key={selectedLand.id} // 強制再描画
                        position={selectedLand.location}
                        onCloseClick={() => {
                            setSelectedLandId(null);
                        }}
                    >
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-sm mb-1">{selectedLand.address}</h3>
                            <p className="text-xs text-gray-600 mb-2">
                                価格: {selectedLand.price.toLocaleString()}枚
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                                {selectedLand.ownerId === currentUser?.id
                                    ? '✅ あなたの土地'
                                    : selectedLand.ownerId
                                        ? `🔒 所有済み`
                                        : selectedLand.isForSale
                                            ? '🏷️ 購入可能'
                                            : '🚫 非売品'}
                            </p>

                            {/* 建物情報の表示 */}
                            {(() => {
                                const place = gameState?.places?.find(p => p.id === selectedLand.placeId);
                                if (place) {
                                    return (
                                        <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
                                            <div className="font-bold">{place.name}</div>
                                            <div>Type: {place.buildingCategory || 'Unknown'}</div>
                                            {place.level && <div>Level: {place.level}</div>}
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {selectedLand.isForSale && !selectedLand.ownerId && currentUser && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        if (selectedLand.id === 'country_日本') {
                                            setIsJapanModalOpen(true);
                                        } else {
                                            setIsPurchaseModalOpen(true);
                                        }
                                    }}
                                    className="w-full text-xs"
                                >
                                    購入する
                                </Button>
                            )}
                            {selectedLand.ownerId === currentUser?.id && !selectedLand.placeId && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setIsConstructionModalOpen(true)}
                                    className="w-full text-xs"
                                >
                                    建設する
                                </Button>
                            )}

                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* モーダル */}
            <LandPurchaseModal
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                land={selectedLand || null}
                onPurchase={(land) => handlePurchase(land)}
                currentBalance={currentUser?.balance || 0}
            />

            <PlaceConstructionModal
                isOpen={isConstructionModalOpen}
                onClose={() => setIsConstructionModalOpen(false)}
                land={selectedLand || null}
                onBuild={async (name, type, companyType, abilityId, statId) => {
                    // 建設処理
                    if (!selectedLand) return;

                    try {
                        const res = await fetch('/api/action', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'city_build_place',
                                requesterId: currentUser?.id,
                                details: JSON.stringify({
                                    landId: selectedLand.id,
                                    buildingType: type,
                                    buildingName: name,
                                    companyType: companyType,
                                    companyAbilityId: abilityId,
                                    companyStatId: statId
                                })
                            })
                        });
                        const data = await res.json();
                        if (data.success) {
                            alert(data.message);
                            refresh();
                            setIsConstructionModalOpen(false);
                        } else {
                            alert(`建設失敗: ${data.message}`);
                        }
                    } catch (e) {
                        console.error(e);
                        alert('建設エラー');
                    }
                }}
            />

            <JapanPrefectureModal
                isOpen={isJapanModalOpen}
                onClose={() => setIsJapanModalOpen(false)}
                prefectures={lands.filter(l => !l.id.startsWith('country_') && !l.id.startsWith('region_'))}
                currentBalance={currentUser?.balance || 0}
                onSelect={(prefecture) => {
                    setIsJapanModalOpen(false);
                    handlePurchase(prefecture);
                }}
            />


            <RegionModal
                isOpen={isRegionModalOpen}
                onClose={() => setIsRegionModalOpen(false)}
                regionName={selectedLand?.address || ''}
                countries={lands.filter(l => l.regionId === selectedLandId && l.id.startsWith('country_'))}
                currentBalance={currentUser?.balance || 0}
                onSelect={(country) => {
                    setIsRegionModalOpen(false);
                    if (country.id === 'country_日本') {
                        setIsJapanModalOpen(true);
                    } else {
                        handleLandClick(country);
                        setIsPurchaseModalOpen(true);
                    }
                }}
            />

        </div>
    );
}
