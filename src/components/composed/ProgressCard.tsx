'use client';

import React from 'react';
import { Card, ProgressBar } from '@/components/base';

/**
 * ProgressCard Component
 *
 * A card that displays progress information.
 * Commonly used in LiveOps event pages.
 *
 * @example
 * <ProgressCard
 *   title="Your Progress"
 *   description="Complete 15 levels as fast as you can!"
 *   current={7}
 *   max={15}
 * />
 */

interface ProgressCardProps {
  title?: string;
  description?: string;
  current: number;
  max: number;
  showValue?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressCard({
  title,
  description,
  current,
  max,
  showValue = true,
  className = '',
  children,
}: ProgressCardProps) {
  return (
    <Card className={className}>
      {description && (
        <p className="text-sm text-text-secondary text-center mb-3">
          {description}
        </p>
      )}

      {(title || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {title && (
            <span className="text-sm text-text-secondary">{title}</span>
          )}
          {showValue && (
            <span className="font-bold text-text-primary">
              {current}/{max}
            </span>
          )}
        </div>
      )}

      <ProgressBar current={current} max={max} />

      {children}
    </Card>
  );
}

export type { ProgressCardProps };
