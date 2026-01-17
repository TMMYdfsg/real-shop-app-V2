export type UserRole = 'banker' | 'player';
export type Role = UserRole;

export interface Stock {
    id: string;
    name: string;
    price: number;
    previousPrice: number;
    priceHistory?: number[]; // Last 20 price points for charts
    volatility: number; // 変動幅
    isForbidden: boolean;
}

export interface Product {
    id: string;
    sellerId: string;
    name: string;
    price: number;
    isSold: boolean;
    description?: string; // 商品説明
    condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor'; // 商品の状態
    comment?: string; // 出品者からの一言
    imageUrl?: string; // 商品画像URL
    createdAt?: number; // 出品日時
    soldAt?: number; // 販売日時
    buyerId?: string; // 購入者ID
}

export interface Request {
    id: string;
    type: 'loan' | 'repay' | 'income' | 'tax' | 'bill' | 'buy_stock' | 'sell_stock' | 'change_job' | 'unlock_forbidden' | 'transfer' | 'pay_tax';
    requesterId: string;
    amount: number;
    details?: string; // 株のIDや備考など
    status: 'pending' | 'approved' | 'rejected';
    timestamp: number;
}

export interface ShopItem {
    id: string;
    name: string;
    cost: number; // 仕入れ値
    price: number; // 売値
    stock: number;
    description?: string;
}

export interface Property {
    id: string;
    name: string;
    type: 'land' | 'apartment' | 'house' | 'shop' | 'mansion';
    price: number;
    income: number; // 毎ターンの収入（または維持費の場合はマイナス）
    ownerId?: string; // 所有者ID (nullなら銀行所有/売り出し中)
    description?: string;
}

export interface Transaction {
    id: string;
    type: 'payment' | 'transfer' | 'income' | 'tax' | 'deposit' | 'withdraw' | 'repay';
    amount: number;
    senderId?: string;
    receiverId?: string;
    description: string;
    timestamp: number;
}

export interface PointCard {
    shopOwnerId: string;
    points: number;
}

export interface User {
    id: string;
    name: string;
    role: 'banker' | 'player';
    balance: number;
    deposit: number; // 銀行預金
    debt: number; // 借金

    // Status
    popularity: number; // 人気度
    happiness: number; // 幸福度
    rating: number; // 評価 (Star 1-5)

    // Job
    job: string; // 職業名
    jobType?: 'normal' | 'police' | 'thief' | 'idol';
    lastJobChangeTurn?: number;

    // Stats
    unpaidTax?: number;
    catalogPoints?: number; // 仕入れなどで貯まるポイント
    arrestCount?: number;
    stolenAmount?: number;
    fanCount?: number;

    // Inventory
    items: string[]; // item IDs
    stocks: { [stockId: string]: number }; // stockId -> quantity
    forbiddenStocks?: { [stockId: string]: number };
    isForbiddenUnlocked?: boolean;

    // History
    transactions: Transaction[];

    // Points
    pointCards: PointCard[]; // お店ごとのポイント

    // Economy & Health (New)
    shopName?: string;
    cardType?: 'point' | 'stamp';
    isInsured?: boolean; // 保険加入有無
    propertyLevel?: 'none' | 'apartment' | 'house' | 'mansion'; // 賃貸契約
    health?: number; // 0-100
    shopMenu?: ShopItem[]; // 店舗メニュー
    landRank?: number; // 土地ランク

    // Cooking & Collection
    ingredients?: { [ingredientId: string]: number }; // { 'ing_rice': 5, ... }
    collection?: UserCollection;
    furniture?: string[]; // Array of furniture IDs
    pets?: string[]; // Array of pet IDs
    coupons?: Coupon[]; // 発行したクーポン NEW
    gachaCollection?: string[]; // 獲得したガチャアイテムID NEW
    playerIcon?: string; // プレイヤーアイコンファイル名（例: 'icon1.png'） NEW
    shopWebsite?: ShopWebsite; // マイショップホームページ NEW
    pointExchangeItems?: PointExchangeItem[]; // ポイント交換所アイテム NEW
}

// Coupon System NEW
export interface Coupon {
    id: string;
    shopOwnerId: string;     // クーポン発行者
    code: string;            // クーポンコード（例: "SALE20"）
    discountPercent: number; // 割引率（%）
    minPurchase?: number;    // 最低購入金額
    maxUses?: number;        // 最大使用回数
    usedCount: number;       // 使用済み回数
    expiresAt?: number;      // 有効期限（タイムスタンプ）
    createdAt: number;
    isActive: boolean;       // 有効/無効
}

export interface GameSettings {
    taxRate: number;
    insuranceRate: number;
    interestRate: number;
    salaryAutoSafeRate: number; // 稼ぎの何%を自動貯金するか (デフォルト50%)
    turnDuration: number; // 1ターンの時間(ミリ秒)
}

export interface GameState {
    users: User[];
    stocks: Stock[];
    requests: Request[];
    marketStatus: 'open' | 'closed'; // 昼夜連動など
    turn: number;
    isDay: boolean; // true=昼, false=夜
    isTimerRunning: boolean; // タイマー進行中かどうか
    lastTick: number; // 最後の時間更新
    timeRemaining: number; // 次のターンまでの残り時間(ms)
    settings: GameSettings;
    news: ({ id: string; message: string; timestamp: number } | string)[]; // ニュースログ (文字列またはオブジェクト)
    roulette: {
        items: { id: number; text: string; effect: string; weight?: number }[];
        currentResult: { text: string; timestamp: number; targetUserId?: string } | null;
    };
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    products: Product[];
    activeNPCs: NPC[];
    npcTemplates: NPCTemplate[];
    activeEvents: GameEvent[];
    properties: Property[];
    catalogInventory?: CatalogItem[]; // 仕入れ先カタログ（管理者が管理）
}

// CatalogItem - 仕入れ先カタログアイテム
export interface CatalogItem {
    id: string;
    name: string;
    category: 'furniture' | 'pet' | 'ingredient' | 'appliance' | 'other';
    emoji: string;
    wholesalePrice: number; // 卸値（プレイヤーが支払う金額）
    stock: number; // カタログ在庫
    description?: string;
}

// ShopWebsite - マイショップホームページ
export interface ShopWebsite {
    id: string;
    ownerId: string;
    templateId: 'simple' | 'modern' | 'colorful' | 'elegant';
    customization: {
        primaryColor: string;
        secondaryColor: string;
        shopDescription: string;
        welcomeMessage: string;
        showProducts: boolean;
        showCoupons: boolean;
        layout: 'single' | 'grid' | 'list';
    };
    isPublished: boolean;
    createdAt: number;
    updatedAt: number;
}

// PointExchangeItem - ポイント交換所アイテム
export interface PointExchangeItem {
    id: string;
    shopOwnerId: string;
    name: string;
    description: string;
    pointCost: number;
    rewardType: 'coupon' | 'discount' | 'item' | 'special';
    rewardValue: any; // クーポンコード、割引率、アイテムIDなど
    stock?: number;
    emoji?: string;
}

export interface GameEvent {
    id: string;
    name: string;
    description: string;
    type: 'boom' | 'recession' | 'grant' | 'tax_hike' | 'festival' | 'epidemic' | 'disaster' | 'heatwave' | 'coldwave' | 'viral' | 'scandal';
    startTime: number;
    duration: number; // ms
    effectValue: number; // multiplier or amount
    targetUserId?: string; // For user-specific events like viral/scandal
}

export type NPCType = 'guest' | 'thief' | 'scammer' | 'rich_guest'; // Keep for backward compatibility or mapping

export interface NPCTemplate {
    id: string;
    name: string;
    description: string;
    duration: number; // 滞在時間 (ms)
    spawnRate: number; // ランダム出現確率 (0-100)
    actionType: 'buy' | 'steal_money' | 'steal_items' | 'scam';

    // Action parameters
    minPayment?: number;
    maxPayment?: number;
    minStealItems?: number;
    maxStealItems?: number;
    minStealAmount?: number;
    maxStealAmount?: number;
}

export interface NPC {
    id: string;
    targetUserId: string; // どのプレイヤーの店にいるか
    templateId: string; // テンプレートID参照
    type: string; // 互換性のため残すか、templateIdから引く
    name: string;
    description: string;
    entryTime: number; // 来店時刻
    leaveTime: number; // 退店予定時刻
    effectApplied: boolean; // 効果発動済みか
}

export interface MiniGameConfig {
    id: string;
    jobId: string;
    name: string;
    type: 'tap' | 'timing' | 'ufo_catcher' | 'choice' | 'sequence' | 'search' | 'input' | 'puzzle';
    description: string;
    difficulty: number; // 1-5
    rewardMultiplier: number;
    duration: number; // seconds
}


// ShopItem (マイショップ商品)
export interface ShopItem {
    id: string;
    name: string;
    cost: number;          // 仕入れ値
    price: number;         // 販売価格
    originalPrice?: number; // 元の価格（セール時） NEW
    stock: number;         // 在庫数
    description?: string;  // 説明
    category?: 'furniture' | 'pet' | 'ingredient' | 'appliance' | 'other';  // カテゴリー
    emoji?: string;        // 絵文字アイコン
    discount?: number;     // 割引率（%） NEW
    isSale?: boolean;      // セール中フラグ NEW
}

// Recipe & Cooking System
export interface Ingredient {
    id: string;
    name: string;
    emoji: string;
    price: number;
}

export interface Recipe {
    id: string;
    name: string;
    emoji: string;
    ingredients: { [ingredientId: string]: number }; // { 'ing_rice': 1 }
    sellPrice: number;
    description: string;
    effects?: { // optionalにしました（gameData.tsで追加したため）
        healthBonus?: number;
        happinessBonus?: number;
        balanceBonus?: number;
    };
}

// Collection System
export type CollectionType = 'insect' | 'fossil' | 'card' | 'fish' | 'toy' | 'treasure';

export interface CollectionItem {
    id: string;
    type: CollectionType;
    name: string;
    emoji: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    description: string;
}

export interface UserCollection {
    insects: string[];
    fossils: string[];
    cards: string[];
}

// Furniture & Pets
export interface FurnitureItem {
    id: string;
    name: string;
    emoji: string;
    price: number;
    happinessBonus?: number;
    description?: string;
}

export interface Pet {
    id: string;
    name: string;
    emoji: string;
    price: number;
    happinessBonus?: number;
    loyalty?: number;
    description?: string;
}
