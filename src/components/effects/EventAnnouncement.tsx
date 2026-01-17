'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameEvent } from '@/types';

interface EventAnnouncementProps {
    event: GameEvent | null;
}

export const EventAnnouncement: React.FC<EventAnnouncementProps> = ({ event }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (event) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5000); // Hide toast after 5s, but bar remains elsewhere?
            return () => clearTimeout(timer);
        }
    }, [event]);

    if (!event) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        maxWidth: '600px',
                        zIndex: 2000,
                        background: '#dc2626', // Red for Breaking News
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        border: '2px solid #fff',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Running News 📢
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {event.name}
                    </div>
                    <div>{event.description}</div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const ActiveEventBar: React.FC<{ event: GameEvent }> = ({ event }) => {
    if (!event) return null;

    // Remaining time calc could be done here if we re-render, but simple display is ok.

    return (
        <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            style={{
                background: event.type === 'recession' || event.type === 'tax_hike' ? '#450a0a' : '#064e3b',
                color: 'white',
                textAlign: 'center',
                padding: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold'
            }}
        >
            現在発生中: {event.name} ({event.description})
        </motion.div>
    );
};
