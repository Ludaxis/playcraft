# PlayCraft Code Generation Improvement Roadmap

## Current Architecture

```
User Request
     ↓
[Claude Orchestrator] → Understands intent, plans changes
     ↓
[Gemini Generator] → Writes code following plan
     ↓
Apply Changes → WebContainer
     ↓
[Code Validator] → TypeScript + ESLint checks
     ↓
[Auto-Fixer] → Retry on errors (up to 3x)
     ↓
[Outcome Tracker] → Record for learning
```

## Implementation Status

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| 1 | Error Feedback Loop | DONE | TypeScript validation + auto-retry |
| 2 | AST-Based Edit Mode | PENDING | Low priority |
| 3 | Intelligent Retry | DONE | Part of Phase 1 |
| 4 | Code Quality Checks | DONE | ESLint validation added |
| 5 | Learning System | DONE | Generation outcomes tracking |
| 6 | Multi-File Awareness | PENDING | Context Management handles this |
| 7 | Preview Validation | DONE | Runtime error capture via errorBridge |

## Gap Analysis

### Current Weaknesses

| Issue | Impact | Current State |
|-------|--------|---------------|
| ~~No error feedback loop~~ | ~~AI doesn't know if code broke~~ | FIXED - Auto-retry on errors |
| Edit mode can fail | "find" string must be exact match | Falls back to file mode |
| ~~No code validation~~ | ~~Syntax/type errors not caught~~ | FIXED - TS + ESLint checks |
| ~~No self-correction~~ | ~~Failed changes require manual retry~~ | FIXED - Auto-fix up to 3x |
| ~~Limited context window~~ | ~~Large projects lose context~~ | FIXED - Smart context system |
| ~~No learning from mistakes~~ | ~~Same errors repeat~~ | FIXED - Outcome tracking |

---

## Improvement Phases

### Phase 1: Error Feedback Loop (High Impact) - COMPLETED
**Goal:** AI knows when code breaks and can auto-fix

```
Generate Code
     ↓
Apply to WebContainer
     ↓
[NEW] Run TypeScript Check ────→ Errors? ──→ Send back to AI
     ↓                                           ↓
[NEW] Check Terminal Output ───→ Runtime Errors? → Auto-retry with context
     ↓
Success → Show to user
```

**Implementation:**
1. After applying files, run `tsc --noEmit` in WebContainer
2. Capture any TypeScript errors
3. If errors exist, call AI again with error context
4. Limit retries to 3 attempts
5. Show user what was fixed

**Files to create/modify:**
- `apps/web/src/lib/codeValidator.ts` - Run TS check, capture errors
- `apps/web/src/hooks/usePlayCraftChat.ts` - Add retry logic
- `supabase/functions/generate-playcraft/index.ts` - Handle error context

---

### Phase 2: AST-Based Edit Mode (Medium Impact)
**Goal:** More reliable code modifications using AST instead of text search

**Current Problem:**
```typescript
// Edit mode tries to find this exact string:
"backgroundColor: '#1a1a2e'"

// But code might have:
"backgroundColor: \"#1a1a2e\""  // Different quotes
"backgroundColor:  '#1a1a2e'"   // Extra space
```

**Solution:** Use TypeScript AST for modifications

```typescript
// Instead of text search/replace:
{
  "edits": [{ "find": "...", "replace": "..." }]
}

// Use AST-aware operations:
{
  "astEdits": [
    {
      "file": "/src/pages/Index.tsx",
      "operation": "updateProperty",
      "target": { "component": "div", "prop": "style.backgroundColor" },
      "newValue": "'#ff0000'"
    }
  ]
}
```

**Implementation:**
- Use `ts-morph` or `@babel/parser` for AST manipulation
- Define common edit operations (change prop, rename variable, etc.)
- Fallback to text search if AST edit fails

---

### Phase 3: Intelligent Retry with Context (High Impact)
**Goal:** When something fails, automatically retry with better context

**Retry Strategy:**
```
Attempt 1: Normal request
     ↓ Failed?
Attempt 2: Add error message + surrounding code
     ↓ Failed?
Attempt 3: Switch from edit mode to file mode
     ↓ Failed?
Show error to user with explanation
```

**Context Enhancement:**
- Include the exact error message
- Include 20 lines before/after the error location
- Include what the AI tried to do
- Include what worked vs what failed

---

### Phase 4: Code Quality Checks (Medium Impact) - COMPLETED
**Goal:** Ensure generated code follows project standards

**Checks to add:**
1. **Linting** - Run ESLint after generation
2. **Formatting** - Run Prettier for consistency
3. **Type Safety** - Ensure no `any` types introduced
4. **Import Validation** - Check all imports resolve
5. **Dead Code Detection** - Remove unused code

**Implementation:**
```typescript
async function validateGeneratedCode(files: FileContent[]) {
  const issues: CodeIssue[] = [];

  // 1. TypeScript check
  const tsErrors = await runTypeScript(files);
  issues.push(...tsErrors);

  // 2. Lint check
  const lintErrors = await runESLint(files);
  issues.push(...lintErrors);

  // 3. Format check
  const formatIssues = await checkFormatting(files);
  issues.push(...formatIssues);

  return issues;
}
```

---

### Phase 5: Learning & Adaptation (High Impact, Long-term) - COMPLETED
**Goal:** System improves over time based on outcomes

**Track:**
- Which changes were accepted vs reverted
- Which prompts led to errors
- Which file patterns work best
- Common user corrections

**Use for:**
- Better few-shot examples in prompts
- Improved context selection
- Smarter edit vs file mode decisions

**Storage:**
```sql
CREATE TABLE generation_outcomes (
  id UUID PRIMARY KEY,
  project_id UUID,
  prompt TEXT,
  response JSONB,
  was_accepted BOOLEAN,
  had_errors BOOLEAN,
  user_corrections TEXT[],
  created_at TIMESTAMPTZ
);
```

---

### Phase 6: Multi-File Awareness (Medium Impact)
**Goal:** AI understands relationships between files

**Current:** Each file is treated independently
**Goal:** AI knows about imports, shared types, component hierarchy

**Implementation:**
- Build dependency graph at project load
- When modifying a file, include dependents in context
- When adding new code, suggest proper file location
- Validate imports exist after changes

---

### Phase 7: Preview Validation (High Impact) - COMPLETED
**Goal:** Verify the game actually works after changes

**Checks:**
1. **Visual Diff** - Screenshot before/after, detect major changes
2. **Console Errors** - Capture and report runtime errors
3. **Interaction Test** - Basic smoke test (does it render?)
4. **Performance Check** - Detect significant slowdowns

**Implementation:**
```typescript
async function validatePreview(previewUrl: string) {
  // Take screenshot
  const screenshot = await capturePreview(previewUrl);

  // Check for console errors
  const consoleErrors = await getConsoleErrors();

  // Basic interaction test
  const responds = await testInteraction();

  return {
    screenshot,
    consoleErrors,
    isResponsive: responds,
    hasVisibleContent: analyzeScreenshot(screenshot)
  };
}
```

---

## Recommended Implementation Order

### Completed
1. **Error Feedback Loop** - TypeScript validation + auto-retry (up to 3x)
2. **Intelligent Retry** - Error context sent to AI for fixes
3. **Code Quality Checks** - ESLint validation in generated projects
4. **Preview Validation** - Runtime errors captured via errorBridge
5. **Learning System** - Generation outcomes tracked in database

### Remaining
6. **AST-Based Edits** - More reliable modifications (lower priority)
7. **Multi-File Awareness** - Already handled by Context Management system

---

## Quick Wins (Can Implement Today)

### 1. Add TypeScript Error Capture
```typescript
// In usePlayCraftChat.ts after applying files:
const tsErrors = await runCommand('npx', ['tsc', '--noEmit']);
if (tsErrors) {
  // Retry with error context
  await sendAiMessage(`Fix these TypeScript errors:\n${tsErrors}`, selectedFile);
}
```

### 2. Better Error Messages to AI
```typescript
// When retrying, include:
const retryContext = `
PREVIOUS ATTEMPT FAILED:
Error: ${errorMessage}
Location: ${errorLocation}

Your previous change:
${previousChange}

Please fix the error while keeping the intended functionality.
`;
```

### 3. Validate Imports Exist
```typescript
// After generating code, check imports:
for (const importPath of extractImports(code)) {
  if (!fileExists(importPath)) {
    errors.push(`Import not found: ${importPath}`);
  }
}
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Changes with errors | ~30% | <5% |
| Auto-fix success rate | 0% | >80% |
| User retry rate | ~40% | <10% |
| Edit mode success | ~60% | >90% |
| User satisfaction | Unknown | >4.5/5 |

---

## Architecture After All Improvements

```
User Request
     ↓
[Claude Orchestrator]
  • Understands intent
  • Analyzes project state
  • Creates detailed plan
  • Chooses best edit strategy
     ↓
[Gemini Generator]
  • Follows plan exactly
  • Uses AST for edits when possible
  • Generates minimal changes
     ↓
[Code Validator]
  • TypeScript check
  • Lint check
  • Import validation
     ↓
[Auto-Fixer] ←──── Errors? ────→ Retry with context (max 3x)
     ↓
[Preview Validator]
  • Screenshot
  • Console errors
  • Basic smoke test
     ↓
[Learning System]
  • Track outcome
  • Update prompts
  • Improve over time
     ↓
Show to User
```
