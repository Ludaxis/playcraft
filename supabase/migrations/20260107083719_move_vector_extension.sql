-- =============================================================================
-- MOVE VECTOR EXTENSION TO DEDICATED SCHEMA
-- =============================================================================
-- This migration moves the pgvector extension from public to extensions schema
-- to address the extension_in_public security warning.
--
-- Vector-dependent indexes found:
--   - idx_chunks_embedding ON playcraft_code_chunks USING hnsw (embedding vector_cosine_ops)
-- =============================================================================

-- 1) Create dedicated extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2) Drop vector-dependent indexes first
DROP INDEX IF EXISTS idx_chunks_embedding;

-- 3) Drop and recreate extension in extensions schema
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION vector WITH SCHEMA extensions;

-- 4) Recreate the embedding column type (it was dropped with CASCADE)
-- The table still exists but embedding column is now gone
-- We need to add it back with the new schema-qualified type
ALTER TABLE public.playcraft_code_chunks
  ADD COLUMN IF NOT EXISTS embedding extensions.vector(1024);

-- 5) Recreate the HNSW index for similarity search
CREATE INDEX idx_chunks_embedding ON public.playcraft_code_chunks
  USING hnsw (embedding extensions.vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 6) Update the search_code_chunks function to use schema-qualified vector type
CREATE OR REPLACE FUNCTION public.search_code_chunks(
    p_project_id UUID,
    p_query_embedding extensions.vector(1024),
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
SET search_path = pg_catalog, public, extensions
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

-- 7) Harden the extensions schema
REVOKE ALL ON SCHEMA extensions FROM PUBLIC;
GRANT USAGE ON SCHEMA extensions TO authenticated, anon, service_role;

-- 8) Grant execute on extension functions (needed for vector operations)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO authenticated, anon, service_role;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
