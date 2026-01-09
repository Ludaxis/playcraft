import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GameCard } from './GameCard';
import type { PublishedGame } from '../../types';

interface CategorySectionProps {
  title: string;
  games: PublishedGame[];
  isLoading?: boolean;
  onSeeAll?: () => void;
  cardSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

function LoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex shrink-0 flex-col items-center gap-2">
          <div className="h-[72px] w-[72px] animate-pulse rounded-[16px] bg-surface-elevated" />
          <div className="h-3 w-16 animate-pulse rounded bg-surface-elevated" />
        </div>
      ))}
    </>
  );
}

export function CategorySection({
  title,
  games,
  isLoading,
  onSeeAll,
  cardSize = 'md',
  className,
}: CategorySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const hasGames = games.length > 0 || isLoading;

  if (!hasGames) return null;

  return (
    <section className={cn('py-6', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between px-4 md:px-8">
        <h2 className="text-xl font-bold text-content">{title}</h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-sm text-accent transition-colors hover:text-accent-light"
          >
            See All &rarr;
          </button>
        )}
      </div>

      {/* Scrollable row */}
      <div className="group/scroll relative">
        {/* Left fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-surface to-transparent" />

        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-surface-elevated/90 p-2 text-content-muted opacity-0 shadow-lg backdrop-blur-sm transition-all hover:bg-surface-overlay hover:text-content group-hover/scroll:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Game cards */}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth px-4 pb-4 md:px-8"
        >
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            games.map((game) => (
              <GameCard key={game.id} game={game} size={cardSize} />
            ))
          )}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-surface-elevated/90 p-2 text-content-muted opacity-0 shadow-lg backdrop-blur-sm transition-all hover:bg-surface-overlay hover:text-content group-hover/scroll:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Right fade */}
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-surface to-transparent" />
      </div>
    </section>
  );
}
