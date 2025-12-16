'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeStyles: Record<string, string> = {
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
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-surface-light rounded-full ${sizeStyles[size]} overflow-hidden`}>
        <div
          className="h-full bg-secondary rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-secondary mt-1">
          <span>{current}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
