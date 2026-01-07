-- ============================================================================
-- Task Ledger System for PlayCraft
-- Tracks current goals, substeps, blockers, and deltas across turns
-- ============================================================================

-- Extend playcraft_project_memory with task ledger fields
ALTER TABLE playcraft_project_memory
ADD COLUMN IF NOT EXISTS current_goal TEXT,
ADD COLUMN IF NOT EXISTS goal_substeps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS known_blockers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_known_state TEXT;

-- Add comment for documentation
COMMENT ON COLUMN playcraft_project_memory.current_goal IS 'Current high-level goal being worked on';
COMMENT ON COLUMN playcraft_project_memory.goal_substeps IS 'Array of {step: string, done: boolean} objects';
COMMENT ON COLUMN playcraft_project_memory.known_blockers IS 'Array of blocker strings';
COMMENT ON COLUMN playcraft_project_memory.last_known_state IS 'Brief description of current state';

-- ============================================================================
-- Task Deltas Table
-- Records what was tried, changed, and planned for each turn
-- ============================================================================

CREATE TABLE IF NOT EXISTS playcraft_task_deltas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  session_id UUID REFERENCES playcraft_chat_sessions(id) ON DELETE SET NULL,
  turn_number INTEGER NOT NULL DEFAULT 1,

  -- Delta content
  user_request TEXT,              -- What the user asked for
  what_tried TEXT,                -- What the AI attempted to do
  what_changed TEXT[],            -- Array of file paths that were modified
  what_succeeded TEXT,            -- What worked
  what_failed TEXT,               -- What didn't work (if any)
  what_next TEXT,                 -- Planned next step

  -- Metadata
  tokens_used INTEGER,            -- Tokens consumed in this turn
  duration_ms INTEGER,            -- Time taken for generation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_task_deltas_project
ON playcraft_task_deltas(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_deltas_session
ON playcraft_task_deltas(session_id, turn_number);

-- Enable RLS
ALTER TABLE playcraft_task_deltas ENABLE ROW LEVEL SECURITY;

-- RLS policies (users can only access their own project's deltas)
CREATE POLICY "Users can view their project deltas"
ON playcraft_task_deltas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM playcraft_projects p
    WHERE p.id = playcraft_task_deltas.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their project deltas"
ON playcraft_task_deltas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM playcraft_projects p
    WHERE p.id = playcraft_task_deltas.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their project deltas"
ON playcraft_task_deltas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM playcraft_projects p
    WHERE p.id = playcraft_task_deltas.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their project deltas"
ON playcraft_task_deltas FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM playcraft_projects p
    WHERE p.id = playcraft_task_deltas.project_id
    AND p.user_id = auth.uid()
  )
);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Get the most recent delta for a project
CREATE OR REPLACE FUNCTION get_latest_delta(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  turn_number INTEGER,
  user_request TEXT,
  what_tried TEXT,
  what_changed TEXT[],
  what_succeeded TEXT,
  what_failed TEXT,
  what_next TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    id,
    turn_number,
    user_request,
    what_tried,
  what_changed,
  what_succeeded,
  what_failed,
  what_next,
  created_at
  FROM public.playcraft_task_deltas
  WHERE project_id = p_project_id
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE SQL STABLE SET search_path = pg_catalog, public;

-- Get recent deltas for context (last N turns)
CREATE OR REPLACE FUNCTION get_recent_deltas(
  p_project_id UUID,
  p_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  turn_number INTEGER,
  user_request TEXT,
  what_tried TEXT,
  what_changed TEXT[],
  what_succeeded TEXT,
  what_failed TEXT,
  what_next TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SET search_path = pg_catalog, public
AS $$
  SELECT
    id,
    turn_number,
    user_request,
    what_tried,
    what_changed,
    what_succeeded,
    what_failed,
    what_next,
    created_at
  FROM public.playcraft_task_deltas
  WHERE project_id = p_project_id
  ORDER BY created_at DESC
  LIMIT p_limit;
$$;

-- Get task ledger (current goal + substeps + blockers + recent delta)
CREATE OR REPLACE FUNCTION get_task_ledger(p_project_id UUID)
RETURNS TABLE (
  current_goal TEXT,
  goal_substeps JSONB,
  known_blockers JSONB,
  last_known_state TEXT,
  last_delta_what_tried TEXT,
  last_delta_what_changed TEXT[],
  last_delta_what_next TEXT
)
LANGUAGE SQL
STABLE
SET search_path = pg_catalog, public
AS $$
  SELECT
    m.current_goal,
    m.goal_substeps,
    m.known_blockers,
    m.last_known_state,
    d.what_tried,
    d.what_changed,
    d.what_next
  FROM public.playcraft_project_memory m
  LEFT JOIN LATERAL (
    SELECT what_tried, what_changed, what_next
    FROM public.playcraft_task_deltas
    WHERE project_id = p_project_id
    ORDER BY created_at DESC
    LIMIT 1
  ) d ON true
  WHERE m.project_id = p_project_id;
$$;

-- Get next turn number for a project
CREATE OR REPLACE FUNCTION get_next_turn_number(p_project_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SET search_path = pg_catalog, public
AS $$
  SELECT COALESCE(MAX(turn_number), 0) + 1
  FROM public.playcraft_task_deltas
  WHERE project_id = p_project_id;
$$;
