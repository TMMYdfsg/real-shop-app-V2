"use client";

import React from 'react';

import { useRef, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { useGame } from '@/context/GameContext';
import { AppShell } from '@/components/shell/AppShell';
import { PageTransition } from './PageTransition';
import { SecretCodeInput } from './SecretCodeInput';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeThemeWrapper } from './TimeThemeWrapper';
import { useToast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/Button';

/*
 * PlayerLayout の見た目を整えるためのメモです。
 * 画面全体のトーンは tokens のサーフェス/影をベースに統一します。
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

  // 効果音用の単一オーディオインスタンス（重複再生防止）
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!gameState) return;

    // 昼夜切替時の効果音（単一インスタンスで管理）
    if (lastDayStatus.current !== gameState.isDay) {
      const soundFile = gameState.isDay ? '/sounds/day.mp3' : '/sounds/night.mp3';

      // 既存の音声をフェードアウトして停止
      if (bgmAudioRef.current) {
        const oldAudio = bgmAudioRef.current;
        const fadeOut = setInterval(() => {
          if (oldAudio.volume > 0.1) {
            oldAudio.volume = Math.max(0, oldAudio.volume - 0.1);
          } else {
            clearInterval(fadeOut);
            oldAudio.pause();
            oldAudio.src = '';
          }
        }, 50);
      }

      // 新しい音声を再生（少し遅延させてフェードアウトと重ならないようにする）
      setTimeout(() => {
        const audio = new Audio(soundFile);
        audio.volume = 0;
        bgmAudioRef.current = audio;

        audio.play().then(() => {
          const fadeIn = setInterval(() => {
            if (audio.volume < 0.5) {
              audio.volume = Math.min(0.5, audio.volume + 0.1);
            } else {
              clearInterval(fadeIn);
            }
          }, 50);
        }).catch(e => console.log('効果音再生エラー:', e));
      }, 300);

      lastDayStatus.current = gameState.isDay;
    }

    // タイマーロジック
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
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
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

  const shellNavItems = navItems.map((item) => ({
    label: item.label,
    href: item.path,
    icon: item.icon,
    active: pathname === item.path || pathname?.startsWith(`${item.path}/`),
  }));

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
      <div className={`player-shell ${isForbiddenPage ? "player-shell--forbidden" : ""}`}>
        <AnimatePresence>
          {activeBills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="ui-alert"
            >
              <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                <div className="ui-alert__title">⚠️ 請求が届いています</div>
                <div className="ui-alert__body">
                  {activeBills.length}件の支払いが求められています。銀行員が承認すると引き落とされます。
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {gameState && !gameState.isDay && (
            <>
              {!(pathname === basePath || pathname?.includes('/smartphone')) ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="night-overlay"
                >
                  <audio autoPlay loop src="/sounds/sleep.mp3" />
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="night-overlay__icon"
                  >
                    🌙
                  </motion.div>
                  <h2 className="night-overlay__title">夜は必ず寝ましょう</h2>
                  <p className="night-overlay__text">次の朝までお待ちください...</p>
                  <div className="night-overlay__timer">あと {formatTime(displayTime)}</div>
                  <Button onClick={() => { window.location.href = basePath; }}>
                    🏠 自宅に戻る
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="night-indicator"
                >
                  <span aria-hidden>🌙</span>
                  <span>夜間モード中 (機能制限あり)</span>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        <AppShell
          title={currentUser.name}
          navItems={shellNavItems}
          actions={
            <>
              {currentUser.role === 'banker' && (
                <Button onClick={() => router.push('/banker')} size="sm">
                  🏦 銀行員に戻る
                </Button>
              )}
              <div className="shell__status">
                <span>Term {gameState?.turn}</span>
                <span>{gameState?.isDay ? '☀️ DAY' : '🌙 NIGHT'}</span>
                <span>{formatTime(displayTime)}</span>
              </div>
            </>
          }
        >
          <SecretCodeInput onUnlock={handleSecretUnlock} />
          <PageTransition>{children}</PageTransition>
        </AppShell>
      </div>
    </TimeThemeWrapper>
  );
};
