# PlayCraft Q1 2025 Roadmap Spec (Months 1–3)

## Goal
- **Theme:** Close the critical gaps called out in `competitive-analysis-2025.md` by shipping asset workflows, AI art, deployment, GitHub sync, and starter templates.
- **Milestone (end of Month 3):** Users can upload/manage assets, generate images, start from genre templates, sync to GitHub, and one-click deploy to a `playcraft.games` subdomain with automated verification and docs.

## Success Metrics
- **Adoption:** 30% of new projects started from templates; 50% of active projects use asset uploads.
- **Reliability:** 99% successful upload and deploy completion rate over rolling 7 days.
- **Performance:** Asset library loads <1.5s for 100 assets; deploy completes <4 minutes P95.
- **Quality:** All new features covered by unit + integration + e2e tests; zero P0 regressions post-launch.

## Timeline & Deliverables

### Month 1 – Asset Ingestion & Library Foundations
- Ship **Asset Upload System** (images/audio) with validation, storage, metadata, and signed URLs.
- Ship **Asset Library UI** (list/grid, preview, search/filter, tags, usage copy path) in the web app.
- Add **telemetry + logging** for uploads and library interactions.
- Docs: Getting started with uploads, supported types/limits, troubleshooting.

### Month 2 – AI Art & Deployment
- Ship **AI Image Generation** (prompt → sprite/background) with style presets and safety filters.
- Ship **One-Click Deploy** to `*.playcraft.games` with automatic build, preview URL, status surface in UI.
- Harden **asset optimization** (compression, thumbnailing, duplicate detection) and **CDN caching**.
- Docs: AI art usage, cost/quotas, deployment guide, rollback steps.

### Month 3 – Collaboration Hooks & Templates
- Ship **GitHub Sync** (connect, pull/push, branch creation for AI changes, conflict handling).
- Ship **Project Templates** (10 genres) with ready-made assets and instructions; template picker in new project flow.
- Add **release-readiness checklist** (lint/typecheck/test gates) and **rollout plan** (staged + metrics alarms).
- Docs: GitHub setup, template catalog, CI requirements for deploy.

## Feature Specifications & Acceptance Criteria

### 1) Asset Upload System (P0)
- **Scope:** Upload images (PNG, JPG, GIF, WebP, SVG) and audio (WAV, MP3, OGG) to project-scoped storage; max file size 25MB; max 1GB per project for Phase 1.
- **Storage:** Use Supabase storage bucket per project with signed upload/download URLs; store metadata (type, size, dimensions, duration, checksum, createdBy, projectId, tags[]).
- **Validation:** Client-side and server-side MIME/size checks; virus/malware scan hook if available; reject unsupported types with actionable error.
- **Optimization:** Generate thumbnails for raster images; lossless compression for PNG; transcode audio to OGG preview if missing; deduplicate via checksum.
- **UX:** Drag-drop + file picker; progress indicator; error states; retry; copy asset URL/path; access controls based on project membership.
- **Acceptance:**
  - Upload succeeds for all supported types and enforces limits.
  - Thumbnails generated and rendered in library; signed URLs expire.
  - Asset metadata persisted and queryable by project.
  - Unauthorized users cannot upload or fetch assets from other projects.
- **Testing:**
  - Unit: validators (type/size), metadata builders, checksum dedupe.
  - Integration: upload API → storage + metadata record; signed URL expiry; thumbnail job produces expected dimensions.
  - E2E: drag-drop flow, progress UI, retry on network drop, permission denial for non-members.

### 2) Asset Library UI (P0)
- **Scope:** Browse, preview, search, tag, and reuse uploaded assets within the editor.
- **UX:** Grid/list toggle; filters (type, tag, recent); inline preview (image/audio); copy path/button to insert into code; delete with confirmation and usage warning.
- **Performance:** Load first screen <1.5s for 100 assets; lazy load/pagination; cache metadata client-side.
- **Acceptance:**
  - Library reflects uploads in real time; previews render for all types.
  - Search/filter returns correct subset; delete removes asset and clears stale references.
  - Usage copy inserts valid import/path for generator context.
- **Testing:**
  - Unit: hooks/selectors for filtering/search; path formatter.
  - Integration: library component against mocked metadata API; deletion flow updates list.
  - E2E: upload → appears in library → insert path into code → run preview without 404s.

### 3) AI Image Generation (P0)
- **Scope:** Prompt-based generation for sprites/backgrounds/characters with style presets (pixel art, flat, anime, realistic); output PNG/WebP.
- **Flow:** Prompt input, optional reference size, style preset; async job with progress; results saved to asset library with metadata (prompt, seed, style, dimensions, safety flags).
- **Safety:** NSFW/off-policy filter with user-friendly rejection; rate limiting per user/project/day.
- **Acceptance:**
  - Generation requests enqueue and complete with progress updates.
  - Generated assets land in library with correct metadata and thumbnails.
  - Safety filters block disallowed content; rate limits enforced.
- **Testing:**
  - Unit: prompt sanitization, preset mapping, metadata transformation.
  - Integration: generation request → provider stub → storage save; safety block returns 4xx with message.
  - E2E: user submits prompt, sees progress, asset appears in library and can be used in game preview.

### 4) One-Click Deploy (P1)
- **Scope:** Build and deploy current project to `https://<project>.playcraft.games`; generate preview URL and status logs in UI.
- **Pipeline:** Trigger build (pnpm build or web workspace build), bundle assets, upload to hosting bucket/edge, invalidate CDN; optional password-protected preview.
- **Controls:** Environment variable injection from project settings; rollback to previous release; simple deploy history (last 5 entries).
- **Acceptance:**
  - Deploy completes <4 min P95; status surfaced (queued/building/publishing/done/failed).
  - Deployed URL serves latest commit; rollback restores prior version.
  - Errors include actionable logs.
- **Testing:**
  - Unit: deploy request validation, URL builder, status mapping.
  - Integration: build command stub → artifact upload stub → status polling; rollback path.
  - E2E: click deploy → succeeds → live URL works; simulate failure and see surfaced logs.

### 5) GitHub Sync (P1)
- **Scope:** Connect repo, select branch; pull latest into PlayCraft; push AI-generated changes via PR/branch; handle conflicts with diff UI.
- **Auth:** OAuth app; store tokens securely; per-project repo binding.
- **Operations:**
  - Pull: fetch branch, show diff summary before applying.
  - Push: create branch `playcraft/<timestamp>`, commit authored by bot with summary, open PR if enabled.
  - Conflict resolution: surface file-level conflicts, allow keep theirs/ours; abort if unresolved.
- **Acceptance:**
  - First-time connection flow completes; repo linked to project.
  - Pull applies cleanly or surfaces conflicts without data loss.
  - Push creates branch/PR with correct changes and commit message.
  - Tokens and secrets not leaked to client.
- **Testing:**
  - Unit: diff formatting, branch naming, auth token handling.
  - Integration: mocked GitHub API for pull/push/PR; conflict scenario returns UI-friendly payload.
  - E2E: connect repo → pull → edit → push PR → verify branch in GitHub sandbox.

### 6) Project Templates (P1)
- **Scope:** 10 genre templates (platformer, shooter, puzzle, idle, runner, card, tower defense, farming, visual novel, roguelike-lite) with minimal assets, controls, and README.
- **New Project Flow:** Template picker with preview (gif/screenshot), difficulty tag (beginner/intermediate), and feature highlights.
- **Quality Bar:** Each template must run in preview, include at least one AI prompt suggestion, and demonstrate asset library usage.
- **Acceptance:**
  - All templates scaffold successfully; no runtime errors in preview.
  - README includes controls, asset credits, and next-step prompts.
  - Template assets stored in shared library and referenced via stable paths.
- **Testing:**
  - Unit: template manifest validation (metadata, asset references).
  - Integration: scaffold command produces runnable project; lint/typecheck pass.
  - E2E: create project from each template → run preview → deploy succeeds.

## Cross-Cutting Requirements
- **Instrumentation:** Emit metrics for uploads, generation success/fail, deploy duration, GitHub sync outcomes; set alerts for failure rates and latency.
- **Access & Quotas:** Enforce per-user/project limits (uploads/day, generation/day, deploys/day) with clear UI messaging.
- **Observability:** Structured logs for all new APIs; correlation IDs across requests/jobs.
- **Security & Privacy:** Signed URLs, least-privilege storage policies, secret redaction in logs, audit trails for deploys and repo sync.
- **Docs & Education:** Update docs and in-product help for each feature; add quickstart videos/gifs where possible.

## Testing & Release Plan
- **Automation:** Expand Vitest suites in `apps/web` for UI/state; add API integration tests for upload/generation/deploy/sync flows; e2e smoke runs on main for uploads, generation, deploy, template creation.
- **CI Gates:** `pnpm lint`, `pnpm typecheck`, `pnpm test`, targeted e2e suite for new flows; deploy blocked on green.
- **Rollout:** Gradual (10% → 50% → 100%) for AI generation and deploy; feature flags per project; shadow metrics during ramp.
- **Post-Launch:** 7-day hypercare dashboard with SLOs; weekly review of incidents and flakiness; template quality audits.

## Dependencies & Risks
- **AI provider limits** may throttle generation → add queue and graceful retries.
- **CDN/hosting choice** impacts deploy time → benchmark and tune cache/invalidation.
- **GitHub API quotas** → cache metadata, backoff on rate limits.
- **Asset abuse** (copyright/NSFW) → rely on safety filters + report path + takedown policy.

