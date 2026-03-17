# angular-mf-travel 引き継ぎ書

> 最終更新: 2026-03-17 | セッション: a1923ab3

---

## 1. プロジェクト概要

**経費精算 Web アプリ** — 出張旅費の記録・管理を行う SPA。

| 項目 | 値 |
|---|---|
| フレームワーク | Angular 21.2 (Standalone Components) |
| CSS | TailwindCSS 4 + DaisyUI 5 |
| バックエンド | Supabase (PostgreSQL + Auth + RLS) |
| パッケージマネージャ | Bun 1.2 |
| デプロイ先 | Vercel (自動デプロイ: `git push origin main`) |
| テスト | Vitest (ユニット) + Playwright (E2E) |
| リポジトリ | `https://github.com/garchomp-game/angular-mf-travel` |
| 本番 URL | `https://angular-mf-travel.vercel.app` |

---

## 2. ディレクトリ構成

```
angular-mf-travel/
├── app/                          # Angular フロントエンド
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/             # 認証・ロガー・Supabase クライアント
│   │   │   └── features/
│   │   │       ├── auth/         # ログイン/新規登録ページ
│   │   │       └── expenses/     # 経費機能（メイン）
│   │   │           ├── components/   # 再利用可能 UI
│   │   │           ├── data/         # サービス層
│   │   │           └── pages/        # ページコンポーネント
│   │   └── environments/         # 環境設定 (dev/prod)
│   ├── e2e/                      # Playwright E2E テスト
│   ├── angular.json
│   ├── playwright.config.ts
│   ├── .env.e2e                  # E2E 用 Supabase キー (gitignore)
│   └── package.json
├── supabase/                     # Supabase CLI 設定
│   ├── config.toml               # ローカル設定
│   └── migrations/               # DB マイグレーション
├── docs/                         # VitePress ドキュメントサイト
├── reference/                    # 参照リソース
│   ├── awesome-angular/
│   ├── awesome-supabase/
│   └── llms/                     # LLM コンテキストファイル
├── .audits/                      # 監査レポート (4件)
├── .agent/workflows/             # AI ワークフロー定義
├── vercel.json                   # Vercel デプロイ設定
└── package.json                  # ルート (workspace)
```

---

## 3. 主要ファイル一覧

### 3.1 Core 層 (`app/src/app/core/`)

| ファイル | 役割 | テスト |
|---|---|---|
| `supabase.service.ts` | Supabase クライアント Singleton (`createClient`) | — (薄いラッパー) |
| `auth.service.ts` | SignIn/SignUp/SignOut + AuthStateChange リスナー | `auth.service.spec.ts` (13) |
| `auth.guard.ts` | `CanActivateFn` — ready$ 待機 → isAuthenticated$ チェック | `auth.guard.spec.ts` (3) |
| `logger.service.ts` | ngx-logger ラッパー | — |
| `global-error-handler.ts` | Angular ErrorHandler | — |

### 3.2 Feature 層 (`app/src/app/features/`)

#### Auth

| ファイル | 役割 | テスト |
|---|---|---|
| `auth/login-page.component.ts` | ログイン/新規登録フォーム (タブ切替式) | `login-page.component.spec.ts` (11) |

#### Expenses — Data

| ファイル | 役割 | テスト |
|---|---|---|
| `data/expense-supabase.service.ts` | CRUD + findDuplicate (Supabase 経由) | `expense-supabase.service.spec.ts` (16) |
| `data/expense-store.service.ts` | localStorage フォールバック (レガシー) | `expense-store.service.spec.ts` (12) |
| `data/expense-template.service.ts` | テンプレート CRUD (Supabase 経由) | `expense-template.service.spec.ts` (8) |

#### Expenses — Pages

| ファイル | 役割 | テスト |
|---|---|---|
| `pages/expense-entry-page/` | 経費入力/編集 + テンプレ選択/保存 | spec (10) |
| `pages/monthly-list-page/` | 月別一覧 + 検索 + CSV出力 + カード/テーブル切替 | spec (10) |
| `pages/template-list-page/` | テンプレート管理 (一覧/削除) | spec (7) |

#### Expenses — Components (7 コンポーネント)

| コンポーネント | 役割 |
|---|---|
| `bottom-nav` | 3タブ ドックナビ (一覧/入力/テンプレ) |
| `expense-card` | 経費カード (編集/削除/📋テンプレ追加ボタン) |
| `expense-table` | テーブル表示 (編集/削除ボタン) |
| `month-switcher` | 月切替 (前月/次月) |
| `search-box` | キーワード検索入力 |
| `section-card` | 汎用カードコンテナ |
| `theme-toggle` | ダーク/ライトテーマ切替 (localStorage 永続化) |

### 3.3 ルーティング (`app.routes.ts`)

| パス | コンポーネント | Guard |
|---|---|---|
| `/login` | `LoginPageComponent` | — |
| `/list` | `MonthlyListPageComponent` | `authGuard` |
| `/entry` | `ExpenseEntryPageComponent` | `authGuard` |
| `/entry?edit=<id>` | 同上 (編集モード) | `authGuard` |
| `/templates` | `TemplateListPageComponent` | `authGuard` |
| `/` | → `/list` リダイレクト | — |
| `**` | → `/list` リダイレクト | — |

---

## 4. DB スキーマ

### `expense_records`

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
travel_date     TEXT NOT NULL           -- '2026-03-08' 形式
visit_to        TEXT NOT NULL           -- 訪問先
route_text      TEXT NOT NULL           -- 支払先・内容
is_round_trip   BOOLEAN DEFAULT FALSE   -- 往復フラグ
category_code   TEXT DEFAULT ''         -- 経費科目
tax_code        TEXT DEFAULT ''         -- 税区分
pre_approval_no TEXT                    -- 事前申請番号 (nullable)
memo            TEXT                    -- メモ (nullable)
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

RLS: ユーザーは自分のレコードのみ SELECT/INSERT/UPDATE/DELETE 可能。

### `expense_templates`

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
name            TEXT NOT NULL           -- テンプレート名
visit_to        TEXT NOT NULL
route_text      TEXT NOT NULL
is_round_trip   BOOLEAN DEFAULT FALSE
category_code   TEXT DEFAULT ''
tax_code        TEXT DEFAULT ''
pre_approval_no TEXT
created_at      TIMESTAMPTZ DEFAULT now()
```

RLS: ユーザーは自分のテンプレートのみ SELECT/INSERT/DELETE 可能。

---

## 5. 環境設定

### 5.1 Dev/Prod 分離

| 環境 | ファイル | Supabase | 切替メカニズム |
|---|---|---|---|
| 開発 (`ng serve`) | `environment.development.ts` | Docker ローカル (`127.0.0.1:54321`) | `angular.json` の `fileReplacements` |
| 本番 (`ng build`) | `environment.ts` | クラウド (`sbjxnwakufmfzpnkcmwz.supabase.co`) | デフォルト |

> [!IMPORTANT]
> `angular.json` の `build.configurations.development.fileReplacements` が **必須**。
> これがないと `ng serve` でも本番キーが使われる（過去にこれが原因で E2E テストが全滅した）。

### 5.2 E2E 環境変数 (`.env.e2e`)

```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbG...（ローカルデモキー）
SUPABASE_SERVICE_KEY=eyJhbG...（ローカル service_role キー）
```

- `.gitignore` に含まれている
- `playwright.config.ts` が手動で読み込む
- `SUPABASE_SERVICE_KEY` は E2E global-setup でのみ使用（Admin API 経由のユーザー作成/データクリーンアップ）

---

## 6. 開発環境セットアップ

### 前提条件
- Bun 1.2+
- Docker (Supabase ローカル用)
- Supabase CLI (`bunx supabase`)

### 初回セットアップ

```bash
# 1. 依存関係インストール
cd angular-mf-travel/app && bun install

# 2. Supabase ローカル起動（初回は Docker イメージ DL で数分）
cd .. && bunx supabase start

# 3. マイグレーション適用（既に start で適用される）
bunx supabase db reset    # 必要に応じてリセット

# 4. Playwright ブラウザ
cd app && bun run pw:install

# 5. 開発サーバー起動
bun run start
```

### 日常の開発フロー

```bash
# Supabase が止まっている場合
bunx supabase start

# 開発サーバー
cd app && bun run start        # → http://127.0.0.1:4200

# 全チェック実行
bun check                      # typecheck + lint + format + 118 unit + 40 E2E

# 個別テスト
bun run test:ci                # ユニットテストのみ
bun run e2e                    # E2E のみ
bun run e2e:ui                 # Playwright UI モード
```

### Supabase 管理

```bash
bunx supabase start            # 起動
bunx supabase stop             # 停止
bunx supabase db reset         # リセット (マイグレーション再適用)
bunx supabase status           # ステータス + ローカル URL/キー確認
```

ローカル Supabase は以下のポートを使用：
- API: `http://127.0.0.1:54321`
- DB: `127.0.0.1:54322`
- Studio (管理 UI): `http://127.0.0.1:54323`

---

## 7. テスト戦略

### 7.1 ユニットテスト (Vitest + Angular TestBed)

**118 テスト / 17 ファイル**

| カテゴリ | ファイル数 | テスト数 | 概要 |
|---|---|---|---|
| Core (auth) | 2 | 16 | AuthService + AuthGuard |
| Auth UI | 1 | 11 | LoginPageComponent (境界値含む) |
| Data Services | 3 | 36 | Supabase/Store/Template 各 CRUD |
| Page Components | 3 | 27 | Entry/List/Template ページ |
| UI Components | 7 | 26 | カード/テーブル等 |
| App | 1 | 2 | ルートコンポーネント |

重要な境界値テスト:
- パスワード 5文字 (NG) / 6文字 (OK)
- `listByMonth` 12月→1月 年越し
- 不正な月フォーマット → 空配列
- localStorage 破損からの復旧

### 7.2 E2E テスト (Playwright)

**40 テスト / 7 スペックファイル**

| ファイル | テスト数 | 概要 |
|---|---|---|
| `auth.spec.ts` | 9 | ログイン/新規登録/バリデーション/処理中状態 |
| `expense-entry.spec.ts` | 9 | 新規/境界値/編集/保存 |
| `expense-list.spec.ts` | 7 | 月切替/検索/カード・テーブル切替/削除 |
| `template.spec.ts` | 5 | テンプレ保存/選択/削除 |
| `theme-nav.spec.ts` | 5 | テーマ切替/ナビ/パスワード境界値 |
| `z-logout.spec.ts` | 1 | ログアウト (最後に実行) |

#### E2E アーキテクチャ

```
global-setup.ts
  ├─ Admin API で全テストユーザー削除
  ├─ テストユーザー再作成 (email_confirm: true)
  ├─ 全 expense_records / expense_templates 削除
  ├─ シードデータ投入 (3件)
  └─ ブラウザログイン → storageState 保存

fixtures.ts
  └─ page.goto() をラップ → /login リダイレクト時に自動再ログイン

playwright.config.ts
  ├─ fullyParallel: false (DB 共有のため)
  ├─ chromium 単一プロジェクト
  ├─ storageState: ./e2e/.auth/storageState.json
  └─ webServer: bun run start --host 127.0.0.1 --port 4200
```

> [!TIP]
> E2E テストはブラウザを使わず **Playwright のみ** で実行すること（メモリ節約）。
> 検証が必要な場合は使い捨てスクリプトで dry-run を推奨。

---

## 8. デプロイ

### Vercel 自動デプロイ

```bash
git push origin main   # → Vercel が自動ビルド＆デプロイ
```

`vercel.json`:
```json
{
  "framework": null,
  "installCommand": "cd app && bun install",
  "buildCommand": "cd app && bun run build",
  "outputDirectory": "app/dist/app/browser",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- **SPA リライト** 設定済み（Angular Router 対応）
- 本番ビルドは `environment.ts`（クラウド Supabase キー）を使用
- Service Worker 有効（`ngsw-worker.js`）

### Supabase クラウド

- プロジェクト: `sbjxnwakufmfzpnkcmwz`
- Supabase ダッシュボードで確認メールの設定変更可能
- `Site URL` を `https://angular-mf-travel.vercel.app` に設定済み

---

## 9. 既知の課題と注意点

### 9.1 ローカル Supabase

- `supabase start` は初回に Docker イメージを DL するため数分かかる
- メモリ使用量: ~500MB（Docker コンテナ群）
- `supabase stop` で完全停止可能
- メール認証は `config.toml` で `enable_confirmations = false`（ローカルのみ）

### 9.2 E2E テスト安定性

- **データ汚染**: E2E は `fullyParallel: false` で順次実行。global-setup で毎回全データクリーンアップ
- **ローカル Supabase が速すぎる問題**: `処理中...` テストは `page.route()` で 1秒遅延を挿入
- **strict mode**: `.first()` を使って複数マッチ時のエラーを回避

### 9.3 レガシーコード

- `expense-store.service.ts` は localStorage ベースの旧実装。現在は使用されていないが、テストは残存

### 9.4 Supabase クラウドのレートリミット

- Free tier ではメール送信 **1時間4通** の制限あり
- テスト時は `email_confirm: true` (Admin API) で回避

---

## 10. 監査レポート

`.audits/` ディレクトリに4件の監査レポートが存在:

| ファイル | 概要 |
|---|---|
| `01-angular-best-practices.md` | Angular ベストプラクティス準拠状況 |
| `02-supabase-best-practices.md` | Supabase セキュリティ/パフォーマンス |
| `03-dead-code-cleanup.md` | 不要コード・旧アーキテクチャ残骸 |
| `04-robustness-review.md` | エラーハンドリング/ロギング/UX |

---

## 11. 今後の改善候補

このセッションでの監査結果から、以下が主な改善ポイント:

1. **`expense-store.service.ts` の削除** — Supabase 移行完了済みのレガシーコード
2. **金額フィールドの追加** — 現在は金額管理がない
3. **ページネーション** — データ増加時の対応
4. **PWA オフライン対応** — Service Worker は有効だが、オフラインデータ同期は未実装
5. **`updated_at` トリガー** — 現在は手動更新なし（DB トリガー推奨）
6. **テスト**: `global-error-handler.ts` と `logger.service.ts` のテスト追加

---

## 12. npm スクリプトリファレンス

```bash
bun run start          # 開発サーバー (http://127.0.0.1:4200)
bun run build          # 本番ビルド
bun run test           # ユニットテスト (watch)
bun run test:ci        # ユニットテスト (CI, watch なし)
bun run lint           # ESLint
bun run typecheck      # TypeScript 型チェック
bun run format         # Prettier 自動修正
bun run format:check   # Prettier チェックのみ
bun run check          # 全チェック (typecheck + lint + format + unit + e2e)
bun run e2e            # Playwright E2E
bun run e2e:ui         # Playwright UI モード
bun run pw:install     # Playwright ブラウザインストール
```
