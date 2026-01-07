-- =============================================================================
-- CONSOLIDATE REMAINING MULTIPLE PERMISSIVE SELECT POLICIES
-- =============================================================================
-- This migration fixes the remaining multiple_permissive_policies warnings by
-- consolidating SELECT policies on:
-- 1. playcraft_projects - had "Users can view own" + "Anyone can view published"
-- 2. playcraft_user_usage - had "Users can view own" + "Service role manages" (FOR ALL)
-- =============================================================================

-- =============================================================================
-- 1. PLAYCRAFT_PROJECTS: Consolidate SELECT policies
-- =============================================================================
-- Combine "Users can view own projects" and "Anyone can view published games"
-- into a single SELECT policy with OR logic

DROP POLICY IF EXISTS "Users can view own projects" ON playcraft_projects;
DROP POLICY IF EXISTS "Anyone can view published games" ON playcraft_projects;

-- Single consolidated SELECT policy
CREATE POLICY "Users can view accessible projects"
    ON playcraft_projects FOR SELECT
    USING (
        -- User can view their own projects
        (select auth.uid()) = user_id
        OR
        -- Anyone can view published public games
        (status = 'published' AND is_public = true)
    );

-- =============================================================================
-- 2. PLAYCRAFT_USER_USAGE: Split FOR ALL into specific operations
-- =============================================================================
-- The "Service role manages usage" policy was FOR ALL (which includes SELECT),
-- creating a duplicate SELECT policy. Split it into INSERT, UPDATE, DELETE only.

DROP POLICY IF EXISTS "Users can view own usage" ON playcraft_user_usage;
DROP POLICY IF EXISTS "Service role manages usage" ON playcraft_user_usage;

-- Users can only SELECT their own usage
CREATE POLICY "Users can view own usage"
    ON playcraft_user_usage FOR SELECT
    USING ((select auth.uid()) = user_id);

-- Service role can INSERT usage records
CREATE POLICY "Service role can insert usage"
    ON playcraft_user_usage FOR INSERT
    WITH CHECK ((select auth.role()) = 'service_role');

-- Service role can UPDATE usage records
CREATE POLICY "Service role can update usage"
    ON playcraft_user_usage FOR UPDATE
    USING ((select auth.role()) = 'service_role');

-- Service role can DELETE usage records
CREATE POLICY "Service role can delete usage"
    ON playcraft_user_usage FOR DELETE
    USING ((select auth.role()) = 'service_role');

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
