// 職業データ定義
export const JOB_DEFINITIONS = {
    // Basic / Special Jobs
    police: {
        name: '警察',
        type: 'police' as const,
        description: '指名手配犯を逮捕して報奨金を獲得できる',
        salary: 500,
        abilities: {
            arrest: { name: '逮捕', description: '税金未納者や泥棒を逮捕して報奨金を得る', reward: 300 }
        }
    },
    thief: {
        name: '泥棒',
        type: 'thief' as const,
        description: '他プレイヤーから少額を盗める（リスクあり）',
        salary: 300,
        abilities: {
            steal: { name: '盗む', description: '他プレイヤーから50-200枚を盗む（失敗すると罰金）', minAmount: 50, maxAmount: 200, successRate: 0.6, penaltyOnFail: 500 }
        }
    },
    idol: {
        name: 'アイドル',
        type: 'idol' as const,
        description: 'ライブで投げ銭を稼ぎ、人気度を上げる',
        salary: 400,
        abilities: {
            perform: { name: 'ライブ', description: 'ライブを開催してファンから投げ銭をもらう', baseEarning: 200, ratingBonus: 50 }
        }
    },
    unemployed: {
        name: '無職',
        type: 'unemployed' as const,
        description: '自由気ままな生活。たまに宝探し。',
        salary: 0,
        abilities: {}
    },

    // Configured Jobs (from JOB_GAME_CONFIGS)
    doctor: { name: '医者', type: 'doctor' as const, description: '人々の健康を守る仕事', salary: 1200, abilities: {} },
    cake_shop: { name: 'ケーキ屋', type: 'cake_shop' as const, description: '美味しいケーキを作る仕事', salary: 600, abilities: {} },
    bakery: { name: 'パン屋', type: 'bakery' as const, description: '早起きしてパンを焼く仕事', salary: 600, abilities: {} },
    detective: { name: '探偵', type: 'detective' as const, description: '事件の謎を解く仕事', salary: 700, abilities: {} },
    programmer: { name: 'プログラマー', type: 'programmer' as const, description: 'システムを開発する仕事', salary: 900, abilities: {} },
    hacker: { name: 'ハッカー', type: 'hacker' as const, description: '高度な技術で情報を扱う（裏稼業）', salary: 1500, abilities: {} },
    youtuber: { name: 'YouTuber', type: 'youtuber' as const, description: '動画配信で一攫千金', salary: 400, abilities: {} }, // Base salary low, high potential
    animator: { name: 'アニメーター', type: 'animator' as const, description: '夢を動かす仕事', salary: 500, abilities: {} },
    musician: { name: 'ミュージシャン', type: 'musician' as const, description: '音楽で世界を変える', salary: 600, abilities: {} },
    novelist: { name: '小説家', type: 'novelist' as const, description: '物語を紡ぐ仕事', salary: 600, abilities: {} },
    artist: { name: '芸術家', type: 'artist' as const, description: '美を追求する仕事', salary: 500, abilities: {} },
    chef: { name: '料理人', type: 'chef' as const, description: '最高の料理を提供する', salary: 800, abilities: {} },
    florist: { name: '花屋', type: 'florist' as const, description: '花のある生活を届ける', salary: 500, abilities: {} },
    driver: { name: '運転手', type: 'driver' as const, description: '安全に目的地へ運ぶ', salary: 600, abilities: {} },
    mangaka: { name: '漫画家', type: 'mangaka' as const, description: '週刊連載を目指す', salary: 500, abilities: {} },
    scientist: { name: '科学者', type: 'scientist' as const, description: '未知の解明に挑む', salary: 1000, abilities: {} },
    investigator: { name: '投資家', type: 'investigator' as const, description: 'お金でお金を増やす', salary: 1000, abilities: {} }, // High variance
    cracker: { name: 'クラッカー', type: 'cracker' as const, description: 'セキュリティを破壊する（違法）', salary: 1500, abilities: {} },
    garbage_collector: { name: 'ゴミ回収', type: 'garbage_collector' as const, description: '街をきれいにする大切なお仕事', salary: 600, abilities: {} },
    bookstore: { name: '本屋', type: 'bookstore' as const, description: '本との出会いを作る', salary: 500, abilities: {} },
    wagashi_shop: { name: '和菓子屋', type: 'wagashi_shop' as const, description: '伝統の味を守る', salary: 600, abilities: {} },
    pastry_shop: { name: '洋菓子屋', type: 'pastry_shop' as const, description: '甘い幸せを届ける', salary: 600, abilities: {} },

    // New Variations
    architect: { name: '建築家', type: 'architect' as const, description: '理想の建物を設計する', salary: 1000, abilities: {} },
    streamer: { name: '配信者', type: 'streamer' as const, description: 'ライブ配信でファンと交流', salary: 500, abilities: {} },
    pilot: { name: 'パイロット', type: 'pilot' as const, description: '空の旅を安全に', salary: 1200, abilities: {} },

    normal: {
        name: '一般職',
        type: 'normal' as const,
        description: '特殊能力はないが安定した収入',
        salary: 400,
        abilities: {}
    }
} as const;

export type JobType = keyof typeof JOB_DEFINITIONS;
