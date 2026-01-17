'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { JobType } from '@/lib/jobData';

interface ChoiceGameProps {
    jobId: JobType;
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

interface Question {
    q: string;
    options: string[];
    answer: number; // index
}

// Job-specific questions
const QUESTION_DB: Partial<Record<JobType, Question[]>> = {
    doctor: [
        { q: '熱がある患者。処方するのは？', options: ['解熱剤', '湿布', '胃腸薬'], answer: 0 },
        { q: '骨折の疑いがある。まずすることは？', options: ['マッサージ', 'レントゲン', '湿布'], answer: 1 },
        { q: '顔色が悪い。どうする？', options: ['水をかける', '安静にする', '走らせる'], answer: 1 },
    ],
    scientist: [
        { q: 'H2Oは何の化学式？', options: ['酸素', '水', '金'], answer: 1 },
        { q: '地球の周りを回っているのは？', options: ['太陽', '月', '火星'], answer: 1 },
        { q: '植物が光合成に必要なのは？', options: ['月光', '電波', '日光'], answer: 2 },
    ],
    investigator: [ // investor
        { q: '株価が暴落中。どうする？', options: ['全財産で買う', '様子を見る', 'パニックになる'], answer: 1 },
        { q: '新製品が大ヒット！株価は？', options: ['下がる', '変わらない', '上がる'], answer: 2 },
    ],
    novelist: [
        { q: '物語の始まりに適した言葉は？', options: ['昔々あるところに', 'そして誰もいなくなった', '終わり'], answer: 0 },
        { q: '主人公がピンチ！どうする？', options: ['諦める', '仲間が助けに来る', '寝る'], answer: 1 },
    ],
    driver: [
        { q: '赤信号。どうする？', options: ['進む', '止まる', '加速する'], answer: 1 },
        { q: '客が急いでいると言った。', options: ['安全運転で急ぐ', '信号無視する', '断る'], answer: 0 },
    ],
    unemployed: [
        { q: '道に100円落ちていた。', options: ['交番に届ける', 'もらう', '見なかったことにする'], answer: 0 },
        { q: '暇だ。何をする？', options: ['寝る', 'バイトを探す', '空を眺める'], answer: 1 },
    ]
};

// Fallback questions
const DEFAULT_QUESTIONS: Question[] = [
    { q: '1 + 1 は？', options: ['1', '2', '3'], answer: 1 },
    { q: '信号の「進め」は何色？', options: ['赤', '青', '黄'], answer: 1 },
    { q: '朝の挨拶は？', options: ['おはよう', 'こんにちは', 'こんばんは'], answer: 0 },
];

export const ChoiceGame: React.FC<ChoiceGameProps> = ({ jobId, difficulty, onScoreUpdate }) => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        // Load questions
        const jobQuestions = QUESTION_DB[jobId] || [];
        // Combine with defaults if not enough, or just repeat
        const pool = [...jobQuestions, ...DEFAULT_QUESTIONS];
        // Shuffle or pick based on difficulty (implementation simplified)
        setQuestions(pool.slice(0, 5)); // Take first 5 for now
    }, [jobId]);

    const handleAnswer = (optionIndex: number) => {
        if (finished) return;

        const currentQ = questions[currentQIndex];
        let newScore = score;

        if (optionIndex === currentQ.answer) {
            newScore += 20; // 5 questions * 20 = 100 max
        } else {
            // Wrong answer penalty?
        }
        setScore(newScore);

        if (currentQIndex + 1 >= questions.length) {
            setFinished(true);
            onScoreUpdate(newScore);
        } else {
            setCurrentQIndex(currentQIndex + 1);
            // Intermediate score update (optional, usually wait till end for "success" flag)
            // But container handles "timeLeft" finish vs manual finish. 
            // If we finish all Qs, we can wait or complete early.
            // Let's just update score. Container will see score at end.
            // Actually, if we finish early, we should signal completion?
            // Container doesn't have auto-complete callback from running game, only time limit.
            // We can just verify score at the end time. Or we could add "onFinish" to props?
            // For now, let's just wait for time or show "All Done".
        }
    };

    if (questions.length === 0) return <div>Loading...</div>;

    if (finished) {
        return (
            <div style={{ textAlign: 'center' }}>
                <h3>全問終了！</h3>
                <p>スコア: {score}</p>
                <div style={{ fontSize: '3rem' }}>🎉</div>
            </div>
        );
    }

    const q = questions[currentQIndex];

    return (
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Q{currentQIndex + 1}. {q.q}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt, idx) => (
                    <Button key={idx} variant="secondary" onClick={() => handleAnswer(idx)}>
                        {opt}
                    </Button>
                ))}
            </div>
        </div>
    );
};
