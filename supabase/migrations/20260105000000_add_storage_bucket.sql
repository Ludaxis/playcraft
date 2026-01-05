-- =============================================================================
-- PlayCraft: Object Storage Migration
-- =============================================================================
-- Migrates file storage from PostgreSQL JSON blob to Supabase Storage
-- for better scalability, CDN delivery, and reduced database load.
-- =============================================================================

-- =============================================================================
-- STORAGE BUCKET SETUP
-- =============================================================================
-- Create a private bucket for project files
-- Files stored at: /{user_id}/{project_id}/{file_path}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-files',
    'project-files',
    false,  -- Private bucket (requires auth)
    10485760,  -- 10MB max file size
    ARRAY['text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json', 'application/javascript', 'text/typescript', 'text/tsx', 'text/jsx', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE RLS POLICIES
-- =============================================================================
-- Users can only access files in their own folder (user_id prefix)

-- Policy: Users can SELECT (read/download) their own files
CREATE POLICY "Users can read own project files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'project-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can INSERT (upload) to their own folder
CREATE POLICY "Users can upload own project files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'project-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can UPDATE their own files
CREATE POLICY "Users can update own project files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'project-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'project-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can DELETE their own files
CREATE POLICY "Users can delete own project files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'project-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- SCHEMA UPDATES: playcraft_projects
-- =============================================================================
-- Add flag to indicate if project uses Storage vs JSON blob

ALTER TABLE playcraft_projects
ADD COLUMN IF NOT EXISTS use_storage BOOLEAN DEFAULT false;

-- Comment for documentation
COMMENT ON COLUMN playcraft_projects.use_storage IS
    'If true, files are stored in Supabase Storage bucket. If false, files are in the JSONB files column (legacy).';

-- =============================================================================
-- SCHEMA UPDATES: playcraft_project_files
-- =============================================================================
-- Add columns for Storage integration

-- Storage path: the full path in the bucket (e.g., "{user_id}/{project_id}/src/pages/Index.tsx")
ALTER TABLE playcraft_project_files
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Content hash: SHA-256 hash for change detection and deduplication
ALTER TABLE playcraft_project_files
ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- MIME type for proper Content-Type headers
ALTER TABLE playcraft_project_files
ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'text/plain';

-- Index for efficient storage path lookups
CREATE INDEX IF NOT EXISTS idx_project_files_storage_path
ON playcraft_project_files(storage_path)
WHERE storage_path IS NOT NULL;

-- Index for hash-based lookups (for deduplication)
CREATE INDEX IF NOT EXISTS idx_project_files_content_hash
ON playcraft_project_files(content_hash)
WHERE content_hash IS NOT NULL;

-- =============================================================================
-- HELPER FUNCTION: Get storage path for a file
-- =============================================================================
CREATE OR REPLACE FUNCTION get_file_storage_path(
    p_user_id UUID,
    p_project_id UUID,
    p_file_path TEXT
) RETURNS TEXT AS $$
BEGIN
    -- Format: {user_id}/{project_id}/{file_path}
    -- Remove leading slash from file_path if present
    RETURN p_user_id::text || '/' || p_project_id::text || '/' ||
           CASE WHEN LEFT(p_file_path, 1) = '/' THEN SUBSTRING(p_file_path FROM 2) ELSE p_file_path END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- HELPER FUNCTION: List all storage paths for a project
-- =============================================================================
CREATE OR REPLACE FUNCTION list_project_storage_paths(p_project_id UUID)
RETURNS TABLE (
    file_path TEXT,
    storage_path TEXT,
    size_bytes INTEGER,
    content_hash TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pf.path,
        pf.storage_path,
        pf.size_bytes,
        pf.content_hash
    FROM playcraft_project_files pf
    WHERE pf.project_id = p_project_id
    AND pf.storage_path IS NOT NULL
    ORDER BY pf.path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_file_storage_path(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION list_project_storage_paths(UUID) TO authenticated;

-- =============================================================================
-- MIGRATION NOTES
-- =============================================================================
--
-- After this migration:
-- 1. New projects can set use_storage = true
-- 2. Files uploaded to: storage.objects with bucket_id = 'project-files'
-- 3. Metadata stored in: playcraft_project_files with storage_path reference
-- 4. Existing projects continue using files JSONB column (use_storage = false)
--
-- To migrate existing projects:
-- 1. Run migration script to upload files to Storage
-- 2. Set use_storage = true on migrated projects
-- 3. Keep files JSONB as backup until verified
-- 4. Eventually NULL out files column to reclaim space
--
