'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    Volume2,
    Bell,
    Moon,
    Smartphone,
    Wifi,
    Bluetooth,
    Antenna,
    Clock,
    Lock,
    Info,
    User,
    ChevronLeft,
    Check
} from 'lucide-react';

const SOUND_LIST = Array.from({ length: 21 }, (_, i) => ({
    id: `notification_${i + 1}`,
    filename: `notification_${i + 1}.mp3`,
    label: `通知音 ${i + 1}`
}));

const AUTO_LOCK_OPTIONS = [
    { label: 'なし', seconds: 0 },
    { label: '30秒', seconds: 30 },
    { label: '1分', seconds: 60 },
    { label: '2分', seconds: 120 },
    { label: '5分', seconds: 300 },
    { label: '10分', seconds: 600 }
];

const TEXT_SIZE_OPTIONS = [
    { label: '小', scale: 0.9 },
    { label: '標準', scale: 1 },
    { label: '大', scale: 1.1 },
    { label: '特大', scale: 1.2 }
];

const THEME_OPTIONS = [
    { label: 'ライト', value: 'light' },
    { label: 'ダーク', value: 'dark' },
    { label: '自動', value: 'system' }
] as const;

export const SettingsApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { currentUser, sendRequest } = useGame();
    const [selectedSound, setSelectedSound] = useState('notification_1.mp3');
    const [activeView, setActiveView] = useState<'main' | 'sounds' | 'detail' | 'display' | 'autolock' | 'auth' | 'passcode' | 'wallpaper' | 'channel_icon' | 'certificate' | 'profile'>('main');
    const [detailTitle, setDetailTitle] = useState('');
    const [detailItems, setDetailItems] = useState<string[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [passcodeMode, setPasscodeMode] = useState<'set' | 'change'>('set');
    const [passcodeStep, setPasscodeStep] = useState<'current' | 'new' | 'confirm'>('new');
    const [currentPasscodeInput, setCurrentPasscodeInput] = useState('');
    const [passcodeInput, setPasscodeInput] = useState('');
    const [passcodeConfirmInput, setPasscodeConfirmInput] = useState('');
    const [passcodeError, setPasscodeError] = useState('');
    const [wallpaperError, setWallpaperError] = useState('');
    const [wallpaperUrl, setWallpaperUrl] = useState('');
    const [galleryImages, setGalleryImages] = useState<string[]>([]);

    const baseSmartphoneSettings = useMemo(() => ({
        theme: 'system' as const,
        autoLockSeconds: 60,
        autoLockOnUpdate: false,
        autoLockOnHome: true,
        textScale: 1,
        trueTone: true,
        passcode: '',
        biometricEnabled: false,
        lockScreenImage: '',
        incomingCallSound: 'notification_1.mp3',
        outgoingCallSound: 'notification_2.mp3'
    }), []);

    const resolvedSmartphoneSettings = useMemo(() => ({
        ...baseSmartphoneSettings,
        ...(currentUser?.smartphone?.settings || {})
    }), [baseSmartphoneSettings, currentUser?.smartphone?.settings]);

    const [smartphoneSettings, setSmartphoneSettings] = useState(resolvedSmartphoneSettings);

    useEffect(() => {
        const saved = localStorage.getItem('notification_sound');
        if (saved) setSelectedSound(saved);

        const dark = localStorage.getItem('dark_mode') === 'true';
        setIsDarkMode(dark);
    }, []);

    useEffect(() => {
        setSmartphoneSettings(resolvedSmartphoneSettings);
    }, [resolvedSmartphoneSettings]);

    useEffect(() => {
        if (!currentUser?.id) return;
        const storageKey = `smartphone_gallery_${currentUser.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setGalleryImages(JSON.parse(saved));
            } catch {
                setGalleryImages([]);
            }
        } else {
            setGalleryImages([]);
        }
    }, [currentUser?.id]);

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

    const handleSaveIncomingSound = async (filename: string) => {
        await updateSmartphoneSetting({ incomingCallSound: filename });
        handlePlayPreview(filename);
    };

    const handleSaveOutgoingSound = async (filename: string) => {
        await updateSmartphoneSetting({ outgoingCallSound: filename });
        handlePlayPreview(filename);
    };

    const toggleDarkMode = () => {
        const newVal = !isDarkMode;
        setIsDarkMode(newVal);
        localStorage.setItem('dark_mode', String(newVal));
    };

    const saveSmartphoneSettings = async (next: typeof smartphoneSettings) => {
        setSmartphoneSettings(next);
        try {
            await sendRequest('update_profile', 0, { smartphone: { settings: next } });
        } catch (e) {
            console.error('Failed to save smartphone settings', e);
        }
    };

    const updateSmartphoneSetting = async (patch: Partial<typeof smartphoneSettings>) => {
        const next = { ...smartphoneSettings, ...patch };
        await saveSmartphoneSettings(next);
    };

    const handleWallpaperFile = (file?: File | null) => {
        if (!file) return;
        if (file.size > 1024 * 700) {
            setWallpaperError('画像サイズは700KB以内にしてください');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            if (!result) {
                setWallpaperError('画像の読み込みに失敗しました');
                return;
            }
            setWallpaperError('');
            updateSmartphoneSetting({ lockScreenImage: result });
        };
        reader.onerror = () => {
            setWallpaperError('画像の読み込みに失敗しました');
        };
        reader.readAsDataURL(file);
    };

    const openPasscodeFlow = (mode: 'set' | 'change') => {
        setPasscodeMode(mode);
        setPasscodeStep(mode === 'change' ? 'current' : 'new');
        setCurrentPasscodeInput('');
        setPasscodeInput('');
        setPasscodeConfirmInput('');
        setPasscodeError('');
        setActiveView('passcode');
    };

    const autoLockLabel = useMemo(() => {
        return AUTO_LOCK_OPTIONS.find(opt => opt.seconds === smartphoneSettings.autoLockSeconds)?.label || 'なし';
    }, [smartphoneSettings.autoLockSeconds]);

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
                    <div className="space-y-2">
                        <div className="text-xs font-black text-slate-500">通知音</div>
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

                    <div className="space-y-2">
                        <div className="text-xs font-black text-slate-500">着信音</div>
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                            {SOUND_LIST.map((sound, i) => (
                                <button
                                    key={`incoming-${sound.id}`}
                                    onClick={() => handleSaveIncomingSound(sound.filename)}
                                    className={`w-full flex items-center justify-between p-4 ${i !== 0 ? 'border-t border-slate-100' : ''} active:bg-slate-50 transition-colors`}
                                >
                                    <span className={`text-sm font-medium ${smartphoneSettings.incomingCallSound === sound.filename ? 'text-[#007aff] font-bold' : 'text-slate-900'}`}>{sound.label}</span>
                                    {smartphoneSettings.incomingCallSound === sound.filename && <Check className="w-4 h-4 text-[#007aff]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-xs font-black text-slate-500">呼び出し音</div>
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                            {SOUND_LIST.map((sound, i) => (
                                <button
                                    key={`outgoing-${sound.id}`}
                                    onClick={() => handleSaveOutgoingSound(sound.filename)}
                                    className={`w-full flex items-center justify-between p-4 ${i !== 0 ? 'border-t border-slate-100' : ''} active:bg-slate-50 transition-colors`}
                                >
                                    <span className={`text-sm font-medium ${smartphoneSettings.outgoingCallSound === sound.filename ? 'text-[#007aff] font-bold' : 'text-slate-900'}`}>{sound.label}</span>
                                    {smartphoneSettings.outgoingCallSound === sound.filename && <Check className="w-4 h-4 text-[#007aff]" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeView === 'display') {
        const wallpaperStatus = smartphoneSettings.lockScreenImage ? 'カスタム' : '標準';
        return (
            <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center">
                    <button onClick={() => setActiveView('main')} className="flex items-center text-[#007aff] font-medium -ml-1">
                        <ChevronLeft className="w-6 h-6" />
                        <span>設定</span>
                    </button>
                    <h2 className="flex-1 text-center font-black pr-10">画面表示と明るさ</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-4">
                        <div>
                            <p className="text-xs font-black text-slate-500 mb-2">ライト/ダーク</p>
                            <div className="flex gap-2">
                                {THEME_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => updateSmartphoneSetting({ theme: option.value })}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black ${smartphoneSettings.theme === option.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-black text-slate-500 mb-2">文字サイズ</p>
                            <div className="grid grid-cols-4 gap-2">
                                {TEXT_SIZE_OPTIONS.map(option => (
                                    <button
                                        key={option.label}
                                        onClick={() => updateSmartphoneSetting({ textScale: option.scale })}
                                        className={`py-2 rounded-lg text-xs font-black ${smartphoneSettings.textScale === option.scale ? 'bg-[#007aff] text-white' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-900">True Tone</p>
                                <p className="text-[10px] text-slate-400">色味を暖色寄りに調整します</p>
                            </div>
                            <button
                                onClick={() => updateSmartphoneSetting({ trueTone: !smartphoneSettings.trueTone })}
                                className={`w-12 h-7 rounded-full transition-all relative p-1 ${smartphoneSettings.trueTone ? 'bg-green-500' : 'bg-slate-200'}`}
                                aria-label="True Toneを切り替え"
                            >
                                <motion.div
                                    animate={{ x: smartphoneSettings.trueTone ? 20 : 0 }}
                                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setActiveView('wallpaper')}
                        className="w-full bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm font-bold text-slate-900">ロック画面の壁紙</p>
                            <p className="text-[10px] text-slate-400">現在: {wallpaperStatus}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                </div>
            </div>
        );
    }

    if (activeView === 'certificate') {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const httpsUrl = `https://${host}:3001`;
        return (
            <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center">
                    <button onClick={() => setActiveView('main')} className="flex items-center text-[#007aff] font-medium -ml-1">
                        <ChevronLeft className="w-6 h-6" />
                        <span>設定</span>
                    </button>
                    <h2 className="flex-1 text-center font-black pr-10">HTTPS証明書</h2>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
                        <div className="text-sm font-black text-slate-900">信頼手順</div>
                        <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                            <li>下のボタンでHTTPSページを開く</li>
                            <li>ブラウザの警告で「続行」/「詳細」→「このサイトにアクセス」</li>
                            <li>一度許可すると以降は警告が出なくなります</li>
                        </ol>
                        <div className="text-[11px] text-slate-500">アクセス先: {httpsUrl}</div>
                        <button
                            onClick={() => window.open(httpsUrl, '_blank')}
                            className="w-full py-2 rounded-lg bg-[#007aff] text-white text-sm font-bold"
                        >
                            HTTPSページを開く
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (activeView === 'autolock') {
        return (
            <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center">
                    <button onClick={() => setActiveView('main')} className="flex items-center text-[#007aff] font-medium -ml-1">
                        <ChevronLeft className="w-6 h-6" />
                        <span>設定</span>
                    </button>
                    <h2 className="flex-1 text-center font-black pr-10">自動ロック</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                        {AUTO_LOCK_OPTIONS.map((option, i) => (
                            <button
                                key={option.label}
                                onClick={() => updateSmartphoneSetting({ autoLockSeconds: option.seconds })}
                                className={`w-full flex items-center justify-between p-4 ${i !== 0 ? 'border-t border-slate-100' : ''} active:bg-slate-50 transition-colors`}
                            >
                                <span className="text-sm font-medium text-slate-900">{option.label}</span>
                                {smartphoneSettings.autoLockSeconds === option.seconds && <Check className="w-4 h-4 text-[#007aff]" />}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mt-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-900">更新時に自動ロック</p>
                            <p className="text-[10px] text-slate-400">データ更新が入ると即ロックします</p>
                        </div>
                        <button
                            onClick={() => updateSmartphoneSetting({ autoLockOnUpdate: !smartphoneSettings.autoLockOnUpdate })}
                            className={`w-12 h-7 rounded-full transition-all relative p-1 ${smartphoneSettings.autoLockOnUpdate ? 'bg-green-500' : 'bg-slate-200'}`}
                            aria-label="更新時に自動ロックを切り替え"
                        >
                            <motion.div
                                animate={{ x: smartphoneSettings.autoLockOnUpdate ? 20 : 0 }}
                                className="w-5 h-5 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mt-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-900">ホーム復帰時に自動ロック</p>
                            <p className="text-[10px] text-slate-400">ホーム画面に戻るとロックします</p>
                        </div>
                        <button
                            onClick={() => updateSmartphoneSetting({ autoLockOnHome: !smartphoneSettings.autoLockOnHome })}
                            className={`w-12 h-7 rounded-full transition-all relative p-1 ${smartphoneSettings.autoLockOnHome ? 'bg-green-500' : 'bg-slate-200'}`}
                            aria-label="ホーム復帰時に自動ロックを切り替え"
                        >
                            <motion.div
                                animate={{ x: smartphoneSettings.autoLockOnHome ? 20 : 0 }}
                                className="w-5 h-5 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (activeView === 'wallpaper') {
        return (
            <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center">
                    <button onClick={() => setActiveView('display')} className="flex items-center text-[#007aff] font-medium -ml-1">
                        <ChevronLeft className="w-6 h-6" />
                        <span>戻る</span>
                    </button>
                    <h2 className="flex-1 text-center font-black pr-10">ロック画面の壁紙</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
                        <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                            {smartphoneSettings.lockScreenImage ? (
                                <img
                                    src={smartphoneSettings.lockScreenImage}
                                    alt="lockscreen preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>標準壁紙</span>
                            )}
                        </div>

                        {wallpaperError && (
                            <p className="text-xs text-rose-500 font-bold">{wallpaperError}</p>
                        )}

                        <label className="block">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleWallpaperFile(e.target.files?.[0])}
                            />
                            <span className="block w-full text-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer">
                                画像を選択
                            </span>
                        </label>

                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-500">URLから設定</p>
                            <input
                                value={wallpaperUrl}
                                onChange={(e) => setWallpaperUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                            />
                            <button
                                onClick={() => {
                                    if (!wallpaperUrl.trim()) {
                                        setWallpaperError('URLを入力してください');
                                        return;
                                    }
                                    setWallpaperError('');
                                    updateSmartphoneSetting({ lockScreenImage: wallpaperUrl.trim() });
                                }}
                                className="w-full text-center px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                            >
                                URLを適用
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setWallpaperError('');
                                updateSmartphoneSetting({ lockScreenImage: '' });
                            }}
                            className="w-full text-center px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                        >
                            標準に戻す
                        </button>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
                        <p className="text-xs font-black text-slate-600">ギャラリーから選択</p>
                        {galleryImages.length === 0 ? (
                            <p className="text-[10px] text-slate-400">カメラのギャラリーに画像がありません</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {galleryImages.map((src, index) => (
                                    <button
                                        key={`${src}-${index}`}
                                        onClick={() => updateSmartphoneSetting({ lockScreenImage: src })}
                                        className="relative w-full aspect-[9/12] rounded-lg overflow-hidden border border-slate-100"
                                    >
                                        <img src={src} alt="gallery" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (activeView === 'auth') {
        const hasPasscode = Boolean(smartphoneSettings.passcode);
        return (
            <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center">
                    <button onClick={() => setActiveView('main')} className="flex items-center text-[#007aff] font-medium -ml-1">
                        <ChevronLeft className="w-6 h-6" />
                        <span>設定</span>
                    </button>
                    <h2 className="flex-1 text-center font-black pr-10">Face ID/パスコード</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                        <button
                            onClick={() => openPasscodeFlow(hasPasscode ? 'change' : 'set')}
                            className="w-full flex items-center justify-between p-4 border-b border-slate-100"
                        >
                            <span className="text-sm font-medium text-slate-900">{hasPasscode ? 'パスコードを変更' : 'パスコードを設定'}</span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                        </button>
                        {hasPasscode && (
                            <button
                                onClick={() => updateSmartphoneSetting({ passcode: '', biometricEnabled: false })}
                                className="w-full flex items-center justify-between p-4"
                            >
                                <span className="text-sm font-medium text-rose-500">パスコードをオフ</span>
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                        <div className="w-full flex items-center justify-between p-4 border-b border-slate-100">
                            <span className={`text-sm font-medium ${hasPasscode ? 'text-slate-900' : 'text-slate-300'}`}>Face ID</span>
                            <button
                                onClick={() => hasPasscode && updateSmartphoneSetting({ biometricEnabled: !smartphoneSettings.biometricEnabled })}
                                className={`w-12 h-7 rounded-full transition-all relative p-1 ${smartphoneSettings.biometricEnabled && hasPasscode ? 'bg-green-500' : 'bg-slate-200'}`}
                                aria-label="Face IDを切り替え"
                            >
                                <motion.div
                                    animate={{ x: smartphoneSettings.biometricEnabled && hasPasscode ? 20 : 0 }}
                                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>
                        <button
                            onClick={() => hasPasscode && updateSmartphoneSetting({ biometricEnabled: true })}
                            className={`w-full flex items-center justify-between p-4 ${hasPasscode ? '' : 'text-slate-300'}`}
                        >
                            <span className="text-sm font-medium">Face IDの再設定</span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (activeView === 'passcode') {
        const hasPasscode = Boolean(smartphoneSettings.passcode);
        const title = passcodeMode === 'change' ? 'パスコード変更' : 'パスコード設定';
        const instruction = passcodeStep === 'current'
            ? '現在のパスコードを入力'
            : passcodeStep === 'new'
                ? '新しいパスコードを入力'
                : '新しいパスコードを再入力';

        const inputValue = passcodeStep === 'current'
            ? currentPasscodeInput
            : passcodeStep === 'new'
                ? passcodeInput
                : passcodeConfirmInput;

        const setInputValue = (val: string) => {
            const numeric = val.replace(/\D/g, '').slice(0, 4);
            if (passcodeStep === 'current') setCurrentPasscodeInput(numeric);
            if (passcodeStep === 'new') setPasscodeInput(numeric);
            if (passcodeStep === 'confirm') setPasscodeConfirmInput(numeric);
        };

        const handleNext = async () => {
            setPasscodeError('');
            if (passcodeStep === 'current') {
                if (currentPasscodeInput !== smartphoneSettings.passcode) {
                    setPasscodeError('パスコードが一致しません');
                    return;
                }
                setPasscodeStep('new');
                return;
            }
            if (passcodeStep === 'new') {
                if (passcodeInput.length < 4) {
                    setPasscodeError('4桁の数字を入力してください');
                    return;
                }
                setPasscodeStep('confirm');
                return;
            }
            if (passcodeStep === 'confirm') {
                if (passcodeConfirmInput !== passcodeInput) {
                    setPasscodeError('パスコードが一致しません');
                    return;
                }
                await updateSmartphoneSetting({ passcode: passcodeInput, biometricEnabled: hasPasscode ? smartphoneSettings.biometricEnabled : false });
                setActiveView('auth');
            }
        };

        return (
            <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center">
                    <button onClick={() => setActiveView('auth')} className="flex items-center text-[#007aff] font-medium -ml-1">
                        <ChevronLeft className="w-6 h-6" />
                        <span>戻る</span>
                    </button>
                    <h2 className="flex-1 text-center font-black pr-10">{title}</h2>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                    <p className="text-sm font-bold text-slate-700 mb-4">{instruction}</p>
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        inputMode="numeric"
                        type="password"
                        maxLength={4}
                        className="text-center text-2xl tracking-[0.3em] px-6 py-3 rounded-xl bg-white shadow-sm border border-slate-200 outline-none w-48"
                        aria-label="パスコードの入力"
                    />
                    {passcodeError && <p className="text-xs text-rose-500 mt-3 font-bold">{passcodeError}</p>}
                    <button
                        onClick={handleNext}
                        className={`mt-6 px-6 py-2 rounded-full text-sm font-black ${inputValue.length === 4 ? 'bg-[#007aff] text-white' : 'bg-slate-200 text-slate-400'}`}
                        disabled={inputValue.length < 4}
                    >
                        {passcodeStep === 'confirm' ? '保存' : '次へ'}
                    </button>
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

    if (activeView === 'profile') {
        const [newName, setNewName] = useState(currentUser?.name || '');
        const [isSaving, setIsSaving] = useState(false);

        const handleSaveName = async () => {
            if (!newName.trim()) {
                alert('名前を入力してください');
                return;
            }

            setIsSaving(true);
            try {
                await sendRequest('update_profile', 0, { name: newName.trim() });
                setActiveView('main');
            } catch (error) {
                console.error('名前の更新に失敗しました', error);
                alert('名前の更新に失敗しました');
            } finally {
                setIsSaving(false);
            }
        };

        return (
            <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center">
                    <button onClick={() => setActiveView('main')} className="flex items-center text-[#007aff] font-medium -ml-1">
                        <ChevronLeft className="w-6 h-6" />
                        <span>設定</span>
                    </button>
                    <h2 className="flex-1 text-center font-black pr-10">プロフィール</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-4">
                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2">名前</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#007aff]"
                                placeholder="名前を入力"
                                aria-label="名前を入力"
                            />
                        </div>

                        <button
                            onClick={handleSaveName}
                            disabled={isSaving || !newName.trim()}
                            className={`w-full py-3 rounded-lg text-sm font-bold ${isSaving || !newName.trim()
                                    ? 'bg-slate-200 text-slate-400'
                                    : 'bg-[#007aff] text-white'
                                }`}
                        >
                            {isSaving ? '保存中...' : '保存'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (activeView === 'channel_icon') {
        const iconEmojis = ['👨', '👩', '🧑', '🤖', '👾', '🎬', '📹', '⭐', '🎵', '🎨', '📱', '🎮', '📚', '🍕', '🚀'];

        return (
            <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
                <div className="px-4 pt-14 pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center">
                    <button onClick={() => setActiveView('main')} className="flex items-center text-[#007aff] font-medium -ml-1">
                        <ChevronLeft className="w-6 h-6" />
                        <span>設定</span>
                    </button>
                    <h2 className="flex-1 text-center font-black pr-10">チャンネルアイコン</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-600 mb-4">現在のアイコン</p>
                        <div className="text-6xl text-center mb-4">
                            {currentUser?.channelIcon || '👤'}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                        <p className="text-sm font-medium text-slate-600 mb-4">アイコンを選択</p>
                        <div className="grid grid-cols-5 gap-3">
                            {iconEmojis.map(emoji => (
                                <motion.button
                                    key={emoji}
                                    whileTap={{ scale: 0.8 }}
                                    whileHover={{ scale: 1.1 }}
                                    onClick={async () => {
                                        try {
                                            await sendRequest('set_channel_icon', 0, { icon: emoji });
                                            setActiveView('main');
                                        } catch (error) {
                                            console.error(error);
                                        }
                                    }}
                                    className="aspect-square rounded-lg flex items-center justify-center text-4xl bg-slate-100 hover:bg-slate-200 transition-colors border-2 border-slate-200"
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </div>
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
                <button
                    onClick={() => setActiveView('profile')}
                    className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-slate-200 active:bg-slate-50 transition-colors w-full text-left"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center p-0.5">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">{currentUser?.name}</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Apple ID, iCloud+など</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>

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

                {/* Channel Settings */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <SettingItem
                        icon={<span className="text-lg">{currentUser?.channelIcon || '📺'}</span>}
                        color="bg-orange-500"
                        label="チャンネルアイコン"
                        value={currentUser?.channelIcon || '未設定'}
                        onClick={() => setActiveView('channel_icon')}
                    />
                </div>

                {/* Privacy & General */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <SettingItem icon={<Info />} color="bg-slate-500" label="一般" onClick={() => openDetail('一般', ['情報', 'ソフトウェアアップデート', '言語と地域', '日付と時刻', 'リセット'])} />
                    <SettingItem icon={<Lock />} color="bg-blue-600" label="プライバシーとセキュリティ" onClick={() => openDetail('プライバシーとセキュリティ', ['位置情報サービス', 'カメラ', 'マイク', '写真', 'ヘルスケア'])} />
                </div>

                {/* System */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <SettingItem icon={<Smartphone />} color="bg-slate-700" label="画面表示と明るさ" onClick={() => setActiveView('display')} />
                    <SettingItem icon={<Clock />} color="bg-slate-500" label="自動ロック" value={autoLockLabel} onClick={() => setActiveView('autolock')} />
                    <SettingItem icon={<Bell />} color="bg-yellow-500" label="サウンド" onClick={() => setActiveView('sounds')} />
                    <SettingItem icon={<Lock />} color="bg-emerald-600" label="Face ID/パスコード" onClick={() => setActiveView('auth')} />
                    <SettingItem icon={<Info />} color="bg-purple-600" label="バッテリー" onClick={() => openDetail('バッテリー', ['バッテリーの状態', '低電力モード', '使用状況'])} />
                    <SettingItem icon={<Lock />} color="bg-amber-500" label="HTTPS証明書" onClick={() => setActiveView('certificate')} />
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
