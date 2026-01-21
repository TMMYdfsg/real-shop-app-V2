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
            <div className="ui-toast-region" aria-live="polite" aria-atomic="true">
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
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                ...(toast.type === 'achievement' ? { rotate: [0, -2, 2, -2, 0] } : {})
            }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="ui-toast"
            data-type={toast.type}
            onClick={() => onRemove(toast.id)}
            style={{ cursor: 'pointer' }}
        >
            <div className="ui-toast__body">
                <motion.span
                    className="ui-subtitle"
                    animate={toast.type === 'income' || toast.type === 'achievement' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                >
                    {icons[toast.type]}
                </motion.span>
                <div>{toast.message}</div>
            </div>
            {toast.duration && toast.duration > 0 && (
                <div className="ui-toast__progress">
                    <motion.div
                        className="ui-toast__bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </motion.div>
    );
};
