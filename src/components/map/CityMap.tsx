'use client';

import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Land, PlaceType } from '@/types';
import { generateLands } from '@/lib/cityData';
import { Button } from '@/components/ui/Button';
import { LandPurchaseModal } from '@/components/map/LandPurchaseModal';
import { PlaceConstructionModal } from '@/components/map/PlaceConstructionModal';
import { useGame } from '@/context/GameContext';

interface CityMapProps {
    initialLat?: number;
    initialLng?: number;
    zoom?: number;
    onLandSelect?: (land: Land) => void;
}

const CityMap: React.FC<CityMapProps> = ({
    initialLat = 35.681236,
    initialLng = 139.767125,
    zoom = 15,
    onLandSelect
}) => {
    const { currentUser, gameState, refresh } = useGame();
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [lands, setLands] = useState<Land[]>([]);
    const [selectedLandId, setSelectedLandId] = useState<string | null>(null);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);

    // 土地データの初期化
    useEffect(() => {
        const data = generateLands();
        if (currentUser && currentUser.ownedLands) {
            data.forEach(l => {
                if (currentUser.ownedLands.includes(l.id)) {
                    l.ownerId = currentUser.id;
                    l.isForSale = false;
                }
            });
        }
        setLands(data);
    }, [currentUser]);

    // Google Maps の初期化
    useEffect(() => {
        setOptions({
            key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
        });

        const initMap = async () => {
            try {
                if (!mapRef.current) return;

                const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;

                const newMap = new Map(mapRef.current, {
                    center: { lat: initialLat, lng: initialLng },
                    zoom: zoom,
                    mapId: 'DEMO_MAP_ID',
                    disableDefaultUI: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                });

                setMap(newMap);
            } catch (e) {
                console.error('Google Maps Load Error:', e);
            }
        };

        initMap();
    }, [initialLat, initialLng, zoom]);

    // 土地ポリゴンの描画
    useEffect(() => {
        if (!map || lands.length === 0) return;

        const polygons: google.maps.Polygon[] = [];

        lands.filter(land => land.polygon && land.polygon.length > 0).forEach(land => {
            const fillColor = land.isForSale && !land.ownerId ? '#e5e7eb' :
                land.ownerId === currentUser?.id ? '#10b981' : '#ffffff';

            const polygon = new google.maps.Polygon({
                paths: land.polygon!.map(p => ({ lat: p.lat, lng: p.lng })),
                strokeColor: '#9ca3af',
                strokeWeight: 1,
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

        return () => {
            polygons.forEach(p => p.setMap(null));
        };
    }, [map, lands, currentUser?.id]);

    // 施設マーカーの描画
    useEffect(() => {
        if (!map || !gameState?.places) return;

        const markers: google.maps.Marker[] = [];

        gameState.places.forEach(place => {
            const isConstruction = place.status === 'construction';
            let icon = '🏢';
            if (isConstruction) icon = '🚧';
            else {
                if (place.type === 'restaurant') icon = '🍽️';
                else if (place.type === 'retail') icon = '🏪';
                else if (place.type === 'service') icon = '💇';
                else if (place.type === 'factory') icon = '🏭';
            }

            const marker = new google.maps.Marker({
                position: { lat: place.location.lat, lng: place.location.lng },
                map: map,
                icon: {
                    url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="5" y="30" font-size="30">${icon}</text></svg>`,
                    scaledSize: new google.maps.Size(40, 40)
                },
                title: place.name
            });

            markers.push(marker);
        });

        return () => {
            markers.forEach(m => m.setMap(null));
        };
    }, [map, gameState?.places]);

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
        <div className="w-full h-full relative overflow-hidden">
            {/* Map Container */}
            <div ref={mapRef} className="w-full h-full min-h-screen" />

            {/* Overlay UI */}
            {selectedLand && (
                <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white p-4 rounded-xl shadow-2xl z-[1000] border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">📍 土地情報</h3>
                        <button onClick={() => setSelectedLandId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="text-sm text-gray-600"><span className="font-semibold block">住所:</span> {selectedLand.address}</div>
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="font-semibold text-gray-700">価格</span>
                            <span className="font-bold text-xl text-indigo-600">{selectedLand.price.toLocaleString()}円</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">所有者</span>
                            <span className={`font-bold ${selectedLand.ownerId ? 'text-gray-900' : 'text-green-600'}`}>
                                {selectedLand.ownerId ? (selectedLand.ownerId === currentUser?.id ? 'あなた' : '他プレイヤー') : '販売中 (公有地)'}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {selectedLand.isForSale && !selectedLand.ownerId ? (
                            <Button fullWidth variant="primary" onClick={() => setIsPurchaseModalOpen(true)}>購入手続へ進む</Button>
                        ) : selectedLand.ownerId === currentUser?.id ? (
                            <>
                                <Button fullWidth variant="success" onClick={() => setIsConstructionModalOpen(true)}>🏢 施設を建設する</Button>
                                <Button fullWidth variant="outline" disabled>売却する (準備中)</Button>
                            </>
                        ) : <Button fullWidth variant="secondary" disabled>購入不可</Button>}
                    </div>
                </div>
            )}

            <LandPurchaseModal
                land={selectedLand || null}
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                onPurchase={handlePurchase}
                currentBalance={currentUser?.balance || 0}
            />
            <PlaceConstructionModal
                land={selectedLand || null}
                isOpen={isConstructionModalOpen}
                onClose={() => setIsConstructionModalOpen(false)}
                onBuild={handleBuild}
            />
        </div>
    );
};

export default CityMap;
