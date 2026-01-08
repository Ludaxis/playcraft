# Anthropic Best Practices Implementation Plan

Based on analysis of [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) and [Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents).

---

## Executive Summary

PlayCraft now implements ~95% of Anthropic's recommended best practices. The following phases have been completed:

| Phase | Feature | Status | Implementation |
|-------|---------|--------|----------------|
| 1 | Runtime Error Bridge | ✅ DONE | `errorBridgeService.ts`, `usePreviewErrors.ts` |
| 2 | Response Format Flexibility | ✅ DONE | `ResponseMode` type, edge function parsing |
| 3 | Enhanced Tool Documentation | ✅ DONE | Edit examples, common patterns in system prompt |
| 4 | Service Consolidation | ✅ DONE | `fileIntelligenceService.ts` |
| 5 | Sub-Agent Architecture | 🟢 Future | Not yet implemented |
| 6 | Next Step Prediction (Hybrid) | ✅ DONE | `nextStepPredictionService.ts`, wired to UI |

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

### Acceptance Criteria (COMPLETED)

- [x] Runtime errors from preview iframe are captured
- [x] Errors are deduplicated within configurable window
- [x] Errors are formatted and included in auto-fix context
- [x] Errors are cleared after successful generation
- [x] Outcome tracking includes runtime error count

**Implementation Files:**
- `/apps/web/src/lib/errorBridgeService.ts` - Core service with listener pattern
- `/apps/web/src/hooks/usePreviewErrors.ts` - React hook for error handling
- `/apps/web/src/templates/vite-shadcn.ts` - Injected error capture script
- `/apps/web/src/lib/__tests__/errorBridgeService.test.ts` - 22 tests

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

### Acceptance Criteria (COMPLETED)

- [x] AI can choose response format via `<response_mode>` tag
- [x] Each mode has appropriate parser
- [x] UI handles all response modes appropriately
- [x] 'plan' and 'explanation' modes don't modify files
- [x] Outcome tracking records response mode used

**Implementation Files:**
- `/apps/web/src/types/index.ts` - ResponseMode type, ImplementationPlan, DebugAnalysis interfaces
- `/supabase/functions/generate-playcraft/index.ts` - Response mode parsing and handling
- `/apps/web/src/hooks/usePlayCraftChat.ts` - Plan/explanation mode display
- `/apps/web/src/lib/__tests__/responseFormat.test.ts` - 7 tests

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

### Acceptance Criteria (COMPLETED)

- [x] System prompt includes edit block examples
- [x] Common patterns section added
- [x] Error patterns and fixes documented
- [x] Context sections have clear descriptions

**Implementation:**
- Added to `/supabase/functions/generate-playcraft/index.ts` system prompt

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

### Acceptance Criteria (COMPLETED)

- [x] Single import for file intelligence
- [x] Consistent API across all file operations
- [x] No duplicate file tracking logic
- [x] Existing tests still pass

**Implementation Files:**
- `/apps/web/src/lib/fileIntelligenceService.ts` - Unified API
- `/apps/web/src/lib/__tests__/fileIntelligenceService.test.ts` - 12 tests

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

## Phase 6: Next Step Prediction (Hybrid)

### Problem
After each generation, users face "blank prompt paralysis" - they don't know what to ask next. A proactive suggestion system would guide users through multi-step workflows and increase task completion rates.

### Design Philosophy

**Hybrid Approach**: Combine fast rule-based predictions with AI-powered suggestions for novel situations.

```
┌─────────────────────────────────────────────────────────────────┐
│                    After Generation Completes                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Prediction Engine                           │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   Rule Engine       │    │      AI Fallback                │ │
│  │   (Fast, Free)      │───▶│   (Smart, Contextual)           │ │
│  │                     │    │                                 │ │
│  │ • Pattern matching  │    │ • Novel situations              │ │
│  │ • Common workflows  │    │ • Complex projects              │ │
│  │ • Error → Fix       │    │ • Creative suggestions          │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  💡 Suggested next steps:                                       │
│                                                                  │
│  [Add collision detection]  [Add scoring]  [Add sound effects]  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation

#### 6.1 Core Types

**File**: `/apps/web/src/lib/nextStepPredictor.ts`

```typescript
// Suggestion categories
export type SuggestionCategory =
  | 'enhance'    // Add new features
  | 'fix'        // Fix errors/issues
  | 'test'       // Add tests
  | 'style'      // Improve UI/UX
  | 'refactor'   // Improve code quality
  | 'integrate'  // Connect components
  | 'document';  // Add documentation

export interface NextStepSuggestion {
  id: string;
  prompt: string;              // "Add collision detection"
  category: SuggestionCategory;
  confidence: number;          // 0-1, higher = more relevant
  source: 'rule' | 'ai';       // How it was generated
  reasoning?: string;          // Why this is suggested (for AI)
  priority: number;            // Display order (1 = highest)
}

export interface PredictionContext {
  // What just happened
  recentChanges: string[];           // Files modified
  lastAction: string;                // "Created Button component"
  responseMode: ResponseMode;        // edit, file, plan, etc.

  // Current state
  taskLedger: TaskLedger | null;     // Goal/substeps/blockers
  errors: ValidationError[];         // Any remaining errors
  projectType: string;               // "game", "app", "website"

  // Project knowledge
  gameFeatures?: string[];           // For games: existing features
  components?: string[];             // Existing components
  techStack?: string[];              // React, Canvas, etc.
}

export interface PredictionResult {
  suggestions: NextStepSuggestion[];
  usedAiFallback: boolean;
  generatedAt: number;
}
```

#### 6.2 Rule Engine

**File**: `/apps/web/src/lib/predictionRules.ts`

```typescript
interface PredictionRule {
  id: string;
  name: string;
  // Condition to match
  match: (ctx: PredictionContext) => boolean;
  // Suggestions to generate
  suggest: (ctx: PredictionContext) => NextStepSuggestion[];
}

export const PREDICTION_RULES: PredictionRule[] = [
  // ============================================
  // Error-based rules (highest priority)
  // ============================================
  {
    id: 'fix-ts-errors',
    name: 'Fix TypeScript Errors',
    match: (ctx) => ctx.errors.some(e => e.type === 'typescript'),
    suggest: (ctx) => [{
      id: 'fix-ts',
      prompt: `Fix the ${ctx.errors.filter(e => e.type === 'typescript').length} TypeScript errors`,
      category: 'fix',
      confidence: 0.95,
      source: 'rule',
      priority: 1,
    }],
  },
  {
    id: 'fix-eslint-errors',
    name: 'Fix ESLint Errors',
    match: (ctx) => ctx.errors.some(e => e.type === 'eslint'),
    suggest: (ctx) => [{
      id: 'fix-eslint',
      prompt: 'Fix the ESLint warnings',
      category: 'fix',
      confidence: 0.9,
      source: 'rule',
      priority: 2,
    }],
  },

  // ============================================
  // Component creation rules
  // ============================================
  {
    id: 'new-component-integrate',
    name: 'Integrate New Component',
    match: (ctx) =>
      ctx.lastAction.toLowerCase().includes('created') &&
      ctx.lastAction.toLowerCase().includes('component'),
    suggest: (ctx) => {
      const componentName = extractComponentName(ctx.lastAction);
      return [
        {
          id: 'style-component',
          prompt: `Add styles to ${componentName}`,
          category: 'style',
          confidence: 0.85,
          source: 'rule',
          priority: 3,
        },
        {
          id: 'test-component',
          prompt: `Create tests for ${componentName}`,
          category: 'test',
          confidence: 0.7,
          source: 'rule',
          priority: 4,
        },
        {
          id: 'use-component',
          prompt: `Use ${componentName} in the app`,
          category: 'integrate',
          confidence: 0.8,
          source: 'rule',
          priority: 3,
        },
      ];
    },
  },

  // ============================================
  // Game-specific rules
  // ============================================
  {
    id: 'game-player-movement',
    name: 'After Player Movement',
    match: (ctx) =>
      ctx.projectType === 'game' &&
      ctx.lastAction.toLowerCase().includes('movement'),
    suggest: () => [
      {
        id: 'add-collision',
        prompt: 'Add collision detection',
        category: 'enhance',
        confidence: 0.9,
        source: 'rule',
        priority: 2,
      },
      {
        id: 'add-boundaries',
        prompt: 'Add screen boundaries',
        category: 'enhance',
        confidence: 0.85,
        source: 'rule',
        priority: 3,
      },
    ],
  },
  {
    id: 'game-scoring',
    name: 'After Adding Scoring',
    match: (ctx) =>
      ctx.projectType === 'game' &&
      ctx.lastAction.toLowerCase().includes('scor'),
    suggest: () => [
      {
        id: 'add-high-score',
        prompt: 'Add high score tracking',
        category: 'enhance',
        confidence: 0.85,
        source: 'rule',
        priority: 2,
      },
      {
        id: 'add-score-display',
        prompt: 'Style the score display',
        category: 'style',
        confidence: 0.8,
        source: 'rule',
        priority: 3,
      },
    ],
  },
  {
    id: 'game-initial-setup',
    name: 'After Initial Game Setup',
    match: (ctx) =>
      ctx.projectType === 'game' &&
      (!ctx.gameFeatures || ctx.gameFeatures.length < 3),
    suggest: () => [
      {
        id: 'add-game-loop',
        prompt: 'Add the main game loop',
        category: 'enhance',
        confidence: 0.9,
        source: 'rule',
        priority: 1,
      },
      {
        id: 'add-controls',
        prompt: 'Add keyboard/mouse controls',
        category: 'enhance',
        confidence: 0.85,
        source: 'rule',
        priority: 2,
      },
      {
        id: 'add-game-state',
        prompt: 'Add game state (start, playing, game over)',
        category: 'enhance',
        confidence: 0.8,
        source: 'rule',
        priority: 3,
      },
    ],
  },

  // ============================================
  // Task ledger rules
  // ============================================
  {
    id: 'continue-substeps',
    name: 'Continue Task Substeps',
    match: (ctx) =>
      ctx.taskLedger?.goal_substeps?.some(s => !s.done) ?? false,
    suggest: (ctx) => {
      const nextStep = ctx.taskLedger!.goal_substeps!.find(s => !s.done);
      return [{
        id: 'next-substep',
        prompt: nextStep!.step,
        category: 'enhance',
        confidence: 0.95,
        source: 'rule',
        reasoning: 'Next step in your current goal',
        priority: 1,
      }];
    },
  },
  {
    id: 'resolve-blockers',
    name: 'Resolve Blockers',
    match: (ctx) =>
      (ctx.taskLedger?.known_blockers?.length ?? 0) > 0,
    suggest: (ctx) =>
      ctx.taskLedger!.known_blockers!.map((blocker, i) => ({
        id: `blocker-${i}`,
        prompt: `Resolve: ${blocker}`,
        category: 'fix',
        confidence: 0.9,
        source: 'rule' as const,
        priority: 1,
      })),
  },

  // ============================================
  // General workflow rules
  // ============================================
  {
    id: 'after-refactor',
    name: 'After Refactoring',
    match: (ctx) =>
      ctx.lastAction.toLowerCase().includes('refactor'),
    suggest: () => [
      {
        id: 'run-tests',
        prompt: 'Run tests to verify refactor',
        category: 'test',
        confidence: 0.9,
        source: 'rule',
        priority: 1,
      },
    ],
  },
  {
    id: 'after-style-changes',
    name: 'After Styling',
    match: (ctx) =>
      ctx.recentChanges.some(f => f.includes('.css') || f.includes('style')),
    suggest: () => [
      {
        id: 'add-responsive',
        prompt: 'Add responsive design',
        category: 'style',
        confidence: 0.7,
        source: 'rule',
        priority: 4,
      },
      {
        id: 'add-dark-mode',
        prompt: 'Add dark mode support',
        category: 'style',
        confidence: 0.6,
        source: 'rule',
        priority: 5,
      },
    ],
  },
];

// Helper to extract component name from action string
function extractComponentName(action: string): string {
  const match = action.match(/(?:created|added|built)\s+(\w+)/i);
  return match?.[1] || 'the component';
}
```

#### 6.3 AI Fallback Service

**File**: `/apps/web/src/lib/aiPredictionFallback.ts`

```typescript
const AI_PREDICTION_PROMPT = `Based on the current project state, suggest 3-4 logical next steps the user might want to take.

Current context:
- Project type: {projectType}
- Last action: {lastAction}
- Recently modified files: {recentChanges}
- Current goal: {currentGoal}
- Remaining errors: {errorCount}
- Existing features: {existingFeatures}

Return suggestions as JSON array:
[
  {
    "prompt": "Brief action prompt (imperative, 3-8 words)",
    "category": "enhance|fix|test|style|refactor|integrate",
    "confidence": 0.0-1.0,
    "reasoning": "One sentence explaining why"
  }
]

Guidelines:
- Suggest logical progressions from current state
- Prioritize fixing errors if any exist
- Consider what typically comes next in this type of project
- Be specific, not generic (e.g., "Add enemy AI" not "Add features")
- Don't suggest what was just done`;

export async function getAiPredictions(
  ctx: PredictionContext,
  options?: { maxSuggestions?: number }
): Promise<NextStepSuggestion[]> {
  const prompt = AI_PREDICTION_PROMPT
    .replace('{projectType}', ctx.projectType)
    .replace('{lastAction}', ctx.lastAction)
    .replace('{recentChanges}', ctx.recentChanges.join(', '))
    .replace('{currentGoal}', ctx.taskLedger?.current_goal || 'None')
    .replace('{errorCount}', String(ctx.errors.length))
    .replace('{existingFeatures}', ctx.gameFeatures?.join(', ') || 'Unknown');

  // Use cheaper/faster model for predictions
  const response = await fetch('/api/predict-next-steps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      maxTokens: 500,
      model: 'claude-3-haiku', // Fast & cheap
    }),
  });

  const data = await response.json();
  const suggestions = JSON.parse(data.content);

  return suggestions.map((s: any, i: number) => ({
    id: `ai-${i}`,
    prompt: s.prompt,
    category: s.category,
    confidence: s.confidence,
    source: 'ai' as const,
    reasoning: s.reasoning,
    priority: i + 1,
  }));
}
```

#### 6.4 Main Prediction Service

**File**: `/apps/web/src/lib/nextStepPredictor.ts` (continued)

```typescript
import { PREDICTION_RULES } from './predictionRules';
import { getAiPredictions } from './aiPredictionFallback';

export class NextStepPredictor {
  private ruleEngine: PredictionRule[];
  private useAiFallback: boolean;
  private minRuleSuggestions: number;

  constructor(options?: {
    useAiFallback?: boolean;
    minRuleSuggestions?: number;
  }) {
    this.ruleEngine = PREDICTION_RULES;
    this.useAiFallback = options?.useAiFallback ?? true;
    this.minRuleSuggestions = options?.minRuleSuggestions ?? 2;
  }

  async predict(ctx: PredictionContext): Promise<PredictionResult> {
    // Step 1: Run rule engine
    const ruleSuggestions = this.runRules(ctx);

    // Step 2: Check if we need AI fallback
    const needsAiFallback =
      this.useAiFallback &&
      ruleSuggestions.length < this.minRuleSuggestions;

    let aiSuggestions: NextStepSuggestion[] = [];
    if (needsAiFallback) {
      try {
        aiSuggestions = await getAiPredictions(ctx, {
          maxSuggestions: 4 - ruleSuggestions.length,
        });
      } catch (error) {
        console.warn('AI prediction fallback failed:', error);
      }
    }

    // Step 3: Merge and dedupe
    const allSuggestions = this.mergeAndDedupe([
      ...ruleSuggestions,
      ...aiSuggestions,
    ]);

    // Step 4: Sort by priority and confidence
    const sortedSuggestions = allSuggestions
      .sort((a, b) => {
        // Priority first (lower = better)
        if (a.priority !== b.priority) return a.priority - b.priority;
        // Then confidence (higher = better)
        return b.confidence - a.confidence;
      })
      .slice(0, 4); // Max 4 suggestions

    return {
      suggestions: sortedSuggestions,
      usedAiFallback: aiSuggestions.length > 0,
      generatedAt: Date.now(),
    };
  }

  private runRules(ctx: PredictionContext): NextStepSuggestion[] {
    const suggestions: NextStepSuggestion[] = [];

    for (const rule of this.ruleEngine) {
      if (rule.match(ctx)) {
        suggestions.push(...rule.suggest(ctx));
      }
    }

    return suggestions;
  }

  private mergeAndDedupe(
    suggestions: NextStepSuggestion[]
  ): NextStepSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(s => {
      const key = s.prompt.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// Singleton for easy access
export const nextStepPredictor = new NextStepPredictor();
```

#### 6.5 React Hook

**File**: `/apps/web/src/hooks/useNextStepSuggestions.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { nextStepPredictor, PredictionContext, PredictionResult } from '@/lib/nextStepPredictor';

export function useNextStepSuggestions(ctx: PredictionContext | null) {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!ctx) {
      setResult(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    nextStepPredictor.predict(ctx).then(prediction => {
      if (!cancelled) {
        setResult(prediction);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [ctx]);

  const selectSuggestion = useCallback((suggestion: NextStepSuggestion) => {
    // Track which suggestions users click for learning
    trackSuggestionSelected(suggestion);
    return suggestion.prompt;
  }, []);

  return { suggestions: result?.suggestions ?? [], isLoading, selectSuggestion };
}

// Analytics for improving predictions
async function trackSuggestionSelected(suggestion: NextStepSuggestion) {
  await fetch('/api/track-suggestion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      suggestionId: suggestion.id,
      prompt: suggestion.prompt,
      category: suggestion.category,
      source: suggestion.source,
      confidence: suggestion.confidence,
      selectedAt: Date.now(),
    }),
  });
}
```

#### 6.6 UI Component

**File**: `/apps/web/src/components/NextStepSuggestions.tsx`

```typescript
import { useNextStepSuggestions } from '@/hooks/useNextStepSuggestions';
import { NextStepSuggestion, PredictionContext } from '@/lib/nextStepPredictor';
import { cn } from '@/lib/utils';
import { Sparkles, Zap, Bug, Palette, TestTube, GitMerge } from 'lucide-react';

interface Props {
  context: PredictionContext | null;
  onSelect: (prompt: string) => void;
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  enhance: Sparkles,
  fix: Bug,
  test: TestTube,
  style: Palette,
  refactor: Zap,
  integrate: GitMerge,
};

const CATEGORY_COLORS: Record<string, string> = {
  enhance: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  fix: 'bg-red-500/10 text-red-400 border-red-500/20',
  test: 'bg-green-500/10 text-green-400 border-green-500/20',
  style: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  refactor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  integrate: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export function NextStepSuggestions({ context, onSelect, className }: Props) {
  const { suggestions, isLoading, selectSuggestion } = useNextStepSuggestions(context);

  if (!context || (suggestions.length === 0 && !isLoading)) {
    return null;
  }

  const handleClick = (suggestion: NextStepSuggestion) => {
    const prompt = selectSuggestion(suggestion);
    onSelect(prompt);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4" />
        <span>Suggested next steps</span>
        {isLoading && (
          <span className="animate-pulse text-xs">(thinking...)</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map(suggestion => {
          const Icon = CATEGORY_ICONS[suggestion.category] || Sparkles;
          const colors = CATEGORY_COLORS[suggestion.category] || CATEGORY_COLORS.enhance;

          return (
            <button
              key={suggestion.id}
              onClick={() => handleClick(suggestion)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                'text-sm font-medium border transition-all',
                'hover:scale-105 hover:shadow-md',
                colors
              )}
              title={suggestion.reasoning}
            >
              <Icon className="w-3.5 h-3.5" />
              {suggestion.prompt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

#### 6.7 Integration with Chat

**File**: `/apps/web/src/components/ChatPanel.tsx` (modify)

```typescript
// After generation completes, show suggestions
const [predictionContext, setPredictionContext] = useState<PredictionContext | null>(null);

// Update context after each generation
useEffect(() => {
  if (lastGeneration) {
    setPredictionContext({
      recentChanges: lastGeneration.filesChanged,
      lastAction: lastGeneration.summary,
      responseMode: lastGeneration.mode,
      taskLedger: taskLedger,
      errors: validationErrors,
      projectType: projectMemory?.game_type || 'app',
      gameFeatures: projectMemory?.key_entities?.filter(e => e.type === 'feature').map(e => e.name),
      components: projectMemory?.key_entities?.filter(e => e.type === 'component').map(e => e.name),
      techStack: projectMemory?.tech_stack,
    });
  }
}, [lastGeneration, taskLedger, validationErrors, projectMemory]);

// In render:
<NextStepSuggestions
  context={predictionContext}
  onSelect={(prompt) => {
    setInputValue(prompt);
    // Optionally auto-submit
  }}
  className="mt-4 px-4"
/>
```

#### 6.8 Database Schema for Learning

**File**: `/supabase/migrations/20260109000000_add_suggestion_tracking.sql`

```sql
-- Track which suggestions users select (for improving predictions)
CREATE TABLE IF NOT EXISTS playcraft_suggestion_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES playcraft_projects(id) ON DELETE SET NULL,

  -- Suggestion details
  suggestion_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL,  -- 'rule' or 'ai'
  confidence FLOAT,

  -- Context when clicked
  project_type TEXT,
  last_action TEXT,

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX idx_suggestion_clicks_category
  ON playcraft_suggestion_clicks(category, created_at DESC);

CREATE INDEX idx_suggestion_clicks_source
  ON playcraft_suggestion_clicks(source, created_at DESC);

-- RLS
ALTER TABLE playcraft_suggestion_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own clicks"
  ON playcraft_suggestion_clicks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own clicks"
  ON playcraft_suggestion_clicks FOR SELECT
  USING (auth.uid() = user_id);

-- Analytics function: Which categories are most clicked?
CREATE OR REPLACE FUNCTION get_suggestion_analytics(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  category TEXT,
  source TEXT,
  click_count BIGINT,
  avg_confidence NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT
    category,
    source,
    COUNT(*)::BIGINT as click_count,
    ROUND(AVG(confidence)::NUMERIC, 3) as avg_confidence
  FROM public.playcraft_suggestion_clicks
  WHERE created_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY category, source
  ORDER BY click_count DESC;
$$;

GRANT EXECUTE ON FUNCTION get_suggestion_analytics(INTEGER) TO authenticated;
```

### Tests

**File**: `/apps/web/src/lib/__tests__/nextStepPredictor.test.ts`

```typescript
describe('NextStepPredictor', () => {
  describe('Rule Engine', () => {
    it('suggests fixing TypeScript errors when present', async () => {
      const ctx = createContext({ errors: [{ type: 'typescript' }] });
      const result = await predictor.predict(ctx);
      expect(result.suggestions[0].category).toBe('fix');
    });

    it('suggests integration after component creation', async () => {
      const ctx = createContext({ lastAction: 'Created Button component' });
      const result = await predictor.predict(ctx);
      expect(result.suggestions.some(s => s.prompt.includes('Use Button'))).toBe(true);
    });

    it('suggests game features for game projects', async () => {
      const ctx = createContext({
        projectType: 'game',
        lastAction: 'Added player movement',
      });
      const result = await predictor.predict(ctx);
      expect(result.suggestions.some(s => s.prompt.includes('collision'))).toBe(true);
    });

    it('continues task ledger substeps', async () => {
      const ctx = createContext({
        taskLedger: {
          goal_substeps: [
            { step: 'Add scoring', done: true },
            { step: 'Add high scores', done: false },
          ],
        },
      });
      const result = await predictor.predict(ctx);
      expect(result.suggestions[0].prompt).toBe('Add high scores');
    });
  });

  describe('AI Fallback', () => {
    it('uses AI when rules produce < 2 suggestions', async () => {
      const ctx = createContext({ lastAction: 'Something unusual' });
      const result = await predictor.predict(ctx);
      expect(result.usedAiFallback).toBe(true);
    });

    it('does not use AI when rules are sufficient', async () => {
      const ctx = createContext({
        errors: [{ type: 'typescript' }, { type: 'eslint' }],
      });
      const result = await predictor.predict(ctx);
      expect(result.usedAiFallback).toBe(false);
    });
  });

  describe('Deduplication', () => {
    it('removes duplicate suggestions', async () => {
      // Setup rules that could produce duplicates
      const result = await predictor.predict(ctx);
      const prompts = result.suggestions.map(s => s.prompt.toLowerCase());
      const unique = new Set(prompts);
      expect(prompts.length).toBe(unique.size);
    });
  });
});
```

### Acceptance Criteria (COMPLETED)

- [x] Rule engine provides instant suggestions for common patterns
- [x] Suggestions display with appropriate icons (NextStepsCards component)
- [x] Clicking suggestion populates chat input
- [x] Max 3 suggestions displayed at a time
- [x] Error-fixing suggestions have highest priority
- [x] Game-specific rules work for game projects
- [x] Suggestions wired to chatbox (ChatInput) and inline messages (NextStepsCards)
- [ ] AI fallback activates when rules produce < 2 suggestions (future enhancement)
- [ ] Suggestion clicks tracked for analytics (future enhancement)

**Implementation Files:**
- `/apps/web/src/lib/nextStepPredictionService.ts` - Rule-based prediction engine
- `/apps/web/src/components/builder/NextStepsCards.tsx` - Inline message suggestions
- `/apps/web/src/components/builder/ChatInput.tsx` - Chatbox suggestions
- `/apps/web/src/hooks/usePlayCraftChat.ts` - Hook exposes `suggestions`
- `/apps/web/src/pages/Builder.tsx` - Wires suggestions to ChatInput
- `/apps/web/src/lib/__tests__/nextStepPredictionService.test.ts` - 17 tests

### Configuration Options

```typescript
// Environment variables
NEXT_STEP_AI_FALLBACK=true          // Enable AI fallback
NEXT_STEP_MIN_RULES=2               // Min rule suggestions before AI
NEXT_STEP_MAX_SUGGESTIONS=4         // Max suggestions to show
NEXT_STEP_AI_MODEL=claude-3-haiku   // Model for AI predictions
```

---

## Implementation Timeline

```
Phase 1 (Error Bridge)       ████████████░░░░░░░░  ~2-3 days
Phase 2 (Response Formats)   ██████░░░░░░░░░░░░░░  ~1-2 days
Phase 3 (Documentation)      ████░░░░░░░░░░░░░░░░  ~1 day
Phase 4 (Consolidation)      ████████░░░░░░░░░░░░  ~2 days
Phase 5 (Sub-Agents)         ████████████████████  ~5-7 days (future)
Phase 6 (Next Step Predict)  ██████████░░░░░░░░░░  ~2-3 days
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Auto-fix success rate | ~60% | 85% |
| Context relevance | Unknown | Track via selection_accuracy |
| Response format accuracy | N/A | 90% appropriate mode selection |
| User revert rate | Unknown | <10% |
| Suggestion click rate | N/A | >30% of suggestions clicked |
| AI fallback rate | N/A | <40% (rules should handle most cases) |

---

## Dependencies

- Phase 1: None
- Phase 2: None
- Phase 3: None
- Phase 4: None (can do in parallel)
- Phase 5: Phases 1-4 complete
- Phase 6: None (can do in parallel with 1-4, benefits from task ledger)

---

## Files to Create

```
/apps/web/src/lib/
├── errorBridge.ts                    # Phase 1
├── fileIntelligenceService.ts        # Phase 4
├── nextStepPredictor.ts              # Phase 6
├── predictionRules.ts                # Phase 6
├── aiPredictionFallback.ts           # Phase 6
└── __tests__/
    ├── errorBridge.test.ts           # Phase 1
    └── nextStepPredictor.test.ts     # Phase 6

/apps/web/src/hooks/
└── useNextStepSuggestions.ts         # Phase 6

/apps/web/src/components/
└── NextStepSuggestions.tsx           # Phase 6

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
├── 20260108000000_add_runtime_errors.sql      # Phase 1
└── 20260109000000_add_suggestion_tracking.sql # Phase 6
```

---

## Implementation Status

**Completed (January 2026):**
1. ✅ Phase 1: Runtime Error Bridge - Preview iframe errors captured and fed to auto-fix loop
2. ✅ Phase 2: Response Format Flexibility - AI can choose edit/file/plan/explanation/debug modes
3. ✅ Phase 3: Enhanced Tool Documentation - Edit examples and patterns in system prompt
4. ✅ Phase 4: Service Consolidation - FileIntelligenceService provides unified API
5. ✅ Phase 6: Next Step Prediction - Rule-based suggestions wired to chatbox and messages

**Future Work:**
- Phase 5: Sub-Agent Architecture - For complex multi-step tasks
- AI Fallback for Phase 6 - Use LLM when rules don't match
- Analytics for suggestion clicks
