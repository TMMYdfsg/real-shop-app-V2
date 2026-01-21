'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth),
                y: (e.clientY / window.innerHeight),
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="bg-canvas">
            <div className="bg-gradient" />

            <motion.div
                className="bg-shape bg-shape--primary"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="bg-shape bg-shape--secondary"
                animate={{
                    x: [0, -40, 0],
                    y: [0, -60, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="bg-orb"
                animate={{
                    y: [0, -50, 0],
                    x: [0, 20, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="bg-glow"
                animate={{
                    x: typeof window !== 'undefined' ? (mousePosition.x * window.innerWidth) - 400 : 0,
                    y: typeof window !== 'undefined' ? (mousePosition.y * window.innerHeight) - 400 : 0,
                }}
                transition={{
                    type: "spring",
                    damping: 50,
                    stiffness: 50
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
