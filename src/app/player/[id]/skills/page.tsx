'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SKILLS } from '@/lib/gameData';

const MAX_ROUNDS = 3;

const scoreToRank = (score: number) => {
    if (score >= 90) return { label: 'S', color: 'text-amber-500' };
    if (score >= 75) return { label: 'A', color: 'text-emerald-500' };
    if (score >= 60) return { label: 'B', color: 'text-sky-500' };
    if (score >= 40) return { label: 'C', color: 'text-indigo-400' };
    return { label: 'D', color: 'text-rose-500' };
};

export default function SkillsPage() {
    const { currentUser, sendRequest } = useGame();
    const [selectedSkill, setSelectedSkill] = useState(SKILLS[0] || '');
    const [meter, setMeter] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [targetRange, setTargetRange] = useState({ start: 40, end: 60 });
    const [roundIndex, setRoundIndex] = useState(0);
    const [roundScores, setRoundScores] = useState<number[]>([]);
    const [phase, setPhase] = useState<'idle' | 'running' | 'cooldown' | 'done'>('idle');
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const directionRef = useRef(1);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isRunning) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            setMeter((prev) => {
                let next = prev + directionRef.current * 3.5;
                if (next >= 100) {
                    next = 100;
                    directionRef.current = -1;
                }
                if (next <= 0) {
                    next = 0;
                    directionRef.current = 1;
                }
                return next;
            });
        }, 32);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const skillLevelMap = useMemo(() => currentUser?.skills || {}, [currentUser?.skills]);

    if (!currentUser) return <div>Loading...</div>;

    const setupRound = () => {
        setMeter(0);
        directionRef.current = 1;
        const center = 25 + Math.random() * 50;
        const span = 10 + Math.random() * 8;
        setTargetRange({ start: Math.max(8, center - span), end: Math.min(92, center + span) });
        setIsRunning(true);
        setPhase('running');
    };

    const startTraining = () => {
        setRoundScores([]);
        setRoundIndex(0);
        setupRound();
    };

    const lockTiming = () => {
        if (phase !== 'running') return;
        setIsRunning(false);
        setPhase('cooldown');

        const center = (targetRange.start + targetRange.end) / 2;
        const distance = Math.abs(meter - center);
        const score = Math.max(0, Math.round(100 - distance * 2));
        setRoundScores((prev) => [...prev, score]);

        const nextRound = roundIndex + 1;
        if (nextRound < MAX_ROUNDS) {
            setTimeout(() => {
                setRoundIndex(nextRound);
                setupRound();
            }, 650);
        } else {
            setPhase('done');
        }
    };

    const totalScore = roundScores.length
        ? Math.round(roundScores.reduce((sum, value) => sum + value, 0) / roundScores.length)
        : 0;

    const applyTraining = async () => {
        if (phase !== 'done' || !selectedSkill) return;
        await sendRequest('train_skill', 0, { skillName: selectedSkill, score: totalScore });
        setPhase('idle');
    };

    const rank = scoreToRank(totalScore);

    return (
        <div className="space-y-6">
            <Card padding="lg" className="bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-900 text-white shadow-xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">スキルトレーニング</h2>
                        <p className="text-xs text-indigo-200/80">タイミングをロックして精度を競う、3ラウンド制の集中訓練。</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full px-3 py-1 text-xs font-bold bg-white/10">ROUND {Math.min(roundIndex + 1, MAX_ROUNDS)}/{MAX_ROUNDS}</div>
                        <div className="rounded-full px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-200">{selectedSkill}</div>
                    </div>
                </div>
            </Card>

            <Card padding="lg" className="border border-slate-200 bg-white/70">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm font-bold text-slate-700">スキル選択</div>
                    <div className="flex flex-wrap gap-2">
                        {SKILLS.map((skill) => (
                            <button
                                key={skill}
                                onClick={() => setSelectedSkill(skill)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${selectedSkill === skill
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                    }`}
                            >
                                {skill}
                                <span className="ml-2 text-[10px] text-slate-400">Lv {skillLevelMap[skill] || 0}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <Card padding="lg" className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
                <div className="flex flex-col gap-6">
                    <div className="space-y-2">
                        <div className="text-sm font-semibold text-indigo-200">精度ゲージ</div>
                        <div className="relative h-6 rounded-full bg-white/10 overflow-hidden border border-white/10">
                            <div
                                className="absolute top-0 bottom-0 bg-emerald-400/60"
                                style={{
                                    left: `${targetRange.start}%`,
                                    width: `${targetRange.end - targetRange.start}%`
                                }}
                            />
                            <div
                                className="absolute top-0 bottom-0 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                                style={{ left: `${meter}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs text-indigo-200/80">
                            <span>フォーカス</span>
                            <span>ロック位置: {Math.round(meter)}%</span>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                        {Array.from({ length: MAX_ROUNDS }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`rounded-2xl p-3 border ${idx === roundIndex && phase !== 'done'
                                    ? 'border-emerald-400/60 bg-emerald-400/10'
                                    : 'border-white/10 bg-white/5'
                                    }`}
                            >
                                <div className="text-xs text-indigo-200">ROUND {idx + 1}</div>
                                <div className="text-lg font-black mt-1">
                                    {roundScores[idx] !== undefined ? `${roundScores[idx]}pt` : '--'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {phase === 'idle' && (
                            <Button onClick={startTraining} className="flex-1">
                                トレーニング開始
                            </Button>
                        )}
                        {phase === 'running' && (
                            <Button onClick={lockTiming} className="flex-1">
                                タイミングをロック
                            </Button>
                        )}
                        {phase === 'cooldown' && (
                            <Button disabled className="flex-1 opacity-70">
                                次のラウンド準備中...
                            </Button>
                        )}
                        {phase === 'done' && (
                            <Button onClick={applyTraining} className="flex-1">
                                結果を登録
                            </Button>
                        )}
                        {phase !== 'idle' && (
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => {
                                    setIsRunning(false);
                                    setPhase('idle');
                                    setRoundScores([]);
                                    setRoundIndex(0);
                                }}
                            >
                                リセット
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            <Card padding="lg" className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-slate-500">総合スコア</div>
                    <div className="text-3xl font-black text-slate-900">{totalScore}pt</div>
                </div>
                <div className={`text-4xl font-black ${rank.color}`}>{rank.label}</div>
            </Card>
        </div>
    );
}
