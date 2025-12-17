'use client';

import React from 'react';

/**
 * Badge Component
 *
 * Simplified to 2 variants:
 * - default: Neutral info badge
 * - notification: Alert/count badge (red)
 *
 * @example
 * <Badge>New</Badge>
 * <Badge variant="notification">3</Badge>
 */

type BadgeVariant = 'default' | 'notification';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-bg-muted text-text-secondary',
  notification: 'bg-status-error text-text-inverse',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        ${variantStyles[variant]}
        inline-flex items-center justify-center
        px-2 py-0.5
        text-value-sm
        rounded-full
        ${className}
      `}
    >
      {children}
    </span>
  );
}

/**
 * NotificationDot Component
 *
 * A small notification indicator, typically positioned absolute.
 * Use for showing unread counts or alerts on icons.
 *
 * @example
 * <div className="relative">
 *   <Icon />
 *   <NotificationDot count={5} />
 * </div>
 */

interface NotificationDotProps {
  count?: number;
  show?: boolean;
  className?: string;
}

export function NotificationDot({
  count,
  show = true,
  className = '',
}: NotificationDotProps) {
  if (!show && !count) return null;

  const displayCount = count && count > 99 ? '99+' : count;

  return (
    <span
      className={`
        absolute -top-1 -right-1
        min-w-[18px] h-[18px]
        bg-status-error text-text-inverse
        text-mini font-bold
        rounded-full
        flex items-center justify-center
        ${count ? 'px-1' : 'w-2 h-2 min-w-0'}
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
}

export type { BadgeProps, BadgeVariant, NotificationDotProps };
