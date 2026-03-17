-- expense_records: 経費記録テーブル
-- users は Supabase Auth (auth.users) が管理するため不要
CREATE TABLE expense_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  travel_date TEXT NOT NULL,
  visit_to TEXT NOT NULL,
  route_text TEXT NOT NULL,
  is_round_trip BOOLEAN NOT NULL DEFAULT FALSE,
  category_code TEXT NOT NULL DEFAULT '',
  tax_code TEXT NOT NULL DEFAULT '',
  pre_approval_no TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX idx_expense_records_user_id ON expense_records(user_id);
CREATE INDEX idx_expense_records_travel_date ON expense_records(travel_date);

-- RLS（Row Level Security）有効化
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ参照可能
CREATE POLICY "Users can select own records"
  ON expense_records FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ作成可能
CREATE POLICY "Users can insert own records"
  ON expense_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users can update own records"
  ON expense_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のデータのみ削除可能
CREATE POLICY "Users can delete own records"
  ON expense_records FOR DELETE
  USING (auth.uid() = user_id);
