-- =============================================================
-- Schema alignment migration
-- Aligns current DB with target schema (docs/data-model.md)
-- NOTE: amount fields intentionally omitted —
--   actual amounts are calculated in MoneyForward
-- =============================================================

-- 1. Enable pg_trgm extension for trigram indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- 3. expense_records changes
-- =============================================================

-- 3a. Convert travel_date from TEXT to DATE
ALTER TABLE expense_records
  ALTER COLUMN travel_date TYPE DATE USING travel_date::date;

-- 3b. Add updated_at trigger
CREATE TRIGGER trg_expense_records_updated_at
  BEFORE UPDATE ON expense_records
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3c. Drop old individual indexes and create composite index
DROP INDEX IF EXISTS idx_expense_records_user_id;
DROP INDEX IF EXISTS idx_expense_records_travel_date;
CREATE INDEX idx_expense_records_user_travel_date
  ON expense_records(user_id, travel_date DESC);

-- 3d. Trigram indexes for keyword search
CREATE INDEX idx_expense_records_visit_to_trgm
  ON expense_records USING GIN (visit_to gin_trgm_ops);
CREATE INDEX idx_expense_records_route_text_trgm
  ON expense_records USING GIN (route_text gin_trgm_ops);
CREATE INDEX idx_expense_records_memo_trgm
  ON expense_records USING GIN (memo gin_trgm_ops);

-- =============================================================
-- 4. expense_templates changes
-- =============================================================

-- 4a. Rename name → template_name
ALTER TABLE expense_templates
  RENAME COLUMN name TO template_name;

-- 4b. Add use_count column
ALTER TABLE expense_templates
  ADD COLUMN use_count INTEGER NOT NULL DEFAULT 0
  CONSTRAINT chk_expense_templates_use_count CHECK (use_count >= 0);

-- 4c. Add last_used_at column
ALTER TABLE expense_templates
  ADD COLUMN last_used_at TIMESTAMPTZ;

-- 4d. Add updated_at column + trigger
ALTER TABLE expense_templates
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TRIGGER trg_expense_templates_updated_at
  BEFORE UPDATE ON expense_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4e. Add UPDATE RLS policy (was missing)
CREATE POLICY "Users can update own templates"
  ON expense_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
