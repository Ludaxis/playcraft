-- =============================================================================
-- OPTIMIZE RLS POLICIES
-- =============================================================================
-- This migration optimizes RLS policies by:
-- 1. Replacing auth.uid() with (select auth.uid()) to enable initplan optimization
-- 2. Consolidating duplicate permissive policies on the same tables
--
-- The (select auth.uid()) pattern allows PostgreSQL to evaluate the user ID once
-- per query instead of re-evaluating it for each row, significantly improving
-- performance for tables with many rows.
-- =============================================================================

-- =============================================================================
-- 1. PLAYCRAFT_USER_SETTINGS (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own settings" ON playcraft_user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON playcraft_user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON playcraft_user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON playcraft_user_settings;

CREATE POLICY "Users can view own settings"
    ON playcraft_user_settings FOR SELECT
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own settings"
    ON playcraft_user_settings FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own settings"
    ON playcraft_user_settings FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own settings"
    ON playcraft_user_settings FOR DELETE
    USING ((select auth.uid()) = user_id);

-- =============================================================================
-- 2. PLAYCRAFT_PROJECTS (4 user policies + 1 public policy)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own projects" ON playcraft_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON playcraft_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON playcraft_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON playcraft_projects;
DROP POLICY IF EXISTS "Anyone can view published games" ON playcraft_projects;

-- User policies with optimized auth check
CREATE POLICY "Users can view own projects"
    ON playcraft_projects FOR SELECT
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own projects"
    ON playcraft_projects FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own projects"
    ON playcraft_projects FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own projects"
    ON playcraft_projects FOR DELETE
    USING ((select auth.uid()) = user_id);

-- Public policy (no auth.uid() needed - purely status-based)
CREATE POLICY "Anyone can view published games"
    ON playcraft_projects FOR SELECT
    USING (status = 'published' AND is_public = true);

-- =============================================================================
-- 3. PLAYCRAFT_CHAT_SESSIONS (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own chat sessions" ON playcraft_chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON playcraft_chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON playcraft_chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON playcraft_chat_sessions;

CREATE POLICY "Users can view own chat sessions"
    ON playcraft_chat_sessions FOR SELECT
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own chat sessions"
    ON playcraft_chat_sessions FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own chat sessions"
    ON playcraft_chat_sessions FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own chat sessions"
    ON playcraft_chat_sessions FOR DELETE
    USING ((select auth.uid()) = user_id);

-- =============================================================================
-- 4. FEEDBACK (2 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can submit feedback" ON feedback;

CREATE POLICY "Users can view own feedback"
    ON feedback FOR SELECT
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can submit feedback"
    ON feedback FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id OR user_id IS NULL);

-- =============================================================================
-- 5. PLAYCRAFT_PROJECT_FILES (4 policies with subquery)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own project files" ON playcraft_project_files;
DROP POLICY IF EXISTS "Users can insert own project files" ON playcraft_project_files;
DROP POLICY IF EXISTS "Users can update own project files" ON playcraft_project_files;
DROP POLICY IF EXISTS "Users can delete own project files" ON playcraft_project_files;

CREATE POLICY "Users can view own project files"
    ON playcraft_project_files FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert own project files"
    ON playcraft_project_files FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update own project files"
    ON playcraft_project_files FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete own project files"
    ON playcraft_project_files FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

-- =============================================================================
-- 6. PLAYCRAFT_PROJECT_FILE_HISTORY (2 policies with subquery)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own file history" ON playcraft_project_file_history;
DROP POLICY IF EXISTS "Users can insert file history" ON playcraft_project_file_history;

CREATE POLICY "Users can view own file history"
    ON playcraft_project_file_history FOR SELECT
    USING (
        file_id IN (
            SELECT pf.id FROM playcraft_project_files pf
            JOIN playcraft_projects p ON pf.project_id = p.id
            WHERE p.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert file history"
    ON playcraft_project_file_history FOR INSERT
    WITH CHECK (
        file_id IN (
            SELECT pf.id FROM playcraft_project_files pf
            JOIN playcraft_projects p ON pf.project_id = p.id
            WHERE p.user_id = (select auth.uid())
        )
    );

-- =============================================================================
-- 7. PLAYCRAFT_PROJECT_MEMORY (4 policies with subquery)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own project memory" ON playcraft_project_memory;
DROP POLICY IF EXISTS "Users can insert own project memory" ON playcraft_project_memory;
DROP POLICY IF EXISTS "Users can update own project memory" ON playcraft_project_memory;
DROP POLICY IF EXISTS "Users can delete own project memory" ON playcraft_project_memory;

CREATE POLICY "Users can view own project memory"
    ON playcraft_project_memory FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert own project memory"
    ON playcraft_project_memory FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update own project memory"
    ON playcraft_project_memory FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete own project memory"
    ON playcraft_project_memory FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

-- =============================================================================
-- 8. PLAYCRAFT_FILE_HASHES (4 policies with subquery)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own file hashes" ON playcraft_file_hashes;
DROP POLICY IF EXISTS "Users can insert own file hashes" ON playcraft_file_hashes;
DROP POLICY IF EXISTS "Users can update own file hashes" ON playcraft_file_hashes;
DROP POLICY IF EXISTS "Users can delete own file hashes" ON playcraft_file_hashes;

CREATE POLICY "Users can view own file hashes"
    ON playcraft_file_hashes FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert own file hashes"
    ON playcraft_file_hashes FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update own file hashes"
    ON playcraft_file_hashes FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete own file hashes"
    ON playcraft_file_hashes FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

-- =============================================================================
-- 9. PLAYCRAFT_CONVERSATION_SUMMARIES (4 policies with subquery)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own conversation summaries" ON playcraft_conversation_summaries;
DROP POLICY IF EXISTS "Users can insert own conversation summaries" ON playcraft_conversation_summaries;
DROP POLICY IF EXISTS "Users can update own conversation summaries" ON playcraft_conversation_summaries;
DROP POLICY IF EXISTS "Users can delete own conversation summaries" ON playcraft_conversation_summaries;

CREATE POLICY "Users can view own conversation summaries"
    ON playcraft_conversation_summaries FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert own conversation summaries"
    ON playcraft_conversation_summaries FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update own conversation summaries"
    ON playcraft_conversation_summaries FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete own conversation summaries"
    ON playcraft_conversation_summaries FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

-- =============================================================================
-- 10. PLAYCRAFT_CODE_CHUNKS (4 policies with subquery)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view chunks for their projects" ON playcraft_code_chunks;
DROP POLICY IF EXISTS "Users can insert chunks for their projects" ON playcraft_code_chunks;
DROP POLICY IF EXISTS "Users can update chunks for their projects" ON playcraft_code_chunks;
DROP POLICY IF EXISTS "Users can delete chunks for their projects" ON playcraft_code_chunks;

CREATE POLICY "Users can view chunks for their projects"
    ON playcraft_code_chunks FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert chunks for their projects"
    ON playcraft_code_chunks FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update chunks for their projects"
    ON playcraft_code_chunks FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete chunks for their projects"
    ON playcraft_code_chunks FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

-- =============================================================================
-- 11. PLAYCRAFT_FILE_INDEX (CONSOLIDATE: had SELECT + ALL = 2 permissive SELECTs)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view file index for their projects" ON playcraft_file_index;
DROP POLICY IF EXISTS "Users can manage file index for their projects" ON playcraft_file_index;

-- Consolidated: single policy per operation (no duplicate SELECTs)
CREATE POLICY "Users can select file index for their projects"
    ON playcraft_file_index FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert file index for their projects"
    ON playcraft_file_index FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update file index for their projects"
    ON playcraft_file_index FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete file index for their projects"
    ON playcraft_file_index FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

-- =============================================================================
-- 12. PLAYCRAFT_FILE_DEPENDENCIES (CONSOLIDATE: had SELECT + ALL = 2 permissive SELECTs)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view dependencies for their projects" ON playcraft_file_dependencies;
DROP POLICY IF EXISTS "Users can manage dependencies for their projects" ON playcraft_file_dependencies;

-- Consolidated: single policy per operation (no duplicate SELECTs)
CREATE POLICY "Users can select dependencies for their projects"
    ON playcraft_file_dependencies FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert dependencies for their projects"
    ON playcraft_file_dependencies FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update dependencies for their projects"
    ON playcraft_file_dependencies FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete dependencies for their projects"
    ON playcraft_file_dependencies FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM playcraft_projects WHERE user_id = (select auth.uid())
        )
    );

-- =============================================================================
-- 13. PLAYCRAFT_GENERATION_JOBS (3 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own jobs" ON playcraft_generation_jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON playcraft_generation_jobs;
DROP POLICY IF EXISTS "Users can cancel own queued jobs" ON playcraft_generation_jobs;

CREATE POLICY "Users can view own jobs"
    ON playcraft_generation_jobs FOR SELECT
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own jobs"
    ON playcraft_generation_jobs FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can cancel own queued jobs"
    ON playcraft_generation_jobs FOR UPDATE
    USING ((select auth.uid()) = user_id AND status = 'queued')
    WITH CHECK (status = 'cancelled');

-- =============================================================================
-- 14. PLAYCRAFT_GENERATION_OUTCOMES (3 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own outcomes" ON playcraft_generation_outcomes;
DROP POLICY IF EXISTS "Users can insert own outcomes" ON playcraft_generation_outcomes;
DROP POLICY IF EXISTS "Users can update own outcomes" ON playcraft_generation_outcomes;

CREATE POLICY "Users can view own outcomes"
    ON playcraft_generation_outcomes FOR SELECT
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own outcomes"
    ON playcraft_generation_outcomes FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own outcomes"
    ON playcraft_generation_outcomes FOR UPDATE
    USING ((select auth.uid()) = user_id);

-- =============================================================================
-- 15. PLAYCRAFT_USER_USAGE (CONSOLIDATE: had SELECT + ALL with different roles)
-- =============================================================================
-- This table has special handling: users can only SELECT, service_role can do ALL
-- Keep separate policies for different role requirements

DROP POLICY IF EXISTS "Users can view own usage" ON playcraft_user_usage;
DROP POLICY IF EXISTS "Service role manages usage" ON playcraft_user_usage;

-- Users can only view their own usage
CREATE POLICY "Users can view own usage"
    ON playcraft_user_usage FOR SELECT
    USING ((select auth.uid()) = user_id);

-- Service role can manage all usage (INSERT/UPDATE/DELETE)
-- Note: service_role bypasses RLS by default, but explicit policy for clarity
CREATE POLICY "Service role manages usage"
    ON playcraft_user_usage FOR ALL
    USING ((select auth.role()) = 'service_role')
    WITH CHECK ((select auth.role()) = 'service_role');

-- =============================================================================
-- 16. PLAYCRAFT_TASK_DELTAS (4 policies with EXISTS subquery)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their project deltas" ON playcraft_task_deltas;
DROP POLICY IF EXISTS "Users can insert their project deltas" ON playcraft_task_deltas;
DROP POLICY IF EXISTS "Users can update their project deltas" ON playcraft_task_deltas;
DROP POLICY IF EXISTS "Users can delete their project deltas" ON playcraft_task_deltas;

CREATE POLICY "Users can view their project deltas"
    ON playcraft_task_deltas FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM playcraft_projects p
            WHERE p.id = playcraft_task_deltas.project_id
            AND p.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert their project deltas"
    ON playcraft_task_deltas FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM playcraft_projects p
            WHERE p.id = playcraft_task_deltas.project_id
            AND p.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update their project deltas"
    ON playcraft_task_deltas FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM playcraft_projects p
            WHERE p.id = playcraft_task_deltas.project_id
            AND p.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete their project deltas"
    ON playcraft_task_deltas FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM playcraft_projects p
            WHERE p.id = playcraft_task_deltas.project_id
            AND p.user_id = (select auth.uid())
        )
    );

-- =============================================================================
-- 17. STORAGE.OBJECTS (project-files bucket)
-- =============================================================================
-- Storage policies use auth.uid()::text for folder comparison
-- Optimize with (select auth.uid())::text

DROP POLICY IF EXISTS "Users can read own project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own project files" ON storage.objects;

CREATE POLICY "Users can read own project files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'project-files'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

CREATE POLICY "Users can upload own project files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'project-files'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

CREATE POLICY "Users can update own project files"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'project-files'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    )
    WITH CHECK (
        bucket_id = 'project-files'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

CREATE POLICY "Users can delete own project files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'project-files'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- =============================================================================
-- 18. STORAGE.OBJECTS (published-games bucket)
-- =============================================================================

DROP POLICY IF EXISTS "Users can upload to their published-games folder" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read published games files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their published-games files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their published-games files" ON storage.objects;

-- Public read policy (no auth needed)
CREATE POLICY "Anyone can read published games files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'published-games');

-- User upload policy
CREATE POLICY "Users can upload to their published-games folder"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'published-games' AND
        (select auth.role()) = 'authenticated' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- User update policy
CREATE POLICY "Users can update their published-games files"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'published-games' AND
        (select auth.role()) = 'authenticated' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- User delete policy
CREATE POLICY "Users can delete their published-games files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'published-games' AND
        (select auth.role()) = 'authenticated' AND
        (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
-- Summary of changes:
-- - 55+ policies updated to use (select auth.uid()) for initplan optimization
-- - Consolidated duplicate permissive SELECT policies on:
--   - playcraft_file_index (was SELECT + ALL, now separate SELECT/INSERT/UPDATE/DELETE)
--   - playcraft_file_dependencies (was SELECT + ALL, now separate SELECT/INSERT/UPDATE/DELETE)
-- - Storage policies updated for both project-files and published-games buckets
-- =============================================================================
