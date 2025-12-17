'use client';

import React from 'react';
import { NotificationDot } from './Badge';

type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonVariant = 'default' | 'primary' | 'ghost';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  label: string;
  notification?: number;
  children: React.ReactNode;
}

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8 text-body-sm',
  md: 'w-10 h-10 text-body',
  lg: 'w-12 h-12 text-h3',
};

const variantStyles: Record<IconButtonVariant, string> = {
  default: 'bg-surface-lighter text-text-primary hover:bg-surface-light',
  primary: 'bg-primary text-text-inverse hover:bg-primary-light',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-lighter',
};

export function IconButton({
  size = 'md',
  variant = 'default',
  label,
  notification,
  children,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`
        relative inline-flex items-center justify-center
        rounded-lg transition-colors
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
      <NotificationDot count={notification} show={!!notification && notification > 0} />
    </button>
  );
}
