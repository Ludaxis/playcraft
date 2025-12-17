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
  primary: 'bg-bg-inverse text-text-inverse hover:opacity-90 active:opacity-80',
  secondary: 'bg-bg-card text-text-primary hover:bg-bg-muted active:bg-border border border-border',
  accent: 'bg-bg-inverse text-text-inverse hover:opacity-90 active:opacity-80',
  ghost: 'bg-transparent text-text-primary hover:bg-bg-muted active:bg-bg-card',
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
