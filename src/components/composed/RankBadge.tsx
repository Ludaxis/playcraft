'use client';

import React from 'react';

/**
 * RankBadge Component
 *
 * Displays a position/rank badge with special styling for top 3.
 * Extracted from leaderboards for reusability.
 *
 * @example
 * <RankBadge position={1} /> // Gold
 * <RankBadge position={2} /> // Silver
 * <RankBadge position={3} /> // Bronze
 * <RankBadge position={42} /> // Neutral
 */

type RankBadgeSize = 'sm' | 'md' | 'lg';

interface RankBadgeProps {
  position: number;
  size?: RankBadgeSize;
  className?: string;
}

const sizeStyles: Record<RankBadgeSize, { container: string; text: string }> = {
  sm: { container: 'w-6 h-6', text: 'text-mini' },
  md: { container: 'w-8 h-8', text: 'text-caption' },
  lg: { container: 'w-10 h-10', text: 'text-base' },
};

function getRankStyle(position: number): string {
  switch (position) {
    case 1:
      return 'bg-brand-primary text-text-inverse border-brand-muted';
    case 2:
      return 'bg-border text-text-primary border-border-strong';
    case 3:
      return 'bg-brand-muted/30 text-text-secondary border-brand-muted';
    default:
      return 'bg-bg-muted text-text-secondary border-border';
  }
}

export function RankBadge({
  position,
  size = 'md',
  className = '',
}: RankBadgeProps) {
  const styles = sizeStyles[size];
  const rankStyle = getRankStyle(position);

  return (
    <div
      className={`
        ${styles.container}
        ${rankStyle}
        rounded-full
        border
        flex items-center justify-center
        font-bold
        ${styles.text}
        ${className}
      `}
    >
      {position}
    </div>
  );
}

export type { RankBadgeProps, RankBadgeSize };
