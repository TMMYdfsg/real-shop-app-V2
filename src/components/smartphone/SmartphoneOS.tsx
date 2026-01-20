import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SmartphoneShell } from './SmartphoneShell';
import { StatusBar } from './StatusBar';
import { HomeScreen } from './HomeScreen';
import { useSearchParams, useRouter } from 'next/navigation';

// Apps
import PhoneApp from './PhoneApp';
import MessengerApp from './MessengerApp';
import SNSApp from './SNSApp';
import VideoApp from './VideoApp';
import NewsApp from './NewsApp';
import { CryptoApp } from './CryptoApp';
import { JobBoardApp } from './apps/JobBoardApp';
import { BankApp } from './apps/BankApp';
// import { LifeStatusApp } from './apps/LifeStatusApp'; // Check existing file name
import { LifeStatusApp } from './apps/LifeStatusApp';
import { AuditLogApp } from './apps/AuditLogApp';
import { QuestApp } from './apps/QuestApp';
import { ForbiddenApp } from './apps/ForbiddenApp';

export const SmartphoneOS = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [currentApp, setCurrentApp] = useState<string | null>(null);

    // Handle initial app from URL
    useEffect(() => {
        const appParam = searchParams.get('app');
        if (appParam) {
            if (appParam === 'message') setCurrentApp('message');
            else setCurrentApp(appParam);
        }
    }, [searchParams]);

    const handleOpenApp = (appId: string) => {
        if (appId === 'map') {
            const path = window.location.pathname;
            const match = path.match(/\/player\/([^\/]+)/);
            if (match) {
                router.push(`/player/${match[1]}/map`);
            } else {
                alert("プレイヤーIDが見つかりません");
            }
        } else {
            setCurrentApp(appId);
        }
    };

    const handleHome = () => {
        setCurrentApp(null);
    };

    const renderApp = () => {
        switch (currentApp) {
            case 'phone': return <PhoneApp />;
            case 'message': return <MessengerApp />;
            case 'sns': return <SNSApp onClose={handleHome} />;
            case 'video': return <VideoApp onClose={handleHome} />;
            case 'news': return <NewsApp onClose={handleHome} />;
            case 'crypto': return <CryptoApp />;
            case 'job_board': return <JobBoardApp onBack={handleHome} />;
            case 'bank': return <BankApp onBack={handleHome} />;
            case 'status': return <LifeStatusApp onBack={handleHome} />;
            case 'audit': return <AuditLogApp onBack={handleHome} />;
            case 'quests': return <QuestApp onBack={handleHome} />;
            case 'dark_web': return <ForbiddenApp onBack={handleHome} />;
            case 'settings': return <div className="p-8 text-black font-bold text-center mt-20">設定はまだありません</div>;
            case 'camera': return <div className="p-8 text-black font-bold text-center mt-20">カメラは起動できません</div>;
            case 'shopping': return <div className="p-8 text-black font-bold text-center mt-20">準備中</div>;
            default: return null;
        }
    };

    // Determine status bar color based on app
    // Most apps have white bg so dark text is good.
    // Video/SNS might be dark? Let's stick to dark text for apps for now.
    const statusBarVariant = currentApp ? 'dark' : 'light';

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent py-2">
            <SmartphoneShell onHome={handleHome}>
                <StatusBar variant={statusBarVariant} />

                <AnimatePresence mode="wait">
                    {!currentApp && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full absolute inset-0"
                        >
                            <HomeScreen onOpenApp={handleOpenApp} />
                        </motion.div>
                    )}

                    {currentApp && (
                        <motion.div
                            key="app"
                            initial={{ y: '100%', opacity: 1 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full h-full absolute inset-0 bg-gray-50 z-20 overflow-hidden"
                        >
                            {/* App Container - adds some padding top for status bar if needed, 
                                but most apps handle their own layout. 
                                We should essentially let apps fill the screen. 
                                Note: The Shell clips content to rounded corners.
                            */}
                            {renderApp()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </SmartphoneShell>
        </div>
    );
};
