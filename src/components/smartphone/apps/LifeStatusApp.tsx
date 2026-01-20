'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';

interface StatusCardProps {
    label: string;
    value: number;
    max: number;
    icon: string;
    color: string;
    warning?: boolean;
    hint?: string;
}

const StatusCard = ({ label, value, max, icon, color, warning, hint }: StatusCardProps) => {
    const percentage = Math.min((value / max) * 100, 100);
    const isLow = percentage < 25;
    const isHigh = percentage > 75;

    return (
        <motion.div
            className={`bg-white rounded-xl p-3 shadow-sm border ${warning ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="font-bold text-sm text-gray-700">{label}</span>
                </div>
                <span className={`text-sm font-bold ${warning ? 'text-red-500' : 'text-gray-600'}`}>
                    {value}/{max}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
            {hint && (
                <p className="text-xs text-gray-400 mt-1">{hint}</p>
            )}
            {warning && (
                <p className="text-xs text-red-500 mt-1 font-medium">⚠️ 警告レベル</p>
            )}
        </motion.div>
    );
};

const StatBadge = ({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${color}`}>
        <span className="text-lg">{icon}</span>
        <div>
            <div className="text-xs font-medium opacity-70">{label}</div>
            <div className="font-bold text-sm">{value}</div>
        </div>
    </div>
);

import { FurniturePlacement } from '@/components/housing/FurniturePlacement';

export const LifeStatusApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser } = useGame();
    const [showFurniturePlacement, setShowFurniturePlacement] = React.useState(false);

    if (!currentUser) return null;

    if (showFurniturePlacement) {
        return <FurniturePlacement onClose={() => setShowFurniturePlacement(false)} />;
    }

    // 基本ステータス
    const stats = currentUser.lifeStats || {
        health: 100,
        hunger: 0,
        stress: 0,
        fatigue: 0,
        hygiene: 100
    };

    // Torn City参考の追加ステータス
    const nerve = currentUser.nerve ?? 100;
    const suspicionScore = currentUser.suspicionScore ?? 0;
    const arrestCount = currentUser.arrestCount ?? 0;
    const happiness = currentUser.happiness ?? 50;

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-pink-50 to-white text-gray-900">
            {/* ヘッダー */}
            <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
                        >
                            ←
                        </button>
                        <div>
                            <h2 className="font-bold text-lg">ヘルスケア</h2>
                            <p className="text-xs opacity-80">ライフステータス管理</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFurniturePlacement(true)}
                        className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
                    >
                        🏠 模様替え
                    </button>
                </div>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 p-4 overflow-y-auto space-y-6">

                {/* クイックステータス */}
                <div className="grid grid-cols-3 gap-2">
                    <StatBadge
                        label="幸福度"
                        value={happiness}
                        icon="😊"
                        color="bg-yellow-100 text-yellow-800"
                    />
                    <StatBadge
                        label="逮捕歴"
                        value={`${arrestCount}回`}
                        icon="🚔"
                        color={arrestCount > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}
                    />
                    <StatBadge
                        label="信用度"
                        value={currentUser.creditScore ?? 500}
                        icon="💳"
                        color="bg-blue-100 text-blue-800"
                    />
                </div>

                {/* バイタル */}
                <section>
                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>❤️</span> バイタルサイン
                    </h3>
                    <div className="space-y-3">
                        <StatusCard
                            label="健康"
                            value={stats.health}
                            max={100}
                            icon="❤️"
                            color="bg-gradient-to-r from-red-400 to-red-500"
                            warning={stats.health < 30}
                            hint={stats.health < 30 ? "病院で回復してください" : undefined}
                        />
                        <StatusCard
                            label="満腹度"
                            value={100 - stats.hunger}
                            max={100}
                            icon="🍔"
                            color="bg-gradient-to-r from-orange-400 to-orange-500"
                            warning={stats.hunger > 70}
                            hint={stats.hunger > 70 ? "食事を取りましょう" : undefined}
                        />
                        <StatusCard
                            label="清潔度"
                            value={stats.hygiene}
                            max={100}
                            icon="✨"
                            color="bg-gradient-to-r from-cyan-400 to-cyan-500"
                        />
                    </div>
                </section>

                {/* メンタル & 疲労 */}
                <section>
                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>🧠</span> メンタル & 疲労
                    </h3>
                    <div className="space-y-3">
                        <StatusCard
                            label="ストレス"
                            value={stats.stress}
                            max={100}
                            icon="😫"
                            color="bg-gradient-to-r from-purple-400 to-purple-500"
                            warning={stats.stress > 70}
                            hint={stats.stress > 70 ? "休息が必要です" : undefined}
                        />
                        <StatusCard
                            label="疲労"
                            value={stats.fatigue}
                            max={100}
                            icon="💤"
                            color="bg-gradient-to-r from-gray-400 to-gray-500"
                            warning={stats.fatigue > 80}
                        />
                    </div>
                </section>

                {/* 犯罪 & 疑惑 (Torn City参考) */}
                <section>
                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>🕵️</span> アンダーグラウンド
                    </h3>
                    <div className="space-y-3">
                        <StatusCard
                            label="Nerve (犯罪スタミナ)"
                            value={nerve}
                            max={100}
                            icon="💀"
                            color="bg-gradient-to-r from-slate-600 to-slate-700"
                            hint="犯罪行動で消費、時間経過で回復"
                        />
                        <StatusCard
                            label="疑惑度"
                            value={suspicionScore}
                            max={100}
                            icon="👁️"
                            color="bg-gradient-to-r from-amber-500 to-red-500"
                            warning={suspicionScore > 70}
                            hint={suspicionScore > 70 ? "100で監査イベント発生！" : "怪しい行動で上昇"}
                        />
                    </div>

                    {/* 逮捕歴詳細 */}
                    {arrestCount > 0 && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                            <div className="flex items-center gap-2 text-red-700">
                                <span className="text-xl">🚨</span>
                                <div>
                                    <div className="font-bold text-sm">逮捕歴あり</div>
                                    <div className="text-xs opacity-80">
                                        これまでに{arrestCount}回逮捕されました
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* ファミリー */}
                <section>
                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>👨‍👩‍👧</span> ファミリー
                    </h3>
                    {currentUser.family && currentUser.family.length > 0 ? (
                        <div className="space-y-2">
                            {currentUser.family.map(f => (
                                <motion.div
                                    key={f.id}
                                    className="flex justify-between items-center bg-white p-3 rounded-xl border border-pink-100 shadow-sm"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">
                                            {f.relation === 'spouse' ? '💑' : f.relation === 'child' ? '👶' : '👤'}
                                        </span>
                                        <span className="font-bold text-sm">{f.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">
                                            {f.relation === 'spouse' ? '配偶者' : f.relation === 'child' ? '子供' : '家族'}
                                        </div>
                                        <div className="text-xs text-pink-500 font-medium">
                                            ♥ {f.affection}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            <span className="text-3xl">👤</span>
                            <p className="text-sm mt-2">家族はいません</p>
                        </div>
                    )}
                </section>

                {/* ペット (NEW) */}
                <section>
                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>🐾</span> ペット
                    </h3>
                    {currentUser.myRoomItems?.filter(i => i.category === 'pet').length > 0 ? (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                {currentUser.myRoomItems.filter(i => i.category === 'pet').map(item => (
                                    <div key={item.id} className="bg-white p-2 rounded-lg border border-orange-100 flex items-center gap-2">
                                        <span className="text-2xl">{item.emoji ?? '🐶'}</span>
                                        <span className="text-sm font-bold">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={async () => {
                                    const pets = currentUser.myRoomItems.filter(i => i.category === 'pet');
                                    await fetch('/api/action', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            type: 'interact_pet',
                                            requesterId: currentUser.id,
                                            details: { petItemIds: pets.map(p => p.id) }
                                        })
                                    });
                                    alert('ペットたちと遊びました！癒やされました〜');
                                }}
                                className="w-full py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow-sm"
                            >
                                🧶 遊ぶ
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <span className="text-3xl">🐕</span>
                            <p className="text-sm mt-2">ペットはいません</p>
                            <p className="text-xs">カタログで家族を迎えましょう</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
