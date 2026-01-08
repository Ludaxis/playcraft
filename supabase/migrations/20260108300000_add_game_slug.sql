-- Add slug column for subdomain-based game URLs
-- URL format: https://[slug].play.playcraft.games

-- Add slug column to playcraft_projects
ALTER TABLE playcraft_projects
ADD COLUMN IF NOT EXISTS slug VARCHAR(60) UNIQUE,
ADD COLUMN IF NOT EXISTS subdomain_url VARCHAR(255);

-- Create index for fast slug lookups (used by Edge Function)
CREATE INDEX IF NOT EXISTS idx_projects_slug ON playcraft_projects(slug);

-- Create function to generate URL-safe slug from game name
CREATE OR REPLACE FUNCTION generate_game_slug(game_name TEXT, project_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  short_id TEXT;
BEGIN
  -- Normalize: lowercase, remove accents, replace non-alphanumeric with hyphens
  base_slug := lower(game_name);
  base_slug := unaccent(base_slug);
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  base_slug := left(base_slug, 40);

  -- Add short unique suffix from project ID
  short_id := left(project_id::text, 6);

  RETURN base_slug || '-' || short_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enable unaccent extension if not already enabled
CREATE EXTENSION IF NOT EXISTS unaccent;

COMMENT ON COLUMN playcraft_projects.slug IS 'URL-safe slug for subdomain: [slug].play.playcraft.games';
COMMENT ON COLUMN playcraft_projects.subdomain_url IS 'Full subdomain URL for the published game';
