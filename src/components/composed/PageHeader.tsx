'use client';

import React from 'react';
import Image from 'next/image';

/**
 * PageHeader Component
 *
 * Standardized page header used across all pages.
 * Provides consistent styling for title, back button, and close button.
 *
 * @example
 * <PageHeader title="Settings" onClose={() => navigate('main-menu')} />
 * <PageHeader title="Shop" leftElement={<CoinsDisplay />} onClose={handleClose} />
 */

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  onBack,
  onClose,
  leftElement,
  rightElement,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`
        flex items-center justify-between
        px-3 py-3
        bg-bg-inverse
        ${className}
      `}
    >
      {/* Left section */}
      <div className="flex items-center gap-2 min-w-[60px]">
        {onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-bg-muted/20 flex items-center justify-center hover:bg-bg-muted/30"
          >
            <Image
              src="/icons/Arrow-Left.svg"
              alt="Back"
              width={16}
              height={16}
              className="invert opacity-80"
            />
          </button>
        )}
        {leftElement}
      </div>

      {/* Title */}
      <h1 className="text-text-inverse text-lg font-bold text-center flex-1">
        {title}
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-2 min-w-[60px] justify-end">
        {rightElement}
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-status-error flex items-center justify-center border-2 border-error-light hover:opacity-90"
          >
            <span className="text-text-inverse text-value">X</span>
          </button>
        )}
      </div>
    </div>
  );
}

export type { PageHeaderProps };
