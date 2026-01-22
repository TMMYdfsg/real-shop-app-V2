'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { APPS } from '@/components/smartphone/constants';
import { AppHeader } from '@/components/smartphone/AppHeader';
import { Download, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StoreApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser, sendRequest } = useGame();
    const [query, setQuery] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [confirmAppId, setConfirmAppId] = useState<string | null>(null);

    const baseInstalledIds = useMemo(() => {
        const source = currentUser?.smartphone?.apps?.length ? currentUser.smartphone.apps : ['shopping'];
        const next = new Set(source);
        next.add('shopping');
        return Array.from(next);
    }, [currentUser?.smartphone?.apps]);

    const [installedIds, setInstalledIds] = useState<string[]>(baseInstalledIds);

    useEffect(() => {
        setInstalledIds(baseInstalledIds);
    }, [baseInstalledIds]);

    const filteredApps = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return APPS;
        return APPS.filter(app => app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q));
    }, [query]);

    const handleInstall = async (appId: string) => {
        setBusyId(appId);
        try {
            const next = Array.from(new Set([...installedIds, appId, 'shopping']));
            setInstalledIds(next);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('smartphone-apps-updated', { detail: next }));
            }
            await sendRequest('install_app', 0, { appId });
        } finally {
            setBusyId(null);
        }
    };

    const handleRemove = async (appId: string) => {
        setBusyId(appId);
        try {
            const next = installedIds.filter(id => id !== appId || id === 'shopping');
            const normalized = Array.from(new Set([...next, 'shopping']));
            setInstalledIds(normalized);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('smartphone-apps-updated', { detail: normalized }));
            }
            await sendRequest('uninstall_app', 0, { appId });
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="h-full bg-[#f5f7fb] text-slate-900 flex flex-col font-sans overflow-hidden">
            <AppHeader title="ストア" onBack={onBack} />

            <div className="px-5 pt-4 pb-3">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-2.5 flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="アプリを検索"
                        className="flex-1 text-sm outline-none bg-transparent"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-3">
                {filteredApps.map((app) => {
                    const isInstalled = installedIds.includes(app.id);
                    const isStore = app.id === 'shopping';
                    const isBusy = busyId === app.id;

                    return (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${app.color} flex items-center justify-center text-white`}>
                                {React.isValidElement(app.icon)
                                    ? React.cloneElement(app.icon as React.ReactElement<any>, { className: 'w-6 h-6' })
                                    : <span className="text-xl">{app.icon}</span>}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-black text-sm text-slate-900 truncate">{app.name}</p>
                                <p className="text-[11px] text-slate-500 truncate">{app.description}</p>
                            </div>

                            {isInstalled ? (
                                <button
                                    onClick={() => !isStore && setConfirmAppId(app.id)}
                                    disabled={isStore || isBusy}
                                    className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 ${isStore ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                >
                                    {isStore ? <CheckCircle2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                    {isStore ? '必須' : '削除'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleInstall(app.id)}
                                    disabled={isBusy}
                                    className="px-3 py-1.5 rounded-full text-xs font-black bg-emerald-500 text-white hover:bg-emerald-600 flex items-center gap-1.5"
                                >
                                    <Download className="w-4 h-4" />
                                    {isBusy ? '処理中' : '入手'}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {confirmAppId && (
                    <motion.div
                        key="confirm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-[320px] text-center shadow-xl"
                        >
                            <p className="text-sm font-bold text-slate-800 mb-3">アプリを削除しますか？</p>
                            <p className="text-xs text-slate-500 mb-6">ホーム画面からアプリが消えます。</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmAppId(null)}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={async () => {
                                        const target = confirmAppId;
                                        setConfirmAppId(null);
                                        if (target) await handleRemove(target);
                                    }}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white"
                                >
                                    削除する
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
