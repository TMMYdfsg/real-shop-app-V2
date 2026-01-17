'use client';

import React, { useState, use } from 'react';
import { Modal } from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { JobBoardApp } from '@/components/smartphone/apps/JobBoardApp';
import { LifeStatusApp } from '@/components/smartphone/apps/LifeStatusApp';
import { AuditLogApp } from '@/components/smartphone/apps/AuditLogApp';
import { BankApp } from '@/components/smartphone/apps/BankApp';
import { useRouter } from 'next/navigation';

// App Icons
const APPS = [
    { id: 'job_board', name: '求人', icon: '💼', color: 'bg-blue-500', description: '求人情報を確認' },
    { id: 'bank', name: '銀行', icon: '🏦', color: 'bg-green-600', description: '口座管理・融資申込' },
    { id: 'status', name: '生活', icon: '❤️', color: 'bg-pink-500', description: 'ライフステータス' },
    { id: 'audit', name: '行動記録', icon: '📜', color: 'bg-gray-600', description: '監査ログ確認' },
    { id: 'map', name: '地図', icon: '🗺️', color: 'bg-yellow-500', description: '街マップを開く' },
    { id: 'shopping', name: '通販', icon: '🛒', color: 'bg-orange-500', description: '準備中' },
    { id: 'message', name: '連絡', icon: '📞', color: 'bg-green-400', description: '準備中' },
];

export default function SmartphonePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [activeApp, setActiveApp] = useState<string | null>(null);

    const handleAppClick = (appId: string) => {
        if (appId === 'map') {
            router.push(`/player/${id}/map`);
        } else if (appId === 'shopping' || appId === 'message') {
            alert('この機能は準備中です');
        } else {
            setActiveApp(appId);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>📱 スマホアプリ</h2>

            <p className="text-gray-600 mb-6">
                スマホアプリから様々な機能にアクセスできます。
            </p>

            {/* App Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {APPS.map((app, i) => (
                    <motion.div
                        key={app.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            delay: i * 0.05,
                            type: 'spring',
                            stiffness: 260,
                            damping: 20
                        }}
                        className="flex flex-col items-center gap-3 cursor-pointer group"
                        onClick={() => handleAppClick(app.id)}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-24 h-24 ${app.color} rounded-3xl flex items-center justify-center text-5xl shadow-xl border-2 border-white/20 transition-shadow group-hover:shadow-2xl`}
                        >
                            {app.icon}
                        </motion.div>
                        <div className="text-center">
                            <div className="font-bold text-gray-800">{app.name}</div>
                            <div className="text-xs text-gray-500">{app.description}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* App Modals */}
            <Modal isOpen={activeApp === 'job_board'} onClose={() => setActiveApp(null)} title="求人情報">
                <JobBoardApp onBack={() => setActiveApp(null)} />
            </Modal>
            <Modal isOpen={activeApp === 'status'} onClose={() => setActiveApp(null)} title="ライフステータス">
                <LifeStatusApp onBack={() => setActiveApp(null)} />
            </Modal>
            <Modal isOpen={activeApp === 'audit'} onClose={() => setActiveApp(null)} title="行動記録">
                <AuditLogApp onBack={() => setActiveApp(null)} />
            </Modal>
            <Modal isOpen={activeApp === 'bank'} onClose={() => setActiveApp(null)} title="Real Bank & Trust">
                <BankApp onBack={() => setActiveApp(null)} />
            </Modal>
        </div>
    );
}
