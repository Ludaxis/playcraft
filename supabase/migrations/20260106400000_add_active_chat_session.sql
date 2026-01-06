-- =============================================================================
-- Add active_chat_session_id to playcraft_projects
-- =============================================================================
-- Tracks which chat session is currently active for each project

ALTER TABLE playcraft_projects
ADD COLUMN IF NOT EXISTS active_chat_session_id UUID REFERENCES playcraft_chat_sessions(id) ON DELETE SET NULL;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_projects_active_chat_session ON playcraft_projects(active_chat_session_id);
