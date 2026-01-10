-- Create table for GitHub repository connections
-- Stores the link between PlayCraft projects and GitHub repositories

CREATE TABLE IF NOT EXISTS project_github_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Repository info
  repository_owner TEXT NOT NULL,
  repository_name TEXT NOT NULL,
  repository_full_name TEXT NOT NULL,
  repository_url TEXT NOT NULL,
  repository_private BOOLEAN DEFAULT true,

  -- Branch info
  default_branch TEXT NOT NULL DEFAULT 'main',
  current_branch TEXT NOT NULL DEFAULT 'main',

  -- Sync state
  last_sync_sha TEXT,
  last_sync_at TIMESTAMPTZ,
  last_push_at TIMESTAMPTZ,
  last_pull_at TIMESTAMPTZ,

  -- Sync settings
  sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('push_only', 'pull_only', 'bidirectional')),
  auto_sync BOOLEAN DEFAULT false,
  auto_push_on_save BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one connection per project
  UNIQUE(project_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_github_connections_project_id ON project_github_connections(project_id);
CREATE INDEX IF NOT EXISTS idx_github_connections_user_id ON project_github_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_github_connections_repo ON project_github_connections(repository_owner, repository_name);

-- Enable RLS
ALTER TABLE project_github_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own connections
CREATE POLICY "Users can view own github connections"
  ON project_github_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert connections for their own projects
CREATE POLICY "Users can insert github connections"
  ON project_github_connections
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM playcraft_projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

-- Users can update their own connections
CREATE POLICY "Users can update own github connections"
  ON project_github_connections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete own github connections"
  ON project_github_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_github_connection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_github_connection_updated_at
  BEFORE UPDATE ON project_github_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_github_connection_updated_at();

-- Add comment for documentation
COMMENT ON TABLE project_github_connections IS 'Stores GitHub repository connections for PlayCraft projects';
