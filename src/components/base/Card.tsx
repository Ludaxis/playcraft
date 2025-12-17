'use client';

import React from 'react';

/**
 * Card Component
 *
 * A simple, consistent container component.
 * Single style - white background with subtle border.
 * Replaces the old Panel component with multiple variants.
 *
 * @example
 * <Card>Content here</Card>
 * <Card padding="lg" onPress={() => {}}>Clickable card</Card>
 */

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  padding?: CardPadding;
  className?: string;
  children: React.ReactNode;
  onPress?: () => void;
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  padding = 'md',
  className = '',
  children,
  onPress,
}: CardProps) {
  const baseStyles = `
    bg-bg-card
    border border-border
    rounded-xl
    ${paddingStyles[padding]}
  `;

  if (onPress) {
    return (
      <button
        onClick={onPress}
        className={`
          ${baseStyles}
          w-full text-left
          cursor-pointer
          hover:border-border-strong
          hover:shadow-sm
          active:bg-bg-muted
          transition-all
          ${className}
        `}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={`${baseStyles} ${className}`}>
      {children}
    </div>
  );
}

export type { CardProps, CardPadding };
