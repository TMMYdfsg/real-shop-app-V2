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

export interface Crypto {
    id: string;
    name: string;
    symbol: string;
    price: number;
    previousPrice: number;
    volatility: number;
    priceHistory?: number[]; // チャート用履歴
    creatorId: string;
    description?: string;
    createdAt?: number;
    updatedAt?: number;
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
    type: 'loan' | 'repay' | 'income' | 'tax' | 'bill' | 'buy_stock' | 'sell_stock' | 'change_job' | 'unlock_forbidden' | 'transfer' | 'pay_tax' | 'city_buy_land' | 'city_build_place' | 'city_buy_address' | 'buy_vehicle' | 'restock_items' | 'vacation';
    requesterId: string;
    amount: number;
    details?: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: number;
    idempotencyKey?: string; // Duplicate request prevention
}

export interface InventoryItem {
    id: string; // Unique instance ID
    itemId: string; // Master template ID (e.g., 'ing_rice')
    quantity: number;
    name?: string; // Optional override
    isIllegal?: boolean;
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

// ==========================================
// Catalog & My Room System
// ==========================================

// 仕入れカタログアイテム（家具・家電・ペット・食材）
export interface CatalogItem {
    id: string;
    name: string;
    category: 'furniture' | 'appliance' | 'pet' | 'ingredient' | 'other';
    price: number;
    wholesalePrice?: number; // 卸値（指定がない場合はpriceと同じ）
    description?: string;
    emoji?: string;
    imageUrl?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    stock?: number; // カタログ在庫
}

// ユーザーが所有する家具・ペット
export interface OwnedItem {
    id: string;
    catalogItemId: string;
    purchasedAt: number;
    isPlaced?: boolean; // マイルームに配置済みか
    x?: number; // Grid X
    y?: number; // Grid Y
    rotation?: number; // 0, 90, 180, 270

    // Display / Cache properties
    name?: string;
    emoji?: string;
    category?: string;
    price?: number;
}

// ==========================================
// Review System
// ==========================================

// レビュー
export interface Review {
    id: string;
    shopOwnerId: string; // レビュー対象のショップオーナー
    reviewerId: string; // レビューを書いた人
    reviewerName?: string; // キャッシュ用
    rating: 1 | 2 | 3 | 4 | 5; // 星評価
    comment: string;
    purchaseId: string; // 購入ID（レシート識別用）
    timestamp: number;
}

// 購入レシート
export interface Receipt {
    id: string;
    shopOwnerId: string;
    shopOwnerName?: string; // キャッシュ用
    customerId: string;
    items: { itemId: string; name: string; price: number; quantity: number }[];
    total: number;
    timestamp: number;
    hasReview?: boolean; // レビュー済みフラグ
}

// ==========================================
// Existing Types Continue
// ==========================================

export interface Transaction {
    id: string;
    type: 'payment' | 'transfer' | 'income' | 'tax' | 'deposit' | 'withdraw' | 'repay' | 'buy_stock' | 'sell_stock';
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
    arrestCount?: number;
    stolenAmount?: number;
    fanCount?: number;

    // Employment
    employmentStatus: 'employed' | 'unemployed' | 'retired';
    jobTitle?: string; // 職種名
    currentJobId?: string; // 現在の仕事ID
    jobHistory: { jobId: string; timestamp: number }[]; // 職歴

    // Market (shop)
    shopItems: ShopItem[]; // 販売中の商品

    // Inventory
    inventory?: InventoryItem[];

    // Trading Stock
    stocks: { [stockId: string]: number }; // stockId -> quantity
    forbiddenStocks?: { [stockId: string]: number };
    isForbiddenUnlocked?: boolean;

    // History
    transactions: Transaction[];

    // Points
    pointCards: PointCard[]; // お店ごとのポイント
    catalogPoints?: number; // カタログポイント（システムアイテム交換用）
    loyaltyPoints?: number; // ロイヤルティポイント（ユーザーアイテム交換用）

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

    // Catalog & My Room System
    myRoomItems?: OwnedItem[]; // 所有アイテム（家具・ペット）
    receipts?: Receipt[]; // 購入レシート履歴
    reviews?: Review[]; // 書いたレビュー
    receivedReviews?: Review[]; // 受け取ったレビュー（ショップオーナーとして）

    // Virtual Currency
    cryptoHoldings?: { [cryptoId: string]: number }; // 仮想通貨保有数

    // Time Machine Feature
    timeEra?: 'present' | 'past' | 'future';


    // City Simulator (Phase 1)
    ownedLands: string[]; // Land IDs
    ownedPlaces: string[]; // Place IDs
    mainPlaceId?: string; // 本業のPlace ID
    sidePlaceIds?: string[]; // 副業のPlace IDs

    // Commuting & Transportation (Phase 2)
    commuteMethod?: 'walk' | 'bicycle' | 'train' | 'bus' | 'taxi' | 'car';
    ownedVehicles?: string[]; // 所有している車両ID (自転車・車)
    hasLicense?: boolean; // 運転免許の有無 (Phase 2 legacy, keep for compatibility or migrate to qualifications)
    homeLocationId?: string; // 自宅の場所
    workLocationId?: string; // 職場の場所
    commuteDistance?: number; // 通勤距離 (km)
    lastCommuteTurn?: number; // 最後に通勤したターン
    carFuel?: number; // 0-100 (自家用車用)
    isLate?: boolean; // 遅刻フラグ
    monthlyParkingCost?: number; // 駐車場代
    region?: 'urban' | 'rural'; // 居住地域

    // Qualifications & Exams (Phase 3)
    qualifications?: string[]; // 取得済み資格IDリスト
    examHistory?: ExamResult[]; // 受験履歴

    // Banking & Finance (Phase 4)
    creditScore?: number; // 信用スコア
    loans?: Loan[];       // 借入リスト
    insurances?: InsuranceContract[]; // 加入保険

    // Health (Phase 4)
    isHospitalized?: boolean; // 入院中フラグ

    // Phase 5: Occupation & Life
    lifeStats?: LifeStats;
    family?: FamilyMember[];
    partners?: string[]; // 恋愛対象NPC IDs
    smartphone?: SmartphoneState;

    // Commute (Updated / Phase 5)
    commuteInfo?: {
        method: 'walk' | 'bicycle' | 'train' | 'bus' | 'taxi' | 'car';
        vehicleId?: string;
        distance: number;
        duration: number; // 分
    };

    // Audit & Security (Phase 6)
    auditLogs?: AuditLog[];
    suspicionScore?: number; // 0-100 (100で監査イベント確定)
    nerve?: number; // 0-100 (犯罪行動用スタミナ, Torn City参考)

    // Quest System (New)
    quests?: QuestProgress[];
    completedQuestIds?: string[];

    // Settings
    settings?: {
        notificationSound?: string;
    };
    // Vacation System
    isOff?: boolean; // お休み中フラグ
    isDebugAuthorized?: boolean; // デバッグ機能使用許可
    vacationReason?: string; // お休みの理由
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'main' | 'daily' | 'achievement';
    requirements: {
        type: 'job' | 'debt' | 'balance' | 'item' | 'location';
        value: any;
        comparison?: 'eq' | 'gte' | 'lte'; // defaults to eq or gte depends on type
    };
    rewards: {
        money?: number;
        item?: string;
        xp?: number;
        popularity?: number;
    };
    isRepeatable?: boolean;
}

export interface QuestProgress {
    questId: string;
    status: 'active' | 'completed' | 'failed';
    progress: number; // 0-100
    startedAt: number;
    completedAt?: number;
}

// Phase 3: Qualifications
export interface ExamResult {
    qualificationId: string;
    timestamp: number;
    score: number;
    passed: boolean;
}

export interface Qualification {
    id: string;
    name: string;
    category: 'language' | 'business' | 'creative' | 'medical' | 'driving' | 'special' | 'hobby' | 'food';
    difficulty: 1 | 2 | 3 | 4 | 5; // 1: Easy, 5: Hard
    examFee: number;
    description: string;
    requirements?: string[]; // 前提資格ID
    effects?: {
        jobUnlock?: string[]; // 解放される職業
        salaryBonus?: number; // 給与ボーナス(%)
        statBonus?: {
            intelligence?: number;
            charisma?: number;
        };
    };
    minigameType?: 'quiz' | 'typing' | 'action' | 'driving';
}

// Coupon System NEW
export interface Coupon {
    id: string;
    // ... (rest is same)

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
    moneyMultiplier: number; // グローバル収入倍率
    isGameStarted?: boolean; // ゲーム開始フラグ
}

export interface NewsItem {
    id: string;
    type?: string;
    message: string;
    timestamp: number;
}

export interface RouletteResult {
    text: string;
    timestamp: number;
    targetUserId?: string;
}

// Social Media & Video Types
export interface SNSPost {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    likes: number;
    likedBy: string[];
    timestamp: number;
    replyToId?: string; // For replies
}

export interface VideoContent {
    id: string;
    uploaderId: string;
    uploaderName: string;
    title: string;
    description: string; // Added
    tags: string[];      // Added
    url: string;         // Added (path to video file)
    thumbnailColor: string;
    views: number;
    likes: number;
    timestamp: number;
}

export interface GameState {
    users: User[];
    gameId?: string; // Session ID for client reset detection
    stocks: Stock[];
    cryptos: Crypto[]; // 仮想通貨リスト
    requests: Request[];
    marketStatus: 'open' | 'closed'; // 昼夜連動など
    turn: number;
    isDay: boolean; // true=昼, false=夜
    isTimerRunning: boolean; // タイマー進行中かどうか
    lastTick: number; // 最後の時間更新
    timeRemaining: number; // 次のターンまでの残り時間(ms)
    settings: GameSettings;
    news: (NewsItem | string)[]; // ニュースログ (文字列またはオブジェクト)
    roulette: {
        items: { id: number; text: string; effect: string; weight?: number }[];
        currentResult: RouletteResult | null;
    };
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    products: Product[];
    activeNPCs: NPC[];
    npcTemplates: NPCTemplate[];
    activeEvents: GameEvent[];
    properties: Property[];
    catalogInventory?: CatalogItem[]; // 仕入れ先カタログ（管理者が管理）

    // Social Media & Video Data
    snsPosts?: SNSPost[];
    videos?: VideoContent[];

    // City Simulator Data
    lands: Land[];
    places: Place[];

    // Phase 4: Simulation
    economy: EconomyState;
    environment: EnvironmentState;

    // Phase 8: Real-time & Synchronization
    eventRevision: number; // Increment on every state change
    lastEvent?: GameEventData;
    processedIdempotencyKeys: string[]; // Track processed keys (last 1000 or so)
}

export interface GameEventData {
    type: 'INVENTORY_UPDATED' | 'SALES_NOTIFICATION' | 'PRICE_CHANGED' | 'ADMIN_MESSAGE' | 'STATE_SYNC';
    payload: any;
    timestamp: number;
    revision: number;
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
// PointExchangeItem定義は後方に移動・統合されました

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

    // Dynamic props
    actionType?: 'buy' | 'steal_money' | 'steal_items' | 'scam';
    budget?: number;
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
    sellerId: string;      // 販売者ID
    name: string;
    cost: number;          // 仕入れ値
    price: number;         // 販売価格
    originalPrice?: number; // 元の価格（セール時） NEW
    stock: number;         // 在庫数
    description?: string;  // 説明
    category?: 'furniture' | 'pet' | 'ingredient' | 'appliance' | 'other';  // カテゴリー
    emoji?: string;        // 絵文字アイコン
    imageUrl?: string;     // 画像URL NEW
    discount?: number;     // 割引率（%） NEW
    isSale?: boolean;      // セール中フラグ NEW
    isSold: boolean;       // 売り切れフラグ
    createdAt: number;     // 作成日時
    condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor'; // 商品の状態
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

// Vehicles (Phase 2)
export interface Vehicle {
    id: string;
    type: 'bicycle' | 'car';
    name: string;
    price: number;
    speed: number; // 通勤時間短縮効果
    fuelConsumption?: number; // 燃費 (車のみ)
    reliability: number; // 故障・パンク率 (1-100)
    maintenanceCost: number; // 維持費
    image?: string;
    description: string;
    prestige?: number; // ステータス上昇効果
}

// PointExchangeItem - ポイント交換所アイテム
export interface PointExchangeItem {
    id: string;
    shopOwnerId: string; // 所有者ID (User.id)
    name: string;
    description?: string;
    pointCost: number;

    // カテゴリー/タイプ
    category?: 'furniture' | 'pet' | 'recipe' | 'special';

    // システム互換性のため残すプロパティ
    rewardType?: 'coupon' | 'discount' | 'item' | 'special';
    rewardValue?: any;

    emoji?: string;
    stock?: number;
    exchangedCount?: number;
}

// City Simulator Types
export interface Location {
    lat: number;
    lng: number;
}

export interface Land {
    id: string; // gridId (例: "135-35-10") or countryId
    ownerId: string | null; // nullなら公有地/販売中
    price: number; // 地価
    location: Location;
    address: string;
    isForSale: boolean;
    placeId?: string; // 建設されているPlace ID
    polygon?: Array<{ lat: number; lng: number }>; // マップ描画用のポリゴン座標
    size: number; // 広さ (m2)
    zoning: string; // 用途地域 (commercial, residential, industrial, etc.)
    status?: string; // 状態 (active, sold, etc.)

    // 不動産管理パラメータ
    maintenanceFee?: number;    // 維持費
    requiresApproval?: boolean; // 購入承認必要フラグ
    allowConstruction?: boolean;// 建設許可フラグ
    allowCompany?: boolean;     // 法人設立許可フラグ
    regionId?: string;          // 地域ID (region_asia, etc.)
    place?: Place;
}

export type PlaceType = 'restaurant' | 'retail' | 'office' | 'factory' | 'service' | 'residential' | 'public';

export type BuildingCategory = 'house' | 'company' | 'shop';

export type CompanyType =
    | 'large_enterprise' | 'sme' | 'start_up' | 'venture' | 'mega_venture'
    | 'growth_company' | 'listed_company' | 'unlisted_company' | 'public_company' | 'private_company'
    | 'domestic_company' | 'foreign_company' | 'parent_company' | 'subsidiary' | 'affiliate' | 'group_company'
    | 'established_company' | 'emerging_company' | 'mature_company'
    | 'white_company' | 'black_company'
    | 'sole_proprietorship' | 'corporation' | 'small_business' | 'global_enterprise';



export interface Place {
    id: string; // SKU/UUID
    ownerId: string; // 所有者ID
    name: string;
    type: PlaceType; // Legacy or specific

    // New Building Properties
    buildingCategory?: BuildingCategory;
    companyType?: CompanyType;

    // 地理情報
    location: {
        lat: number;
        lng: number;
        address: string; // 逆ジオコーディングまたは仮の住所
        landId?: string; // 紐づく土地ID (Grid ID)
    };

    status: 'planning' | 'construction' | 'active' | 'closed' | 'bankrupted';

    // 経営指標
    level: number; // 規模ランク (1-5)
    employees: string[]; // Employee ID list (NPC)
    stats: {
        capital: number; // 資本金
        sales: number; // 月間売上
        expenses: number; // 月間経費
        profit: number; // 純利益
        reputation: number; // 評判 (0-5)
        customerCount: number; // 来客数
    };

    // リスク管理
    licenses: string[]; // 取得済み許認可ID
    insurances: string[]; // 加入済み保険ID

    // UI/Customization
    description?: string;
    imageUrl?: string;
    website?: ShopWebsite; // 既存のホームページ機能
}

// ==========================================
// Phase 4: Banking & Simulation Types
// ==========================================

// Banking
export interface Loan {
    id: string;
    name: string; // "住宅ローン", "事業拡大資金" etc.
    amount: number; // 元金
    remainingAmount: number; // 残高
    dueDate?: number; // 返済期限 (timestamp)
    interestRate: number; // 金利 (%)
    isFixedRate: boolean; // 固定金利かどうか
    monthlyPayment: number; // 毎ターン返済額
    nextPaymentTurn: number;
    status: 'active' | 'paid_off' | 'defaulted' | 'pending';
    borrowedAt: number;
}

export interface InsuranceContract {
    id: string;
    type: 'fire' | 'health' | 'worker_comp';
    name: string;
    premium: number; // 毎ターン保険料
    coverageAmount: number; // 補償限度額
    expiresAt: number | null; // nullなら永続
    joinedAt: number;
}

// Economy Simulation
export interface EconomyState {
    status: 'boom' | 'normal' | 'recession' | 'crisis'; // 景気
    interestRate: number; // 政策金利 (%)
    priceIndex: number; // 物価指数 (基準100)
    marketTrend: 'bull' | 'bear' | 'stable';
    taxRateAdjust: number; // 税率補正
    lastUpdateTurn: number;
}

// Environment Simulation
export interface EnvironmentState {
    weather: 'sunny' | 'rain' | 'heavy_rain' | 'storm' | 'snow' | 'heatwave';
    temperature: number;
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    disaster?: {
        type: 'earthquake' | 'typhoon' | 'fire' | 'pandemic';
        name: string;
        severity: number; // 1-5
        remainingTurns: number;
        affectedRegions?: string[]; // 地域ID
    };
    cityInfrastructure: {
        power: number; // 稼働率 0-100
        water: number;
        network: number;
    };
    securityLevel: number; // 治安 0-100 (低いほど危険)
}

// ==========================================
// Phase 5: Occupation & Career Types
// ==========================================

export type JobType = 'public' | 'medical' | 'creative' | 'technical' | 'service' | 'business' | 'freelance' | 'criminal' | 'agriculture' | 'educational';

export interface Occupation {
    id: string;
    name: string;
    type: JobType;
    rank: number; // 階級 (1-10)
    salary: number; // 基本給 (月給/ターン給)
    requirements: {
        qualifications?: string[]; // 必須資格
        experience?: number; // 必要勤続年数
        stats?: { [key: string]: number }; // 必要ステータス
        prevJobId?: string | string[]; // 直前の職業（昇進ルート）
    };
    effects: {
        stress: number; // ストレス増加量
        health: number; // 健康影響
        prestige: number; // 社会的信用
    };
    workTime: { start: number; end: number }; // 勤務時間 (0-24)
    description: string;
}

export interface PartTimeJob {
    id: string;
    name: string;
    hourlyWage: number;
    type: JobType;
    requirements: {
        qualifications?: string[];
        stats?: { [key: string]: number };
    };
    promotionTargetId?: string; // 昇格先の正社員職ID
    experienceOverride: number; // 昇格に必要な勤務回数
    effects: {
        stress: number;
        fatigue: number;
    };
    description: string;
}

// ==========================================
// Phase 5: Life Simulation Types
// ==========================================

export interface LifeStats {
    health: number; // 0-100 (0で入院)
    hunger: number; // 0-100 (100で餓死リスク/衰弱)
    stress: number; // 0-100 (高いと病気リスク)
    fatigue: number; // 0-100 (疲労度)
    hygiene: number; // 清潔度
}

export interface FamilyMember {
    id: string; // NPC ID
    relation: 'spouse' | 'child' | 'parent' | 'partner';
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    affection: number; // 親密度 0-100
    occupation?: string;
    school?: string; // 子供の場合
}

export interface SmartphoneState {
    model: string;
    apps: string[]; // Installed app IDs
    broken: boolean;
    battery: number;
}

// ==========================================
// Phase 6: Audit & Security
// ==========================================

export interface AuditLog {
    id: string;
    userId: string;
    actionType: 'high_value_transaction' | 'resale_attempt' | 'tax_evasion' | 'insider_trading' | 'suspicious_activity' | 'system_warning';
    details: string; // JSON string
    severity: 'info' | 'warning' | 'critical';
    timestamp: number;
}



// ==========================================
// Phase 8: Real-time Communication
// ==========================================

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    imageUrl?: string;
    type?: 'text' | 'image';
    isRead: boolean;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        playerIcon?: string;
    };
    receiver: {
        id: string;
        name: string;
        playerIcon?: string;
    };
}
