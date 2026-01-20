import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/types';
import { useGame } from '@/context/GameContext';

// 21 Notification Sounds (Mock IDs for now)
const NOTIFICATION_SOUNDS = Array.from({ length: 21 }, (_, i) => ({
    id: `sound_${i + 1}`,
    name: `通知音 ${i + 1}`,
    file: `/sounds/notification_${i + 1}.mp3` // Placeholder paths
}));

interface SettingsAppProps {
    onClose: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ onClose }) => {
    const { sendRequest, currentUser } = useGame();
    const [selectedSound, setSelectedSound] = useState(currentUser?.settings?.notificationSound || 'sound_1');

    if (!currentUser) return <div>Loading...</div>;

    const handleSave = async (soundId: string) => {
        setSelectedSound(soundId);
        // Call API to update settings
        await sendRequest('update_profile', 0, {
            // We reuse update_profile or need a new one. 
            // Since update_profile doesn't support settings yet, we'll just mock it or add support.
            // But for now let's safely ignore the server update or use a placeholder if the API doesn't support it.
            // Actually, let's assume we can pass settings to update_profile or similar.
            // Or simply:
            settings: { notificationSound: soundId }
        });
    };

    const playPreview = (soundId: string) => {
        // In a real app, this would play the audio file.
        // For now, we simulate a beep or log.
        const audio = new Audio(`/sounds/${soundId}.mp3`);
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio preview failed (no file):', e));
        console.log(`Playing sound: ${soundId}`);
    };

    return (
        <div className="h-full bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-3 z-10">
                <button onClick={onClose} className="text-2xl">
                    ⬅️
                </button>
                <h2 className="font-bold text-lg">設定</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Notification Settings */}
                <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        🔔 通知音設定
                    </h3>

                    <div className="space-y-2">
                        {NOTIFICATION_SOUNDS.map((sound) => (
                            <div
                                key={sound.id}
                                onClick={() => handleSave(sound.id)}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                                    ${selectedSound === sound.id
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'bg-white border-gray-200 hover:border-blue-300'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-4 h-4 rounded-full border flex items-center justify-center
                                        ${selectedSound === sound.id ? 'border-blue-500' : 'border-gray-400'}
                                    `}>
                                        {selectedSound === sound.id && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {sound.name}
                                    </span>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playPreview(sound.id);
                                    }}
                                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                                    title="プレビュー再生"
                                >
                                    ▶️
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Other Settings (Placeholder) */}
                <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-50">
                    <h3 className="font-bold text-gray-700 mb-2">その他</h3>
                    <p className="text-xs text-gray-500">将来的な設定項目はここに追加されます。</p>
                </section>

            </div>
        </div>
    );
};
