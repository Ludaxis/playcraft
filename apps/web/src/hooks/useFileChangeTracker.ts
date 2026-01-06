/**
 * useFileChangeTracker Hook
 *
 * React hook for integrating file change tracking into components.
 * Handles lifecycle management and provides a simple API.
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  getFileChangeTracker,
  disposeFileChangeTracker,
  type TrackerConfig,
  type FileChange,
} from '../lib/fileChangeTracker';

export interface UseFileChangeTrackerOptions {
  projectId: string;
  voyageApiKey?: string;
  enableEmbedding?: boolean;
  debounceMs?: number;
  onHashesUpdated?: (paths: string[]) => void;
  onEmbeddingStarted?: (path: string) => void;
  onEmbeddingComplete?: (path: string, success: boolean) => void;
}

export interface UseFileChangeTrackerReturn {
  trackChange: (path: string, content: string, source: FileChange['source']) => void;
  trackBatchChanges: (
    files: Array<{ path: string; content: string }>,
    source: FileChange['source']
  ) => void;
  flush: () => Promise<void>;
  getPendingCount: () => number;
}

export function useFileChangeTracker({
  projectId,
  voyageApiKey,
  enableEmbedding = true,
  debounceMs = 500,
  onHashesUpdated,
  onEmbeddingStarted,
  onEmbeddingComplete,
}: UseFileChangeTrackerOptions): UseFileChangeTrackerReturn {
  // Keep callbacks in refs to avoid re-creating tracker on callback changes
  const onHashesUpdatedRef = useRef(onHashesUpdated);
  const onEmbeddingStartedRef = useRef(onEmbeddingStarted);
  const onEmbeddingCompleteRef = useRef(onEmbeddingComplete);

  useEffect(() => {
    onHashesUpdatedRef.current = onHashesUpdated;
    onEmbeddingStartedRef.current = onEmbeddingStarted;
    onEmbeddingCompleteRef.current = onEmbeddingComplete;
  }, [onHashesUpdated, onEmbeddingStarted, onEmbeddingComplete]);

  // Initialize and configure tracker
  useEffect(() => {
    if (!projectId) return;

    const config: Partial<TrackerConfig> = {
      debounceMs,
      enableEmbedding,
      voyageApiKey,
    };

    const tracker = getFileChangeTracker(projectId, config);

    // Set up callbacks
    tracker.setOnHashesUpdated((paths) => {
      onHashesUpdatedRef.current?.(paths);
    });

    tracker.setOnEmbeddingProgress(
      (path) => onEmbeddingStartedRef.current?.(path),
      (path, success) => onEmbeddingCompleteRef.current?.(path, success)
    );

    // Cleanup on unmount or project change
    return () => {
      // Flush pending changes before disposing
      tracker.flush().then(() => {
        disposeFileChangeTracker(projectId);
      });
    };
  }, [projectId, voyageApiKey, enableEmbedding, debounceMs]);

  // Update config when voyage key changes
  useEffect(() => {
    if (!projectId) return;

    const tracker = getFileChangeTracker(projectId);
    tracker.updateConfig({ voyageApiKey, enableEmbedding });
  }, [projectId, voyageApiKey, enableEmbedding]);

  // Stable callbacks
  const trackChange = useCallback(
    (path: string, content: string, source: FileChange['source']) => {
      if (!projectId) return;
      const tracker = getFileChangeTracker(projectId);
      tracker.trackChange(path, content, source);
    },
    [projectId]
  );

  const trackBatchChanges = useCallback(
    (files: Array<{ path: string; content: string }>, source: FileChange['source']) => {
      if (!projectId) return;
      const tracker = getFileChangeTracker(projectId);
      tracker.trackBatchChanges(files, source);
    },
    [projectId]
  );

  const flush = useCallback(async () => {
    if (!projectId) return;
    const tracker = getFileChangeTracker(projectId);
    await tracker.flush();
  }, [projectId]);

  const getPendingCount = useCallback(() => {
    if (!projectId) return 0;
    const tracker = getFileChangeTracker(projectId);
    return tracker.getPendingCount();
  }, [projectId]);

  return {
    trackChange,
    trackBatchChanges,
    flush,
    getPendingCount,
  };
}
