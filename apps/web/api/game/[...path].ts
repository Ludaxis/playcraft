/**
 * Vercel Edge Function to serve published games
 *
 * Routes:
 * - /api/game/[slug-or-id]/[...path] - Serve game files
 *
 * This function:
 * 1. Extracts slug/id from the URL path
 * 2. Looks up the project in Supabase
 * 3. Fetches the game files from Supabase Storage
 * 4. Serves them WITHOUT X-Frame-Options (allowing iframe embedding)
 *
 * This solves the issue where Supabase Storage blocks iframe embedding.
 */

import { createClient } from '@supabase/supabase-js';

// Declare process.env for Edge Runtime (env vars are available but not typed)
declare const process: { env: Record<string, string | undefined> };

export const config = {
  runtime: 'edge',
};

// Content type mapping
const CONTENT_TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  js: 'application/javascript',
  mjs: 'application/javascript',
  css: 'text/css',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  mp4: 'video/mp4',
  webm: 'video/webm',
  map: 'application/json',
};

function getContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

interface ProjectData {
  id: string;
  user_id: string;
  slug: string | null;
  name: string;
  primary_version_id?: string | null;
  preview_version_id?: string | null;
  status?: string | null;
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Extract slug/id and path from URL
  // Format: /api/game/[slug-or-id]/[...path]
  const pathParts = url.pathname.split('/').filter(Boolean);

  // pathParts = ['api', 'game', slug, ...filePath]
  if (pathParts.length < 3 || pathParts[0] !== 'api' || pathParts[1] !== 'game') {
    return new Response('Invalid path', { status: 400 });
  }

  const slugOrId = pathParts[2];
  const filePath = pathParts.slice(3).join('/') || 'index.html';

  // Initialize Supabase client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    return new Response('Server configuration error', { status: 500 });
  }

  // Log which key we're using
  console.log('[handler] Supabase auth:', {
    hasServiceKey: !!supabaseServiceKey,
    usingKey: supabaseServiceKey ? 'service_role' : 'anon',
  });

  // Prefer service role for server-side fetch (required to read publish_versions under RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

  try {
    // Check for domain mapping first (custom domain support)
    let mappedProjectId: string | null = null;
    let mappedVersionId: string | null = null;

    const { data: domainRecord } = await supabase
      .from('game_domains')
      .select('project_id, target_version')
      .eq('domain', hostname)
      .maybeSingle();

    if (domainRecord?.project_id) {
      mappedProjectId = domainRecord.project_id as string;
      mappedVersionId = domainRecord.target_version as string | null;
    }

    // Look up project by slug first
    let project: ProjectData | null = null;

    if (mappedProjectId) {
      const { data: mapped } = await supabase
        .from('playcraft_projects')
        .select('id, user_id, slug, name, primary_version_id, preview_version_id, status')
        .eq('id', mappedProjectId)
        .maybeSingle();

      if (mapped && mapped.status === 'published') {
        project = mapped as ProjectData;
        if (mappedVersionId) {
          project.primary_version_id = mappedVersionId;
        }
      }
    }

    if (!project) {
      const { data: slugProject } = await supabase
        .from('playcraft_projects')
        .select('id, user_id, slug, name, primary_version_id, preview_version_id, status')
        .eq('slug', slugOrId)
        .maybeSingle();

      if (slugProject && slugProject.status === 'published') {
        project = slugProject as ProjectData;
      } else {
        // Try looking up by project ID as fallback
        const { data: idProject } = await supabase
          .from('playcraft_projects')
          .select('id, user_id, slug, name, primary_version_id, preview_version_id, status')
          .eq('id', slugOrId)
          .maybeSingle();

        if (idProject && idProject.status === 'published') {
          project = idProject as ProjectData;
        }
      }
    }

    if (!project) {
      return new Response(
        `<!DOCTYPE html>
<html>
<head><title>Game Not Found</title></head>
<body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0a0a0f; color: #fff;">
  <div style="text-align: center;">
    <h1>Game Not Found</h1>
    <p>The game "${slugOrId}" doesn't exist or isn't published.</p>
    <a href="https://playcraft.games" style="color: #8b5cf6;">Back to PlayCraft</a>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    return serveGameFile(supabase, project, filePath);

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}

async function serveGameFile(
  supabase: ReturnType<typeof createClient>,
  project: ProjectData,
  requestedFile: string
): Promise<Response> {
  const basePath = `${project.user_id}/${project.id}`;

  // Debug logging
  console.log('[serveGameFile] Starting:', {
    projectId: project.id,
    projectName: project.name,
    basePath,
    requestedFile,
    primary_version_id: project.primary_version_id || 'null',
  });

  // Resolve version from primary pointer if available
  let storagePrefix: string | null = null;
  let entrypoint = 'index.html';
  let manifestFiles: Record<string, { contentType: string }> = {};

  if (project.primary_version_id) {
    const { data: version, error: versionError } = await supabase
      .from('publish_versions')
      .select('storage_prefix, entrypoint')
      .eq('id', project.primary_version_id)
      .maybeSingle();

    console.log('[serveGameFile] publish_versions query:', {
      versionId: project.primary_version_id,
      found: !!version,
      storage_prefix: version?.storage_prefix || 'null',
      error: versionError?.message || 'none',
    });

    if (version?.storage_prefix) {
      storagePrefix = version.storage_prefix.replace(/\/$/, '');
      entrypoint = version.entrypoint || 'index.html';
    }
  }

  // Fallback to latest.json if no version pointer
  if (!storagePrefix) {
    const latestPath = `${basePath}/latest.json`;
    console.log('[serveGameFile] Trying latest.json fallback:', latestPath);

    try {
      const { data: latestData, error: latestError } = await supabase.storage
        .from('published-games')
        .download(latestPath);

      console.log('[serveGameFile] latest.json result:', {
        found: !!latestData,
        error: latestError?.message || 'none',
      });

      if (latestData) {
        const text = await latestData.text();
        const latest = JSON.parse(text);

        console.log('[serveGameFile] latest.json content:', latest);

        if (latest.path) {
          // Extract version directory from path (remove filename at end)
          // Handle both /index.html and other entrypoints
          const lastSlashIdx = latest.path.lastIndexOf('/');
          if (lastSlashIdx > 0) {
            storagePrefix = latest.path.substring(0, lastSlashIdx);
          } else {
            storagePrefix = latest.path.replace(/\/index\.html$/, '');
          }
          console.log('[serveGameFile] Resolved storagePrefix from latest.json:', storagePrefix);
        }
      }
    } catch (e) {
      console.log('[serveGameFile] latest.json fallback failed:', e instanceof Error ? e.message : 'unknown');
    }
  }

  // Default to legacy direct path
  const rootPrefix = storagePrefix || basePath;
  let filePath = requestedFile || entrypoint;

  console.log('[serveGameFile] Path resolution:', {
    storagePrefix: storagePrefix || 'null (using basePath)',
    rootPrefix,
    filePath,
    entrypoint,
  });

  // Try to load manifest for content-type awareness
  if (storagePrefix) {
    try {
      const { data: manifestData } = await supabase.storage
        .from('published-games')
        .download(`${rootPrefix}/manifest.json`);

      if (manifestData) {
        const text = await manifestData.text();
        const manifest = JSON.parse(text) as { files?: Array<{ path: string; contentType?: string }>; entrypoint?: string };
        if (manifest.entrypoint) entrypoint = manifest.entrypoint;
        if (Array.isArray(manifest.files)) {
          manifestFiles = manifest.files.reduce((acc, file) => {
            acc[file.path] = { contentType: file.contentType || getContentType(file.path) };
            return acc;
          }, {} as Record<string, { contentType: string }>);
        }
        console.log('[serveGameFile] Manifest loaded:', { entrypoint, fileCount: manifest.files?.length || 0 });
      }
    } catch {
      // ignore manifest failures
    }
  }

  if (Object.keys(manifestFiles).length > 0 && filePath !== entrypoint && !manifestFiles[filePath]) {
    filePath = entrypoint;
  }

  const storagePath = `${rootPrefix}/${filePath}`;
  console.log('[serveGameFile] Attempting to download:', storagePath);

  // Fetch file from storage
  const { data: fileData, error: fileError } = await supabase.storage
    .from('published-games')
    .download(storagePath);

  if (fileError || !fileData) {
    console.log('[serveGameFile] Download failed:', {
      storagePath,
      error: fileError?.message || 'no data returned',
    });

    // Try falling back to entrypoint for SPA routing
    if (filePath !== entrypoint) {
      console.log('[serveGameFile] Retrying with entrypoint:', entrypoint);
      return serveGameFile(supabase, project, entrypoint);
    }

    return new Response('File not found', { status: 404 });
  }

  console.log('[serveGameFile] File downloaded successfully:', storagePath);

  const contentType = manifestFiles[filePath]?.contentType || getContentType(filePath);
  const isHtml = contentType.startsWith('text/html');
  const cacheControl = isHtml
    ? 'no-cache, must-revalidate'
    : 'public, max-age=31536000, immutable';

  // For HTML files, inject a script to fix BrowserRouter games
  // This script triggers a navigation to "/" after React Router mounts
  let responseBody: Blob | string = fileData;
  if (isHtml) {
    const htmlText = await fileData.text();
    // Inject a script that navigates to "/" using the History API
    // This triggers after React mounts and dispatches popstate to notify React Router
    const fixScript = `<script>
(function() {
  // Skip if already at root or has hash (HashRouter)
  if (window.location.pathname === '/' || window.location.hash) return;

  // Wait for DOM and React to be ready, then navigate to "/"
  function navigateToRoot() {
    // Push "/" to history and dispatch popstate to trigger React Router
    window.history.replaceState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }

  // Try immediately, then retry after React likely mounts
  if (document.readyState === 'complete') {
    setTimeout(navigateToRoot, 50);
  } else {
    window.addEventListener('load', function() {
      setTimeout(navigateToRoot, 50);
    });
  }
})();
</script>`;
    // Insert the script right after <head> to run as early as possible
    responseBody = htmlText.replace(/<head>/i, '<head>' + fixScript);
  }

  return new Response(responseBody, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Content-Type-Options': 'nosniff',
      // Explicitly NOT setting X-Frame-Options - this allows iframe embedding!
    },
  });
}
