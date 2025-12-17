'use client';

import React from 'react';
import { Avatar } from '@/components/base';

/**
 * ListRow Component
 *
 * A generic list row component for leaderboards, team members, etc.
 *
 * @example
 * <ListRow
 *   rank={1}
 *   name="Player1"
 *   subtitle="Level 45"
 *   value="1,234"
 *   highlighted
 * />
 */

interface ListRowProps {
  rank?: number;
  name: string;
  subtitle?: string;
  value?: string | number;
  avatar?: string;
  online?: boolean;
  highlighted?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

export function ListRow({
  rank,
  name,
  subtitle,
  value,
  avatar,
  online,
  highlighted = false,
  onPress,
  rightElement,
  className = '',
}: ListRowProps) {
  const Component = onPress ? 'button' : 'div';

  return (
    <Component
      onClick={onPress}
      className={`
        flex items-center gap-3
        px-3 py-2
        rounded-lg
        border
        ${highlighted
          ? 'bg-brand-muted border-border-strong'
          : 'bg-bg-card border-border'
        }
        ${onPress ? 'cursor-pointer hover:border-border-strong active:bg-bg-muted' : ''}
        ${className}
      `}
    >
      {/* Rank */}
      {rank !== undefined && (
        <div
          className={`
            w-7 h-7
            rounded-full
            flex items-center justify-center
            font-bold text-mini
            ${rank <= 3
              ? 'bg-bg-inverse text-text-inverse'
              : 'bg-bg-muted text-text-secondary'
            }
          `}
        >
          {rank}
        </div>
      )}

      {/* Avatar */}
      <Avatar name={name} src={avatar} size="sm" online={online} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-caption font-medium text-text-primary truncate">{name}</p>
        {subtitle && (
          <p className="text-mini text-text-muted truncate">{subtitle}</p>
        )}
      </div>

      {/* Value or Right Element */}
      {rightElement}
      {value !== undefined && !rightElement && (
        <span className="text-caption font-bold text-text-primary">{value}</span>
      )}
    </Component>
  );
}

export type { ListRowProps };
