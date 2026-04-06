-- Migration 002: Advanced Data Modeling & Indexing

-- 1. ADD DATA INTEGRITY CONSTRAINTS
-- Ensure constraints only get added if they don't already exist to keep the migration idempotent.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_type_valid') THEN
    ALTER TABLE financial_entries ADD CONSTRAINT check_type_valid CHECK (type IN ('income', 'expense'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_amount_positive') THEN
    ALTER TABLE financial_entries ADD CONSTRAINT check_amount_positive CHECK (amount > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_role') THEN
    ALTER TABLE users ADD CONSTRAINT check_valid_role CHECK (role IN ('admin', 'analyst', 'viewer'));
  END IF;
END $$;

-- 2. ADD COMPOSITE INDEXES FOR HIGH-PERFORMANCE DASHBOARD QUERIES
-- By indexing on `user_id` alongside the specific filtering/grouping columns, 
-- Postgres can quickly execute our dashboard aggregation queries (trends, recent activity, category grouped)

-- Speeds up "Recent Activity" and "Trends/Timeline" queries scoped to a user
CREATE INDEX IF NOT EXISTS idx_financial_user_date 
ON financial_entries(user_id, date DESC);

-- Speeds up "Category Breakdown" where queries filter by user_id and group by category
CREATE INDEX IF NOT EXISTS idx_financial_user_category 
ON financial_entries(user_id, category);

-- Speeds up queries attempting to filter specifically by income or expense
CREATE INDEX IF NOT EXISTS idx_financial_user_type_date 
ON financial_entries(user_id, type, date DESC);

-- Speeds up foreign-key joins or cascading deletes from the users table
CREATE INDEX IF NOT EXISTS idx_financial_user_id 
ON financial_entries(user_id);
