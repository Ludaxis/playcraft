-- PlayCraft Semantic Search Migration
-- Phase 3: Code embeddings for semantic code search
-- Created: January 6, 2026

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Code Chunks Table (for embedding storage)
-- ============================================

CREATE TABLE IF NOT EXISTS playcraft_code_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,

  -- File location
  file_path TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,

  -- Content
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL, -- MD5 hash for change detection

  -- Chunk metadata
  chunk_type TEXT, -- 'function', 'component', 'class', 'type', 'hook', 'constant', 'other'
  symbol_name TEXT, -- Name of the function/component/class

  -- Embedding vector (Voyage-code-3 default is 1024 dimensions)
  embedding vector(1024),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one chunk per position per file
  UNIQUE(project_id, file_path, chunk_index)
);

-- Indexes for efficient queries
CREATE INDEX idx_chunks_project ON playcraft_code_chunks(project_id);
CREATE INDEX idx_chunks_file ON playcraft_code_chunks(project_id, file_path);
CREATE INDEX idx_chunks_type ON playcraft_code_chunks(chunk_type);
CREATE INDEX idx_chunks_symbol ON playcraft_code_chunks(symbol_name);

-- HNSW index for fast similarity search (cosine distance)
-- Using HNSW instead of IVFFlat for better recall with smaller datasets
CREATE INDEX idx_chunks_embedding ON playcraft_code_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================
-- File Index Table (for dependency tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS playcraft_file_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,

  -- File info
  file_path TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  line_count INTEGER,

  -- AST outline (condensed structure)
  ast_outline TEXT,

  -- Exports and imports
  exports TEXT[], -- Exported symbol names
  imports JSONB, -- [{from: "react", names: ["useState", "useEffect"]}]

  -- Classification
  file_type TEXT, -- 'component', 'hook', 'util', 'type', 'style', 'config', 'test'
  importance_score FLOAT DEFAULT 0, -- Higher = more important (based on fan-in)

  -- Embedding status
  chunks_count INTEGER DEFAULT 0,
  last_embedded_at TIMESTAMPTZ,
  embedding_error TEXT,

  -- Timestamps
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, file_path)
);

CREATE INDEX idx_file_index_project ON playcraft_file_index(project_id);
CREATE INDEX idx_file_index_type ON playcraft_file_index(file_type);
CREATE INDEX idx_file_index_importance ON playcraft_file_index(importance_score DESC);

-- ============================================
-- File Dependencies Table
-- ============================================

CREATE TABLE IF NOT EXISTS playcraft_file_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES playcraft_projects(id) ON DELETE CASCADE,

  -- Dependency relationship
  from_file TEXT NOT NULL, -- The file that imports
  to_file TEXT NOT NULL, -- The file being imported

  -- Dependency type
  dependency_type TEXT DEFAULT 'import', -- 'import', 'dynamic', 'type-only', 're-export'

  -- Imported symbols
  imported_symbols TEXT[], -- Which symbols are imported

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, from_file, to_file)
);

CREATE INDEX idx_deps_from ON playcraft_file_dependencies(project_id, from_file);
CREATE INDEX idx_deps_to ON playcraft_file_dependencies(project_id, to_file);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE playcraft_code_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playcraft_file_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE playcraft_file_dependencies ENABLE ROW LEVEL SECURITY;

-- Code chunks policies
CREATE POLICY "Users can view chunks for their projects"
  ON playcraft_code_chunks FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert chunks for their projects"
  ON playcraft_code_chunks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chunks for their projects"
  ON playcraft_code_chunks FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete chunks for their projects"
  ON playcraft_code_chunks FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
    )
  );

-- File index policies
CREATE POLICY "Users can view file index for their projects"
  ON playcraft_file_index FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage file index for their projects"
  ON playcraft_file_index FOR ALL
  USING (
    project_id IN (
      SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
    )
  );

-- File dependencies policies
CREATE POLICY "Users can view dependencies for their projects"
  ON playcraft_file_dependencies FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage dependencies for their projects"
  ON playcraft_file_dependencies FOR ALL
  USING (
    project_id IN (
      SELECT id FROM playcraft_projects WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Helper Functions
-- ============================================

-- Function to find similar code chunks by query embedding
CREATE OR REPLACE FUNCTION search_code_chunks(
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
  FROM playcraft_code_chunks cc
  WHERE cc.project_id = p_project_id
    AND cc.embedding IS NOT NULL
    AND 1 - (cc.embedding <=> p_query_embedding) >= p_similarity_threshold
  ORDER BY cc.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$;

-- Function to get file dependents (files that import this file)
CREATE OR REPLACE FUNCTION get_file_dependents(
  p_project_id UUID,
  p_file_path TEXT
)
RETURNS TABLE (
  dependent_file TEXT,
  imported_symbols TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fd.from_file AS dependent_file,
    fd.imported_symbols
  FROM playcraft_file_dependencies fd
  WHERE fd.project_id = p_project_id
    AND fd.to_file = p_file_path;
END;
$$;

-- Function to get file dependencies (files this file imports)
CREATE OR REPLACE FUNCTION get_file_dependencies(
  p_project_id UUID,
  p_file_path TEXT
)
RETURNS TABLE (
  dependency_file TEXT,
  imported_symbols TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fd.to_file AS dependency_file,
    fd.imported_symbols
  FROM playcraft_file_dependencies fd
  WHERE fd.project_id = p_project_id
    AND fd.from_file = p_file_path;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION search_code_chunks TO authenticated;
GRANT EXECUTE ON FUNCTION get_file_dependents TO authenticated;
GRANT EXECUTE ON FUNCTION get_file_dependencies TO authenticated;
