'use client';

import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'accent' | 'notification';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-200 text-slate-700',
  primary: 'bg-slate-800 text-white',
  accent: 'bg-slate-600 text-white',
  notification: 'bg-red-500 text-white',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-2 py-0.5 text-xs font-medium rounded-full
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
    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
      {count && count > 0 ? (count > 99 ? '99+' : count) : ''}
    </span>
  );
}
