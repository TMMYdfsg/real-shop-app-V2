import React, { useState, useCallback } from 'react';
import { getVibrationAdapter, VibrationPatterns } from '@/lib/vibration';
import { AnimatePresence, motion } from 'framer-motion';
import { SmartphoneShell } from './SmartphoneShell';
import { StatusBar } from './StatusBar';
import { HomeScreen } from './HomeScreen';
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
import CityMap from '@/components/map/CityMap';

/*
 * This modified version of the SmartphoneOS component includes a more modern container for the phone shell.
 * The outer div no longer uses `min-h-screen`, which previously caused the seasonal wallpaper
 * to overrun and appear outside the phone frame on mobile devices. Instead, we now rely on the parent
 * container to size the phone correctly while keeping the OS content centred. Additionally, the outer
 * wrapper uses `h-full` and `w-full` to ensure it stretches only to the space allocated by its parent,
 * preventing any unwanted background growth on smaller screens.
 */

export const SmartphoneOS = () => {
  const [currentApp, setCurrentApp] = useState<string | null>(null);

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
      case 'map':
        return <div className="h-full w-full overflow-hidden rounded-[2.8rem]"><CityMap /></div>;
      case 'camera':
        return <div className="p-8 text-black font-bold text-center mt-20">カメラは起動できません</div>;
      case 'shopping':
        return <div className="p-8 text-black font-bold text-center mt-20">準備中</div>;
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

  return (
    <div className="flex items-center justify-center h-full w-full bg-transparent py-2">
      <SmartphoneShell onHome={handleHome}>
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
              <HomeScreen onOpenApp={handleOpenApp} />
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
      </SmartphoneShell>
    </div>
  );
};
