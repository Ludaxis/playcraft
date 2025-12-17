'use client';

import React from 'react';

/**
 * Button Component
 *
 * A simplified button with 2 variants:
 * - solid: Primary action (filled background)
 * - outline: Secondary action (bordered)
 *
 * @example
 * <Button variant="solid" onClick={handleClick}>Submit</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 */

type ButtonVariant = 'solid' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  solid: 'bg-bg-inverse text-text-inverse hover:opacity-90 active:opacity-80',
  outline: 'bg-transparent border-2 border-border text-text-primary hover:bg-bg-muted active:bg-border',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-bold transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export type { ButtonProps, ButtonVariant, ButtonSize };
