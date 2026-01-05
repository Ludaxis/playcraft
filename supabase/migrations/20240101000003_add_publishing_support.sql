-- Migration: Add publishing support for PlayCraft games
-- This enables users to publish games that anyone can play without authentication

-- Add columns for publishing metadata
ALTER TABLE playcraft_projects
ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Index for efficiently fetching published games (for showcase/discover)
CREATE INDEX IF NOT EXISTS idx_projects_published
ON playcraft_projects(published_at DESC)
WHERE status = 'published' AND is_public = true;

-- Public RLS policy - anyone can view published games (no auth required)
-- This is critical for the /play/:gameId public route
CREATE POLICY "Anyone can view published games"
ON playcraft_projects FOR SELECT
USING (status = 'published' AND is_public = true);

-- Function to increment play count (called when someone views a game)
-- Using SECURITY DEFINER to bypass RLS for the update
CREATE OR REPLACE FUNCTION increment_play_count(game_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE playcraft_projects
  SET play_count = play_count + 1
  WHERE id = game_id AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon role (for unauthenticated users)
GRANT EXECUTE ON FUNCTION increment_play_count(UUID) TO anon;

-- Create storage bucket for published games
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'published-games',
  'published-games',
  true,
  52428800, -- 50MB limit per file
  ARRAY['text/html', 'text/css', 'application/javascript', 'application/json', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'font/woff', 'font/woff2', 'font/ttf', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload to their published-games folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'published-games' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policy: Anyone can read published games (public bucket)
CREATE POLICY "Anyone can read published games files"
ON storage.objects FOR SELECT
USING (bucket_id = 'published-games');

-- Storage policy: Users can update their own published games
CREATE POLICY "Users can update their published-games files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'published-games' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policy: Users can delete their own published games
CREATE POLICY "Users can delete their published-games files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'published-games' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
