/**
 * JobProgress Component
 *
 * Displays real-time progress for async AI generation jobs.
 * Shows status, progress bar, and allows cancellation.
 */

import { X, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { GenerationJob } from '../../lib/generationQueueService';

interface JobProgressProps {
  /** Current job being tracked */
  job: GenerationJob | null;
  /** Whether the job can be cancelled */
  canCancel?: boolean;
  /** Callback when user wants to cancel */
  onCancel?: () => void;
  /** Callback when user dismisses the progress indicator */
  onDismiss?: () => void;
}

export function JobProgress({ job, canCancel = true, onCancel, onDismiss }: JobProgressProps) {
  if (!job) return null;

  const isTerminal = ['completed', 'failed', 'cancelled'].includes(job.status);

  const getStatusIcon = () => {
    switch (job.status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-accent animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-content-subtle" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'queued':
        return 'Waiting in queue...';
      case 'processing':
        return job.status_message || 'Generating...';
      case 'completed':
        return 'Generation complete!';
      case 'failed':
        return job.error_message || 'Generation failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return job.status;
    }
  };

  return (
    <div className="mx-4 mb-2 rounded-lg border border-border-muted bg-surface-elevated p-3">
      <div className="flex items-center justify-between gap-3">
        {/* Status icon and text */}
        <div className="flex items-center gap-2 min-w-0">
          {getStatusIcon()}
          <span className="text-sm text-content-muted truncate">
            {getStatusText()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Cancel button - only show for queued jobs */}
          {canCancel && job.status === 'queued' && onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-content-subtle hover:text-content-muted transition-colors"
            >
              Cancel
            </button>
          )}

          {/* Dismiss button - only show for terminal states */}
          {isTerminal && onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-content-subtle hover:text-content-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar - only show when processing */}
      {job.status === 'processing' && (
        <div className="mt-2">
          <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-300 ease-out"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-content-subtle">
            {job.progress}%
          </div>
        </div>
      )}

      {/* Retry info - show for failed jobs that will retry */}
      {job.status === 'failed' && job.attempts < job.max_attempts && (
        <div className="mt-2 text-xs text-yellow-400">
          Retrying... (attempt {job.attempts}/{job.max_attempts})
        </div>
      )}
    </div>
  );
}

export default JobProgress;
