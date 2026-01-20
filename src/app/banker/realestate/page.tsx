'use client';

import React from 'react';
import { RealEstateManager } from '@/components/admin/RealEstateManager';

export default function BankerRealEstatePage() {
    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-black text-gray-800">🏠 不動産管理センター (Management Center)</h1>
            <RealEstateManager />
        </div>
    );
}
