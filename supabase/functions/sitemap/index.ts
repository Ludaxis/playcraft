/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml with all static pages and published games
 *
 * This Edge Function queries the database for all published games
 * and generates an XML sitemap for search engines.
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const BASE_URL = 'https://playcraft.games';

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/playground', priority: '0.9', changefreq: 'daily' },
  { path: '/faq', priority: '0.8', changefreq: 'monthly' },
  { path: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
  { path: '/pitch', priority: '0.6', changefreq: 'monthly' },
  { path: '/pitch-fa', priority: '0.5', changefreq: 'monthly' },
  { path: '/pitch-ar', priority: '0.5', changefreq: 'monthly' },
];

interface PublishedGame {
  id: string;
  published_at: string | null;
  updated_at: string | null;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(date: string | null): string {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

function generateSitemapXml(games: PublishedGame[]): string {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  // Add static pages
  for (const page of STATIC_PAGES) {
    xml += `  <url>
    <loc>${escapeXml(BASE_URL + page.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  // Add published games
  for (const game of games) {
    const lastmod = formatDate(game.published_at || game.updated_at);
    xml += `  <url>
    <loc>${escapeXml(`${BASE_URL}/play/${game.id}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      // Return sitemap with just static pages if DB not available
      return new Response(generateSitemapXml([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    }

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all published games
    const { data: games, error } = await supabase
      .from('playcraft_projects')
      .select('id, published_at, updated_at')
      .eq('status', 'published')
      .eq('is_public', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      // Return sitemap with just static pages on error
      return new Response(generateSitemapXml([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const sitemap = generateSitemapXml(games || []);

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Robots-Tag': 'noindex', // Sitemap itself shouldn't be indexed
      },
    });
  } catch (err) {
    console.error('Sitemap generation error:', err);

    // Return basic sitemap on any error
    return new Response(generateSitemapXml([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
});
