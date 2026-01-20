import { Land } from '@/types';

// 日本の中心座標（デフォルト表示用）
export const BASE_LAT = 36.5;
export const BASE_LNG = 138.0;

// データ型定義
interface LocationData {
    id: string;
    name: string;
    center: { lat: number; lng: number };
    price: number;
    size: number; // km²
}

// 47都道府県データ
export const PREFECTURES: LocationData[] = [
    { id: 'hokkaido', name: '北海道', center: { lat: 43.06, lng: 141.35 }, price: 50000000, size: 83450 },
    { id: 'aomori', name: '青森県', center: { lat: 40.82, lng: 140.74 }, price: 15000000, size: 9646 },
    { id: 'iwate', name: '岩手県', center: { lat: 39.70, lng: 141.15 }, price: 15000000, size: 15275 },
    { id: 'miyagi', name: '宮城県', center: { lat: 38.27, lng: 140.87 }, price: 25000000, size: 7282 },
    { id: 'akita', name: '秋田県', center: { lat: 39.72, lng: 140.10 }, price: 12000000, size: 11638 },
    { id: 'yamagata', name: '山形県', center: { lat: 38.24, lng: 140.33 }, price: 12000000, size: 9323 },
    { id: 'fukushima', name: '福島県', center: { lat: 37.75, lng: 140.47 }, price: 18000000, size: 13784 },
    { id: 'ibaraki', name: '茨城県', center: { lat: 36.34, lng: 140.45 }, price: 30000000, size: 6097 },
    { id: 'tochigi', name: '栃木県', center: { lat: 36.57, lng: 139.88 }, price: 25000000, size: 6408 },
    { id: 'gunma', name: '群馬県', center: { lat: 36.39, lng: 139.06 }, price: 22000000, size: 6362 },
    { id: 'saitama', name: '埼玉県', center: { lat: 35.86, lng: 139.65 }, price: 80000000, size: 3797 },
    { id: 'chiba', name: '千葉県', center: { lat: 35.61, lng: 140.12 }, price: 75000000, size: 5157 },
    { id: 'tokyo', name: '東京都', center: { lat: 35.68, lng: 139.69 }, price: 500000000, size: 2194 },
    { id: 'kanagawa', name: '神奈川県', center: { lat: 35.45, lng: 139.64 }, price: 120000000, size: 2416 },
    { id: 'niigata', name: '新潟県', center: { lat: 37.90, lng: 139.02 }, price: 20000000, size: 12584 },
    { id: 'toyama', name: '富山県', center: { lat: 36.70, lng: 137.21 }, price: 18000000, size: 4248 },
    { id: 'ishikawa', name: '石川県', center: { lat: 36.59, lng: 136.63 }, price: 20000000, size: 4186 },
    { id: 'fukui', name: '福井県', center: { lat: 35.85, lng: 136.22 }, price: 15000000, size: 4190 },
    { id: 'yamanashi', name: '山梨県', center: { lat: 35.66, lng: 138.57 }, price: 25000000, size: 4465 },
    { id: 'nagano', name: '長野県', center: { lat: 36.65, lng: 138.18 }, price: 28000000, size: 13562 },
    { id: 'gifu', name: '岐阜県', center: { lat: 35.39, lng: 136.72 }, price: 22000000, size: 10621 },
    { id: 'shizuoka', name: '静岡県', center: { lat: 34.98, lng: 138.38 }, price: 45000000, size: 7777 },
    { id: 'aichi', name: '愛知県', center: { lat: 35.18, lng: 136.91 }, price: 100000000, size: 5173 },
    { id: 'mie', name: '三重県', center: { lat: 34.73, lng: 136.51 }, price: 25000000, size: 5774 },
    { id: 'shiga', name: '滋賀県', center: { lat: 35.00, lng: 135.87 }, price: 30000000, size: 4017 },
    { id: 'kyoto', name: '京都府', center: { lat: 35.02, lng: 135.76 }, price: 85000000, size: 4612 },
    { id: 'osaka', name: '大阪府', center: { lat: 34.69, lng: 135.52 }, price: 150000000, size: 1905 },
    { id: 'hyogo', name: '兵庫県', center: { lat: 34.69, lng: 135.18 }, price: 60000000, size: 8401 },
    { id: 'nara', name: '奈良県', center: { lat: 34.69, lng: 135.83 }, price: 35000000, size: 3691 },
    { id: 'wakayama', name: '和歌山県', center: { lat: 33.83, lng: 135.17 }, price: 18000000, size: 4725 },
    { id: 'tottori', name: '鳥取県', center: { lat: 35.50, lng: 134.24 }, price: 10000000, size: 3507 },
    { id: 'shimane', name: '島根県', center: { lat: 35.47, lng: 133.05 }, price: 10000000, size: 6708 },
    { id: 'okayama', name: '岡山県', center: { lat: 34.66, lng: 133.93 }, price: 28000000, size: 7114 },
    { id: 'hiroshima', name: '広島県', center: { lat: 34.40, lng: 132.46 }, price: 45000000, size: 8479 },
    { id: 'yamaguchi', name: '山口県', center: { lat: 34.19, lng: 131.47 }, price: 18000000, size: 6112 },
    { id: 'tokushima', name: '徳島県', center: { lat: 34.07, lng: 134.56 }, price: 12000000, size: 4147 },
    { id: 'kagawa', name: '香川県', center: { lat: 34.34, lng: 134.04 }, price: 15000000, size: 1877 },
    { id: 'ehime', name: '愛媛県', center: { lat: 33.84, lng: 132.77 }, price: 18000000, size: 5676 },
    { id: 'kochi', name: '高知県', center: { lat: 33.56, lng: 133.53 }, price: 10000000, size: 7103 },
    { id: 'fukuoka', name: '福岡県', center: { lat: 33.61, lng: 130.42 }, price: 70000000, size: 4986 },
    { id: 'saga', name: '佐賀県', center: { lat: 33.25, lng: 130.30 }, price: 12000000, size: 2441 },
    { id: 'nagasaki', name: '長崎県', center: { lat: 32.74, lng: 129.87 }, price: 18000000, size: 4132 },
    { id: 'kumamoto', name: '熊本県', center: { lat: 32.79, lng: 130.74 }, price: 25000000, size: 7409 },
    { id: 'oita', name: '大分県', center: { lat: 33.24, lng: 131.61 }, price: 18000000, size: 6341 },
    { id: 'miyazaki', name: '宮崎県', center: { lat: 31.91, lng: 131.42 }, price: 12000000, size: 7735 },
    { id: 'kagoshima', name: '鹿児島県', center: { lat: 31.56, lng: 130.56 }, price: 20000000, size: 9187 },
    { id: 'okinawa', name: '沖縄県', center: { lat: 26.21, lng: 127.68 }, price: 35000000, size: 2281 },
];

/**
 * ユーザー提供の国リスト
 * 座標は初期値 (0,0) とし、クライアント側でジオコーディングして補完する
 */
const RAW_COUNTRY_NAMES = [
    "日本",
    "アフガニスタン", "アクロティリおよびデケリア", "アセンション島", "アゾレス諸島", "アブハジア",
    "アメリカ合衆国", "アメリカ領ヴァージン諸島", "アメリカ領サモア", "アラブ首長国連邦", "アルジェリア",
    "アルゼンチン", "アルバ", "アルバニア", "アルメニア", "アンギラ", "アンゴラ", "アンティグア・バーブーダ",
    "アンドラ", "イエメン", "イギリス領インド洋地域", "イギリス領ヴァージン諸島", "イスラエル", "イタリア",
    "イラク", "イラン", "インド", "インドネシア", "ウガンダ", "ウクライナ", "ウズベキスタン", "ウルグアイ",
    "エクアドル", "エジプト", "エストニア", "エスワティニ", "エチオピア", "エリトリア", "エルサルバドル",
    "オーストラリア", "オーストリア", "オーランド諸島", "オマーン", "オランダ", "オランダ領カリブ", "ガーナ",
    "カーボベルデ", "ガイアナ", "カザフスタン", "カタール", "カナダ", "ガボン", "カメルーン", "ガンビア",
    "カンボジア", "北朝鮮", "北マケドニア", "ギニア", "ギニアビサウ", "キプロス", "キューバ", "キュラソー",
    "ギリシャ", "キリバス", "キルギス", "グアテマラ", "グアドループ", "グアム", "クウェート", "クック諸島",
    "グリーンランド", "グレナダ", "クロアチア", "ケイマン諸島", "ケニア", "ココス諸島", "コスタリカ", "コソボ",
    "コートジボワール", "コモロ", "コロンビア", "コンゴ共和国", "コンゴ民主共和国", "サウジアラビア",
    "サウスジョージア・サウスサンドウィッチ諸島", "サモア", "サントメ・プリンシペ", "ザンビア",
    "サンピエール島・ミクロン島", "サンマリノ", "シエラレオネ", "ジブチ", "ジブラルタル", "ジャマイカ",
    "ジョージア", "シリア", "シンガポール", "ジンバブエ", "スイス", "スウェーデン", "スーダン", "スコットランド",
    "スペイン", "スリナム", "スリランカ", "スロバキア", "スロベニア", "セーシェル", "セネガル", "セルビア",
    "セントクリストファー・ネービス", "セントビンセント・グレナディーン", "セントルシア", "セントヘレナ",
    "ソマリア", "ソロモン諸島", "タークス・カイコス諸島", "タイ", "台湾", "タジキスタン", "タンザニア",
    "チェコ", "チャド", "中央アフリカ", "中国", "チュニジア", "チリ", "ツバル", "デンマーク", "ドイツ",
    "トーゴ", "トケラウ", "ドミニカ国", "ドミニカ共和国", "トリニダード・トバゴ", "トルクメニスタン", "トルコ",
    "トンガ", "ナイジェリア", "ナウル", "ナミビア", "ニウエ", "ニカラグア", "ニジェール",
    "ニューカレドニア", "ニュージーランド", "ネパール", "ノーフォーク島", "ノルウェー", "ハイチ", "バーミューダ",
    "バチカン", "パキスタン", "パナマ", "バヌアツ", "バハマ", "パプアニューギニア", "パラオ", "パラグアイ",
    "バルバドス", "パレスチナ", "ハンガリー", "バングラデシュ", "東ティモール", "フィジー", "フィリピン",
    "フィンランド", "ブータン", "プエルトリコ", "フェロー諸島", "フォークランド諸島", "ブラジル", "フランス",
    "フランス領ギアナ", "フランス領ポリネシア", "ブルガリア", "ブルキナファソ", "ブルネイ", "ブルンジ",
    "ベトナム", "ベナン", "ベラルーシ", "ベリーズ", "ベルギー", "ペルー", "ボツワナ", "ボリビア", "ポーランド",
    "ポルトガル", "香港", "ホンジュラス", "マカオ", "マーシャル諸島", "マダガスカル", "マヨット", "マラウイ",
    "マリ", "マルタ", "マレーシア", "マン島", "ミクロネシア", "ミャンマー", "メキシコ", "モーリシャス",
    "モーリタニア", "モザンビーク", "モナコ", "モルディブ", "モルドバ", "モロッコ", "モンゴル", "モンテネグロ",
    "ヨルダン", "ラオス", "ラトビア", "リトアニア", "リビア", "リヒテンシュタイン", "リベリア", "ルーマニア",
    "ルクセンブルク", "ルワンダ", "レソト", "レバノン", "ロシア", "西サハラ"
];

// 日本（重複）はリストから除外して重複を防ぐ
// 主要国で座標がわかっているものをプリセットする（UX向上）
const KNOWN_COORDS: Record<string, { lat: number, lng: number }> = {
    "日本": { lat: BASE_LAT, lng: BASE_LNG },
    "アメリカ合衆国": { lat: 37.09, lng: -95.71 },
    "中国": { lat: 35.86, lng: 104.19 },
    "インド": { lat: 20.59, lng: 78.96 },
    "ブラジル": { lat: -14.23, lng: -51.92 },
    "ロシア": { lat: 61.52, lng: 105.31 },
    "カナダ": { lat: 56.13, lng: -106.34 },
    "オーストラリア": { lat: -25.27, lng: 133.77 },
    "イギリス": { lat: 55.37, lng: -3.43 },
    "フランス": { lat: 46.22, lng: 2.21 },
    "ドイツ": { lat: 51.16, lng: 10.45 },
    "イタリア": { lat: 41.87, lng: 12.56 },
    "大韓民国": { lat: 35.90, lng: 127.76 },
    "インドネシア": { lat: -0.78, lng: 113.92 },
    "メキシコ": { lat: 23.63, lng: -102.55 },
    "サウジアラビア": { lat: 23.88, lng: 45.07 },
    "南アフリカ": { lat: -30.55, lng: 22.93 },
    "トルコ": { lat: 38.96, lng: 35.24 },
    "アルゼンチン": { lat: -38.41, lng: -63.61 },
    "タイ": { lat: 15.87, lng: 100.99 },
    "ベトナム": { lat: 14.05, lng: 108.27 },
    "フィリピン": { lat: 12.87, lng: 121.77 },
    "マレーシア": { lat: 4.21, lng: 101.97 },
    "シンガポール": { lat: 1.35, lng: 103.81 },
    "スペイン": { lat: 40.46, lng: -3.74 },
    "ギリシャ": { lat: 39.07, lng: 21.82 },
    "エジプト": { lat: 26.82, lng: 30.80 },
    "ケニア": { lat: -0.02, lng: 37.90 },
    "イスラエル": { lat: 31.04, lng: 34.85 },
    "スイス": { lat: 46.81, lng: 8.22 },
    "オーストリア": { lat: 47.51, lng: 14.55 },
    "オランダ": { lat: 52.13, lng: 5.29 },
    "ベルギー": { lat: 50.50, lng: 4.46 },
    "スウェーデン": { lat: 60.12, lng: 18.64 },
    "ノルウェー": { lat: 60.47, lng: 8.46 },
    "フィンランド": { lat: 61.92, lng: 25.74 },
    "ニュージーランド": { lat: -40.90, lng: 174.88 },
    "台湾": { lat: 23.69, lng: 120.96 },
    "香港": { lat: 22.31, lng: 114.16 },
};

// 地域（リージョン）データ
export const REGIONS: LocationData[] = [
    { id: 'region_asia', name: 'アジア', center: { lat: 34.0, lng: 100.0 }, price: 0, size: 50000 },
    { id: 'region_oceania', name: 'オセアニア', center: { lat: -25.0, lng: 133.0 }, price: 0, size: 40000 },
    { id: 'region_europe', name: 'ヨーロッパ', center: { lat: 50.0, lng: 20.0 }, price: 0, size: 30000 },
    { id: 'region_africa', name: 'アフリカ', center: { lat: 1.0, lng: 20.0 }, price: 0, size: 40000 },
    { id: 'region_north_america', name: '北アメリカ', center: { lat: 45.0, lng: -100.0 }, price: 0, size: 40000 },
    { id: 'region_south_america', name: '南アメリカ', center: { lat: -15.0, lng: -60.0 }, price: 0, size: 30000 },
];

// 国名から地域への簡易マニュアルマッピング
const COUNTRY_REGION_MAP: Record<string, string> = {
    "日本": "region_asia", "中国": "region_asia", "インド": "region_asia", "インドネシア": "region_asia", "パキスタン": "region_asia",
    "バングラデシュ": "region_asia", "ロシア": "region_asia", "ベトナム": "region_asia", "フィリピン": "region_asia", "タイ": "region_asia",
    "韓国": "region_asia", "トルコ": "region_asia", "イラン": "region_asia", "サウジアラビア": "region_asia", "イスラエル": "region_asia",
    "オーストラリア": "region_oceania", "ニュージーランド": "region_oceania", "フィジー": "region_oceania", "パプアニューギニア": "region_oceania",
    "アメリカ合衆国": "region_north_america", "カナダ": "region_north_america", "メキシコ": "region_north_america", "キューバ": "region_north_america",
    "ブラジル": "region_south_america", "アルゼンチン": "region_south_america", "コロンビア": "region_south_america", "チリ": "region_south_america", "ペルー": "region_south_america",
    "イギリス": "region_europe", "フランス": "region_europe", "ドイツ": "region_europe", "イタリア": "region_europe", "スペイン": "region_europe",
    "ウクライナ": "region_europe", "ポーランド": "region_europe", "オランダ": "region_europe", "スイス": "region_europe",
    "ナイジェリア": "region_africa", "エジプト": "region_africa", "南アフリカ": "region_africa", "ケニア": "region_africa", "ルワンダ": "region_africa",
    "モロッコ": "region_africa", "エチオピア": "region_africa", "ガーナ": "region_africa"
};

const COUNTRIES: LocationData[] = RAW_COUNTRY_NAMES.map(name => {
    const known = KNOWN_COORDS[name];
    return {
        id: `country_${name}`,
        name: name,
        center: known ? known : { lat: 0, lng: 0 },
        price: 50000000,
        size: 10000
    };
});

// 簡易ポリゴンを生成（中心から矩形）
const generateLocationPolygon = (center: { lat: number; lng: number }, size: number): { lat: number; lng: number }[] => {
    const sizeScale = Math.sqrt(size) / 200;
    const latOffset = sizeScale * 0.5;
    const lngOffset = sizeScale * 0.6;

    return [
        { lat: center.lat - latOffset, lng: center.lng - lngOffset },
        { lat: center.lat - latOffset, lng: center.lng + lngOffset },
        { lat: center.lat + latOffset, lng: center.lng + lngOffset },
        { lat: center.lat + latOffset, lng: center.lng - lngOffset },
    ];
};

// 全世界の土地データを生成 (キャッシュして再利用)
let _cachedLands: Land[] | null = null;

export const generateLands = (): Land[] => {
    if (_cachedLands) return _cachedLands;

    const allLocations = [...REGIONS, ...PREFECTURES, ...COUNTRIES];
    _cachedLands = allLocations.map(loc => {
        // 地域属性を付与
        const regionId = loc.id.startsWith('region_') ? loc.id : (COUNTRY_REGION_MAP[loc.name] || (loc.id.length < 10 && !loc.id.startsWith('country_') ? 'region_asia' : undefined));

        return {
            id: loc.id,
            ownerId: null,
            price: loc.price,
            location: loc.center,
            address: loc.name,
            isForSale: loc.id.startsWith('region_') ? false : true, // 地域そのものは販売しない
            placeId: undefined,
            polygon: generateLocationPolygon(loc.center, loc.size),
            size: loc.size,
            zoning: 'mixed' as const,
            // @ts-ignore
            regionId: regionId
        };
    });
    return _cachedLands;
};

// グリッドベースのID生成（後方互換性のため残す）
export const getGridId = (row: number, col: number): string => `${row}-${col}`;

// Land配列をGeoJSON FeatureCollectionに変換
export const landsToGeoJSON = (lands: Land[]): any => {
    return {
        type: 'FeatureCollection',
        features: lands.map(land => ({
            type: 'Feature',
            properties: {
                id: land.id,
                price: land.price,
                ownerId: land.ownerId,
                address: land.address,
                isForSale: land.isForSale
            },
            geometry: {
                type: 'Polygon',
                coordinates: [land.polygon?.map(p => [p.lng, p.lat]) || []]
            }
        }))
    };
};
