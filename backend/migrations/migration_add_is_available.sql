-- Migration: Add is_available to services and professionals
-- Run with: psql -U salon -d salon_db -f migration_add_is_available.sql

ALTER TABLE services ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;

-- Optional: Update existing rows to ensure consistency
UPDATE services SET is_available = TRUE WHERE is_available IS NULL;
UPDATE professionals SET is_available = TRUE WHERE is_available IS NULL;