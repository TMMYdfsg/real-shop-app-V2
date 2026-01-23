export const INITIAL_MONEY = 10;

export type MasterJobType = '通常' | '特殊' | '犯罪';

export interface MasterJob {
  name: string;
  description: string;
  requiresQualification: string | null;
  type: MasterJobType;
}

export interface MasterQualification {
  name: string;
  cost: number;
  maintenance: number;
  unlocks: string[];
}

export interface MasterTrait {
  description: string;
}

export interface MasterCollectibles {
  [category: string]: string[];
}

export interface MasterRecipe {
  ingredients: { [ingredient: string]: number };
  effectDescription: string;
}

export interface MasterEvent {
  name: string;
  turn: number;
  description: string;
}

export interface MasterFurniture {
  price: number;
  happinessBoost: number;
}

export interface MasterCardReward {
  name: string;
  cost: number;
  type: string;
  value: number | string;
}

export interface MasterPet {
  price: number;
  happinessBoost: number;
}

export interface MasterStock {
  name: string;
  price: number;
  volatility: number;
  category: string;
  marketCap?: number;
  owner?: string | null;
}

export interface MasterForbiddenNews {
  headline: string;
  effect: string;
  target: string;
  bonus: number;
  description: string;
}

export interface MasterNPC {
  description: string;
  affinity: number;
}

export interface MasterNewsEvent {
  id: string;
  headline: string;
  category: string;
  effect: string;
  target: string;
  bonus: number;
  duration: number;
  description: string;
}

export const JOBS: { [name: string]: MasterJob } = {
  '無職': { description: 'アルバイトや宝探しなど、自由な生き方ができる。', requiresQualification: null, type: '通常' },
  'ケーキ屋': { description: 'タイミングゲームで美味しいケーキを作る。', requiresQualification: null, type: '通常' },
  '警察官': { description: '探し物ミニゲームで町の人々の困りごとを解決する。夜にパトロールができる。', requiresQualification: null, type: '通常' },
  'Youtuber': { description: '記憶力ゲームで面白い動画を撮影する。', requiresQualification: null, type: '通常' },
  '農家': { description: '毎ターン1万円の安定収入がある。', requiresQualification: null, type: '通常' },
  '投資家': { description: '株の売買手数料が無料になる。(通常5%)', requiresQualification: null, type: '通常' },
  'アイドル': { description: '『応援を求める』コマンドで臨時収入を得られることがある。', requiresQualification: null, type: '通常' },
  '公務員': { description: '毎ターン3万円の安定収入があり、住民税が免除される。', requiresQualification: null, type: '通常' },
  'アニメーター': { description: 'パラパラ漫画を作るミニゲームで作品を制作する。', requiresQualification: null, type: '通常' },
  '小説家': { description: '物語のアイデアを考えて、ベストセラーを目指す。', requiresQualification: null, type: '通常' },
  'ミュージシャン': { description: 'リズムゲームで作曲し、ファンを増やす。', requiresQualification: null, type: '通常' },
  '探偵': { description: '証拠を集めて、簡単な事件を解決する。', requiresQualification: null, type: '通常' },
  'プログラマー': { description: 'コードの間違い探しゲームでアプリを開発する。', requiresQualification: null, type: '通常' },
  '花屋': { description: '注文通りに花束を作るミニゲーム。', requiresQualification: null, type: '通常' },
  'タクシー運転手': { description: 'お客さんを目的地まで最短ルートで送り届ける。', requiresQualification: null, type: '通常' },
  'パン屋': { description: '美味しいパンを焼いてお店に並べる。', requiresQualification: null, type: '通常' },
  '漫画家': { description: '面白いオチを考えて4コマ漫画を完成させる。', requiresQualification: null, type: '通常' },
  '科学者': { description: 'フラスコを混ぜて新発見を目指す実験ゲーム。', requiresQualification: null, type: '通常' },
  '郵便配達員': { description: '指定されたルートを覚えて正確に配達するミニゲーム。', requiresQualification: null, type: '通常' },
  '美容師': { description: '髪型の注文に合わせてカットするスピード＆記憶ゲーム。', requiresQualification: null, type: '通常' },
  'ペットショップ店員': { description: '動物たちの世話をしながら来客に対応する。', requiresQualification: null, type: '通常' },
  'カフェ店員': { description: 'ドリンクやスイーツを正確に提供する。接客力が問われる。', requiresQualification: null, type: '通常' },
  '家具職人': { description: '部品を組み立てて家具を完成させるパズルゲーム。', requiresQualification: null, type: '通常' },
  'ガイド': { description: '観光客に観光地を案内し、知識と対応力が求められる。', requiresQualification: null, type: '通常' },
  '引越し業者': { description: '荷物を効率よく詰めるテトリス風ミニゲーム。', requiresQualification: null, type: '通常' },
  'レジ打ち': { description: 'スキャン速度＆金額の正確さが求められる。', requiresQualification: null, type: '通常' },
  '書店員': { description: '客の要望に合わせた本を素早く探し出す。', requiresQualification: null, type: '通常' },
  '郵便局員': { description: '書類の分類と処理をこなす地味だが重要な仕事。', requiresQualification: null, type: '通常' },
  '雑貨屋': { description: '小物を売って利益を上げる。仕入れ選定のセンスが必要。', requiresQualification: null, type: '通常' },
  '水族館スタッフ': { description: '魚たちの世話や水槽のメンテナンスを行う。', requiresQualification: null, type: '通常' },
  'バーテンダー': { description: '注文通りのカクテルを作成。センスと記憶力勝負。', requiresQualification: null, type: '通常' },
  'DJ': { description: 'リズムに合わせて盛り上げる音楽系職。夜イベントにも強い。', requiresQualification: null, type: '通常' },
  '大道芸人': { description: '技を決めて観客の注目を集める。失敗するとブーイング。', requiresQualification: null, type: '通常' },
  '医者': { description: '診断ミニゲームで人々を助ける。', requiresQualification: 'medical_license', type: '特殊' },
  'エンジニア': { description: '土地の購入費用が20%割引になる。夜に残業ができる。', requiresQualification: 'engineer_cert', type: '特殊' },
  '料理人': { description: '商品の売上が10%上乗せされ、新しいレシピをひらめきやすい。', requiresQualification: 'chef_license', type: '特殊' },
  '検事': { description: 'プレイヤーを起訴する権限を持つ。', requiresQualification: 'law_license', type: '特殊' },
  '弁護士': { description: '被告人を弁護する。', requiresQualification: 'law_license', type: '特殊' },
  '看守': { description: '刑務所の受刑者を管理する。', requiresQualification: null, type: '特殊' },
  '建築家': { description: '新しい物件を設計・建設できる。', requiresQualification: 'architect_cert', type: '特殊' },
  'パイロット': { description: '長距離移動ができる。飛行中に特殊イベントが起きることも。', requiresQualification: 'pilot_license', type: '特殊' },
  '薬剤師': { description: '処方された薬を正しく調合・提供する。', requiresQualification: 'pharmacist_cert', type: '特殊' },
  '救急救命士': { description: '一刻を争う対応を迫られる。緊急イベントで活躍。', requiresQualification: 'emergency_cert', type: '特殊' },
  'プロゲーマー': { description: 'eスポーツ大会に参加でき、ランキング報酬がある。', requiresQualification: 'pro_license', type: '特殊' },
  'ロボット技術者': { description: 'AIロボの開発ができる。新技術の研究が可能。', requiresQualification: 'engineer_cert', type: '特殊' },
  '占い師': { description: '他プレイヤーの運勢を操作できるミステリアス職。', requiresQualification: null, type: '特殊' },
  '宇宙飛行士': { description: '宇宙ミッションイベントに参加できるレア職。', requiresQualification: 'astronaut_cert', type: '特殊' },
  '記者': { description: '社会の出来事を取材し、記事として発信。真実を暴ける。', requiresQualification: null, type: '特殊' },
  '通訳者': { description: '外国イベントで活躍。多言語に対応可能。', requiresQualification: 'language_cert', type: '特殊' },
  '考古学者': { description: '遺跡を発掘してレアアイテムを見つけることがある。', requiresQualification: null, type: '特殊' },
  'ゲーム開発者': { description: '他プレイヤーがプレイするミニゲームを設計可能。', requiresQualification: 'engineer_cert', type: '特殊' },
  'クラッカー': { description: 'ハッキングや窃盗などの犯罪活動に特化している。', requiresQualification: null, type: '犯罪' },
  '軽犯罪者': { description: '法を一度だけ破った者。まだ引き返せるかもしれない。', requiresQualification: null, type: '犯罪' },
  '犯罪者': { description: '犯罪に手を染め、裏社会に足を踏み入れた者。', requiresQualification: null, type: '犯罪' },
  '凶悪犯': { description: 'もはやカタギの世界には戻れない重罪人。', requiresQualification: null, type: '犯罪' },
  '指名手配犯': { description: '警察に追われる身となった危険人物。', requiresQualification: null, type: '犯罪' },
  '極悪犯罪者': { description: 'その名を聞けば誰もが震え上がる大悪党。', requiresQualification: null, type: '犯罪' },
  '永久指名手配犯': { description: '国家を敵に回した、伝説の犯罪者。', requiresQualification: null, type: '犯罪' },
  '詐欺師': { description: '他プレイヤーを騙して金品を得る。バレるとリスク大。', requiresQualification: null, type: '犯罪' },
  '密輸業者': { description: '違法アイテムの流通に関与。成功すれば高報酬。', requiresQualification: null, type: '犯罪' },
  '裏社会の仲介人': { description: '犯罪系プレイヤー間の交渉や取引を取り持つ。', requiresQualification: null, type: '犯罪' },
  '情報屋': { description: 'あらゆる情報を売買し、他人の秘密を握る。', requiresQualification: null, type: '犯罪' },
  '殺し屋': { description: '任意のプレイヤーを一時的にゲームから排除できる。', requiresQualification: null, type: '犯罪' },
  'スパイ': { description: '他プレイヤーの行動ログを覗き見できる能力を持つ。', requiresQualification: null, type: '犯罪' },
  'ダークウェブ管理者': { description: '犯罪取引の仲介や拡散を行う謎多き存在。', requiresQualification: null, type: '犯罪' },
  '爆弾魔': { description: '施設やイベントに干渉できるが、リスクも高い。', requiresQualification: null, type: '犯罪' },
  '黒幕': { description: '犯罪者たちのボス。一度だけ巨大な計画を実行可能。', requiresQualification: null, type: '犯罪' },
  '裏切り者': { description: '他プレイヤーの信頼を裏切り、資源を奪うことができる。', requiresQualification: null, type: '犯罪' },
  '密猟者': { description: '動物を違法に捕獲し、希少アイテムを得る。', requiresQualification: null, type: '犯罪' },
  '麻薬製造者': { description: '違法薬物を製造・販売し、高額な利益を得る。', requiresQualification: null, type: '犯罪' }
};

export const QUALIFICATIONS: { [id: string]: MasterQualification } = {
  medical_license: { name: '医師免許', cost: 50, maintenance: 2, unlocks: ['医者'] },
  law_license: { name: '司法資格', cost: 70, maintenance: 3, unlocks: ['検事', '弁護士'] },
  accounting_cert: { name: '会計士資格', cost: 60, maintenance: 2, unlocks: ['会計士'] },
  teaching_license: { name: '教員免許', cost: 45, maintenance: 1, unlocks: ['教師'] },
  engineer_cert: { name: '技術士資格', cost: 65, maintenance: 3, unlocks: ['エンジニア'] },
  chef_license: { name: '料理師免許', cost: 40, maintenance: 1, unlocks: ['シェフ'] },
  driver_license: { name: '運転免許', cost: 10, maintenance: 0, unlocks: ['配達員'] },
  pharmacist_cert: { name: '薬剤師資格', cost: 55, maintenance: 2, unlocks: ['薬剤師'] },
  firefighter_cert: { name: '消防士免許', cost: 30, maintenance: 1, unlocks: ['消防士'] },
  pilot_license: { name: 'パイロットライセンス', cost: 100, maintenance: 5, unlocks: ['パイロット'] },
  vet_license: { name: '獣医師免許', cost: 60, maintenance: 3, unlocks: ['獣医'] },
  dentist_cert: { name: '歯科医師資格', cost: 65, maintenance: 3, unlocks: ['歯科医'] },
  journalist_pass: { name: '報道記者証', cost: 25, maintenance: 1, unlocks: ['ジャーナリスト'] },
  research_cert: { name: '研究員資格', cost: 55, maintenance: 2, unlocks: ['研究者'] },
  architect_cert: { name: '建築士資格', cost: 70, maintenance: 3, unlocks: ['建築家'] },
  artist_license: { name: 'アーティスト認定', cost: 40, maintenance: 1, unlocks: ['アーティスト'] },
  music_cert: { name: '音楽講師免許', cost: 35, maintenance: 1, unlocks: ['音楽家'] },
  therapist_cert: { name: '心理士資格', cost: 50, maintenance: 2, unlocks: ['カウンセラー'] },
  athletic_cert: { name: '運動トレーナー資格', cost: 45, maintenance: 2, unlocks: ['トレーナー'] },
  security_cert: { name: '警備員資格', cost: 30, maintenance: 1, unlocks: ['警備員'] }
};

export const TRAITS: { [name: string]: MasterTrait } = {
  'アクティブ': { description: 'よく働く → 収入が多くなる。運動系の店（スポーツジム店など）に向く。' },
  'ロマンチック': { description: 'おしゃれ屋・アクセサリー屋などで「魅力度」や人気度が上がる。恋愛系イベント追加可。' },
  '天才': { description: '株や戦略要素に強くなる。株価を読む力があり、株式でボーナス。' },
  '完璧主義者': { description: '商品品質が高くなり、売値が上がる。クラフト系職人向け。' },
  '芸術愛好家': { description: '美術館、絵屋、手作り系店に有利。ひらめきボーナス付き。' },
  'きれい好き': { description: '店が汚れていると売上が下がる or クレームになる。掃除イベント追加。' },
  '物質主義': { description: 'ブランド品や高額商品にこだわる。お金が貯まってもすぐ買ってしまう。' },
  '盗み癖': { description: 'ランダムイベントで他のプレイヤーの売上から盗む（要管理者承認）。' },
  '善人': { description: 'イベントで寄付・詐欺などに巻き込まれやすい性格設定。人気度に影響。' },
  '悪人': { description: 'イベントで寄付・詐欺などに巻き込まれやすい性格設定。人気度に影響。' },
  '嫉妬深い': { description: '他人の売上に嫉妬 → ランダムでムードダウン or チャレンジモード。' },
  '外交的': { description: '会話や売り込みが得意で、商品がよく売れる。交渉が上手くなる。' },
  '怠け者': { description: '行動量が少ない → 昼の行動ターンが制限される。売上が出にくい。' },
  '野心家': { description: '目標（売上額）達成に強い。昇格・褒賞に有利。' },
  '猫好き': { description: 'ペットショップが経営できる or 特定イベント（動物イベント）に好影響。' },
  '犬好き': { description: 'ペットショップが経営できる or 特定イベント（動物イベント）に好影響。' },
  'ベジタリアン': { description: '飲食系の店での料理判定やクレーム要素に影響する。' },
  '美食家': { description: '飲食系の店での料理判定やクレーム要素に影響する。' }
};

export const SKILLS: string[] = [
  '商才', '投資センス', '交渉術', 'ハッキング', 'ピッキング', '絵画', 'ガーデニング', 'プログラミング',
  '魅力', 'いたずら', '探偵', '執筆', 'ギター', '論理学', '器用さ', 'コメディ', '医療知識', '料理', '音楽', '科学',
  '運転技術', '料理技術', '写真術', '演技力', 'スポーツ', 'デザイン', 'マネジメント', 'マーケティング', '分析力',
  '語学力', '耐久力', '集中力', '創造性', 'リーダーシップ', '教育力', '忍耐力', '機械修理', '調査力', '交渉力', '釣り'
];

export const COLLECTIBLES: MasterCollectibles = {
  '昆虫': [
    'モンシロチョウ', 'カブトムシ', 'ナナホシテントウ', 'オニヤンマ', 'アゲハチョウ', 'クワガタ',
    'カミキリムシ', 'トンボ', 'ミヤマクワガタ', 'ヤンマ', 'カゲロウ', 'カブトムシの幼虫',
    'オオクワガタ', 'ヒラタクワガタ', 'オオムラサキ', 'セミ', 'カマキリ', 'ハチ', 'テントウムシ', 'コガネムシ',
    'アブラゼミ', 'ミンミンゼミ', 'ヒグラシ', 'ツクツクボウシ', 'ギンヤンマ', 'アキアカネ', 'シオカラトンボ',
    'ショウリョウバッタ', 'トノサマバッタ', 'オサムシ', 'ゲンゴロウ', 'タガメ', 'ミズカマキリ', 'ハンミョウ',
    'カマドウマ', 'ナナフシ', 'オオカマキリ', 'ニジイロクワガタ', 'ノコギリクワガタ', 'オニクワガタ', 'タマムシ',
    'ルリボシヤンマ', 'チョウトンボ', 'モンキチョウ', 'キアゲハ', 'ナミアゲハ', 'オオスズメバチ', 'クロスズメバチ',
    'テントウムシダマシ', 'ヒメカマキリ'
  ],
  '魚': [
    'アジ', 'サバ', 'タイ', 'ヒラメ', 'マグロ', 'シーラカンス', 'カレイ', 'イカ', 'タコ', 'ウナギ',
    'フグ', 'サンマ', 'ブリ', 'カツオ', 'サケ', 'スズキ', 'メダカ', 'コイ', 'フナ', 'ドジョウ',
    'ニジマス', 'ヤマメ', 'イワナ', 'カジキ', 'アユ', 'ウグイ', 'カワムツ', 'オイカワ', 'モロコ',
    'タナゴ', 'ギンポ', 'ハゼ', 'カワハギ', 'キス', 'ホッケ',
    'イシモチ', 'メバル', 'アイナメ', 'カサゴ', 'ソイ', 'ウツボ', 'アオリイカ', 'ヤリイカ', 'コウイカ',
    'タチウオ', 'サヨリ', 'シラス', 'イワシ', 'キンメダイ', 'アカムツ', 'ホウボウ',
    'ウミタナゴ', 'アオダイ', 'キジハタ', 'マトウダイ', 'アブラボウズ', 'イシダイ', 'クエ',
    'ハタハタ', 'サクラマス', 'シロギス', 'マコガレイ', 'マダイ',
    'カンパチ', 'シマアジ', 'メジナ', 'クロダイ', 'トビウオ', 'ボラ', 'コノシロ', 'コチ', 'アンコウ', 'タラ',
    'ニシン', 'サワラ', 'ヒラマサ', 'イサキ', 'マンボウ', 'ネコザメ', 'カワヨシノボリ', 'ドンコ', 'ゴンズイ',
    'ヒメジ', 'アカハタ', 'イシガキダイ', 'チョウチョウウオ', 'ブラックバス', 'ブルーギル', 'ライギョ', 'ナマズ',
    'ワカサギ', 'シシャモ', 'アメマス'
  ],
  'キラキラカード': [
    '伝説の勇者', '魔法使い見習い', '鋼鉄のゴーレム', 'キングドラゴン', '森のエルフ', '闇の騎士',
    '天空の守護者', '大地の精霊', '深海の魔女', '火の悪魔', '氷の女王', '風の精霊', '光の聖騎士',
    '影の暗殺者', '雷鳴の戦士', '聖なる巫女', '獣の王', '海賊船長', '幻の幻獣', '時空の旅人',
    '星の賢者', '月影の盗賊', '竜骨の戦士', '古代の守り手', '水晶の預言者', '炎翼の使者', '銀河の騎士',
    '森羅の女神', '深緑の番人', '蒼海の王子', '紅蓮の魔導士', '黒曜の剣士', '虹色の狩人', '白銀の魔女',
    '黄昏の詩人', '黎明の錬金術師', '雷雲の王', '幻影の踊り子', '虚空の守護者', '黄金の航海士',
    '碧空の槍使い', '星屑の調律師', '聖樹の守人', '霧の幻術師', '砂漠の英雄', '古き精霊王',
    '蒼炎の騎士', '刻印の召喚士', '天空の機士', '雪原の狙撃手'
  ],
  '化石': [
    'アンモナイト', '三葉虫', '恐竜の足跡', '古代の植物',
    '始祖鳥の化石', 'マンモスの牙', 'サメの歯化石', 'シーラカンスの骨', '巨大トリケラトプス',
    '古代哺乳類の骨', '化石魚', '翼竜の骨', '古代昆虫の化石', '氷河期の牙', '深海生物の化石',
    '珊瑚の化石', '珪化木', '古代哺乳類の足跡', '三葉虫の巣', '古代ウミユリ',
    'ティラノサウルスの歯', 'ステゴサウルスの背板', 'アンキロサウルスの鎧', 'プテラノドンの翼骨',
    '恐竜の卵殻', '古代サメの椎骨', '古代イルカの化石', '巨大サソリの化石', 'アンモナイトの群集化石',
    '古代貝の化石', 'ナウマンゾウの骨', 'サーベルタイガーの牙', '古代ワニの顎骨', '原始人の石器',
    '古代トンボの化石', '火山灰に埋もれた葉化石', '深海貝の化石', '恐竜の皮膚痕',
    '古代鳥類の羽根痕', '古代クジラの骨', '小型恐竜の全身骨格', 'アンモナイトの断面標本',
    '古代カメの甲羅', 'シダ植物の化石', '古代カエルの化石', '巨大魚の顎骨',
    'トリケラトプスの角', '原始ウマの化石', '古代甲殻類の化石', '氷河期の足跡化石'
  ]
};

export const RECIPES: { [name: string]: MasterRecipe } = {
  'おにぎり': { ingredients: { 'お米': 1 }, effectDescription: '幸福度が少し回復する。' },
  '焼き魚': { ingredients: { 'アジ': 1 }, effectDescription: '幸福度が回復する。' },
  'フルーツタルト': { ingredients: { 'フルーツ': 2, '小麦粉': 1 }, effectDescription: '幸福度が大きく回復する。' },
  '味噌汁': { ingredients: { '味噌': 1, '豆腐': 1 }, effectDescription: '体力が回復し、満足度が上がる。' },
  'カレーライス': { ingredients: { 'お米': 1, '肉': 1, '野菜': 2 }, effectDescription: '幸福度とエネルギーが大幅に回復する。' },
  '焼きそば': { ingredients: { '小麦粉': 1, '野菜': 1, '肉': 1 }, effectDescription: '満腹感が増し、幸福度が上がる。' },
  '卵焼き': { ingredients: { '卵': 2, '砂糖': 1 }, effectDescription: '小休憩に最適、幸福度が少し回復する。' },
  'サラダ': { ingredients: { '野菜': 3 }, effectDescription: '健康効果があり、人気度が上がる。' },
  'パンケーキ': { ingredients: { '小麦粉': 1, '卵': 1, '牛乳': 1 }, effectDescription: '甘いおやつで幸福度が上がる。' },
  '寿司': { ingredients: { 'お米': 1, '魚': 1 }, effectDescription: '豪華な食事で幸福度が大幅アップ。' },
  '唐揚げ': { ingredients: { '鶏肉': 1, '調味料': 1 }, effectDescription: 'ボリューム満点で満腹感が持続。' },
  'みたらし団子': { ingredients: { 'もち': 3, '砂糖': 1 }, effectDescription: '甘くて満足度が増す。' },
  'スープ': { ingredients: { '野菜': 2, '肉': 1 }, effectDescription: '体を温めて体力回復。' },
  'プリン': { ingredients: { '卵': 2, '牛乳': 1, '砂糖': 1 }, effectDescription: '甘くて幸福度が上がる。' },
  '焼き芋': { ingredients: { 'さつまいも': 1 }, effectDescription: 'ほっこりとした甘さで幸福度が回復。' },
  'おでん': { ingredients: { '大根': 1, '卵': 1, 'こんにゃく': 1 }, effectDescription: '寒い日にはぴったり。体力回復。' },
  'ピザ': { ingredients: { '小麦粉': 1, 'チーズ': 1, 'トマト': 1 }, effectDescription: 'パーティーに最適。人気度アップ。' },
  '餃子': { ingredients: { '小麦粉': 1, '肉': 1, '野菜': 1 }, effectDescription: 'ボリューム満点で満足度が増す。' },
  'アイスクリーム': { ingredients: { '牛乳': 1, '砂糖': 1 }, effectDescription: '暑い日にぴったりで幸福度アップ。' },
  'チャーハン': { ingredients: { 'お米': 1, '卵': 1, '肉': 1 }, effectDescription: '手軽に作れて満腹感アップ。' }
};

export const GAME_EVENTS: MasterEvent[] = [
  { name: '夏祭り', turn: 10, description: '町で夏祭りが開催されます！限定の屋台が出店するかも？' },
  { name: '釣り大会', turn: 20, description: '一番大きな魚を釣った人には豪華景品が！' },
  { name: 'クリスマス', turn: 30, description: 'サンタクロースがプレゼントを持ってやってくるかも...？' },
  { name: '花火大会', turn: 15, description: '夜空を彩る花火大会が開催され、人気が上昇する。' },
  { name: 'ハロウィンパーティー', turn: 25, description: '仮装コンテストで盛り上がる町の一大イベント。' },
  { name: '農業フェスティバル', turn: 40, description: '地元産の野菜や果物が集まる祭典。料理が得意な人にチャンス。' },
  { name: '音楽フェス', turn: 35, description: '様々なジャンルの音楽が集結。人気度アップのチャンス！' },
  { name: '新年の初詣', turn: 50, description: '神社に初詣に行き、幸福度が少し回復する。' },
  { name: 'スポーツ大会', turn: 45, description: '町のスポーツ大会で優勝を目指そう。運動スキルが活躍する。' },
  { name: '芸術展覧会', turn: 55, description: '地元のアーティストが作品を展示。芸術愛好家にボーナス。' },
  { name: '読書週間', turn: 60, description: '読書の楽しさを広めるイベント。知識やスキルの習得に良い。' },
  { name: 'バザー', turn: 65, description: '手作り品の販売で収入アップのチャンス。' },
  { name: '映画祭', turn: 70, description: '映画好きが集まるフェス。人気度が上がるかも？' },
  { name: 'テクノロジー展', turn: 75, description: '最新技術の発表会。投資やプログラミングスキルに影響。' },
  { name: '動物フェスティバル', turn: 80, description: 'ペット好きに嬉しいイベント。特別アイテムも入手可能。' },
  { name: '料理コンテスト', turn: 85, description: '腕自慢の料理人が集う。料理スキルアップに最適。' },
  { name: 'ボランティアデー', turn: 90, description: '町の清掃や支援活動に参加すると人気度アップ。' },
  { name: '天体観測会', turn: 95, description: '星空を眺めてリラックス。幸福度が少し上がる。' },
  { name: '文化祭', turn: 100, description: '町全体で盛り上がる文化祭。様々なスキルが活躍。' },
  { name: 'ファッションショー', turn: 105, description: 'おしゃれ好きにはたまらない。人気度が大きく上がる。' },
  { name: '雪まつり', turn: 110, description: '雪像が並ぶ冬の一大イベント。人気が少し上がる。' },
  { name: '温泉フェア', turn: 115, description: '温泉地が賑わい、リラックス効果で幸福度が回復。' },
  { name: 'ローカルフード祭', turn: 120, description: '地元グルメを楽しめる祭典。食系スキルに好影響。' },
  { name: '古本市', turn: 125, description: '珍しい本が集まる市。知識系スキルに良い刺激。' },
  { name: '春の植樹祭', turn: 130, description: '街の緑化イベント。人気度が少し上昇する。' },
  { name: '職業体験デー', turn: 135, description: 'さまざまな仕事体験ができる。スキル経験値アップ。' },
  { name: 'クラフトマーケット', turn: 140, description: '手作り品が集う市場。クラフト系職にチャンス。' },
  { name: 'ミニロボ展示会', turn: 145, description: '小型ロボの展示が話題。技術系のひらめきが起きやすい。' },
  { name: '灯りの夜祭', turn: 150, description: '灯りで街が彩られる夜祭。人気度が上がる。' },
  { name: '農村収穫祭', turn: 155, description: '豊作を祝うイベント。農業系の報酬が上がるかも。' },
  { name: 'ボードゲーム大会', turn: 160, description: '戦略ゲームで盛り上がる。論理系スキルが活躍。' },
  { name: 'ストリートパフォーマンス大会', turn: 165, description: '大道芸で競い合う大会。芸能系の人気が上がる。' },
  { name: '海開き', turn: 170, description: '海辺が解禁されて賑わう。観光人気が上昇。' },
  { name: '登山チャレンジ', turn: 175, description: '山登りイベント。体力系スキルにボーナス。' },
  { name: '地元アイドルライブ', turn: 180, description: 'アイドルイベントで人気度が上昇。' },
  { name: 'クラシックコンサート', turn: 185, description: '音楽の祭典。音楽系スキルが伸びやすい。' },
  { name: '科学実験フェア', turn: 190, description: '科学ショーが開催。科学系スキルの成長に有利。' },
  { name: 'リサイクル週間', turn: 195, description: '環境意識が高まる週。街の評価が少し上がる。' },
  { name: '星空グランピング', turn: 200, description: '特別な宿泊体験が話題。幸福度が回復。' },
  { name: 'スイーツ博覧会', turn: 205, description: '甘いイベントで人気アップ。料理系にボーナス。' },
  { name: '伝統工芸展', turn: 210, description: '職人技が集結。クラフト系職に良い影響。' },
  { name: 'マラソンフェス', turn: 215, description: 'スポーツイベントで体力系スキルが活躍。' },
  { name: '学園文化ウィーク', turn: 220, description: '学生主体の文化イベント。人気度が上昇。' },
  { name: '夏のビーチパーティー', turn: 225, description: '海辺のイベントで観光人気がアップ。' },
  { name: '町内運動会', turn: 230, description: '住民参加の運動会。スポーツ系が得意な人に有利。' },
  { name: '写真コンテスト', turn: 235, description: '作品で競い合う。芸術系の評価が上がる。' },
  { name: 'キャンプフェスタ', turn: 240, description: 'アウトドアイベント。耐久系スキルにボーナス。' },
  { name: '料理教室スペシャル', turn: 245, description: '料理の腕を磨ける特別講座。料理系スキルが成長。' },
  { name: '音楽コラボナイト', turn: 250, description: 'ミュージシャン同士の共演が話題。人気度アップ。' },
  { name: 'ファッションマーケット', turn: 255, description: 'おしゃれ市場が開催され人気が上がる。' }
];

export const FURNITURE: { [name: string]: MasterFurniture } = {
  'シンプルなベッド': { price: 5, happinessBoost: 1 },
  '大きな本棚': { price: 10, happinessBoost: 2 },
  '最新ゲーム機': { price: 20, happinessBoost: 5 },
  'ふかふかのソファ': { price: 15, happinessBoost: 3 },
  'おしゃれなランプ': { price: 8, happinessBoost: 2 },
  '木製ダイニングテーブル': { price: 25, happinessBoost: 4 },
  'クラシックチェア': { price: 12, happinessBoost: 2 },
  'デジタルピアノ': { price: 30, happinessBoost: 6 },
  'アートパネル': { price: 18, happinessBoost: 3 },
  'モダンカーテン': { price: 14, happinessBoost: 2 },
  'スマートテレビ': { price: 28, happinessBoost: 5 },
  'コーヒーテーブル': { price: 10, happinessBoost: 2 },
  '屋内プラント': { price: 7, happinessBoost: 1 },
  '書斎用デスク': { price: 22, happinessBoost: 3 },
  'マッサージチェア': { price: 40, happinessBoost: 7 },
  'レトロラジオ': { price: 15, happinessBoost: 3 },
  '大型ミラー': { price: 12, happinessBoost: 2 },
  '収納キャビネット': { price: 20, happinessBoost: 3 },
  'ウッドフロアマット': { price: 8, happinessBoost: 1 },
  'ペット用ベッド': { price: 9, happinessBoost: 2 },
  '電気暖炉': { price: 25, happinessBoost: 4 }
};

export const CARD_REWARDS: MasterCardReward[] = [
  { name: '50万円と交換', cost: 1, type: 'money', value: 50 },
  { name: '幸福度MAXドリンク', cost: 1, type: 'happiness', value: 100 },
  { name: '【限定】金のトロフィー', cost: 5, type: 'furniture', value: '金のトロフィー' }
];

export const PETS: { [name: string]: MasterPet } = {
  'いぬ': { price: 10, happinessBoost: 5 },
  'ねこ': { price: 10, happinessBoost: 5 },
  'うさぎ': { price: 8, happinessBoost: 4 },
  'ハムスター': { price: 5, happinessBoost: 3 },
  'フェレット': { price: 12, happinessBoost: 6 },
  'オウム': { price: 15, happinessBoost: 5 },
  '金魚': { price: 3, happinessBoost: 2 },
  'カメ': { price: 7, happinessBoost: 4 },
  'モルモット': { price: 6, happinessBoost: 3 },
  'リス': { price: 9, happinessBoost: 4 },
  'ヘビ': { price: 11, happinessBoost: 3 },
  'カエル': { price: 4, happinessBoost: 2 },
  'ハリネズミ': { price: 10, happinessBoost: 5 },
  'フクロウ': { price: 14, happinessBoost: 5 },
  'シマリス': { price: 8, happinessBoost: 3 },
  'ミニブタ': { price: 20, happinessBoost: 6 },
  'ポニー': { price: 30, happinessBoost: 8 },
  'ネズミ': { price: 3, happinessBoost: 1 },
  'ウーパールーパー': { price: 7, happinessBoost: 3 },
  'イグアナ': { price: 13, happinessBoost: 4 }
};

export const FORBIDDEN_STOCKS: MasterStock[] = [
  { name: 'シャドウ・コーポレーション', price: 500, volatility: 2.5, category: '謎のテクノロジー' },
  { name: '古代文明の遺産ファンド', price: 1000, volatility: 1.8, category: '秘宝' },
  { name: 'ゴースト・インダストリー', price: 666, volatility: 3.0, category: '不明' }
];

export const FORBIDDEN_NEWS: MasterForbiddenNews[] = [
  { headline: '宇宙からの謎の信号を受信！', effect: 'stock_up', target: 'シャドウ・コーポレーション', bonus: 5.0, description: 'シャドウ・コーポレーションの株価が5倍に！' },
  { headline: '古代遺跡で大発見！', effect: 'stock_up', target: '古代文明の遺産ファンド', bonus: 10.0, description: '古代文明の遺産ファンドの価値が10倍に！' },
  { headline: '次元の歪みが発生...', effect: 'stock_crash', target: 'all', bonus: 0.1, description: '禁断の市場の全銘柄が暴落！' }
];

export const STOCKS: MasterStock[] = [
  { name: 'フルーツ会社(安定)', price: 10, volatility: 0.05, category: '食品', marketCap: 1000, owner: null },
  { name: 'おもちゃ産業(普通)', price: 30, volatility: 0.15, category: 'エンタメ', marketCap: 3000, owner: null },
  { name: 'ITキングダム(成長)', price: 80, volatility: 0.3, category: 'テクノロジー', marketCap: 8000, owner: null },
  { name: 'ドラゴンフーズ', price: 45, volatility: 0.5, category: '食品', marketCap: 4500, owner: null },
  { name: 'ほのお銀行', price: 100, volatility: 0.2, category: '金融', marketCap: 10000, owner: null },
  { name: 'ウィザード証券', price: 65, volatility: 0.4, category: '金融', marketCap: 6500, owner: null },
  { name: 'ねこのしっぽ製菓', price: 50, volatility: 0.6, category: '食品', marketCap: 5000, owner: null },
  { name: 'ホーリースター電気', price: 70, volatility: 0.3, category: 'エネルギー', marketCap: 7000, owner: null },
  { name: 'スターライト製作所', price: 90, volatility: 0.35, category: '工業', marketCap: 9000, owner: null },
  { name: 'カゲネコ雑貨店', price: 40, volatility: 0.45, category: '小売', marketCap: 4000, owner: null },
  { name: 'フローズンミルク社', price: 35, volatility: 0.55, category: '食品', marketCap: 3500, owner: null },
  { name: 'たんぽぽ建設', price: 95, volatility: 0.25, category: '建設', marketCap: 9500, owner: null },
  { name: 'ソラニワ不動産', price: 110, volatility: 0.2, category: '不動産', marketCap: 11000, owner: null },
  { name: 'まじょまじょ医薬', price: 88, volatility: 0.4, category: '医薬', marketCap: 8800, owner: null },
  { name: 'シマエナガ出版', price: 55, volatility: 0.5, category: 'メディア', marketCap: 5500, owner: null },
  { name: 'フクロウ放送', price: 60, volatility: 0.45, category: 'メディア', marketCap: 6000, owner: null },
  { name: 'プラネットおもちゃ', price: 30, volatility: 0.6, category: '玩具', marketCap: 3000, owner: null },
  { name: 'ハピネス農園', price: 42, volatility: 0.35, category: '農業', marketCap: 4200, owner: null },
  { name: 'ギャラクシー家具', price: 78, volatility: 0.3, category: '小売', marketCap: 7800, owner: null },
  { name: '雷鳴重工', price: 125, volatility: 0.15, category: '工業', marketCap: 12500, owner: null },
  { name: 'キャンディミント製薬', price: 95, volatility: 0.4, category: '医薬', marketCap: 9500, owner: null },
  { name: 'スマイル物流', price: 62, volatility: 0.5, category: '運輸', marketCap: 6200, owner: null },
  { name: '夜空通信', price: 100, volatility: 0.3, category: 'テクノロジー', marketCap: 10000, owner: null },
  { name: 'サクラコスメ', price: 58, volatility: 0.4, category: '化粧品', marketCap: 5800, owner: null },
  { name: 'オーロラ水産', price: 47, volatility: 0.5, category: '水産', marketCap: 4700, owner: null },
  { name: 'おはなITソリューション', price: 83, volatility: 0.35, category: 'テクノロジー', marketCap: 8300, owner: null },
  { name: 'みどり製茶', price: 38, volatility: 0.45, category: '食品', marketCap: 3800, owner: null },
  { name: 'ワンダートラベル', price: 73, volatility: 0.4, category: '旅行', marketCap: 7300, owner: null },
  { name: 'にじいろ園芸', price: 33, volatility: 0.6, category: '農業', marketCap: 3300, owner: null },
  { name: 'おどろき証券', price: 85, volatility: 0.3, category: '金融', marketCap: 8500, owner: null },
  { name: 'もちもち不動産', price: 92, volatility: 0.35, category: '不動産', marketCap: 9200, owner: null },
  { name: '未来都市電機', price: 115, volatility: 0.25, category: 'エネルギー', marketCap: 11500, owner: null },
  { name: 'まほうITラボ', price: 88, volatility: 0.4, category: 'テクノロジー', marketCap: 8800, owner: null },
  { name: 'わらい茸エンタメ', price: 66, volatility: 0.45, category: 'エンタメ', marketCap: 6600, owner: null },
  { name: 'クマのパン屋', price: 39, volatility: 0.55, category: '食品', marketCap: 3900, owner: null },
  { name: 'まぼろし証券', price: 103, volatility: 0.3, category: '金融', marketCap: 10300, owner: null },
  { name: 'ルーン鉱業', price: 120, volatility: 0.25, category: '素材', marketCap: 12000, owner: null },
  { name: 'しあわせ製薬', price: 99, volatility: 0.35, category: '医薬', marketCap: 9900, owner: null },
  { name: 'エコヒカリ電力', price: 84, volatility: 0.4, category: 'エネルギー', marketCap: 8400, owner: null },
  { name: 'ツバメ交通', price: 71, volatility: 0.5, category: '運輸', marketCap: 7100, owner: null },
  { name: 'ブルームホテルズ', price: 60, volatility: 0.45, category: '宿泊', marketCap: 6000, owner: null },
  { name: 'かがやき宇宙開発', price: 140, volatility: 0.2, category: 'テクノロジー', marketCap: 14000, owner: null },
  { name: 'ミラクル農機', price: 89, volatility: 0.35, category: '農業', marketCap: 8900, owner: null },
  { name: 'こもれび森林開発', price: 93, volatility: 0.4, category: '素材', marketCap: 9300, owner: null },
  { name: 'チョコバナナ社', price: 41, volatility: 0.55, category: '食品', marketCap: 4100, owner: null },
  { name: 'まるっと警備保障', price: 78, volatility: 0.3, category: 'サービス', marketCap: 7800, owner: null },
  { name: 'あさひカメラ', price: 67, volatility: 0.4, category: 'テクノロジー', marketCap: 6700, owner: null },
  { name: 'やまね製鉄所', price: 108, volatility: 0.3, category: '工業', marketCap: 10800, owner: null },
  { name: 'はなまる保険', price: 99, volatility: 0.35, category: '金融', marketCap: 9900, owner: null },
  { name: 'デジタルねこ開発', price: 105, volatility: 0.25, category: 'テクノロジー', marketCap: 10500, owner: null },
  { name: 'ホタルファーム', price: 52, volatility: 0.45, category: '農業', marketCap: 5200, owner: null },
  { name: 'つばさ航空', price: 115, volatility: 0.3, category: '運輸', marketCap: 11500, owner: null },
  { name: 'ふしぎなおもちゃ堂', price: 44, volatility: 0.5, category: '玩具', marketCap: 4400, owner: null },
  { name: 'トパーズ出版', price: 68, volatility: 0.4, category: 'メディア', marketCap: 6800, owner: null },
  { name: 'スマート灯油', price: 87, volatility: 0.35, category: 'エネルギー', marketCap: 8700, owner: null },
  { name: 'ラビットエンタープライズ', price: 72, volatility: 0.45, category: 'サービス', marketCap: 7200, owner: null },
  { name: 'レモン交通', price: 90, volatility: 0.3, category: '運輸', marketCap: 9000, owner: null },
  { name: 'マジカル鉄道', price: 110, volatility: 0.25, category: '運輸', marketCap: 11000, owner: null },
  { name: 'もぐもぐ食堂', price: 49, volatility: 0.5, category: '食品', marketCap: 4900, owner: null },
  { name: 'ネコポスト', price: 75, volatility: 0.4, category: '運輸', marketCap: 7500, owner: null },
  { name: 'サイバーストリート', price: 130, volatility: 0.3, category: 'テクノロジー', marketCap: 13000, owner: null },
  { name: 'まんてんソーラー', price: 98, volatility: 0.35, category: 'エネルギー', marketCap: 9800, owner: null },
  { name: 'ゆめいろ温泉開発', price: 83, volatility: 0.4, category: '宿泊', marketCap: 8300, owner: null },
  { name: 'たぬきタクシー', price: 58, volatility: 0.45, category: '運輸', marketCap: 5800, owner: null },
  { name: 'しずく化粧品', price: 77, volatility: 0.35, category: '化粧品', marketCap: 7700, owner: null },
  { name: 'ドリームマート', price: 70, volatility: 0.5, category: '小売', marketCap: 7000, owner: null },
  { name: 'キラリ鉄道開発', price: 102, volatility: 0.3, category: '工業', marketCap: 10200, owner: null },
  { name: 'アイスピア社', price: 39, volatility: 0.6, category: '食品', marketCap: 3900, owner: null },
  { name: 'フラワー薬局', price: 88, volatility: 0.35, category: '医薬', marketCap: 8800, owner: null },
  { name: 'ミドリ物流', price: 64, volatility: 0.45, category: '運輸', marketCap: 6400, owner: null },
  { name: 'ムーンテック', price: 121, volatility: 0.2, category: 'テクノロジー', marketCap: 12100, owner: null },
  { name: 'ブーケ不動産', price: 96, volatility: 0.35, category: '不動産', marketCap: 9600, owner: null }
];

export const NPCS: { [name: string]: MasterNPC } = {
  '熱血市長': { description: '街の発展を願う熱い男。', affinity: 0 },
  '冷静な銀行頭取': { description: '数字が全ての冷徹な頭取。', affinity: 0 },
  '謎の大富豪': { description: '素性不明の大富豪。', affinity: 0 },
  '優しい薬剤師': { description: '地域の健康を支える優しい薬剤師。', affinity: 0 },
  '頑固な鍛冶屋': { description: '古い伝統を守る頑固な鍛冶屋。', affinity: 0 },
  '陽気な商人': { description: 'いつも笑顔の陽気な商人。', affinity: 0 },
  '冷静な警察署長': { description: '街の安全を見守る冷静な警察署長。', affinity: 0 },
  '謎めいた占い師': { description: '未来を読み解く謎めいた占い師。', affinity: 0 },
  '若き教師': { description: '未来を担う子供達を導く若き教師。', affinity: 0 },
  '厳格な神父': { description: '街の精神的支柱となる厳格な神父。', affinity: 0 },
  '落ち着いた司書': { description: '知識の宝庫、図書館の落ち着いた司書。', affinity: 0 },
  '気さくな農夫': { description: '自然と共に生きる気さくな農夫。', affinity: 0 },
  '勤勉な技術者': { description: '街の未来を作る勤勉な技術者。', affinity: 0 },
  '陽気なバーテンダー': { description: '誰とでも仲良くなれる陽気なバーテンダー。', affinity: 0 },
  '自由奔放な画家': { description: '街角で自由に絵を描く画家。', affinity: 0 },
  '勇敢な消防士': { description: '街の安全を守る勇敢な消防士。', affinity: 0 },
  '社交的な記者': { description: '真実を伝える社交的な記者。', affinity: 0 },
  '神秘的な魔法使い': { description: '謎に包まれた神秘的な魔法使い。', affinity: 0 },
  '寡黙な鍛冶職人': { description: '黙々と作業する寡黙な鍛冶職人。', affinity: 0 },
  '人情味あふれるパン屋': { description: '心温まるパンを焼く人情味あふれるパン屋。', affinity: 0 },
  '熱心な新聞配達員': { description: '毎朝欠かさず街に新聞を届ける。', affinity: 0 },
  'おしゃべりな美容師': { description: '話題が尽きない美容師。', affinity: 0 },
  '控えめな研究員': { description: '静かに研究に打ち込む研究員。', affinity: 0 },
  '陽気な料理長': { description: 'キッチンを明るく仕切る料理長。', affinity: 0 },
  '頑固な時計職人': { description: '精密さにこだわる職人。', affinity: 0 },
  '優雅な舞踏家': { description: '舞台で輝く優雅な踊り手。', affinity: 0 },
  '元気な保育士': { description: '子供たちに慕われる保育士。', affinity: 0 },
  '几帳面な会計士': { description: '帳簿のズレを見逃さない。', affinity: 0 },
  'のんびり釣り人': { description: '川辺でのんびり過ごす釣り人。', affinity: 0 },
  '情熱的な音楽家': { description: '音に全てを注ぐ音楽家。', affinity: 0 },
  '冷静な医師': { description: '冷静な判断で患者を救う。', affinity: 0 },
  '豪快な大工': { description: '豪快な仕事ぶりで評判の大工。', affinity: 0 },
  '博識な教授': { description: '知識の引き出しが多い教授。', affinity: 0 },
  '親切なタクシー運転手': { description: '道案内が丁寧な運転手。', affinity: 0 },
  '夢見る作家': { description: '新しい物語を探す作家。', affinity: 0 },
  '機転の利く配達員': { description: '細かな気配りで荷物を届ける。', affinity: 0 },
  '陽気な農園主': { description: '畑仕事が大好きな農園主。', affinity: 0 },
  '寡黙な警備員': { description: '黙々と見回りをこなす警備員。', affinity: 0 },
  '気品ある陶芸家': { description: '器に品格を宿す陶芸家。', affinity: 0 },
  '腕利きの整備士': { description: 'どんな機械も直す整備士。', affinity: 0 },
  '強気な投資家': { description: 'リスクを恐れない投資家。', affinity: 0 },
  '朗らかな看護師': { description: '笑顔で患者を支える看護師。', affinity: 0 },
  '不思議な旅人': { description: '各地を巡る謎めいた旅人。', affinity: 0 },
  '職人気質のパン職人': { description: 'パン作りに妥協しない職人。', affinity: 0 },
  'にぎやかな道具屋': { description: '何でも揃う店を切り盛りする。', affinity: 0 },
  '謙虚な修道女': { description: '静かに祈りを捧げる修道女。', affinity: 0 },
  '探究心旺盛な学生': { description: '新しい学びに貪欲な学生。', affinity: 0 },
  '温厚な裁縫師': { description: '丁寧に仕立てる裁縫師。', affinity: 0 },
  '大胆な発明家': { description: 'ひらめきで発明を繰り返す。', affinity: 0 },
  '旅好きな写真家': { description: '風景を撮り歩く写真家。', affinity: 0 }
};

export const NEWS_EVENTS: MasterNewsEvent[] = [
  { id: 'NE001', headline: 'インフルエンザ大流行の兆し', category: '社会', effect: 'job_bonus', target: '医者', bonus: 1.5, duration: 3, description: '医者の仕事の報酬が1.5倍になります！' },
  { id: 'NE002', headline: '記録的な猛暑！', category: '天気', effect: 'product_price', target: 'アイス', bonus: 2.0, duration: 2, description: '「アイス」の価格が2倍に高騰！' },
  { id: 'NE003', headline: 'レトロゲームが大ブーム！', category: '流行', effect: 'skill_bonus', target: 'プログラミング', bonus: 1.5, duration: 4, description: '「プログラミング」スキルの経験値獲得量が1.5倍に！' },
  { id: 'NE004', headline: '町の宝探し大会開催！', category: 'イベント', effect: 'special_quest', target: 'all', bonus: 0, duration: 5, description: '町のどこかに隠された宝箱を探し出そう！' },
  { id: 'NE005', headline: '株式市場が好調！', category: '経済', effect: 'stock_up', target: 'all', bonus: 1.2, duration: 1, description: '全ての株価が1.2倍に上昇！' },
  { id: 'NE006', headline: '大地震発生！', category: '災害', effect: 'property_damage', target: 'all', bonus: -0.3, duration: 2, description: '地震により土地の価値が下落しています。' },
  { id: 'NE007', headline: '新技術発表！', category: '技術', effect: 'skill_bonus', target: '技術者', bonus: 1.4, duration: 3, description: '技術者のスキル獲得が1.4倍に！' },
  { id: 'NE008', headline: '食品偽装問題発覚', category: '社会', effect: 'popularity_down', target: '飲食店', bonus: -0.5, duration: 4, description: '飲食店の人気が大きく下落しました。' },
  { id: 'NE009', headline: '観光シーズン到来', category: '観光', effect: 'popularity_up', target: '観光地', bonus: 1.3, duration: 5, description: '観光地の人気が上昇しています。' },
  { id: 'NE010', headline: '選挙結果発表', category: '政治', effect: 'policy_change', target: 'all', bonus: 0, duration: 0, description: '新しい政策が実施されます。' },
  { id: 'NE011', headline: '新型ウイルス発生', category: '社会', effect: 'job_penalty', target: '医者', bonus: 0.7, duration: 4, description: '医者の仕事効率が70%に低下。' },
  { id: 'NE012', headline: '交通網の整備', category: '都市開発', effect: 'popularity_up', target: '都市', bonus: 1.2, duration: 3, description: '都市の人気が上昇。' },
  { id: 'NE013', headline: '新規商店街開業', category: '経済', effect: 'job_bonus', target: '商人', bonus: 1.3, duration: 3, description: '商人の収入が増加！' },
  { id: 'NE014', headline: '映画祭開催', category: '文化', effect: 'popularity_up', target: '映画館', bonus: 1.5, duration: 4, description: '映画館の人気が急上昇！' },
  { id: 'NE015', headline: '工場火災発生', category: '災害', effect: 'job_penalty', target: '工場労働者', bonus: 0.5, duration: 3, description: '工場労働者の効率が低下。' },
  { id: 'NE016', headline: '新しい教育方針導入', category: '教育', effect: 'skill_bonus', target: '教師', bonus: 1.3, duration: 5, description: '教師のスキル成長率アップ。' },
  { id: 'NE017', headline: '大規模セール開催', category: '経済', effect: 'product_price_down', target: '小売店', bonus: 0.8, duration: 2, description: '小売店の商品の価格が下落。' },
  { id: 'NE018', headline: '国際交流イベント', category: '文化', effect: 'popularity_up', target: '都市', bonus: 1.4, duration: 3, description: '都市の文化的な人気が上昇しています。' },
  { id: 'NE019', headline: '地元企業が大幅投資', category: '経済', effect: 'stock_up', target: 'all', bonus: 1.1, duration: 2, description: '株式市場が活気づいています。' },
  { id: 'NE020', headline: '交通渋滞が深刻化', category: '社会', effect: 'job_penalty', target: 'タクシー運転手', bonus: 0.8, duration: 3, description: '移動系の仕事効率が低下。' },
  { id: 'NE021', headline: '健康ブーム到来', category: '文化', effect: 'popularity_up', target: '都市', bonus: 1.2, duration: 3, description: '健康志向が広がり人気が上昇。' },
  { id: 'NE022', headline: '新作映画が大ヒット', category: '文化', effect: 'popularity_up', target: '映画館', bonus: 1.4, duration: 3, description: '映画館の人気が上昇しています。' },
  { id: 'NE023', headline: '小麦の供給不足', category: '経済', effect: 'product_price', target: '小麦粉', bonus: 1.8, duration: 2, description: '小麦粉の価格が上昇。' },
  { id: 'NE024', headline: '大雨続き', category: '天気', effect: 'product_price_down', target: '野菜', bonus: 0.7, duration: 2, description: '野菜の価格が下落。' },
  { id: 'NE025', headline: '観光インフラ整備', category: '都市開発', effect: 'popularity_up', target: '都市', bonus: 1.2, duration: 3, description: '街の人気が上昇。' },
  { id: 'NE026', headline: '料理番組が話題', category: '文化', effect: 'skill_bonus', target: '料理', bonus: 1.3, duration: 4, description: '料理スキルの成長率アップ。' },
  { id: 'NE027', headline: '詐欺被害が増加', category: '社会', effect: 'popularity_down', target: '小売店', bonus: -0.4, duration: 3, description: '小売店の人気が下落。' },
  { id: 'NE028', headline: '花粉シーズン到来', category: '社会', effect: 'job_penalty', target: '農家', bonus: 0.85, duration: 2, description: '農作業が少し難しくなる。' },
  { id: 'NE029', headline: '観光キャンペーン開始', category: '観光', effect: 'popularity_up', target: '観光地', bonus: 1.5, duration: 4, description: '観光地の人気が上昇。' },
  { id: 'NE030', headline: '新素材の発見', category: '技術', effect: 'skill_bonus', target: '技術者', bonus: 1.5, duration: 3, description: '技術者のスキル成長率アップ。' },
  { id: 'NE031', headline: '地震対策強化', category: '政治', effect: 'policy_change', target: 'all', bonus: 0, duration: 0, description: '新しい防災政策が実施されます。' },
  { id: 'NE032', headline: '燃料価格高騰', category: '経済', effect: 'product_price', target: '灯油', bonus: 1.6, duration: 3, description: '燃料関連の価格が上昇。' },
  { id: 'NE033', headline: '漁獲量増加', category: '経済', effect: 'product_price_down', target: '魚', bonus: 0.8, duration: 3, description: '魚の価格が下落。' },
  { id: 'NE034', headline: '教育改革が成功', category: '教育', effect: 'skill_bonus', target: '教育力', bonus: 1.4, duration: 4, description: '教育系スキルの成長率アップ。' },
  { id: 'NE035', headline: '市民清掃デー', category: '社会', effect: 'popularity_up', target: '都市', bonus: 1.1, duration: 2, description: '街の評価が少し上がる。' },
  { id: 'NE036', headline: '感染症の再流行', category: '健康', effect: 'job_bonus', target: '医者', bonus: 1.4, duration: 3, description: '医者の報酬が増加。' },
  { id: 'NE037', headline: '新テーマパーク計画', category: '経済', effect: 'stock_up', target: 'all', bonus: 1.15, duration: 2, description: '市場が期待で上向き。' },
  { id: 'NE038', headline: '冷夏で需要低迷', category: '天気', effect: 'product_price_down', target: 'アイス', bonus: 0.6, duration: 2, description: 'アイスの価格が下落。' },
  { id: 'NE039', headline: '大型台風接近', category: '災害', effect: 'property_damage', target: 'all', bonus: -0.4, duration: 2, description: '土地の価値が下がりやすい。' },
  { id: 'NE040', headline: '古代遺跡の調査開始', category: '文化', effect: 'special_quest', target: 'all', bonus: 0, duration: 5, description: '特別な探索イベントが発生。' },
  { id: 'NE041', headline: '地元農産物フェア', category: '経済', effect: 'product_price', target: '野菜', bonus: 1.3, duration: 2, description: '野菜の価格が上昇。' },
  { id: 'NE042', headline: '音楽チャリティー', category: '文化', effect: 'popularity_up', target: '都市', bonus: 1.2, duration: 3, description: '街の人気が上昇。' },
  { id: 'NE043', headline: 'AI教育プログラム導入', category: '技術', effect: 'skill_bonus', target: 'プログラミング', bonus: 1.6, duration: 4, description: 'プログラミング経験値が増加。' },
  { id: 'NE044', headline: '大停電発生', category: '災害', effect: 'job_penalty', target: '工場労働者', bonus: 0.6, duration: 2, description: '工場関連の仕事効率が低下。' },
  { id: 'NE045', headline: '物流効率化', category: '経済', effect: 'job_bonus', target: '郵便配達員', bonus: 1.3, duration: 3, description: '配達系の報酬が増加。' },
  { id: 'NE046', headline: '観光地のマナー向上', category: '社会', effect: 'popularity_up', target: '観光地', bonus: 1.2, duration: 2, description: '観光地の評価が上昇。' },
  { id: 'NE047', headline: 'SNS炎上', category: '社会', effect: 'popularity_down', target: '都市', bonus: -0.4, duration: 2, description: '街の人気が一時的に下落。' },
  { id: 'NE048', headline: '新交通ルート開通', category: '都市開発', effect: 'popularity_up', target: '都市', bonus: 1.3, duration: 3, description: '街の人気が上昇。' }
];
