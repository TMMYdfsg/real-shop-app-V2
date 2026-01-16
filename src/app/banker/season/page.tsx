'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SeasonControlPage() {
    const { gameState } = useGame();

    if (!gameState) return <div>Loading...</div>;

    const currentSeason = gameState.season || 'spring';

    const handleSeasonChange = async (season: string) => {
        if (confirm(`季節を ${season} に変更しますか？`)) {
            await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'change_season', season }),
            });
            alert('季節を変更しました');
        }
    };

    const getSeasonInfo = (season: string) => {
        switch (season) {
            case 'spring': return { icon: '🌸', desc: '穏やかな季節。株価は安定。' };
            case 'summer': return { icon: '🌻', desc: '活発な季節。消費が増えるかも？' };
            case 'autumn': return { icon: '🍁', desc: '収穫の季節。イベントが多い。' };
            case 'winter': return { icon: '⛄', desc: '厳しい季節。病気に注意。' };
            default: return { icon: '❓', desc: '' };
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>季節管理</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <Card padding="lg" style={{ textAlign: 'center' }}>
                    <h3>現在の季節</h3>
                    <div style={{ fontSize: '4rem', margin: '1rem 0' }}>
                        {getSeasonInfo(currentSeason).icon}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {currentSeason}
                    </div>
                    <p>{getSeasonInfo(currentSeason).desc}</p>
                </Card>

                <Card padding="lg">
                    <h3>季節を変更する</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        {['spring', 'summer', 'autumn', 'winter'].map(s => {
                            const info = getSeasonInfo(s);
                            return (
                                <Button
                                    key={s}
                                    variant={currentSeason === s ? 'primary' : 'secondary'}
                                    onClick={() => handleSeasonChange(s)}
                                    disabled={currentSeason === s}
                                >
                                    {info.icon} {s.toUpperCase()}
                                </Button>
                            )
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
