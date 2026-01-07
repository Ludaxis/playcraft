-- =============================================================================
-- PlayCraft Database Schema with Row Level Security (RLS)
-- =============================================================================
-- This migration creates all tables required by PlayCraft with proper RLS policies
-- to ensure users can only access their own data.
-- =============================================================================

-- Note: Using gen_random_uuid() which is built into PostgreSQL 13+
-- No extension required

-- =============================================================================
-- PLAYCRAFT_USER_SETTINGS TABLE
-- =============================================================================
-- Stores user preferences, profile info, and connected accounts

CREATE TABLE IF NOT EXISTS playcraft_user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Profile
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,

    -- Studio settings
    theme TEXT DEFAULT 'dark',
    editor_font_size INTEGER DEFAULT 14,
    auto_save BOOLEAN DEFAULT true,
    show_line_numbers BOOLEAN DEFAULT true,

    -- Connected accounts
    github_connected BOOLEAN DEFAULT false,
    github_username TEXT,
    google_connected BOOLEAN DEFAULT false,

    -- Notifications
    email_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_user_settings UNIQUE (user_id),
    CONSTRAINT unique_username UNIQUE (username)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON playcraft_user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_username ON playcraft_user_settings(username);

-- Enable RLS
ALTER TABLE playcraft_user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own settings
CREATE POLICY "Users can view own settings"
    ON playcraft_user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON playcraft_user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON playcraft_user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
    ON playcraft_user_settings FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- PLAYCRAFT_PROJECTS TABLE
-- =============================================================================
-- Stores user projects with files and conversation history

CREATE TABLE IF NOT EXISTS playcraft_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Project metadata
    name TEXT NOT NULL,
    description TEXT,
    template_id TEXT,

    -- Project files (JSON blob - consider migrating to separate table for large projects)
    files JSONB DEFAULT '{}'::jsonb,

    -- Conversation history
    conversation JSONB DEFAULT '[]'::jsonb,

    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'building', 'ready', 'published')),

    -- Feature flags
    has_three_js BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_opened_at TIMESTAMPTZ DEFAULT NOW(),

    -- Published project URL (if published)
    published_url TEXT,
    published_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON playcraft_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON playcraft_projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON playcraft_projects(status);

-- Enable RLS
ALTER TABLE playcraft_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own projects
CREATE POLICY "Users can view own projects"
    ON playcraft_projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
    ON playcraft_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON playcraft_projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON playcraft_projects FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- PLAYCRAFT_CHAT_SESSIONS TABLE
-- =============================================================================
-- Stores AI chat sessions for code generation

CREATE TABLE IF NOT EXISTS playcraft_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES playcraft_projects(id) ON DELETE SET NULL,

    -- Session metadata
    title TEXT,

    -- Messages (array of {role, content} objects)
    messages JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON playcraft_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project_id ON playcraft_chat_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON playcraft_chat_sessions(created_at DESC);

-- Enable RLS
ALTER TABLE playcraft_chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own chat sessions
CREATE POLICY "Users can view own chat sessions"
    ON playcraft_chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
    ON playcraft_chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
    ON playcraft_chat_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
    ON playcraft_chat_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- FEEDBACK TABLE
-- =============================================================================
-- Stores user feedback and bug reports

CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Feedback content
    type TEXT DEFAULT 'general' CHECK (type IN ('bug', 'feature', 'general', 'praise')),
    message TEXT NOT NULL,

    -- Context
    page_url TEXT,
    user_agent TEXT,

    -- Status (for admin tracking)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'wontfix')),
    admin_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can submit feedback and view their own
CREATE POLICY "Users can view own feedback"
    ON feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can submit feedback"
    ON feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Note: Users cannot update/delete feedback after submission (admin only)
-- Admin policies would be added separately with service role

-- =============================================================================
-- RATE LIMITING TABLE (for persistent rate limits)
-- =============================================================================
-- Tracks API usage for rate limiting across function instances

CREATE TABLE IF NOT EXISTS playcraft_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Usage tracking
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_rate_limit UNIQUE (user_id, endpoint)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON playcraft_rate_limits(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON playcraft_rate_limits(window_start);

-- Enable RLS
ALTER TABLE playcraft_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only the system (service role) can access rate limits
-- Regular users should not be able to read/modify rate limits
CREATE POLICY "Service role only for rate limits"
    ON playcraft_rate_limits FOR ALL
    USING (false)
    WITH CHECK (false);

-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
-- Automatically updates the updated_at column on row modification

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = pg_catalog, public;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON playcraft_user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON playcraft_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON playcraft_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- GRANTS
-- =============================================================================
-- Grant permissions to authenticated users (anon key uses these via RLS)

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON playcraft_user_settings TO anon, authenticated;
GRANT ALL ON playcraft_projects TO anon, authenticated;
GRANT ALL ON playcraft_chat_sessions TO anon, authenticated;
GRANT ALL ON feedback TO anon, authenticated;
-- Rate limits only accessible via service role (handled by Supabase)
