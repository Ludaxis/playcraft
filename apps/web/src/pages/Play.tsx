/**
 * Play Page - Public game player
 * Allows anyone to play published games without authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { Play as PlayIcon, Maximize2, Share2, ArrowLeft, Loader2, Gamepad2 } from 'lucide-react';
import { getPublishedGame, incrementPlayCount } from '../lib/publishService';
import { getSupabase } from '../lib/supabase';
import { LogoIcon, Logo } from '../components/Logo';
import type { PublishedGame } from '../types';

interface PlayPageProps {
  gameId: string;
}

export function PlayPage({ gameId }: PlayPageProps) {
  const [game, setGame] = useState<PublishedGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) {
        setError('No game ID provided');
        setLoading(false);
        return;
      }

      try {
        const gameData = await getPublishedGame(gameId);

        if (!gameData) {
          setError('Game not found or not published');
          setLoading(false);
          return;
        }

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

  // Get the storage URL for the game's index.html
  const getGameUrl = useCallback(async () => {
    if (!game) return null;

    const supabase = getSupabase();
    const basePath = `${game.user_id}/${game.id}`;

    // First check if legacy index.html exists (most common case)
    const legacyPath = `${basePath}/index.html`;
    try {
      const { data: legacyCheck } = await supabase.storage
        .from('published-games')
        .list(basePath, { limit: 10 });

      const hasDirectIndex = legacyCheck?.some(f => f.name === 'index.html');
      if (hasDirectIndex) {
        const url = supabase.storage.from('published-games').getPublicUrl(legacyPath).data.publicUrl;
        console.log('[PlayPage] Using legacy URL (direct index.html):', url);
        return url;
      }
    } catch (err) {
      console.log('[PlayPage] Error checking legacy path:', err);
    }

    // Try latest.json for versioned publish
    try {
      const latest = await supabase.storage.from('published-games').download(`${basePath}/latest.json`);
      if (latest.data) {
        const text = await latest.data.text();
        const parsed = JSON.parse(text);
        if (parsed?.path) {
          const url = supabase.storage.from('published-games').getPublicUrl(parsed.path).data.publicUrl;
          console.log('[PlayPage] Using versioned URL:', url);
          return url;
        }
      }
    } catch (err) {
      console.log('[PlayPage] latest.json not found', err);
    }

    // Final fallback - just try the legacy path anyway
    const url = supabase.storage.from('published-games').getPublicUrl(legacyPath).data.publicUrl;
    console.log('[PlayPage] Using fallback legacy URL:', url);
    return url;
  }, [game]);

  const handleShare = async () => {
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
    const loadUrl = async () => {
      const url = await getGameUrl();
      setGameUrl(url);
    };
    loadUrl();
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
        <div className="aspect-video overflow-hidden rounded-2xl border border-border-muted bg-surface-elevated shadow-lg">
          {gameUrl ? (
            <iframe
              id="game-iframe"
              src={gameUrl}
              className="h-full w-full"
              title={game.name}
              allow="fullscreen; autoplay; encrypted-media"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-content-muted">Failed to load game</p>
            </div>
          )}
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
