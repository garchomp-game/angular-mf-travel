# Angular + Supabase (Bun)

このプロジェクトは **Angular + Bun + Supabase** 構成です。Supabaseキーはソースに直書きせず、
**環境変数から `public/app-config.js` を生成**して読み込む方式にしています。

## セットアップ

```bash
bun install
cp .env.example .env.local
```

`.env.local` の値を設定:

```bash
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Supabase設定の仕組み

- ランタイム設定ファイル: `public/app-config.js`
- 生成スクリプト: `scripts/generate-app-config.mjs`
- 読み込み先: `src/app/core/app-config.ts`
- Supabase client: `src/app/core/supabase.client.ts`

`bun run start` / `bun run build` 実行時に自動で `public/app-config.js` を再生成します。

## 開発サーバー起動

```bash
SUPABASE_URL=... SUPABASE_ANON_KEY=... bun run start
```

## ビルド

```bash
SUPABASE_URL=... SUPABASE_ANON_KEY=... bun run build
```

## Vercel

VercelのProject Settings > Environment Variablesに下記を設定してください。

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

その上でビルドコマンドを `bun run build` にすると、ビルド時に `app-config.js` が生成されます。

## ログ/デバッグ

- `src/app/core/logger.service.ts`
  - `ngx-logger` で通常のログ出力
  - `debug` (`app:ui`) でdry-run向けの詳細ログ
- 画面上の `INFO/WARN/ERROR` ボタンでログを確認可能

## Playwright (UI動作確認)

```bash
bun run pw:install
bun run e2e
```

UIモード:

```bash
bun run e2e:ui
```
