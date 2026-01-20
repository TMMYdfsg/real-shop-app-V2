import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface BakerGameProps {
    difficulty: number; // 1-5, though Baker is simple
    onScoreUpdate: (score: number) => void;
}

export const BakerGame: React.FC<BakerGameProps> = ({ difficulty, onScoreUpdate }) => {
    const [recipe, setRecipe] = useState<string[]>([]);
    const [input, setInput] = useState<string[]>([]);
    const [message, setMessage] = useState('レシピ通りに作ろう！');
    const [feedbackColor, setFeedbackColor] = useState('transparent');

    const ingredients = ['小麦粉', '水', 'イースト', '砂糖', '塩', 'バター', '卵', '牛乳'];
    // Difficulty adjusts ingredients pool? Or recipe length?
    // Let's use simple logic:
    const activeIngredients = ingredients.slice(0, 5 + Math.floor(difficulty / 2)); // 5 to 7 ingredients

    const generateRecipe = () => {
        const len = 3 + Math.floor(Math.random() * (difficulty > 3 ? 4 : 2)); // 3-4 or 3-6 items
        const newRecipe = [];
        for (let i = 0; i < len; i++) {
            newRecipe.push(activeIngredients[Math.floor(Math.random() * activeIngredients.length)]);
        }
        setRecipe(newRecipe);
        setInput([]);
        setFeedbackColor('transparent');
    };

    useEffect(() => {
        generateRecipe();
    }, []);

    const handleIngredient = (ing: string) => {
        if (input.length < recipe.length) {
            const newInput = [...input, ing];
            setInput(newInput);

            // Check correctness interactively if wrong immediately?
            // "Recipe memory" style? No, shown recipe.
            // Just check at end or strict check every step?
            // Simple check at end of length.
            if (newInput.length === recipe.length) {
                const isCorrect = newInput.every((val, idx) => val === recipe[idx]);
                if (isCorrect) {
                    onScoreUpdate(100 + (difficulty * 20)); // Score
                    setMessage('おいしいパンが焼けた！');
                    setFeedbackColor('#dcfce7'); // Success Green
                } else {
                    // onScoreUpdate(10); // Low score for fail? Or 0?
                    // Maybe negative or small positive for effort
                    onScoreUpdate(10);
                    setMessage('失敗しちゃった...');
                    setFeedbackColor('#fee2e2'); // Error Red
                }
                // Delay next recipe
                setTimeout(() => {
                    generateRecipe();
                    setMessage('次はこれを作ろう！');
                }, 800);
            }
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: feedbackColor, transition: 'background 0.3s' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#555' }}>{message}</h3>
                <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '2px solid #ddd', minWidth: '300px', fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                    {recipe.join(' + ')}
                </div>
            </div>

            <div style={{ marginBottom: '2rem', minHeight: '3rem', fontSize: '1.2rem', color: '#3b82f6' }}>
                {input.length > 0 ? input.join(' + ') : '(材料を選んでください)'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                {activeIngredients.map(ing => (
                    <Button key={ing} variant="secondary" onClick={() => handleIngredient(ing)} style={{ fontSize: '1rem', padding: '1rem' }}>
                        {ing}
                    </Button>
                ))}
            </div>
            <div style={{ marginTop: '1rem' }}>
                <Button variant="ghost" size="sm" onClick={() => { setInput([]); }}>リセット</Button>
            </div>
        </div>
    );
};

