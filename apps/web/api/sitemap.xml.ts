/**
 * Dynamic Sitemap Generator - Vercel Edge Function
 * Generates sitemap.xml with all static pages and published games
 *
 * Accessible at: /api/sitemap.xml
 * Add a rewrite in vercel.json: "/sitemap.xml" -> "/api/sitemap.xml"
 */

import { createClient } from '@supabase/supabase-js';

// Declare process.env for Edge Runtime
declare const process: { env: Record<string, string | undefined> };

export const config = {
  runtime: 'edge',
};

const BASE_URL = 'https://playcraft.dev';

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

export default async function handler(): Promise<Response> {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      // Return sitemap with just static pages if DB not available
      return new Response(generateSitemapXml([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    // Use service role to bypass RLS, fallback to anon key
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

    // Fetch all published games
    const { data: games, error } = await supabase
      .from('playcraft_projects')
      .select('id, published_at, updated_at')
      .eq('status', 'published')
      .eq('is_public', true)
      .order('published_at', { ascending: false })
      .limit(1000); // Limit to 1000 games per sitemap

    if (error) {
      console.error('Error fetching games:', error);
      // Return sitemap with just static pages on error
      return new Response(generateSitemapXml([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    const sitemap = generateSitemapXml(games || []);

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, serve stale for 24h
      },
    });
  } catch (err) {
    console.error('Sitemap generation error:', err);

    // Return basic sitemap on any error
    return new Response(generateSitemapXml([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }
}
