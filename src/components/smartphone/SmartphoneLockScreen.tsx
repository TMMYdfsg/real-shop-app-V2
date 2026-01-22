'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock } from 'lucide-react';

interface SmartphoneLockScreenProps {
    passcode?: string;
    biometricEnabled?: boolean;
    backgroundImage?: string;
    onUnlock: () => void;
}

const formatTime = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};

const formatDate = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('ja-JP', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
    return formatter.format(date);
};

export const SmartphoneLockScreen: React.FC<SmartphoneLockScreenProps> = ({
    passcode,
    biometricEnabled,
    backgroundImage,
    onUnlock
}) => {
    const [now, setNow] = useState(new Date());
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);

    const hasPasscode = Boolean(passcode && passcode.length > 0);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const tryUnlock = (value: string) => {
        if (!hasPasscode) {
            onUnlock();
            return;
        }
        if (value === passcode) {
            setInput('');
            setError(false);
            onUnlock();
            return;
        }
        setError(true);
        setInput('');
        setTimeout(() => setError(false), 600);
    };

    const handleDigit = (digit: string) => {
        if (input.length >= 4) return;
        const next = `${input}${digit}`;
        setInput(next);
        if (next.length === 4) {
            tryUnlock(next);
        }
    };

    const handleDelete = () => {
        setInput((prev) => prev.slice(0, -1));
    };

    return (
        <div
            className="absolute inset-0 z-[80] text-white flex flex-col items-center justify-between py-16 px-6 bg-cover bg-center"
            style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundColor: backgroundImage ? undefined : '#020617'
            }}
        >
            {!backgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
            )}
            {backgroundImage && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
            )}
            <div className="relative z-10 w-full flex flex-col items-center justify-between flex-1">
            <div className="flex flex-col items-center gap-2">
                <Lock className="w-6 h-6 text-white/60" />
                <div className="text-5xl font-light tracking-tight">{formatTime(now)}</div>
                <div className="text-sm text-white/60 font-medium">{formatDate(now)}</div>
            </div>

            <div className="w-full flex flex-col items-center gap-4">
                {hasPasscode ? (
                    <div className="flex items-center gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className={`w-3 h-3 rounded-full border border-white/40 ${input.length > index ? 'bg-white' : 'bg-transparent'}`}
                            />
                        ))}
                    </div>
                ) : (
                    <button
                        onClick={() => onUnlock()}
                        className="px-6 py-2 rounded-full bg-white/10 text-sm font-bold"
                    >
                        解除する
                    </button>
                )}

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            className="text-xs text-rose-300 font-bold"
                        >
                            パスコードが違います
                        </motion.div>
                    )}
                </AnimatePresence>

                {biometricEnabled && (
                    <button
                        onClick={() => onUnlock()}
                        className="flex items-center gap-2 text-xs text-emerald-300 font-bold"
                    >
                        <Fingerprint className="w-4 h-4" />
                        Face IDで解除
                    </button>
                )}

                {hasPasscode && (
                    <div className="grid grid-cols-3 gap-4 mt-2">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                            <button
                                key={digit}
                                onClick={() => handleDigit(digit)}
                                className="w-16 h-16 rounded-full bg-white/10 text-lg font-bold"
                            >
                                {digit}
                            </button>
                        ))}
                        <div className="w-16 h-16" />
                        <button
                            onClick={() => handleDigit('0')}
                            className="w-16 h-16 rounded-full bg-white/10 text-lg font-bold"
                        >
                            0
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-16 h-16 rounded-full bg-white/10 text-sm font-bold"
                        >
                            ⌫
                        </button>
                    </div>
                )}
            </div>

            <div className="text-[10px] text-white/40">上にスワイプして解除</div>
            </div>
        </div>
    );
};
