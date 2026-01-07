-- =============================================================================
-- PlayCraft: Generation Outcomes Tracking
-- =============================================================================
-- Tracks the outcome of each AI generation for learning and improvement.
-- Records validation results, user feedback, and corrections to help
-- identify patterns in successful vs failed generations.
-- =============================================================================

-- =============================================================================
-- GENERATION OUTCOMES TABLE
-- =============================================================================

CREATE TABLE playcraft_generation_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES playcraft_projects(id) ON DELETE SET NULL,
  job_id UUID REFERENCES playcraft_generation_jobs(id) ON DELETE SET NULL,

  -- Request info
  prompt TEXT NOT NULL,
  intent_type TEXT, -- create, modify, style, debug, enhance, etc.
  context_mode TEXT, -- full, minimal, outline

  -- Response info
  response_mode TEXT, -- edit, file
  files_changed TEXT[], -- paths of modified files
  tokens_used INTEGER,
  duration_ms INTEGER,

  -- Validation results
  had_ts_errors BOOLEAN DEFAULT FALSE,
  had_eslint_errors BOOLEAN DEFAULT FALSE,
  had_runtime_errors BOOLEAN DEFAULT FALSE,
  error_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,

  -- Auto-fix tracking
  auto_fix_attempts INTEGER DEFAULT 0,
  auto_fix_succeeded BOOLEAN,

  -- User feedback (updated after user interaction)
  was_accepted BOOLEAN, -- NULL until user acts
  was_reverted BOOLEAN DEFAULT FALSE,
  user_edited_after BOOLEAN DEFAULT FALSE,
  user_corrections TEXT[], -- What user manually fixed

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  feedback_at TIMESTAMPTZ -- When user provided feedback
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Find outcomes for a project (analytics)
CREATE INDEX idx_outcomes_project
  ON playcraft_generation_outcomes(project_id, created_at DESC)
  WHERE project_id IS NOT NULL;

-- Find outcomes for a user (personal stats)
CREATE INDEX idx_outcomes_user
  ON playcraft_generation_outcomes(user_id, created_at DESC);

-- Find outcomes with errors (debugging)
CREATE INDEX idx_outcomes_with_errors
  ON playcraft_generation_outcomes(created_at DESC)
  WHERE had_ts_errors = TRUE OR had_eslint_errors = TRUE OR had_runtime_errors = TRUE;

-- Find outcomes awaiting feedback
CREATE INDEX idx_outcomes_pending_feedback
  ON playcraft_generation_outcomes(created_at DESC)
  WHERE was_accepted IS NULL;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE playcraft_generation_outcomes ENABLE ROW LEVEL SECURITY;

-- Users can view their own outcomes
CREATE POLICY "Users can view own outcomes"
  ON playcraft_generation_outcomes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own outcomes
CREATE POLICY "Users can insert own outcomes"
  ON playcraft_generation_outcomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own outcomes (for feedback)
CREATE POLICY "Users can update own outcomes"
  ON playcraft_generation_outcomes FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get outcome statistics for a user
CREATE OR REPLACE FUNCTION get_outcome_stats(p_user_id UUID)
RETURNS TABLE (
  total_generations BIGINT,
  successful_generations BIGINT,
  auto_fixed_count BIGINT,
  user_accepted_count BIGINT,
  user_reverted_count BIGINT,
  avg_duration_ms NUMERIC,
  error_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_generations,
    COUNT(*) FILTER (WHERE NOT had_ts_errors AND NOT had_eslint_errors AND NOT had_runtime_errors)::BIGINT as successful_generations,
    COUNT(*) FILTER (WHERE auto_fix_succeeded = TRUE)::BIGINT as auto_fixed_count,
    COUNT(*) FILTER (WHERE was_accepted = TRUE)::BIGINT as user_accepted_count,
    COUNT(*) FILTER (WHERE was_reverted = TRUE)::BIGINT as user_reverted_count,
  ROUND(AVG(duration_ms)::NUMERIC, 2) as avg_duration_ms,
  CASE
    WHEN COUNT(*) > 0 THEN
      ROUND((COUNT(*) FILTER (WHERE had_ts_errors OR had_eslint_errors OR had_runtime_errors)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
    ELSE 0
  END as error_rate
  FROM public.playcraft_generation_outcomes
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

-- Get recent error patterns for analysis
CREATE OR REPLACE FUNCTION get_error_patterns(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  intent_type TEXT,
  error_count BIGINT,
  success_count BIGINT,
  auto_fix_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.intent_type,
    COUNT(*) FILTER (WHERE o.had_ts_errors OR o.had_eslint_errors OR o.had_runtime_errors)::BIGINT as error_count,
    COUNT(*) FILTER (WHERE NOT o.had_ts_errors AND NOT o.had_eslint_errors AND NOT o.had_runtime_errors)::BIGINT as success_count,
    CASE
      WHEN COUNT(*) FILTER (WHERE o.auto_fix_attempts > 0) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE o.auto_fix_succeeded = TRUE)::NUMERIC /
               COUNT(*) FILTER (WHERE o.auto_fix_attempts > 0)::NUMERIC) * 100, 2)
      ELSE 0
    END as auto_fix_rate
  FROM public.playcraft_generation_outcomes o
  WHERE o.user_id = p_user_id
    AND o.created_at > NOW() - INTERVAL '30 days'
    AND o.intent_type IS NOT NULL
  GROUP BY o.intent_type
  ORDER BY COUNT(*) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_outcome_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_error_patterns(UUID, INTEGER) TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE playcraft_generation_outcomes IS
  'Tracks the outcome of each AI generation including validation results and user feedback. Used for learning and analytics.';

COMMENT ON COLUMN playcraft_generation_outcomes.intent_type IS
  'Classification of user intent: create (new feature), modify (change existing), style (UI/UX), debug (fix errors), enhance (improve)';

COMMENT ON COLUMN playcraft_generation_outcomes.context_mode IS
  'How much context was sent to AI: full (all files), minimal (relevant only), outline (structure only)';

COMMENT ON COLUMN playcraft_generation_outcomes.was_accepted IS
  'NULL until user acts. TRUE if user kept the changes, FALSE if explicitly rejected.';

COMMENT ON COLUMN playcraft_generation_outcomes.user_corrections IS
  'Array of corrections the user made after AI generation. Useful for understanding failure modes.';

COMMENT ON FUNCTION get_outcome_stats(UUID) IS
  'Get aggregated outcome statistics for a user over the last 30 days.';

COMMENT ON FUNCTION get_error_patterns(UUID, INTEGER) IS
  'Analyze which intent types have the highest error rates for a user.';
