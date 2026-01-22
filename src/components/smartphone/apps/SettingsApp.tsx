'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    Volume2,
    Bell,
    Moon,
    Smartphone,
    Wifi,
    Bluetooth,
    Antenna,
    Lock,
    Info,
    User,
    ChevronLeft,
    Check
} from 'lucide-react';
import { AppHeader } from '../AppHeader';

const SOUND_LIST = Array.from({ length: 21 }, (_, i) => ({
    id: `notification_${i + 1}`,
    filename: `notification_${i + 1}.mp3`,
    label: `通知音 ${i + 1}`
}));

export const SettingsApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { currentUser } = useGame();
    const [selectedSound, setSelectedSound] = useState('notification_1.mp3');
    const [activeView, setActiveView] = useState<'main' | 'sounds' | 'detail'>('main');
    const [detailTitle, setDetailTitle] = useState('');
    const [detailItems, setDetailItems] = useState<string[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('notification_sound');
        if (saved) setSelectedSound(saved);

        const dark = localStorage.getItem('dark_mode') === 'true';
        setIsDarkMode(dark);
    }, []);

    const handlePlayPreview = (filename: string) => {
        const audio = new Audio(`/sounds/${filename}`);
        audio.volume = 0.5;
        audio.play().catch(() => { });
    };

    const handleSaveSound = (filename: string) => {
        setSelectedSound(filename);
        localStorage.setItem('notification_sound', filename);
        handlePlayPreview(filename);
    };

    const toggleDarkMode = () => {
        const newVal = !isDarkMode;
        setIsDarkMode(newVal);
        localStorage.setItem('dark_mode', String(newVal));
    };

    const openDetail = (title: string, items: string[]) => {
        setDetailTitle(title);
        setDetailItems(items);
        setActiveView('detail');
    };

    if (activeView === 'sounds') {
        return (
            <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center">
                    <button onClick={() => setActiveView('main')} className="flex items-center text-[#007aff] font-medium -ml-1">
                        <ChevronLeft className="w-6 h-6" />
                        <span>設定</span>
                    </button>
                    <h2 className="flex-1 text-center font-black pr-10">サウンド</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                        {SOUND_LIST.map((sound, i) => (
                            <button
                                key={sound.id}
                                onClick={() => handleSaveSound(sound.filename)}
                                className={`w-full flex items-center justify-between p-4 ${i !== 0 ? 'border-t border-slate-100' : ''} active:bg-slate-50 transition-colors`}
                            >
                                <span className={`text-sm font-medium ${selectedSound === sound.filename ? 'text-[#007aff] font-bold' : 'text-slate-900'}`}>{sound.label}</span>
                                {selectedSound === sound.filename && <Check className="w-4 h-4 text-[#007aff]" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (activeView === 'detail') {
        return (
            <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center">
                    <button onClick={() => setActiveView('main')} className="flex items-center text-[#007aff] font-medium -ml-1">
                        <ChevronLeft className="w-6 h-6" />
                        <span>設定</span>
                    </button>
                    <h2 className="flex-1 text-center font-black pr-10">{detailTitle}</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                        {detailItems.map((item, i) => (
                            <div key={`${item}-${i}`} className={`w-full flex items-center justify-between p-4 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                <span className="text-sm font-medium text-slate-900">{item}</span>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-[#f2f2f7] flex flex-col font-sans overflow-hidden">
            {/* iOS Settings Header */}
            <div className="px-6 pt-14 pb-4 shrink-0 overflow-y-auto max-h-[150px] no-scrollbar">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-black tracking-tight">設定</h1>
                    <button onClick={onClose} className="text-[#007aff] font-bold text-sm">完了</button>
                </div>

                {/* Search Bar Mockup */}
                <div className="bg-slate-100/80 rounded-xl px-3 py-2 flex items-center gap-2 mb-2">
                    <span className="text-slate-400 text-sm">🔍 検索</span>
                </div>
            </div>

            {/* Settings List */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-8 pb-10">
                {/* Profile Section */}
                <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-slate-200 active:bg-slate-50 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center p-0.5">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">{currentUser?.name}</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Apple ID, iCloud+など</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>

                {/* Network Section */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <SettingItem icon={<Antenna />} color="bg-orange-500" label="機内モード" toggle />
                    <SettingItem icon={<Wifi />} color="bg-[#007aff]" label="Wi-Fi" value="GameNet" onClick={() => openDetail('Wi-Fi', ['GameNet', 'Shop-WiFi', 'TownNet', 'CafeFree'])} />
                    <SettingItem icon={<Bluetooth />} color="bg-[#007aff]" label="Bluetooth" value="オン" onClick={() => openDetail('Bluetooth', ['オン', 'デバイスを探す', 'このデバイスを検出可能にする'])} />
                    <SettingItem icon={<Smartphone />} color="bg-green-500" label="モバイル通信" onClick={() => openDetail('モバイル通信', ['回線状態', 'ローミング', 'データ通信量', '通信の優先度'])} />
                </div>

                {/* Notifications & Sounds */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <SettingItem icon={<Bell />} color="bg-red-500" label="通知" onClick={() => openDetail('通知', ['通知スタイル', 'サウンド', 'バッジ', 'プレビュー'])} />
                    <SettingItem
                        icon={<Volume2 />}
                        color="bg-pink-500"
                        label="サウンドと触覚"
                        onClick={() => setActiveView('sounds')}
                    />
                    <SettingItem
                        icon={<Moon />}
                        color="bg-indigo-600"
                        label="集中モード"
                        toggle
                        checked={isDarkMode}
                        onToggle={toggleDarkMode}
                    />
                </div>

                {/* Privacy & General */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <SettingItem icon={<Info />} color="bg-slate-500" label="一般" onClick={() => openDetail('一般', ['情報', 'ソフトウェアアップデート', '言語と地域', '日付と時刻', 'リセット'])} />
                    <SettingItem icon={<Lock />} color="bg-blue-600" label="プライバシーとセキュリティ" onClick={() => openDetail('プライバシーとセキュリティ', ['位置情報サービス', 'カメラ', 'マイク', '写真', 'ヘルスケア'])} />
                </div>

                {/* System */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <SettingItem icon={<Smartphone />} color="bg-slate-700" label="画面表示と明るさ" onClick={() => openDetail('画面表示と明るさ', ['ライト/ダーク', '自動ロック', '文字サイズ', 'True Tone'])} />
                    <SettingItem icon={<Bell />} color="bg-yellow-500" label="サウンド" onClick={() => setActiveView('sounds')} />
                    <SettingItem icon={<Lock />} color="bg-emerald-600" label="Face ID/パスコード" onClick={() => openDetail('Face ID/パスコード', ['認証', 'パスコード変更', 'Face IDの再設定'])} />
                    <SettingItem icon={<Info />} color="bg-purple-600" label="バッテリー" onClick={() => openDetail('バッテリー', ['バッテリーの状態', '低電力モード', '使用状況'])} />
                </div>

                {/* Version Info */}
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">AntiGravity OS 2.5</p>
                    <p className="text-[9px] text-slate-300 mt-1">Designed in DeepMind</p>
                </div>
            </div>
        </div>
    );
};

const SettingItem = ({ icon, color, label, value, toggle, checked, onToggle, onClick }: any) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-3 pl-4 active:bg-slate-50 transition-colors group relative"
    >
        <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center text-white shrink-0`}>
            {React.cloneElement(icon, { size: 16, className: "fill-current" })}
        </div>
        <div className="flex-1 flex justify-between items-center pr-2 border-b border-slate-100 group-last:border-none py-1">
            <span className="text-sm font-medium text-slate-900">{label}</span>
            <div className="flex items-center gap-2">
                {value && <span className="text-sm text-slate-400 font-medium">{value}</span>}
                {toggle ? (
                    <div
                        onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                        className={`w-12 h-7 rounded-full transition-all relative p-1 ${checked ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                        <motion.div
                            animate={{ x: checked ? 20 : 0 }}
                            className="w-5 h-5 bg-white rounded-full shadow-sm"
                        />
                    </div>
                ) : (
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                )}
            </div>
        </div>
    </button>
);
