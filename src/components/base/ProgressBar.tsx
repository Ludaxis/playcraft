'use client';

import React from 'react';

/**
 * ProgressBar Component
 *
 * A simple, consistent progress bar.
 *
 * @example
 * <ProgressBar current={50} max={100} />
 * <ProgressBar current={3} max={10} showLabel size="lg" />
 */

type ProgressBarSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  current: number;
  max: number;
  size?: ProgressBarSize;
  showLabel?: boolean;
  className?: string;
}

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  current,
  max,
  size = 'md',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-text-muted">Progress</span>
          <span className="text-xs font-bold text-text-secondary">
            {current}/{max}
          </span>
        </div>
      )}
      <div
        className={`
          w-full
          bg-bg-muted
          rounded-full
          overflow-hidden
          ${sizeStyles[size]}
        `}
      >
        <div
          className="h-full bg-bg-inverse rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export type { ProgressBarProps, ProgressBarSize };
