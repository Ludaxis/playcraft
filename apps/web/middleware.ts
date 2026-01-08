/**
 * Vercel Edge Middleware for Subdomain Routing
 *
 * Handles requests from *.play.playcraft.games subdomains
 * and routes them to the game-serving Edge Function.
 *
 * This runs at the edge before any other routing.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const config = {
  // Run on all routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Check if this is a game subdomain request
  // Formats:
  // - [slug].play.playcraft.games (production)
  // - [slug].play-playcraft.vercel.app (preview)

  const isGameSubdomain = (() => {
    // Production: [slug].play.playcraft.games
    if (hostname.match(/^[^.]+\.play\.playcraft\.games$/)) {
      return true;
    }
    // Preview deployments: [slug].play-playcraft.vercel.app
    if (hostname.match(/^[^.]+\.play-[^.]+\.vercel\.app$/)) {
      return true;
    }
    // Local development with custom host
    if (hostname.match(/^[^.]+\.play\.localhost(:\d+)?$/)) {
      return true;
    }
    return false;
  })();

  if (!isGameSubdomain) {
    // Not a game subdomain - continue to main app
    return NextResponse.next();
  }

  // Extract slug from subdomain
  const slug = hostname.split('.')[0];

  if (!slug || slug === 'www' || slug === 'play') {
    return NextResponse.next();
  }

  // Rewrite to the game Edge Function
  const gamePath = pathname === '/' ? '/index.html' : pathname;
  const rewriteUrl = new URL(`/api/game/${slug}${gamePath}`, request.url);

  return NextResponse.rewrite(rewriteUrl);
}
