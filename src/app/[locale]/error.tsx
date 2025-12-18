'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/base';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations('common');

  useEffect(() => {
    // Log error to console (replace with error reporting service in production)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-bg-page">
      <div className="bg-bg-card rounded-xl border-2 border-border p-6 max-w-sm w-full text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-bg-muted rounded-full mx-auto mb-4 flex items-center justify-center border border-border">
          <svg
            className="w-8 h-8 text-text-secondary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2 className="text-h3 text-text-primary mb-2">{t('error')}</h2>
        <p className="text-caption text-text-secondary mb-6">
          An unexpected error occurred. Please try again.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="text-mini text-text-muted mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <Button variant="primary" fullWidth onClick={reset}>
          {t('retry')}
        </Button>
      </div>
    </div>
  );
}
