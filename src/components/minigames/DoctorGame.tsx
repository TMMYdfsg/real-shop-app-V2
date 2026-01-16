import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface MiniGameProps {
    onComplete: (score: number, reward: number) => void;
    onExit: () => void;
}

const SYMPTOMS = [
    { id: 'fever', icon: '🥵', name: '熱がある', treatment: 'medicine' },
    { id: 'injury', icon: '🤕', name: '怪我した', treatment: 'bandage' },
    { id: 'cough', icon: '😷', name: '咳が出る', treatment: 'mask' },
];

const TREATMENTS = [
    { id: 'medicine', icon: '💊', name: 'お薬' },
    { id: 'bandage', icon: '🩹', name: '包帯' },
    { id: 'mask', icon: '😷', name: 'マスク' },
    { id: 'injection', icon: '💉', name: '注射' },
];

export const DoctorGame: React.FC<MiniGameProps> = ({ onComplete, onExit }) => {
    const [currentSymptom, setCurrentSymptom] = useState<typeof SYMPTOMS[0] | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [isPlaying, setIsPlaying] = useState(false);
    const [resultMessage, setResultMessage] = useState('');

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (isPlaying && timeLeft === 0) {
            finishGame();
        }
        return () => clearInterval(timer);
    }, [isPlaying, timeLeft]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(20);
        setIsPlaying(true);
        setResultMessage('');
        nextPatient();
    };

    const nextPatient = () => {
        const random = SYMPTOMS[Math.floor(Math.random() * SYMPTOMS.length)];
        setCurrentSymptom(random);
    };

    const handleTreatment = (treatmentId: string) => {
        if (!currentSymptom) return;

        if (currentSymptom.treatment === treatmentId) {
            setScore((prev) => prev + 1);
            nextPatient(); // 正解なら次へ
        } else {
            // 不正解ペナルティ（時間を減らすなど）
            // 今回は単に次へ行かないだけ、あるいはエフェクト出すなど
            // シンプルに次へ
            nextPatient();
        }
    };

    const finishGame = () => {
        setIsPlaying(false);
        const reward = score * 20; // 1人治すと20枚
        setResultMessage(`診察終了！ ${score}人を治しました。\n報酬: ${reward}枚`);
        onComplete(score, reward);
    };

    if (!isPlaying && !resultMessage) {
        return (
            <div style={{ textAlign: 'center' }}>
                <h3>お医者さんのお仕事</h3>
                <p>症状に合った治療を選んでね！(制限時間20秒)</p>
                <Button onClick={startGame} style={{ marginTop: '1rem' }}>診察開始</Button>
            </div>
        );
    }

    if (resultMessage) {
        return (
            <div style={{ textAlign: 'center' }}>
                <h3>結果発表</h3>
                <p style={{ whiteSpace: 'pre-wrap', margin: '1rem 0' }}>{resultMessage}</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Button onClick={startGame}>もう一度やる</Button>
                    <Button variant="secondary" onClick={onExit}>戻る</Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>残り時間: {timeLeft}秒</span>
                <span>治療人数: {score}人</span>
            </div>

            <div style={{ padding: '2rem', background: 'var(--glass-bg)', borderRadius: '12px', marginBottom: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{currentSymptom?.icon}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentSymptom?.name}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {TREATMENTS.map((t) => (
                    <Button
                        key={t.id}
                        variant="secondary"
                        style={{ flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}
                        onClick={() => handleTreatment(t.id)}
                    >
                        <span style={{ fontSize: '2rem' }}>{t.icon}</span>
                        <span>{t.name}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
};
