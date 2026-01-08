# PlayCraft Context Management Roadmap

**Created:** January 2026
**Last Updated:** January 7, 2026
**Goal:** Implement industry-standard context management to keep AI informed without re-reading entire codebases

---

## Current State Assessment

### What PlayCraft Has (re-evaluated)
| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Project Memory (summary, tasks, entities) | ✅ Done | `projectMemoryService.ts` |  |
| File Importance Scoring | ✅ Done | `projectMemoryService.ts` |  |
| Context Builder with Intent Analysis | ✅ Done | `contextBuilder.ts` | Minimal/outline mode covered by tests |
| Conversation Compaction | ✅ Done | `conversationSummarizer.ts` | Unit-tested |
| File Hash Diffing | ⚠️ Needs fix | `fileHashService.ts` | `updateFileHashes` deletes hashes when called with partial file sets (live tracker/memory updater pass only changed files) |
| Import/Dependency Graph | ⚠️ Partial | `fileHashService.ts` (getImportGraph) | Populated only when full hash table is intact; import normalization defaults `.tsx` |
| Memory Auto-Update | ✅ Done | `memoryUpdater.ts` |  |
| Rate Limiting | ✅ Done | `playcraft_rate_limits` table |  |
| Credit Tracking | ✅ Done | `playcraft_user_usage` table |  |
| Async Job Queue | ✅ Done | `playcraft_generation_jobs` table |  |
| Read All Project Files | ✅ Done | `webcontainer.ts` (readAllProjectFiles) |  |
| AI Iteration Rules | ✅ Done | Edge function system prompt |  |
| AST Outlines | ✅ Done | `astOutlineService.ts` | Unit-tested |
| Minimal Context for Simple Requests | ✅ Done | `contextBuilder.ts` | Unit-tested |
| Intent Classification (9 types) | ✅ Done | `contextBuilder.ts` | Unit-tested |
| Chunk Embeddings (Voyage AI) | ✅ Done | `embeddingService.ts` | Mocked tests added |
| Hybrid Retrieval (semantic + keyword) | ⚠️ Partial | `contextBuilder.ts` | Dependency boosts only applied when Voyage key present |
| Code Chunking | ✅ Done | `codeChunker.ts` |  |
| Embedding Cache | ✅ Done | `embeddingCache.ts` |  |
| Query Enhancement | ✅ Done | `queryEnhancer.ts` | Unit-tested |
| Adaptive Weight Learning | ⚠️ Partial | `adaptiveWeights.ts` | Uses outcome data; mock-tested, insufficient data path only |
| Selection Quality Metrics | ✅ Done | `outcomeService.ts` |  |
| Full Project Scan on Load | ✅ Done | `memoryUpdater.ts` |  |
| Claude Orchestrator + Gemini Executor | ✅ Done | Edge function |  |

---

## Phase Summary

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Quick Wins (conversation compaction, file hash diffing) |
| Phase 2 | ✅ Complete | Smart Context (AST outlines, intent classification, minimal context) |
| Phase 3 | ⚠️ Partial | Semantic Search (embeddings, hybrid retrieval, adaptive weights) |
| Phase 4 | ⚠️ Partial | Dependency-First Retrieval & Task Ledger |
| Phase 5 | ⏳ Planned | Advanced Intelligence (knowledge graph, multi-agent) |

---

## Phase 4: Dependency-First Retrieval & Task Ledger (Current Focus)

**Goal:** Improve context accuracy with dependency awareness and persistent task tracking

### 4.1 Dependency-First Retrieval ⭐ HIGH PRIORITY
**Status:** ⚠️ Partial (gated by Voyage key, import normalization issues)
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
- `embeddingIndexer.ts` - Parse and store imports to `playcraft_file_dependencies` (currently assumes `.tsx` extension and misses non-TSX deps)
- `contextBuilder.ts` - Query dependencies before semantic scoring (currently only when semantic search enabled)

---

### 4.2 Task Ledger + Delta Log ⭐ HIGH PRIORITY
**Status:** ⚠️ Partial (context not injected into LLM prompt)
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

**Integration:** Inject as Layer 3 in prompt stack (see Prompt Architecture below) — not yet wired into edge prompt builder

---

### 4.3 Live Memory Refresh
**Status:** ✅ Complete (Jan 6, 2026)
**Effort:** 4-6 hours
**Impact:** Keeps model's view current with user edits

~~Currently only AI-generated edits trigger memory updates. User edits are invisible.~~

**Implementation:**
- Created `fileChangeTracker.ts` - Service for debounced file change tracking
- Created `useFileChangeTracker.ts` - React hook for easy integration
- Integrated into `Builder.tsx`:
  - Tracks user edits (source: 'user-edit')
  - Tracks AI-generated files (source: 'ai-generation')
  - Tracks AI edits (source: 'ai-edit')
- Background processing:
  - Updates file hashes in database (debounced 500ms)
  - Queues files for re-embedding using `requestIdleCallback`
  - Non-blocking to maintain UI responsiveness

---

### 4.4 Adaptive Token Budgets
**Status:** ✅ Complete (Jan 7, 2026)
**Effort:** 4-6 hours
**Impact:** Cost efficiency + quality optimization

**Implementation (in `contextBuilder.ts`):**
```typescript
const TOKEN_BUDGETS: Record<IntentAction, number> = {
  create: 15000,   // New projects need more context
  add: 12000,      // Adding features needs good context
  modify: 10000,   // General modifications
  debug: 8000,     // Debugging needs focused context
  remove: 6000,    // Removing features needs less
  style: 5000,     // Style changes are targeted
  explain: 4000,   // Explanations don't need as much code
  rename: 3000,    // Renaming is very targeted
  tweak: 2000,     // Simple tweaks need minimal context
};
```

**Preflight Cost Estimator (implemented):**
```typescript
export function preflightEstimate(
  prompt: string,
  files: Record<string, string>,
  selectedFile: string | undefined,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  projectMemory: ProjectMemory | null
): PreflightEstimate;
```

---

### 4.5 Structured Planner Output
**Status:** ⚠️ Partial (plan generated but not passed to LLM prompt)
**Effort:** 2-4 hours
**Impact:** More focused changes, better recovery

**Implementation (in `contextBuilder.ts`):**
```typescript
interface PlanStep {
  stepNumber: number;
  description: string;
  files: string[];
  operation: 'create' | 'modify' | 'delete' | 'move';
  complexity: number;
  dependsOn: number[];
}

interface StructuredPlan {
  goal: string;
  steps: PlanStep[];
  totalComplexity: number;
  affectedFiles: string[];
  executionOrder: number[];
}

export function generateStructuredPlan(
  prompt: string,
  files: Record<string, string>,
  projectMemory: ProjectMemory | null
): StructuredPlan | null;

export function formatPlanForPrompt(plan: StructuredPlan): string;
```

- Plans are automatically generated for complex tasks
- Included in `ContextPackage` as `structuredPlan` and `structuredPlanFormatted`

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

### Phase 4 - PARTIAL ⚠️

| # | Task | Effort | Impact | Status | Notes |
|---|------|--------|--------|--------|-------|
| 1 | **Dependency-first retrieval** | 8-12h | High | ⚠️ Partial | Dependency boosts only with Voyage key; import normalization to `.tsx` |
| 2 | **Live memory refresh** | 4-6h | Medium | ⚠️ Partial | Hash updater treats missing files as deletions when called with partial sets |
| 3 | **Task ledger + delta log** | 6-8h | High | ⚠️ Partial | Not injected into edge prompt |
| 4 | **Adaptive token budgets** | 4-6h | Medium | ✅ Complete |  |
| 5 | **Structured planner output** | 2-4h | Medium | ⚠️ Partial | Plan created but not sent to edge prompt |

### Next: Phase 5

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

### Phase 4 - COMPLETE ✅

1. [x] Phase 1-3 Complete
2. [x] **Implement dependency-first retrieval** (Jan 6, 2026)
   - Extended `embeddingIndexer.ts` to populate `playcraft_file_dependencies`
   - Updated `contextBuilder.ts` to query dependencies before semantic search
   - Added graduated boosting: direct deps +0.8, reverse deps +0.6
3. [x] Add live memory refresh (Jan 6, 2026)
   - Created `fileChangeTracker.ts` + `useFileChangeTracker.ts`
   - Integrated into `Builder.tsx` for user edits + AI generation
4. [x] Create task ledger service + DB migration (Jan 6, 2026)
   - Created `taskLedgerService.ts` with goal/substep/blocker tracking
   - Created `playcraft_task_deltas` table for turn-by-turn logging
   - Integrated into `contextBuilder.ts` for prompt injection
   - Integrated into `usePlayCraftChat.ts` for automatic delta recording
5. [x] **Implement adaptive token budgets** (Jan 7, 2026)
   - Added `TOKEN_BUDGETS` record with intent-based allocations
   - Added `preflightEstimate()` for cost estimation before building context
   - Updated `ContextPackage` with `tokenBudget` field
6. [x] **Implement structured planner output** (Jan 7, 2026)
   - Added `PlanStep` and `StructuredPlan` interfaces
   - Added `generateStructuredPlan()` and `formatPlanForPrompt()`
   - Plans auto-included in context for complex tasks

### Phase 5 - TODO

7. [ ] **Knowledge graph light** ← START HERE
8. [ ] Conversation intelligence
9. [ ] Outcome-driven optimization
10. [ ] Credit-aware routing
11. [ ] UX surfacing

---

## Competitive Reference

| Feature | Lovable | Replit | Bolt.new | Base44 | PlayCraft |
|---------|---------|--------|----------|--------|-----------|
| Task status cards | ✅ | ✅ | ❌ | ❌ | ✅ Done |
| Delta-first context | ❌ | ✅ | ❌ | ✅ | ✅ Done |
| Related files auto-include | ✅ | ✅ | ✅ | ❌ | ✅ Done |
| Cost transparency | ✅ | ❌ | ❌ | ✅ | 🚧 (Phase 5) |
| Planner/executor split | ✅ | ✅ | ✅ | ❌ | ✅ Done |
| Semantic search | ✅ | ✅ | ❌ | ❌ | ✅ Done |
| Adaptive weights | ❌ | ❌ | ❌ | ❌ | ✅ Done |
| Structured plans | ✅ | ✅ | ❌ | ❌ | ✅ Done |

---

*Last Updated: January 7, 2026 - Phase 4 Complete (All 5 tasks done)*
