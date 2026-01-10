/**
 * Game Player Modal
 * Responsive game player that works across mobile, tablet, and desktop
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Maximize2, Minimize2, Share2, Play, Loader2, ExternalLink } from 'lucide-react';
import { incrementPlayCount } from '../../lib/publishService';
import type { PublishedGame } from '../../types';

interface GamePlayerModalProps {
  game: PublishedGame | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GamePlayerModal({ game, isOpen, onClose }: GamePlayerModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get game URL - prefer subdomain, fallback to Edge Function
  const getGameUrl = useCallback(() => {
    if (!game) return null;

    // Use subdomain URL if available (e.g., https://game-slug.play.playcraft.games)
    if (game.subdomain_url) {
      return game.subdomain_url;
    }

    // Fallback to Edge Function proxy
    return `/api/game/${game.id}/index.html`;
  }, [game]);

  // Track play count when game loads
  useEffect(() => {
    if (isOpen && game) {
      setIsLoading(true);
      incrementPlayCount(game.id);
    }
  }, [isOpen, game]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    const container = document.getElementById('game-player-container');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.warn);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
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

  // Handle share
  const handleShare = async () => {
    if (!game) return;
    const url = `${window.location.origin}/play/${game.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: game.name,
          text: game.description || 'Check out this game!',
          url,
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !game) return null;

  const gameUrl = getGameUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Game Container - Responsive frame */}
      <div
        id="game-player-container"
        className="relative flex h-full w-full flex-col bg-surface md:h-auto md:max-h-[90vh] md:w-auto md:max-w-[90vw] md:rounded-2xl md:border md:border-border-muted md:shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border-muted bg-surface-elevated px-4 py-3 md:rounded-t-2xl">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-content">{game.name}</h2>
            <div className="flex items-center gap-2 text-sm text-content-muted">
              <span>{game.author_name || 'PlayCraft Creator'}</span>
              {game.play_count > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    {game.play_count.toLocaleString()} plays
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>

            {/* Open in new tab */}
            <a
              href={gameUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Game Frame - Responsive */}
        <div className="relative flex-1 bg-black md:aspect-video md:flex-none">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="mt-3 text-content-muted">Loading game...</p>
            </div>
          )}

          {/* Game iframe */}
          {gameUrl && (
            <iframe
              src={gameUrl}
              className="h-full w-full"
              title={game.name}
              allow="fullscreen; autoplay; encrypted-media; gamepad"
              onLoad={handleIframeLoad}
              style={{
                // Responsive sizing
                minHeight: '300px',
                maxHeight: isFullscreen ? '100vh' : 'calc(90vh - 120px)',
              }}
            />
          )}
        </div>

        {/* Mobile-friendly bottom bar (only on small screens) */}
        <div className="flex shrink-0 items-center justify-center gap-4 border-t border-border-muted bg-surface-elevated p-3 md:hidden">
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-surface-overlay py-2.5 text-sm font-medium text-content transition-colors hover:bg-surface"
          >
            <Share2 className="h-4 w-4" />
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-light"
          >
            <Maximize2 className="h-4 w-4" />
            Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}
