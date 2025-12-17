'use client';

import React from 'react';
import { useNavigation } from '@/store';
import { IconButton } from '@/components/ui';

interface PageLayoutProps {
  title?: string;
  showBack?: boolean;
  showHeader?: boolean;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({
  title,
  showBack = true,
  showHeader = true,
  headerActions,
  children,
  className = '',
}: PageLayoutProps) {
  const { goBack, canGoBack } = useNavigation();

  return (
    <div className="flex flex-col h-full bg-surface-lightest">
      {/* Page Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-surface-light">
          <div className="flex items-center gap-3">
            {showBack && canGoBack && (
              <IconButton label="Back" onClick={goBack} variant="ghost">
                <BackIcon />
              </IconButton>
            )}
            {title && (
              <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}

      {/* Page Content */}
      <div className={`flex-1 overflow-y-auto ${className}`}>{children}</div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18L9 12L15 6" />
    </svg>
  );
}
