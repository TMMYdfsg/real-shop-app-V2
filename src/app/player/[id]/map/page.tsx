'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import CityMap from '@/components/map/CityMap';
import { Button } from '@/components/ui/Button';

export default function MapPage() {
    const router = useRouter();
    const { currentUser } = useGame();

    if (!currentUser) return null;

    return (
        <div className="w-full h-screen relative bg-gray-100 overflow-hidden">
            {/* Map Component */}
            <CityMap />

            {/* Back Button Overlay */}
            <div className="absolute top-4 left-4 z-20">
                <Button variant="secondary" onClick={() => router.back()}>
                    ← 戻る
                </Button>
            </div>

            {/* Status Bar Overlay */}
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-auto bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg z-20 flex justify-between gap-4">
                <div>
                    <div className="text-xs text-gray-500">所持金</div>
                    <div className="font-bold text-lg">{currentUser?.balance?.toLocaleString() || 0}円</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500">所有物件</div>
                    <div className="font-bold text-lg text-right">{currentUser?.ownedLands?.length || 0}区画</div>
                </div>
            </div>
        </div>
    );
}
