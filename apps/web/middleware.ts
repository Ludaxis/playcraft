/**
 * Vercel middleware for game subdomains.
 *
 * Redirects *.play.playcraft.games to the Edge Function handler under /api/game/[slug]/...
 * Uses a redirect (307) instead of an internal rewrite to avoid Next.js dependencies.
 */

export const config = {
  matcher: '/((?!api/).*)',
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const hostname = url.hostname;

  const match = hostname.match(/^([^.]+)\.play\.playcraft\.games$/);

  if (match) {
    const slug = match[1];
    const pathname = url.pathname === '/' ? '' : url.pathname;
    const redirectUrl = new URL(`/api/game/${slug}${pathname}`, url);

    return Response.redirect(redirectUrl, 307);
  }

  // Allow all other requests to continue
  return;
}
