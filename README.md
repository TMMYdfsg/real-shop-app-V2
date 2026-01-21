This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## デザインシステム (UI統一ルール)

### トークン一覧 (抜粋)

`src/styles/tokens.css` で定義しています。

- サーフェス: `--bg`, `--surface`, `--surface-2`, `--surface-3`
- テキスト: `--text`, `--text-muted`
- ボーダー: `--border`, `--border-strong`
- ブランド: `--primary`, `--primary-2`, `--primary-contrast`
- ステータス: `--success`, `--warning`, `--danger`, `--info`
- 角丸: `--r-xs` 〜 `--r-xl`
- 余白: `--s-1` 〜 `--s-8`
- 影: `--e-1`, `--e-2`
- タイポ: `--font-sans`, `--fs-1` 〜 `--fs-6`, `--lh`
- モーション: `--motion-fast`, `--motion-ui`, `--motion-sheet`

### 使い方ガイド (短文)

1. **ページ直書きのスタイルは避ける。** 代わりに `globals.css` のクラスとトークンを使用します。
2. **UIプリミティブを優先利用。** `components/ui` にある Button/Card/Input/Chip/Skeleton/Modal/BottomSheet/DataTable を使います。
3. **データ状態は data 属性で管理。** 例: `data-variant`, `data-size`, `data-state`。
4. **モーションは共通定数を利用。** `src/lib/motion.ts` の `TRANSITION_*` / `SPRING_SHEET` を使用します。
5. **将来のテーマ拡張を考慮。** ダークテーマは `data-theme="dark"` / `"night"` を使います。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
