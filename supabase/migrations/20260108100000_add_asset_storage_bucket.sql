-- =============================================================================
-- PlayCraft: Asset Storage Bucket Migration
-- =============================================================================
-- Creates storage bucket for game assets (images, 3D models, audio)
-- =============================================================================

-- =============================================================================
-- STORAGE BUCKET SETUP
-- =============================================================================
-- Create a private bucket for project assets
-- Files stored at: /{user_id}/{project_id}/assets/{category}/{filename}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-assets',
    'project-assets',
    false,  -- Private bucket (requires auth)
    20971520,  -- 20MB max file size (for 3D models)
    ARRAY[
        -- 2D Image formats
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        -- 3D Model formats
        'model/gltf-binary',
        'model/gltf+json',
        'application/octet-stream',  -- GLB files often have this MIME
        -- Audio formats
        'audio/mpeg',
        'audio/wav',
        'audio/ogg'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE RLS POLICIES
-- =============================================================================
-- Users can only access assets in their own folder (user_id prefix)

-- Policy: Users can SELECT (read/download) their own assets
CREATE POLICY "Users can read own project assets"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can INSERT (upload) to their own folder
CREATE POLICY "Users can upload own project assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can UPDATE their own assets
CREATE POLICY "Users can update own project assets"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can DELETE their own assets
CREATE POLICY "Users can delete own project assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- HELPER FUNCTION: Get asset storage path
-- =============================================================================
CREATE OR REPLACE FUNCTION get_asset_storage_path(
    p_user_id UUID,
    p_project_id UUID,
    p_category TEXT,
    p_filename TEXT
) RETURNS TEXT AS $$
BEGIN
    -- Format: {user_id}/{project_id}/assets/{category}/{filename}
    RETURN p_user_id::text || '/' || p_project_id::text || '/assets/' || p_category || '/' || p_filename;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_asset_storage_path(UUID, UUID, TEXT, TEXT) TO authenticated;
