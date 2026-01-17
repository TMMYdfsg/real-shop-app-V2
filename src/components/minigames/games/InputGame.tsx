'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface InputGameProps {
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

export const InputGame: React.FC<InputGameProps> = ({ difficulty, onScoreUpdate }) => {
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [phase, setPhase] = useState<'create' | 'uploading' | 'result'>('create');
    const [views, setViews] = useState(0);

    const handleUpload = () => {
        if (!title || !genre) return;
        setPhase('uploading');

        // Simulate upload time
        setTimeout(() => {
            // Calculate views based on title length and randomness
            const baseViews = title.length * 10 * difficulty;
            const randomFactor = Math.random() * 2; // 0.0 - 2.0
            const totalViews = Math.floor(baseViews * randomFactor);

            setViews(totalViews);
            setPhase('result');

            // Score based on views
            const score = Math.min(Math.floor(totalViews / 10), 100);
            onScoreUpdate(score);
        }, 2000);
    };

    return (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {phase === 'create' && (
                <>
                    <h3>動画を作成しよう！</h3>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>タイトル</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="面白いタイトルを入力..."
                            style={{
                                width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc',
                                fontSize: '1.2rem'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>ジャンル</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {['ゲーム', '料理', 'ペット', 'Vlog'].map(g => (
                                <Button
                                    key={g}
                                    variant={genre === g ? 'primary' : 'secondary'}
                                    onClick={() => setGenre(g)}
                                >
                                    {g}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={handleUpload}
                        disabled={!title || !genre}
                        style={{ marginTop: '1rem', fontSize: '1.2rem', padding: '1rem' }}
                    >
                        投稿する！
                    </Button>
                </>
            )}

            {phase === 'uploading' && (
                <div style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '2rem', animation: 'bounce 1s infinite' }}>📡</div>
                    <p>アップロード中...</p>
                </div>
            )}

            {phase === 'result' && (
                <div>
                    <h3>投稿完了！</h3>
                    <div style={{ margin: '1rem 0', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{genre}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{title}</div>
                        <div style={{ fontSize: '2.5rem', color: '#cc0000', fontWeight: 'bold', margin: '1rem 0' }}>
                            {views.toLocaleString()} 再生
                        </div>
                    </div>
                    <div>スコア: {Math.min(Math.floor(views / 10), 100)}</div>
                </div>
            )}
        </div>
    );
};
