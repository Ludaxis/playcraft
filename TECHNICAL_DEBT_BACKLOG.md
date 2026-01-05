# PlayCraft Technical Debt Backlog

**Created:** January 2026
**Last Updated:** January 2026
**Overall Readiness Score:** 3.5/10 (for millions of users)

---

## Executive Summary

This backlog tracks technical debt that must be resolved before PlayCraft can safely scale to production. Items are prioritized using MoSCoW methodology with effort estimates.

---

## 🔴 CRITICAL (Must Have - Blocks Launch)

### 1. ~~Enable JWT Verification in Edge Function~~
| Attribute | Value |
|-----------|-------|
| **Status** | ✅ COMPLETED |
| **Effort** | 0.5 hours |
| **Risk** | CRITICAL - Security vulnerability |
| **File** | `supabase/config.toml` |

**Problem:** `verify_jwt = false` allows anyone with the anon key to call the edge function without authentication verification at the Supabase gateway level.

**Solution:** Set `verify_jwt = true` and ensure proper JWT handling.

---

### 2. ~~Move Rate Limiting to Persistent Storage~~
| Attribute | Value |
|-----------|-------|
| **Status** | ✅ COMPLETED |
| **Effort** | 2 hours |
| **Risk** | HIGH - DoS vulnerability, cost exposure |
| **File** | `supabase/functions/generate-playcraft/index.ts` |

**Problem:** In-memory rate limiting resets on function cold start and doesn't share state across instances.

**Solution:** Use the existing `playcraft_rate_limits` database table for persistent rate limiting.

---

### 3. ~~Add Per-User Token/Credit Tracking~~
| Attribute | Value |
|-----------|-------|
| **Status** | ✅ COMPLETED |
| **Effort** | 3 hours |
| **Risk** | CRITICAL - Unbounded cost exposure |
| **Files** | New migration, edge function update |

**Problem:** No tracking of AI token usage per user. One user could burn through the entire API budget.

**Solution:**
- Add `playcraft_user_usage` table tracking daily/monthly token usage
- Enforce hard limits before calling AI
- Add usage stats to user settings

---

### 4. ~~Fix CI Pipeline~~
| Attribute | Value |
|-----------|-------|
| **Status** | ✅ COMPLETED |
| **Effort** | 0.5 hours |
| **Risk** | MEDIUM - False confidence in code quality |
| **File** | `.github/workflows/ci.yml` |

**Problem:** CI calls `pnpm test:run` but the root package.json has `pnpm test`. Tests may not be running.

**Solution:** Change to `pnpm test` in CI workflow.

---

### 5. Add Basic Error Alerting
| Attribute | Value |
|-----------|-------|
| **Status** | 🔄 IN PROGRESS |
| **Effort** | 2 hours |
| **Risk** | MEDIUM - Flying blind on production issues |
| **Files** | Sentry configuration, alert rules |

**Problem:** Only basic Sentry initialization. No alerting rules, no PagerDuty/Slack integration.

**Solution:**
- Configure Sentry alert rules for error rate spikes
- Add critical error notifications
- Set up uptime monitoring

---

## 🟠 HIGH PRIORITY (Should Have)

### 6. ~~Tighten CORS Configuration~~
| Attribute | Value |
|-----------|-------|
| **Status** | ✅ COMPLETED |
| **Effort** | 1 hour |
| **Risk** | MEDIUM - Cross-origin attacks possible |
| **File** | `supabase/functions/generate-playcraft/index.ts` |

**Problem:** CORS allows any `*.vercel.app` domain, enabling malicious preview deployments to call API.

**Solution:** Whitelist only specific production and staging domains.

---

### 7. ~~Add Structured Logging~~
| Attribute | Value |
|-----------|-------|
| **Status** | ✅ COMPLETED |
| **Effort** | 2 hours |
| **Risk** | MEDIUM - Poor observability |
| **File** | `supabase/functions/generate-playcraft/index.ts` |

**Problem:** Logging is ad-hoc console.log. No structured format, no request IDs, no correlation.

**Solution:**
- Add request ID to all logs
- Use JSON structured logging format
- Add timing metrics for AI calls

**Implementation:** Added `Logger` class with:
- Unique request IDs (`req_<timestamp>_<random>`)
- JSON structured output for log ingestion
- Timer utilities for duration tracking
- Automatic PII sanitization (email, cards, tokens)
- Log levels: debug, info, warn, error
- `X-Request-Id` header in all responses

---

### 8. ~~Move Files from JSON Blob to Object Storage~~
| Attribute | Value |
|-----------|-------|
| **Status** | ✅ COMPLETED |
| **Effort** | 8 hours |
| **Risk** | HIGH - Database bottleneck at scale |
| **Files** | New migration, service updates |

**Problem:** Project files stored as JSON blob in PostgreSQL. Limits scalability, no partial updates.

**Solution:**
- Use Supabase Storage for file content
- Keep metadata in database
- Implement streaming for large files

**Implementation:**
- Created `project-files` storage bucket with RLS policies
- Added `fileStorageService.ts` with upload/download/delete operations
- Updated `projectService.ts` with dual-mode support (`use_storage` flag)
- New projects automatically use Storage mode
- Backward compatible with existing JSON blob projects
- Files stored at: `{user_id}/{project_id}/{file_path}`

---

### 9. ~~Add Async Queue for AI Generation~~
| Attribute | Value |
|-----------|-------|
| **Status** | ✅ COMPLETED |
| **Effort** | 16 hours |
| **Risk** | HIGH - Poor UX on slow generations |
| **Files** | New queue system (Supabase-based) |

**Problem:** AI generation is synchronous. Long generations block the request.

**Solution:**
- Added `playcraft_generation_jobs` table for job queue
- Jobs submitted return immediately with jobId
- Real-time updates via Supabase Realtime subscriptions
- Polling fallback for connection issues
- Automatic retry logic (up to 3 attempts)
- 55s timeout with stale job detection

**Implementation:**
- `supabase/migrations/20260105100000_add_generation_jobs.sql` - Job queue schema
- `supabase/functions/process-generation/index.ts` - Worker function
- `apps/web/src/lib/generationQueueService.ts` - Queue operations
- `apps/web/src/hooks/useGenerationJob.ts` - React hook
- `apps/web/src/components/builder/JobProgress.tsx` - Progress UI component
- `supabase/functions/generate-playcraft/index.ts` - Added async mode option

---

### 10. Infrastructure as Code
| Attribute | Value |
|-----------|-------|
| **Status** | ⏳ PENDING |
| **Effort** | 8 hours |
| **Risk** | MEDIUM - Configuration drift, manual errors |
| **Files** | New Terraform/Pulumi config |

**Problem:** No IaC. Manual configuration in Supabase dashboard.

**Solution:**
- Add Terraform for Supabase resources
- Separate prod/staging environments
- Secrets management via Vault/SSM

---

## 🟡 MEDIUM PRIORITY (Could Have)

### 11. E2E Tests with Playwright
| Attribute | Value |
|-----------|-------|
| **Status** | ⏳ PENDING |
| **Effort** | 16 hours |
| **Risk** | MEDIUM - Regressions not caught |

**Problem:** No E2E tests. Manual testing only.

**Solution:**
- Add Playwright for critical flows
- Auth, project creation, AI generation, publishing
- Run in CI on PRs

---

### 12. Load Testing with k6
| Attribute | Value |
|-----------|-------|
| **Status** | ⏳ PENDING |
| **Effort** | 8 hours |
| **Risk** | MEDIUM - Unknown capacity limits |

**Problem:** No performance testing. Unknown breaking points.

**Solution:**
- Add k6 load tests
- Establish baseline metrics
- Set performance budgets

---

### 13. API Versioning
| Attribute | Value |
|-----------|-------|
| **Status** | ⏳ PENDING |
| **Effort** | 4 hours |
| **Risk** | LOW - Breaking changes hard to manage |

**Problem:** No API versioning strategy. Breaking changes affect all users.

**Solution:**
- Add version prefix to edge functions
- Implement deprecation policy
- Add contract tests

---

### 14. Feature Flags
| Attribute | Value |
|-----------|-------|
| **Status** | ⏳ PENDING |
| **Effort** | 4 hours |
| **Risk** | LOW - All-or-nothing deployments |

**Problem:** No feature flags. Can't do gradual rollouts.

**Solution:**
- Add LaunchDarkly/Statsig/custom flags
- Enable gradual rollouts
- Kill switches for features

---

### 15. Blue/Green Deployments
| Attribute | Value |
|-----------|-------|
| **Status** | ⏳ PENDING |
| **Effort** | 8 hours |
| **Risk** | MEDIUM - Downtime on deploys |

**Problem:** No zero-downtime deployment strategy.

**Solution:**
- Configure blue/green in Vercel
- Add health checks
- Automated rollback triggers

---

## 🔵 LOW PRIORITY (Won't Have Now)

### 16. Multi-Region Deployment
- **Effort:** 40 hours
- **Rationale:** Not needed until significant international user base

### 17. Custom ML Training Pipeline
- **Effort:** 80+ hours
- **Rationale:** Using Claude API is sufficient for now

### 18. Plugin Ecosystem
- **Effort:** 120+ hours
- **Rationale:** Core platform needs hardening first

### 19. On-Premise/Self-Hosted Option
- **Effort:** 200+ hours
- **Rationale:** No enterprise demand yet

---

## Progress Tracking

| Category | Total | Completed | In Progress | Pending |
|----------|-------|-----------|-------------|---------|
| Critical | 5 | 4 | 1 | 0 |
| High | 5 | 5 | 0 | 0 |
| Medium | 5 | 0 | 0 | 5 |
| Low | 4 | 0 | 0 | 4 |
| **Total** | **19** | **9** | **1** | **9** |

---

## Estimated Total Effort

| Priority | Hours |
|----------|-------|
| Critical | ~8 hours |
| High | ~35 hours |
| Medium | ~40 hours |
| Low | ~440+ hours |

**Minimum for launch (Critical + Core High):** ~25-30 hours of focused work

---

## Next Actions

1. ✅ ~~Enable JWT verification~~
2. ✅ ~~Move rate limiting to database~~
3. ✅ ~~Add per-user credit tracking~~
4. ✅ ~~Fix CI pipeline~~
5. ⏳ Add basic error alerting (Sentry rules)
6. ✅ ~~Tighten CORS~~
7. ✅ ~~Add structured logging~~
8. ✅ ~~Move files to Object Storage~~
9. ✅ ~~Add async queue for AI generation~~
10. ⏳ Set up Infrastructure as Code

---

*This document should be updated after each implementation session.*
