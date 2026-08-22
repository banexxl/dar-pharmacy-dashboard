-- ============================================================
-- RLS policies for categories tables
-- Allow full read/write access via the anon and authenticated keys.
-- ============================================================

-- main_categories
ALTER TABLE main_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to main_categories"
  ON main_categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- mid_categories
ALTER TABLE mid_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to mid_categories"
  ON mid_categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- sub_categories
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to sub_categories"
  ON sub_categories
  FOR ALL
  USING (true)
  WITH CHECK (true);
