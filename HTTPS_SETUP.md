# HTTPS起動方法ガイド

このプロジェクトはローカル開発環境でHTTPSをサポートしています。

## 📋 前提条件

- Node.js 18以上がインストール済みであること
- `npm`または`yarn`がインストール済みであること

## 🚀 HTTPS起動方法

### 1. パッケージのインストール

`package.json` に `local-ssl-proxy` が既に依存関係として含まれています。

```bash
npm install
# または
yarn install
```

### 2. HTTPS開発サーバーの起動

#### オプションA: npm スクリプトを使用（推奨）

```bash
npm run dev:ssl
```

このコマンドは以下を実行します：
- ポート3001でHTTPSプロキシを起動
- ポート3000でNext.jsアプリケーションを起動
- 自動的にHTTPSリクエストをHTTPアプリケーションにリダイレクト

#### オプションB: 手動で起動

ターミナル1でNext.jsアプリケーションを起動：
```bash
npm run dev
```

ターミナル2でSSL プロキシを起動：
```bash
npx local-ssl-proxy --source 3001 --target 3000 --hostname 0.0.0.0
```

### 3. アプリケーションへのアクセス

- **HTTPS**: `https://localhost:3001`
- **HTTP** (ローカルのみ): `http://localhost:3000`

> **注意**: ブラウザが自己署名証明書を信頼しない場合があります。
> その場合は、ブラウザの警告を無視して続行してください（開発環境のみ）。

## 🔒 SSL証明書について

`local-ssl-proxy` は以下のディレクトリに自動的にSSL証明書を生成します：

- **Windows**: `%APPDATA%\local-ssl-proxy`
- **macOS/Linux**: `~/.local-ssl-proxy`

最初の起動時に証明書が生成される場合、2分程度待機してください。

## 📱 モバイルデバイスからのアクセス

モバイルデバイス（スマートフォン・タブレット）からアクセスする場合：

1. **PC側の設定**:
   - `local-ssl-proxy` を以下のように起動：
     ```bash
     npx local-ssl-proxy --source 3001 --target 3000 --hostname 0.0.0.0
     ```
   - `--hostname 0.0.0.0` は外部からのアクセスを許可します

2. **モバイルデバイス側**:
   - PCのIPアドレスを確認（例: `192.168.1.100`）
   - ブラウザで `https://192.168.1.100:3001` にアクセス
   - SSL警告が出た場合は「続行」をタップ

## 🔧 トラブルシューティング

### ポートが既に使用されている場合

別のアプリケーションがポート3000またはポート3001を使用している可能性があります。

**解決方法**:
```bash
# ポート3001の別の番号を指定
npx local-ssl-proxy --source 3002 --target 3000 --hostname 0.0.0.0
```

### 証明書エラーが発生する場合

SSL証明書を再生成します：

**Windows**:
```powershell
Remove-Item $env:APPDATA\local-ssl-proxy -Recurse -Force
npm run dev:ssl
```

**macOS/Linux**:
```bash
rm -rf ~/.local-ssl-proxy
npm run dev:ssl
```

### HTTPS接続がリセットされる場合

1. Node.jsプロセスを確認：
   ```bash
   # macOS/Linux
   lsof -i :3000
   lsof -i :3001
   
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

2. プロセスをキル：
   ```bash
   # macOS/Linux (PIDを確認後)
   kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

3. 再度起動：
   ```bash
   npm run dev:ssl
   ```

## 📚 参考資料

- [local-ssl-proxy GitHub](https://github.com/cameronhimself/local-ssl-proxy)
- [Next.js開発ドキュメント](https://nextjs.org/docs)
- [Capacitor HTTPS設定](https://capacitorjs.com/)

## ⚡ Androidアプリでの使用

Capacitorでビルドされたゲーム・アプリケーションがHTTPSで起動する場合：

1. `capacitor.config.ts` でサーバーURLを設定：
   ```typescript
   const config: CapacitorConfig = {
     appId: 'com.example.app',
     appName: 'Real Shop App',
     webDir: 'out', // Next.jsの出力ディレクトリ
     server: {
       url: 'https://your-ip:3001',
       cleartext: false, // HTTPSを強制
     }
   };
   ```

2. `npm run android:build` でビルド

---

**質問がある場合は、プロジェクトメンテナーにお問い合わせください。**
