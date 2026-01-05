/**
 * Credits Panel Component
 * Credits indicator with "Add credits" button
 */

import { Zap, X } from 'lucide-react';

interface CreditsPanelProps {
  creditsRemaining: number;
  onAddCredits: () => void;
  onDismiss: () => void;
  isDismissed?: boolean;
}

export function CreditsPanel({
  creditsRemaining,
  onAddCredits,
  onDismiss,
  isDismissed = false,
}: CreditsPanelProps) {
  if (isDismissed) return null;

  return (
    <div className="flex items-center justify-between border-t border-border-muted bg-surface-elevated/80 px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <Zap className="h-4 w-4 text-yellow-500" />
        <span className="text-content-muted">
          <span className="font-medium text-content-muted">{creditsRemaining}</span>{' '}
          credits remaining
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onAddCredits}
          className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-content transition-colors hover:bg-accent-light"
        >
          Add credits
        </button>
        <button
          onClick={onDismiss}
          className="rounded p-1 text-content-subtle transition-colors hover:bg-surface-overlay hover:text-content-muted"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
