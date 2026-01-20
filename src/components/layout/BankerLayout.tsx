'use client';

import React, { useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { PageTransition } from './PageTransition';
import { useSWRConfig } from 'swr';

const BankerLayout: React.FC<{ children: React.ReactNode; initialData?: any }> = ({ children, initialData }) => {
    const { currentUser } = useGame();
    const router = useRouter();
    const { mutate } = useSWRConfig();

    // Hydrate SWR cache with server-side data
    useEffect(() => {
        if (initialData) {
            mutate('/api/game', initialData, false);
        }
    }, [initialData, mutate]);

    const navItems = [
        { label: 'ホーム (Dashboard)', path: '/banker', icon: '📊' },
        { label: '私のプレイヤー画面へ', path: `/player/${currentUser?.id}`, icon: '📱' },
        { label: '申請承認', path: '/banker/requests', icon: '📝' },
        { label: '職業管理', path: '/banker/users', icon: '👥' },
        { label: '株式市場', path: '/banker/market', icon: '📈' },
        { label: '不動産管理', path: '/banker/realestate', icon: '🏠' },
        { label: '大規模イベント', path: '/banker/eventcontrol', icon: '🎭' },
        { label: 'NPC派遣/管理', path: '/banker/events', icon: '🤖' },
        { label: 'ルーレット', path: '/banker/roulette', icon: '⚙️' },
        { label: '商品管理', path: '/banker/products', icon: '🛍️' },
        { label: '季節管理', path: '/banker/season', icon: '🌸' },
        { label: 'タイマー管理', path: '/banker/timer', icon: '⏱️' },
        { label: '財務・給付', path: '/banker/finance', icon: '💰' },
        { label: 'システム設定', path: '/banker/config', icon: '🔧' },
        { label: '⚡️ 神モード', path: '/banker/godmode', icon: '⚡️' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <Sidebar title="銀行員管理画面" items={navItems} role="banker" />

            {/* Main Content */}
            <main style={{ padding: '4rem 1rem 2rem 1rem', overflowY: 'auto' }}>
                {currentUser && (
                    <div style={{ maxWidth: '1200px', margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            size="lg"
                            variant="primary"
                            onClick={() => router.push(`/player/${currentUser.id}`)}
                            style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)', borderRadius: '12px' }}
                        >
                            📱 プレイヤー画面 (自分のスマホ) を開く
                        </Button>
                    </div>
                )}
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
            </main>
        </div>
    );
};

export default BankerLayout;
