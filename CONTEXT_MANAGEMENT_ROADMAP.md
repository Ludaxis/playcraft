# PlayCraft Context Management Roadmap

**Created:** January 2026
**Last Updated:** January 6, 2026
**Goal:** Implement industry-standard context management to keep AI informed without re-reading entire codebases

---

## Current State Assessment

### What PlayCraft Has (Completed)
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
| AST Outlines | ✅ Done | `astOutlineService.ts` |
| Minimal Context for Simple Requests | ✅ Done | `contextBuilder.ts` |
| Intent Classification (9 types) | ✅ Done | `contextBuilder.ts` |
| Chunk Embeddings (Voyage AI) | ✅ Done | `embeddingService.ts` |
| Hybrid Retrieval (semantic + keyword) | ✅ Done | `contextBuilder.ts` |
| Code Chunking | ✅ Done | `codeChunker.ts` |
| Embedding Cache | ✅ Done | `embeddingCache.ts` |
| Query Enhancement | ✅ Done | `queryEnhancer.ts` |
| Adaptive Weight Learning | ✅ Done | `adaptiveWeights.ts` |
| Selection Quality Metrics | ✅ Done | `outcomeService.ts` |
| Full Project Scan on Load | ✅ Done | `memoryUpdater.ts` |
| Claude Orchestrator + Gemini Executor | ✅ Done | Edge function |

---

## Phase Summary

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Quick Wins (conversation compaction, file hash diffing) |
| Phase 2 | ✅ Complete | Smart Context (AST outlines, intent classification, minimal context) |
| Phase 3 | ✅ Complete | Semantic Search (embeddings, hybrid retrieval, adaptive weights) |
| Phase 4 | 🚧 In Progress | Dependency-First Retrieval & Task Ledger |
| Phase 5 | ⏳ Planned | Advanced Intelligence (knowledge graph, multi-agent) |

---

## Phase 4: Dependency-First Retrieval & Task Ledger (Current Focus)

**Goal:** Improve context accuracy with dependency awareness and persistent task tracking

### 4.1 Dependency-First Retrieval ⭐ HIGH PRIORITY
**Status:** Not Started
**Effort:** 8-12 hours
**Impact:** Reduces "missed files" by 40%+

Currently, `contextBuilder.ts` uses semantic + keyword + recency + importance scoring. Missing: import graph awareness.

**Implementation:**
```typescript
// Extend contextBuilder.ts

interface DependencyAwareRetrieval {
  // Before semantic scoring, get dependency context
  directImports: string[];      // Files this file imports
  reverseDependents: string[];  // Files that import this file
  transitiveDepth: number;      // How many levels to traverse (default: 1)
}

async function getDependencyContext(
  projectId: string,
  targetFiles: string[]
): Promise<Map<string, DependencyAwareRetrieval>> {
  // 1. Query playcraft_file_dependencies for direct imports
  // 2. Query reverse (files that import target)
  // 3. Boost these files in scoring before semantic search
}

// In hybridRetrieve():
// 1. Get dependency context for selected/modified files
// 2. Auto-include direct dependencies with relevanceScore boost
// 3. Then run semantic search on remaining budget
```

**Database:** Already exists (`playcraft_file_dependencies`), needs population from indexer

**Files to Modify:**
- `embeddingIndexer.ts` - Parse and store imports to `playcraft_file_dependencies`
- `contextBuilder.ts` - Query dependencies before semantic scoring

---

### 4.2 Task Ledger + Delta Log ⭐ HIGH PRIORITY
**Status:** Not Started
**Effort:** 6-8 hours
**Impact:** Maintains focus across multi-turn conversations

**Concept:** Store current goal, substeps, blockers, and last-known state. After each turn, write a delta ("what we tried, what changed, what's next").

**Schema Extension:**
```sql
-- Extend playcraft_project_memory
ALTER TABLE playcraft_project_memory ADD COLUMN IF NOT EXISTS
  current_goal TEXT,                    -- "Implement dark mode toggle"
  goal_substeps JSONB DEFAULT '[]',     -- [{step: "Add state", done: true}, ...]
  known_blockers JSONB DEFAULT '[]',    -- ["TypeScript error in Button.tsx"]
  last_known_state TEXT;                -- "Dark mode state added, UI pending"

-- New table for delta log
CREATE TABLE IF NOT EXISTS playcraft_task_deltas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  what_tried TEXT,           -- "Added ThemeContext with dark/light modes"
  what_changed TEXT[],       -- ["src/contexts/ThemeContext.tsx", "src/App.tsx"]
  what_next TEXT,            -- "Wire toggle button to context"
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Implementation:**
```typescript
// New file: apps/web/src/lib/taskLedgerService.ts

interface TaskLedger {
  currentGoal: string | null;
  substeps: Array<{ step: string; done: boolean }>;
  blockers: string[];
  lastKnownState: string | null;
}

interface TaskDelta {
  whatTried: string;
  whatChanged: string[];
  whatNext: string;
}

export async function updateTaskLedger(
  projectId: string,
  delta: TaskDelta
): Promise<void>;

export async function getTaskLedger(
  projectId: string
): Promise<TaskLedger>;
```

**Integration:** Inject as Layer 3 in prompt stack (see Prompt Architecture below)

---

### 4.3 Live Memory Refresh
**Status:** Not Started
**Effort:** 4-6 hours
**Impact:** Keeps model's view current with user edits

Currently only AI-generated edits trigger memory updates. User edits are invisible.

**Implementation:**
```typescript
// In useWebContainer.ts or Builder.tsx

// Hook file save events from Monaco editor
onFileSave(async (path: string, content: string) => {
  // Update memory
  await updateMemoryFromFileChange(projectId, path, content);

  // Re-index for semantic search (debounced)
  await indexSingleFile(projectId, path, content, voyageApiKey);
});

// Background job for stale re-indexing
async function reindexStaleFiles(projectId: string): Promise<void> {
  // Find files where content_hash differs from last indexed
  // Re-embed in background
}
```

---

### 4.4 Adaptive Token Budgets
**Status:** Not Started
**Effort:** 4-6 hours
**Impact:** Cost efficiency + quality optimization

**Intent-Based Budgets:**
```typescript
const TOKEN_BUDGETS_BY_INTENT: Record<Intent, TokenBudget> = {
  tweak:   { total: 3000,  contextMode: 'minimal', useOutlines: true },
  style:   { total: 3000,  contextMode: 'minimal', useOutlines: true },
  debug:   { total: 8000,  contextMode: 'outline', useOutlines: true },
  modify:  { total: 8000,  contextMode: 'outline', useOutlines: false },
  feature: { total: 12000, contextMode: 'full',    useOutlines: false },
  create:  { total: 12000, contextMode: 'full',    useOutlines: false },
};

// Also factor in:
// - Available credits (low balance → smaller budget)
// - Project size (large project → prefer outlines)
// - User preference (if set)
```

**Preflight Cost Estimator:**
```typescript
interface PreflightEstimate {
  estimatedTokens: number;
  estimatedCost: number;
  contextMode: 'minimal' | 'outline' | 'full';
  filesIncluded: number;
  recommendation: string;
}

export function estimateContextCost(
  projectId: string,
  prompt: string,
  availableCredits: number
): PreflightEstimate;
```

---

### 4.5 Structured Planner Output
**Status:** Partially Done (Claude orchestrator exists)
**Effort:** 2-4 hours
**Impact:** More focused changes, better recovery

Current Claude orchestrator returns a plan, but it's not structured as numbered steps.

**Enhancement:**
```typescript
interface StructuredPlan {
  understanding: string;
  numberedSteps: Array<{
    step: number;
    action: string;
    targetFile: string;
    description: string;
  }>;
  filesToRead: string[];    // For context
  filesToModify: string[];  // For generation
  filesToCreate: string[];
  preserveFeatures: string[];
}

// In Claude orchestrator prompt, request:
// "Return a numbered plan with specific files for each step"
```

---

## Phase 5: Advanced Intelligence (Future)

### 5.1 Knowledge Graph Light
**Status:** Planned
**Effort:** 16-24 hours
**Impact:** Answer "where is X used?" without full file dumps

**Symbol-Level Map:**
```typescript
interface SymbolNode {
  name: string;           // "useGameLogic"
  type: 'function' | 'component' | 'hook' | 'type' | 'class';
  file: string;           // "/src/hooks/useGameLogic.ts"
  line: number;
  exportedAs?: string;
}

interface SymbolEdge {
  from: string;  // symbol name
  to: string;    // symbol name
  type: 'calls' | 'imports' | 'extends' | 'implements';
}

// Query: "What calls handleGameOver?"
// → Returns list of callers without reading full files
```

**Storage:**
```sql
CREATE TABLE IF NOT EXISTS playcraft_symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbol_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  line_number INTEGER,
  exported_as TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, file_path, name)
);

CREATE TABLE IF NOT EXISTS playcraft_symbol_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES playcraft_projects(id) ON DELETE CASCADE,
  from_symbol TEXT NOT NULL,
  to_symbol TEXT NOT NULL,
  edge_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5.2 Conversation Intelligence
**Status:** Planned
**Effort:** 8-12 hours
**Impact:** Captures user preferences/decisions

**Enhancement to Summarizer:**
```typescript
interface ConversationPreferences {
  stylePreferences: string[];   // ["keep retro palette", "use Tailwind"]
  doNotTouch: string[];         // ["don't modify physics", "keep current font"]
  decisions: Array<{
    decision: string;
    reason: string;
    timestamp: string;
  }>;
}

// Extract from conversation and store in project memory
// Feed into guardrail layer (Layer 8)
```

---

### 5.3 Outcome-Driven Context Optimization
**Status:** Partially Done (adaptiveWeights.ts)
**Effort:** 6-8 hours
**Impact:** Learn which context is actually useful

**Enhancement:**
```typescript
// In outcomeService.ts, also track:
interface ContextEffectiveness {
  filesInContext: string[];
  filesActuallyUsed: string[];  // Files referenced in AI response
  unusedFiles: string[];        // Context noise
  contextEfficiencyScore: number; // used / total
}

// Use to train:
// 1. Better file selection
// 2. Shorter contexts that still succeed
// 3. Which files are consistently noise
```

---

### 5.4 Credit-Aware Routing
**Status:** Planned
**Effort:** 4-6 hours
**Impact:** User-friendly cost management

```typescript
interface RoutingDecision {
  contextMode: 'minimal' | 'outline' | 'full';
  modelPreference: 'gemini' | 'claude+gemini';
  estimatedCost: number;
  reason: string;
}

function getRoutingDecision(
  intent: Intent,
  creditBalance: number,
  projectSize: number
): RoutingDecision {
  // Low credits → minimal context, Gemini-only
  // High credits → full context, Claude orchestration
  // Show pre/post cost receipts
}
```

---

### 5.5 UX Surfacing
**Status:** Planned
**Effort:** 8-12 hours
**Impact:** Transparency and user trust

**Builder UI Additions:**
- Project Brief panel (show what AI knows about project)
- Current Plan panel (numbered steps, checkmarks)
- Recent Changes panel (delta log)
- Context Size indicator (tokens used, files included)
- Cost receipt (before/after generation)

---

## Updated Prompt Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: System Rules (500 tokens)                          │
│ - Role definition, output format, tool guidelines           │
├─────────────────────────────────────────────────────────────┤
│ LAYER 2: Project Brief (200-500 tokens)                     │
│ - Project summary, tech stack, game type                    │
│ - From: playcraft_project_memory                            │
├─────────────────────────────────────────────────────────────┤
│ LAYER 3: Task Ledger (100-300 tokens) ⭐ NEW                │
│ - Current goal + substeps                                   │
│ - Recent delta ("tried/changed/next")                       │
│ - Known blockers                                            │
│ - From: playcraft_task_deltas                               │
├─────────────────────────────────────────────────────────────┤
│ LAYER 4: Conversation Context (500-1500 tokens)             │
│ - Summary of older messages                                 │
│ - Last 3-5 full messages                                    │
│ - Extracted decisions/preferences                           │
├─────────────────────────────────────────────────────────────┤
│ LAYER 5: Selected File (variable, up to 2000 tokens)        │
│ - Full content or AST outline                               │
├─────────────────────────────────────────────────────────────┤
│ LAYER 6: Dependency Context (500-1500 tokens) ⭐ ENHANCED   │
│ - Direct imports of selected/modified files                 │
│ - Reverse dependents (files that import these)              │
│ - Auto-included before semantic search                      │
├─────────────────────────────────────────────────────────────┤
│ LAYER 7: Retrieved Context (1000-3000 tokens)               │
│ - Top-K by hybrid score (semantic + keyword + recency)      │
│ - AST outlines for large files                              │
├─────────────────────────────────────────────────────────────┤
│ LAYER 8: Change Log (200-500 tokens) ⭐ ENHANCED            │
│ - Compact diff since last turn                              │
│ - File hashes for delta detection                           │
│ - From: fileHashService + task deltas                       │
├─────────────────────────────────────────────────────────────┤
│ LAYER 9: Guardrails (200 tokens)                            │
│ - Files NOT to modify                                       │
│ - User preferences/decisions                                │
│ - Style constraints                                         │
└─────────────────────────────────────────────────────────────┘

Target: 4000-12000 tokens (intent-dependent)
```

---

## Implementation Priority

### Immediate (Phase 4) - Recommended Order

| # | Task | Effort | Impact | Dependencies |
|---|------|--------|--------|--------------|
| 1 | **Dependency-first retrieval** | 8-12h | High | Extend indexer + contextBuilder |
| 2 | **Live memory refresh** | 4-6h | Medium | Hook user edits in Builder |
| 3 | **Task ledger + delta log** | 6-8h | High | New service + DB migration |
| 4 | **Adaptive token budgets** | 4-6h | Medium | Update contextBuilder |
| 5 | **Structured planner output** | 2-4h | Medium | Update Claude prompt |

### Later (Phase 5)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 6 | Knowledge graph light | 16-24h | High |
| 7 | Conversation intelligence | 8-12h | Medium |
| 8 | Outcome-driven optimization | 6-8h | Medium |
| 9 | Credit-aware routing | 4-6h | Medium |
| 10 | UX surfacing | 8-12h | High (trust) |

---

## Success Metrics

| Metric | Current | Phase 4 Target | Phase 5 Target |
|--------|---------|----------------|----------------|
| Avg tokens per request | ~6000 | ~4500 | ~3500 |
| Selection accuracy | ~70% | ~85% | ~92% |
| Missed files rate | ~25% | ~10% | ~5% |
| Multi-turn coherence | ~75% | ~90% | ~95% |
| Context noise (unused files) | ~30% | ~15% | ~8% |

---

## Next Actions

1. [x] Phase 1-3 Complete
2. [ ] **Implement dependency-first retrieval** ← START HERE
   - Extend `embeddingIndexer.ts` to populate `playcraft_file_dependencies`
   - Update `contextBuilder.ts` to query dependencies before semantic search
3. [ ] Add live memory refresh (hook user edits)
4. [ ] Create task ledger service + DB migration
5. [ ] Implement adaptive token budgets
6. [ ] Refine planner output structure

---

## Competitive Reference

| Feature | Lovable | Replit | Bolt.new | Base44 | PlayCraft |
|---------|---------|--------|----------|--------|-----------|
| Task status cards | ✅ | ✅ | ❌ | ❌ | 🚧 (Phase 4) |
| Delta-first context | ❌ | ✅ | ❌ | ✅ | 🚧 (Phase 4) |
| Related files auto-include | ✅ | ✅ | ✅ | ❌ | 🚧 (Phase 4) |
| Cost transparency | ✅ | ❌ | ❌ | ✅ | 🚧 (Phase 5) |
| Planner/executor split | ✅ | ✅ | ✅ | ❌ | ✅ Done |
| Semantic search | ✅ | ✅ | ❌ | ❌ | ✅ Done |
| Adaptive weights | ❌ | ❌ | ❌ | ❌ | ✅ Done |

---

*Last Updated: January 6, 2026 - Added Phase 4 & 5 roadmap*
