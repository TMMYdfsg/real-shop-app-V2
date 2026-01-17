// 職業データ定義
export const JOB_DEFINITIONS = {
    police: {
        name: '警察',
        type: 'police' as const,
        description: '指名手配犯を逮捕して報奨金を獲得できる',
        salary: 500,
        abilities: {
            arrest: {
                name: '逮捕',
                description: '税金未納者や泥棒を逮捕して報奨金を得る',
                reward: 300
            }
        }
    },
    thief: {
        name: '泥棒',
        type: 'thief' as const,
        description: '他プレイヤーから少額を盗める（リスクあり）',
        salary: 300,
        abilities: {
            steal: {
                name: '盗む',
                description: '他プレイヤーから50-200枚を盗む（失敗すると罰金）',
                minAmount: 50,
                maxAmount: 200,
                successRate: 0.6, // 60%の成功率
                penaltyOnFail: 500
            }
        }
    },
    idol: {
        name: 'アイドル',
        type: 'idol' as const,
        description: 'ライブで投げ銭を稼ぎ、人気度を上げる',
        salary: 400,
        abilities: {
            perform: {
                name: 'ライブ',
                description: 'ライブを開催してファンから投げ銭をもらう',
                baseEarning: 200,
                ratingBonus: 50 // rating 1ごとに+50枚
            }
        }
    },
    normal: {
        name: '一般職',
        type: 'normal' as const,
        description: '特殊能力はないが安定した収入',
        salary: 400,
        abilities: {}
    }
} as const;

export type JobType = keyof typeof JOB_DEFINITIONS;
