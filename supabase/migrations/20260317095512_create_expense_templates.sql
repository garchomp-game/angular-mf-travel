-- expense_templates: 経費テンプレートテーブル
-- 頻繁に入力するパターンを保存し、経費入力時に呼び出し可能
CREATE TABLE expense_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  visit_to TEXT NOT NULL,
  route_text TEXT NOT NULL,
  is_round_trip BOOLEAN NOT NULL DEFAULT FALSE,
  category_code TEXT NOT NULL DEFAULT '',
  tax_code TEXT NOT NULL DEFAULT '',
  pre_approval_no TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX idx_expense_templates_user_id ON expense_templates(user_id);

-- RLS（Row Level Security）有効化
ALTER TABLE expense_templates ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のテンプレートのみ参照可能
CREATE POLICY "Users can select own templates"
  ON expense_templates FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分のテンプレートのみ作成可能
CREATE POLICY "Users can insert own templates"
  ON expense_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のテンプレートのみ削除可能
CREATE POLICY "Users can delete own templates"
  ON expense_templates FOR DELETE
  USING (auth.uid() = user_id);
