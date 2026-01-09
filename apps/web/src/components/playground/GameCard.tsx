import { Link } from 'react-router-dom';
import { Play, Gamepad2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import type { PublishedGame } from '../../types';

interface GameCardProps {
  game: PublishedGame;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: {
    icon: 'h-16 w-16 rounded-[12px]',
    text: 'text-xs max-w-16',
    badge: 'text-[10px] px-1 py-0.5',
    badgeIcon: 'h-2 w-2',
    fallbackIcon: 'h-6 w-6',
  },
  md: {
    icon: 'h-[72px] w-[72px] rounded-[16px]',
    text: 'text-xs max-w-[80px]',
    badge: 'text-2xs px-1.5 py-0.5',
    badgeIcon: 'h-2.5 w-2.5',
    fallbackIcon: 'h-7 w-7',
  },
  lg: {
    icon: 'h-24 w-24 rounded-[20px]',
    text: 'text-sm max-w-24',
    badge: 'text-xs px-2 py-1',
    badgeIcon: 'h-3 w-3',
    fallbackIcon: 'h-10 w-10',
  },
};

function formatPlayCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function GameCard({ game, size = 'md', className }: GameCardProps) {
  const config = sizeConfig[size];
  // Fetch thumbnail as blob to bypass COEP restrictions
  const thumbnailUrl = useBlobUrl(game.thumbnail_url);

  return (
    <Link
      to={`/play/${game.id}`}
      className={cn(
        'group flex shrink-0 flex-col items-center gap-2',
        className
      )}
    >
      {/* iOS-style app icon */}
      <div
        className={cn(
          'relative overflow-hidden shadow-lg transition-all duration-200',
          'group-hover:scale-105 group-hover:shadow-glow-sm',
          'group-active:scale-95',
          config.icon
        )}
      >
        {/* Thumbnail */}
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={game.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : game.thumbnail_url ? (
          // Loading state - show placeholder while fetching
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/30 via-secondary/20 to-surface-elevated">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/30 via-secondary/20 to-surface-elevated">
            <Gamepad2 className={cn('text-content-muted', config.fallbackIcon)} />
          </div>
        )}

        {/* iOS shine overlay */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

        {/* Play count badge */}
        {game.play_count > 0 && (
          <div
            className={cn(
              'absolute bottom-1 right-1 flex items-center gap-0.5 rounded-full bg-surface-base/80 backdrop-blur-sm',
              config.badge
            )}
          >
            <Play className={cn('text-accent', config.badgeIcon)} />
            <span className="font-medium text-content">
              {formatPlayCount(game.play_count)}
            </span>
          </div>
        )}
      </div>

      {/* Game name */}
      <span
        className={cn(
          'truncate text-center text-content-muted transition-colors group-hover:text-content',
          config.text
        )}
      >
        {game.name}
      </span>
    </Link>
  );
}
