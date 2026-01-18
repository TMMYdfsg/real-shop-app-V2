import fs from 'fs';
import path from 'path';
import { GameState } from '@/types';
import { generateLands, BASE_LAT, BASE_LNG, GRID_SIZE_LAT, GRID_SIZE_LNG, GRID_ROWS, GRID_COLS } from '@/lib/cityData';

const DATA_FILE_PATH = path.join(process.cwd(), 'data.json');

const INITIAL_STATE: GameState = {
    users: [],
    stocks: [
        { id: 's1', name: 'テック・フューチャー', price: 1000, previousPrice: 1000, volatility: 0.1, isForbidden: false },
        { id: 's2', name: 'ハッピー・フーズ', price: 500, previousPrice: 500, volatility: 0.05, isForbidden: false },
        { id: 's3', name: 'ミラクル建設', price: 800, previousPrice: 800, volatility: 0.08, isForbidden: false },
        // Forbidden Stocks
        { id: 'f1', name: 'シャドウ・コーポレーション', price: 5000, previousPrice: 5000, volatility: 0.5, isForbidden: true },
        { id: 'f2', name: 'ブラックバイオ研究所', price: 2000, previousPrice: 2000, volatility: 0.8, isForbidden: true },
        { id: 'f3', name: 'ネオカルト証券', price: 10000, previousPrice: 10000, volatility: 1.0, isForbidden: true },
    ],
    requests: [],
    marketStatus: 'open',
    turn: 1,
    isDay: true,
    isTimerRunning: true,
    lastTick: Date.now(),
    timeRemaining: 5 * 60 * 1000, // 5 minutes
    settings: {
        taxRate: 0.1,
        insuranceRate: 100,
        interestRate: 0.05,
        salaryAutoSafeRate: 0.5,
        turnDuration: 5 * 60 * 1000 // 5 minutes
    },
    news: [],
    roulette: {
        items: [
            { id: 1, text: '宝くじ 1等 (1000枚)', effect: 'bonus_1000', weight: 1 },
            { id: 2, text: '宝くじ はずれ', effect: 'none', weight: 5 },
            { id: 3, text: '風邪をひいた (治療費 -50)', effect: 'sick_cold', weight: 3 },
            { id: 4, text: '臨時ボーナス (300枚)', effect: 'bonus_300', weight: 2 },
            { id: 5, text: '財布を落とした (-100枚)', effect: 'lost_100', weight: 3 },
            { id: 6, text: '人気者になった (人気+10)', effect: 'pop_up', weight: 2 },
        ],
        currentResult: null
    },
    season: 'spring',
    products: [],
    activeNPCs: [],
    npcTemplates: [
        {
            id: 'guest',
            name: '一般客',
            description: '普通のお客さん。何か買ってくれるかも？',
            duration: 60 * 1000,
            spawnRate: 30, // 30% per check
            actionType: 'buy',
            minPayment: 100,
            maxPayment: 500
        },
        {
            id: 'thief',
            name: '怪しい男',
            description: 'キョロキョロしている...泥棒かもしれない。',
            duration: 3 * 60 * 1000,
            spawnRate: 5,
            actionType: 'steal_money',
            minStealAmount: 1000,
            maxStealAmount: 5000
        },
        {
            id: 'scammer',
            name: '自称投資家',
            description: 'うまい儲け話を持ちかけてくる。',
            duration: 2 * 60 * 1000,
            spawnRate: 5,
            actionType: 'scam',
            minStealAmount: 2000,
            maxStealAmount: 10000
        },
        {
            id: 'rich_guest',
            name: '富豪',
            description: '金払いの良いお客さん。期待大！',
            duration: 60 * 1000,
            spawnRate: 2,
            actionType: 'buy',
            minPayment: 5000,
            maxPayment: 20000
        }
    ],
    activeEvents: [], // アクティブなイベント
    properties: [], // 不動産リスト

    // City Simulator Data
    lands: generateLands(), // 初期化
    places: [
        {
            id: 'place_dealer',
            ownerId: 'system',
            name: 'カーディーラー・丸の内',
            type: 'retail',
            location: {
                lat: BASE_LAT + (5 - GRID_ROWS / 2) * GRID_SIZE_LAT,
                lng: BASE_LNG + (5 - GRID_COLS / 2) * GRID_SIZE_LNG,
                address: '東京都千代田区丸の内 6-6',
                landId: '5-5'
            },
            status: 'active',
            level: 3,
            employees: [],
            stats: { capital: 100000000, sales: 0, expenses: 0, profit: 0, reputation: 5, customerCount: 0 },
            licenses: [],
            insurances: []
        },
        {
            id: 'place_homecenter',
            ownerId: 'system',
            name: 'ホームセンター・丸の内',
            type: 'retail',
            location: {
                lat: BASE_LAT + (5 - GRID_ROWS / 2) * GRID_SIZE_LAT,
                lng: BASE_LNG + (15 - GRID_COLS / 2) * GRID_SIZE_LNG,
                address: '東京都千代田区丸の内 6-16',
                landId: '5-15'
            },
            status: 'active',
            level: 2,
            employees: [],
            stats: { capital: 50000000, sales: 0, expenses: 0, profit: 0, reputation: 5, customerCount: 0 },
            licenses: [],
            insurances: []
        }
    ],

    // Phase 4: Simulation
    economy: {
        status: 'normal',
        interestRate: 5.0, // 5%
        priceIndex: 100,
        marketTrend: 'stable',
        taxRateAdjust: 0,
        lastUpdateTurn: 0
    },
    environment: {
        weather: 'sunny',
        temperature: 20,
        season: 'spring',
        cityInfrastructure: {
            power: 100,
            water: 100,
            network: 100
        },
        securityLevel: 100
    },
    eventRevision: 0,
    processedIdempotencyKeys: []
};

// データを読み込む
export function getGameState(): GameState {
    try {
        if (!fs.existsSync(DATA_FILE_PATH)) {
            // 初期状態の保存
            saveGameState(INITIAL_STATE);
            return INITIAL_STATE;
        }
        const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        const state = JSON.parse(data);

        // マイグレーション / 初期化漏れ対策
        if (!state.lands || state.lands.length === 0) {
            state.lands = generateLands();
        }
        if (!state.places || state.places.length === 0) {
            state.places = INITIAL_STATE.places;
        }
        // Phase 4 Migration
        if (!state.economy) {
            state.economy = INITIAL_STATE.economy;
        }
        if (!state.environment) {
            state.environment = INITIAL_STATE.environment;
        }
        if (state.eventRevision === undefined) {
            state.eventRevision = 0;
        }
        if (!state.processedIdempotencyKeys) {
            state.processedIdempotencyKeys = [];
        }

        return state;
    } catch (error) {
        console.error('Failed to read game state:', error);
        return INITIAL_STATE;
    }
}


// データを保存する
export function saveGameState(state: GameState): void {
    try {
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
    } catch (error) {
        console.error('Failed to save game state:', error);
    }
}

// 部分更新ユーティリティ (Race condition対策は簡易的)
export function updateGameState(updater: (state: GameState) => GameState): GameState {
    const currentState = getGameState();
    const newState = updater(currentState);

    // Auto-increment revision on any update
    newState.eventRevision = (newState.eventRevision || 0) + 1;

    saveGameState(newState);
    return newState;
}
