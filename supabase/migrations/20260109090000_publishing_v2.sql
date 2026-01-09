-- Publishing v2 schema: server-managed publish pipeline
-- Adds publish_jobs, publish_versions, and game_domains for subdomain/custom domain routing

-- Helper: updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Immutable publish versions (one row per build)
CREATE TABLE IF NOT EXISTS publish_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_tag TEXT NOT NULL, -- e.g., timestamp or short id
  storage_prefix TEXT NOT NULL, -- path in published-games bucket
  entrypoint TEXT NOT NULL DEFAULT 'index.html',
  checksum TEXT, -- manifest checksum
  size_bytes BIGINT,
  build_time_ms INTEGER,
  built_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_preview BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, version_tag)
);

CREATE INDEX IF NOT EXISTS idx_publish_versions_project ON publish_versions(project_id, built_at DESC);
CREATE INDEX IF NOT EXISTS idx_publish_versions_preview ON publish_versions(project_id, is_preview);

ALTER TABLE publish_versions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their publish versions' AND tablename = 'publish_versions'
  ) THEN
    CREATE POLICY "Users can view their publish versions"
      ON publish_versions FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their publish versions' AND tablename = 'publish_versions'
  ) THEN
    CREATE POLICY "Users can insert their publish versions"
      ON publish_versions FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

DROP TRIGGER IF EXISTS set_publish_versions_updated_at ON publish_versions;
CREATE TRIGGER set_publish_versions_updated_at
  BEFORE UPDATE ON publish_versions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Publish jobs (durable queue of publish attempts)
CREATE TABLE IF NOT EXISTS publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','building','uploading','finalizing','published','failed')),
  progress SMALLINT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  message TEXT,
  log_url TEXT,
  version_id UUID REFERENCES publish_versions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publish_jobs_project ON publish_jobs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publish_jobs_status ON publish_jobs(status);

ALTER TABLE publish_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their publish jobs' AND tablename = 'publish_jobs'
  ) THEN
    CREATE POLICY "Users can view their publish jobs"
      ON publish_jobs FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their publish jobs' AND tablename = 'publish_jobs'
  ) THEN
    CREATE POLICY "Users can insert their publish jobs"
      ON publish_jobs FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their publish jobs' AND tablename = 'publish_jobs'
  ) THEN
    CREATE POLICY "Users can update their publish jobs"
      ON publish_jobs FOR UPDATE
      USING (user_id = auth.uid());
  END IF;
END$$;

DROP TRIGGER IF EXISTS set_publish_jobs_updated_at ON publish_jobs;
CREATE TRIGGER set_publish_jobs_updated_at
  BEFORE UPDATE ON publish_jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Domains (slug and custom)
CREATE TABLE IF NOT EXISTS game_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('slug','custom')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','failed')),
  dns_txt TEXT, -- verification token for custom domains
  ssl_status TEXT NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending','active','failed')),
  target_version UUID REFERENCES publish_versions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_domains_project ON game_domains(project_id);
CREATE INDEX IF NOT EXISTS idx_game_domains_type ON game_domains(type);

ALTER TABLE game_domains ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their domains' AND tablename = 'game_domains'
  ) THEN
    CREATE POLICY "Users can view their domains"
      ON game_domains FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their domains' AND tablename = 'game_domains'
  ) THEN
    CREATE POLICY "Users can manage their domains"
      ON game_domains FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

DROP TRIGGER IF EXISTS set_game_domains_updated_at ON game_domains;
CREATE TRIGGER set_game_domains_updated_at
  BEFORE UPDATE ON game_domains
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Extend projects with version pointers (prod/preview)
ALTER TABLE playcraft_projects
  ADD COLUMN IF NOT EXISTS primary_version_id UUID REFERENCES publish_versions(id),
  ADD COLUMN IF NOT EXISTS preview_version_id UUID REFERENCES publish_versions(id);

COMMENT ON TABLE publish_jobs IS 'Queued publish operations with build/progress state';
COMMENT ON TABLE publish_versions IS 'Immutable artifacts of published builds';
COMMENT ON TABLE game_domains IS 'Domains (slug/custom) mapped to published versions';
