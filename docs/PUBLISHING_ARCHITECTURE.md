# PlayCraft Publishing Architecture

## Overview

Subdomain-based publishing system using Vercel Edge Functions.

**URL Format:** `https://[game-slug].play.playcraft.games`

Example: `https://neon-chess-abc123.play.playcraft.games`

## Architecture (Implemented)

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Vercel DNS (Wildcard)                               │
│              *.play.playcraft.games → Vercel Project             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Vercel Edge Middleware (middleware.ts)              │
│              - Detect subdomain from hostname                    │
│              - Rewrite to /api/game/[slug]/[path]               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Edge Function (/api/game/[...path].ts)              │
│              - Look up project by slug in Supabase               │
│              - Fetch files from Supabase Storage                 │
│              - Serve WITHOUT X-Frame-Options (allows embedding)  │
│              - Proper CORS and caching headers                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Supabase Storage                                    │
│              Bucket: published-games                             │
│              Structure: /[user_id]/[project_id]/versions/...     │
└─────────────────────────────────────────────────────────────────┘
```

## Database Changes

Migration file: `20260108300000_add_game_slug.sql`

```sql
-- Add slug column for subdomain-based game URLs
ALTER TABLE playcraft_projects
ADD COLUMN IF NOT EXISTS slug VARCHAR(60) UNIQUE,
ADD COLUMN IF NOT EXISTS subdomain_url VARCHAR(255);

-- Index for fast slug lookups (used by Edge Function)
CREATE INDEX IF NOT EXISTS idx_projects_slug ON playcraft_projects(slug);
```

## Slug Generation

Location: `apps/web/src/lib/publishService.ts`

```typescript
function generateSlug(gameName: string, projectId: string): string {
  // Normalize: lowercase, remove accents
  let slug = gameName.toLowerCase();
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace non-alphanumeric with hyphens
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  slug = slug.substring(0, 40);

  if (!slug) slug = 'game';

  // Add short unique suffix from project ID
  const suffix = projectId.substring(0, 6);
  return `${slug}-${suffix}`;
}

// Examples:
// "Neon Chess" + "abc123..." → "neon-chess-abc123"
// "My Cool Game!!!" + "xyz789..." → "my-cool-game-xyz789"
// "🎮 Space Invaders 2.0" + "def456..." → "space-invaders-2-0-def456"
```

## Vercel Edge Function

Location: `apps/web/api/game/[...path].ts`

```typescript
// Handles: /api/game/[slug-or-id]/[...path]
export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Extract slug and file path
  const slugOrId = pathParts[2];
  const filePath = pathParts.slice(3).join('/') || 'index.html';

  // Look up project by slug or ID
  const project = await supabase
    .from('playcraft_projects')
    .select('id, user_id, slug, name')
    .eq('slug', slugOrId)
    .eq('status', 'published')
    .single();

  // Fetch file from Supabase Storage
  const storagePath = `${project.user_id}/${project.id}/versions/latest/${filePath}`;
  const { data } = await supabase.storage
    .from('published-games')
    .download(storagePath);

  // Serve WITHOUT X-Frame-Options (allows iframe embedding!)
  return new Response(data, {
    headers: {
      'Content-Type': getContentType(filePath),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

## Edge Middleware

Location: `apps/web/middleware.ts`

```typescript
// Detects subdomain and rewrites to Edge Function
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Check for game subdomain: [slug].play.playcraft.games
  const isGameSubdomain = hostname.match(/^[^.]+\.play\.playcraft\.games$/);

  if (isGameSubdomain) {
    const slug = hostname.split('.')[0];
    const pathname = request.nextUrl.pathname;
    return NextResponse.rewrite(
      new URL(`/api/game/${slug}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}
```

## Publishing Flow

```
1. User clicks "Publish"
   │
   ▼
2. Build game in WebContainer
   - npm run build --base=./
   │
   ▼
3. Collect build files from /dist
   │
   ▼
4. Upload to Supabase Storage
   - PUT /[user_id]/[project_id]/versions/[timestamp]/...
   - Update versions.json and latest.json
   │
   ▼
5. Generate slug (if not exists)
   - Based on game name + short project ID
   - Example: "neon-chess-abc123"
   │
   ▼
6. Update database
   - Set slug, subdomain_url, status='published'
   │
   ▼
7. Return URL: https://[slug].play.playcraft.games
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/api/game/[...path].ts` | Edge Function to serve games |
| `apps/web/middleware.ts` | Subdomain routing middleware |
| `apps/web/src/lib/publishService.ts` | Build, upload, slug generation |
| `apps/web/src/pages/Play.tsx` | Legacy /play/:id route (redirects to subdomain) |
| `supabase/migrations/20260108300000_add_game_slug.sql` | Database migration |

## Setup Steps

### 1. Apply Database Migration
```bash
supabase db push
```

### 2. Configure Vercel Wildcard Domain
In Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add `*.play.playcraft.games`
3. Configure DNS at your registrar:
   - CNAME `*.play` → `cname.vercel-dns.com`

### 3. Set Environment Variables
In Vercel Dashboard → Environment Variables:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
```

### 4. Deploy
```bash
git push origin main
```

## Costs (Vercel)

| Feature | Free Tier | Pro ($20/mo) |
|---------|-----------|--------------|
| Edge Functions | 100GB-hrs | 1000GB-hrs |
| Bandwidth | 100GB | 1TB |
| Custom Domains | Unlimited | Unlimited |
| Wildcard Domains | Yes | Yes |

## Backwards Compatibility

- Legacy `/play/:id` URLs still work
- They redirect to subdomain URL if available
- Existing published games continue to work via Edge Function
