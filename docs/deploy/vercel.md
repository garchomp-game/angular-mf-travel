# Vercelデプロイ手順

## 1. Vercelプロジェクト設定

本リポジトリは `app/` 配下にAngularアプリがあります。Vercelではリポジトリルートを対象にしつつ、
ビルド時に `app/` へ移動してビルドする設定を使います。

- Build Command: `cd app && bun run build`
- Output Directory: `app/dist/app/browser`

`vercel.json` にも同じ値を定義済みです。

## 2. Environment Variables の登録手順

Vercelダッシュボードで以下を設定します。

1. 対象プロジェクトを開く。
2. **Settings** → **Environment Variables** を開く。
3. キー名・値・Environment（Preview / Production）を指定して保存する。

### 必須キー

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

> 本アプリはビルド時に環境変数を使って `app/public/app-config.js` を生成します。

## 3. Preview / Production 分離ルール（誤接続防止）

同じキー名を環境ごとに分けて登録し、値を厳格に分離します。

- `SUPABASE_URL`
  - Preview: **検証用SupabaseプロジェクトURLのみ**
  - Production: **本番SupabaseプロジェクトURLのみ**
- `SUPABASE_ANON_KEY`
  - Preview: **検証用Anon Keyのみ**
  - Production: **本番Anon Keyのみ**

### 命名規約（運用ラベル）

Vercelのキー名自体は共通（`SUPABASE_URL` / `SUPABASE_ANON_KEY`）を維持し、
値の払い出し元シークレット名・台帳名を下記規約で管理します。

- Preview用: `preview_<service>_<kind>`
  - 例: `preview_supabase_url`, `preview_supabase_anon_key`
- Production用: `prod_<service>_<kind>`
  - 例: `prod_supabase_url`, `prod_supabase_anon_key`

### 追加の安全策

- Preview値をProductionにコピーしない（必ず別発行）。
- 値登録時に「Environment」の選択をダブルチェックする。
- ローテーション時は Preview → Production の順で段階適用する。

## 4. デプロイ後ヘルスチェック（チェックリスト）

デプロイ完了後、以下を確認します。

- [ ] 初回表示
  - [ ] トップ画面が3秒以内を目安に表示される
  - [ ] コンソールに初期化エラー（設定不足・接続失敗）が出ていない
- [ ] 一覧取得
  - [ ] 当月データが取得・表示される
  - [ ] データ0件時に空状態メッセージが表示される
- [ ] 登録
  - [ ] 必須項目入力で新規明細を登録できる
  - [ ] 登録直後に一覧へ反映される
- [ ] CSV
  - [ ] CSV出力操作が成功する
  - [ ] 出力内容が画面の対象月/絞り込み条件と一致する

## 5. トラブルシュート

- `supabaseUrl` / `supabaseAnonKey` が空になる場合
  - Environment Variables が未設定、またはEnvironmentの割当ミスを確認する。
- Buildは成功するが実行時に接続エラーが出る場合
  - PreviewとProductionで設定値が入れ替わっていないか確認する。
