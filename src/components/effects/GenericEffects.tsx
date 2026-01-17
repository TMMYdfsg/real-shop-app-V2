'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple Confetti Particle
interface ParticleProps {
    x: number;
    y: number;
    color: string;
}

const Particle: React.FC<ParticleProps> = ({ x, y, color }) => {
    return (
        <motion.div
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400 + 200, // fall down a bit
                opacity: 0,
                scale: 1.5,
                rotate: Math.random() * 360
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
                position: 'fixed',
                left: x,
                top: y,
                width: '10px',
                height: '10px',
                backgroundColor: color,
                pointerEvents: 'none',
                zIndex: 9999
            }}
        />
    );
};

export const ConfettiEffect: React.FC<{ trigger: number }> = ({ trigger }) => {
    // trigger is a timestamp or counter. When it changes, we spawn particles.
    // If 0, do nothing.

    // Simplification: Just 20 particles from center
    const colors = ['#f472b6', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa'];

    if (!trigger) return null;

    return (
        <AnimatePresence>
            {Array.from({ length: 30 }).map((_, i) => (
                <Particle
                    key={`${trigger}-${i}`}
                    x={window.innerWidth / 2}
                    y={window.innerHeight / 2}
                    color={colors[i % colors.length]}
                />
            ))}
        </AnimatePresence>
    );
};

export const PopupEffect: React.FC<{ show: boolean, children: React.ReactNode }> = ({ show, children }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.2, y: -20 }}
                    style={{
                        position: 'fixed',
                        top: '20%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10000,
                        pointerEvents: 'none' // mostly visual
                    }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
