import { Land, Place, PlaceType } from '@/types';

// 東京駅周辺の座標を基準とする
const BASE_LAT = 35.681236;
const BASE_LNG = 139.767125;
const GRID_SIZE_LAT = 0.001; // 約110m
const GRID_SIZE_LNG = 0.001; // 約90m
const GRID_ROWS = 20; // 20x20のグリッド = 400区画
const GRID_COLS = 20;

// グリッドIDの生成 (例: "10-15")
export const getGridId = (row: number, col: number): string => `${row}-${col}`;

// 座標からグリッド情報を生成
export const generateLands = (): Land[] => {
    const lands: Land[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const lat = BASE_LAT + (r - GRID_ROWS / 2) * GRID_SIZE_LAT;
            const lng = BASE_LNG + (c - GRID_COLS / 2) * GRID_SIZE_LNG;

            // 中心に近いほど高い（簡易ロジック）
            const distFromCenter = Math.sqrt(Math.pow(r - GRID_ROWS / 2, 2) + Math.pow(c - GRID_COLS / 2, 2));
            const basePrice = 10000000; // 1000万円
            const price = Math.floor(basePrice * (1.5 - (distFromCenter / 20)));

            // Leaflet用のポリゴン座標生成 (lat, lng形式)
            const latOffset = GRID_SIZE_LAT / 2;
            const lngOffset = GRID_SIZE_LNG / 2;
            const polygon = [
                { lat: lat - latOffset, lng: lng - lngOffset }, // SW
                { lat: lat - latOffset, lng: lng + lngOffset }, // SE
                { lat: lat + latOffset, lng: lng + lngOffset }, // NE
                { lat: lat + latOffset, lng: lng - lngOffset }, // NW
            ];

            lands.push({
                id: getGridId(r, c),
                ownerId: null, // 初期はすべて公有地
                price: price > 1000000 ? price : 1000000,
                location: { lat, lng },
                address: `東京都千代田区丸の内 ${r + 1}-${c + 1}`,
                isForSale: true,
                placeId: undefined,
                polygon: polygon
            });
        }
    }
    return lands;
};

// 座標から矩形ポリゴンを生成
const getPolygonCoords = (centerLat: number, centerLng: number): number[][][] => {
    const latOffset = GRID_SIZE_LAT / 2;
    const lngOffset = GRID_SIZE_LNG / 2;
    return [[
        [centerLng - lngOffset, centerLat - latOffset], // SW
        [centerLng + lngOffset, centerLat - latOffset], // SE
        [centerLng + lngOffset, centerLat + latOffset], // NE
        [centerLng - lngOffset, centerLat + latOffset], // NW
        [centerLng - lngOffset, centerLat - latOffset]  // SW (Close)
    ]];
};

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
                coordinates: getPolygonCoords(land.location.lat, land.location.lng)
            }
        }))
    };
};

