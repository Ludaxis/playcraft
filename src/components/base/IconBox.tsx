'use client';

import React from 'react';

/**
 * IconBox Component
 *
 * A consistent container for icons. Extracts the common pattern
 * used 50+ times throughout the codebase.
 *
 * @example
 * <IconBox><CoinIcon /></IconBox>
 * <IconBox size="lg" shape="circle"><StarIcon /></IconBox>
 */

type IconBoxSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type IconBoxShape = 'square' | 'rounded' | 'circle';

interface IconBoxProps {
  size?: IconBoxSize;
  shape?: IconBoxShape;
  variant?: 'default' | 'muted' | 'inverse';
  children: React.ReactNode;
  className?: string;
}

const sizeStyles: Record<IconBoxSize, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const shapeStyles: Record<IconBoxShape, string> = {
  square: 'rounded-md',
  rounded: 'rounded-lg',
  circle: 'rounded-full',
};

const variantStyles: Record<string, string> = {
  default: 'bg-bg-muted text-text-secondary',
  muted: 'bg-border text-text-muted',
  inverse: 'bg-bg-inverse text-text-inverse',
};

export function IconBox({
  size = 'md',
  shape = 'rounded',
  variant = 'default',
  children,
  className = '',
}: IconBoxProps) {
  return (
    <div
      className={`
        ${sizeStyles[size]}
        ${shapeStyles[shape]}
        ${variantStyles[variant]}
        flex items-center justify-center
        flex-shrink-0
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export type { IconBoxProps, IconBoxSize, IconBoxShape };
