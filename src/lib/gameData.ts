import { Recipe, Ingredient, CollectionItem, FurnitureItem, Pet } from '@/types';

export type { CollectionItem }; // Re-export for museum page

// ======================
// GACHA ITEMS (NEW)
// ======================
export interface GachaItem {
    id: string;
    name: string;
    emoji: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    type: 'insect' | 'fossil' | 'card' | 'toy' | 'treasure';
    description: string;
    dropRate: number;  // 出現率（%）
}

export const GACHA_ITEMS: GachaItem[] = [
    // Common (50%)
    { id: 'gacha_coin', name: 'コイン', emoji: '🪙', rarity: 'common', type: 'toy', dropRate: 15, description: '普通のコイン' },
    { id: 'gacha_marble', name: 'ビー玉', emoji: '🔮', rarity: 'common', type: 'toy', dropRate: 15, description: 'きれいなビー玉' },
    { id: 'gacha_sticker', name: 'ステッカー', emoji: '✨', rarity: 'common', type: 'toy', dropRate: 10, description: 'かわいいステッカー' },
    { id: 'gacha_key', name: '鍵', emoji: '🔑', rarity: 'common', type: 'toy', dropRate: 10, description: '何かの鍵？' },

    // Rare (30%)
    { id: 'gacha_beetle', name: 'カブトムシ', emoji: '🪲', rarity: 'rare', type: 'insect', dropRate: 10, description: 'かっこいいカブトムシ' },
    { id: 'gacha_shell', name: '貝殻', emoji: '🐚', rarity: 'rare', type: 'fossil', dropRate: 10, description: '古代の貝殻' },
    { id: 'gacha_card', name: 'レアカード', emoji: '🎴', rarity: 'rare', type: 'card', dropRate: 10, description: 'ちょっとレアなカード' },

    // Epic (15%)
    { id: 'gacha_dino', name: '恐竜の歯', emoji: '🦕', rarity: 'epic', type: 'fossil', dropRate: 7, description: '恐竜の歯の化石！' },
    { id: 'gacha_gold_beetle', name: '黄金カブト', emoji: '✨', rarity: 'epic', type: 'insect', dropRate: 5, description: '黄金に輝くカブトムシ' },
    { id: 'gacha_crystal', name: 'クリスタル', emoji: '💎', rarity: 'epic', type: 'treasure', dropRate: 3, description: '美しいクリスタル' },

    // Legendary (5%)
    { id: 'gacha_rainbow', name: '虹色のオーブ', emoji: '🌈', rarity: 'legendary', type: 'treasure', dropRate: 2, description: '伝説の虹色オーブ！' },
    { id: 'gacha_holo', name: 'ホログラムカード', emoji: '✨', rarity: 'legendary', type: 'card', dropRate: 2, description: '超激レアホロカード！' },
    { id: 'gacha_dragon', name: 'ドラゴンの卵', emoji: '🥚', rarity: 'legendary', type: 'treasure', dropRate: 1, description: 'ドラゴンの卵！？' },
];

// ======================
// INGREDIENTS
// ======================
export const INGREDIENTS: Ingredient[] = [
    { id: 'ing_rice', name: 'お米', emoji: '🍚', price: 50 },
    { id: 'ing_fish', name: '魚', emoji: '🐟', price: 100 },
    { id: 'ing_meat', name: '肉', emoji: '🥩', price: 150 },
    { id: 'ing_vegetable', name: '野菜', emoji: '🥬', price: 30 },
    { id: 'ing_egg', name: '卵', emoji: '🥚', price: 40 },
    { id: 'ing_flour', name: '小麦粉', emoji: '🌾', price: 60 },
    { id: 'ing_milk', name: '牛乳', emoji: '🥛', price: 80 },
    { id: 'ing_sugar', name: '砂糖', emoji: '🍬', price: 50 },
];

// ======================
// RECIPES
// ======================
export const RECIPES: Recipe[] = [
    {
        id: 'recipe_tamagokake',
        name: '卵かけご飯',
        emoji: '🍚',
        ingredients: { 'ing_rice': 1, 'ing_egg': 1 },
        sellPrice: 200,
        description: 'シンプルながら最高の味',
        effects: {
            healthBonus: 10,
            happinessBonus: 5
        }
    },
    {
        id: 'recipe_katsudon',
        name: 'カツ丼',
        emoji: '🍛',
        ingredients: { 'ing_rice': 1, 'ing_meat': 1, 'ing_egg': 1 },
        sellPrice: 500,
        description: 'ボリューム満点の一品',
        effects: {
            healthBonus: 20,
            happinessBonus: 10,
            balanceBonus: 100 // 元気が出て仕事が捗る的な
        }
    },
    {
        id: 'recipe_sushi',
        name: '寿司',
        emoji: '🍣',
        ingredients: { 'ing_rice': 2, 'ing_fish': 2 },
        sellPrice: 600,
        description: '新鮮なネタが自慢',
        effects: {
            healthBonus: 15,
            happinessBonus: 20
        }
    },
    {
        id: 'recipe_cake',
        name: 'ケーキ',
        emoji: '🍰',
        ingredients: { 'ing_flour': 1, 'ing_egg': 2, 'ing_milk': 1, 'ing_sugar': 1 },
        sellPrice: 700,
        description: 'ふわふわスポンジケーキ',
        effects: {
            healthBonus: 5,
            happinessBonus: 30
        }
    },
];

// ======================
// COLLECTION ITEMS
// ======================
export const COLLECTION_ITEMS: CollectionItem[] = [
    { id: 'col_beetle', name: 'カブトムシ', emoji: '🪲', type: 'insect', rarity: 'common', description: '普通のカブトムシ' },
    { id: 'col_butterfly', name: 'チョウチョ', emoji: '🦋', type: 'insect', rarity: 'common', description: 'きれいな蝶々' },
    { id: 'col_fish', name: 'メダカ', emoji: '🐟', type: 'fish', rarity: 'common', description: '元気に泳ぐメダカ' },
    { id: 'col_shell', name: '貝殻', emoji: '🐚', type: 'fossil', rarity: 'rare', description: '海辺で拾った貝殻' },
    { id: 'col_diamond', name: 'ダイヤモンド', emoji: '💎', type: 'fossil', rarity: 'legendary', description: '激レア！輝くダイヤモンド' },
];

// ======================
// FURNITURE
// ======================
export const FURNITURE_CATALOG: FurnitureItem[] = [
    { id: 'fur_bed', name: 'ベッド', emoji: '🛏️', price: 1000, description: '快適な睡眠を' },
    { id: 'fur_desk', name: 'デスク', emoji: '🪑', price: 500, description: '仕事や勉強に' },
    { id: 'fur_sofa', name: 'ソファ', emoji: '🛋️', price: 1500, description: 'くつろぎのひととき' },
    { id: 'fur_lamp', name: 'ランプ', emoji: '💡', price: 300, description: 'お部屋を明るく' },
    { id: 'fur_tv', name: 'テレビ', emoji: '📺', price: 2000, description: '映画やドラマを楽しもう' },
];

// ======================
// PETS
// ======================
export const PET_CATALOG: Pet[] = [
    { id: 'pet_cat', name: 'ネコ', emoji: '🐱', price: 2000, loyalty: 50, description: 'かわいいネコちゃん' },
    { id: 'pet_dog', name: 'イヌ', emoji: '🐶', price: 2500, loyalty: 60, description: '元気なワンちゃん' },
    { id: 'pet_bird', name: 'インコ', emoji: '🦜', price: 1000, loyalty: 30, description: 'おしゃべりインコ' },
    { id: 'pet_rabbit', name: 'ウサギ', emoji: '🐰', price: 1500, loyalty: 40, description: 'ふわふわウサギ' },
    { id: 'pet_hamster', name: 'ハムスター', emoji: '🐹', price: 800, loyalty: 25, description: 'ちっちゃなハムスター' },
];
