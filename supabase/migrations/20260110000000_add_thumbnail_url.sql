-- Migration: Add thumbnail_url column for auto-generated app icons
-- This column stores the URL of the project's app icon (generated on first publish)

ALTER TABLE playcraft_projects
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Index for efficient lookups (used in showcase/discover queries)
CREATE INDEX IF NOT EXISTS idx_projects_thumbnail
  ON playcraft_projects(thumbnail_url)
  WHERE thumbnail_url IS NOT NULL;

COMMENT ON COLUMN playcraft_projects.thumbnail_url IS 'URL of auto-generated or user-uploaded project app icon';
