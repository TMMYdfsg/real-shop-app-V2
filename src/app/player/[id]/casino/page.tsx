'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { BlackjackGame } from '@/components/casino/BlackjackGame';
import { SlotGame } from '@/components/casino/SlotGame';
import { HorseRaceGame } from '@/components/casino/HorseRaceGame';

// Original Dice Game (HIGH & LOW)
import { Dice } from '@/components/casino/DiceGame';

export default function CasinoPage() {
    const { currentUser } = useGame();
    const [activeTab, setActiveTab] = useState<'dice' | 'blackjack' | 'slot' | 'horse'>('dice');

    const handleBet = async (gameType: string, amount: number, details: string) => {
        if (!currentUser) return;

        const res = await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: `gamble_${gameType}`,
                requesterId: currentUser.id,
                amount,
                details
            })
        });

        return await res.json();
    };

    if (!currentUser) return <div>Loading...</div>;

    const tabs = [
        { id: 'dice' as const, label: 'HIGH & LOW', icon: '🎲' },
        { id: 'blackjack' as const, label: 'ブラックジャック', icon: '🃏' },
        { id: 'slot' as const, label: 'スロット', icon: '🎰' },
        { id: 'horse' as const, label: '競馬', icon: '🏇' }
    ];

    return (
        <div className="pb-20">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold mb-6 text-center"
                style={{
                    background: 'linear-gradient(135deg, #d946ef 0%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}
            >
                🎰 カジノ 🎰
            </motion.h2>

            {/* Tab Navigation */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                marginBottom: '1.5rem'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.8rem 0.5rem',
                            borderRadius: '8px',
                            background: activeTab === tab.id
                                ? 'linear-gradient(135deg, #d946ef 0%, #f59e0b 100%)'
                                : '#f3f4f6',
                            color: activeTab === tab.id ? 'white' : '#1f2937',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(217, 70, 239, 0.3)' : 'none'
                        }}
                    >
                        <div>{tab.icon}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>{tab.label}</div>
                    </button>
                ))}
            </div>

            {/* Game Content */}
            <Card padding="lg">
                {activeTab === 'dice' && <Dice balance={currentUser.balance} onBet={(amt, guess) => handleBet('dice', amt, guess)} />}
                {activeTab === 'blackjack' && <BlackjackGame balance={currentUser.balance} onBet={(amt, det) => handleBet('blackjack', amt, det)} />}
                {activeTab === 'slot' && <SlotGame balance={currentUser.balance} onBet={(amt, det) => handleBet('slot', amt, det)} />}
                {activeTab === 'horse' && <HorseRaceGame balance={currentUser.balance} onBet={(amt, det) => handleBet('horse', amt, det)} />}
            </Card>
        </div>
    );
}
