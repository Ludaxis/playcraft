-- Add Voyage AI API key column for semantic search
-- Migration: 20260106200000_add_voyage_api_key.sql

-- Add voyage_api_key to user settings
ALTER TABLE playcraft_user_settings
ADD COLUMN IF NOT EXISTS voyage_api_key TEXT;

-- Add comment for documentation
COMMENT ON COLUMN playcraft_user_settings.voyage_api_key IS 'Voyage AI API key for semantic code search (optional)';
