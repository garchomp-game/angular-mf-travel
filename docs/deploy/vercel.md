# Vercel デプロイ手順

## アーキテクチャ

```
[ブラウザ] → [Vercel Edge Network]
  ├── /api/* → Vercel Serverless Function (Hono + Turso)
  └── /* → Static Files (Angular SPA)
```

- フロントエンド: `app/` (Angular) → 静的ファイルとして配信
- バックエンド: `server/` (Hono) → `api/index.ts` 経由で Serverless Function として実行
- データベース: Turso (libSQL) — エッジ対応のSQLite互換DB

## 1. 環境変数の設定

Vercel ダッシュボード → **Settings → Environment Variables** で以下を設定:

### 必須

| 変数名 | 説明 | 例 |
|---|---|---|
| `TURSO_DATABASE_URL` | Turso DB URL | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso 認証トークン | `eyJhbGciOi...` |
| `JWT_SECRET` | JWT署名シークレット (**↓の手順で生成**) | `Lx4pQz2m...` |

#### JWT_SECRET の生成

```bash
openssl rand -base64 32
```

⚠️ **`dev-secret-change-me` のまま絶対にデプロイしないこと**

### 任意

| 変数名 | 説明 | 例 |
|---|---|---|
| `ALLOWED_ORIGIN` | 追加CORS許可ドメイン | `https://custom.example.com` |

> `VERCEL_URL` は Vercel が自動設定するため、デフォルトで Vercel ドメインの CORS は許可されます。

## 2. Preview / Production 分離

| 変数名 | Preview | Production |
|---|---|---|
| `TURSO_DATABASE_URL` | 検証用 DB URL | 本番 DB URL |
| `TURSO_AUTH_TOKEN` | 検証用トークン | 本番トークン |
| `JWT_SECRET` | 検証用シークレット | 本番シークレット |

- Preview と Production で**必ず別の値**を設定
- 同じ DB を共有しない

## 3. vercel.json 設定済み内容

```json
{
  "installCommand": "cd app && bun install && cd ../server && bun install",
  "buildCommand": "cd app && bun run build",
  "outputDirectory": "app/dist/app/browser",
  "functions": {
    "api/index.ts": {
      "runtime": "@vercel/node@4",
      "includeFiles": "server/**"
    }
  },
  "rewrites": [
    { "source": "/api/:path(.*)", "destination": "/api" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

## 4. デプロイ後ヘルスチェック

- [ ] `https://your-app.vercel.app/api/health` → `{"status":"ok"}`
- [ ] ログインページが表示される
- [ ] 新規登録 → ログイン → 一覧表示できる
- [ ] 経費の登録・編集・削除が動作する
- [ ] テーマ切替が動作する

## 5. トラブルシュート

| 症状 | 原因 |
|---|---|
| API が 500 エラー | 環境変数 (`TURSO_*`, `JWT_SECRET`) 未設定 |
| CORS エラー | `ALLOWED_ORIGIN` 未設定 (通常は VERCEL_URL で自動対応) |
| ログイン後すぐログアウトされる | Preview/Production で JWT_SECRET が異なる |
| DB 接続エラー | `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` のミス |
