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
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

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

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    return new Response('Server configuration error', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Look up project by slug first
    let project: ProjectData | null = null;

    const { data: slugProject } = await supabase
      .from('playcraft_projects')
      .select('id, user_id, slug, name')
      .eq('slug', slugOrId)
      .eq('status', 'published')
      .single();

    if (slugProject) {
      project = slugProject as ProjectData;
    } else {
      // Try looking up by project ID as fallback
      const { data: idProject } = await supabase
        .from('playcraft_projects')
        .select('id, user_id, slug, name')
        .eq('id', slugOrId)
        .eq('status', 'published')
        .single();

      if (idProject) {
        project = idProject as ProjectData;
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

  // Use requested file path or default to index.html
  const filePath = requestedFile || 'index.html';

  // Try to get latest version info
  let storagePath: string;

  try {
    const { data: latestData } = await supabase.storage
      .from('published-games')
      .download(`${basePath}/latest.json`);

    if (latestData) {
      const text = await latestData.text();
      const latest = JSON.parse(text);

      if (latest.path) {
        // Versioned path: replace index.html with requested file
        const versionDir = latest.path.replace('/index.html', '');
        storagePath = `${versionDir}/${filePath}`;
      } else {
        storagePath = `${basePath}/${filePath}`;
      }
    } else {
      storagePath = `${basePath}/${filePath}`;
    }
  } catch {
    // No latest.json, use legacy direct path
    storagePath = `${basePath}/${filePath}`;
  }

  // Fetch file from storage
  const { data: fileData, error: fileError } = await supabase.storage
    .from('published-games')
    .download(storagePath);

  if (fileError || !fileData) {
    // Try falling back to index.html for SPA routing
    if (filePath !== 'index.html') {
      return serveGameFile(supabase, project, 'index.html');
    }

    return new Response('File not found', { status: 404 });
  }

  // Get content type
  const contentType = getContentType(filePath);

  // Serve with appropriate headers - NO X-Frame-Options!
  return new Response(fileData, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      // Explicitly NOT setting X-Frame-Options - this allows iframe embedding!
    },
  });
}
