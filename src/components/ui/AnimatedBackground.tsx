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
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-900">
            {/* Elegant Gradient Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1e293b_0%,_#0f172a_100%)]" />

            {/* Abstract Floating Shapes (Soft, not neon) */}
            <motion.div
                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[100px]"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-600/20 blur-[120px]"
                animate={{
                    x: [0, -40, 0],
                    y: [0, -60, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* 3D Floating Elements (Abstract Cubes/Spheres) - Simulated with CSS */}
            {/* Element 1: Glass Cube-ish */}
            <motion.div
                className="absolute top-[20%] right-[20%] w-32 h-32 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl"
                style={{
                    transformStyle: 'preserve-3d',
                }}
                animate={{
                    rotateX: [0, 180, 360],
                    rotateY: [0, 180, 360],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Element 2: Small Floating Orb */}
            <motion.div
                className="absolute bottom-[30%] left-[15%] w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 backdrop-blur-sm rounded-full shadow-lg border border-white/10"
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

            {/* Interactive Glow (Subtle) */}
            <motion.div
                className="absolute w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]"
                animate={{
                    x: (mousePosition.x * window.innerWidth) - 400,
                    y: (mousePosition.y * window.innerHeight) - 400,
                }}
                transition={{
                    type: "spring",
                    damping: 50,
                    stiffness: 50
                }}
            />

            {/* Noise Overlay for texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        </div>
    );
};

export default AnimatedBackground;
