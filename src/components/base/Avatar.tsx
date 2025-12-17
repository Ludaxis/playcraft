'use client';

import React from 'react';
import Image from 'next/image';

/**
 * Avatar Component
 *
 * Displays a user avatar with fallback to initials.
 * Consistent sizing across the app.
 *
 * @example
 * <Avatar name="John Doe" />
 * <Avatar name="Jane" src="/avatars/jane.png" size="lg" />
 */

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; indicator: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-mini', indicator: 'w-2 h-2' },
  md: { container: 'w-10 h-10', text: 'text-caption', indicator: 'w-2.5 h-2.5' },
  lg: { container: 'w-12 h-12', text: 'text-base', indicator: 'w-3 h-3' },
  xl: { container: 'w-16 h-16', text: 'text-value', indicator: 'w-3.5 h-3.5' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  name,
  src,
  size = 'md',
  online,
  className = '',
}: AvatarProps) {
  const styles = sizeStyles[size];

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${styles.container}
          rounded-lg
          bg-bg-muted
          border border-border
          flex items-center justify-center
          overflow-hidden
        `}
      >
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <span className={`${styles.text} font-bold text-text-secondary`}>
            {getInitials(name)}
          </span>
        )}
      </div>

      {online !== undefined && (
        <span
          className={`
            absolute -bottom-0.5 -right-0.5
            ${styles.indicator}
            rounded-full
            border-2 border-bg-card
            ${online ? 'bg-brand-primary' : 'bg-text-muted'}
          `}
        />
      )}
    </div>
  );
}

export type { AvatarProps, AvatarSize };
