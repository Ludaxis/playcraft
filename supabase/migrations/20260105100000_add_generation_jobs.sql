-- =============================================================================
-- PlayCraft: Async Generation Jobs Queue
-- =============================================================================
-- Adds a job queue system for async AI generation with real-time status updates,
-- automatic retries, and better timeout handling.
-- =============================================================================

-- =============================================================================
-- GENERATION JOBS TABLE
-- =============================================================================

CREATE TABLE playcraft_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES playcraft_projects(id) ON DELETE SET NULL,

  -- Job configuration
  prompt TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'modify', 'fix_error')),
  context JSONB DEFAULT '{}', -- Selected files, error context, conversation history

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status_message TEXT,

  -- Results
  result JSONB, -- { files: {...}, message: "...", changes: [...] }
  error_message TEXT,

  -- Retry tracking
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata for analytics
  model_used TEXT,
  tokens_used INTEGER,
  duration_ms INTEGER
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Worker polling: find queued jobs efficiently (FIFO order)
CREATE INDEX idx_gen_jobs_queued
  ON playcraft_generation_jobs(created_at ASC)
  WHERE status = 'queued';

-- User job history: recent jobs first
CREATE INDEX idx_gen_jobs_user_history
  ON playcraft_generation_jobs(user_id, created_at DESC);

-- Project jobs: find all jobs for a project
CREATE INDEX idx_gen_jobs_project
  ON playcraft_generation_jobs(project_id, created_at DESC)
  WHERE project_id IS NOT NULL;

-- Stale job detection: find stuck processing jobs
CREATE INDEX idx_gen_jobs_stale
  ON playcraft_generation_jobs(started_at)
  WHERE status = 'processing';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE playcraft_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own jobs
CREATE POLICY "Users can view own jobs"
  ON playcraft_generation_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own jobs
CREATE POLICY "Users can insert own jobs"
  ON playcraft_generation_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own queued jobs only
CREATE POLICY "Users can cancel own queued jobs"
  ON playcraft_generation_jobs FOR UPDATE
  USING (auth.uid() = user_id AND status = 'queued')
  WITH CHECK (status = 'cancelled');

-- Service role can update all jobs (for worker function)
-- Note: Service role bypasses RLS by default

-- =============================================================================
-- REALTIME SUBSCRIPTION
-- =============================================================================

-- Enable realtime for job status updates
ALTER PUBLICATION supabase_realtime ADD TABLE playcraft_generation_jobs;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Claim the next available job atomically (for worker)
-- Uses FOR UPDATE SKIP LOCKED to prevent race conditions
CREATE OR REPLACE FUNCTION claim_generation_job()
RETURNS playcraft_generation_jobs AS $$
DECLARE
  claimed_job public.playcraft_generation_jobs;
BEGIN
  SELECT * INTO claimed_job
  FROM public.playcraft_generation_jobs
  WHERE status = 'queued'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF claimed_job.id IS NOT NULL THEN
    UPDATE public.playcraft_generation_jobs
    SET
      status = 'processing',
      started_at = NOW(),
      attempts = attempts + 1,
      last_attempt_at = NOW()
    WHERE id = claimed_job.id;

    -- Return the updated job
    SELECT * INTO claimed_job
    FROM public.playcraft_generation_jobs
    WHERE id = claimed_job.id;
  END IF;

  RETURN claimed_job;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

-- Mark stale processing jobs as failed (for cleanup cron)
-- Jobs processing for > 5 minutes are considered stuck
CREATE OR REPLACE FUNCTION cleanup_stale_jobs()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  WITH stale AS (
    UPDATE public.playcraft_generation_jobs
    SET
      status = CASE
        WHEN attempts < max_attempts THEN 'queued'  -- Retry
        ELSE 'failed'  -- Max attempts reached
      END,
      error_message = CASE
        WHEN attempts < max_attempts THEN 'Job timed out, retrying...'
        ELSE 'Job timed out after maximum retry attempts'
      END,
      completed_at = CASE
        WHEN attempts >= max_attempts THEN NOW()
        ELSE NULL
      END
    WHERE status = 'processing'
      AND started_at < NOW() - INTERVAL '5 minutes'
    RETURNING id
  )
  SELECT COUNT(*) INTO affected_count FROM stale;

  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

-- Get user's active jobs count (for rate limiting)
CREATE OR REPLACE FUNCTION get_user_active_jobs_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.playcraft_generation_jobs
    WHERE user_id = p_user_id
      AND status IN ('queued', 'processing')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION claim_generation_job() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_stale_jobs() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_active_jobs_count(UUID) TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE playcraft_generation_jobs IS
  'Async job queue for AI code generation. Jobs are picked up by worker functions and processed with retry logic.';

COMMENT ON COLUMN playcraft_generation_jobs.status IS
  'Job status: queued (waiting), processing (in progress), completed (success), failed (error), cancelled (user cancelled)';

COMMENT ON COLUMN playcraft_generation_jobs.context IS
  'JSON context for generation: selected files, error messages, conversation history, etc.';

COMMENT ON COLUMN playcraft_generation_jobs.result IS
  'Generation result: { files: Record<path, content>, message: string, changes: string[] }';

COMMENT ON FUNCTION claim_generation_job() IS
  'Atomically claim the next queued job for processing. Uses SKIP LOCKED to prevent race conditions.';

COMMENT ON FUNCTION cleanup_stale_jobs() IS
  'Mark jobs stuck in processing state as failed or retry. Call periodically via cron.';
