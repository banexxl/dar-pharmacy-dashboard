-- ============================================================
-- Categories hierarchy: main_categories -> mid_categories -> sub_categories
-- Each level has a FK pointing to its parent.
-- ============================================================

-- 1. Main categories
CREATE TABLE IF NOT EXISTS main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Mid categories (belongs to a main category)
CREATE TABLE IF NOT EXISTS mid_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  main_category_id UUID NOT NULL REFERENCES main_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (value, main_category_id)
);

-- 3. Sub categories (belongs to a mid category)
CREATE TABLE IF NOT EXISTS sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  mid_category_id UUID NOT NULL REFERENCES mid_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (value, mid_category_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_mid_categories_main ON mid_categories(main_category_id);
CREATE INDEX IF NOT EXISTS idx_sub_categories_mid ON sub_categories(mid_category_id);
