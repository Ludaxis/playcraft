# Anthropic Best Practices Implementation Plan

Based on analysis of [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) and [Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents).

---

## Executive Summary

PlayCraft currently implements ~75% of Anthropic's recommended best practices. This plan addresses the remaining 25% through 5 focused implementation phases.

| Phase | Feature | Priority | Effort | Impact |
|-------|---------|----------|--------|--------|
| 1 | Runtime Error Bridge | 🔴 High | Medium | High |
| 2 | Response Format Flexibility | 🔴 High | Low | Medium |
| 3 | Enhanced Tool Documentation | 🟡 Medium | Low | Medium |
| 4 | Service Consolidation | 🟡 Medium | Medium | Low |
| 5 | Sub-Agent Architecture | 🟢 Future | High | High |

---

## Phase 1: Runtime Error Bridge

### Problem
The `errorBridge` service is documented in `CONTEXT_MANAGEMENT_ROADMAP.md` but not implemented. Without it, the auto-fix loop cannot capture runtime errors from the preview iframe.

### Implementation

#### 1.1 Create Error Bridge Service

**File**: `/apps/web/src/lib/errorBridge.ts`

```typescript
// Core types
interface RuntimeError {
  type: 'runtime' | 'unhandled-rejection' | 'console-error';
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url?: string;
  line?: number;
  column?: number;
}

interface ErrorBridgeConfig {
  maxErrors: number;        // Max errors to store (default: 10)
  dedupeWindow: number;     // Dedupe identical errors within ms (default: 1000)
  captureConsole: boolean;  // Capture console.error calls (default: true)
}

// Service API
class ErrorBridgeService {
  private errors: RuntimeError[] = [];
  private listeners: Set<(error: RuntimeError) => void> = new Set();

  // Called from iframe via postMessage
  receiveError(error: RuntimeError): void;

  // Get recent errors for context
  getRecentErrors(limit?: number): RuntimeError[];

  // Clear errors after successful fix
  clearErrors(): void;

  // Subscribe to new errors
  onError(callback: (error: RuntimeError) => void): () => void;

  // Format errors for AI context
  formatForContext(): string;
}
```

#### 1.2 Inject Error Capture Script into Preview

**File**: `/apps/web/src/components/Preview/errorCapture.ts`

```typescript
// Script injected into preview iframe <head>
export const ERROR_CAPTURE_SCRIPT = `
<script>
(function() {
  const send = (error) => {
    window.parent.postMessage({
      type: 'PLAYCRAFT_RUNTIME_ERROR',
      payload: error
    }, '*');
  };

  // Capture uncaught errors
  window.onerror = (message, url, line, column, error) => {
    send({
      type: 'runtime',
      message,
      stack: error?.stack,
      url, line, column,
      timestamp: Date.now()
    });
  };

  // Capture unhandled promise rejections
  window.onunhandledrejection = (event) => {
    send({
      type: 'unhandled-rejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      timestamp: Date.now()
    });
  };

  // Capture console.error
  const originalError = console.error;
  console.error = (...args) => {
    send({
      type: 'console-error',
      message: args.map(a =>
        typeof a === 'object' ? JSON.stringify(a) : String(a)
      ).join(' '),
      timestamp: Date.now()
    });
    originalError.apply(console, args);
  };
})();
</script>
`;
```

#### 1.3 Listen for Errors in Preview Component

**File**: `/apps/web/src/components/Preview/Preview.tsx` (modify)

```typescript
// Add to Preview component
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'PLAYCRAFT_RUNTIME_ERROR') {
      errorBridge.receiveError(event.data.payload);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

#### 1.4 Integrate with Auto-Fix Loop

**File**: `/apps/web/src/hooks/usePlayCraftChat.ts` (modify)

```typescript
// In handleGenerate, after applying changes:
const runtimeErrors = errorBridge.getRecentErrors();

if (runtimeErrors.length > 0 && autoFixAttempts < MAX_AUTO_FIX) {
  // Include runtime errors in retry context
  const retryPrompt = `
The code has runtime errors:
${errorBridge.formatForContext()}

Please fix these runtime errors.
`;
  // Trigger auto-fix with runtime error context
}
```

#### 1.5 Database Schema (Optional)

**File**: `/supabase/migrations/20260108000000_add_runtime_errors.sql`

```sql
-- Track runtime errors in generation outcomes
ALTER TABLE playcraft_generation_outcomes
ADD COLUMN IF NOT EXISTS runtime_errors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS runtime_error_count INTEGER DEFAULT 0;

COMMENT ON COLUMN playcraft_generation_outcomes.runtime_errors
IS 'Array of runtime errors captured from preview iframe';
```

### Tests

**File**: `/apps/web/src/lib/__tests__/errorBridge.test.ts`

- Test error deduplication
- Test max errors limit
- Test formatForContext output
- Test listener subscription/unsubscription
- Test clearing errors

### Acceptance Criteria

- [ ] Runtime errors from preview iframe are captured
- [ ] Errors are deduplicated within configurable window
- [ ] Errors are formatted and included in auto-fix context
- [ ] Errors are cleared after successful generation
- [ ] Outcome tracking includes runtime error count

---

## Phase 2: Response Format Flexibility

### Problem
Current generation always returns the same structure. AI cannot choose the most appropriate response format for the request.

### Implementation

#### 2.1 Define Response Modes

**File**: `/apps/web/src/types/generation.ts`

```typescript
export type ResponseMode =
  | 'edit'        // Search/replace edits (current default)
  | 'file'        // Full file rewrites
  | 'plan'        // Implementation plan without code
  | 'explanation' // Explain existing code
  | 'debug'       // Focused debugging analysis
  | 'refactor';   // Structural changes

export interface GenerationRequest {
  prompt: string;
  projectId: string;
  // NEW: Let user or AI choose format
  responseMode?: ResponseMode | 'auto';
  // NEW: Hints for auto mode
  preferEdits?: boolean;  // Prefer minimal changes
}

export interface GenerationResponse {
  mode: ResponseMode;
  // Mode-specific content
  edits?: FileEdit[];
  files?: FileContent[];
  plan?: ImplementationPlan;
  explanation?: string;
  debugAnalysis?: DebugAnalysis;
}
```

#### 2.2 Update System Prompt

**File**: `/supabase/functions/generate-playcraft/systemPrompt.ts`

```typescript
export const RESPONSE_MODE_INSTRUCTIONS = `
## Response Format Selection

Choose the most appropriate response format based on the user's request:

### "edit" mode (default for modifications)
Use when: Making targeted changes to existing code
Output: Search/replace edit blocks
Example requests: "fix the bug", "add a button", "change the color"

### "file" mode (for new files or major rewrites)
Use when: Creating new files OR >50% of file needs changing
Output: Complete file contents
Example requests: "create a new component", "rewrite this hook"

### "plan" mode (for complex features)
Use when: User asks "how would you" or request needs clarification
Output: Step-by-step implementation plan
Example requests: "how should I implement auth?", "plan the refactor"

### "explanation" mode (for understanding)
Use when: User asks "what does", "why", "explain"
Output: Clear explanation of code behavior
Example requests: "explain this function", "what does this hook do?"

### "debug" mode (for troubleshooting)
Use when: User reports an error or unexpected behavior
Output: Analysis of issue, root cause, and fix
Example requests: "why is this crashing?", "debug this error"

Start your response with: <response_mode>MODE</response_mode>
`;
```

#### 2.3 Parse Response Mode

**File**: `/supabase/functions/generate-playcraft/parseResponse.ts`

```typescript
export function parseResponseMode(response: string): ResponseMode {
  const match = response.match(/<response_mode>(\w+)<\/response_mode>/);
  return (match?.[1] as ResponseMode) || 'edit';
}

export function parseResponse(response: string): GenerationResponse {
  const mode = parseResponseMode(response);

  switch (mode) {
    case 'edit':
      return { mode, edits: parseEdits(response) };
    case 'file':
      return { mode, files: parseFiles(response) };
    case 'plan':
      return { mode, plan: parsePlan(response) };
    case 'explanation':
      return { mode, explanation: parseExplanation(response) };
    case 'debug':
      return { mode, debugAnalysis: parseDebugAnalysis(response) };
    default:
      return { mode: 'edit', edits: parseEdits(response) };
  }
}
```

#### 2.4 Handle Different Response Types in UI

**File**: `/apps/web/src/hooks/usePlayCraftChat.ts` (modify)

```typescript
// Handle response based on mode
switch (response.mode) {
  case 'edit':
    await applyEdits(response.edits);
    break;
  case 'file':
    await writeFiles(response.files);
    break;
  case 'plan':
    // Display plan in chat, don't modify files
    addMessage({ role: 'assistant', content: formatPlan(response.plan) });
    break;
  case 'explanation':
    addMessage({ role: 'assistant', content: response.explanation });
    break;
  case 'debug':
    // Show debug analysis with highlighted issues
    addMessage({ role: 'assistant', content: formatDebugAnalysis(response.debugAnalysis) });
    break;
}
```

### Tests

- Test response mode parsing
- Test each mode's specific parser
- Test UI handling of each mode
- Test fallback to 'edit' mode

### Acceptance Criteria

- [ ] AI can choose response format via `<response_mode>` tag
- [ ] Each mode has appropriate parser
- [ ] UI handles all response modes appropriately
- [ ] 'plan' and 'explanation' modes don't modify files
- [ ] Outcome tracking records response mode used

---

## Phase 3: Enhanced Tool Documentation

### Problem
System prompt could better guide the AI with examples and common patterns.

### Implementation

#### 3.1 Add Edit Examples to System Prompt

**File**: `/supabase/functions/generate-playcraft/systemPrompt.ts` (extend)

```typescript
export const EDIT_EXAMPLES = `
## Edit Block Examples

### Good Edit (minimal, targeted)
<edit file="/src/components/Button.tsx">
<<<<<<< SEARCH
  return <button className="btn">{children}</button>;
=======
  return <button className="btn btn-primary">{children}</button>;
>>>>>>> REPLACE
</edit>

### Bad Edit (too broad, loses context)
<edit file="/src/components/Button.tsx">
<<<<<<< SEARCH
export function Button({ children }) {
  return <button className="btn">{children}</button>;
}
=======
export function Button({ children }) {
  return <button className="btn btn-primary">{children}</button>;
}
>>>>>>> REPLACE
</edit>

### Multiple Related Edits (correct approach)
When changes span multiple locations, use multiple edit blocks:

<edit file="/src/hooks/useGame.ts">
<<<<<<< SEARCH
const [score, setScore] = useState(0);
=======
const [score, setScore] = useState(0);
const [highScore, setHighScore] = useState(0);
>>>>>>> REPLACE
</edit>

<edit file="/src/hooks/useGame.ts">
<<<<<<< SEARCH
  setScore(prev => prev + points);
=======
  setScore(prev => {
    const newScore = prev + points;
    if (newScore > highScore) setHighScore(newScore);
    return newScore;
  });
>>>>>>> REPLACE
</edit>
`;

export const COMMON_PATTERNS = `
## Common Patterns

### Adding a New Component
1. Create component file with proper exports
2. Add any required types
3. Import and use in parent component
4. Add styles if needed

### Adding State
1. Add useState/useReducer in appropriate hook
2. Pass down via props or context
3. Update any dependent components

### Fixing Type Errors
1. Check the exact error message
2. Identify the type mismatch
3. Fix at the source (not with 'as' casts)
4. Ensure all usages are updated
`;

export const ERROR_PATTERNS = `
## Common Errors and Fixes

### "Cannot find module './X'"
- Check file exists at exact path
- Check export is named correctly
- Check import syntax (default vs named)

### "Property 'X' does not exist on type 'Y'"
- Add property to interface/type
- Or use optional chaining: obj?.property
- Or check if using correct type

### "React Hook useX cannot be called conditionally"
- Move hook call before any returns
- Move hook call before any conditions
- Hooks must be at top level of component
`;
```

#### 3.2 Add Context Section Descriptions

**File**: `/apps/web/src/lib/contextBuilder.ts` (extend)

```typescript
// Add section headers to context package
function buildContextPackage(options: ContextOptions): ContextPackage {
  return {
    sections: [
      {
        name: 'PROJECT_OVERVIEW',
        description: 'High-level project understanding and tech stack',
        content: buildProjectOverview(options),
      },
      {
        name: 'RECENT_HISTORY',
        description: 'What was done in recent turns (for continuity)',
        content: buildRecentHistory(options),
      },
      {
        name: 'RELEVANT_CODE',
        description: 'Code files most relevant to current request',
        content: buildRelevantCode(options),
      },
      {
        name: 'CURRENT_ERRORS',
        description: 'Any TypeScript, ESLint, or runtime errors to fix',
        content: buildCurrentErrors(options),
      },
    ],
  };
}
```

### Acceptance Criteria

- [ ] System prompt includes edit block examples
- [ ] Common patterns section added
- [ ] Error patterns and fixes documented
- [ ] Context sections have clear descriptions

---

## Phase 4: Service Consolidation

### Problem
Multiple overlapping services for file tracking could be unified.

### Implementation

#### 4.1 Create Unified File Intelligence Service

**File**: `/apps/web/src/lib/fileIntelligenceService.ts`

```typescript
/**
 * Unified service for all file-related intelligence:
 * - Change detection (from fileHashService)
 * - Tracking modifications (from fileChangeTracker)
 * - Indexing for search (from embeddingIndexer)
 * - Importance scoring (from adaptiveWeights)
 */

export class FileIntelligenceService {
  private hashService: FileHashService;
  private changeTracker: FileChangeTracker;
  private indexer: EmbeddingIndexer;
  private weights: AdaptiveWeightsService;

  constructor(supabase: SupabaseClient, projectId: string) {
    // Initialize sub-services
  }

  // === Change Detection ===
  async detectChanges(files: ProjectFile[]): Promise<ChangedFile[]>;

  // === Modification Tracking ===
  trackModification(filePath: string, changeType: ChangeType): void;
  getModificationHistory(filePath: string): ModificationRecord[];

  // === Search Indexing ===
  async indexFile(file: ProjectFile): Promise<void>;
  async indexProject(files: ProjectFile[]): Promise<IndexingResult>;

  // === Importance Scoring ===
  getFileImportance(filePath: string): number;
  async updateImportanceFromOutcome(outcome: GenerationOutcome): Promise<void>;

  // === Unified API ===
  async getFileContext(filePath: string): Promise<FileContext> {
    return {
      importance: this.getFileImportance(filePath),
      recentModifications: this.getModificationHistory(filePath),
      isIndexed: await this.isIndexed(filePath),
      lastChanged: await this.getLastChangeTime(filePath),
    };
  }
}
```

#### 4.2 Migration Path

1. Create new unified service
2. Delegate to existing services internally
3. Update consumers to use new API
4. Gradually merge implementations
5. Remove old service files

### Acceptance Criteria

- [ ] Single import for file intelligence
- [ ] Consistent API across all file operations
- [ ] No duplicate file tracking logic
- [ ] Existing tests still pass

---

## Phase 5: Sub-Agent Architecture (Future)

### Problem
Single generation call handles everything. Complex tasks would benefit from specialized sub-agents.

### Design

```
┌─────────────────────────────────────────────────────────┐
│                    Orchestrator Agent                    │
│  - Receives user request                                │
│  - Decides which sub-agents to invoke                   │
│  - Coordinates results                                  │
└─────────────────┬───────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    ▼             ▼             ▼             ▼
┌───────┐   ┌───────────┐   ┌───────┐   ┌───────────┐
│Research│   │ Generator │   │Validator│  │  Fixer   │
│ Agent  │   │   Agent   │   │  Agent  │  │  Agent   │
└───────┘   └───────────┘   └───────┘   └───────────┘
    │             │             │             │
    │ Explores    │ Writes      │ Runs        │ Fixes
    │ codebase    │ code        │ tests/lint  │ errors
    └─────────────┴─────────────┴─────────────┘
```

### Sub-Agent Definitions

#### Research Agent
- **Purpose**: Explore codebase before making changes
- **Tools**: File search, grep, read files, semantic search
- **Output**: Summary of relevant code, patterns found, recommendations
- **When**: Complex features, unfamiliar codebases

#### Generator Agent
- **Purpose**: Write code changes
- **Tools**: Edit files, create files
- **Output**: Code edits or new files
- **When**: All code generation requests

#### Validator Agent
- **Purpose**: Verify code quality
- **Tools**: Run TypeScript, ESLint, tests
- **Output**: Validation results with specific errors
- **When**: After every generation

#### Fixer Agent
- **Purpose**: Fix validation errors
- **Tools**: Edit files based on error messages
- **Output**: Fixed code
- **When**: Validation finds errors

### Implementation Approach

#### 5.1 Create Sub-Agent Infrastructure

**File**: `/supabase/functions/lib/subAgent.ts`

```typescript
interface SubAgent {
  name: string;
  systemPrompt: string;
  tools: Tool[];
  maxTokens: number;
}

interface SubAgentResult {
  success: boolean;
  output: unknown;
  tokensUsed: number;
  duration: number;
}

async function invokeSubAgent(
  agent: SubAgent,
  task: string,
  context: Context
): Promise<SubAgentResult>;
```

#### 5.2 Define Each Agent

**File**: `/supabase/functions/lib/agents/researchAgent.ts`
**File**: `/supabase/functions/lib/agents/generatorAgent.ts`
**File**: `/supabase/functions/lib/agents/validatorAgent.ts`
**File**: `/supabase/functions/lib/agents/fixerAgent.ts`

#### 5.3 Create Orchestrator

**File**: `/supabase/functions/lib/orchestrator.ts`

```typescript
async function orchestrate(request: GenerationRequest): Promise<GenerationResult> {
  // 1. Analyze request complexity
  const complexity = analyzeComplexity(request);

  if (complexity === 'simple') {
    // Direct generation without sub-agents
    return await generateDirectly(request);
  }

  // 2. Research phase (for complex requests)
  const research = await invokeSubAgent(researchAgent, request.prompt, context);

  // 3. Generation phase
  const generation = await invokeSubAgent(generatorAgent, request.prompt, {
    ...context,
    research: research.output,
  });

  // 4. Validation phase
  const validation = await invokeSubAgent(validatorAgent, 'validate changes', {
    changes: generation.output,
  });

  // 5. Fix phase (if needed)
  if (!validation.output.success) {
    const fix = await invokeSubAgent(fixerAgent, 'fix errors', {
      errors: validation.output.errors,
      changes: generation.output,
    });
    // Re-validate...
  }

  return result;
}
```

### Considerations

- **Cost**: Multiple API calls increase cost
- **Latency**: Sub-agents add latency
- **Complexity**: More moving parts to debug
- **Value**: Best for complex, multi-file changes

### Acceptance Criteria

- [ ] Sub-agent infrastructure created
- [ ] Research, Generator, Validator, Fixer agents defined
- [ ] Orchestrator coordinates agents
- [ ] Simple requests bypass sub-agents
- [ ] Token usage tracked per agent
- [ ] Configurable agent selection

---

## Implementation Timeline

```
Phase 1 (Error Bridge)      ████████████░░░░░░░░  ~2-3 days
Phase 2 (Response Formats)  ██████░░░░░░░░░░░░░░  ~1-2 days
Phase 3 (Documentation)     ████░░░░░░░░░░░░░░░░  ~1 day
Phase 4 (Consolidation)     ████████░░░░░░░░░░░░  ~2 days
Phase 5 (Sub-Agents)        ████████████████████  ~5-7 days (future)
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Auto-fix success rate | ~60% | 85% |
| Context relevance | Unknown | Track via selection_accuracy |
| Response format accuracy | N/A | 90% appropriate mode selection |
| User revert rate | Unknown | <10% |

---

## Dependencies

- Phase 1: None
- Phase 2: None
- Phase 3: None
- Phase 4: None (can do in parallel)
- Phase 5: Phases 1-4 complete

---

## Files to Create

```
/apps/web/src/lib/
├── errorBridge.ts                    # Phase 1
├── fileIntelligenceService.ts        # Phase 4
└── __tests__/
    └── errorBridge.test.ts           # Phase 1

/supabase/functions/
├── generate-playcraft/
│   ├── systemPrompt.ts               # Phase 3 (extend)
│   └── parseResponse.ts              # Phase 2 (extend)
└── lib/
    ├── subAgent.ts                   # Phase 5
    ├── orchestrator.ts               # Phase 5
    └── agents/
        ├── researchAgent.ts          # Phase 5
        ├── generatorAgent.ts         # Phase 5
        ├── validatorAgent.ts         # Phase 5
        └── fixerAgent.ts             # Phase 5

/supabase/migrations/
└── 20260108000000_add_runtime_errors.sql  # Phase 1
```

---

## Next Steps

1. Review this plan
2. Prioritize phases based on immediate needs
3. Start with Phase 1 (Error Bridge) - highest impact
4. Phase 2 can run in parallel if resources available
