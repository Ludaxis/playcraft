# PlayCraft Context Management Roadmap

**Created:** January 2026
**Last Updated:** January 6, 2026
**Goal:** Implement industry-standard context management to keep AI informed without re-reading entire codebases

---

## Current State Assessment

### What PlayCraft Already Has
| Component | Status | Location |
|-----------|--------|----------|
| Project Memory (summary, tasks, entities) | ✅ Done | `projectMemoryService.ts` |
| File Importance Scoring | ✅ Done | `projectMemoryService.ts` |
| Context Builder with Intent Analysis | ✅ Done | `contextBuilder.ts` |
| Conversation Compaction | ✅ Done | `conversationSummarizer.ts` |
| File Hash Diffing | ✅ Done | `fileHashService.ts` |
| Import/Dependency Graph | ✅ Done | `fileHashService.ts` (getImportGraph) |
| Memory Auto-Update | ✅ Done | `memoryUpdater.ts` |
| Rate Limiting | ✅ Done | `playcraft_rate_limits` table |
| Credit Tracking | ✅ Done | `playcraft_user_usage` table |
| Async Job Queue | ✅ Done | `playcraft_generation_jobs` table |
| Read All Project Files | ✅ Done | `webcontainer.ts` (readAllProjectFiles) |
| AI Iteration Rules | ✅ Done | Edge function system prompt |

### What's Still Missing (Future Enhancements)
| Component | Impact | Priority |
|-----------|--------|----------|
| Repository Map (AST outlines) | ✅ Done | `astOutlineService.ts` |
| Minimal Context for Simple Requests | ✅ Done | `contextBuilder.ts` |
| Improved Intent Classification | ✅ Done | `contextBuilder.ts` |
| Chunk Embeddings | No semantic search | P2 |
| Hybrid Retrieval (BM25 + vectors) | Keyword-only matching | P2 |
| Knowledge Graph | No structural code understanding | P3 |
| Multi-Agent Architecture | Single agent handles all tasks | P3 |

---

## Implementation Phases

### Phase 2: Smart Context ✅ COMPLETED (Jan 6, 2026)
**Goal:** Send structure instead of full code, understand dependencies

#### 2.1 AST Outlines ✅
**Status:** Implemented in `astOutlineService.ts`

- Extracts condensed structural outlines from TypeScript/React files
- Reduces tokens by ~80% for large files while preserving essential info
- Example: 200 lines of code → 15 lines of outline

#### 2.2 Aggressive Minimal Context ✅
**Status:** Implemented in `contextBuilder.ts`

- Trivial changes (color, size, text) use only 1-2 files
- Style changes use file outlines instead of full code
- Token budget reduced from 12000 to 3000 for simple requests

#### 2.3 Intent Classification ✅
**Status:** Implemented in `contextBuilder.ts`

- 9 intent types: create, modify, debug, explain, add, remove, style, rename, tweak
- Trivial change detection with confidence scoring
- Context mode selection: full, minimal, outline

---

### Phase 1: Quick Wins ✅ COMPLETED
**Goal:** Stop context overflow and redundant file reads

#### 1.1 Conversation Compaction ✅
**Status:** Implemented in `conversationSummarizer.ts`
**Effort:** 4 hours

```typescript
// New file: apps/web/src/lib/conversationCompactor.ts

interface ConversationShard {
  summary: string;           // Compressed summary of older messages
  recentTurns: Message[];    // Last 3-5 full messages
  extractedTasks: string[];  // Tasks mentioned in conversation
  mentionedFiles: string[];  // Files referenced
}

// Triggers:
// - When conversation > 10 messages
// - When estimated tokens > 4000
// - Before every AI request (check & compact if needed)
```

**Database:**
```sql
-- Add to playcraft_chat_sessions or new table
ALTER TABLE playcraft_chat_sessions ADD COLUMN IF NOT EXISTS
  conversation_summary TEXT,
  summary_updated_at TIMESTAMPTZ;
```

**Implementation:**
1. Use AI to summarize older messages (keep last 5 full)
2. Extract: decisions made, files modified, tasks completed
3. Store summary in database
4. Include summary + recent turns in prompt

#### 1.2 File Hash Diffing ✅
**Status:** Implemented in `fileHashService.ts`
**Effort:** 4 hours

```typescript
// Implemented in: apps/web/src/lib/fileHashService.ts

interface FileHashCache {
  projectId: string;
  fileHashes: Record<string, string>;  // path -> MD5 hash
  lastUpdated: string;
}

// On project load:
// 1. Load cached hashes from IndexedDB
// 2. Compare with current files in WebContainer
// 3. Mark changed files as "dirty"
// 4. Only re-process dirty files for context
```

**Benefits:**
- Skip unchanged files entirely
- Know exactly what changed since last session
- Enable "what changed since you left" recap

---

### Phase 2: Smart Context (12-20 hours)
**Goal:** Send structure instead of full code, understand dependencies

#### 2.1 Repository Map with AST Outlines
**Effort:** 8-12 hours

```typescript
// New file: apps/web/src/lib/repoMapService.ts

interface RepoMap {
  projectId: string;
  files: FileOutline[];
  dependencies: DependencyEdge[];
  generatedAt: string;
}

interface FileOutline {
  path: string;
  type: 'component' | 'hook' | 'util' | 'type' | 'style' | 'config';
  exports: string[];           // Exported symbols
  imports: ImportInfo[];       // What it imports
  outline: string;             // Condensed structure (not full code)
  lineCount: number;
  importance: number;
}

interface DependencyEdge {
  from: string;  // file path
  to: string;    // file path
  type: 'import' | 'dynamic';
}
```

**AST Extraction Strategy:**
```typescript
// For React/TS files, extract:
// - Function/component names
// - Props interfaces
// - Hook usage
// - State shape
// - Key logic comments

// Example output for a 200-line component:
`
// src/components/GameBoard.tsx (203 lines)
// Exports: GameBoard (component)
// Imports: useState, useEffect, useCallback from 'react'
//          Cell from './Cell'
//          useGameLogic from '../hooks/useGameLogic'
// Props: { width: number, height: number, onGameEnd: () => void }
// State: board (Cell[][]), score (number), isPlaying (boolean)
// Key functions: initBoard(), handleCellClick(), checkWin()
`
```

**Tools:**
- Use TypeScript Compiler API or `@babel/parser` for AST
- Simpler: regex-based extraction for MVP

#### 2.2 Dependency Graph
**Effort:** 4-8 hours

```typescript
// Extend repoMapService.ts

function buildDependencyGraph(files: FileOutline[]): DependencyGraph {
  // Parse imports from each file
  // Build adjacency list
  // Calculate "importance" = number of dependents (fan-in)
  // Files imported by many others = high importance
}

// When user selects a file:
// 1. Get direct dependencies (imports)
// 2. Get reverse dependencies (files that import this)
// 3. Include both in context
```

#### 2.3 Intent Classification
**Effort:** 4 hours

```typescript
// New file: apps/web/src/lib/intentClassifier.ts

type Intent =
  | 'bugfix'      // Minimal context: error + affected file + tests
  | 'feature'     // Full context: related files + dependencies
  | 'styling'     // UI only: components + styles
  | 'refactor'    // Structure: AST outlines + dependency graph
  | 'question'    // Minimal: conversation history + project summary
  | 'debug'       // Error context: logs + stack trace + affected code

function classifyIntent(prompt: string, recentContext: string): Intent {
  // Simple keyword matching first:
  // "fix", "error", "bug", "broken" → bugfix
  // "add", "create", "implement", "new" → feature
  // "style", "color", "layout", "CSS", "UI" → styling
  // "refactor", "clean", "reorganize" → refactor
  // "how", "what", "why", "explain" → question

  // Can upgrade to AI classification later
}

// Use intent to select retrieval strategy:
const retrievalStrategies: Record<Intent, RetrievalConfig> = {
  bugfix: { maxFiles: 3, includeTests: true, includeDeps: false },
  feature: { maxFiles: 10, includeTests: false, includeDeps: true },
  styling: { maxFiles: 5, fileTypes: ['tsx', 'css'], includeDeps: false },
  // ...
};
```

---

### Phase 3: Semantic Search (16-24 hours)
**Goal:** Find relevant code by meaning, not just keywords

#### 3.1 Chunk Embeddings
**Effort:** 12-16 hours

```typescript
// New file: apps/web/src/lib/embeddingService.ts

interface CodeChunk {
  id: string;
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  embedding: number[];  // Vector from embedding model
  type: 'function' | 'component' | 'class' | 'type' | 'other';
}

// Chunking strategy:
// - Split by function/component boundaries (not arbitrary lines)
// - Keep chunks 50-200 lines
// - Overlap chunks by 10% for context continuity

// Embedding options:
// - OpenAI text-embedding-3-small (cheap, fast)
// - Voyage Code (optimized for code)
// - Local: all-MiniLM-L6-v2 via transformers.js
```

**Storage:**
```sql
-- New table for embeddings
CREATE TABLE playcraft_code_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  embedding vector(384),  -- pgvector extension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, file_path, chunk_index)
);

-- Index for similarity search
CREATE INDEX ON playcraft_code_embeddings
  USING ivfflat (embedding vector_cosine_ops);
```

#### 3.2 Hybrid Retrieval
**Effort:** 4-8 hours

```typescript
// Extend contextBuilder.ts

interface RetrievalScore {
  filePath: string;
  semanticScore: number;    // From embedding similarity
  keywordScore: number;     // From BM25/path matching
  recencyScore: number;     // From last modified time
  importanceScore: number;  // From dependency fan-in
  finalScore: number;       // Weighted combination
}

function hybridRetrieve(
  query: string,
  projectId: string,
  config: RetrievalConfig
): Promise<RetrievalScore[]> {
  // 1. Get embedding for query
  // 2. Vector search in embeddings table
  // 3. Keyword search on file paths
  // 4. Boost by recency and importance
  // 5. Combine scores:
  //    final = semantic*0.4 + keyword*0.2 + recency*0.25 + importance*0.15
  // 6. Return top-K
}
```

---

### Phase 4: Advanced (40+ hours each)
**Goal:** Structural understanding and parallel execution

#### 4.1 Knowledge Graph
- Parse code into entities (functions, classes, types)
- Build relationship graph (calls, extends, implements)
- Query: "what functions call X?" without reading all files
- Tools: Neo4j, or PostgreSQL with recursive CTEs

#### 4.2 Multi-Agent Architecture
- Planner agent: breaks task into subtasks
- Coder agents: execute individual subtasks
- Reviewer agent: validates changes
- Orchestrator: manages handoffs with minimal context

---

## Prompt Architecture

### Layer Structure
```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: System Rules (500 tokens)                          │
│ - Role definition                                           │
│ - Output format rules                                       │
│ - Tool usage guidelines                                     │
├─────────────────────────────────────────────────────────────┤
│ LAYER 2: Project Brief (200-500 tokens)                     │
│ - Project summary from project_memory                       │
│ - Tech stack                                                │
│ - Key constraints                                           │
├─────────────────────────────────────────────────────────────┤
│ LAYER 3: Task Ledger (100-300 tokens)                       │
│ - Recent completed tasks                                    │
│ - Current task/goal                                         │
│ - Known issues                                              │
├─────────────────────────────────────────────────────────────┤
│ LAYER 4: Conversation Context (500-1500 tokens)             │
│ - Summary of older messages                                 │
│ - Last 3-5 full messages                                    │
│ - Extracted decisions/preferences                           │
├─────────────────────────────────────────────────────────────┤
│ LAYER 5: Selected File (variable, up to 2000 tokens)        │
│ - Full content of currently selected file                   │
│ - Or AST outline if file is large                          │
├─────────────────────────────────────────────────────────────┤
│ LAYER 6: Retrieved Context (1000-3000 tokens)               │
│ - Top-K relevant files (by hybrid score)                    │
│ - Dependencies of selected file                             │
│ - AST outlines for large files                             │
├─────────────────────────────────────────────────────────────┤
│ LAYER 7: Change Log (200-500 tokens)                        │
│ - Recent file modifications (diffs if small)                │
│ - "What changed since last session" summary                 │
├─────────────────────────────────────────────────────────────┤
│ LAYER 8: Guardrails (200 tokens)                            │
│ - Files NOT to modify (package.json, config)                │
│ - Style rules                                               │
│ - Framework constraints                                     │
└─────────────────────────────────────────────────────────────┘

Target total: 4000-8000 tokens (leaves room for response)
```

### Token Budget Management
```typescript
const TOKEN_BUDGETS = {
  systemRules: 500,
  projectBrief: 500,
  taskLedger: 300,
  conversationContext: 1500,
  selectedFile: 2000,
  retrievedContext: 3000,
  changeLog: 500,
  guardrails: 200,
  // Total: ~8500 tokens for context
  // Reserve: ~4000 tokens for response
  // Model limit: 12500 tokens (safe margin for 16K context)
};

function enforceTokenBudget(layer: string, content: string): string {
  const budget = TOKEN_BUDGETS[layer];
  const tokens = estimateTokens(content);

  if (tokens <= budget) return content;

  // Truncation strategies by layer:
  switch (layer) {
    case 'selectedFile':
      return truncateToOutline(content);  // AST outline
    case 'retrievedContext':
      return truncateFiles(content, budget);  // Fewer files
    case 'conversationContext':
      return summarizeOlderMessages(content, budget);
    default:
      return content.slice(0, budget * 4);  // Rough char estimate
  }
}
```

---

## Database Schema Additions

```sql
-- Phase 1: Conversation compaction
ALTER TABLE playcraft_chat_sessions ADD COLUMN IF NOT EXISTS
  conversation_summary TEXT,
  summary_message_count INTEGER DEFAULT 0,
  summary_updated_at TIMESTAMPTZ;

-- Phase 2: File tracking
CREATE TABLE IF NOT EXISTS playcraft_file_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  line_count INTEGER,
  ast_outline TEXT,
  exports TEXT[],
  imports JSONB,  -- [{from: "react", names: ["useState"]}]
  file_type TEXT,  -- component, hook, util, type, style
  importance_score FLOAT DEFAULT 0,
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, file_path)
);

CREATE INDEX idx_file_index_project ON playcraft_file_index(project_id);
CREATE INDEX idx_file_index_importance ON playcraft_file_index(importance_score DESC);

-- Phase 2: Dependency graph
CREATE TABLE IF NOT EXISTS playcraft_file_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  from_file TEXT NOT NULL,
  to_file TEXT NOT NULL,
  dependency_type TEXT DEFAULT 'import',  -- import, dynamic, type-only
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, from_file, to_file)
);

CREATE INDEX idx_deps_from ON playcraft_file_dependencies(project_id, from_file);
CREATE INDEX idx_deps_to ON playcraft_file_dependencies(project_id, to_file);

-- Phase 3: Embeddings (requires pgvector extension)
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS playcraft_code_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  chunk_type TEXT,  -- function, component, class, type
  symbol_name TEXT,  -- Name of the function/component
  embedding vector(384),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, file_path, chunk_index)
);

CREATE INDEX idx_chunks_project ON playcraft_code_chunks(project_id);
-- CREATE INDEX idx_chunks_embedding ON playcraft_code_chunks
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## Implementation Timeline

| Phase | Components | Effort | Cumulative |
|-------|------------|--------|------------|
| **Phase 1** | Conversation Compaction + File Hash Diffing | 8-12 hrs | 8-12 hrs |
| **Phase 2** | Repo Map + Dependency Graph + Intent Classification | 16-24 hrs | 24-36 hrs |
| **Phase 3** | Embeddings + Hybrid Retrieval | 16-24 hrs | 40-60 hrs |
| **Phase 4** | Knowledge Graph + Multi-Agent | 80+ hrs | 120+ hrs |

---

## Success Metrics

| Metric | Current | Target (Phase 1) | Target (Phase 3) |
|--------|---------|------------------|------------------|
| Avg tokens per request | ~8000 | ~5000 | ~4000 |
| Context relevance (manual) | 60% | 80% | 90% |
| Session continuation success | 70% | 90% | 95% |
| "AI got lost" incidents | 30% | 10% | 5% |
| File re-read rate | 100% | 30% | 10% |

---

## Quick Start: Phase 1 Implementation

### Step 1: Conversation Compaction (4 hours)

```typescript
// apps/web/src/lib/conversationCompactor.ts
// Implementation details in Phase 1.1 above
```

### Step 2: File Hash Diffing (4 hours)

```typescript
// apps/web/src/lib/fileHashService.ts
// Implementation details in Phase 1.2 above
```

### Step 3: Update Context Builder

```typescript
// apps/web/src/lib/contextBuilder.ts
// Add compacted conversation + change detection
```

### Step 4: Database Migration

```sql
-- supabase/migrations/20260106_add_context_management.sql
-- Add conversation_summary column + file_index table
```

---

## Next Actions

1. [x] Review and approve this roadmap
2. [x] Implement Phase 1 (conversation compaction + hash diffing) - DONE
3. [x] Implement Phase 2 (AST outlines + intent classification) - DONE
4. [ ] Test with real sessions to measure improvement
5. [ ] Evaluate embedding providers for Phase 3
6. [ ] Consider knowledge graph for Phase 4

---

## Related: Code Generation Improvements

See `CODE_GENERATION_ROADMAP.md` for validation and learning improvements:
- [x] Error Feedback Loop (TypeScript validation + auto-retry)
- [x] Code Quality Checks (ESLint validation)
- [x] Preview Validation (runtime error capture)
- [x] Learning System (generation outcomes tracking)

---

*Last Updated: January 6, 2026*
