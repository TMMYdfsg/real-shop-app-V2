import React from 'react';
import { GameState } from '@/types';

interface WorldStatusProps {
    gameState: GameState;
}

export default function WorldStatus({ gameState }: WorldStatusProps) {
    const { environment, economy } = gameState;

    // Weather Icons
    const WEATHER_ICONS: Record<string, string> = {
        'sunny': '☀️',
        'rain': '☔',
        'heavy_rain': '⛈️',
        'storm': '🌪️',
        'snow': '⛄',
        'heatwave': '🥵'
    };

    const ECONOMY_ICONS: Record<string, string> = {
        'boom': '📈',
        'normal': '➡️',
        'recession': '📉',
        'crisis': '📉🔥'
    };

    const ECONOMY_LABELS: Record<string, string> = {
        'boom': '好景気',
        'normal': '通常',
        'recession': '不況',
        'crisis': '恐慌'
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 flex flex-col gap-2 min-w-[160px]">
            {/* Weather & Season */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label="weather">
                        {WEATHER_ICONS[environment.weather] || '❓'}
                    </span>
                    <div className="leading-tight">
                        <div className="text-xs font-bold text-gray-400 uppercase">{environment.season}</div>
                        <div className="text-sm font-bold text-gray-700">{environment.temperature}°C</div>
                    </div>
                </div>
            </div>

            {/* Economy */}
            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label="economy">
                        {ECONOMY_ICONS[economy.status] || '❓'}
                    </span>
                    <div className="leading-tight">
                        <div className="text-xs font-bold text-gray-400">ECONOMY</div>
                        <div className={`text-sm font-bold ${economy.status === 'boom' ? 'text-red-600' :
                                economy.status === 'recession' ? 'text-blue-600' :
                                    'text-gray-700'
                            }`}>
                            {ECONOMY_LABELS[economy.status]}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticker / News if any urgent */}
            {environment.disaster && (
                <div className="mt-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded animate-pulse font-bold text-center border border-red-200">
                    ⚠️ {environment.disaster.name}
                </div>
            )}
        </div>
    );
}
