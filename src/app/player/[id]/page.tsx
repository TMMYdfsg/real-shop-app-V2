'use client';

import React, { use } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';

// Import SmartphoneOS and Shell
import { SmartphoneOS } from '@/components/smartphone/SmartphoneOS';
import { SmartphoneShell } from '@/components/smartphone/SmartphoneShell';

export default function PlayerHome({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params using React.use()
    const { id } = use(params);
    const { gameState, currentUser } = useGame();

    if (!gameState) return <div className="p-8 text-center text-gray-500">Loading world data...</div>;

    // Game Start Lock (Check this FIRST, before currentUser check)
    if (gameState.settings.isGameStarted === false) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center text-white p-8">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-6">🛑</div>
                    <h1 className="text-3xl font-bold mb-4">準備中</h1>
                    <p className="text-lg text-slate-300 leading-relaxed mb-8">
                        ゲームが初期化されました。<br />
                        管理者がゲームを開始するまで<br />
                        しばらくお待ちください。
                    </p>
                    <div className="animate-pulse text-sm text-slate-500">Waiting for admin...</div>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-sm">
                    <h2 className="text-xl font-bold text-red-600 mb-2">ユーザーエラー</h2>
                    <p className="text-gray-600 mb-6">ユーザー情報が見つかりませんでした。<br />ゲームがリセットされた可能性があります。</p>
                    <Button onClick={() => window.location.href = '/'}>
                        トップに戻る
                    </Button>
                </div>
            </div>
        );
    }

    // Main Phone Interface
    return (
        <div className="min-h-screen w-full flex items-center justify-center py-8">
            <SmartphoneShell onHome={() => window.location.reload()}>
                <SmartphoneOS />
            </SmartphoneShell>
        </div>
    );
}
