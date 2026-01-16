'use client';

import { useRef, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Sidebar } from './Sidebar';

export const PlayerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const { currentUser, gameState } = useGame();
    const [notifications, setNotifications] = useState<string[]>([]);
    const prevRequestsRef = useRef<number>(0);

    // Notification Logic
    useEffect(() => {
        if (!gameState || !currentUser) return;

        const myRequests = gameState.requests.filter(r => r.requesterId === currentUser.id);
        const billRequests = gameState.requests.filter(r => r.type === 'bill' && r.details === currentUser.id && r.status === 'pending');

        // Check for state changes or new bills
        // This is a simplified check. Ideally we track individual request status changes.
        // For now, let's just alert on new bills.

        if (billRequests.length > 0) {
            // Dedupe? 
            // We'll just show the latest one if it's new?
            // Let's iterate and show.
            // Simplified: Just show "Y bills" if any pending bill exists.

            // Actually user asked for "Action Request Notification"
            // Let's simple check:
        }

        // Better approach:
        // We can just query pending bills and show a persistent alert if any exist.
        // And transient toast for status updates.

    }, [gameState, currentUser]);

    // Simple Notification Component (Inline)
    const activeBills = gameState?.requests.filter(r => r.type === 'bill' && r.details === currentUser?.id && r.status === 'pending') || [];

    if (!currentUser) return <>{children}</>;

    const basePath = `/player/${currentUser.id}`;

    const navItems = [
        { label: '収入', path: `${basePath}`, icon: '💰' },
        { label: '借金', path: `${basePath}/debt`, icon: '💸' },
        { label: '支払い', path: `${basePath}/payment`, icon: '🧾' },
        { label: '株', path: `${basePath}/stock`, icon: '📈' },
        { label: '仕事', path: `${basePath}/job`, icon: '🛠️' },
        { label: 'ルーレット結果', path: `${basePath}/roulette`, icon: '🎲' },
    ];

    if (currentUser.isForbiddenUnlocked) {
        navItems.push({ label: '闇市場', path: `${basePath}/forbidden`, icon: '💀' });
    }

    const handleSecret = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const val = e.currentTarget.value;
            if (val === 'Zodiac77') {
                if (confirm('禁断の知恵に触れますか...？')) {
                    await fetch('/api/action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'unlock_forbidden',
                            requesterId: currentUser.id,
                            amount: 0
                        })
                    });
                    alert('世界が変わった気がする...');
                }
            }
            e.currentTarget.value = '';
        }
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px', background: currentUser.isForbiddenUnlocked ? '#111' : undefined }}>
            {/* Notifications */}
            {activeBills.length > 0 && (
                <div style={{ position: 'fixed', top: '70px', left: '1rem', right: '1rem', zIndex: 100, background: '#ef4444', color: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', animation: 'slideDown 0.3s ease' }}>
                    <div style={{ fontWeight: 'bold' }}>⚠️ 請求が届いています</div>
                    <div style={{ fontSize: '0.9rem' }}>{activeBills.length}件の支払いが求められています。銀行員が承認すると引き落とされます。</div>
                </div>
            )}

            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ fontWeight: 'bold' }}>{currentUser.name}</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>所持金:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                        {currentUser.balance.toLocaleString()}枚
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ padding: '4rem 1rem 1rem 1rem' }}>
                <Sidebar title={currentUser.name} items={navItems} role="player" />
                {children}

                {/* Secret Input */}
                {!currentUser.isForbiddenUnlocked && (
                    <div style={{ marginTop: '3rem', opacity: 0.3, textAlign: 'center' }}>
                        <input
                            type="password"
                            placeholder="何か知ってる？"
                            onKeyDown={handleSecret}
                            style={{ background: 'transparent', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '4px' }}
                        />
                    </div>
                )}
            </main>

            <style jsx global>{`
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
