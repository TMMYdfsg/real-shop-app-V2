'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { JOB_GAME_CONFIGS, JobType } from '@/lib/jobData';
import { JobApplicationModal } from '@/components/effects/JobApplicationModal';

export default function JobPage() {
    const { currentUser, gameState } = useGame();
    const router = useRouter();

    const [modalJob, setModalJob] = useState<string | null>(null);

    if (!currentUser || !gameState) return <div>Loading...</div>;

    // Cast to expected JobType, fallback to 'unemployed'
    const currentJob = (currentUser.job as JobType) || 'unemployed';

    const currentTurn = gameState.turn;
    const turnsSinceChange = currentTurn - (currentUser.lastJobChangeTurn || 0);
    const canChangeJob = currentJob === 'unemployed' || turnsSinceChange >= 4;

    const handleJobSelect = async (newJob: string) => {
        if (newJob === currentJob) return;

        if (!canChangeJob && newJob !== 'unemployed') {
            alert(`転職するにはあと${4 - turnsSinceChange}ターンの勤務が必要です。`);
            return;
        }

        // Resign Logic (Instant)
        if (newJob === 'unemployed') {
            if (confirm('辞職しますか？')) {
                await fetch('/api/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'change_job', // Force change for resign
                        requesterId: currentUser.id,
                        details: 'unemployed'
                    }),
                });
                window.location.reload();
            }
            return;
        }

        // Application Logic (Modal)
        setModalJob(newJob);
    };

    const runApplication = async () => {
        if (!modalJob) return false;

        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'apply_job',
                    requesterId: currentUser.id,
                    details: modalJob
                }),
            });
            const data = await res.json();
            return data.success;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const handleModalClose = () => {
        setModalJob(null);
        window.location.reload();
    };


    const jobList = Object.keys(JOB_GAME_CONFIGS).filter(k => k !== 'unemployed') as JobType[];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🏢</span> ハローワーク (職業選択)
            </h2>

            <Card padding="md" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <div style={{ fontWeight: 'bold' }}>現在の職業: {JOB_GAME_CONFIGS[currentJob]?.name || '無職'}</div>
                {!canChangeJob && <div style={{ fontSize: '0.8rem', color: '#666' }}>転職可能まで: あと {4 - turnsSinceChange} ターン</div>}
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {jobList.map(job => (
                    <Card key={job} padding="sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center', border: currentJob === job ? '2px solid #3b82f6' : '1px solid #eee' }}>
                        <div style={{ fontWeight: 'bold' }}>{JOB_GAME_CONFIGS[job].name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{JOB_GAME_CONFIGS[job].description}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f59e0b' }}>
                            採用率: {JOB_GAME_CONFIGS[job].acceptanceRate ?? 100}%
                        </div>
                        <Button
                            size="sm"
                            onClick={() => handleJobSelect(job)}
                            disabled={!canChangeJob || currentJob === job}
                            variant={currentJob === job ? 'secondary' : 'primary'}
                        >
                            {currentJob === job ? '現職' : '求人に応募'}
                        </Button>
                    </Card>
                ))}

                {currentJob !== 'unemployed' && (
                    <Card padding="sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fee2e2' }}>
                        <div style={{ fontWeight: 'bold', color: '#b91c1c' }}>辞職する</div>
                        <Button size="sm" variant="danger" onClick={() => handleJobSelect('unemployed')} disabled={!canChangeJob}>
                            無職になる
                        </Button>
                    </Card>
                )}
            </div>

            {/* Application Modal */}
            <JobApplicationModal
                jobName={modalJob ? JOB_GAME_CONFIGS[modalJob as JobType]?.name || '' : ''}
                isOpen={!!modalJob}
                onClose={handleModalClose}
                onComplete={() => { }}
                simulateApiCall={runApplication}
            />
        </div>
    );
}
