'use client';

import React from 'react';
import { cn } from '@/utils';

/**
 * Button Component
 *
 * Variants:
 * - solid/primary: Primary action (filled background)
 * - outline/secondary: Secondary action (bordered)
 * - ghost: Minimal action (transparent)
 *
 * @example
 * <Button variant="solid" onClick={handleClick}>Submit</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 * <Button variant="ghost">Cancel</Button>
 */

type ButtonVariant = 'solid' | 'outline' | 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  solid: 'bg-bg-inverse text-text-inverse hover:opacity-90 active:opacity-80',
  primary: 'bg-bg-inverse text-text-inverse hover:opacity-90 active:opacity-80', // Alias for solid
  outline: 'bg-transparent border-2 border-border text-text-primary hover:bg-bg-muted active:bg-border',
  secondary: 'bg-transparent border-2 border-border text-text-primary hover:bg-bg-muted active:bg-border', // Alias for outline
  ghost: 'bg-transparent text-text-primary hover:bg-bg-muted active:bg-border',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-caption',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-value',
};

export function Button({
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        'rounded-lg font-bold transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export type { ButtonProps, ButtonVariant, ButtonSize };
