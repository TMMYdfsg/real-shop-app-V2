'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function GachaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { gameState, currentUser, refresh } = useGame();
    const [isPulling, setIsPulling] = useState(false);
    const [result, setResult] = useState<any[] | null>(null);

    if (!currentUser) return <div>Loading...</div>;

    const handleGacha = async (count: number) => {
        const cost = count * 300; // 仮: 1回300枚
        if (currentUser.balance < cost) {
            alert('お金が足りません');
            return;
        }

        setIsPulling(true);
        setResult(null);

        try {
            // Animation delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'play_gacha',
                    requesterId: currentUser.id,
                    details: { count }
                })
            });

            const data = await res.json();
            if (data.success) {
                setResult(data.items); // API should return items
                refresh();
            } else {
                alert(data.error || 'ガチャに失敗しました');
            }
        } catch (e) {
            console.error(e);
            alert('エラーが発生しました');
        } finally {
            setIsPulling(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => router.back()} className="text-white">
                    ← 戻る
                </Button>
                <div className="font-bold text-xl">💎 プレミアムガチャ</div>
                <div className="text-sm border border-yellow-500 rounded px-2 py-1 text-yellow-500">
                    所持金: {(currentUser.balance || 0).toLocaleString()}枚
                </div>
            </div>

            {/* Banner Area */}
            <div className="mb-8 relative overflow-hidden rounded-xl border-4 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                <div className="bg-gradient-to-r from-purple-800 to-indigo-900 h-48 flex items-center justify-center p-4 text-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                            レアアイテム GETのチャンス!
                        </h2>
                        <p className="text-gray-300">期間限定！インテリア＆ペットガチャ</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Button
                    onClick={() => handleGacha(1)}
                    disabled={isPulling}
                    className="h-auto py-4 flex flex-col items-center bg-blue-600 hover:bg-blue-700 border-none"
                >
                    <span className="text-lg font-bold">1回引く</span>
                    <span className="text-sm opacity-80">300枚</span>
                </Button>
                <Button
                    onClick={() => handleGacha(10)}
                    disabled={isPulling}
                    className="h-auto py-4 flex flex-col items-center bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 border-none relative overflow-hidden"
                >
                    {/* Shine Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 translate-x-[-150%] animate-shimmer" />
                    <span className="text-lg font-bold">10回引く</span>
                    <span className="text-sm opacity-80">3000枚 (SR以上確定!)</span>
                </Button>
            </div>

            {/* Animation Overlay */}
            <AnimatePresence>
                {isPulling && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.5, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-6xl"
                        >
                            🔮
                        </motion.div>
                        <div className="absolute bottom-20 text-white font-bold animate-pulse">
                            運命を信じて...
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result Display */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-4 overflow-y-auto"
                    >
                        <h3 className="text-3xl font-bold mb-8 text-yellow-400">RESULT</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-4xl">
                            {result.map((item: any, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card padding="sm" className="bg-gray-800 border-gray-700 text-center h-full flex flex-col items-center justify-center">
                                        <div className="text-4xl mb-2">{item.emoji}</div>
                                        <div className={`font-bold text-sm ${item.rarity === 'SR' || item.rarity === 'UR' ? 'text-yellow-400' : 'text-white'}`}>
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{item.rarity}</div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                        <Button onClick={() => setResult(null)} className="mt-8 px-12 py-3 text-lg">
                            閉じる
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
