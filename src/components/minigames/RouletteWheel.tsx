'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RouletteItem } from '@/types';

interface RouletteWheelProps {
    items: RouletteItem[];
    resultIndex?: number | null;
    onComplete?: () => void;
    isSpinning?: boolean;
    fontSize?: number;
    spinDurationMs?: number;
}

const COLORS = ['#93c5fd', '#fde68a', '#fda4af', '#86efac', '#c4b5fd', '#f9a8d4', '#fdba74', '#5eead4'];

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
    items,
    resultIndex,
    onComplete,
    isSpinning = false,
    fontSize = 14,
    spinDurationMs = 3200
}) => {
    const [rotation, setRotation] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sliceAngle = 360 / Math.max(1, items.length);

    const background = useMemo(() => {
        return `conic-gradient(${items.map((item, i) => {
            const start = (i * 100) / items.length;
            const end = ((i + 1) * 100) / items.length;
            return `${item.color || COLORS[i % COLORS.length]} ${start}% ${end}%`;
        }).join(', ')})`;
    }, [items]);

    useEffect(() => {
        if (!isSpinning || resultIndex === null || resultIndex === undefined || items.length === 0) return;

        const targetAngle = (resultIndex * sliceAngle) + (sliceAngle / 2);
        const spins = 4 + Math.floor(Math.random() * 2);
        const offset = (Math.random() - 0.5) * sliceAngle * 0.6;
        const finalRotation = rotation + (spins * 360) + (360 - targetAngle) + offset;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setIsAnimating(true);
        setRotation(finalRotation);
        timeoutRef.current = setTimeout(() => {
            setIsAnimating(false);
            onComplete?.();
        }, spinDurationMs);
    }, [isSpinning, resultIndex, items.length, sliceAngle, spinDurationMs, rotation, onComplete]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="relative mx-auto w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-l-transparent border-r-transparent border-t-[20px] border-t-slate-800 drop-shadow" />
            </div>

            <div
                className="relative w-full h-full rounded-full border-4 border-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.2)] overflow-hidden"
                style={{
                    background,
                    transform: `rotate(${rotation}deg)`,
                    transition: isAnimating ? `transform ${spinDurationMs}ms cubic-bezier(0.12, 0.8, 0.2, 1)` : 'none'
                }}
            >
                {items.map((item, i) => {
                    const angle = (sliceAngle * i) + (sliceAngle / 2);
                    return (
                        <div
                            key={item.id}
                            className="absolute top-1/2 left-1/2 origin-left"
                            style={{
                                transform: `translateY(-50%) rotate(${angle - 90}deg) translateX(18px)`,
                                width: '50%'
                            }}
                        >
                            <div
                                className="text-slate-900 font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
                                style={{ fontSize }}
                            >
                                {item.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-slate-800 shadow" />
        </div>
    );
};
