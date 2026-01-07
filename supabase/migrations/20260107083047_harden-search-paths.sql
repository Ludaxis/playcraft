-- =============================================================================
-- HARDEN FUNCTION SEARCH PATHS
-- =============================================================================
-- This migration ensures ALL functions have explicit SET search_path to prevent:
-- 1. Unpredictable resolution of unqualified identifiers
-- 2. Potential security risks from search_path hijacking
-- 3. Non-deterministic behavior across roles/environments
-- =============================================================================

-- =============================================================================
-- 1. Rate Limiting & Usage Functions
-- =============================================================================

-- check_and_increment_rate_limit
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
    p_user_id UUID,
    p_endpoint TEXT DEFAULT 'generate'
)
RETURNS TABLE (
    allowed BOOLEAN,
    minute_remaining INTEGER,
    hourly_remaining INTEGER,
    daily_remaining INTEGER,
    retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_minute_limit INTEGER := 10;
    v_hourly_limit INTEGER := 100;
    v_daily_limit INTEGER := 500;
    v_record public.playcraft_rate_limits%ROWTYPE;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Upsert rate limit record
    INSERT INTO public.playcraft_rate_limits (user_id, endpoint, request_count, window_start, hourly_count, hourly_reset_at, daily_count, daily_reset_at)
    VALUES (p_user_id, p_endpoint, 0, v_now, 0, v_now + INTERVAL '1 hour', 0, CURRENT_DATE + INTERVAL '1 day')
    ON CONFLICT (user_id, endpoint) DO UPDATE SET
        request_count = CASE
            WHEN public.playcraft_rate_limits.window_start + INTERVAL '1 minute' < v_now THEN 0
            ELSE public.playcraft_rate_limits.request_count
        END,
        window_start = CASE
            WHEN public.playcraft_rate_limits.window_start + INTERVAL '1 minute' < v_now THEN v_now
            ELSE public.playcraft_rate_limits.window_start
        END,
        hourly_count = CASE
            WHEN public.playcraft_rate_limits.hourly_reset_at < v_now THEN 0
            ELSE public.playcraft_rate_limits.hourly_count
        END,
        hourly_reset_at = CASE
            WHEN public.playcraft_rate_limits.hourly_reset_at < v_now THEN v_now + INTERVAL '1 hour'
            ELSE public.playcraft_rate_limits.hourly_reset_at
        END,
        daily_count = CASE
            WHEN public.playcraft_rate_limits.daily_reset_at < v_now THEN 0
            ELSE public.playcraft_rate_limits.daily_count
        END,
        daily_reset_at = CASE
            WHEN public.playcraft_rate_limits.daily_reset_at < v_now THEN CURRENT_DATE + INTERVAL '1 day'
            ELSE public.playcraft_rate_limits.daily_reset_at
        END
    RETURNING * INTO v_record;

    IF v_record.request_count >= v_minute_limit THEN
        RETURN QUERY SELECT
            FALSE,
            0,
            v_hourly_limit - v_record.hourly_count,
            v_daily_limit - v_record.daily_count,
            EXTRACT(EPOCH FROM (v_record.window_start + INTERVAL '1 minute' - v_now))::INTEGER;
        RETURN;
    END IF;

    IF v_record.hourly_count >= v_hourly_limit THEN
        RETURN QUERY SELECT
            FALSE,
            v_minute_limit - v_record.request_count,
            0,
            v_daily_limit - v_record.daily_count,
            EXTRACT(EPOCH FROM (v_record.hourly_reset_at - v_now))::INTEGER;
        RETURN;
    END IF;

    IF v_record.daily_count >= v_daily_limit THEN
        RETURN QUERY SELECT
            FALSE,
            v_minute_limit - v_record.request_count,
            v_hourly_limit - v_record.hourly_count,
            0,
            EXTRACT(EPOCH FROM (v_record.daily_reset_at - v_now))::INTEGER;
        RETURN;
    END IF;

    UPDATE public.playcraft_rate_limits SET
        request_count = request_count + 1,
        hourly_count = hourly_count + 1,
        daily_count = daily_count + 1
    WHERE user_id = p_user_id AND endpoint = p_endpoint;

    RETURN QUERY SELECT
        TRUE,
        v_minute_limit - v_record.request_count - 1,
        v_hourly_limit - v_record.hourly_count - 1,
        v_daily_limit - v_record.daily_count - 1,
        0;
END;
$$;

-- record_usage
CREATE OR REPLACE FUNCTION public.record_usage(
    p_user_id UUID,
    p_tokens_used INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    UPDATE public.playcraft_user_usage SET
        daily_requests = daily_requests + 1,
        daily_tokens_used = daily_tokens_used + p_tokens_used,
        monthly_requests = monthly_requests + 1,
        monthly_tokens_used = monthly_tokens_used + p_tokens_used,
        total_requests = total_requests + 1,
        total_tokens_used = total_tokens_used + p_tokens_used,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$;

-- check_user_credits
CREATE OR REPLACE FUNCTION public.check_user_credits(p_user_id UUID)
RETURNS TABLE (
    has_credits BOOLEAN,
    daily_requests_remaining INTEGER,
    daily_tokens_remaining INTEGER,
    monthly_requests_remaining INTEGER,
    monthly_tokens_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_usage public.playcraft_user_usage%ROWTYPE;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    INSERT INTO public.playcraft_user_usage (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO UPDATE SET
        daily_requests = CASE
            WHEN public.playcraft_user_usage.daily_reset_at < v_now THEN 0
            ELSE public.playcraft_user_usage.daily_requests
        END,
        daily_tokens_used = CASE
            WHEN public.playcraft_user_usage.daily_reset_at < v_now THEN 0
            ELSE public.playcraft_user_usage.daily_tokens_used
        END,
        daily_reset_at = CASE
            WHEN public.playcraft_user_usage.daily_reset_at < v_now THEN CURRENT_DATE + INTERVAL '1 day'
            ELSE public.playcraft_user_usage.daily_reset_at
        END,
        monthly_requests = CASE
            WHEN public.playcraft_user_usage.monthly_reset_at < v_now THEN 0
            ELSE public.playcraft_user_usage.monthly_requests
        END,
        monthly_tokens_used = CASE
            WHEN public.playcraft_user_usage.monthly_reset_at < v_now THEN 0
            ELSE public.playcraft_user_usage.monthly_tokens_used
        END,
        monthly_reset_at = CASE
            WHEN public.playcraft_user_usage.monthly_reset_at < v_now THEN DATE_TRUNC('month', v_now) + INTERVAL '1 month'
            ELSE public.playcraft_user_usage.monthly_reset_at
        END
    RETURNING * INTO v_usage;

    RETURN QUERY SELECT
        (v_usage.daily_requests < v_usage.daily_request_limit AND v_usage.monthly_requests < v_usage.monthly_request_limit),
        GREATEST(0, v_usage.daily_request_limit - v_usage.daily_requests),
        GREATEST(0, v_usage.daily_token_limit - v_usage.daily_tokens_used),
        GREATEST(0, v_usage.monthly_request_limit - v_usage.monthly_requests),
        GREATEST(0, v_usage.monthly_token_limit - v_usage.monthly_tokens_used);
END;
$$;

-- =============================================================================
-- 2. File & Project Version Functions
-- =============================================================================

-- increment_file_version
CREATE OR REPLACE FUNCTION public.increment_file_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    NEW.version = OLD.version + 1;
    NEW.updated_at = NOW();
    NEW.size_bytes = COALESCE(LENGTH(NEW.content), 0);
    RETURN NEW;
END;
$$;

-- increment_project_version
CREATE OR REPLACE FUNCTION public.increment_project_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    NEW.version = OLD.version + 1;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- get_project_size
CREATE OR REPLACE FUNCTION public.get_project_size(p_project_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(size_bytes) FROM public.playcraft_project_files WHERE project_id = p_project_id),
        0
    );
END;
$$;

-- =============================================================================
-- 3. Publishing Functions
-- =============================================================================

-- increment_play_count
CREATE OR REPLACE FUNCTION public.increment_play_count(game_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    UPDATE public.playcraft_projects
    SET play_count = play_count + 1
    WHERE id = game_id AND status = 'published';
END;
$$;

-- =============================================================================
-- 4. Generation Job Functions
-- =============================================================================

-- claim_generation_job
CREATE OR REPLACE FUNCTION public.claim_generation_job()
RETURNS public.playcraft_generation_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
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

        SELECT * INTO claimed_job
        FROM public.playcraft_generation_jobs
        WHERE id = claimed_job.id;
    END IF;

    RETURN claimed_job;
END;
$$;

-- cleanup_stale_jobs
CREATE OR REPLACE FUNCTION public.cleanup_stale_jobs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    WITH stale AS (
        UPDATE public.playcraft_generation_jobs
        SET
            status = CASE
                WHEN attempts < max_attempts THEN 'queued'
                ELSE 'failed'
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
$$;

-- get_user_active_jobs_count
CREATE OR REPLACE FUNCTION public.get_user_active_jobs_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.playcraft_generation_jobs
        WHERE user_id = p_user_id
            AND status IN ('queued', 'processing')
    );
END;
$$;

-- =============================================================================
-- 5. Semantic Search Functions
-- =============================================================================

-- search_code_chunks
CREATE OR REPLACE FUNCTION public.search_code_chunks(
    p_project_id UUID,
    p_query_embedding vector(1024),
    p_limit INTEGER DEFAULT 5,
    p_similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
    chunk_id UUID,
    file_path TEXT,
    chunk_index INTEGER,
    start_line INTEGER,
    end_line INTEGER,
    content TEXT,
    chunk_type TEXT,
    symbol_name TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cc.id AS chunk_id,
        cc.file_path,
        cc.chunk_index,
        cc.start_line,
        cc.end_line,
        cc.content,
        cc.chunk_type,
        cc.symbol_name,
        1 - (cc.embedding <=> p_query_embedding) AS similarity
    FROM public.playcraft_code_chunks cc
    WHERE cc.project_id = p_project_id
        AND cc.embedding IS NOT NULL
        AND 1 - (cc.embedding <=> p_query_embedding) >= p_similarity_threshold
    ORDER BY cc.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$;

-- get_file_dependents
CREATE OR REPLACE FUNCTION public.get_file_dependents(
    p_project_id UUID,
    p_file_path TEXT
)
RETURNS TABLE (
    dependent_file TEXT,
    imported_symbols TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        fd.from_file AS dependent_file,
        fd.imported_symbols
    FROM public.playcraft_file_dependencies fd
    WHERE fd.project_id = p_project_id
        AND fd.to_file = p_file_path;
END;
$$;

-- get_file_dependencies
CREATE OR REPLACE FUNCTION public.get_file_dependencies(
    p_project_id UUID,
    p_file_path TEXT
)
RETURNS TABLE (
    dependency_file TEXT,
    imported_symbols TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        fd.to_file AS dependency_file,
        fd.imported_symbols
    FROM public.playcraft_file_dependencies fd
    WHERE fd.project_id = p_project_id
        AND fd.from_file = p_file_path;
END;
$$;

-- =============================================================================
-- 6. Generation Outcomes Functions
-- =============================================================================

-- get_outcome_stats
CREATE OR REPLACE FUNCTION public.get_outcome_stats(p_user_id UUID)
RETURNS TABLE (
    total_generations BIGINT,
    successful_generations BIGINT,
    auto_fixed_count BIGINT,
    user_accepted_count BIGINT,
    user_reverted_count BIGINT,
    avg_duration_ms NUMERIC,
    error_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
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
$$;

-- get_error_patterns
CREATE OR REPLACE FUNCTION public.get_error_patterns(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    intent_type TEXT,
    error_count BIGINT,
    success_count BIGINT,
    auto_fix_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
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
$$;

-- =============================================================================
-- 7. Task Ledger Functions
-- =============================================================================

-- get_task_ledger
CREATE OR REPLACE FUNCTION public.get_task_ledger(p_project_id UUID)
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

-- get_recent_deltas (aliased as get_recent_task_deltas)
CREATE OR REPLACE FUNCTION public.get_recent_deltas(
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

-- get_latest_delta
CREATE OR REPLACE FUNCTION public.get_latest_delta(p_project_id UUID)
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
    LIMIT 1;
$$;

-- get_next_turn_number
CREATE OR REPLACE FUNCTION public.get_next_turn_number(p_project_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SET search_path = pg_catalog, public
AS $$
    SELECT COALESCE(MAX(turn_number), 0) + 1
    FROM public.playcraft_task_deltas
    WHERE project_id = p_project_id;
$$;

-- =============================================================================
-- 8. Storage Functions
-- =============================================================================

-- get_file_storage_path
CREATE OR REPLACE FUNCTION public.get_file_storage_path(
    p_user_id UUID,
    p_project_id UUID,
    p_file_path TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, public
AS $$
BEGIN
    RETURN p_user_id::text || '/' || p_project_id::text || '/' ||
           CASE WHEN LEFT(p_file_path, 1) = '/' THEN SUBSTRING(p_file_path FROM 2) ELSE p_file_path END;
END;
$$;

-- list_project_storage_paths
CREATE OR REPLACE FUNCTION public.list_project_storage_paths(p_project_id UUID)
RETURNS TABLE (
    file_path TEXT,
    storage_path TEXT,
    size_bytes INTEGER,
    content_hash TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pf.path,
        pf.storage_path,
        pf.size_bytes,
        pf.content_hash
    FROM public.playcraft_project_files pf
    WHERE pf.project_id = p_project_id
        AND pf.storage_path IS NOT NULL
    ORDER BY pf.path;
END;
$$;

-- =============================================================================
-- 9. Common Trigger Functions
-- =============================================================================

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
