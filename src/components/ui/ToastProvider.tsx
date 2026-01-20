'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'special' | 'income' | 'achievement' | 'disaster';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Sound Effect Map
const TOAST_SOUNDS: Record<ToastType, string | null> = {
    success: '/sounds/peipei.mp3',
    error: null,
    info: null,
    warning: null,
    special: '/sounds/peipei.mp3',
    income: '/sounds/peipei.mp3',
    achievement: '/sounds/peipei.mp3',
    disaster: null, // Disasters have their own alert system
};

// Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        // Play Sound Effect
        const soundPath = TOAST_SOUNDS[type];
        if (soundPath && typeof window !== 'undefined') {
            const audio = new Audio(soundPath);
            audio.volume = 0.6;
            audio.play().catch(() => { });
        }

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!toast.duration || toast.duration <= 0) return;
        const interval = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - (100 / (toast.duration! / 50))));
        }, 50);
        return () => clearInterval(interval);
    }, [toast.duration]);

    const colors: Record<ToastType, string> = {
        success: 'bg-emerald-500 text-white border-emerald-600',
        error: 'bg-red-500 text-white border-red-600',
        info: 'bg-blue-500 text-white border-blue-600',
        warning: 'bg-amber-500 text-white border-amber-600',
        special: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-purple-600',
        income: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 border-amber-600',
        achievement: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-indigo-600',
        disaster: 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-700',
    };

    const icons: Record<ToastType, string> = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
        special: '🌈',
        income: '💰',
        achievement: '🏆',
        disaster: '🚨',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                ...(toast.type === 'achievement' ? { rotate: [0, -2, 2, -2, 0] } : {})
            }}
            exit={{ opacity: 0, x: 50, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`pointer-events-auto min-w-[280px] max-w-md rounded-xl shadow-xl overflow-hidden border-2 ${colors[toast.type]}`}
            onClick={() => onRemove(toast.id)}
            style={{ cursor: 'pointer' }}
        >
            <div className="p-4 flex items-center gap-3">
                <motion.span
                    className="text-2xl"
                    animate={toast.type === 'income' || toast.type === 'achievement' ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                >
                    {icons[toast.type]}
                </motion.span>
                <div className="flex-1 font-bold text-sm leading-tight">
                    {toast.message}
                </div>
            </div>
            {/* Progress Bar */}
            {toast.duration && toast.duration > 0 && (
                <div className="h-1 bg-black/20 w-full">
                    <motion.div
                        className="h-full bg-white/50"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </motion.div>
    );
};

