'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobType } from '@/lib/jobData';

interface ChoiceGameProps {
    jobId: JobType;
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

// Simplified questions for demo. Real app should have more.
const QUESTIONS: Record<string, { q: string, options: string[], ans: number }[]> = {
    normal: [
        { q: "どちらが得？", options: ["100円もらう", "50%で200円"], ans: 0 },
        { q: "正しいのは？", options: ["早寝早起き", "徹夜ゲーム"], ans: 0 },
        { q: "あいさつは？", options: ["無視する", "元気よく"], ans: 1 },
    ],
    doctor: [
        { q: "風邪の処置は？", options: ["暖かくして寝る", "冷水を浴びる", "マラソンする"], ans: 0 },
        { q: "骨折したら？", options: ["湿布を貼る", "ギプス固定", "気合で治す"], ans: 1 },
        { q: "薬の飲み方は？", options: ["水で飲む", "ジュースで飲む", "噛み砕く"], ans: 0 },
        { q: "熱中症の対処は？", options: ["冷たい場所で休む", "激しく運動", "熱い飲み物"], ans: 0 },
        { q: "打撲の応急処置は？", options: ["冷やす", "温める", "強く揉む"], ans: 0 },
        { q: "食中毒の症状は？", options: ["腹痛と嘔吐", "骨が痛い", "視力低下"], ans: 0 },
        { q: "予防接種の目的は？", options: ["病気を予防", "病気を治療", "お金稼ぎ"], ans: 0 },
        { q: "健康診断は？", options: ["定期的に受ける", "具合悪い時だけ", "不要"], ans: 0 },
    ],
    novelist: [
        { q: "物語の始まり方は？", options: ["魅力的な冒頭", "結末から", "とりあえず"], ans: 0 },
        { q: "登場人物の魅力は？", options: ["個性的で共感できる", "みんな同じ", "無個性"], ans: 0 },
        { q: "プロットとは？", options: ["物語の筋書き", "キャラの顔", "本の装丁"], ans: 0 },
        { q: "推敲の意味は？", options: ["文章を書き直す", "ストーリー考える", "出版する"], ans: 0 },
        { q: "良い描写とは？", options: ["情景が浮かぶ", "長ければいい", "専門用語満載"], ans: 0 },
        { q: "クライマックスは？", options: ["物語の盛り上がり", "書き始め", "中盤"], ans: 0 },
    ],
    driver: [
        { q: "渋滞時のルートは？", options: ["抜け道を使う", "そのまま待つ", "逆走する"], ans: 0 },
        { q: "お客様への対応は？", options: ["丁寧に接する", "無言で運転", "急かす"], ans: 0 },
        { q: "安全運転のコツは？", options: ["車間距離を保つ", "スピード出す", "信号無視"], ans: 0 },
        { q: "雨天時の運転は？", options: ["速度を落とす", "いつも通り", "スピードアップ"], ans: 0 },
        { q: "遠距離の場合は？", options: ["高速道路使う", "下道のみ", "最短距離"], ans: 0 },
        { q: "燃費を良くするには？", options: ["急発進を避ける", "常にアクセル全開", "エンジン回しっぱなし"], ans: 0 },
    ],
    scientist: [
        { q: "実験で大切なのは？", options: ["正確な記録", "感覚だけ", "適当にやる"], ans: 0 },
        { q: "仮説とは？", options: ["検証前の予想", "確定事実", "実験結果"], ans: 0 },
        { q: "安全な実験手順は？", options: ["マニュアル通り", "自己流", "時短重視"], ans: 0 },
        { q: "データ分析では？", options: ["客観的に評価", "都合よく解釈", "無視する"], ans: 0 },
        { q: "失敗した時は？", options: ["原因を分析", "諦める", "隠蔽する"], ans: 0 },
        { q: "研究倫理として？", options: ["誠実に行う", "捏造する", "盗用OK"], ans: 0 },
        { q: "新発見をしたら？", options: ["論文発表", "秘密にする", "売り込む"], ans: 0 },
    ],
    investigator: [
        { q: "株価が上がる材料は？", options: ["好決算発表", "赤字拡大", "不祥事"], ans: 0 },
        { q: "分散投資の意味は？", options: ["リスクを減らす", "リスクを増やす", "関係ない"], ans: 0 },
        { q: "暴落時の対応は？", options: ["冷静に分析", "パニック売り", "追加買い"], ans: 0 },
        { q: "良い投資先は？", options: ["成長性がある", "倒産寸前", "何でもいい"], ans: 0 },
        { q: "チャート分析は？", options: ["傾向を読む", "無意味", "占いと同じ"], ans: 0 },
        { q: "損切りのタイミング？", options: ["損失が拡大前", "絶対しない", "倍になったら"], ans: 0 },
    ],
    garbage_collector: [
        { q: "ペットボトルは？", options: ["プラスチック", "燃えるゴミ", "不燃ゴミ"], ans: 0 },
        { q: "生ゴミは？", options: ["燃えるゴミ", "資源ゴミ", "埋める"], ans: 0 },
        { q: "缶・瓶は？", options: ["資源ゴミ", "燃えるゴミ", "川に捨てる"], ans: 0 },
        { q: "古紙は？", options: ["資源ゴミ", "燃やす", "埋める"], ans: 0 },
        { q: "粗大ゴミは？", options: ["特別回収", "普通ゴミ", "道端に置く"], ans: 0 },
        { q: "危険物は？", options: ["専用処理", "燃えるゴミ", "そのまま捨てる"], ans: 0 },
    ],
    bookstore: [
        { q: "本の並べ方は？", options: ["ジャンル別", "ランダム", "色別"], ans: 0 },
        { q: "新刊の配置は？", options: ["目立つ位置", "倉庫", "床に積む"], ans: 0 },
        { q: "お客様への対応は？", options: ["探している本を案内", "無視", "追い払う"], ans: 0 },
        { q: "在庫管理は？", options: ["定期的に確認", "適当", "放置"], ans: 0 },
        { q: "おすすめ本は？", options: ["話題作や良書", "売れ残り", "何でもいい"], ans: 0 },
    ],
    wagashi_shop: [
        { q: "あんこの甘さは？", options: ["上品な甘さ", "激甘", "無糖"], ans: 0 },
        { q: "もちの食感は？", options: ["柔らかく滑らか", "硬い", "ベタベタ"], ans: 0 },
        { q: "季節感は？", options: ["大切にする", "無視", "常に同じ"], ans: 0 },
        { q: "材料の品質は？", options: ["厳選する", "安ければOK", "何でもいい"], ans: 0 },
        { q: "見た目は？", options: ["美しく仕上げる", "適当", "崩れていてもOK"], ans: 0 },
    ],
    pastry_shop: [
        { q: "スポンジの焼き方は？", options: ["ふわふわに", "硬く", "焦がす"], ans: 0 },
        { q: "クリームの泡立ては？", options: ["しっかり泡立てる", "液体のまま", "固すぎる"], ans: 0 },
        { q: "デコレーションは？", options: ["美しく丁寧に", "適当に塗る", "何もしない"], ans: 0 },
        { q: "材料の保存は？", options: ["冷蔵庫で適切に", "常温放置", "冷凍庫に全部"], ans: 0 },
        { q: "衛生管理は？", options: ["清潔に保つ", "気にしない", "汚れてもOK"], ans: 0 },
    ],
    // ... add more or use generic fallback
};

export const ChoiceGame: React.FC<ChoiceGameProps> = ({ jobId, difficulty, onScoreUpdate }) => {
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // Get questions for job or fallback
    // @ts-ignore
    const questions = QUESTIONS[jobId] || QUESTIONS['normal'];
    const currentQ = questions[qIndex % questions.length]; // Cycle if run out

    // Total questions based on difficulty? Or just infinite until time up?
    // Let's say infinite until time up, score increases.
    // Frame handles time.

    const handleSelect = (index: number) => {
        if (selected !== null) return; // Prevent double click

        setSelected(index);
        const correct = index === currentQ.ans;
        setIsCorrect(correct);

        if (correct) {
            const newScore = score + (10 * difficulty);
            setScore(newScore);
            onScoreUpdate(newScore);
        }

        // Wait then next question
        setTimeout(() => {
            setSelected(null);
            setIsCorrect(null);
            setQIndex(prev => prev + 1);
        }, 1000);
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={qIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}
                >
                    <div style={{
                        background: '#f3f4f6', padding: '2rem', borderRadius: '16px', marginBottom: '2rem',
                        fontSize: '1.5rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        {currentQ.q}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {currentQ.options.map((opt, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.03, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect(idx)}
                                disabled={selected !== null}
                                style={{
                                    padding: '1.5rem',
                                    fontSize: '1.2rem',
                                    border: 'none',
                                    borderRadius: '12px',
                                    background: selected === idx
                                        ? (isCorrect ? '#4ade80' : '#ef4444')
                                        : 'white',
                                    color: selected === idx ? 'white' : '#333',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {opt}
                                {selected === idx && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            background: isCorrect ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '3rem'
                                        }}
                                    >
                                        {isCorrect ? '🙆‍♂️' : '🙅‍♂️'}
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
