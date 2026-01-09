# Publishing v2 — Server-Managed Deploys & World-Class Delivery

This document proposes a replacement for the current browser-built publish flow. It aligns with competitors (Lovable, Bolt.new, Wix) and our Q1 runway (fast, reliable deploys with observability).

## Goals
- Server-managed, deterministic builds (no WebContainer flakiness).
- Atomic versioning with rollback and promotion.
- Staging/previews plus production with canonical URLs.
- Wildcard + custom domains with auto-SSL.
- Fast global delivery (CDN headers, SPA fallback) and embeddable output.
- Full telemetry: job status, build logs, play metrics, error budgets.

## Architecture Overview
```
User -> Publish API (/api/publish) -> publish_jobs (queued)
                                    -> Worker (Supabase Function/cron)
                                    -> Build artifacts -> storage.published-games
                                    -> publish_versions manifest (immutable)
                                    -> Status/logs -> publish_jobs
                                    -> Domain routing (slug + custom domains)
Vercel Edge middleware: *.play.playcraft.games -> /api/game/[slug]/...
Edge function serves versioned assets with CDN headers + SPA fallback
```

### Key components
- **Publish jobs**: durable queue row with statuses (`queued|building|uploading|finalizing|failed|published`), progress %, log pointer.
- **Publish versions**: immutable records per build with manifest, checksum, size, build time; `latest` pointer for prod, optional `preview` pointer.
- **Domains**: slug-based subdomains plus user-owned custom domains; verification state and SSL issuance.
- **Worker**: server build (Vite `npm run build -- --base=./`), lint/typecheck gate, uploads to Storage, writes manifest, flips pointers atomically.
- **Serving**: Edge function reads manifest, serves versioned paths, SPA fallback to `index.html`, long-cache immutable assets, no X-Frame-Options.
- **Telemetry**: job events, build metrics, play counts, latency/TTFB, error rates; web UI surfaces status + logs.

## Data Model (proposed)
- `publish_jobs`
  - `id uuid pk`, `project_id uuid`, `user_id uuid`
  - `status text` check (`queued`,`building`,`uploading`,`finalizing`,`published`,`failed`)
  - `progress smallint`, `message text`, `log_url text`
  - `version_id uuid` nullable until success
  - `created_at/updated_at`
  - RLS: user scoped; service role for worker.
- `publish_versions`
  - `id uuid pk`, `project_id uuid`, `user_id uuid`
  - `version_tag text` (timestamp or short id)
  - `storage_prefix text` (immutable path)
  - `entrypoint text` (`index.html`), `checksum text`, `size_bytes bigint`
  - `build_time_ms int`, `built_at timestamptz`
  - `is_preview boolean default false`
  - Unique `(project_id, version_tag)`
  - RLS: user scoped; public read via Edge function uses storage only.
- `game_domains`
  - `id uuid pk`, `project_id uuid`, `user_id uuid`
  - `domain text unique`, `type enum('slug','custom')`
  - `verification_status enum('pending','verified','failed')`, `dns_txt text`
  - `ssl_status enum('pending','active','failed')`
  - `target_version uuid` (nullable -> falls back to project latest)
  - RLS: user scoped; service role for verification updates.
- Extend `playcraft_projects`
  - `primary_version_id uuid` (prod)
  - `preview_version_id uuid` (latest preview)
  - Keep legacy `published_url` for redirect shim to subdomain.

## Flow
1) **Enqueue publish** (client calls API):
   - Validate plan limits, project status.
   - Insert `publish_jobs` row (`queued`).
2) **Worker builds**:
   - Fetch project files from DB/storage.
   - Run lint/typecheck + `npm run build -- --base=./`.
   - Stream logs to object storage (`logs/{jobId}.txt`).
3) **Upload artifacts**:
   - Upload to `published-games/{user_id}/{project_id}/{version_tag}/...` with content-type.
   - Write `manifest.json` (files, hashes, sizes) and `latest.json` with atomic pointer to version.
4) **Finalize**:
   - Create `publish_versions` row.
   - Update `primary_version_id` (or `preview_version_id` if preview) on project.
   - Mark job `published` with `version_id`.
5) **Domains**:
   - Slug domain (`{slug}.play.playcraft.games`) points to latest prod version.
   - Custom domain optional; verification via TXT + HTTP challenge; issue SSL; set canonical redirects.
6) **Serve**:
   - Middleware rewrites `*.play.playcraft.games` to `/api/game/[slug]/...`.
   - Edge function resolves domain/slug -> version -> storage path; serves with immutable caching, SPA fallback, no XFO, CSP tuned.
7) **Rollback/Promote**:
   - UI can set `primary_version_id` to any prior `publish_versions.id`; updates `latest.json` pointer atomically.

## API Contract (web app ↔ publish service)
- `POST /api/publish`
  - body: `{ projectId, target: 'preview'|'production', message?: string }`
  - response: `{ jobId }`
- `GET /api/publish/:jobId`
  - response: `{ status, progress, message, logUrl, versionId? }`
- `GET /api/publish/:projectId/latest`
  - response: `{ primaryVersionId, previewVersionId, domains: [...] }`
- `POST /api/publish/:projectId/rollback`
  - body: `{ versionId }`
- `POST /api/domains`
  - body: `{ projectId, domain }`
  - response: `{ verificationToken, status }`

## Serving Rules
- Long-cache static assets: `cache-control: public, max-age=31536000, immutable`.
- HTML entry: `cache-control: no-cache` to allow pointer updates.
- SPA fallback: if file missing, fall back to `index.html`.
- Headers: allow embedding (no X-Frame-Options), set `X-Content-Type-Options: nosniff`, CSP with relaxed `frame-ancestors *` (configurable).

## Cutover Plan
- Migration: create tables, add columns, backfill slugs/subdomain URLs where missing.
- Backfill versions: wrap existing `published-games` assets into `publish_versions` rows and generate manifests/pointers.
- Deploy middleware + enhanced edge serve; keep `/play/:id` redirect during transition.
- Ship new UI states: queued/building/uploading/finalizing/published, live logs, preview link, promote/rollback, custom domain attach.
- Decommission old browser build path after all active users moved to server pipeline.
