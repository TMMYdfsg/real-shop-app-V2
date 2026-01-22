import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { getVibrationAdapter, VibrationPatterns } from '@/lib/vibration';
import { AnimatePresence, motion } from 'framer-motion';
import { SmartphoneShell } from './SmartphoneShell';
import { StatusBar } from './StatusBar';
import { HomeScreen } from './HomeScreen';
import { useGame } from '@/context/GameContext';
import { SmartphoneLockScreen } from './SmartphoneLockScreen';
import PhoneApp from './PhoneApp';

// Apps
import UnifiedMessengerApp from './apps/UnifiedMessengerApp';
import PoliticsNewsApp from '@/components/smartphone/apps/PoliticsNewsApp';
import SNSApp from './SNSApp';
import VideoApp from './VideoApp';
import { JobBoardApp } from './apps/JobBoardApp';
import { BankAssetApp } from './apps/BankAssetApp';
import { LifeStatusApp } from './apps/LifeStatusApp';
import { AuditLogApp } from './apps/AuditLogApp';
import { QuestApp } from './apps/QuestApp';
import { ForbiddenApp } from './apps/ForbiddenApp';
import { SettingsApp } from './apps/SettingsApp';
import { VacationApp } from './apps/VacationApp';
import { FamilyApp } from './apps/FamilyApp';
import { QualificationsApp } from './apps/QualificationsApp';
import CityMap from '@/components/map/CityMap';
import { APPS } from './constants';
import { StoreApp } from './apps/StoreApp';
import { CameraApp } from './apps/CameraApp';

/*
 * This modified version of the SmartphoneOS component includes a more modern container for the phone shell.
 * The outer div no longer uses `min-h-screen`, which previously caused the seasonal wallpaper
 * to overrun and appear outside the phone frame on mobile devices. Instead, we now rely on the parent
 * container to size the phone correctly while keeping the OS content centred. Additionally, the outer
 * wrapper uses `h-full` and `w-full` to ensure it stretches only to the space allocated by its parent,
 * preventing any unwanted background growth on smaller screens.
 */

export const SmartphoneOS = () => {
  const { currentUser, gameState, sendRequest } = useGame();
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const autoLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [localInstalledIds, setLocalInstalledIds] = useState<string[] | null>(null);
  const [localAppOrder, setLocalAppOrder] = useState<string[] | null>(null);
  const reorderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRevisionRef = useRef<number | null>(null);
  const homeLockInitRef = useRef(false);
  const prevAppRef = useRef<string | null>(null);
  const skipHomeLockRef = useRef(false);
  const usageStartRef = useRef<number | null>(null);
  const chargeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chargeHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [chargeState, setChargeState] = useState<{ active: boolean; progress: number; status: 'charging' | 'done' }>({
    active: false,
    progress: 0,
    status: 'charging'
  });
  const timeEra = currentUser?.timeEra ?? 'present';
  const usageThresholdMs = 20 * 60 * 1000;
  const chargeDurationMs = 20 * 1000;

  const handleHome = useCallback(() => {
    const vibration = getVibrationAdapter();
    vibration.vibrate(VibrationPatterns.tap);
    setCurrentApp(null);
  }, []);

  const handleOpenApp = useCallback((appId: string) => {
    const vibration = getVibrationAdapter();
    vibration.vibrate(VibrationPatterns.tap);
    setCurrentApp(appId);
  }, []);

  const renderApp = () => {
    switch (currentApp) {
      case 'phone':
        return <PhoneApp onClose={handleHome} />;
      case 'messenger':
        return <UnifiedMessengerApp onClose={handleHome} initialTab="chats" />;
      case 'sns':
        return <SNSApp onClose={handleHome} />;
      case 'video':
        return <VideoApp onClose={handleHome} />;
      case 'politics':
      case 'news':
        return <PoliticsNewsApp onClose={handleHome} initialTab={currentApp === 'news' ? 'news' : 'politics'} />;
      case 'bank':
        return <BankAssetApp onBack={handleHome} />;
      case 'job_board':
        return <JobBoardApp onBack={handleHome} />;
      case 'life_status':
        return <LifeStatusApp onBack={handleHome} />;
      case 'audit_log':
        return <AuditLogApp onBack={handleHome} />;
      case 'quests':
        return <QuestApp onBack={handleHome} />;
      case 'dark_web':
        return <ForbiddenApp onBack={handleHome} />;
      case 'settings':
        return <SettingsApp onClose={handleHome} />;
      case 'vacation':
        return <VacationApp onBack={handleHome} />;
      case 'family':
        return <FamilyApp onBack={handleHome} />;
      case 'qualifications':
        return <QualificationsApp onBack={handleHome} />;
      case 'map':
        return <div className="h-full w-full overflow-hidden rounded-[2.8rem]"><CityMap /></div>;
      case 'camera':
        return <CameraApp onBack={handleHome} />;
      case 'shopping':
        return <StoreApp onBack={handleHome} />;
      default:
        return null;
    }
  };

  // Determine status bar color based on app; keep dark for apps unless on home screen.
  const getStatusBarVariant = (): 'light' | 'dark' => {
    if (!currentApp) return 'light';
    const lightApps = ['sns', 'politics', 'news', 'vacation'];
    return lightApps.includes(currentApp) ? 'light' : 'dark';
  };

  const statusBarVariant = getStatusBarVariant();
  const baseSettings = useMemo(() => ({
    theme: 'system' as const,
    autoLockSeconds: 60,
    autoLockOnUpdate: false,
    autoLockOnHome: true,
    textScale: 1,
    trueTone: true,
    passcode: '',
    biometricEnabled: false,
    lockScreenImage: ''
  }), []);
  const smartphoneSettings = useMemo(() => ({
    ...baseSettings,
    ...(currentUser?.smartphone?.settings || {})
  }), [baseSettings, currentUser?.smartphone?.settings]);
  const activeTheme = smartphoneSettings.theme === 'system' ? systemTheme : smartphoneSettings.theme;
  const isSecured = Boolean(smartphoneSettings.passcode) || Boolean(smartphoneSettings.biometricEnabled);
  const prevSecuredRef = useRef(isSecured);
  const autoLockMs = Math.max(0, smartphoneSettings.autoLockSeconds || 0) * 1000;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => setSystemTheme(media.matches ? 'dark' : 'light');
    updateTheme();
    media.addEventListener('change', updateTheme);
    return () => media.removeEventListener('change', updateTheme);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string[]>).detail;
      if (!Array.isArray(detail)) return;
      const normalized = Array.from(new Set([...detail, 'shopping']));
      setLocalInstalledIds(normalized);
    };
    window.addEventListener('smartphone-apps-updated', handler as EventListener);
    return () => window.removeEventListener('smartphone-apps-updated', handler as EventListener);
  }, []);

  useEffect(() => {
    return () => {
      if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
      if (chargeTimerRef.current) clearInterval(chargeTimerRef.current);
      if (chargeHideTimerRef.current) clearTimeout(chargeHideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setLocalInstalledIds(null);
    setLocalAppOrder(null);
  }, [currentUser?.id]);

  useEffect(() => {
    const prev = prevSecuredRef.current;
    if (!prev && isSecured) setIsLocked(true);
    if (prev && !isSecured) setIsLocked(false);
    prevSecuredRef.current = isSecured;
  }, [isSecured]);

  useEffect(() => {
    const revision = gameState?.eventRevision;
    if (typeof revision !== 'number') return;
    const prev = prevRevisionRef.current;
    if (prev !== null && prev !== revision && smartphoneSettings.autoLockOnUpdate) {
      setIsLocked(true);
    }
    prevRevisionRef.current = revision;
  }, [gameState?.eventRevision, smartphoneSettings.autoLockOnUpdate]);

  useEffect(() => {
    if (!smartphoneSettings.autoLockOnHome) {
      prevAppRef.current = currentApp;
      return;
    }
    const prevApp = prevAppRef.current;
    if (currentApp === null && prevApp === null && !homeLockInitRef.current) {
      homeLockInitRef.current = true;
      if (!isLocked) setIsLocked(true);
    } else if (currentApp === null && prevApp !== null && !isLocked) {
      if (skipHomeLockRef.current) {
        skipHomeLockRef.current = false;
      } else {
        setIsLocked(true);
      }
    }
    prevAppRef.current = currentApp;
  }, [currentApp, isLocked, smartphoneSettings.autoLockOnHome]);

  useEffect(() => {
    if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
    if (isLocked || autoLockMs <= 0) return;

    const schedule = () => {
      if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
      autoLockTimerRef.current = setTimeout(() => setIsLocked(true), autoLockMs);
    };

    const handleActivity = () => schedule();
    schedule();

    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [autoLockMs, isLocked]);

  useEffect(() => {
    if (isLocked) {
      usageStartRef.current = null;
    } else if (!usageStartRef.current) {
      usageStartRef.current = Date.now();
    }
  }, [isLocked]);

  const startCharging = useCallback((startedAt: number, persist: boolean) => {
    if (chargeTimerRef.current) clearInterval(chargeTimerRef.current);
    if (chargeHideTimerRef.current) clearTimeout(chargeHideTimerRef.current);
    setChargeState({ active: true, progress: 0, status: 'charging' });
    if (persist && currentUser) {
      sendRequest('update_profile', 0, {
        smartphone: {
          isCharging: true,
          chargeStartedAt: startedAt
        }
      });
    }

    chargeTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(100, Math.floor((elapsed / chargeDurationMs) * 100));
      if (progress >= 100) {
        if (chargeTimerRef.current) clearInterval(chargeTimerRef.current);
        setChargeState({ active: true, progress: 100, status: 'done' });
        usageStartRef.current = Date.now();
        if (currentUser) {
          sendRequest('update_profile', 0, {
            smartphone: {
              isCharging: false,
              battery: 100
            }
          });
        }
        chargeHideTimerRef.current = setTimeout(() => {
          setChargeState((prev) => ({ ...prev, active: false }));
        }, 1600);
        return;
      }
      setChargeState({ active: true, progress, status: 'charging' });
    }, 400);
  }, [chargeDurationMs, currentUser, sendRequest]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.smartphone?.isCharging && currentUser.smartphone.chargeStartedAt) {
      startCharging(currentUser.smartphone.chargeStartedAt, false);
    }
  }, [currentUser, startCharging]);

  useEffect(() => {
    if (isLocked || chargeState.active) return;
    const interval = setInterval(() => {
      if (isLocked || chargeState.active) return;
      if (!usageStartRef.current) return;
      const elapsed = Date.now() - usageStartRef.current;
      if (elapsed >= usageThresholdMs && currentUser) {
        startCharging(Date.now(), true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [chargeState.active, currentUser, isLocked, startCharging, usageThresholdMs]);

  const screenFilters = useMemo(() => {
    const filters: string[] = [];
    if (activeTheme === 'dark') {
      filters.push('brightness(0.9) contrast(1.05)');
    }
    if (smartphoneSettings.trueTone) {
      filters.push('sepia(0.12) saturate(1.05)');
    }
    return filters.join(' ');
  }, [activeTheme, smartphoneSettings.trueTone]);

  const screenStyle = useMemo(() => {
    const scale = smartphoneSettings.textScale || 1;
    return {
      filter: screenFilters || undefined,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      width: `${100 / scale}%`,
      height: `${100 / scale}%`
    };
  }, [smartphoneSettings.textScale, screenFilters]);

  const toneOverlay = smartphoneSettings.trueTone
    ? <div className="absolute inset-0 bg-amber-200/10 mix-blend-soft-light pointer-events-none z-30" />
    : null;

  if (timeEra === 'past') {
    return (
      <div className="flex items-center justify-center h-full w-full bg-transparent py-2">
        <SmartphoneShell onHome={handleHome} screenStyle={screenStyle} toneOverlay={toneOverlay}>
          <StatusBar variant="light" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f3e6c2] via-[#e7d4a3] to-[#d4b377] text-[#3b2f1f] flex flex-col items-center justify-center px-6 text-center">
            <div className="text-5xl mb-4">📵</div>
            <h2 className="text-xl font-black mb-2">1950年代では使用できません</h2>
            <p className="text-sm font-medium">スマホはこの時代には存在しないため、利用できません。</p>
            <p className="text-xs mt-4 opacity-70">タイムマシンで現在へ戻ってください。</p>
          </div>
        </SmartphoneShell>
      </div>
    );
  }

  const installedAppIds = useMemo(() => {
    const source = localInstalledIds ?? currentUser?.smartphone?.apps ?? [];
    const normalized = new Set(source);
    normalized.add('shopping');
    return Array.from(normalized);
  }, [localInstalledIds, currentUser?.smartphone?.apps]);

  useEffect(() => {
    if (!localInstalledIds) return;
    const serverApps = currentUser?.smartphone?.apps ?? [];
    const serverSet = new Set([...serverApps, 'shopping']);
    const localSet = new Set(localInstalledIds);
    if (serverSet.size !== localSet.size) return;
    for (const id of localSet) {
      if (!serverSet.has(id)) return;
    }
    setLocalInstalledIds(null);
  }, [localInstalledIds, currentUser?.smartphone?.apps]);

  useEffect(() => {
    if (!localAppOrder) return;
    const serverOrder = currentUser?.smartphone?.appOrder;
    if (!serverOrder) return;
    if (localAppOrder.length !== serverOrder.length) return;
    for (let i = 0; i < localAppOrder.length; i += 1) {
      if (localAppOrder[i] !== serverOrder[i]) return;
    }
    setLocalAppOrder(null);
  }, [localAppOrder, currentUser?.smartphone?.appOrder]);

  const orderedAppIds = useMemo(() => {
    const source = localAppOrder ?? currentUser?.smartphone?.appOrder ?? [];
    const installedSet = new Set(installedAppIds);
    const next: string[] = [];
    const used = new Set<string>();
    for (const id of source) {
      if (installedSet.has(id) && !used.has(id)) {
        next.push(id);
        used.add(id);
      }
    }
    for (const id of installedAppIds) {
      if (!used.has(id)) {
        next.push(id);
        used.add(id);
      }
    }
    return next;
  }, [localAppOrder, currentUser?.smartphone?.appOrder, installedAppIds]);

  const homeApps = useMemo(() => {
    return orderedAppIds
      .map(id => APPS.find(app => app.id === id))
      .filter((app): app is (typeof APPS)[number] => Boolean(app));
  }, [orderedAppIds]);

  const handleReorder = useCallback((nextOrder: string[]) => {
    const installedSet = new Set(installedAppIds);
    const cleaned = nextOrder.filter(id => installedSet.has(id));
    if (!cleaned.includes('shopping')) cleaned.push('shopping');
    setLocalAppOrder(cleaned);
    if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
    reorderTimerRef.current = setTimeout(() => {
      sendRequest('update_profile', 0, { smartphone: { appOrder: cleaned } });
    }, 500);
  }, [installedAppIds, sendRequest]);

  return (
    <div className="flex items-center justify-center h-full w-full bg-transparent py-2">
      <SmartphoneShell onHome={handleHome} screenStyle={screenStyle} toneOverlay={toneOverlay}>
        <StatusBar variant={statusBarVariant} />

        <AnimatePresence mode="wait">
          {!currentApp && (
            <motion.div
              key="home"
              layout={false}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
              className="w-full h-full absolute inset-0"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <HomeScreen onOpenApp={handleOpenApp} apps={homeApps} onReorder={handleReorder} era={timeEra} />
            </motion.div>
          )}

          {currentApp && (
            <motion.div
              key="app"
              layout={false}
              initial={{ y: '100%', opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full h-full absolute inset-0 bg-white z-20 overflow-hidden"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              {/* App Container - adds some padding top for status bar if needed. */}
              {renderApp()}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLocked && (
            <motion.div
              key="lock"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SmartphoneLockScreen
                passcode={smartphoneSettings.passcode || undefined}
                biometricEnabled={smartphoneSettings.biometricEnabled}
                backgroundImage={smartphoneSettings.lockScreenImage || undefined}
                onUnlock={() => {
                  skipHomeLockRef.current = true;
                  setIsLocked(false);
                  setTimeout(() => {
                    skipHomeLockRef.current = false;
                  }, 800);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {chargeState.active && (
            <motion.div
              key="charging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-md"
            >
              <div className="w-[80%] bg-white/90 rounded-2xl p-5 text-center shadow-2xl">
                <div className="text-sm font-black text-slate-900">
                  {chargeState.status === 'done' ? '充電完了！' : '充電中...'}
                </div>
                <div className="mt-3 h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${chargeState.progress}%` }}
                  />
                </div>
                <div className="mt-2 text-[10px] text-slate-600">
                  {chargeState.progress}%
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SmartphoneShell>
    </div>
  );
};
