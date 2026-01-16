import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface MiniGameProps {
    onComplete: (score: number, reward: number) => void;
    onExit: () => void;
}

export const YoutuberGame: React.FC<MiniGameProps> = ({ onComplete, onExit }) => {
    const [step, setStep] = useState(0); // 0: Create, 1: Result
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');

    const genres = [
        { id: 'game', icon: '🎮', name: 'ゲーム実況', bonus: 1.2 },
        { id: 'vlog', icon: '📹', name: '日常Vlog', bonus: 1.0 },
        { id: 'cooking', icon: '🍳', name: '料理', bonus: 1.1 },
        { id: 'comedy', icon: '🤣', name: 'おもしろ', bonus: 1.5 }, // ハイリスクハイリターン
    ];

    const handlePost = () => {
        if (!title || !genre) return;

        // Simulate results
        setStep(1);

        // ランダム再生数 (100 - 10000)
        let views = Math.floor(Math.random() * 9900) + 100;

        // ジャンルボーナス
        const selectedGenre = genres.find(g => g.id === genre);
        if (selectedGenre) {
            if (selectedGenre.id === 'comedy') {
                // おもしろは当たり外れ激しい
                if (Math.random() > 0.5) views *= 3;
                else views *= 0.1;
            } else {
                views = Math.floor(views * selectedGenre.bonus);
            }
        }

        // 報酬計算: 再生数 / 10 枚
        const reward = Math.floor(views / 10);
        const score = views; // スコア＝再生数

        onComplete(score, reward);
    };

    if (step === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3>動画を作って投稿しよう！</h3>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>タイトル</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="例: すごい技を見せます！"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>ジャンル</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {genres.map(g => (
                            <div
                                key={g.id}
                                onClick={() => setGenre(g.id)}
                                style={{
                                    padding: '1rem',
                                    border: genre === g.id ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    background: genre === g.id ? 'var(--bg-secondary)' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: '2rem' }}>{g.icon}</div>
                                <div>{g.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <Button onClick={handlePost} disabled={!title || !genre} fullWidth>
                    投稿する
                </Button>
                <Button variant="ghost" onClick={onExit}>戻る</Button>
            </div>
        );
    }

    // Result handled by parent actually, but let's show simple result here if parent doesn't navigate away immediately
    // JobPage handleGameComplete actually sends API request but we might want to show animation here.
    // For now, assume parent handles UI or we show a localized result before exiting.
    // Since JobPage structure is simple, let's keep it simple.

    return (
        <div style={{ textAlign: 'center' }}>
            <h3>投稿完了！</h3>
            <p>結果を集計中...</p>
            <Button onClick={() => setStep(0)}>次の動画を作る</Button>
            <Button variant="secondary" onClick={onExit}>終わる</Button>
        </div>
    );
};
