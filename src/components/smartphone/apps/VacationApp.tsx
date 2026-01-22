'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plane,
    Hotel,
    Car,
    Briefcase,
    Calendar,
    MapPin,
    Search,
    ChevronLeft,
    Star,
    Info,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock Destinations for UI
const DESTINATIONS = [
    { id: 'island', name: '南の島のリゾート', image: '🏝️', price: '給与停止', rating: 4.8, description: '日々の喧騒を忘れて、白い砂浜でゆったりとした時間を。' },
    { id: 'mountain', name: '高原の隠れ家', image: '⛰️', price: '給与停止', rating: 4.7, description: '澄んだ空気と美しい緑に囲まれて、心身ともにリフレッシュ。' },
    { id: 'city', name: '都会のラグジュアリー', image: '🏙️', price: '給与停止', rating: 4.9, description: '一流のサービスと夜景を楽しむ、大人の贅沢な休日。' },
    { id: 'home', name: '自宅でのんびり', image: '🏠', price: '給与停止', rating: 4.5, description: 'たまには何もしない贅沢を。趣味に没頭する最高のお休み。' }
];

export const VacationApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser, gameState } = useGame();
    const [selectedDest, setSelectedDest] = useState<typeof DESTINATIONS[0] | null>(null);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBooked, setIsBooked] = useState(false);

    if (!currentUser) return null;

    const hasPendingRequest = gameState?.requests.some(
        r => r.requesterId === currentUser.id && r.type === 'vacation' && r.status === 'pending'
    );

    const handleBooking = async () => {
        if (!selectedDest) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'vacation',
                    amount: 0,
                    details: `${selectedDest.name}: ${reason || 'リフレッシュのため'}`
                }),
            });
            if (res.ok) {
                setIsBooked(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isBooked || currentUser.isOff) {
        return (
            <div className="h-full bg-white flex flex-col font-sans">
                <div className="bg-[#003580] px-4 pt-12 pb-6 text-white text-center">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                    <h2 className="text-2xl font-black">予約完了！</h2>
                    <p className="text-white/70 text-sm mt-1">承認をお待ちください</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ステータス</p>
                        <p className="text-slate-900 font-bold">
                            {currentUser.isOff ? '🌴 現在お休み中です' : '⏳ 承認待ち'}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            {currentUser.vacationReason || (selectedDest ? `${selectedDest.name}: 申請中` : '予定あり')}
                        </p>
                    </div>
                    <Button onClick={onBack} className="w-full bg-[#003580] text-white py-4 font-black rounded-xl">
                        ホームに戻る
                    </Button>
                </div>
            </div>
        );
    }

    if (selectedDest) {
        return (
            <div className="h-full bg-white flex flex-col font-sans overflow-hidden">
                <div className="relative h-64 shrink-0 bg-slate-100 flex items-center justify-center text-8xl">
                    <button onClick={() => setSelectedDest(null)} className="absolute top-12 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    {selectedDest.image}
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h2 className="text-2xl font-black text-slate-900">{selectedDest.name}</h2>
                            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-xs font-black">{selectedDest.rating}</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{selectedDest.description}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <Calendar className="w-5 h-5 text-[#003580]" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">日付</p>
                                <p className="text-xs font-bold text-slate-900">次のターンから</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">要望・コメント</p>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="例：温泉に行きたい、ゆっくり寝たい"
                                className="w-full bg-transparent text-sm font-medium outline-none h-20 resize-none"
                            />
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 border border-amber-100">
                        <Info className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                            お休み中は給料が発生しませんが、税金や支出も一時停止されます。承認されるまで1〜2ターンかかる場合があります。
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <div>
                            <p className="text-xs font-bold text-slate-400">Total Price</p>
                            <p className="text-2xl font-black text-[#003580]">¥0 <span className="text-xs text-slate-400">(給与停止)</span></p>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600">Free Cancellation</p>
                    </div>
                    <Button
                        onClick={handleBooking}
                        disabled={isSubmitting || hasPendingRequest}
                        className="w-full bg-[#003580] hover:bg-[#002560] text-white py-4 font-black rounded-xl shadow-xl shadow-blue-500/20"
                    >
                        {isSubmitting ? '予約中...' : '今すぐ予約する'}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Expedia Header */}
            <div className="bg-[#003580] px-6 pt-14 pb-6 shrink-0 relative">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onBack} className="text-white"><ChevronLeft className="w-7 h-7" /></button>
                    <h1 className="text-white font-black text-xl italic tracking-tighter">Expedia</h1>
                    <div className="w-7" />
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        placeholder="今度はどこへ？"
                        className="w-full bg-white rounded-xl py-4 pl-12 pr-4 text-sm font-bold shadow-2xl focus:ring-4 focus:ring-yellow-400/30 outline-none transition-all placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* Quick Links */}
            <div className="px-6 py-8 grid grid-cols-4 gap-4">
                <QuickLink icon={<Hotel />} label="宿泊" active />
                <QuickLink icon={<Plane />} label="航空券" />
                <QuickLink icon={<Car />} label="レンタカー" />
                <QuickLink icon={<Briefcase />} label="パッケージ" />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-10 no-scrollbar">
                <div>
                    <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center justify-between">
                        次回の旅行のおすすめ
                        <span className="text-[10px] text-[#003580] tracking-widest uppercase">すべて見る</span>
                    </h2>
                    <div className="space-y-4">
                        {DESTINATIONS.map(dest => (
                            <motion.div
                                key={dest.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedDest(dest)}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex group cursor-pointer"
                            >
                                <div className="w-24 bg-slate-100 flex items-center justify-center text-4xl shrink-0 group-hover:scale-110 transition-transform">
                                    {dest.image}
                                </div>
                                <div className="p-4 flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-black text-slate-800 text-sm">{dest.name}</h3>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                            <span className="text-[10px] font-black">{dest.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mb-2 truncate max-w-[150px]">{dest.description}</p>
                                    <p className="text-sm font-black text-[#003580]">{dest.price}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickLink = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${active ? 'bg-[#003580] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
            }`}>
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className={`text-[10px] font-black ${active ? 'text-[#003580]' : 'text-slate-400'}`}>{label}</span>
    </div>
);
