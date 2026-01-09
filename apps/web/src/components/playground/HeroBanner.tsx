import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Gamepad2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { Button } from '../ui/button';
import type { PublishedGame } from '../../types';

interface HeroBannerProps {
  games: PublishedGame[];
  autoRotateMs?: number;
  isLoading?: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="relative mx-4 overflow-hidden rounded-2xl border border-border-muted bg-surface-elevated md:mx-8">
      <div className="aspect-[16/9] animate-pulse bg-surface-overlay md:aspect-[21/9]" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="h-4 w-24 animate-pulse rounded bg-surface-overlay" />
        <div className="mt-3 h-10 w-64 animate-pulse rounded bg-surface-overlay" />
        <div className="mt-3 h-4 w-96 animate-pulse rounded bg-surface-overlay" />
        <div className="mt-4 h-10 w-32 animate-pulse rounded-xl bg-surface-overlay" />
      </div>
    </div>
  );
}

export function HeroBanner({
  games,
  autoRotateMs = 5000,
  isLoading,
}: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (games.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % games.length);
  }, [games.length]);

  // Auto-rotate
  useEffect(() => {
    if (games.length <= 1 || autoRotateMs <= 0) return;

    const interval = setInterval(nextSlide, autoRotateMs);
    return () => clearInterval(interval);
  }, [games.length, autoRotateMs, nextSlide]);

  // Get active game (may be undefined if no games)
  const activeGame = games[activeIndex];
  // Fetch thumbnail as blob to bypass COEP restrictions (hook must be called unconditionally)
  const thumbnailUrl = useBlobUrl(activeGame?.thumbnail_url);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (games.length === 0 || !activeGame) {
    return null;
  }

  return (
    <div className="relative mx-4 overflow-hidden rounded-2xl border border-border-muted bg-surface-elevated md:mx-8">
      {/* Gradient mesh background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(0, 240, 255, 0.2) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 80%, rgba(255, 0, 229, 0.15) 0%, transparent 40%),
            linear-gradient(135deg, #0d0d14 0%, #111118 100%)
          `,
        }}
      />

      {/* Game thumbnail with gradient overlay */}
      <div className="relative aspect-[16/9] md:aspect-[21/9]">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={activeGame.name}
            className="h-full w-full object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gamepad2 className="h-24 w-24 text-content-muted/30" />
          </div>
        )}

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-base/80 via-transparent to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <span className="text-gradient-gaming text-sm font-semibold uppercase tracking-wider">
          Featured
        </span>
        <h2 className="mt-2 text-2xl font-bold text-content md:text-4xl lg:text-5xl">
          {activeGame.name}
        </h2>
        {activeGame.description && (
          <p className="mt-2 line-clamp-2 max-w-xl text-sm text-content-secondary md:text-base">
            {activeGame.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-4">
          <Button asChild className="bg-gradient-to-r from-accent to-secondary hover:shadow-glow-sm">
            <Link to={`/play/${activeGame.id}`}>
              <Play className="mr-2 h-4 w-4" />
              Play Now
            </Link>
          </Button>
          {activeGame.author_name && (
            <span className="text-sm text-content-tertiary">
              by {activeGame.author_name}
            </span>
          )}
        </div>
      </div>

      {/* Navigation dots */}
      {games.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-2 md:bottom-6">
          {games.map((_, i) => (
            <button
              key={i}
              className={cn(
                'h-2 rounded-full transition-all',
                i === activeIndex
                  ? 'w-6 bg-accent shadow-glow-sm'
                  : 'w-2 bg-content-tertiary/50 hover:bg-content-secondary'
              )}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
