'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';

const transition = {
    type: 'spring',
    stiffness: 220,
    damping: 26,
    mass: 0.9
};

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const { currentUser } = useGame();
    const reduceMotion = currentUser?.smartphone?.settings?.reduceMotion ?? false;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={reduceMotion ? { opacity: 0, y: 8 } : { opacity: 0, y: 26, scale: 0.98, filter: 'blur(8px)' }}
                animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={reduceMotion ? { opacity: 0, y: -6 } : { opacity: 0, y: -18, scale: 1.01, filter: 'blur(10px)' }}
                transition={reduceMotion ? { duration: 0.2 } : transition}
                className="page-transition w-full h-full relative"
            >
                <motion.div
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: reduceMotion ? 0 : 0.18 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.2),transparent_55%)]"
                />
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
