-- =============================================================================
-- PlayCraft: Update User Settings Schema
-- =============================================================================
-- Adds missing columns required by the application
-- =============================================================================

-- Add missing columns to playcraft_user_settings
ALTER TABLE playcraft_user_settings
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS hide_profile_picture BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS studio_name TEXT DEFAULT 'My Studio',
ADD COLUMN IF NOT EXISTS studio_description TEXT,
ADD COLUMN IF NOT EXISTS chat_suggestions BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS generation_sound TEXT DEFAULT 'first' CHECK (generation_sound IN ('first', 'always', 'never')),
ADD COLUMN IF NOT EXISTS labs_github_branch_switching BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS connected_accounts JSONB DEFAULT '{}'::jsonb;

-- Drop columns that are no longer needed (optional - keeping for backward compatibility)
-- ALTER TABLE playcraft_user_settings DROP COLUMN IF EXISTS avatar_url;
-- ALTER TABLE playcraft_user_settings DROP COLUMN IF EXISTS theme;
-- ALTER TABLE playcraft_user_settings DROP COLUMN IF EXISTS editor_font_size;
-- ALTER TABLE playcraft_user_settings DROP COLUMN IF EXISTS auto_save;
-- ALTER TABLE playcraft_user_settings DROP COLUMN IF EXISTS show_line_numbers;
-- ALTER TABLE playcraft_user_settings DROP COLUMN IF EXISTS github_connected;
-- ALTER TABLE playcraft_user_settings DROP COLUMN IF EXISTS google_connected;
-- ALTER TABLE playcraft_user_settings DROP COLUMN IF EXISTS email_notifications;
-- ALTER TABLE playcraft_user_settings DROP COLUMN IF EXISTS marketing_emails;
