'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Scan, ShieldCheck, Lock } from 'lucide-react';

interface BiometricAuthProps {
    onAuthenticated: () => void;
    title?: string;
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({
    onAuthenticated,
    title = "三井住友銀行"
}) => {
    const [status, setStatus] = useState<'locked' | 'scanning' | 'success'>('locked');

    useEffect(() => {
        // Start scanning automatically
        const timer1 = setTimeout(() => {
            setStatus('scanning');
        }, 800);

        // Success after scanning
        const timer2 = setTimeout(() => {
            setStatus('success');
            // Provide haptic feedback if available
            if (window.navigator?.vibrate) {
                window.navigator.vibrate([10, 30, 10]);
            }
        }, 2200);

        // Notify parent after success animation
        const timer3 = setTimeout(() => {
            onAuthenticated();
        }, 3000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onAuthenticated]);

    return (
        <div className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Top Logo Area (SMBC style) */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-16 flex flex-col items-center"
            >
                <div className="w-16 h-16 bg-emerald-700 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <div className="w-8 h-8 border-2 border-white rounded-sm rotate-45 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                </div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h1>
            </motion.div>

            {/* Animation Container */}
            <div className="relative w-48 h-48 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {status === 'locked' && (
                        <motion.div
                            key="locked"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            className="bg-gray-50 p-8 rounded-full"
                        >
                            <Lock className="w-16 h-16 text-gray-300" />
                        </motion.div>
                    )}

                    {status === 'scanning' && (
                        <motion.div
                            key="scanning"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                        >
                            {/* Scanning Pulse Rings */}
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute inset-0 border-2 border-emerald-500 rounded-full"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                className="absolute inset-0 border-2 border-emerald-400 rounded-full"
                            />

                            <div className="bg-emerald-50 p-8 rounded-full relative overflow-hidden">
                                <Fingerprint className="w-16 h-16 text-emerald-600" />

                                {/* Scan Line */}
                                <motion.div
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="absolute left-0 right-0 h-0.5 bg-emerald-400/50 shadow-[0_0_10px_2px_rgba(52,211,153,0.5)]"
                                />
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-12 left-0 right-0 text-center"
                            >
                                <p className="text-sm font-bold text-emerald-600 animate-pulse">
                                    生体認証中...
                                </p>
                            </motion.div>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="bg-emerald-600 p-8 rounded-full shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                                <ShieldCheck className="w-16 h-16 text-white" />
                            </div>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 font-bold text-emerald-700"
                            >
                                認証に成功しました
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Info (SMBC style) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-16 text-center"
            >
                <p className="text-xs text-gray-400">
                    安全なログインを確保しています<br />
                    Secure Login System v2.1
                </p>
            </motion.div>

            {/* Background Decorative Circles */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-50/50 rounded-full -z-10 blur-3xl overflow-hidden" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-50/50 rounded-full -z-10 blur-3xl overflow-hidden" />
        </div>
    );
};
