'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { JOB_DEFINITIONS } from '@/lib/jobDefinitions';
import { JOB_GAME_CONFIGS, JobType } from '@/lib/jobData';
import { MiniGameConfig } from '@/types';
import { MiniGameContainer } from '@/components/minigames/MiniGameContainer';

export default function SpecialActionPage() {
    const { gameState, currentUser } = useGame();
    const router = useRouter();
    const [targetId, setTargetId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    // Work State
    const [isPlaying, setIsPlaying] = useState(false);

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const jobType = currentUser.jobType || 'normal';
    const jobName = currentUser.job as JobType || 'unemployed';
    const jobDef = JOB_DEFINITIONS[jobType];

    // Debug: Allow selecting any job game
    const [debugJob, setDebugJob] = useState<JobType | ''>('');
    const activeJob = (debugJob || jobName) as JobType;
    const gameConfig = JOB_GAME_CONFIGS[activeJob];

    // Work Handlers
    const handleWorkStart = () => {
        if (!gameState?.isDay) {
            alert('夜は仕事ができません。寝ましょう。');
            return;
        }
        setIsPlaying(true);
    };

    const handleGameComplete = async (score: number, success: boolean) => {
        setIsPlaying(false);
        if (success) {
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'complete_job',
                    requesterId: currentUser.id,
                    details: JSON.stringify({ score, job: jobName })
                })
            });
            alert(`仕事完了！ 報酬を獲得しました。 (Score: ${score})`);
            router.refresh();
        } else {
            alert('仕事失敗... トライし直そう！');
        }
    };

    const handleAction = async (actionType: 'arrest' | 'steal' | 'perform') => {
        setIsProcessing(true);
        setMessage('');

        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                body: JSON.stringify({
                    type: actionType,
                    requesterId: currentUser.id,
                    amount: 0,
                    details: actionType === 'perform' ? '' : targetId
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || '実行しました！');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage(data.error || data.message || '失敗しました');
            }
        } catch (error) {
            setMessage('エラーが発生しました');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>仕事をする</h2>

                {/* Debug Switch: Only for Bankers or users with 'Debug' in name */}
                {(currentUser.role === 'banker' || currentUser.name.includes('Debug')) && (
                    <div className="bg-gray-100 p-2 rounded text-sm">
                        <label className="mr-2 font-bold text-gray-600">デバッグ切替:</label>
                        <select
                            value={debugJob}
                            onChange={(e) => setDebugJob(e.target.value as JobType)}
                            className="p-1 rounded border"
                        >
                            <option value="">本来の職業 ({jobName})</option>
                            {Object.entries(JOB_GAME_CONFIGS).map(([key, config]) => (
                                <option key={key} value={key}>
                                    {config.name} ({key})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>


            {/* Daily Work Card */}
            {gameConfig && (
                <Card padding="lg" style={{ marginBottom: '2rem', textAlign: 'center', border: '2px solid #3b82f6' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>📋 本日の業務: {gameConfig.name}</h3>
                    <p style={{ margin: '1rem 0', color: '#666' }}>{gameConfig.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <div>⏱️ 所要時間: {gameConfig.duration}秒</div>
                        <div>💰 報酬倍率: x{gameConfig.rewardMultiplier}</div>
                    </div>
                    <Button fullWidth variant="primary" onClick={handleWorkStart} disabled={!gameState?.isDay}>
                        仕事を開始する
                    </Button>
                    {!gameState?.isDay && <p style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.8rem' }}>※夜間は営業外です</p>}
                </Card>
            )}

            {isPlaying && gameConfig && (
                <MiniGameContainer
                    config={{
                        id: `game_${Date.now()}`,
                        jobId: jobName,
                        // @ts-ignore
                        ...gameConfig
                    } as MiniGameConfig}
                    onComplete={handleGameComplete}
                    onClose={() => setIsPlaying(false)}
                />
            )}

            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', marginTop: '2rem' }}>特殊能力・ステータス</h3>

            {/* 職業情報 */}
            <Card padding="lg" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: 'white' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{jobDef.name}</h3>
                <p style={{ opacity: 0.9 }}>{jobDef.description}</p>
                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.9rem' }}>
                    {jobType === 'police' && (
                        <div>
                            <div style={{ opacity: 0.8 }}>逮捕回数</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentUser.arrestCount || 0}</div>
                        </div>
                    )}
                    {jobType === 'thief' && (
                        <div>
                            <div style={{ opacity: 0.8 }}>盗んだ総額</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(currentUser.stolenAmount || 0).toLocaleString()}枚</div>
                        </div>
                    )}
                    {jobType === 'idol' && (
                        <>
                            <div>
                                <div style={{ opacity: 0.8 }}>ファン数</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentUser.fanCount || 0}人</div>
                            </div>
                            <div>
                                <div style={{ opacity: 0.8 }}>人気度</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⭐{currentUser.rating || 0}</div>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* 警察の逮捕アクション */}
            {jobType === 'police' && (
                <Card padding="lg">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>🚔 逮捕アクション</h3>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        税金未納者または泥棒を逮捕して報奨金300枚を獲得
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ターゲットのID</label>
                        <input
                            type="text"
                            value={targetId}
                            onChange={e => setTargetId(e.target.value)}
                            placeholder="逮捕する相手のID"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <Button
                        onClick={() => handleAction('arrest')}
                        disabled={!targetId || isProcessing}
                        fullWidth
                        style={{ background: '#3b82f6', color: 'white' }}
                    >
                        {isProcessing ? '処理中...' : '逮捕する'}
                    </Button>

                    {/* 逮捕可能なユーザーリスト */}
                    <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>逮捕可能なユーザー:</h4>
                        {gameState.users
                            .filter(u => u.role === 'player' && u.id !== currentUser.id && ((u.unpaidTax && u.unpaidTax > 0) || u.jobType === 'thief'))
                            .map(u => (
                                <div
                                    key={u.id}
                                    onClick={() => setTargetId(u.id)}
                                    style={{
                                        padding: '0.5rem',
                                        background: '#f3f4f6',
                                        borderRadius: '4px',
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {u.name} {u.jobType === 'thief' && '(泥棒)'} {u.unpaidTax && u.unpaidTax > 0 && `(未納税: ${u.unpaidTax}枚)`}
                                </div>
                            ))}
                    </div>
                </Card>
            )}

            {/* 泥棒の盗みアクション */}
            {jobType === 'thief' && (
                <Card padding="lg">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>💰 盗みアクション</h3>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        50-200枚を盗む（成功率60%、失敗で罰金500枚）
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ターゲットのID</label>
                        <input
                            type="text"
                            value={targetId}
                            onChange={e => setTargetId(e.target.value)}
                            placeholder="盗む相手のID"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <Button
                        onClick={() => handleAction('steal')}
                        disabled={!targetId || isProcessing}
                        fullWidth
                        style={{ background: '#ef4444', color: 'white' }}
                    >
                        {isProcessing ? '処理中...' : '盗む'}
                    </Button>

                    {/* ターゲット候補リスト */}
                    <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>ターゲット候補:</h4>
                        {gameState.users
                            .filter(u => u.role === 'player' && u.id !== currentUser.id && u.balance > 0)
                            .map(u => (
                                <div
                                    key={u.id}
                                    onClick={() => setTargetId(u.id)}
                                    style={{
                                        padding: '0.5rem',
                                        background: '#f3f4f6',
                                        borderRadius: '4px',
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {u.name} (残高: {u.balance.toLocaleString()}枚)
                                </div>
                            ))}
                    </div>
                </Card>
            )}

            {/* アイドルのライブアクション */}
            {jobType === 'idol' && (
                <Card padding="lg">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>🎤 ライブアクション</h3>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        基本200枚 + 人気度 × 50枚を獲得（人気度+1、ファン増加）
                    </p>

                    <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#92400e' }}>
                            現在の予想収入: <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {200 + (currentUser.rating || 0) * 50}枚
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={() => handleAction('perform')}
                        disabled={isProcessing}
                        fullWidth
                        style={{ background: '#ec4899', color: 'white' }}
                    >
                        {isProcessing ? '処理中...' : 'ライブ開催！'}
                    </Button>
                </Card>
            )}

            {/* メッセージ表示 */}
            {message && (
                <Card padding="md" style={{ marginTop: '1rem', background: message.includes('失敗') ? '#fee2e2' : '#d1fae5' }}>
                    <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{message}</p>
                </Card>
            )}
        </div>
    );
}
