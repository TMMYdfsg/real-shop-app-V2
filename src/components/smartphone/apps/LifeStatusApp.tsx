import React from 'react';
import { useGame } from '@/context/GameContext';

export const LifeStatusApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser } = useGame();

    if (!currentUser) return null;

    const stats = currentUser.lifeStats || { health: 100, hunger: 0, stress: 0, fatigue: 0, hygiene: 100 };

    // Helper for progress bars
    const ProgressBar = ({ label, value, color, icon }: any) => (
        <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1">{icon} {label}</span>
                <span>{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-white text-gray-900">
            <div className="p-4 bg-pink-500 text-white flex items-center gap-2">
                <button onClick={onBack}>←</button>
                <h2 className="font-bold text-lg">ヘルスケア</h2>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3 border-b">バイタル</h3>
                    <ProgressBar label="健康" value={stats.health} icon="❤️" color="bg-red-500" />
                    <ProgressBar label="満腹度" value={100 - stats.hunger} icon="🍔" color="bg-orange-400" />
                    <ProgressBar label="清潔" value={stats.hygiene} icon="✨" color="bg-blue-400" />
                </div>

                <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3 border-b">メンタル & 疲労</h3>
                    <ProgressBar label="ストレス" value={stats.stress} icon="😫" color="bg-purple-500" />
                    <ProgressBar label="疲労" value={stats.fatigue} icon="💤" color="bg-gray-500" />
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-3 border-b">ファミリー</h3>
                    {currentUser.family && currentUser.family.length > 0 ? (
                        <div className="space-y-2">
                            {currentUser.family.map(f => (
                                <div key={f.id} className="flex justify-between items-center bg-pink-50 p-2 rounded">
                                    <span className="text-sm font-bold">{f.name}</span>
                                    <span className="text-xs text-pink-500">
                                        {f.relation === 'spouse' ? '配偶者' : f.relation === 'child' ? '子供' : '家族'}
                                        (♥ {f.affection})
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 text-center py-4">
                            家族はいません
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
