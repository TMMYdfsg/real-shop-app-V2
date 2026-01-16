import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface MiniGameProps {
    onComplete: (score: number, reward: number) => void;
    onExit: () => void;
}

export const BakerGame: React.FC<MiniGameProps> = ({ onComplete, onExit }) => {
    const [step, setStep] = useState(0); // 0: Start, 1: Playing, 2: Result
    const [recipe, setRecipe] = useState<string[]>([]);
    const [input, setInput] = useState<string[]>([]);
    const [message, setMessage] = useState('');

    const ingredients = ['小麦粉', '水', 'イースト', '砂糖', '塩', 'バター'];

    const startGame = () => {
        // Generate random recipe of 3-5 items
        const len = 3 + Math.floor(Math.random() * 3);
        const newRecipe = [];
        for (let i = 0; i < len; i++) {
            newRecipe.push(ingredients[Math.floor(Math.random() * ingredients.length)]);
        }
        setRecipe(newRecipe);
        setInput([]);
        setStep(1);
        setMessage('レシピ通りに材料を入れてね！');
    };

    const handleIngredient = (ing: string) => {
        if (input.length < recipe.length) {
            const newInput = [...input, ing];
            setInput(newInput);

            // Check full input
            if (newInput.length === recipe.length) {
                // Validation
                const isCorrect = newInput.every((val, idx) => val === recipe[idx]);
                if (isCorrect) {
                    onComplete(100, 50); // Score, Reward
                    setMessage('大成功！おいしいパンが焼けたよ！ (+50枚)');
                } else {
                    onComplete(50, 10);
                    setMessage('ちょっと焦げちゃった... (+10枚)');
                }
                setStep(2);
            }
        }
    };

    if (step === 0) {
        return (
            <div style={{ textAlign: 'center' }}>
                <h3>パン屋さんのお仕事</h3>
                <p>注文通りのパンを焼こう！</p>
                <Button onClick={startGame} style={{ marginTop: '1rem' }}>仕事開始</Button>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div style={{ textAlign: 'center' }}>
                <h3>{message}</h3>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <Button onClick={startGame}>もう一度焼く</Button>
                    <Button variant="secondary" onClick={onExit}>仕事を終える</Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px' }}>
                <strong>レシピ: </strong>
                {recipe.join(' → ')}
            </div>

            <div style={{ marginBottom: '1rem', minHeight: '2rem' }}>
                <strong>投入: </strong>
                {input.join(' → ')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {ingredients.map(ing => (
                    <Button key={ing} variant="secondary" onClick={() => handleIngredient(ing)}>
                        {ing}
                    </Button>
                ))}
            </div>
        </div>
    );
};
