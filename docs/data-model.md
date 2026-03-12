# Data Model（交通費管理）

## ER図相当の関係説明

本MVPで扱う主要エンティティは以下の2テーブルです。

- `expense_records`: 交通費の明細データ（登録・検索・編集・削除対象）
- `expense_templates`: よく使う入力パターンの再利用テンプレート

関係は以下です。

- `auth.users (1) --- (N) expense_records`
- `auth.users (1) --- (N) expense_templates`

`expense_records.user_id` と `expense_templates.user_id` はどちらも `auth.users.id` を参照し、ユーザー削除時には `ON DELETE CASCADE` で関連データも削除されます。

---

## `expense_records` 列定義

| 列名 | 型 | 必須 | デフォルト | バリデーション/制約 | 説明 |
|---|---|---|---|---|---|
| `id` | `uuid` | ✅ | `gen_random_uuid()` | PK | 明細ID |
| `user_id` | `uuid` | ✅ | - | FK (`auth.users.id`) | 所有ユーザー |
| `travel_date` | `date` | ✅ | - | - | 利用日 |
| `visit_to` | `text` | ✅ | - | - | 訪問先 |
| `route_text` | `text` | ✅ | - | - | 経路/支払先テキスト |
| `is_round_trip` | `boolean` | ✅ | `false` | - | 往復フラグ |
| `amount` | `numeric(12,2)` | ✅ | - | `CHECK (amount >= 0)` | 金額 |
| `category_code` | `text` | ✅ | - | - | 費目コード |
| `tax_code` | `text` | ✅ | - | - | 税区分コード |
| `pre_approval_no` | `text` | ❌ | `NULL` | - | 事前承認番号 |
| `memo` | `text` | ❌ | `NULL` | - | メモ |
| `created_at` | `timestamptz` | ✅ | `timezone('utc', now())` | - | 作成日時（UTC） |
| `updated_at` | `timestamptz` | ✅ | `timezone('utc', now())` | 更新時トリガー更新 | 更新日時（UTC） |

### インデックス

- `idx_expense_records_user_travel_date` on `(user_id, travel_date desc)`
  - ユーザー単位・月次一覧のソート取得を最適化
- `idx_expense_records_visit_to` (GIN + trigram)
- `idx_expense_records_route_text` (GIN + trigram)
- `idx_expense_records_memo` (GIN + trigram)
  - キーワード検索（部分一致）を最適化

### RLS（Row Level Security）

`expense_records` は RLS を有効化し、以下のポリシーで `auth.uid() = user_id` のみ許可します。

- `SELECT`: `USING (auth.uid() = user_id)`
- `INSERT`: `WITH CHECK (auth.uid() = user_id)`
- `UPDATE`: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
- `DELETE`: `USING (auth.uid() = user_id)`

---

## `expense_templates` 列定義

| 列名 | 型 | 必須 | デフォルト | バリデーション/制約 | 説明 |
|---|---|---|---|---|---|
| `id` | `uuid` | ✅ | `gen_random_uuid()` | PK | テンプレートID |
| `user_id` | `uuid` | ✅ | - | FK (`auth.users.id`) | 所有ユーザー |
| `template_name` | `text` | ✅ | - | - | テンプレート名 |
| `visit_to` | `text` | ✅ | - | - | 訪問先 |
| `route_text` | `text` | ✅ | - | - | 経路/支払先テキスト |
| `is_round_trip` | `boolean` | ✅ | `false` | - | 往復フラグ |
| `default_amount` | `numeric(12,2)` | ✅ | - | `CHECK (default_amount >= 0)` | 既定金額 |
| `category_code` | `text` | ✅ | - | - | 費目コード |
| `tax_code` | `text` | ✅ | - | - | 税区分コード |
| `memo` | `text` | ❌ | `NULL` | - | メモ |
| `use_count` | `integer` | ✅ | `0` | `CHECK (use_count >= 0)` | 累計利用回数 |
| `last_used_at` | `timestamptz` | ❌ | `NULL` | - | 最終利用日時 |
| `created_at` | `timestamptz` | ✅ | `timezone('utc', now())` | - | 作成日時（UTC） |
| `updated_at` | `timestamptz` | ✅ | `timezone('utc', now())` | 更新時トリガー更新 | 更新日時（UTC） |

### RLS

`expense_templates` も同一方針（`auth.uid() = user_id`）で `select/insert/update/delete` を制御します。

---

## 補足（運用）

- `use_count`, `last_used_at` は「履歴から再利用する」操作時に更新する想定です。
  - 例: テンプレート適用時に `use_count = use_count + 1`, `last_used_at = now()`
- `updated_at` は `public.set_updated_at()` トリガー関数で自動更新します。
