'use client';

import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PlayerIcon } from '@/components/ui/PlayerIcon';

// Standard Imports for Components (Client Components)
import WorldStatus from '@/components/hud/WorldStatus';
import DisasterAlert from '@/components/effects/DisasterAlert';
import BankTerminal from '@/components/banking/BankTerminal';
import { Smartphone } from '@/components/smartphone/Smartphone';
import { JobBoardApp } from '@/components/smartphone/apps/JobBoardApp';
import { LifeStatusApp } from '@/components/smartphone/apps/LifeStatusApp';
import { AuditLogApp } from '@/components/smartphone/apps/AuditLogApp';
import { BankApp } from '@/components/smartphone/apps/BankApp';
// 動的インポートまたは直接インポート（今回は直接）
import PhoneApp from '@/components/smartphone/PhoneApp';
import MessengerApp from '@/components/smartphone/MessengerApp';

export default function PlayerHome({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { gameState, currentUser } = useGame();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showBank, setShowBank] = useState(false);
    const [newName, setNewName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [activeApp, setActiveApp] = useState<string | null>(null);

    // Initial check for URL params to open apps
    useEffect(() => {
        const appParam = searchParams.get('app');
        if (appParam) {
            // Normalize app names if necessary
            if (appParam === 'messenger' || appParam === 'message') {
                setActiveApp('message');
            } else if (appParam === 'phone') {
                setActiveApp('phone');
            } else {
                setActiveApp(appParam);
            }
        }
    }, [searchParams]);

    // ... (中略)

    const handleOpenApp = (appId: string) => {
        if (appId === 'map') router.push(`/player/${id}/map`);
        else setActiveApp(appId);
    };

    // ... (中略)

    {/* App Modals */ }
            <Modal isOpen={activeApp === 'job_board'} onClose={() => setActiveApp(null)} title="求人情報">
                <JobBoardApp onBack={() => setActiveApp(null)} />
            </Modal>
            <Modal isOpen={activeApp === 'status'} onClose={() => setActiveApp(null)} title="ライフステータス">
                <LifeStatusApp onBack={() => setActiveApp(null)} />
            </Modal>
            <Modal isOpen={activeApp === 'audit'} onClose={() => setActiveApp(null)} title="行動記録">
                <AuditLogApp onBack={() => setActiveApp(null)} />
            </Modal>

    {/* Communication Apps */ }
            <Modal isOpen={activeApp === 'phone'} onClose={() => setActiveApp(null)} title="電話">
                <div style={{ height: '500px' }}>
                    <PhoneApp />
                </div>
            </Modal>
            <Modal isOpen={activeApp === 'message'} onClose={() => setActiveApp(null)} title="メッセージ">
                <div style={{ height: '500px' }}>
                    <MessengerApp />
                </div>
            </Modal>
        </div >
    );
}
