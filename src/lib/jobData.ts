import { MiniGameConfig } from '@/types';

export type JobType = 'doctor' | 'cake_shop' | 'bakery' | 'police' | 'detective' | 'programmer' | 'hacker' | 'youtuber' | 'animator' | 'musician' | 'novelist' | 'artist' | 'chef' | 'florist' | 'driver' | 'mangaka' | 'scientist' | 'investigator' | 'cracker' | 'garbage_collector' | 'bookstore' | 'wagashi_shop' | 'pastry_shop' | 'unemployed';

export const JOB_GAME_CONFIGS: Record<JobType, Partial<MiniGameConfig> & { acceptanceRate?: number }> = {
    // 1. 医者
    doctor: { name: '診断ゲーム', type: 'choice', description: '患者の症状を見て正しい治療法を選ぼう', difficulty: 3, rewardMultiplier: 1.5, duration: 30, acceptanceRate: 20 },
    // 2. ケーキ屋
    cake_shop: { name: 'レシピ記憶', type: 'sequence', description: '表示される材料の順番を覚えよう', difficulty: 2, rewardMultiplier: 1.2, duration: 20, acceptanceRate: 80 },
    // 3. パン屋
    bakery: { name: 'パン作り', type: 'sequence', description: '材料の順番通りにパンを作ろう', difficulty: 1, rewardMultiplier: 1.0, duration: 20, acceptanceRate: 90 },
    // 4. 警察官
    police: { name: '落とし物探し', type: 'search', description: '指定されたアイテムを探し出そう', difficulty: 2, rewardMultiplier: 1.1, duration: 15, acceptanceRate: 60 },
    // 5. 探偵
    detective: { name: '観察力ゲーム', type: 'search', description: 'さっきと何が変わった？', difficulty: 3, rewardMultiplier: 1.3, duration: 15, acceptanceRate: 40 },
    // 6. プログラマー
    programmer: { name: 'コーディング', type: 'tap', description: '画面を連打してコードを書こう', difficulty: 2, rewardMultiplier: 1.2, duration: 10, acceptanceRate: 70 },
    // 7. ハッカー
    hacker: { name: 'ハッキング', type: 'tap', description: '超高速で連打してシステムに侵入せよ', difficulty: 4, rewardMultiplier: 2.0, duration: 10, acceptanceRate: 10 },
    // 8. YouTuber
    youtuber: { name: '動画投稿', type: 'input', description: '動画のタイトルを決めて投稿しよう', difficulty: 1, rewardMultiplier: 1.5, duration: 60, acceptanceRate: 50 },
    // 9. アニメーター
    animator: { name: 'コマ順序', type: 'sequence', description: 'コマの並び順を覚えよう', difficulty: 3, rewardMultiplier: 1.3, duration: 30, acceptanceRate: 60 },
    // 10. ミュージシャン
    musician: { name: 'リズム記憶', type: 'sequence', description: '音符の並びを再現しよう', difficulty: 3, rewardMultiplier: 1.4, duration: 25, acceptanceRate: 30 },
    // 11. 小説家
    novelist: { name: '執筆', type: 'choice', description: '次の一文を選んで物語を紡ごう', difficulty: 2, rewardMultiplier: 1.1, duration: 40, acceptanceRate: 70 },
    // 12. 芸術家
    artist: { name: '絵画修復', type: 'puzzle', description: 'バラバラになった絵を元に戻そう', difficulty: 3, rewardMultiplier: 1.3, duration: 40, acceptanceRate: 50 },
    // 13. 料理人
    chef: { name: '調理', type: 'search', description: '必要な食材を素早く見つけよう', difficulty: 2, rewardMultiplier: 1.1, duration: 20, acceptanceRate: 80 },
    // 14. 花屋
    florist: { name: 'フラワーアレンジ', type: 'puzzle', description: '花の色を綺麗に揃えよう', difficulty: 1, rewardMultiplier: 1.0, duration: 30, acceptanceRate: 90 },
    // 15. タクシー運転手
    driver: { name: 'ルート選択', type: 'choice', description: '正しいルートを選んで目的地へ', difficulty: 2, rewardMultiplier: 1.1, duration: 20, acceptanceRate: 85 },
    // 16. 漫画家
    mangaka: { name: 'コマ割り', type: 'sequence', description: 'コマを正しい順序で配置しよう', difficulty: 3, rewardMultiplier: 1.3, duration: 30, acceptanceRate: 40 },
    // 17. 科学者
    scientist: { name: '実験', type: 'choice', description: '成功率の高い実験手順を選ぼう', difficulty: 4, rewardMultiplier: 1.5, duration: 25, acceptanceRate: 20 },
    // 18. 投資家
    investigator: { name: '相場予測', type: 'choice', description: '株価が上がるか下がるか予測しよう', difficulty: 3, rewardMultiplier: 1.4, duration: 15, acceptanceRate: 30 },
    // 19. クラッカー
    cracker: { name: 'パスワード解析', type: 'timing', description: '数字をタイミングよく止めろ', difficulty: 5, rewardMultiplier: 3.0, duration: 10, acceptanceRate: 5 },
    // 20. ゴミ回収業者
    garbage_collector: { name: 'ゴミ分別', type: 'choice', description: '正しい分別方法を選ぼう', difficulty: 2, rewardMultiplier: 1.1, duration: 25, acceptanceRate: 85 },
    // 21. 本屋
    bookstore: { name: '本の整理', type: 'sequence', description: '本を正しい順番に並べよう', difficulty: 2, rewardMultiplier: 1.2, duration: 30, acceptanceRate: 75 },
    // 22. 和菓子屋
    wagashi_shop: { name: '和菓子作り', type: 'sequence', description: '材料を正しい順番で混ぜよう', difficulty: 2, rewardMultiplier: 1.2, duration: 25, acceptanceRate: 80 },
    // 23. 洋菓子屋
    pastry_shop: { name: 'デコレーション', type: 'puzzle', description: 'ケーキを美しく飾ろう', difficulty: 2, rewardMultiplier: 1.3, duration: 30, acceptanceRate: 70 },
    // 24. 無職
    unemployed: { name: '暇つぶし', type: 'choice', description: 'アルバイトか宝探しか選ぼう', difficulty: 1, rewardMultiplier: 0.5, duration: 10, acceptanceRate: 100 },
};
