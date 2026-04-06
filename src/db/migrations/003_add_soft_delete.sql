-- Migration 003: Soft Delete Support
-- Adds a `deleted_at` column to support keeping historical ledgers rather than
-- executing destructive commands on analytical models.

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_entries' AND column_name = 'deleted_at') THEN
    ALTER TABLE financial_entries ADD COLUMN deleted_at TIMESTAMP;
  END IF;
END $$;
