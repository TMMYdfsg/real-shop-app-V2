'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { INGREDIENTS, RECIPES } from '@/lib/gameData';
import { Recipe } from '@/types';

export default function KitchenPage() {
    const { currentUser } = useGame();
    const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

    if (!currentUser) return <div>Loading...</div>;

    const userIngredients = currentUser.ingredients || {};

    const handleBuyIngredient = async (ingredientId: string) => {
        const ingredient = INGREDIENTS.find(i => i.id === ingredientId);
        if (!ingredient) return;

        if (!confirm(`${ingredient.name}を${ingredient.price}枚で購入しますか？`)) return;

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'buy_ingredient',
                requesterId: currentUser.id,
                details: ingredientId
            })
        });
    };

    const handleCook = async (recipe: Recipe) => {
        if (!currentUser) return;

        // オブジェクト形式のingredientsに対応
        const canCook = Object.entries(recipe.ingredients).every(([ingId, requiredQty]) =>
            (userIngredients[ingId] || 0) >= requiredQty
        );

        if (!canCook) {
            alert('材料が足りません');
            return;
        }

        if (!confirm(`${recipe.name}を作りますか？`)) return;

        setSelectedRecipe(null);
        alert(`${recipe.name}を作りました！`);
    };

    return (
        <div className="pb-20">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mb-4"
            >
                🍳 キッチン
            </motion.h2>

            {/* Ingredients Inventory */}
            <Card padding="md" className="mb-6">
                <h3 className="font-bold mb-3">🥬 所持食材</h3>
                {Object.keys(userIngredients).length === 0 ? (
                    <div className="text-gray-500 text-sm">食材がありません</div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(userIngredients).map(([id, qty]) => {
                            const ing = INGREDIENTS.find(i => i.id === id);
                            if (!ing) return null;
                            return (
                                <div key={id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                    <span className="text-2xl">{ing.emoji}</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold">{ing.name}</div>
                                        <div className="text-xs text-gray-500">×{qty}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Buy Ingredients */}
            <Card padding="md" className="mb-6">
                <h3 className="font-bold mb-3">🛒 食材を買う</h3>
                <div className="grid grid-cols-2 gap-2">
                    {INGREDIENTS.map(ing => (
                        <motion.div
                            key={ing.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBuyIngredient(ing.id)}
                            className="cursor-pointer"
                        >
                            <Card padding="sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl">{ing.emoji}</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold">{ing.name}</div>
                                        <div className="text-xs text-blue-600">{ing.price}枚</div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* Recipes */}
            <Card padding="md">
                <h3 className="font-bold mb-3">📖 レシピ</h3>
                <div className="space-y-3">
                    {RECIPES.map(recipe => {
                        // オブジェクト形式のingredientsに対応
                        const canCook = Object.entries(recipe.ingredients).every(([ingId, requiredQty]) =>
                            (userIngredients[ingId] || 0) >= requiredQty
                        );
                        return (
                            <Card key={recipe.id} padding="sm" className={!canCook ? 'opacity-50' : ''}>
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl">{recipe.emoji}</div>
                                    <div className="flex-1">
                                        <div className="font-bold">{recipe.name}</div>
                                        <div className="text-xs text-gray-500">{recipe.description}</div>
                                        <div className="text-xs text-gray-600">
                                            {Object.entries(recipe.ingredients).map(([ingId, qty]) => {
                                                const ing = INGREDIENTS.find(i => i.id === ingId);
                                                return `${ing?.emoji}×${qty} `;
                                            })}
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                            {recipe.effects?.healthBonus && `❤️+${recipe.effects.healthBonus} `}
                                            {recipe.effects?.happinessBonus && `😊+${recipe.effects.happinessBonus} `}
                                            {recipe.effects?.balanceBonus && `💰+${recipe.effects.balanceBonus}`}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        disabled={!canCook}
                                        onClick={() => handleCook(recipe)}
                                    >
                                        調理
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
