export type Role = 'banker' | 'player';

export interface Stock {
    id: string;
    name: string;
    price: number;
    previousPrice: number;
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

export interface User {
    id: string;
    name: string;
    role: Role;
    balance: number; // 所持金
    deposit: number; // 貯金 (稼ぎの半分)
    debt: number; // 借金
    popularity: number; // 人気度
    happiness: number; // 幸福度
    job: string;
    items: string[]; // 購入した商品のIDなど
    stocks: { [stockId: string]: number }; // 保有株数
    forbiddenStocks: { [stockId: string]: number };
    isForbiddenUnlocked: boolean;
    lastJobChangeTurn?: number; // 最後に転職したターン
    unpaidTax: number; // 未払いの税金
}

export interface GameSettings {
    taxRate: number;
    insuranceRate: number;
    interestRate: number;
    salaryAutoSafeRate: number; // 稼ぎの何%を自動貯金するか (デフォルト50%)
}

export interface GameState {
    users: User[];
    stocks: Stock[];
    requests: Request[];
    marketStatus: 'open' | 'closed'; // 昼夜連動など
    turn: number;
    isDay: boolean; // true=昼, false=夜
    settings: GameSettings;
    news: string[]; // ニュースログ
    roulette: {
        items: { id: number; text: string; effect: string; weight?: number }[];
        currentResult: { text: string; timestamp: number; targetUserId?: string } | null;
    };
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    products: Product[];
}
