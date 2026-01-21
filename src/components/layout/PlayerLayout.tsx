"use client";

import React from 'react';

import { useRef, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { useGame } from '@/context/GameContext';
import { Sidebar } from './Sidebar';
import { PageTransition } from './PageTransition';
import { SecretCodeInput } from './SecretCodeInput';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeThemeWrapper } from './TimeThemeWrapper';
import { useToast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/Button';

/*
 * A modernised version of the PlayerLayout component that incorporates a frosted glass header
 * using the new CSS variables defined in globals.css. The header background now uses
 * the `--glass-bg` and `--glass-border` variables for a subtle glassmorphic effect. We also
 * add a soft drop shadow for additional depth. These changes contribute to a more
 * contemporary look while maintaining readability across day and night themes.
 */

export const PlayerLayout: React.FC<{ children: React.ReactNode; id: string; initialData?: any }> = ({ children, id, initialData }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, gameState, login, refresh } = useGame();
  const { addToast } = useToast();
  const { mutate } = useSWRConfig();

  // SSRで取得したデータがあれば即座にキャッシュに反映
  useEffect(() => {
    if (initialData) {
      mutate('/api/game', initialData, false);
    }
  }, [initialData, mutate]);

  // Extract user ID from props and auto-login
  useEffect(() => {
    if (id && (!currentUser || currentUser.id !== id)) {
      login(id);
    }
  }, [id, currentUser, login]);

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
      const shouldPlaySound =
        newTrans.description?.includes('給付') ||
        newTrans.description?.includes('送金') ||
        newTrans.description?.includes('支払い完了') ||
        newTrans.description?.includes('受取') ||
        (newTrans.type === 'income' &&
          (newTrans.description?.includes('給付') || newTrans.description?.includes('送金')));

      if (shouldPlaySound) {
        const audio = new Audio('/sounds/peipei.mp3');
        audio.volume = 0.8;
        audio.play().catch(e => console.log('Audio play failed', e));
      }
    }
    prevTransLength.current = currentUser.transactions.length;
  }, [currentUser?.transactions]);

  const activeBills =
    gameState?.requests.filter(
      r => r.type === 'bill' && r.details === currentUser?.id && r.status === 'pending'
    ) || [];

  const handleSecretUnlock = async (code: string) => {
    const res = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'unlock_secret',
        requesterId: currentUser?.id,
        details: code,
      }),
    });

    const data = await res.json();
    if (data.success) {
      addToast(data.message || '解放されました！', 'success');
    } else {
      addToast(data.message || 'コードが無効です', 'error');
    }
  };

  if (!currentUser) return <>{children}</>;

  const basePath = `/player/${currentUser.id}`;
  const navItems = [
    { label: 'マップ', path: `${basePath}/map`, icon: '🗺️' },
    { label: '収入', path: `${basePath}`, icon: '💰' },
    { label: '借金', path: `${basePath}/debt`, icon: '💸' },
    { label: '支払い', path: `${basePath}/payment`, icon: '🧾' },
    { label: '履歴', path: `${basePath}/history`, icon: '📜' },
    { label: 'スマホ', path: `${basePath}/smartphone`, icon: '📱' },
    { label: 'マイショップ', path: `${basePath}/shop`, icon: '🛍️' },
    { label: '不動産', path: `${basePath}/realestate`, icon: '🏠' },
    { label: '通勤', path: `${basePath}/commute`, icon: '🚃' },
    { label: '資格・試験', path: `${basePath}/qualifications`, icon: '🎓' },
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

  if (currentUser.isTimeMachineUnlocked) {
    navItems.push({ label: 'タイムマシン', path: `${basePath}/timemachine`, icon: '⌛' });
  }


  const formatTime = (ms: number) => {
    if (isNaN(ms) || ms < 0) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Determine if current path is the forbidden page for conditional styling
  const isForbiddenPage = pathname?.includes('/forbidden');

  return (
    <TimeThemeWrapper>
      <div
        style={{
          height: '100vh',
          overflowY: 'auto',
          paddingBottom: '80px',
          background: isForbiddenPage ? '#111' : undefined,
          WebkitOverflowScrolling: 'touch'
        }}
      >

        {/* Animated Notifications */}
        <AnimatePresence>
          {activeBills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                position: 'fixed',
                top: '80px',
                left: '1rem',
                right: '1rem',
                zIndex: 100,
                background: '#ef4444',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                <div style={{ fontWeight: 'bold' }}>⚠️ 請求が届いています</div>
                <div style={{ fontSize: '0.9rem' }}>
                  {activeBills.length}件の支払いが求められています。銀行員が承認すると引き落とされます。
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Night Blocking Overlay */}
        <AnimatePresence>
          {gameState && !gameState.isDay && (
            <>
              {/* Allow Home and Smartphone, Block others */}
              {!(pathname === basePath || pathname?.includes('/smartphone')) ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'rgba(15, 23, 42, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center',
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
                  <h2
                    style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}
                  >
                    夜は必ず寝ましょう
                  </h2>
                  <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>次の朝までお待ちください...</p>
                  <div style={{ marginTop: '2rem', fontFamily: 'monospace', fontSize: '1.5rem' }}>
                    あと {formatTime(displayTime)}
                  </div>
                  <div className="mt-8">
                    <button
                      onClick={() => {
                        window.location.href = basePath;
                      }}
                      className="px-6 py-2 bg-indigo-600 rounded-full font-bold hover:bg-indigo-700 transition"
                    >
                      🏠 自宅に戻る
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Non-intrusive Night Mode Indicator for Allowed Pages */
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed top-20 right-4 z-40 bg-slate-900/90 text-indigo-200 px-4 py-2 rounded-full border border-indigo-500/30 shadow-lg backdrop-blur-md flex items-center gap-2"
                >
                  <span className="text-xl">🌙</span>
                  <span className="font-bold text-sm">夜間モード中 (機能制限あり)</span>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <header
          className="sticky top-0 z-50 transition-all duration-500"
          style={{
            background: gameState?.isDay ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: gameState?.isDay ? '#1e293b' : '#fff',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Navigation Fix for Bankers */}
            {currentUser.role === 'banker' && (
              <Button
                onClick={() => router.push('/banker')}
                size="sm"
                className="bg-rose-500 hover:bg-rose-600 text-white border-0 shadow-lg shadow-rose-500/30 font-bold px-3 py-1 text-xs"
              >
                🏦 銀行員に戻る
              </Button>
            )}
            <div>
              <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                Term {gameState?.turn}
              </div>
              <div style={{ fontWeight: 'bold' }}>{currentUser.name}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="flex flex-col items-end">
              <div className="text-xs font-bold opacity-80 mb-0.5">
                {gameState?.isDay ? '☀️ DAYTIME' : '🌙 NIGHTTIME'}
              </div>
              <div className="font-mono font-bold text-lg leading-none">
                {formatTime(displayTime)}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Page Transition */}
        <main style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          <Sidebar title={currentUser.name} items={navItems} role="player" player={currentUser}>
            <SecretCodeInput onUnlock={handleSecretUnlock} />
          </Sidebar>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </TimeThemeWrapper>
  );
};