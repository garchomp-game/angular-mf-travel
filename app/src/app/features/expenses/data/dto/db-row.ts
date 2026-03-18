/**
 * expense_records テーブルの DB 行型 (SELECT 結果)。
 * フロントエンドの ExpenseRecord との変換は mapper で行う。
 */
export interface ExpenseRecordRow {
  id: string;
  user_id: string;
  travel_date: string; // DB は DATE 型だが Supabase は ISO 文字列で返す
  visit_to: string;
  route_text: string;
  is_round_trip: boolean;
  category_code: string;
  tax_code: string;
  pre_approval_no: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * expense_records テーブルの INSERT/UPDATE 用ペイロード。
 * id, created_at, updated_at は DB 側で自動設定。
 */
export interface ExpenseRecordInsert {
  user_id?: string; // INSERT 時のみ必要 (UPDATE 時は不要)
  travel_date: string;
  visit_to: string;
  route_text: string;
  is_round_trip: boolean;
  category_code: string;
  tax_code: string;
  pre_approval_no: string | null;
  memo: string | null;
}

// ────────────────────────────────────────

/**
 * expense_templates テーブルの DB 行型 (SELECT 結果)。
 */
export interface ExpenseTemplateRow {
  id: string;
  user_id: string;
  template_name: string;
  visit_to: string;
  route_text: string;
  is_round_trip: boolean;
  category_code: string;
  tax_code: string;
  pre_approval_no: string | null;
  use_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * expense_templates テーブルの INSERT 用ペイロード。
 */
export interface ExpenseTemplateInsert {
  user_id: string;
  template_name: string;
  visit_to: string;
  route_text: string;
  is_round_trip: boolean;
  category_code: string;
  tax_code: string;
  pre_approval_no: string | null;
}
