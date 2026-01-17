'use client';

import { useRef, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { PageTransition } from './PageTransition';
import { SecretCodeInput } from './SecretCodeInput';
import { motion, AnimatePresence } from 'framer-motion';

import { EventAnnouncement, ActiveEventBar } from '@/components/effects/EventAnnouncement';

export const PlayerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const { currentUser, gameState, login } = useGame();

    // Extract user ID from pathname and auto-login
    useEffect(() => {
        const match = pathname.match(/\/player\/([^\/]+)/);
        if (match && match[1]) {
            const userId = match[1];
            if (!currentUser || currentUser.id !== userId) {
                login(userId);
            }
        }
    }, [pathname, currentUser, login]);

    // Notification logic kept simple for now

    // ... Timer Logic ...
    const [displayTime, setDisplayTime] = useState<number>(gameState?.timeRemaining || 0);
    const lastDayStatus = useRef<boolean>(gameState?.isDay ?? true);

    useEffect(() => {
        if (!gameState) return;

        // SE Check
        if (lastDayStatus.current !== gameState.isDay) {
            const soundFile = gameState.isDay ? '/sounds/day.mp3' : '/sounds/night.mp3';
            const audio = new Audio(soundFile);
            audio.volume = 0.5;
            audio.play().catch(e => console.log('SE Check:', e));
            lastDayStatus.current = gameState.isDay;
        }

        // Timer Logic
        let animationFrameId: number;
        const startTimestamp = Date.now();
        const initialRemaining = gameState.timeRemaining;

        const updateTimer = () => {
            const elapsed = Date.now() - startTimestamp;
            const currentRemaining = Math.max(0, initialRemaining - elapsed);
            setDisplayTime(currentRemaining);
            animationFrameId = requestAnimationFrame(updateTimer);
        };

        updateTimer();
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState]);

    // Income Sound Effect (PeiPei)
    const prevTransLength = useRef(currentUser?.transactions?.length || 0);

    useEffect(() => {
        if (!currentUser?.transactions) return;

        // Skip initial load to prevent sound on page load
        if (prevTransLength.current === 0 && currentUser.transactions.length > 0) {
            prevTransLength.current = currentUser.transactions.length;
            return;
        }

        if (currentUser.transactions.length > prevTransLength.current) {
            const newTrans = currentUser.transactions[currentUser.transactions.length - 1];

            // Only play sound for specific transaction types: grants, transfers, payments
            const shouldPlaySound = newTrans.description?.includes('給付') ||
                newTrans.description?.includes('送金') ||
                newTrans.description?.includes('支払い完了') ||
                newTrans.description?.includes('受取') ||
                (newTrans.type === 'income' && (
                    newTrans.description?.includes('給付') ||
                    newTrans.description?.includes('送金')
                ));

            if (shouldPlaySound) {
                const audio = new Audio('/sounds/peipei.mp3');
                audio.volume = 0.8;
                audio.play().catch(e => console.log('Audio play failed', e));
            }
        }
        prevTransLength.current = currentUser.transactions.length;
    }, [currentUser?.transactions]);

    const activeBills = gameState?.requests.filter(r => r.type === 'bill' && r.details === currentUser?.id && r.status === 'pending') || [];

    const handleSecretUnlock = async (code: string) => {
        const res = await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'unlock_secret',
                requesterId: currentUser?.id,
                details: code
            })
        });

        const data = await res.json();
        if (data.success) {
            alert(data.message || '解放されました！');
        } else {
            alert(data.message || 'コードが無効です');
        }
    };

    if (!currentUser) return <>{children}</>;

    const basePath = `/player/${currentUser.id}`;
    const navItems = [
        { label: '収入', path: `${basePath}`, icon: '💰' },
        { label: '借金', path: `${basePath}/debt`, icon: '💸' },
        { label: '支払い', path: `${basePath}/payment`, icon: '🧾' },
        { label: '履歴', path: `${basePath}/history`, icon: '📜' },
        { label: 'マイショップ', path: `${basePath}/shop`, icon: '🛍️' },
        { label: '不動産', path: `${basePath}/realestate`, icon: '🏠' },
        { label: 'ポイント', path: `${basePath}/points`, icon: '💳' },
        { label: '株', path: `${basePath}/stock`, icon: '📈' },
        { label: '貯金', path: `${basePath}/bank`, icon: '🏦' },
        { label: 'ハローワーク', path: `${basePath}/job`, icon: '🏢' },
        { label: '仕事をする', path: `${basePath}/special`, icon: '🛠️' },
        { label: 'カジノ', path: `${basePath}/casino`, icon: '🎰' },
        { label: 'キッチン', path: `${basePath}/kitchen`, icon: '🍳' },
        { label: 'コレクション', path: `${basePath}/collection`, icon: '🎁' },
        { label: 'マイルーム', path: `${basePath}/room`, icon: '🏠' },
        { label: 'ルーレット結果', path: `${basePath}/roulette`, icon: '🎲' },
        { label: 'ランキング', path: `${basePath}/ranking`, icon: '🏆' },
        { label: '設定', path: `${basePath}/config`, icon: '⚙️' },
    ];

    if (currentUser.isForbiddenUnlocked) {
        navItems.push({ label: '闇市場', path: `${basePath}/forbidden`, icon: '💀' });
    }

    const formatTime = (ms: number) => {
        if (isNaN(ms) || ms < 0) return '0:00';
        const seconds = Math.floor(ms / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSecret = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const val = e.currentTarget.value;
            if (val === 'Zodiac77') {
                if (confirm('禁断の知恵に触れますか...？')) {
                    await fetch('/api/action', {
                        method: 'POST',
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

    // 闇市場ページでのみ黒背景を適用
    const isForbiddenPage = pathname?.includes('/forbidden');

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px', background: isForbiddenPage ? '#111' : '#e0f2fe' }}>
            {/* Animated Notifications */}
            <AnimatePresence>
                {activeBills.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{ position: 'fixed', top: '70px', left: '1rem', right: '1rem', zIndex: 100, background: '#ef4444', color: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    >
                        <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>⚠️ 請求が届いています</div>
                            <div style={{ fontSize: '0.9rem' }}>{activeBills.length}件の支払いが求められています。銀行員が承認すると引き落とされます。</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Night Blocking Overlay */}
            <AnimatePresence>
                {gameState && !gameState.isDay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(15, 23, 42, 0.95)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            color: 'white', textAlign: 'center'
                        }}
                    >
                        <audio autoPlay loop src="/sounds/sleep.mp3" />
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            style={{ fontSize: '4rem', marginBottom: '1rem' }}
                        >
                            🌙
                        </motion.div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>夜は必ず寝ましょう</h2>
                        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>次の朝までお待ちください...</p>
                        <div style={{ marginTop: '2rem', fontFamily: 'monospace', fontSize: '1.5rem' }}>
                            あと {formatTime(displayTime)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                background: gameState?.isDay ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: gameState?.isDay ? '#000' : '#fff',
                transition: 'all 0.5s'
            }}>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Turn {gameState?.turn}</div>
                    <div style={{ fontWeight: 'bold' }}>{currentUser.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem' }}>
                        <span style={{ marginRight: '0.5rem', color: '#fbbf24' }}>
                            {'★'.repeat(currentUser.rating || 0)}{'☆'.repeat(5 - (currentUser.rating || 0))}
                        </span>
                        {gameState?.isDay ? '☀️ 昼' : '🌙 夜'} {formatTime(displayTime)}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>所持金:</span>
                        <motion.span
                            key={currentUser.balance}
                            initial={{ scale: 1.2, color: '#3b82f6' }}
                            animate={{ scale: 1, color: 'var(--accent-color)' }}
                            style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                        >
                            {(currentUser.balance || 0).toLocaleString()}
                        </motion.span>
                    </div>
                </div>
            </header>

            {/* Main Content with Page Transition */}
            <main style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                <Sidebar title={currentUser.name} items={navItems} role="player">
                    {!currentUser.isForbiddenUnlocked && (
                        <SecretCodeInput onUnlock={handleSecretUnlock} />
                    )}
                </Sidebar>
                <PageTransition>
                    {children}
                </PageTransition>
            </main>
        </div>
    );
};
