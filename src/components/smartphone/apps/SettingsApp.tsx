import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Volume2, Save } from 'lucide-react';

interface SettingsAppProps {
    onClose: () => void;
}

const SOUND_LIST = Array.from({ length: 21 }, (_, i) => ({
    id: `notification_${i + 1}`,
    filename: `notification_${i + 1}.mp3`,
    label: `通知音 ${i + 1}`
}));

export const SettingsApp: React.FC<SettingsAppProps> = ({ onClose }) => {
    const { currentUser } = useGame();
    // In a real app, this would come from user preference in DB
    const [selectedSound, setSelectedSound] = useState('notification_1.mp3');

    useEffect(() => {
        const saved = localStorage.getItem('notification_sound');
        if (saved) setSelectedSound(saved);
    }, []);

    const handlePlayPreview = (filename: string) => {
        const audio = new Audio(`/sounds/${filename}`);
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Audio play failed", e));
    };

    const handleSave = () => {
        localStorage.setItem('notification_sound', selectedSound);
        // Here you might also want to save to DB via API if you want it to persist across devices
        // For now, local storage is a good quick fix as requested
        const audio = new Audio(`/sounds/${selectedSound}`);
        audio.play().catch(() => { });
        alert('設定を保存しました');
    };

    return (
        <div className="h-full w-full bg-slate-50 flex flex-col font-sans text-slate-900">
            {/* Header */}
            <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-lg font-bold">設定</h1>
                <div className="w-8" /> {/* Spacer */}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Sound Settings */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold flex items-center gap-2 text-slate-700">
                            <Volume2 className="w-5 h-5 text-indigo-500" />
                            通知音設定
                        </h2>
                    </div>

                    <div className="p-4">
                        <p className="text-xs text-slate-500 mb-4">
                            ※ `public/sounds/` フォルダに `notification_1.mp3` 〜 `notification_21.mp3` を配置してください。
                        </p>

                        <div className="space-y-2">
                            {SOUND_LIST.map((sound) => (
                                <div
                                    key={sound.id}
                                    onClick={() => setSelectedSound(sound.filename)}
                                    className={`
                                        flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                                        ${selectedSound === sound.filename
                                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                            : 'border-slate-200 hover:border-indigo-300'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-4 h-4 rounded-full border-2 flex items-center justify-center
                                            ${selectedSound === sound.filename ? 'border-indigo-500' : 'border-slate-300'}
                                        `}>
                                            {selectedSound === sound.filename && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                        </div>
                                        <span className="text-sm font-medium">{sound.label}</span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlayPreview(sound.filename);
                                        }}
                                        className="p-2 rounded-full hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-md active:scale-95 transition-all text-sm flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            保存
                        </button>
                    </div>
                </section>

                {/* Version Info */}
                <div className="text-center text-xs text-slate-400 mt-8">
                    Smartphone OS v2.0
                    <br />
                    Real Shop App
                </div>
            </div>
        </div>
    );
};
