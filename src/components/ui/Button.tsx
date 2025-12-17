'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-text-inverse hover:bg-primary-light active:bg-primary-dark',
  secondary: 'bg-surface-lighter text-text-primary hover:bg-surface-light active:bg-surface border border-surface',
  accent: 'bg-secondary text-text-inverse hover:bg-secondary-light active:bg-primary-light',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-lighter active:bg-surface-light',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-button',
  md: 'px-4 py-2 text-button',
  lg: 'px-6 py-3 text-button-lg',
};

export function Button({
  variant = 'primary',
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
        rounded-lg transition-colors
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
