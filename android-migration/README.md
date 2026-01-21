# Android Migration - Real Shop App

このフォルダはReal Shop AppをAndroid向けにビルドするためのCapacitor関連ファイルを格納します。

## 前提条件

- Node.js 18以上
- Android Studio（最新版推奨）
- Android SDK（API Level 24以上）
- Java 17以上

## セットアップ手順

### 1. 静的エクスポートビルド

まず、Next.jsアプリを静的HTMLとしてエクスポートします：

```powershell
# プロジェクトルートで実行
npm run build:static
```

### 2. Capacitor Androidプラットフォームの追加

```powershell
# android-migrationフォルダに移動
cd android-migration

# Androidプラットフォームを追加（初回のみ）
npx cap add android

# Webアセットを同期
npx cap sync android
```

### 3. Android Studioで開く

```powershell
npx cap open android
```

### 4. ビルドと実行

1. Android Studioで「Run」ボタンをクリック
2. エミュレータまたは実機を選択
3. アプリが起動します

## 開発時のライブリロード

開発中にライブリロードを使用するには：

1. `capacitor.config.ts`の`server`セクションを有効化：
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:3000',
     cleartext: true,
   },
   ```

2. 開発サーバーを起動：
   ```powershell
   npm run dev
   ```

3. アプリを再ビルド

## フォルダ構成

```
android-migration/
├── capacitor.config.ts  # Capacitor設定
├── android/              # Androidネイティブプロジェクト（自動生成）
└── README.md            # このファイル
```

## 振動機能の使用

振動アダプタは`src/lib/vibration`に配置されています：

```typescript
import { getVibrationAdapter, VibrationPatterns } from '@/lib/vibration';

const vibration = getVibrationAdapter();

// 成功フィードバック
vibration.vibrate(VibrationPatterns.success);

// カスタムパターン
vibration.vibrate([100, 50, 200]);

// 振動停止
vibration.stop();
```

## トラブルシューティング

### ビルドエラー
- `npx cap sync android`を再実行
- Android StudioでプロジェクトをClean & Rebuild

### 振動が動作しない
- 実機でテスト（エミュレータでは振動不可）
- アプリの振動権限を確認
