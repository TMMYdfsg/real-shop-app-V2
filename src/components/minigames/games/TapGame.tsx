'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface TapGameProps {
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

export const TapGame: React.FC<TapGameProps> = ({ difficulty, onScoreUpdate }) => {
    const [count, setCount] = useState(0);
    const [code, setCode] = useState('');

    // Target taps based on difficulty (e.g. 30 taps in 10 secs for diff 2)
    const target = 20 * difficulty;

    const CODE_SNIPPETS = [
        'const a = 1;',
        'function test() {',
        '  return true;',
        '}',
        'if (x > y) {',
        '  console.log("Hello");',
        '}',
        'import React from "react";',
        'export default App;',
    ];

    const handleTap = () => {
        const newCount = count + 1;
        setCount(newCount);

        // Visual feedback
        if (newCount % 2 === 0) {
            setCode(prev => prev + '\n' + CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]);
        }

        if (newCount >= target) {
            onScoreUpdate(100 * difficulty + (newCount - target)); // Bonus for extra taps
        } else {
            onScoreUpdate(0); // Not finished yet
        }
    };

    const progress = Math.min((count / target) * 100, 100);

    return (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>進捗: {progress.toFixed(0)}%</div>
                <div style={{ height: '20px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: progress >= 100 ? 'green' : 'blue',
                        transition: 'width 0.1s'
                    }} />
                </div>
            </div>

            <div style={{ flex: 1, background: '#1e1e1e', color: '#0f0', padding: '1rem', fontFamily: 'monospace', textAlign: 'left', overflow: 'hidden', fontSize: '0.8rem', opacity: 0.8, borderRadius: '4px', marginBottom: '1rem' }}>
                {code}
            </div>

            <Button
                onClick={handleTap}
                style={{ height: '80px', fontSize: '1.5rem', fontWeight: 'bold' }}
                variant={progress >= 100 ? 'success' : 'primary'}
            >
                {progress >= 100 ? '完了！(さらに連打でボーナス)' : '連打せよ！！！'}
            </Button>
        </div>
    );
};
