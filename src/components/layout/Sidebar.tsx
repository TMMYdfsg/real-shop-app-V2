'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PlayerIcon } from '@/components/ui/PlayerIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { VARIANTS, TRANSITIONS } from '@/lib/animation/tokens';
import { User } from '@/types';

interface SidebarProps {
    title?: string;
    items: { label: string; path: string; icon: string }[];
    role: 'banker' | 'player';
    player?: User; // プレイヤー情報を追加
    children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ title, items, role, player, children }) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Hamburger Button (Fixed) */}
            <div style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 1000 }}>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Button
                        variant="ghost"
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    >
                        <motion.span
                            key={isOpen ? 'close' : 'open'}
                            initial={{ rotate: -180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            style={{ fontSize: '1.5rem', lineHeight: 1, display: 'block' }}
                        >
                            {isOpen ? '✕' : '≡'}
                        </motion.span>
                    </Button>
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed', inset: 0,
                                background: 'rgba(0,0,0,0.5)',
                                zIndex: 998,
                                backdropFilter: 'blur(2px)'
                            }}
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={TRANSITIONS.spring}
                            style={{
                                position: 'fixed', top: 0, left: 0, bottom: 0,
                                width: '280px',
                                background: role === 'banker' ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.95)',
                                boxShadow: '4px 0 15px rgba(0,0,0,0.1)',
                                zIndex: 999,
                                padding: '4rem 1rem 1rem 1rem',
                                display: 'flex', flexDirection: 'column',
                                overflowY: 'auto'
                            }}
                        >
                            {title && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    style={{
                                        marginBottom: '2rem',
                                        padding: '0 0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}
                                >
                                    {player && (
                                        <PlayerIcon
                                            playerIcon={player.playerIcon}
                                            playerName={player.name}
                                            size={48}
                                        />
                                    )}
                                    <h2 style={{ color: 'var(--accent-color)', fontWeight: 'bold', margin: 0 }}>
                                        {title}
                                    </h2>
                                </motion.div>
                            )}

                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {items.map((item, i) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <motion.div
                                            key={item.path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + (i * 0.05) }}
                                        >
                                            <Link href={item.path} style={{ textDecoration: 'none' }}>
                                                <motion.div
                                                    whileHover={{ x: 5, backgroundColor: isActive ? 'var(--accent-color)' : 'rgba(0,0,0,0.05)' }}
                                                    whileTap={{ scale: 0.98 }}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        background: isActive ? 'var(--accent-color)' : 'transparent',
                                                        color: isActive ? 'white' : 'var(--text-primary)',
                                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                        fontWeight: isActive ? 'bold' : 'normal',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </motion.div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </nav>

                            {children}

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                transition={{ delay: 0.5 }}
                                style={{ marginTop: 'auto', padding: '1rem', fontSize: '0.8rem', textAlign: 'center' }}
                            >
                                Antigravity OS v2.1
                            </motion.div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
