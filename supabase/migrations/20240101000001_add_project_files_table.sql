-- =============================================================================
-- PlayCraft: Per-File Storage with Versioning
-- =============================================================================
-- Migrates from JSON blob storage to per-file rows for better scalability
-- and adds optimistic locking via version column.
-- =============================================================================

-- =============================================================================
-- PROJECT FILES TABLE (Per-file storage)
-- =============================================================================
-- Stores individual files for each project, replacing the JSON blob approach

CREATE TABLE IF NOT EXISTS playcraft_project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,

    -- File metadata
    path TEXT NOT NULL,           -- e.g., '/src/pages/Index.tsx'
    content TEXT,                 -- File content (null for directories)
    is_directory BOOLEAN DEFAULT false,

    -- Size tracking (for enforcing limits)
    size_bytes INTEGER DEFAULT 0,

    -- Versioning for conflict detection
    version INTEGER DEFAULT 1,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: one file per path per project
    CONSTRAINT unique_project_file_path UNIQUE (project_id, path)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON playcraft_project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_path ON playcraft_project_files(path);
CREATE INDEX IF NOT EXISTS idx_project_files_updated ON playcraft_project_files(updated_at DESC);

-- Enable RLS
ALTER TABLE playcraft_project_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access files in their own projects
CREATE POLICY "Users can view own project files"
    ON playcraft_project_files FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own project files"
    ON playcraft_project_files FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own project files"
    ON playcraft_project_files FOR UPDATE
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

CREATE POLICY "Users can delete own project files"
    ON playcraft_project_files FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
        )
    );

-- =============================================================================
-- ADD VERSION COLUMN TO PROJECTS TABLE
-- =============================================================================
-- For optimistic locking on project metadata

ALTER TABLE playcraft_projects
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- =============================================================================
-- PROJECT FILE HISTORY TABLE (Optional - for undo/versioning)
-- =============================================================================
-- Stores previous versions of files for undo functionality

CREATE TABLE IF NOT EXISTS playcraft_project_file_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES playcraft_project_files(id) ON DELETE CASCADE,

    -- Snapshot
    content TEXT,
    version INTEGER NOT NULL,

    -- Metadata
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_type TEXT CHECK (change_type IN ('create', 'update', 'delete'))
);

-- Index for fetching history
CREATE INDEX IF NOT EXISTS idx_file_history_file_id ON playcraft_project_file_history(file_id);
CREATE INDEX IF NOT EXISTS idx_file_history_changed ON playcraft_project_file_history(changed_at DESC);

-- Enable RLS
ALTER TABLE playcraft_project_file_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Same as files table
CREATE POLICY "Users can view own file history"
    ON playcraft_project_file_history FOR SELECT
    USING (
        file_id IN (
            SELECT pf.id FROM playcraft_project_files pf
            JOIN playcraft_projects p ON pf.project_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Only system/triggers should insert history, but allow user access for reading
CREATE POLICY "Users can insert file history"
    ON playcraft_project_file_history FOR INSERT
    WITH CHECK (
        file_id IN (
            SELECT pf.id FROM playcraft_project_files pf
            JOIN playcraft_projects p ON pf.project_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- =============================================================================
-- TRIGGER: Auto-increment version on file update
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_file_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    NEW.updated_at = NOW();
    NEW.size_bytes = COALESCE(LENGTH(NEW.content), 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = pg_catalog, public;

CREATE TRIGGER auto_increment_file_version
    BEFORE UPDATE ON playcraft_project_files
    FOR EACH ROW
    EXECUTE FUNCTION increment_file_version();

-- =============================================================================
-- TRIGGER: Auto-increment project version on update
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_project_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = pg_catalog, public;

CREATE TRIGGER auto_increment_project_version
    BEFORE UPDATE ON playcraft_projects
    FOR EACH ROW
    EXECUTE FUNCTION increment_project_version();

-- =============================================================================
-- FUNCTION: Calculate total project size
-- =============================================================================

CREATE OR REPLACE FUNCTION get_project_size(p_project_id UUID)
RETURNS BIGINT AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(size_bytes) FROM public.playcraft_project_files WHERE project_id = p_project_id),
        0
    );
END;
$$ LANGUAGE plpgsql SET search_path = pg_catalog, public;

-- =============================================================================
-- GRANTS
-- =============================================================================

GRANT ALL ON playcraft_project_files TO anon, authenticated;
GRANT ALL ON playcraft_project_file_history TO anon, authenticated;
