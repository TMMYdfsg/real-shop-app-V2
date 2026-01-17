'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { RouletteWheel } from '@/components/minigames/RouletteWheel';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfettiEffect } from '@/components/effects/GenericEffects';

export default function RouletteViewPage() {
    const { gameState, currentUser } = useGame();
    const [isSpinning, setIsSpinning] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [confettiTrigger, setConfettiTrigger] = useState(0);

    // Track the last processed result timestamp to avoid re-spinning on reload logic if desired,
    // or just checking if result changed.
    const lastResultTimeRef = useRef<number>(0);
    const [spinTargetIndex, setSpinTargetIndex] = useState<number | null>(null);

    // Default Items if empty (fallback)
    const items = gameState?.roulette.items && gameState.roulette.items.length > 0
        ? gameState.roulette.items
        : [{ id: 1, text: 'No Data', effect: 'none', weight: 1 }];

    useEffect(() => {
        if (!gameState?.roulette.currentResult) return;

        const result = gameState.roulette.currentResult;

        // If this is a new result we haven't seen (or processed)
        if (result.timestamp > lastResultTimeRef.current) {
            // Find the index of the result item
            const idx = items.findIndex(i => i.text === result.text); // Matching by text or ID is safer
            if (idx !== -1) {
                // New Spin!
                lastResultTimeRef.current = result.timestamp;
                setSpinTargetIndex(idx);
                setShowResult(false);
                setIsSpinning(true);
            }
        } else {
            // Already processed, just show result if not showing spinner
            if (!isSpinning && !showResult) {
                setShowResult(true);
                setSpinTargetIndex(items.findIndex(i => i.text === result.text));
            }
        }
    }, [gameState?.roulette.currentResult, items, isSpinning, showResult]);

    const handleSpinComplete = () => {
        setIsSpinning(false);
        setShowResult(true);
        setConfettiTrigger(Date.now());

        // Play Sound
        const audio = new Audio('/sounds/fanfare.mp3'); // path to assume
        audio.play().catch(e => console.log('Audio play failed', e)); // ignore if missing
    };

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const result = gameState.roulette.currentResult;
    let targetDisplay = '全員';
    if (result?.targetUserId) {
        if (result.targetUserId === currentUser.id) {
            targetDisplay = 'あなた';
        } else {
            const targetUser = gameState.users.find(u => u.id === result.targetUserId);
            targetDisplay = targetUser ? targetUser.name : '指定ユーザー';
        }
    }

    return (
        <div style={{ textAlign: 'center', padding: '1rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ConfettiEffect trigger={confettiTrigger} />

            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>ルーレットチャンス</h2>

            <div style={{ marginBottom: '2rem' }}>
                <RouletteWheel
                    items={items}
                    resultIndex={spinTargetIndex}
                    isSpinning={isSpinning}
                    onComplete={handleSpinComplete}
                />
            </div>

            {/* Prize List */}
            <Card padding="md" style={{ width: '100%', maxWidth: '500px', marginBottom: '1rem', textAlign: 'left' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>🎯 景品リスト</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                    {items.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: '#333', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', fontWeight: 'bold'
                            }}>
                                {index + 1}
                            </div>
                            <div style={{ fontWeight: item.text === result?.text ? 'bold' : 'normal' }}>
                                {item.text}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                {/* Optional: Show effect hint? */}
                                {item.effect !== 'none' && '✨'}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </Card>

            <AnimatePresence>
                {showResult && result && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        style={{ width: '100%', maxWidth: '400px' }}
                    >
                        <Card padding="lg" style={{ border: '4px solid #fcd34d' }}>
                            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                結果発表 ({new Date(result.timestamp).toLocaleTimeString()})
                            </div>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: 'var(--accent-color)',
                                padding: '1rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: '12px',
                                marginBottom: '1rem'
                            }}>
                                {result.text}
                            </div>
                            <div style={{ fontSize: '1.2rem' }}>
                                対象: <span style={{ fontWeight: 'bold', color: '#e11d48' }}>{targetDisplay}</span>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isSpinning && !showResult && !result && (
                <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>
                    銀行員の合図を待ってください...
                </div>
            )}
        </div>
    );
}
