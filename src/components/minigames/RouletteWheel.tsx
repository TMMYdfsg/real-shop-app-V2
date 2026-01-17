'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface RouletteItem {
    id: number;
    text: string;
    effect: string;
    weight?: number;
    color?: string;
}

interface RouletteWheelProps {
    items: RouletteItem[];
    resultIndex?: number | null; // Index of the winning item
    onComplete?: () => void;
    isSpinning?: boolean;
}

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#06b6d4'];

export const RouletteWheel: React.FC<RouletteWheelProps> = ({ items, resultIndex, onComplete, isSpinning = false }) => {
    const controls = useAnimation();
    const wheelRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState(0);

    // Calculate slice angle
    const totalWeight = items.reduce((acc, item) => acc + (item.weight || 1), 0);
    // Simplified: Equal slices for visual (or weighted slices if we want to be fancy). 
    // For simplicity, let's use equal slices visually but backend handles weights.
    // Or if we want weighted visuals, we need to calculate start/end angles.
    // Let's stick to equal slices for visual clarity often used in simple games.
    const sliceAngle = 360 / items.length;

    useEffect(() => {
        if (isSpinning && resultIndex !== undefined && resultIndex !== null) {
            spinTo(resultIndex);
        }
    }, [isSpinning, resultIndex]);

    const spinTo = async (index: number) => {
        // Calculate target rotation
        // We want to land on item[index].
        // 0 degrees is usually top (12 o'clock) or right (3 o'clock) depending on CSS.
        // Let's assume standard CSS rotation, 0 is top.
        // Divider angles: 0, 360/N, ...
        // Index 0 center is at 360/N * 0.5? No.
        // Let's map it:
        // Item 0: [0, 60] -> Center 30
        // We want "Pointer" (at top, 0deg) to point to Item i.
        // So we rotate the WHEEL so that Item i is at top.
        // Angle for Item i center = (i * sliceAngle) + (sliceAngle / 2)
        // Target Rotation = - (Angle for Item i) + Extra Spins (360 * 5)

        // Wait, if wheel rotates clockwise, we need to SUBTRACT angle.

        const targetAngle = (index * sliceAngle) + (sliceAngle / 2);
        const spins = 5; // number of full rotations
        const finalRotation = rotation + (360 * spins) + (360 - targetAngle) + (Math.random() * sliceAngle * 0.8 - sliceAngle * 0.4); // Add randomness within slice

        await controls.start({
            rotate: finalRotation,
            transition: {
                duration: 4,
                ease: [0.15, 0.85, 0.35, 1.0] // cubic-bezier custom ease out
            }
        });

        setRotation(finalRotation % 360);
        if (onComplete) onComplete();
    };

    return (
        <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto' }}>
            {/* Pointer */}
            <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderTop: '25px solid #333',
                zIndex: 10,
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))'
            }} />

            {/* Wheel */}
            <motion.div
                ref={wheelRef}
                animate={controls}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '5px solid #333',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 0 15px rgba(0,0,0,0.2)'
                }}
            >
                {items.map((item, i) => {
                    const angle = sliceAngle * i;
                    const rotate = angle;
                    const skew = 90 - sliceAngle; // math for conic-gradient sections or css slices is hard.

                    // Alternative: Use conic-gradient for background and position text absolutely.
                    // This is robust for dynamic slices.
                    return null;
                })}

                {/* Visual rendering using conic-gradient for background mainly */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `conic-gradient(${items.map((item, i) => {
                        const start = (i * 100) / items.length;
                        const end = ((i + 1) * 100) / items.length;
                        return `${item.color || COLORS[i % COLORS.length]} ${start}% ${end}%`;
                    }).join(', ')
                        })`
                }} />

                {/* Labels */}
                {items.map((item, i) => {
                    const angle = (sliceAngle * i) + (sliceAngle / 2);
                    return (
                        <div
                            key={item.id}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transformOrigin: 'center left',
                                transform: `translateY(-50%) rotate(${angle - 90}deg) translateX(20px)`, // -90 to start from top
                                width: '50%', // from center to edge
                                textAlign: 'left',
                                paddingLeft: '20px',
                                color: 'white',
                                fontWeight: 'bold',
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                pointerEvents: 'none',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {i + 1}
                        </div>
                    );
                })}


            </motion.div>

            {/* Center Cap */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#fff',
                border: '2px solid #333',
                zIndex: 5
            }} />
        </div>
    );
};
