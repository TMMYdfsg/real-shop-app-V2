import fs from 'fs';
import path from 'path';
import { GameState } from '@/types';

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
    products: []
};

// データを読み込む
export function getGameState(): GameState {
    try {
        if (!fs.existsSync(DATA_FILE_PATH)) {
            saveGameState(INITIAL_STATE);
            return INITIAL_STATE;
        }
        const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        return JSON.parse(data);
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
    saveGameState(newState);
    return newState;
}
