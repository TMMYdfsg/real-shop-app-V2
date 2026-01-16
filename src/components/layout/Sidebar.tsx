'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
    title?: string;
    items: { label: string; path: string; icon: string }[];
    role: 'banker' | 'player';
}

export const Sidebar: React.FC<SidebarProps> = ({ title, items, role }) => {
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
                <Button
                    variant="ghost"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                >
                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{isOpen ? '✕' : '≡'}</span>
                </Button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 998,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            {/* Drawer */}
            <aside style={{
                position: 'fixed',
                top: 0,
                left: isOpen ? 0 : '-280px',
                width: '280px',
                height: '100vh',
                background: role === 'banker' ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.95)',
                boxShadow: '4px 0 15px rgba(0,0,0,0.1)',
                transition: 'left 0.3s ease',
                zIndex: 999,
                padding: '4rem 1rem 1rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
            }}>
                {title && (
                    <h2 style={{ marginBottom: '2rem', padding: '0 0.5rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                        {title}
                    </h2>
                )}

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-sm)',
                                    background: isActive ? 'var(--accent-color)' : 'transparent',
                                    color: isActive ? 'white' : 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'background 0.2s',
                                    fontWeight: isActive ? 'bold' : 'normal'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', padding: '1rem', opacity: 0.5, fontSize: '0.8rem', textAlign: 'center' }}>
                    Antigravity OS v2.0
                </div>
            </aside>
        </>
    );
};
