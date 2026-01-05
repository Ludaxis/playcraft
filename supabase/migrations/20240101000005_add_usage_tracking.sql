-- Migration: Add usage tracking and persistent rate limiting
-- This addresses critical security and cost control issues

-- =============================================================================
-- USER USAGE TRACKING TABLE
-- =============================================================================
-- Tracks AI generation usage per user for billing and rate limiting

CREATE TABLE IF NOT EXISTS playcraft_user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Daily usage (resets at midnight UTC)
    daily_requests INTEGER DEFAULT 0,
    daily_tokens_used INTEGER DEFAULT 0,
    daily_reset_at TIMESTAMPTZ DEFAULT (CURRENT_DATE + INTERVAL '1 day'),

    -- Monthly usage (for billing)
    monthly_requests INTEGER DEFAULT 0,
    monthly_tokens_used INTEGER DEFAULT 0,
    monthly_reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'),

    -- Lifetime stats
    total_requests INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,

    -- User limits (can be customized per user for different plans)
    daily_request_limit INTEGER DEFAULT 100,
    daily_token_limit INTEGER DEFAULT 500000,
    monthly_request_limit INTEGER DEFAULT 2000,
    monthly_token_limit INTEGER DEFAULT 10000000,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One record per user
    CONSTRAINT unique_user_usage UNIQUE (user_id)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON playcraft_user_usage(user_id);

-- Enable RLS
ALTER TABLE playcraft_user_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own usage"
    ON playcraft_user_usage FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update (edge function uses service role key)
CREATE POLICY "Service role manages usage"
    ON playcraft_user_usage FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- UPDATE RATE LIMITS TABLE
-- =============================================================================
-- Improve the existing rate limits table for better tracking

-- Add more columns to existing table if it exists
DO $$
BEGIN
    -- Add hourly tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'playcraft_rate_limits'
                   AND column_name = 'hourly_count') THEN
        ALTER TABLE playcraft_rate_limits ADD COLUMN hourly_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'playcraft_rate_limits'
                   AND column_name = 'hourly_reset_at') THEN
        ALTER TABLE playcraft_rate_limits ADD COLUMN hourly_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour';
    END IF;

    -- Add daily tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'playcraft_rate_limits'
                   AND column_name = 'daily_count') THEN
        ALTER TABLE playcraft_rate_limits ADD COLUMN daily_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'playcraft_rate_limits'
                   AND column_name = 'daily_reset_at') THEN
        ALTER TABLE playcraft_rate_limits ADD COLUMN daily_reset_at TIMESTAMPTZ DEFAULT CURRENT_DATE + INTERVAL '1 day';
    END IF;
END $$;

-- =============================================================================
-- HELPER FUNCTIONS FOR RATE LIMITING
-- =============================================================================

-- Function to check and increment rate limit (atomic operation)
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
    p_user_id UUID,
    p_endpoint TEXT DEFAULT 'generate'
)
RETURNS TABLE (
    allowed BOOLEAN,
    minute_remaining INTEGER,
    hourly_remaining INTEGER,
    daily_remaining INTEGER,
    retry_after_seconds INTEGER
) AS $$
DECLARE
    v_minute_limit INTEGER := 10;
    v_hourly_limit INTEGER := 100;
    v_daily_limit INTEGER := 500;
    v_record playcraft_rate_limits%ROWTYPE;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Upsert rate limit record
    INSERT INTO playcraft_rate_limits (user_id, endpoint, request_count, window_start, hourly_count, hourly_reset_at, daily_count, daily_reset_at)
    VALUES (p_user_id, p_endpoint, 0, v_now, 0, v_now + INTERVAL '1 hour', 0, CURRENT_DATE + INTERVAL '1 day')
    ON CONFLICT (user_id, endpoint) DO UPDATE SET
        -- Reset minute counter if window expired
        request_count = CASE
            WHEN playcraft_rate_limits.window_start + INTERVAL '1 minute' < v_now THEN 0
            ELSE playcraft_rate_limits.request_count
        END,
        window_start = CASE
            WHEN playcraft_rate_limits.window_start + INTERVAL '1 minute' < v_now THEN v_now
            ELSE playcraft_rate_limits.window_start
        END,
        -- Reset hourly counter if window expired
        hourly_count = CASE
            WHEN playcraft_rate_limits.hourly_reset_at < v_now THEN 0
            ELSE playcraft_rate_limits.hourly_count
        END,
        hourly_reset_at = CASE
            WHEN playcraft_rate_limits.hourly_reset_at < v_now THEN v_now + INTERVAL '1 hour'
            ELSE playcraft_rate_limits.hourly_reset_at
        END,
        -- Reset daily counter if window expired
        daily_count = CASE
            WHEN playcraft_rate_limits.daily_reset_at < v_now THEN 0
            ELSE playcraft_rate_limits.daily_count
        END,
        daily_reset_at = CASE
            WHEN playcraft_rate_limits.daily_reset_at < v_now THEN CURRENT_DATE + INTERVAL '1 day'
            ELSE playcraft_rate_limits.daily_reset_at
        END
    RETURNING * INTO v_record;

    -- Check limits
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

    -- Increment counters
    UPDATE playcraft_rate_limits SET
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user credits/usage
CREATE OR REPLACE FUNCTION check_user_credits(p_user_id UUID)
RETURNS TABLE (
    has_credits BOOLEAN,
    daily_requests_remaining INTEGER,
    daily_tokens_remaining INTEGER,
    monthly_requests_remaining INTEGER,
    monthly_tokens_remaining INTEGER
) AS $$
DECLARE
    v_usage playcraft_user_usage%ROWTYPE;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Get or create usage record
    INSERT INTO playcraft_user_usage (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO UPDATE SET
        -- Reset daily if expired
        daily_requests = CASE
            WHEN playcraft_user_usage.daily_reset_at < v_now THEN 0
            ELSE playcraft_user_usage.daily_requests
        END,
        daily_tokens_used = CASE
            WHEN playcraft_user_usage.daily_reset_at < v_now THEN 0
            ELSE playcraft_user_usage.daily_tokens_used
        END,
        daily_reset_at = CASE
            WHEN playcraft_user_usage.daily_reset_at < v_now THEN CURRENT_DATE + INTERVAL '1 day'
            ELSE playcraft_user_usage.daily_reset_at
        END,
        -- Reset monthly if expired
        monthly_requests = CASE
            WHEN playcraft_user_usage.monthly_reset_at < v_now THEN 0
            ELSE playcraft_user_usage.monthly_requests
        END,
        monthly_tokens_used = CASE
            WHEN playcraft_user_usage.monthly_reset_at < v_now THEN 0
            ELSE playcraft_user_usage.monthly_tokens_used
        END,
        monthly_reset_at = CASE
            WHEN playcraft_user_usage.monthly_reset_at < v_now THEN DATE_TRUNC('month', v_now) + INTERVAL '1 month'
            ELSE playcraft_user_usage.monthly_reset_at
        END
    RETURNING * INTO v_usage;

    RETURN QUERY SELECT
        (v_usage.daily_requests < v_usage.daily_request_limit AND v_usage.monthly_requests < v_usage.monthly_request_limit),
        GREATEST(0, v_usage.daily_request_limit - v_usage.daily_requests),
        GREATEST(0, v_usage.daily_token_limit - v_usage.daily_tokens_used),
        GREATEST(0, v_usage.monthly_request_limit - v_usage.monthly_requests),
        GREATEST(0, v_usage.monthly_token_limit - v_usage.monthly_tokens_used);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record usage after successful generation
CREATE OR REPLACE FUNCTION record_usage(
    p_user_id UUID,
    p_tokens_used INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    UPDATE playcraft_user_usage SET
        daily_requests = daily_requests + 1,
        daily_tokens_used = daily_tokens_used + p_tokens_used,
        monthly_requests = monthly_requests + 1,
        monthly_tokens_used = monthly_tokens_used + p_tokens_used,
        total_requests = total_requests + 1,
        total_tokens_used = total_tokens_used + p_tokens_used,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (functions are SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION check_and_increment_rate_limit(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_usage(UUID, INTEGER) TO authenticated;

-- =============================================================================
-- AUTO UPDATED_AT TRIGGER
-- =============================================================================

CREATE TRIGGER update_user_usage_updated_at
    BEFORE UPDATE ON playcraft_user_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
