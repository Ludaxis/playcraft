/**
 * Play Page - Public game player
 *
 * Serves published games at /play/:id via the Edge Function.
 * The Edge Function proxies game files from Supabase Storage
 * without X-Frame-Options, allowing iframe embedding.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play as PlayIcon, Maximize2, Share2, ArrowLeft, Loader2, Gamepad2 } from 'lucide-react';
import { incrementPlayCount, getPublishedGames } from '../lib/publishService';
import { getSupabase } from '../lib/supabase';
import { LogoIcon, Logo } from '../components/Logo';
import { GameDiscoverySidebar } from '../components/playground/GameDiscoverySidebar';
import type { PublishedGame } from '../types';

// Extended type to include subdomain fields
interface PublishedGameWithSubdomain extends PublishedGame {
  slug?: string;
  subdomain_url?: string;
}

interface PlayPageProps {
  gameId: string;
}

export function PlayPage({ gameId }: PlayPageProps) {
  const navigate = useNavigate();
  const [game, setGame] = useState<PublishedGameWithSubdomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [relatedGames, setRelatedGames] = useState<PublishedGame[]>([]);

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) {
        setError('No game ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch game with subdomain fields
        const supabase = getSupabase();
        const { data, error: fetchError } = await supabase
          .from('playcraft_projects')
          .select(`
            id,
            name,
            description,
            published_url,
            published_at,
            play_count,
            user_id,
            slug,
            subdomain_url
          `)
          .eq('id', gameId)
          .eq('status', 'published')
          .single();

        if (fetchError || !data) {
          setError('Game not found or not published');
          setLoading(false);
          return;
        }

        // Serve game via Edge Function (no subdomain redirect - requires DNS config)
        const gameData: PublishedGameWithSubdomain = {
          id: data.id,
          name: data.name,
          description: data.description,
          thumbnail_url: null,
          published_url: data.published_url,
          published_at: data.published_at,
          play_count: data.play_count || 0,
          user_id: data.user_id,
          author_name: 'PlayCraft Creator',
          author_avatar: null,
          slug: data.slug,
          subdomain_url: data.subdomain_url,
        };

        setGame(gameData);

        // Increment play count (fire and forget)
        incrementPlayCount(gameId);
      } catch (err) {
        console.error('[PlayPage] Error fetching game:', err);
        setError('Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  // Redirect shim: if slug/subdomain exists, redirect away from /play/:id
  useEffect(() => {
    if (!game) return;

    const slugUrl = game.slug ? `https://${game.slug}.play.playcraft.games` : null;
    const target = game.subdomain_url || slugUrl;

    // If we have a target domain and we're on /play/:id, redirect once
    if (target && window.location.pathname.startsWith('/play/')) {
      window.location.replace(target);
    }
  }, [game]);

  // Fetch related games for sidebar
  useEffect(() => {
    async function fetchRelatedGames() {
      try {
        const games = await getPublishedGames(20);
        setRelatedGames(games);
      } catch (err) {
        console.error('[PlayPage] Failed to fetch related games:', err);
      }
    }
    fetchRelatedGames();
  }, []);

  // Get the game URL - use Edge Function to serve without X-Frame-Options
  const getGameUrl = useCallback(() => {
    if (!game) return null;

    // Use the Edge Function to serve the game
    // This proxies Supabase Storage but without X-Frame-Options header
    const edgeFunctionUrl = `/api/game/${game.id}/index.html`;

    console.log('[PlayPage] Using Edge Function URL:', edgeFunctionUrl);
    return edgeFunctionUrl;
  }, [game]);

  const handleShare = async () => {
    // Share the current URL (/play/:id)
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: game?.name || 'PlayCraft Game',
          text: game?.description || 'Check out this game made with PlayCraft!',
          url,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    const iframe = document.getElementById('game-iframe') as HTMLIFrameElement;
    if (iframe) {
      if (!document.fullscreenElement) {
        iframe.requestFullscreen().catch((err) => {
          console.warn('Fullscreen request failed:', err);
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // State for game URL (must be before early returns)
  const [gameUrl, setGameUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = getGameUrl();
    setGameUrl(url);
  }, [getGameUrl]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="mt-4 text-content-muted">Loading game...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-elevated">
            <Gamepad2 className="h-10 w-10 text-content-muted" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-content">Game Not Found</h1>
          <p className="mb-8 text-content-muted">
            {error || 'This game may have been removed or unpublished.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-secondary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to PlayCraft
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border-muted bg-surface-elevated/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo size={32} showText textClassName="text-content" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
            >
              <Share2 className="h-4 w-4" />
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
            >
              <Maximize2 className="h-4 w-4" />
              Fullscreen
            </button>
          </div>
        </div>
      </header>

      {/* Game Container */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Two-column layout: Game + Sidebar */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: Game + Info */}
          <div className="min-w-0 flex-1">
            {/* Game Info */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-content">{game.name}</h1>
              {game.description && (
                <p className="mt-1 text-content-muted">{game.description}</p>
              )}
              <div className="mt-2 flex items-center gap-4 text-sm text-content-subtle">
                <span>by {game.author_name}</span>
                <span className="flex items-center gap-1">
                  <PlayIcon className="h-3 w-3" />
                  {game.play_count.toLocaleString()} plays
                </span>
              </div>
            </div>

            {/* Game iframe */}
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border-muted bg-surface-elevated shadow-lg">
              {gameUrl ? (
                <>
                  <iframe
                    id="game-iframe"
                    src={gameUrl}
                    className="h-full w-full"
                    title={game.name}
                    allow="fullscreen; autoplay; encrypted-media"
                    onError={() => console.log('[PlayPage] iframe error')}
                  />
                  {/* Fallback overlay - shows if iframe fails to load */}
                  <div
                    id="iframe-fallback"
                    className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-surface-elevated/95 opacity-0 transition-opacity"
                    style={{ opacity: 0 }}
                  >
                    <Gamepad2 className="mb-4 h-16 w-16 text-content-muted" />
                    <p className="mb-4 text-content-muted">Game preview unavailable</p>
                    <a
                      href={gameUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-secondary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
                    >
                      <PlayIcon className="h-4 w-4" />
                      Open Game in New Tab
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-content-muted">Loading game...</p>
                </div>
              )}
            </div>

            {/* Direct play link */}
            {gameUrl && (
              <div className="mt-4 text-center">
                <a
                  href={gameUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  <PlayIcon className="h-4 w-4" />
                  Open game in new tab
                </a>
              </div>
            )}
          </div>

          {/* Right: Sidebar - Desktop only */}
          <GameDiscoverySidebar
            games={relatedGames}
            currentGameId={gameId}
            className="hidden w-[320px] shrink-0 lg:block"
          />
        </div>

        {/* Mobile: More Games Section */}
        <div className="mt-8 lg:hidden">
          <GameDiscoverySidebar
            games={relatedGames}
            currentGameId={gameId}
            title="More Games"
          />
        </div>

        {/* CTA Section */}
        <div className="mt-12 rounded-2xl border border-border-muted bg-surface-elevated p-8 text-center">
          <div className="mx-auto mb-4">
            <LogoIcon size={64} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-content">Build Your Own Game</h2>
          <p className="mb-6 text-content-muted">
            Create amazing games with AI assistance. No coding experience required.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-secondary px-8 py-3 font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow-md"
          >
            <Gamepad2 className="h-5 w-5" />
            Start Building Free
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border-muted py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-content-subtle">
          Made with{' '}
          <a href="/" className="text-accent hover:underline">
            PlayCraft
          </a>{' '}
          - AI-Powered Game Builder
        </div>
      </footer>
    </div>
  );
}
