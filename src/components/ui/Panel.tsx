'use client';

import React from 'react';

type PanelVariant = 'default' | 'elevated' | 'outlined';

interface PanelProps {
  variant?: PanelVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<PanelVariant, string> = {
  default: 'bg-surface-lighter',
  elevated: 'bg-white shadow-md',
  outlined: 'bg-white border-2 border-surface',
};

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export function Panel({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  onClick,
}: PanelProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        rounded-lg
        ${onClick ? 'cursor-pointer hover:bg-surface-light transition-colors w-full text-left' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}
