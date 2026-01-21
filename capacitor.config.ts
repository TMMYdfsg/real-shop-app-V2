import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.realshop.game',
    appName: 'Real Shop App',
    webDir: 'out', // パスをルートからの相対パスに修正

    // Android固有設定
    android: {
        // WebViewのデバッグを有効化（開発時のみ）
        webContentsDebuggingEnabled: true,
        // スプラッシュスクリーンの背景色
        backgroundColor: '#1a1a2e',
        // 画面の向きを縦に固定
        initialFocus: true,
    },

    // サーバー設定（開発時はライブリロード可能）
    server: {
        // 開発時のみ有効化
        // url: 'http://localhost:3000',
        // cleartext: true,
    },

    // プラグイン設定
    plugins: {
        Haptics: {
            // 振動機能を使用
        },
    },
};

export default config;
