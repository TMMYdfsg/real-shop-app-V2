'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BakerGame } from '@/components/minigames/BakerGame';
import { DoctorGame } from '@/components/minigames/DoctorGame';
import { YoutuberGame } from '@/components/minigames/YoutuberGame';

export default function JobPage() {
    const { currentUser, gameState } = useGame();
    const [isPlaying, setIsPlaying] = useState(false);
    const [lastResult, setLastResult] = useState<{ score: number, reward: number } | null>(null);

    if (!currentUser || !gameState) return <div>Loading...</div>;

    const currentTurn = gameState.turn;
    const turnsSinceChange = currentTurn - (currentUser.lastJobChangeTurn || 0);
    const canChangeJob = currentUser.job === 'unemployed' || turnsSinceChange >= 4;

    const handleJobSelect = async (job: string) => {
        if (!canChangeJob && job !== 'unemployed') {
            alert('転職するには1年(4ターン)勤務する必要があります。');
            return;
        }

        if (confirm(job === 'unemployed' ? '辞職しますか？' : `${job} に就職しますか？`)) {
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'change_job',
                    requesterId: currentUser.id,
                    details: job,
                    amount: 0
                }),
            });
            window.location.reload();
        }
    };

    const handleGameComplete = async (score: number, reward: number) => {
        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'income',
                requesterId: currentUser.id,
                amount: reward,
                details: `Work (${currentUser.job}): Score ${score}`
            }),
        });
        setLastResult({ score, reward });
        setIsPlaying(false);
    };

    // Job List
    const jobs = [
        { id: 'baker', name: 'パン屋さん', icon: '🍞', desc: '美味しいパンを焼こう' },
        { id: 'doctor', name: 'お医者さん', icon: '🩺', desc: '患者さんを治そう' },
        { id: 'youtuber', name: 'YouTuber', icon: '📹', desc: '動画を作って配信' },
    ];

    if (currentUser.job === 'unemployed') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🏢</span> ハローワーク (職業選択)
                </h2>
                <Card padding="md" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <p>新しい仕事を見つけましょう。</p>
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>※一度就職すると1年は転職できません。</p>
                </Card>

                {jobs.map(job => (
                    <Card key={job.id} padding="md" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '2.5rem' }}>{job.icon}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{job.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{job.desc}</div>
                        </div>
                        <Button onClick={() => handleJobSelect(job.id)}>就職する</Button>
                    </Card>
                ))}
            </div>
        );
    }

    // Work Result
    if (lastResult) {
        return (
            <Card padding="lg" style={{ textAlign: 'center' }}>
                <h2>お疲れ様！</h2>
                <div style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
                    スコア: {lastResult.score}<br />
                    報酬申請: <strong>{lastResult.reward}枚</strong>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>銀行員に承認されるとお金が入ります</p>
                <Button onClick={() => setLastResult(null)} style={{ marginTop: '1rem' }}>戻る</Button>
            </Card>
        );
    }

    // Working Mode
    const currentJob = jobs.find(j => j.id === currentUser.job) || { name: currentUser.job, icon: '💼' };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3rem' }}>{currentJob.icon}</div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentJob.name}</h2>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleJobSelect('unemployed')}
                        disabled={!canChangeJob}
                        style={{ opacity: canChangeJob ? 1 : 0.5 }}
                    >
                        {canChangeJob ? '辞職する' : `転職まであと ${4 - turnsSinceChange} ターン`}
                    </Button>
                </div>
            </div>

            <Card padding="lg">
                {currentUser.job === 'baker' && (
                    <BakerGame onComplete={handleGameComplete} onExit={() => setIsPlaying(false)} />
                )}
                {currentUser.job === 'doctor' && (
                    <DoctorGame onComplete={handleGameComplete} onExit={() => setIsPlaying(false)} />
                )}
                {currentUser.job === 'youtuber' && (
                    <YoutuberGame onComplete={handleGameComplete} onExit={() => setIsPlaying(false)} />
                )}
            </Card>
        </div>
    );
}
