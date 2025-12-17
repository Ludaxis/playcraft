'use client';

import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'accent' | 'notification';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-bg-muted text-text-secondary border border-border',
  primary: 'bg-bg-inverse text-text-inverse',
  accent: 'bg-bg-inverse text-text-inverse',
  notification: 'bg-bg-inverse text-text-inverse',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-2 py-0.5 text-caption rounded-full
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

interface NotificationDotProps {
  count?: number;
  show?: boolean;
}

export function NotificationDot({ count, show = true }: NotificationDotProps) {
  if (!show) return null;

  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-mini text-text-inverse bg-bg-inverse rounded-full">
      {count && count > 0 ? (count > 99 ? '99+' : count) : ''}
    </span>
  );
}
