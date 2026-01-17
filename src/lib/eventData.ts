import { GameEvent } from '@/types';

// 病気の種類
export type DiseaseType = 'healthy' | 'cold' | 'flu' | 'serious';

export interface Disease {
    type: DiseaseType;
    name: string;
    healthImpact: number; // 健康への影響（マイナス値）
    baseCost: number; // 基本治療費
    duration: number; // 継続ターン数
}

export const DISEASE_TYPES: Record<DiseaseType, Disease> = {
    healthy: {
        type: 'healthy',
        name: '健康',
        healthImpact: 0,
        baseCost: 0,
        duration: 0
    },
    cold: {
        type: 'cold',
        name: '風邪',
        healthImpact: -10,
        baseCost: 500,
        duration: 2
    },
    flu: {
        type: 'flu',
        name: 'インフルエンザ',
        healthImpact: -30,
        baseCost: 2000,
        duration: 3
    },
    serious: {
        type: 'serious',
        name: '重病',
        healthImpact: -50,
        baseCost: 10000,
        duration: 5
    }
};

// 拡張イベントテンプレート
export const EVENT_TEMPLATES: Omit<GameEvent, 'id' | 'startTime'>[] = [
    // === 経済イベント ===
    {
        name: '好景気到来！',
        description: '景気が良くなり、お店の売上が大幅アップ！',
        type: 'boom',
        duration: 60 * 1000,
        effectValue: 1.5
    },
    {
        name: '大不況...',
        description: '不景気の波が押し寄せています...',
        type: 'recession',
        duration: 60 * 1000,
        effectValue: 0.5
    },
    {
        name: '特別定額給付金',
        description: '政府から特別給付金が支給されます！',
        type: 'grant',
        duration: 5000,
        effectValue: 5000
    },
    {
        name: '増税決定',
        description: '臨時増税が決定されました...',
        type: 'tax_hike',
        duration: 5000,
        effectValue: 0.1
    },

    // === お祭り・イベント ===
    {
        name: 'お祭り開催！',
        description: '街でお祭りが開催中！お客さんが増えています',
        type: 'festival',
        duration: 30 * 1000,
        effectValue: 2.0
    },

    // === 健康・疫病 ===
    {
        name: '疫病流行',
        description: 'ウイルスが流行中。体調管理に注意してください',
        type: 'epidemic',
        duration: 90 * 1000,
        effectValue: 0.3 // 30% chance to get sick per turn
    },

    // === 気象災害 ===
    {
        name: '大地震発生',
        description: '大地震が発生！建物に被害が...',
        type: 'disaster',
        duration: 10 * 1000,
        effectValue: 5000 // Damage amount
    },
    {
        name: '台風接近',
        description: '大型台風が接近中。営業に影響が出ています',
        type: 'disaster',
        duration: 45 * 1000,
        effectValue: 0.3 // Sales penalty
    },

    // === 気温イベント ===
    {
        name: '猛暑到来',
        description: '記録的な猛暑！冷たい商品が飛ぶように売れています',
        type: 'heatwave',
        duration: 60 * 1000,
        effectValue: 1.0 // Bonus multiplier for cold items
    },
    {
        name: '寒波襲来',
        description: '厳しい寒さです。暖かい商品の需要が急増',
        type: 'coldwave',
        duration: 60 * 1000,
        effectValue: 1.0 // Bonus multiplier for warm items
    }
];

// プレイヤー個別イベント（ランダムで特定プレイヤーに発生）
export const PLAYER_EVENT_TEMPLATES: Omit<GameEvent, 'id' | 'startTime' | 'targetUserId'>[] = [
    {
        name: 'バズった！',
        description: 'あなたのお店がSNSでバズりました！',
        type: 'viral',
        duration: 45 * 1000,
        effectValue: 3.0 // 3x sales multiplier
    },
    {
        name: '炎上...',
        description: 'お店が炎上してしまいました...',
        type: 'scandal',
        duration: 60 * 1000,
        effectValue: 0.2 // Sales penalty
    }
];

// イベント発生確率（ターンごと）
export const EVENT_SPAWN_RATES = {
    global: 0.05, // 5% per turn for global events
    player: 0.02  // 2% per turn per player for individual events
};
