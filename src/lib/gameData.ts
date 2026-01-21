import { Recipe, Ingredient, CollectionItem, FurnitureItem, Pet, Vehicle, Occupation, PartTimeJob } from '@/types';

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

// ======================
// VEHICLES (Phase 2)
// ======================
export const VEHICLE_CATALOG: Vehicle[] = [
    // Bicycles
    {
        id: 'bicycle_city',
        type: 'bicycle',
        name: 'ママチャリ',
        price: 15000,
        speed: 10,
        reliability: 95,
        maintenanceCost: 0,
        description: '買い物に便利な普通の自転車。パンクに注意。',
        image: '🚲'
    },
    {
        id: 'bicycle_road',
        type: 'bicycle',
        name: 'ロードバイク',
        price: 150000,
        speed: 25,
        reliability: 90,
        maintenanceCost: 2000,
        description: '風のように走れる高級自転車。速いが維持費がかかる。',
        image: '🚴'
    },
    // Cars
    {
        id: 'car_kei',
        type: 'car',
        name: '軽自動車',
        price: 1500000,
        speed: 40,
        fuelConsumption: 5,
        reliability: 98,
        maintenanceCost: 10000,
        description: '小回りが利く経済的な車。燃費が良い。',
        image: '🚙'
    },
    {
        id: 'car_sedan',
        type: 'car',
        name: 'セダン',
        price: 3000000,
        speed: 50,
        fuelConsumption: 10,
        reliability: 99,
        maintenanceCost: 20000,
        description: '快適な乗り心地の乗用車。安定感がある。',
        image: '🚗'
    },
    {
        id: 'car_sports',
        type: 'car',
        name: 'スポーツカー',
        price: 8000000,
        speed: 80,
        fuelConsumption: 20,
        reliability: 90,
        maintenanceCost: 50000,
        description: '圧倒的なスピードを誇る。維持費も圧倒的。',
        image: '🏎️',
        prestige: 10
    },
    {
        id: 'car_luxury',
        type: 'car',
        name: '高級リムジン',
        price: 20000000,
        speed: 45,
        fuelConsumption: 15,
        reliability: 100,
        maintenanceCost: 100000,
        description: '成功者の証。乗っているだけで評価が上がる。',
        image: '🚘',
        prestige: 20
    },
];

// Commute Events
export type CommuteEventType = 'delay' | 'accident' | 'breakdown' | 'harassment' | 'smooth';

export interface CommuteEventDefinition {
    id: string;
    type: CommuteEventType;
    description: string;
    probability: number; // 0-100 base probability
    methods: ('walk' | 'bicycle' | 'train' | 'bus' | 'taxi' | 'car')[];
    effects: {
        stress?: number;
        late?: boolean;
        cost?: number; // extra cost (repair etc)
        health?: number;
    };
}

export const COMMUTE_EVENTS: CommuteEventDefinition[] = [
    {
        id: 'evt_puncture',
        type: 'breakdown',
        description: '自転車がパンクした！修理に時間がかかりそうだ...',
        probability: 5,
        methods: ['bicycle'],
        effects: { cost: 2000, late: true, stress: 10 }
    },
    {
        id: 'evt_train_delay',
        type: 'delay',
        description: '人身事故で電車が遅延している。満員電車で押しつぶされそうだ...',
        probability: 3,
        methods: ['train'],
        effects: { late: true, stress: 20 }
    },
    {
        id: 'evt_harassment',
        type: 'harassment',
        description: '痴漢冤罪に巻き込まれた！潔白を証明するために時間を取られた...',
        probability: 1, // Low but high impact
        methods: ['train'],
        effects: { late: true, stress: 80, health: -10 }
    },
    {
        id: 'evt_bus_traffic',
        type: 'delay',
        description: '事故渋滞に巻き込まれた。バスが全く動かない...',
        probability: 10,
        methods: ['bus'],
        effects: { late: true, stress: 10 }
    },
    {
        id: 'evt_car_accident',
        type: 'accident',
        description: '不注意で接触事故を起こしてしまった！警察を呼んでいる...',
        probability: 1,
        methods: ['car'],
        effects: { cost: 50000, late: true, stress: 50, health: -20 }
    },
    {
        id: 'evt_car_traffic',
        type: 'delay',
        description: '酷い渋滞だ。ガソリンが無駄に減っていく...',
        probability: 15, // 車は渋滞しやすい
        methods: ['car'],
        effects: { late: true, stress: 15 }
    },
    {
        id: 'evt_taxi_smooth',
        type: 'smooth',
        description: 'ベテランドライバーの裏道走行で、予定より早く到着した！快適だ。',
        probability: 20,
        methods: ['taxi'],
        effects: { stress: -10 }
    }
];

// ======================
// QUALIFICATIONS (Phase 3)
// ======================
import { Qualification } from '@/types';

export const QUALIFICATIONS: Qualification[] = [
    // Driving
    {
        id: 'q_driver_license',
        name: '普通自動車免許',
        category: 'driving',
        difficulty: 3,
        examFee: 300000,
        description: '一般的な自動車を運転するための免許。身分証としても有効。',
        effects: { jobUnlock: ['job_taxi', 'job_driver'] },
        minigameType: 'driving'
    },
    // Business
    {
        id: 'q_bookkeeping_3',
        name: '日商簿記3級',
        category: 'business',
        difficulty: 2,
        examFee: 5000,
        description: 'ビジネスの基本となる経理知識。企業の経理担当や店長に必須。',
        effects: { jobUnlock: ['job_clerk'], salaryBonus: 5 },
        minigameType: 'quiz'
    },
    {
        id: 'q_it_passport',
        name: 'ITパスポート',
        category: 'business',
        difficulty: 2,
        examFee: 7500,
        description: 'ITに関する基礎知識を証明する国家試験。',
        effects: { jobUnlock: ['job_programmer_trainee'], intelligence: 5 } as any,
        minigameType: 'quiz'
    },
    // Language
    {
        id: 'q_english_2',
        name: '実用英語技能検定2級',
        category: 'language',
        difficulty: 3,
        examFee: 6500,
        description: '高校卒業程度の英語力。履歴書に書けるレベル。',
        effects: { salaryBonus: 3 },
        minigameType: 'quiz'
    },
    // Food
    {
        id: 'q_food_hygiene',
        name: '食品衛生責任者',
        category: 'food',
        difficulty: 1,
        examFee: 10000,
        description: '飲食店を開業するために必要な資格。講習を受ければ取れる。',
        effects: { jobUnlock: ['job_chef', 'job_cafe_owner'] },
        minigameType: 'quiz'
    },
    // Medical
    {

        id: 'q_medical_license',
        name: '医師免許',
        category: 'medical',
        difficulty: 5,
        examFee: 500000,
        description: '医療行為を行うための国家資格。最難関。',
        effects: { jobUnlock: ['job_doctor'], salaryBonus: 50, statBonus: { intelligence: 20 } },
        minigameType: 'quiz'
    },
    {
        id: 'q_nursing_license',
        name: '看護師免許',
        category: 'medical',
        difficulty: 4,
        examFee: 100000,
        description: '傷病者の世話や診療補助を行うための資格。',
        effects: { jobUnlock: ['job_nurse'], salaryBonus: 20 },
        minigameType: 'quiz'
    },
    // Creative
    {
        id: 'q_web_design_2',
        name: 'ウェブデザイン技能検定2級',
        category: 'creative',
        difficulty: 3,
        examFee: 20000,
        description: 'Webサイト制作の実務能力を証明する資格。',
        effects: { jobUnlock: ['job_web_designer'], salaryBonus: 10 },
        minigameType: 'typing'
    }
];

// ======================
// JOBS (Phase 5)
// ======================
export const JOBS: Occupation[] = [
    // Special
    {
        id: 'job_debugger',
        name: 'デバッガー',
        type: 'technical',
        rank: 0,
        salary: 0,
        requirements: {},
        effects: { stress: 0, health: 0, prestige: 0 },
        workTime: { start: 0, end: 24 },
        description: 'システムの不具合を調査する仕事。報酬は発生しない（要承認）。'
    },
    // Public / Transport
    {
        id: 'job_train_conductor',
        name: '車掌',
        type: 'public',
        rank: 3,
        salary: 300000,
        requirements: { qualifications: ['q_train_license'] }, // Mock license
        effects: { stress: 15, health: 0, prestige: 5 },
        workTime: { start: 8, end: 17 },
        description: '電車の運行と乗客の安全を守る仕事。'
    },
    {
        id: 'job_taxi_driver',
        name: 'タクシー運転手',
        type: 'service',
        rank: 2,
        salary: 250000,
        requirements: { qualifications: ['q_driver_license_2'] }, // 2種免許
        effects: { stress: 20, health: -5, prestige: 2 },
        workTime: { start: 10, end: 20 },
        description: '街の人々を目的地まで送り届ける仕事。'
    },
    {
        id: 'job_pilot',
        name: 'パイロット',
        type: 'technical',
        rank: 8,
        salary: 1000000,
        requirements: { qualifications: ['q_pilot_license'], experience: 1000 },
        effects: { stress: 40, health: -5, prestige: 10 },
        workTime: { start: 9, end: 18 },
        description: '空の安全を守る花形職業。'
    },
    // Medical
    {
        id: 'job_doctor',
        name: '医師',
        type: 'medical',
        rank: 9,
        salary: 1200000,
        requirements: { qualifications: ['q_medical_license'] },
        effects: { stress: 50, health: -10, prestige: 10 },
        workTime: { start: 9, end: 20 },
        description: '人々の命を救う尊い仕事。激務。'
    },
    {
        id: 'job_nurse',
        name: '看護師',
        type: 'medical',
        rank: 5,
        salary: 400000,
        requirements: { qualifications: ['q_nursing_license'] },
        effects: { stress: 35, health: -15, prestige: 6 },
        workTime: { start: 8, end: 18 },
        description: '患者のケアを行う仕事。夜勤もある。'
    },
    // Creative
    {
        id: 'job_youtube',
        name: 'YouTuber',
        type: 'creative',
        rank: 1, // スター性依存
        salary: 100000, // 不安定
        requirements: { stats: { charisma: 50 } },
        effects: { stress: 10, health: -5, prestige: 3 },
        workTime: { start: 10, end: 22 },
        description: '動画配信で人気を得るクリエイター。'
    },
    {
        id: 'job_web_designer',
        name: 'Webデザイナー',
        type: 'creative',
        rank: 4,
        salary: 350000,
        requirements: { qualifications: ['q_web_design_2'] },
        effects: { stress: 15, health: -5, prestige: 4 },
        workTime: { start: 10, end: 19 },
        description: 'Webサイトのデザインを行う仕事。'
    },
    // Business
    {
        id: 'job_programmer',
        name: 'プログラマー',
        type: 'technical',
        rank: 5,
        salary: 450000,
        requirements: { qualifications: ['q_it_passport'] },
        effects: { stress: 25, health: -10, prestige: 5 },
        workTime: { start: 10, end: 19 },
        description: 'システム開発を行うエンジニア。'
    },
    {
        id: 'job_ceo',
        name: 'IT社長',
        type: 'business',
        rank: 10,
        salary: 2000000,
        requirements: { prevJobId: 'job_programmer', experience: 500, stats: { charisma: 100 } },
        effects: { stress: 60, health: -20, prestige: 10 },
        workTime: { start: 9, end: 23 },
        description: 'IT企業を経営するリーダー。'
    },
    // Service
    {
        id: 'job_chef',
        name: 'シェフ',
        type: 'service',
        rank: 6,
        salary: 500000,
        requirements: { qualifications: ['q_food_hygiene', 'q_cooking_license'] },
        effects: { stress: 30, health: -10, prestige: 6 },
        workTime: { start: 11, end: 23 },
        description: 'レストランで料理を振る舞う料理長。'
    },
    {
        id: 'job_cafe_owner',
        name: 'カフェオーナー',
        type: 'business',
        rank: 5,
        salary: 400000,
        requirements: { qualifications: ['q_food_hygiene', 'q_coffee_sommelier'] },
        effects: { stress: 20, health: -5, prestige: 5 },
        workTime: { start: 7, end: 19 },
        description: 'こだわりのカフェを経営する。'
    }
];

// ======================
// PART TIME JOBS (Phase 5)
// ======================
export const PART_TIME_JOBS: PartTimeJob[] = [
    {
        id: 'part_conbini',
        name: 'コンビニ店員',
        type: 'service',
        hourlyWage: 1200,
        requirements: {},
        effects: { stress: 5, fatigue: 10 },
        experienceOverride: 100,
        promotionTargetId: 'job_store_manager', // Mock
        description: 'レジ打ちや品出しを行う定番バイト。'
    },
    {
        id: 'part_coffee',
        name: 'カフェ店員',
        type: 'service',
        hourlyWage: 1100,
        requirements: {},
        effects: { stress: 4, fatigue: 8 },
        promotionTargetId: 'job_barista', // Mock
        experienceOverride: 150,
        description: 'コーヒーの香りに包まれて働く。'
    },
    {
        id: 'part_construction',
        name: '工事現場作業員',
        type: 'technical',
        hourlyWage: 1800,
        requirements: {},
        effects: { stress: 10, fatigue: 25 },
        experienceOverride: 200,
        promotionTargetId: 'job_foreman', // Mock
        description: '体力勝負の現場仕事。給料は良い。'
    },
    {
        id: 'part_tutor',
        name: '家庭教師',
        type: 'educational',
        hourlyWage: 2500,
        requirements: { qualifications: [], stats: { intelligence: 60 } },
        effects: { stress: 8, fatigue: 5 },
        experienceOverride: 100,
        description: '学生に勉強を教える仕事。頭脳労働。'
    },
    {
        id: 'part_delivery',
        name: 'フードデリバリー',
        type: 'service',
        hourlyWage: 1500, // 歩合制だが簡易化
        requirements: {}, // 自転車など
        effects: { stress: 5, fatigue: 15 },
        experienceOverride: 100,
        description: '自転車で料理を届ける仕事。体力が必要。'
    }
];

// ======================
// MINI-GAME DATA
// ======================
// ... (existing mini-game data kept or moved)
export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    category: string;
}

export const QUIZ_DATABASE: QuizQuestion[] = [
    // ... existing ...
    // Medical
    { id: 'q_med_1', text: '成人の正常な脈拍数は？', options: ['30-40', '60-100', '120-140', '200以上'], correctIndex: 1, category: 'medical' },
    { id: 'q_med_2', text: 'AEDの使用目的は？', options: ['人工呼吸', '心臓への電気ショック', '止血', '骨折固定'], correctIndex: 1, category: 'medical' },
    // Creative
    { id: 'q_web_1', text: 'HTMLの正しい意味は？', options: ['Hyper Text Markup Language', 'High Tech Making Language', 'Home Tool Make Link', 'Hyper Tool Mark Line'], correctIndex: 0, category: 'creative' },
    // ... existing bookkeeping/english/it etc ...
    // Bookkeeping
    { id: 'q_bk_1', text: '貸借対照表の左側に記載されるのは？', options: ['資産', '負債', '純資産', '収益'], correctIndex: 0, category: 'business' },
    { id: 'q_bk_2', text: '「借方」はどっち？', options: ['右', '左', '上', '下'], correctIndex: 1, category: 'business' },
    { id: 'q_bk_3', text: '商品を仕入れた時の勘定科目は？', options: ['売上', '仕入', '現金', '買掛金'], correctIndex: 1, category: 'business' },
    // IT Passport
    { id: 'q_it_1', text: 'PDCAサイクルの「C」は？', options: ['Check', 'Change', 'Control', 'Call'], correctIndex: 0, category: 'business' },
    { id: 'q_it_2', text: 'フィッシング詐欺の対策として適切なのは？', options: ['リンクをすぐクリック', '不審なメールは無視', 'パスワードを教える', 'PCを再起動'], correctIndex: 1, category: 'business' },
    // English
    { id: 'q_en_1', text: '"Apple" の意味は？', options: ['バナナ', 'オレンジ', 'リンゴ', 'ブドウ'], correctIndex: 2, category: 'language' },
    { id: 'q_en_2', text: '"Thank you" に対する返等は？', options: ["You're welcome", "I'm sorry", "Goodbye", "Hello"], correctIndex: 0, category: 'language' },
    { id: 'q_en_3', text: '過去形を選べ: Go', options: ['Goed', 'Went', 'Gone', 'Going'], correctIndex: 1, category: 'language' },
    // Food Hygiene
    { id: 'q_fd_1', text: '手洗いで最も重要なタイミングは？', options: ['トイレの後', '休憩中', '帰宅後', '寝る前'], correctIndex: 0, category: 'food' },
    { id: 'q_fd_2', text: '食中毒予防の三原則に含まれないのは？', options: ['つけない', '増やさない', 'やっつける', '味わう'], correctIndex: 3, category: 'food' },
];

