-- =============================================================================
-- PlayCraft AI Context System - Database Schema
-- =============================================================================
-- This migration adds tables for the intelligent context management system:
-- - Project memory (persistent AI knowledge about each project)
-- - File hashes (change detection)
-- - Conversation summaries (compressed history)
-- =============================================================================

-- =============================================================================
-- PROJECT MEMORY TABLE
-- =============================================================================
-- Stores persistent AI knowledge about each project for precise iterations

CREATE TABLE IF NOT EXISTS playcraft_project_memory (
    project_id UUID PRIMARY KEY REFERENCES playcraft_projects(id) ON DELETE CASCADE,

    -- Project understanding
    project_summary TEXT,                    -- "Snake game with arrow controls and scoring"
    game_type TEXT,                          -- "arcade", "puzzle", "platformer", etc.
    tech_stack JSONB DEFAULT '[]'::jsonb,    -- ["react", "canvas", "tailwind"]

    -- Task tracking (last 50 completed tasks)
    completed_tasks JSONB DEFAULT '[]'::jsonb,  -- [{task: "Added scoring", timestamp: "..."}]

    -- File importance scores (0-1)
    file_importance JSONB DEFAULT '{}'::jsonb,  -- {"/src/pages/Index.tsx": 0.9, ...}

    -- Key code entities
    key_entities JSONB DEFAULT '[]'::jsonb,     -- [{name: "Player", type: "component", file: "..."}]

    -- Active context (current focus area)
    active_context JSONB DEFAULT '{}'::jsonb,   -- {focusFiles: [...], lastModified: [...]}

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_project_memory_updated
    ON playcraft_project_memory(updated_at DESC);

-- Enable RLS
ALTER TABLE playcraft_project_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access memory for their own projects
CREATE POLICY "Users can view own project memory"
    ON playcraft_project_memory FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own project memory"
    ON playcraft_project_memory FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own project memory"
    ON playcraft_project_memory FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own project memory"
    ON playcraft_project_memory FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

-- =============================================================================
-- FILE HASHES TABLE
-- =============================================================================
-- Tracks file content hashes to detect changes between requests

CREATE TABLE IF NOT EXISTS playcraft_file_hashes (
    project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,

    -- Hash of file content (SHA-256)
    content_hash TEXT NOT NULL,

    -- File metadata
    file_size INTEGER DEFAULT 0,
    last_modified TIMESTAMPTZ DEFAULT NOW(),

    -- Code analysis (for smart context selection)
    file_type TEXT,                          -- "component", "hook", "util", "page", "config"
    exports JSONB DEFAULT '[]'::jsonb,       -- ["Player", "useGame", "GameBoard"]
    imports JSONB DEFAULT '[]'::jsonb,       -- ["/src/hooks/useGame", "react"]

    -- Importance tracking
    modification_count INTEGER DEFAULT 1,     -- How many times this file was modified

    PRIMARY KEY (project_id, file_path)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_file_hashes_project
    ON playcraft_file_hashes(project_id);
CREATE INDEX IF NOT EXISTS idx_file_hashes_modified
    ON playcraft_file_hashes(last_modified DESC);
CREATE INDEX IF NOT EXISTS idx_file_hashes_type
    ON playcraft_file_hashes(file_type);

-- Enable RLS
ALTER TABLE playcraft_file_hashes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access hashes for their own projects
CREATE POLICY "Users can view own file hashes"
    ON playcraft_file_hashes FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own file hashes"
    ON playcraft_file_hashes FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own file hashes"
    ON playcraft_file_hashes FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own file hashes"
    ON playcraft_file_hashes FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

-- =============================================================================
-- CONVERSATION SUMMARIES TABLE
-- =============================================================================
-- Stores compressed conversation history to maintain context efficiently

CREATE TABLE IF NOT EXISTS playcraft_conversation_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,

    -- Summary content
    summary_text TEXT NOT NULL,              -- "User created snake game with arrow controls"

    -- Message range this summary covers
    message_range_start INTEGER NOT NULL,    -- First message index
    message_range_end INTEGER NOT NULL,      -- Last message index

    -- Extracted metadata
    tasks_completed JSONB DEFAULT '[]'::jsonb,  -- ["Created snake movement", "Added food"]
    files_modified JSONB DEFAULT '[]'::jsonb,   -- ["/src/pages/Index.tsx"]

    -- Ordering
    sequence_number INTEGER NOT NULL,        -- Order of summaries (0, 1, 2, ...)

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conv_summaries_project
    ON playcraft_conversation_summaries(project_id);
CREATE INDEX IF NOT EXISTS idx_conv_summaries_sequence
    ON playcraft_conversation_summaries(project_id, sequence_number DESC);

-- Enable RLS
ALTER TABLE playcraft_conversation_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access summaries for their own projects
CREATE POLICY "Users can view own conversation summaries"
    ON playcraft_conversation_summaries FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own conversation summaries"
    ON playcraft_conversation_summaries FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own conversation summaries"
    ON playcraft_conversation_summaries FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own conversation summaries"
    ON playcraft_conversation_summaries FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at on project_memory
CREATE TRIGGER update_project_memory_updated_at
    BEFORE UPDATE ON playcraft_project_memory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- GRANTS
-- =============================================================================

GRANT ALL ON playcraft_project_memory TO anon, authenticated;
GRANT ALL ON playcraft_file_hashes TO anon, authenticated;
GRANT ALL ON playcraft_conversation_summaries TO anon, authenticated;
