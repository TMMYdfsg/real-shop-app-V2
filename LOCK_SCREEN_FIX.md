# ロック画面問題トラブルシューティングガイド

## 📋 問題の詳細

**症状**: アプリをダウンロード/インストールしようとするとロック画面に戻されてしまう

このガイドは、Capacitorを使用したAndroidアプリケーションで発生するロック画面関連の問題を解決するためのものです。

---

## 🔍 原因の特定

### 1. **セキュリティ認証の失敗**
- パスコード・生体認証が要求されているが、認証に失敗している
- ロック画面のタイムアウトで認証セッションが無効化されている

### 2. **インテント（画面遷移）の干渉**
- Androidの`ACTION_DEVICE_ADMIN_ENABLE`または他のシステムインテントが競合
- アプリのActivity設定がロック画面ポリシーと競合している

### 3. **Capacitor設定の問題**
- `capacitor.config.ts`のセキュリティ設定が不適切
- AndroidManifestのパーミッション設定が不完全

---

## ✅ 解決方法

### ステップ1: AndroidManifest.xmlを確認・修正

**ファイルパス**: `android/app/src/main/AndroidManifest.xml`

以下の設定を確認してください：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    android:versionCode="1"
    android:versionName="1.0">

    <!-- 必須パーミッション -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- ロック画面アクセス用（ダウンロード機能用） -->
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    
    <!-- デバイス管理関連（オプション、不要な場合は削除） -->
    <!-- <uses-permission android:name="android.permission.MANAGE_ACCOUNTS" /> -->

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:debuggable="false">

        <activity
            android:name="com.getcapacitor.MainActivity"
            android:label="@string/title_activity_main"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme"
            android:windowSoftInputMode="adjustResize">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <!-- ロック画面を越えてアクティビティを表示する場合の設定 -->
        <activity
            android:name="com.getcapacitor.MainActivity"
            android:showWhenLocked="true"
            android:turnScreenOn="true" />

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
```

**重要な属性**:
- `android:showWhenLocked="true"` - ロック画面の上にアクティビティを表示
- `android:turnScreenOn="true"` - ロック画面時に画面をオン

### ステップ2: capacitor.config.tsを確認・修正

**ファイルパス**: `capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.realshopapp',
  appName: 'Real Shop App',
  webDir: 'out', // Next.js の出力ディレクトリ
  server: {
    androidScheme: 'https',
    url: process.env.CAPACITOR_SERVER_URL || 'https://localhost:3001',
    cleartext: false, // HTTPSを強制
    useProxy: false, // プロキシを無効化
    allowNavigation: ['*'], // 必要に応じてナビゲーションを許可
  },
  android: {
    allowMixedContent: false, // HTTPSのみを許可
    useLegacyBridge: false, // 最新のCapacitor APIを使用
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#ffffff',
      androidScaleType: 'centerInside',
      showSpinner: false,
    },
  },
};

export default config;
```

### ステップ3: アクティビティの初期化を遅延させる

**ファイルパス**: `android/app/src/main/java/com/example/MainActivity.java`

```java
package com.example.realshopapp;

import android.content.Intent;
import android.os.Bundle;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ロック画面が有効な場合、スクリーンを点灯
        if (isLocked()) {
            getWindow().addFlags(
                android.view.WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                android.view.WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
            );
        }
    }

    private boolean isLocked() {
        android.app.KeyguardManager km = (android.app.KeyguardManager) 
            getSystemService(android.content.Context.KEYGUARD_SERVICE);
        return km != null && km.isKeyguardLocked();
    }
}
```

### ステップ4: ダウンロード機能を修正

アプリダウンロード機能を実装する際の改善例：

```typescript
// src/lib/downloadManager.ts
export async function downloadAppSafely() {
    try {
        // ロック画面チェック
        const isLocked = await checkDeviceLocked();
        
        if (isLocked) {
            console.warn('[Download] Device is locked. Waiting...');
            // 1秒待機してから再試行
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // ダウンロード処理
        const response = await fetch('/api/download/app', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });

        if (!response.ok) {
            throw new Error('Download failed');
        }

        // ファイル保存処理（Capacitor使用）
        const blob = await response.blob();
        await saveFile(blob, 'real-shop-app.apk');

        return { success: true };
    } catch (error) {
        console.error('[Download] Error:', error);
        throw error;
    }
}

async function checkDeviceLocked(): Promise<boolean> {
    try {
        const { locked } = await App.getState();
        return locked ?? false;
    } catch {
        return false;
    }
}
```

### ステップ5: ビルドと再デプロイ

```bash
# キャッシュをクリア
rm -rf android/app/build

# 再ビルド
npm run android:build

# または手動でビルド
cd android
./gradlew clean build
cd ..

# Emulatorまたはデバイスにインストール
npx cap run android
```

---

## 🧪 テスト方法

### ロック画面でのテスト

1. **デバイスをロック**:
   ```bash
   adb shell input keyevent 26  # スクリーンオフ
   ```

2. **アプリを起動**:
   ```bash
   adb shell am start -W com.example.realshopapp/.MainActivity
   ```

3. **ロック画面でダウンロード機能をテスト**:
   - デバイスがロックされた状態でダウンロードボタンをタップ
   - ロック画面を越えてアクティビティが表示されるか確認

### ロック状態の確認

```bash
# ロック状態を確認
adb shell "dumpsys window keyguard | grep isShowing"

# 出力例:
# mIsShowing=false  (ロックされていない)
# mIsShowing=true   (ロックされている)
```

---

## 📱 デバイス別の考慮事項

### Samsung デバイス

Samsung Knox セキュリティがロック画面ポリシーに干渉する可能性：

```xml
<!-- AndroidManifest.xml -->
<application>
    <!-- Knox保護を無視する設定 -->
    <meta-data
        android:name="com.samsung.knox.protection"
        android:value="false" />
</application>
```

### Google Pixel デバイス

Material Design 3のセキュリティポリシーに準拠：

```java
// MainActivity.java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Material Design 3のロック画面対応
    setShowWhenLocked(true);
    setTurnScreenOn(true);
}
```

---

## 🐛 デバッグのコツ

### ログを確認

```bash
# リアルタイムログを表示
adb logcat | grep -i "MainActivity\|keyguard\|lock"

# ファイルに保存
adb logcat > logcat.txt
```

### 一般的なエラーメッセージと対応

| エラー | 原因 | 解決方法 |
|-------|------|--------|
| `Permission denied` | パーミッションが不足 | AndroidManifestに`WRITE_EXTERNAL_STORAGE`を追加 |
| `Activity not found` | インテントが不正 | `setShowWhenLocked(true)`を設定 |
| `KeyguardLocked exception` | ロック状態の判定失敗 | `KeyguardManager`を正しく使用 |

---

## 📞 サポート

問題が解決しない場合：

1. **ログファイルを収集**:
   ```bash
   adb logcat > debug_logs.txt
   ```

2. **デバイス情報を確認**:
   ```bash
   adb shell getprop | grep -E "ro.build|ro.version"
   ```

3. **プロジェクトメンテナーに報告**

---

**最終更新**: 2026年1月23日
