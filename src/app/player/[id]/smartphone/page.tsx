'use client';

import React, { use } from 'react';
import { SmartphoneOS } from '@/components/smartphone/SmartphoneOS';

export default function SmartphonePage({ params }: { params: Promise<{ id: string }> }) {
    // Note: params can be used to set context if needed, but SmartphoneOS handles most logic internally for now.
    const { id } = use(params);

    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Smartphone Simulator</h1>
                <p className="text-gray-400">High-Fidelity Android Experience</p>
            </div>

            <SmartphoneOS />

            <div className="mt-8 text-xs text-gray-600 font-mono">
                Running Android 14 Simulator • Build 2026.1.20
            </div>
        </div>
    );
}
