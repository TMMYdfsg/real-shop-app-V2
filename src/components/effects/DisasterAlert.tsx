import React from 'react';
import { GameState } from '@/types';

interface DisasterAlertProps {
    gameState: GameState;
}

export default function DisasterAlert({ gameState }: DisasterAlertProps) {
    const { disaster } = gameState.environment;

    if (!disaster) return null;

    // Severity Colors
    const getSeverityColor = (sev: number) => {
        if (sev >= 5) return 'from-red-900 via-red-600 to-red-900 border-red-500';
        if (sev >= 3) return 'from-orange-800 via-orange-600 to-orange-800 border-orange-500';
        return 'from-yellow-800 via-yellow-600 to-yellow-800 border-yellow-500';
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex justify-center pt-8">
            <div className={`bg-gradient-to-r ${getSeverityColor(disaster.severity)} text-white px-8 py-4 rounded-lg shadow-2xl border-2 border-white/30 animate-pulse flex items-center gap-4 max-w-2xl mx-4`}>
                <div className="text-4xl animate-bounce">⚠️</div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-widest border-b border-white/30 pb-1 mb-1">Emergency Alert</h2>
                    <p className="font-bold text-lg">{disaster.name} 発生中</p>
                    <p className="text-sm opacity-90 mt-1">
                        市民の皆様は直ちに安全を確保してください。
                        <br />
                        <span className="font-mono bg-black/20 px-2 rounded mt-1 inline-block">
                            警戒レベル: {disaster.severity} / 残り予想時間: {disaster.remainingTurns}ターン
                        </span>
                    </p>
                </div>
            </div>

            {/* Screen vignetting for strong disasters */}
            {disaster.severity >= 4 && (
                <div className="fixed inset-0 pointer-events-none bg-red-500/10 mix-blend-multiply z-[-1] animate-pulse"></div>
            )}
        </div>
    );
}
