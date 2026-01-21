/**
 * 振動アダプタインターフェース
 * プラットフォーム間の振動機能を抽象化
 */
export interface VibrationAdapter {
    /**
     * 振動パターンを実行
     * @param pattern - 振動パターン（ミリ秒単位の配列）[振動, 休止, 振動, ...]
     * @param intensity - オプションの強度配列（0-255）
     */
    vibrate(pattern: readonly number[], intensity?: readonly number[]): void;

    /**
     * 振動を停止
     */
    stop(): void;

    /**
     * デバイスが振動をサポートしているか確認
     */
    isSupported(): boolean;
}

/**
 * Web標準のVibration APIを使用するアダプタ
 */
export class WebVibrationAdapter implements VibrationAdapter {
    vibrate(pattern: readonly number[]): void {
        if (this.isSupported()) {
            navigator.vibrate(pattern as number[]);
        }
    }

    stop(): void {
        if (this.isSupported()) {
            navigator.vibrate(0);
        }
    }

    isSupported(): boolean {
        return typeof navigator !== 'undefined' && 'vibrate' in navigator;
    }
}

/**
 * Capacitorを使用したAndroid向け振動アダプタ
 * ネイティブ振動機能へのブリッジを提供
 */
export class AndroidVibrationAdapter implements VibrationAdapter {
    private lastVibrationTime = 0;
    private minInterval = 100; // デバウンス間隔（ミリ秒）

    async vibrate(pattern: readonly number[], intensity?: readonly number[]): Promise<void> {
        const now = Date.now();

        // デバウンス処理：連続した振動リクエストを制限
        if (now - this.lastVibrationTime < this.minInterval) {
            return;
        }
        this.lastVibrationTime = now;

        try {
            // Capacitor Haptics Pluginを動的インポート
            const { Haptics, ImpactStyle } = await import('@capacitor/haptics');

            // パターンが単一の場合は単純な振動
            if (pattern.length === 1) {
                await Haptics.impact({ style: ImpactStyle.Medium });
                return;
            }

            // パターン振動を実行
            for (let i = 0; i < pattern.length; i++) {
                if (i % 2 === 0 && pattern[i] > 0) {
                    // 振動フェーズ
                    await Haptics.impact({ style: ImpactStyle.Heavy });
                }
                // 指定時間待機
                await this.delay(pattern[i]);
            }
        } catch (error) {
            // Capacitor Hapticsが利用できない場合はWebフォールバック
            console.warn('Capacitor Haptics unavailable, falling back to Web API:', error);
            if ('vibrate' in navigator) {
                navigator.vibrate(pattern as number[]);
            }
        }
    }

    async stop(): Promise<void> {
        try {
            const { Haptics } = await import('@capacitor/haptics');
            // Capacitor Hapticsには明示的なstopがないため、
            // 0ms振動で停止を試みる
            navigator.vibrate?.(0);
        } catch {
            navigator.vibrate?.(0);
        }
    }

    isSupported(): boolean {
        // Capacitor環境かWeb Vibration APIがあれば対応
        return typeof window !== 'undefined' &&
            (window.hasOwnProperty('Capacitor') || 'vibrate' in navigator);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 現在のプラットフォームに適したアダプタを取得
 */
export function getVibrationAdapter(): VibrationAdapter {
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
        return new AndroidVibrationAdapter();
    }
    return new WebVibrationAdapter();
}

/**
 * 事前定義された振動パターン
 */
export const VibrationPatterns = {
    // 短いタップ感
    tap: [50],
    // 成功フィードバック
    success: [50, 100, 50],
    // エラーフィードバック
    error: [100, 50, 100, 50, 100],
    // 通知
    notification: [200, 100, 200],
    // ゲーム：コイン獲得
    coinCollect: [30, 30, 30],
    // ゲーム：レベルアップ
    levelUp: [50, 50, 100, 50, 200],
    // ゲーム：衝突
    impact: [150],
} as const;
