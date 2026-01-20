'use client';

import React from 'react';
// import CityMap from '@/components/map/CityMap'; // ← これを削除
import dynamic from 'next/dynamic'; // ← 追加

// SSRを無効化して動的にインポート
const CityMap = dynamic(() => import('@/components/map/CityMap'), {
    loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">Map Loading...</div>,
    ssr: false
});

export default function MapPage() {
    // ...既存のコード...

    return (
        // h-screenで高さを確保し、z-indexで背面に固定
        <div className="w-full h-screen fixed top-0 left-0 z-0 bg-slate-900">
            <CityMap />
        </div>
    );
}
