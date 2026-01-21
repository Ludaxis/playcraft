/**
 * FileChangesDisplay Component
 *
 * Shows real-time file changes during AI code generation.
 * Displays which files are being modified/created and their status.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  FileCode,
  FilePlus,
  FileEdit,
  Check,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type FileChangeStatus = 'pending' | 'applying' | 'applied' | 'error';
export type FileChangeType = 'create' | 'modify' | 'delete';

export interface FileChange {
  path: string;
  type: FileChangeType;
  status: FileChangeStatus;
  preview?: string; // First few lines of content or diff
  linesChanged?: number;
  error?: string;
  timestamp?: number;
}

interface FileChangesDisplayProps {
  changes: FileChange[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showPreview?: boolean;
  maxPreviewLines?: number;
  className?: string;
}

/**
 * Get icon for file change type
 */
function getFileIcon(type: FileChangeType, status: FileChangeStatus) {
  if (status === 'applying') {
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />;
  }

  if (status === 'applied') {
    return <Check className="h-3.5 w-3.5 text-success" />;
  }

  switch (type) {
    case 'create':
      return <FilePlus className="h-3.5 w-3.5 text-success" />;
    case 'modify':
      return <FileEdit className="h-3.5 w-3.5 text-info" />;
    case 'delete':
      return <FileCode className="h-3.5 w-3.5 text-error" />;
  }
}

/**
 * Get status label
 */
function getStatusLabel(status: FileChangeStatus): string {
  switch (status) {
    case 'pending':
      return 'Waiting...';
    case 'applying':
      return 'Applying...';
    case 'applied':
      return 'Done';
    case 'error':
      return 'Error';
  }
}

/**
 * Get filename from path
 */
function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

/**
 * Get directory from path
 */
function getDirectory(path: string): string {
  const parts = path.split('/');
  if (parts.length <= 1) return '';
  return parts.slice(0, -1).join('/');
}

/**
 * Single file change item
 */
function FileChangeItem({
  change,
  showPreview,
  maxPreviewLines = 5,
}: {
  change: FileChange;
  showPreview?: boolean;
  maxPreviewLines?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileName = getFileName(change.path);
  const directory = getDirectory(change.path);

  const previewLines = useMemo(() => {
    if (!change.preview) return [];
    return change.preview.split('\n').slice(0, maxPreviewLines);
  }, [change.preview, maxPreviewLines]);

  const hasPreview = showPreview && previewLines.length > 0;

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        change.status === 'applying'
          ? 'border-accent/30 bg-accent/5'
          : change.status === 'applied'
            ? 'border-success/20 bg-success/5'
            : change.status === 'error'
              ? 'border-error/20 bg-error/5'
              : 'border-border/50 bg-surface-overlay/30'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          hasPreview && 'cursor-pointer hover:bg-surface-overlay/50'
        )}
        onClick={() => hasPreview && setIsExpanded(!isExpanded)}
      >
        {/* Expand icon if has preview */}
        {hasPreview && (
          <span className="text-content-subtle">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </span>
        )}

        {/* File type/status icon */}
        {getFileIcon(change.type, change.status)}

        {/* File path */}
        <div className="flex-1 min-w-0 flex items-center gap-1">
          <span className="text-xs font-medium text-content truncate">
            {fileName}
          </span>
          {directory && (
            <span className="text-xs text-content-subtle truncate hidden sm:inline">
              {directory}
            </span>
          )}
        </div>

        {/* Lines changed badge */}
        {change.linesChanged !== undefined && (
          <span className="text-xs text-content-subtle px-1.5 py-0.5 rounded bg-surface-overlay">
            {change.linesChanged > 0 ? `+${change.linesChanged}` : change.linesChanged} lines
          </span>
        )}

        {/* Status label */}
        <span
          className={cn(
            'text-xs',
            change.status === 'applying'
              ? 'text-accent'
              : change.status === 'applied'
                ? 'text-success'
                : change.status === 'error'
                  ? 'text-error'
                  : 'text-content-subtle'
          )}
        >
          {getStatusLabel(change.status)}
        </span>
      </div>

      {/* Preview content */}
      {hasPreview && isExpanded && (
        <div className="border-t border-border/50 px-3 py-2">
          <pre className="text-xs text-content-muted font-mono overflow-x-auto">
            {previewLines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  'py-0.5',
                  line.startsWith('+') && 'text-success bg-success/10',
                  line.startsWith('-') && 'text-error bg-error/10'
                )}
              >
                {line || ' '}
              </div>
            ))}
            {change.preview &&
              change.preview.split('\n').length > maxPreviewLines && (
                <div className="text-content-subtle py-0.5">
                  ... {change.preview.split('\n').length - maxPreviewLines} more
                  lines
                </div>
              )}
          </pre>
        </div>
      )}

      {/* Error message */}
      {change.status === 'error' && change.error && (
        <div className="border-t border-error/20 px-3 py-2">
          <p className="text-xs text-error">{change.error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Summary stats
 */
function ChangesSummary({ changes }: { changes: FileChange[] }) {
  const stats = useMemo(() => {
    const pending = changes.filter((c) => c.status === 'pending').length;
    const applying = changes.filter((c) => c.status === 'applying').length;
    const applied = changes.filter((c) => c.status === 'applied').length;
    const errors = changes.filter((c) => c.status === 'error').length;
    const created = changes.filter((c) => c.type === 'create').length;
    const modified = changes.filter((c) => c.type === 'modify').length;

    return { pending, applying, applied, errors, created, modified, total: changes.length };
  }, [changes]);

  if (changes.length === 0) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-content-muted">
      <span className="flex items-center gap-1">
        <FileCode className="h-3 w-3" />
        {stats.total} file{stats.total !== 1 ? 's' : ''}
      </span>

      {stats.created > 0 && (
        <span className="flex items-center gap-1 text-success">
          <FilePlus className="h-3 w-3" />
          {stats.created} new
        </span>
      )}

      {stats.modified > 0 && (
        <span className="flex items-center gap-1 text-info">
          <FileEdit className="h-3 w-3" />
          {stats.modified} modified
        </span>
      )}

      {stats.applying > 0 && (
        <span className="flex items-center gap-1 text-accent">
          <Loader2 className="h-3 w-3 animate-spin" />
          {stats.applying} applying
        </span>
      )}

      {stats.applied > 0 && (
        <span className="flex items-center gap-1 text-success">
          <Check className="h-3 w-3" />
          {stats.applied} done
        </span>
      )}

      {stats.errors > 0 && (
        <span className="text-error">{stats.errors} error{stats.errors !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
}

/**
 * Main FileChangesDisplay component
 */
export function FileChangesDisplay({
  changes,
  isExpanded = true,
  onToggleExpand,
  showPreview = false,
  maxPreviewLines = 5,
  className,
}: FileChangesDisplayProps) {
  // Sort changes: applying first, then pending, then applied
  const sortedChanges = useMemo(() => {
    return [...changes].sort((a, b) => {
      const order: Record<FileChangeStatus, number> = {
        applying: 0,
        pending: 1,
        error: 2,
        applied: 3,
      };
      return order[a.status] - order[b.status];
    });
  }, [changes]);

  if (changes.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header with summary */}
      <div
        className={cn(
          'flex items-center justify-between',
          onToggleExpand && 'cursor-pointer'
        )}
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          {onToggleExpand && (
            <span className="text-content-subtle">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
          <h4 className="text-sm font-medium text-content">File Changes</h4>
        </div>
        <ChangesSummary changes={changes} />
      </div>

      {/* File list */}
      {isExpanded && (
        <div className="space-y-1.5">
          {sortedChanges.map((change) => (
            <FileChangeItem
              key={change.path}
              change={change}
              showPreview={showPreview}
              maxPreviewLines={maxPreviewLines}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to track file changes during generation
 */
export function useFileChangesTracker() {
  const [changes, setChanges] = useState<FileChange[]>([]);

  const addChange = (path: string, type: FileChangeType) => {
    setChanges((prev) => {
      // Don't add duplicates
      if (prev.some((c) => c.path === path)) {
        return prev;
      }
      return [
        ...prev,
        {
          path,
          type,
          status: 'pending',
          timestamp: Date.now(),
        },
      ];
    });
  };

  const updateStatus = (path: string, status: FileChangeStatus, error?: string) => {
    setChanges((prev) =>
      prev.map((c) =>
        c.path === path
          ? { ...c, status, error, timestamp: Date.now() }
          : c
      )
    );
  };

  const setApplying = (path: string) => updateStatus(path, 'applying');
  const setApplied = (path: string) => updateStatus(path, 'applied');
  const setError = (path: string, error: string) => updateStatus(path, 'error', error);

  const setPreview = (path: string, preview: string, linesChanged?: number) => {
    setChanges((prev) =>
      prev.map((c) =>
        c.path === path ? { ...c, preview, linesChanged } : c
      )
    );
  };

  const reset = () => setChanges([]);

  // Batch add changes from a file list
  const addFromResponse = (
    files: Array<{ path: string }>,
    edits?: Array<{ path: string }>
  ) => {
    const newChanges: FileChange[] = [];

    // Add files (these are creates/full replacements)
    files?.forEach((f) => {
      if (!changes.some((c) => c.path === f.path)) {
        newChanges.push({
          path: f.path,
          type: 'create',
          status: 'pending',
          timestamp: Date.now(),
        });
      }
    });

    // Add edits (these are modifications)
    edits?.forEach((e) => {
      if (!changes.some((c) => c.path === e.path) && !newChanges.some((c) => c.path === e.path)) {
        newChanges.push({
          path: e.path,
          type: 'modify',
          status: 'pending',
          timestamp: Date.now(),
        });
      }
    });

    if (newChanges.length > 0) {
      setChanges((prev) => [...prev, ...newChanges]);
    }
  };

  return {
    changes,
    addChange,
    updateStatus,
    setApplying,
    setApplied,
    setError,
    setPreview,
    reset,
    addFromResponse,
  };
}

export default FileChangesDisplay;
