/**
 * Cloudflare Worker to serve published PlayCraft games
 *
 * Routes: *.play.playcraft.games → Supabase Storage
 *
 * Setup:
 * 1. Create worker in Cloudflare Dashboard
 * 2. Add route: *.play.playcraft.games/*
 * 3. Set environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Extract slug from subdomain: {slug}.playcraft.games
    // Skip www and other reserved subdomains
    const reserved = ['www', 'app', 'api', 'admin', 'dashboard', 'mail', 'play'];
    const match = hostname.match(/^([^.]+)\.playcraft\.games$/);
    if (!match || reserved.includes(match[1])) {
      return new Response('Invalid subdomain', { status: 400 });
    }

    const slug = match[1];
    const filePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);

    try {
      // Look up project by slug using Supabase REST API
      const projectRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/playcraft_projects?slug=eq.${slug}&select=id,user_id,slug,name,primary_version_id,status`,
        {
          headers: {
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );

      const projects = await projectRes.json() as Array<{
        id: string;
        user_id: string;
        slug: string;
        name: string;
        primary_version_id: string | null;
        status: string;
      }>;

      if (!projects.length || projects[0].status !== 'published') {
        return notFoundPage(slug);
      }

      const project = projects[0];

      // Get version info for storage prefix
      let storagePrefix = `${project.user_id}/${project.id}`;

      if (project.primary_version_id) {
        const versionRes = await fetch(
          `${env.SUPABASE_URL}/rest/v1/publish_versions?id=eq.${project.primary_version_id}&select=storage_prefix,entrypoint`,
          {
            headers: {
              'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
          }
        );

        const versions = await versionRes.json() as Array<{
          storage_prefix: string;
          entrypoint: string;
        }>;

        if (versions.length && versions[0].storage_prefix) {
          storagePrefix = versions[0].storage_prefix;
        }
      }

      // Fetch file from Supabase Storage
      const storagePath = `${storagePrefix}/${filePath}`;
      const fileUrl = `${env.SUPABASE_URL}/storage/v1/object/public/published-games/${storagePath}`;

      const fileRes = await fetch(fileUrl);

      if (!fileRes.ok) {
        // Try index.html for SPA routing
        if (filePath !== 'index.html') {
          const indexUrl = `${env.SUPABASE_URL}/storage/v1/object/public/published-games/${storagePrefix}/index.html`;
          const indexRes = await fetch(indexUrl);

          if (indexRes.ok) {
            return new Response(indexRes.body, {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, must-revalidate',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
        }
        return new Response('File not found', { status: 404 });
      }

      const contentType = getContentType(filePath);
      const isHtml = contentType.startsWith('text/html');
      const cacheControl = isHtml
        ? 'no-cache, must-revalidate'
        : 'public, max-age=31536000, immutable';

      return new Response(fileRes.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': cacheControl,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'X-Content-Type-Options': 'nosniff',
        },
      });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response('Internal server error', { status: 500 });
    }
  },
};

function notFoundPage(slug: string): Response {
  return new Response(
    `<!DOCTYPE html>
<html>
<head><title>Game Not Found</title></head>
<body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0a0a0f; color: #fff;">
  <div style="text-align: center;">
    <h1>Game Not Found</h1>
    <p>The game "${slug}" doesn't exist or isn't published.</p>
    <a href="https://playcraft.games" style="color: #8b5cf6;">Back to PlayCraft</a>
  </div>
</body>
</html>`,
    {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}
