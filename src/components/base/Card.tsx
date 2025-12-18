'use client';

import React from 'react';

/**
 * Card Component
 *
 * A simple, consistent container component.
 * Single style - white background with subtle border.
 * Replaces the old Panel component with multiple variants.
 *
 * Note: The `variant` prop is accepted for backward compatibility
 * with Panel but all variants render identically in wireframe mode.
 *
 * @example
 * <Card>Content here</Card>
 * <Card padding="lg" onPress={() => {}}>Clickable card</Card>
 */

type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  padding?: CardPadding;
  variant?: CardVariant; // Accepted for backward compatibility (renders same)
  className?: string;
  children: React.ReactNode;
  onPress?: () => void;
  onClick?: () => void; // Alias for onPress (backward compat with Panel)
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  padding = 'md',
  variant, // Accepted for backward compatibility (all variants render same)
  className = '',
  children,
  onPress,
  onClick,
}: CardProps) {
  // Suppress unused variable warning - variant kept for API compatibility
  void variant;
  // Support both onPress and onClick for backward compatibility
  const handleClick = onPress || onClick;
  const baseStyles = `
    bg-bg-card
    border border-border
    rounded-xl
    ${paddingStyles[padding]}
  `;

  if (handleClick) {
    return (
      <button
        onClick={handleClick}
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

export type { CardProps, CardPadding, CardVariant };
