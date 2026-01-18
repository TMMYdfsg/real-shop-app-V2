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
        <div className="w-full h-screen relative overflow-hidden bg-transparent">
            {/* Map Component */}
            <CityMap />
        </div>
    );
}
