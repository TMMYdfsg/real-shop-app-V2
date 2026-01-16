import { GameState, User } from '@/types';

export function processGameTick(state: GameState): { newState: GameState, hasChanged: boolean } {
    const now = Date.now();
    let newState = { ...state };
    let hasChanged = false;

    // 時間経過の計算
    const elapsed = now - newState.lastTick;
    if (elapsed >= 1000) { // 1秒以上経過していたら更新
        newState.timeRemaining -= elapsed;
        newState.lastTick = now;
        hasChanged = true;

        // ターン切り替え
        if (newState.timeRemaining <= 0) {
            newState.timeRemaining = newState.settings.turnDuration;
            newState.isDay = !newState.isDay; // 昼夜逆転

            // ログ追加
            newState.news.unshift(`時間経過: ${newState.isDay ? '朝になりました ☀️' : '夜になりました 🌙'}`);
            if (newState.news.length > 50) newState.news.pop();

            // 夜になった時の処理 (自動徴収など)
            if (!newState.isDay) {
                // ここに夜のイベント処理を追加 (Day -> Night)
                // 例: 営業終了、精算など
                newState = processNightEvents(newState);
            } else {
                // 朝になった時の処理 (Night -> Day)
                newState.turn += 1; // 日付が進む
            }
        }
    }

    return { newState, hasChanged };
}

function processNightEvents(state: GameState): GameState {
    // 簡易的な夜間処理
    // 必要に応じて拡張: 利子計算、税金徴収など
    return state;
}
