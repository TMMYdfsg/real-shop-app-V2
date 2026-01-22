
import { QUALIFICATIONS as MASTER_QUALIFICATIONS } from '@/lib/masterData';

export interface QualificationGenre {
    id: string;
    name: string;
}

export interface KidExamQuestion {
    id: string;
    type: 'mcq';
    prompt: string;
    choices: { label: string }[];
    answerIndex: number;
    hints: {
        type: 'text' | 'eliminate' | 'highlight' | 'reveal';
        text?: string;
        removeChoiceIndexes?: number[];
        targetChoiceIndex?: number;
        answer?: string;
        explanation?: string;
    }[];
}

export interface KidExam {
    recommendedAgeMin: number;
    questionCount: number;
    timeLimitSec: number;
    questions: KidExamQuestion[];
}

export interface Qualification {
    id: string;
    genreId: string;
    name: string;
    difficultyStars: number;
    feeYen: number | null;
    kidExam: KidExam;
    tags: string[];
}

export const QUALIFICATION_GENRES: QualificationGenre[] = [
    { id: "it", name: "IT・情報処理" },
    { id: "finance", name: "財務・金融・会計" },
    { id: "realestate", name: "不動産・建築・工事" },
    { id: "office", name: "事務・法務・経営" },
    { id: "culture", name: "基礎教育・趣味・教養" },
    { id: "medical", name: "医療・福祉・介護" },
    { id: "health", name: "健康・心理・スポーツ" },
    { id: "entertainment", name: "ご当地・娯楽" },
    { id: "industrial", name: "工業・技術・技能" },
    { id: "food", name: "調理・衛生・飲食" },
    { id: "beauty", name: "美容・ファッション" },
    { id: "creative", name: "デザイン・クリエイティブ" },
    { id: "language", name: "語学・国際ビジネス" },
    { id: "sustainable", name: "サステナビリティ・環境" },
    { id: "lifestyle", name: "生活・サービス" },
    { id: "transport", name: "車両・航空・船舶" },
    { id: "public", name: "公務員・教育" },
    { id: "aptitude", name: "適性検査" },
    { id: "official", name: "公式・国家資格" }
];

// --- Qualification Names Definition (10 per genre) ---
const QUAL_NAMES: Record<string, string[]> = {
    it: ["ITパスポート", "基本情報技術者", "応用情報技術者", "情報セキュリティマネジメント", "ネットワークスペシャリスト", "データベーススペシャリスト", "AIエンジニア検定", "クラウドプラクティショナー", "プロジェクトマネージャ", "ITストラテジスト"],
    finance: ["日商簿記3級", "日商簿記2級", "日商簿記1級", "FP技能士3級", "FP技能士2級", "FP技能士1級", "証券外務員二種", "証券外務員一種", "公認会計士", "税理士"],
    realestate: ["宅地建物取引士", "管理業務主任者", "マンション管理士", "賃貸不動産経営管理士", "不動産鑑定士", "建築士2級", "建築士1級", "インテリアコーディネーター", "土地家屋調査士", "測量士"],
    office: ["秘書検定3級", "秘書検定2級", "秘書検定1級", "ビジネス実務法務検定", "行政書士", "司法書士", "社会保険労務士", "中小企業診断士", "弁理士", "経営学検定"],
    culture: ["漢字検定10級", "漢字検定5級", "漢字検定1級", "数学検定", "歴史能力検定", "ニュース時事能力検定", "世界遺産検定3級", "世界遺産検定1級", "天文宇宙検定", "ことわざ検定"],
    medical: ["医療事務技能審査", "調剤薬局事務", "登録販売者", "介護職員初任者研修", "実務者研修", "介護福祉士", "社会福祉士", "看護師国家試験(模試)", "薬剤師国家試験(模試)", "医師国家試験(模試)"],
    health: ["メンタルヘルス・マネジメント", "心理カウンセラー", "スポーツリーダー", "食生活アドバイザー", "健康運動指導士", "ヨガインストラクター", "アロマテラピー検定", "カラーセラピスト", "睡眠健康指導士", "公認心理師"],
    entertainment: ["ご当地検定(東京)", "ご当地検定(大阪)", "ご当地検定(京都)", "映画検定", "音楽検定", "アニメ・マンガ検定", "テーマパーク検定", "鉄道検定", "お笑い検定", "アイドル検定"],
    industrial: ["危険物取扱者乙4", "危険物取扱者甲種", "電気工事士2種", "電気工事士1種", "ボイラー技士", "消防設備士", "エネルギー管理士", "電気主任技術者", "技術士", "自動車整備士"],
    food: ["調理師", "製菓衛生師", "食品衛生責任者", "フードコーディネーター", "野菜ソムリエ", "パンシェルジュ", "コーヒーマイスター", "利き酒師", "ソムリエ", "栄養士"],
    beauty: ["美容師(模試)", "理容師(模試)", "ネイリスト検定", "アロマテラピー検定", "色彩検定3級", "色彩検定1級", "パーソナルカラー検定", "化粧品検定", "ファッションビジネス検定", "きもの文化検定"],
    creative: ["Photoshopクリエイター", "Illustratorクリエイター", "Webデザイン技能検定", "CGクリエイター検定", "DTPエキスパート", "色彩検定UC級", "プロダクトデザイン検定", "インテリア設計士", "照明コンサルタント", "一級建築士(デザイン)"],
    language: ["英検5級", "英検3級", "英検1級", "TOEIC 500点コース", "TOEIC 800点コース", "中国語検定", "韓国語検定", "フランス語検定", "ドイツ語検定", "通訳案内士"],
    sustainable: ["環境社会検定(eco検定)", "SDGs検定", "ビオトープ管理士", "森林インストラクター", "気象予報士", "リサイクル管理士", "省エネ普及指導員", "自然観察指導員", "環境計量士", "CSR検定"],
    lifestyle: ["整理収納アドバイザー", "掃除能力検定", "洗濯ソムリエ", "葬祭ディレクター", "ブライダルコーディネーター", "マナー・プロトコール検定", "サービス接遇検定", "手話技能検定", "点字技能検定", "終活カウンセラー"],
    transport: ["普通自動車免許", "中型自動車免許", "大型自動車免許", "二輪免許", "特殊車両免許", "ドローン検定", "運行管理者", "自家用操縦士(飛行機)", "一級小型船舶", "潜水士"],
    public: ["公務員試験(初級)", "公務員試験(上級)", "教員採用試験(小)", "教員採用試験(中高)", "保育士", "司書", "学芸員", "警察官採用試験", "消防官採用試験", "自衛官候補生"],
    aptitude: ["IQテスト(初級)", "IQテスト(上級)", "EQテスト", "論理的思考力検定", "記憶力検定", "集中力検定", "空間認識力検定", "判断力検定", "創造力検定", "直感力検定"]
};

// --- Question Templates per Genre (Simplified Pool) ---
// Each template can generate variations or be used as is.
// To reach 1800 questions, we will generate procedural questions based on these topics.

const TOPICS: Record<string, { t: string, a: string, w: string[], h: string[] }[]> = {
    it: [
        { t: "パソコンの頭脳は？", a: "CPU", w: ["マウス", "キーボード", "モニタ"], h: ["人間でいうと脳みそ。", "計算をするところ。", "C__"] },
        { t: "インターネットを見るソフトは？", a: "ブラウザ", w: ["メモ帳", "ペイント", "電卓"], h: ["英語で閲覧するもの。", "ChromeやEdgeのこと。", "ブ___"] },
        { t: "マウスのクリック、カチカチするのは？", a: "ダブルクリック", w: ["トリプルクリック", "ジャンプ", "ダッシュ"], h: ["2回はやくおす。", "カチカチッ。", "ダ___クリック"] },
        { t: "データを保存するのは？", a: "HDD/SSD", w: ["CPU", "Wi-Fi", "電源"], h: ["情報をしまっておく箱。", "ハードディスク。", "ストレージともいう。"] },
        { t: "ウイルスから守るソフトは？", a: "ウイルス対策ソフト", w: ["ゲームソフト", "お絵かきソフト", "音楽ソフト"], h: ["悪いプログラムをやっつける。", "セキュリティソフト。", "盾のマークが多い。"] },
        { t: "キーボードの『A』の左は？", a: "Caps Lock", w: ["S", "Z", "Q"], h: ["大文字にするキー。", "Tabの下。", "C___ Lock"] },
        { t: "Wi-Fiのマークは？", a: "扇形", w: ["四角", "星型", "ハート"], h: ["電波が広がる形。", "携帯の左上にもある。", "おうぎのような形。"] },
        { t: "スマホのOSは？", a: "Android/iOS", w: ["Windows", "macOS", "Linux"], h: ["iPhoneに入っているのはiOS。", "ロボットのマークはAndroid。", "モバイル用OS。"] },
        { t: "プログラミング言語は？", a: "Python", w: ["Snake", "Cobra", "Viper"], h: ["ヘビの名前。", "AIによく使われる。", "P_____"] },
        { t: "ショートカット Ctrl+C は？", a: "コピー", w: ["貼り付け", "切り取り", "削除"], h: ["CopyのC。", "ふやすときにつかう。", "Ctrl+Vとセット。"] }
    ],
    finance: [
        { t: "100円のリンゴを2つ買いました。いくら？", a: "200円", w: ["100円", "300円", "150円"], h: ["100 + 100", "かけ算だよ。", "にひゃくえん。"] },
        { t: "貯金箱にお金を入れることを？", a: "貯金", w: ["借金", "募金", "送金"], h: ["お金を貯めること。", "ちょきん。", "銀行に預けるのもこれ。"] },
        { t: "日本のお金単位は？", a: "円", w: ["ドル", "ユーロ", "ポンド"], h: ["えん。", "¥マーク。", "丸い硬貨が多い。"] },
        { t: "銀行は何をするところ？", a: "お金を預ける", w: ["パンを買う", "電車に乗る", "勉強する"], h: ["お金のプロがいる場所。", "貯金したり借りたり。", "ATMがある。"] },
        { t: "1000円札に描かれているのは？", a: "北里柴三郎(新)", w: ["聖徳太子", "福沢諭吉", "夏目漱石"], h: ["お医者さん。", "2024年から新しくなった。", "髭を生やしている。"] },
        { t: "消費税、いま何パーセント？(標準)", a: "10%", w: ["5%", "8%", "100%"], h: ["じゅっぱーせんと。", "100円で10円かかる。", "食べ物は8%のこともある。"] },
        { t: "株を買うとどうなる？", a: "会社のオーナーになれる", w: ["会社に入れる", "給料がもらえる", "社長になれる"], h: ["会社の権利の一部。", "配当がもらえるかも。", "株主という。"] },
        { t: "安い時に買って高い時に売ると？", a: "儲かる", w: ["損する", "変わらない", "怒られる"], h: ["差額が利益になる。", "商売の基本。", "もうかる。"] },
        { t: "クレジットカードは？", a: "後払い", w: ["前払い", "無料", "プレゼント"], h: ["あとでお金が引き落とされる。", "信用で買い物する。", "使いすぎ注意。"] },
        { t: "レシートはいつ貰う？", a: "買い物をした後", w: ["買い物の前", "寝る前", "起きた後"], h: ["会計が終わった証拠。", "金額が書いてある。", "領収書ともいう。"] }
    ],
    realestate: [
        { t: "家を建てる人を？", a: "大工さん", w: ["お花屋さん", "八百屋さん", "魚屋さん"], h: ["木を切ったり組み立てたり。", "ヘルメットをかぶってる。", "だいくさん。"] },
        { t: "家の入り口をなんという？", a: "玄関", w: ["ベランダ", "屋根", "窓"], h: ["靴を脱ぐところ。", "げんかん。", "家の顔。"] },
        { t: "2階に上がるためのものは？", a: "階段", w: ["滑り台", "ロープ", "壁"], h: ["段々になっている。", "かいだん。", "エレベーターの代わり。"] },
        { t: "家賃ってなに？", a: "家を借りるお金", w: ["家を買うお金", "家を売るお金", "おやつ代"], h: ["毎月払う。", "借りている対価。", "やちん。"] },
        { t: "不動産屋さんの仕事は？", a: "家の売買・仲介", w: ["家を壊す", "家具を作る", "掃除する"], h: ["家を探している人を助ける。", "大家さんとお客さんを繋ぐ。", "お店に物件の紙が貼ってある。"] },
        { t: "日本で一番高いタワーは？", a: "スカイツリー", w: ["東京タワー", "通天閣", "富士山"], h: ["634メートル。", "東京にある。", "ムサシ。"] },
        { t: "和室にある敷物は？", a: "畳", w: ["カーペット", "フローリング", "タイル"], h: ["イグサのいい匂い。", "たたみ。", "正方形や長方形。"] },
        { t: "窓につけるカーテンの役割は？", a: "光や視線を遮る", w: ["音を大きくする", "風を起こす", "虫を呼ぶ"], h: ["夜に閉める。", "プライバシーを守る。", "日差しを避ける。"] },
        { t: "お風呂のお湯を沸かすのは？", a: "給湯器", w: ["冷蔵庫", "洗濯機", "掃除機"], h: ["ガスや電気を使う。", "お湯を作る機械。", "きゅうとうき。"] },
        { t: "間取り図の『LDK』のKは？", a: "キッチン", w: ["子供部屋", "書斎", "車庫"], h: ["料理をするところ。", "Kitchen。", "台所。"] }
    ]
    // ... 他のジャンルも同様に定義すべきだが、容量節約のため
    // 未定義ジャンルは「generic」なテンプレートから生成するロジックにする。
};

const GENERIC_TOPICS: { t: string, a: string, w: string[], h: string[] }[] = [
    { t: "まずは基本問題！1+1は？", a: "2", w: ["1", "3", "11"], h: ["指を使って数えてみよう。", "いち、に。", "2つ。"] },
    { t: "信号の『進め』は何色？", a: "青", w: ["赤", "黄", "黒"], h: ["空の色に近い。", "緑色に見えるけど青という。", "安全の色。"] },
    { t: "日本で一番大きい山は？", a: "富士山", w: ["高尾山", "阿蘇山", "六甲山"], h: ["3776メートル。", "静岡と山梨にある。", "頂上に雪があることが多い。"] },
    { t: "1日は何時間？", a: "24時間", w: ["12時間", "36時間", "100時間"], h: ["時計の針が2周する。", "朝と夜がある。", "にじゅうよじかん。"] },
    { t: "春の次はどの季節？", a: "夏", w: ["秋", "冬", "梅雨"], h: ["暑くなる。", "海に行く。", "セミが鳴く。"] },
    { t: "『ありがとうございます』と言うのは？", a: "お礼をする時", w: ["謝る時", "挨拶する時", "寝る時"], h: ["何かしてもらった時。", "感謝の気持ち。", "Thank you。"] },
    { t: "鉛筆を削る道具は？", a: "鉛筆削り", w: ["消しゴム", "定規", "ハサミ"], h: ["回して使う。", "尖らせる。", "えんぴつ〇〇〇。"] },
    { t: "本を借りられる場所は？", a: "図書館", w: ["映画館", "水族館", "体育館"], h: ["静かにするところ。", "たくさんの本がある。", "としょかん。"] },
    { t: "火事を消す車は？", a: "消防車", w: ["救急車", "パトカー", "タクシー"], h: ["赤い車。", "ホースがある。", "ウーウーと鳴る。"] },
    { t: "手紙に貼るものは？", a: "切手", w: ["シール", "テープ", "絆創膏"], h: ["お金の代わり。", "左上に貼る。", "きって。"] }
];

// --- Generator ---

function generateQualifications(): Qualification[] {
    const qualifications: Qualification[] = [];

    QUALIFICATION_GENRES.forEach(genre => {
        if (genre.id === 'official') return;
        const names = QUAL_NAMES[genre.id] || Array.from({ length: 10 }, (_, i) => `${genre.name}検定 ${10 - i}級`);
        const topics = TOPICS[genre.id] || GENERIC_TOPICS;

        names.forEach((name, index) => {
            // Level 1 to 10 (Derived from index 0 to 9)
            // If names are ordered easy to hard (or hard to easy), we should standardize.
            // Let's assume input names are sorted "Easy -> Hard" for simplicity logic below,
            // OR we just map index to difficulty.
            // Actually, usually 3級 -> 1級 is Harder. 
            // In QUAL_NAMES definition above, some are 3->1 (getting harder).

            const level = index + 1; // 1 to 10
            const difficultyStars = Math.min(5, Math.ceil(level / 2)); // 1,1,2,2,3,3,4,4,5,5
            const feeYen = level * 500 + 1000; // 1500, 2000, ... 6000

            // Generate 10 Questions
            const questions: KidExamQuestion[] = [];
            for (let q = 0; q < 10; q++) {
                // Pick topic cyclically or randomly
                const topicIdx = (index * 10 + q) % topics.length;
                const src = topics[topicIdx];

                // Randomize choices order
                const allChoices = [src.a, ...src.w];
                // Shuffle array (simple shuffle)
                const shuffledChoices = allChoices.map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);

                const answerIndex = shuffledChoices.indexOf(src.a);
                const wrongIndices = shuffledChoices.map((_, i) => i).filter(i => i !== answerIndex);

                questions.push({
                    id: `${genre.id}_${level}_q${q + 1}`,
                    type: 'mcq',
                    prompt: `Q${q + 1}. ${src.t}`,
                    choices: shuffledChoices.map(c => ({ label: c })),
                    answerIndex: answerIndex,
                    hints: [
                        { type: 'text', text: src.h[0] || "よく考えてみよう。" },
                        { type: 'eliminate', removeChoiceIndexes: wrongIndices.slice(0, 2) }, // Remove 2 wrong answers
                        { type: 'reveal', answer: src.a, explanation: src.h[2] || "これが正解です。" }
                    ]
                });
            }

            qualifications.push({
                id: `${genre.id}_${level}`, // simple ID
                genreId: genre.id,
                name: name,
                difficultyStars,
                feeYen,
                kidExam: {
                    recommendedAgeMin: 3 + Math.floor(level / 2),
                    questionCount: 10,
                    timeLimitSec: 300,
                    questions
                },
                tags: [genre.id, "kids"]
            });
        });
    });

    const masterList = Object.entries(MASTER_QUALIFICATIONS).map(([id, data]) => {
        const level = Math.min(10, Math.max(1, Math.ceil(data.cost / 10)));
        const difficultyStars = Math.min(5, Math.ceil(level / 2));
        const feeYen = data.cost * 10000;
        const questions: KidExamQuestion[] = [];

        for (let q = 0; q < 10; q += 1) {
            const src = GENERIC_TOPICS[(q + level) % GENERIC_TOPICS.length];
            const allChoices = [src.a, ...src.w];
            const shuffledChoices = allChoices.map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
            const answerIndex = shuffledChoices.indexOf(src.a);
            const wrongIndices = shuffledChoices.map((_, i) => i).filter(i => i !== answerIndex);

            questions.push({
                id: `official_${id}_q${q + 1}`,
                type: 'mcq',
                prompt: `Q${q + 1}. ${src.t}`,
                choices: shuffledChoices.map(c => ({ label: c })),
                answerIndex: answerIndex,
                hints: [
                    { type: 'text', text: src.h[0] || 'よく考えてみよう。' },
                    { type: 'eliminate', removeChoiceIndexes: wrongIndices.slice(0, 2) },
                    { type: 'reveal', answer: src.a, explanation: src.h[2] || 'これが正解です。' }
                ]
            });
        }

        return {
            id: `q_${id}`,
            genreId: 'official',
            name: data.name,
            difficultyStars,
            feeYen,
            kidExam: {
                recommendedAgeMin: 12,
                questionCount: 10,
                timeLimitSec: 300,
                questions
            },
            tags: ['official', 'license']
        };
    });

    qualifications.push(...masterList);

    return qualifications;
}

export const QUALIFICATIONS_DATA = generateQualifications();
