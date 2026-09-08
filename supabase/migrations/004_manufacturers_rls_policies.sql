-- ============================================================
-- RLS policies for manufacturers table
-- Allow full read/write access via the anon and authenticated keys,
-- matching the categories tables (see 003_categories_rls_policies.sql).
-- ============================================================

ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to manufacturers"
  ON manufacturers
  FOR ALL
  USING (true)
  WITH CHECK (true);
