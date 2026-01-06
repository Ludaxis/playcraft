/**
 * File Change Tracker Service
 *
 * Tracks file changes in real-time and triggers background memory updates.
 * Designed to be non-blocking - uses debouncing and idle callbacks.
 *
 * Key responsibilities:
 * 1. Debounce rapid file changes (500ms)
 * 2. Batch multiple changes for efficient processing
 * 3. Update file hashes in database
 * 4. Queue changed files for background re-embedding
 */

import { updateFileHashes } from './fileHashService';
import { indexSingleFile } from './embeddingIndexer';

// ============================================
// Types
// ============================================

export interface FileChange {
  path: string;
  content: string;
  timestamp: number;
  source: 'user-edit' | 'ai-generation' | 'ai-edit';
}

export interface TrackerConfig {
  debounceMs: number;
  maxBatchSize: number;
  enableEmbedding: boolean;
  voyageApiKey?: string;
}

interface PendingChange {
  path: string;
  content: string;
  source: FileChange['source'];
  timestamp: number;
}

// ============================================
// Constants
// ============================================

const DEFAULT_CONFIG: TrackerConfig = {
  debounceMs: 500,
  maxBatchSize: 10,
  enableEmbedding: true,
};

// File extensions that should trigger embedding
const EMBEDDABLE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// ============================================
// File Change Tracker Class
// ============================================

export class FileChangeTracker {
  private projectId: string;
  private config: TrackerConfig;
  private pendingChanges: Map<string, PendingChange> = new Map();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isProcessing = false;
  private processingQueue: PendingChange[] = [];

  // Callbacks for external consumers
  private onHashesUpdated?: (paths: string[]) => void;
  private onEmbeddingStarted?: (path: string) => void;
  private onEmbeddingComplete?: (path: string, success: boolean) => void;

  constructor(projectId: string, config?: Partial<TrackerConfig>) {
    this.projectId = projectId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================
  // Configuration
  // ============================================

  /**
   * Update configuration (e.g., when API key becomes available)
   */
  updateConfig(config: Partial<TrackerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set callback for hash update notifications
   */
  setOnHashesUpdated(callback: (paths: string[]) => void): void {
    this.onHashesUpdated = callback;
  }

  /**
   * Set callback for embedding progress
   */
  setOnEmbeddingProgress(
    onStart: (path: string) => void,
    onComplete: (path: string, success: boolean) => void
  ): void {
    this.onEmbeddingStarted = onStart;
    this.onEmbeddingComplete = onComplete;
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * Track a file change
   * Called when user edits a file or AI generates/modifies code
   */
  trackChange(path: string, content: string, source: FileChange['source']): void {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    this.pendingChanges.set(normalizedPath, {
      path: normalizedPath,
      content,
      source,
      timestamp: Date.now(),
    });

    // Reset debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processChanges();
    }, this.config.debounceMs);
  }

  /**
   * Track multiple file changes at once (e.g., after AI generation)
   */
  trackBatchChanges(
    files: Array<{ path: string; content: string }>,
    source: FileChange['source']
  ): void {
    for (const file of files) {
      const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
      this.pendingChanges.set(normalizedPath, {
        path: normalizedPath,
        content: file.content,
        source,
        timestamp: Date.now(),
      });
    }

    // Reset debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processChanges();
    }, this.config.debounceMs);
  }

  /**
   * Force immediate processing of pending changes
   * Use sparingly - mainly for cleanup before navigation
   */
  async flush(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.pendingChanges.size > 0) {
      await this.processChanges();
    }

    // Wait for queue to drain
    while (this.isProcessing || this.processingQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Get count of pending changes
   */
  getPendingCount(): number {
    return this.pendingChanges.size + this.processingQueue.length;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.pendingChanges.clear();
    this.processingQueue = [];
  }

  // ============================================
  // Internal Processing
  // ============================================

  private async processChanges(): Promise<void> {
    // Move pending changes to processing queue
    const changes = Array.from(this.pendingChanges.values());
    this.pendingChanges.clear();

    if (changes.length === 0) {
      return;
    }

    console.log(`[FileChangeTracker] Processing ${changes.length} file changes`);

    // Add to processing queue
    this.processingQueue.push(...changes);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process in batches
      while (this.processingQueue.length > 0) {
        const batch = this.processingQueue.splice(0, this.config.maxBatchSize);

        // Update file hashes in database
        await this.updateHashes(batch);

        // Queue embeddable files for background embedding
        if (this.config.enableEmbedding && this.config.voyageApiKey) {
          // Use requestIdleCallback for non-blocking embedding
          const embeddableFiles = batch.filter(f =>
            EMBEDDABLE_EXTENSIONS.some(ext => f.path.endsWith(ext))
          );

          if (embeddableFiles.length > 0) {
            this.scheduleEmbedding(embeddableFiles);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async updateHashes(changes: PendingChange[]): Promise<void> {
    try {
      // Build file map for batch update
      const files: Record<string, string> = {};
      for (const change of changes) {
        files[change.path] = change.content;
      }

      // Update hashes in database
      const result = await updateFileHashes(this.projectId, files);

      console.log(
        `[FileChangeTracker] Updated hashes: ${result.modified.length} modified, ${result.created.length} created`
      );

      // Notify listeners
      const updatedPaths = [...result.modified, ...result.created];
      if (this.onHashesUpdated && updatedPaths.length > 0) {
        this.onHashesUpdated(updatedPaths);
      }
    } catch (error) {
      console.error('[FileChangeTracker] Failed to update hashes:', error);
    }
  }

  private scheduleEmbedding(files: PendingChange[]): void {
    // Use requestIdleCallback for non-blocking embedding
    const processNext = (index: number) => {
      if (index >= files.length) {
        return;
      }

      const file = files[index];
      const apiKey = this.config.voyageApiKey;

      if (!apiKey) {
        return;
      }

      // Use requestIdleCallback if available, otherwise setTimeout
      const schedule =
        typeof requestIdleCallback !== 'undefined'
          ? requestIdleCallback
          : (cb: () => void) => setTimeout(cb, 50);

      schedule(async () => {
        try {
          this.onEmbeddingStarted?.(file.path);

          await indexSingleFile(
            this.projectId,
            file.path,
            file.content,
            apiKey
          );

          console.log(`[FileChangeTracker] Embedded: ${file.path}`);
          this.onEmbeddingComplete?.(file.path, true);
        } catch (error) {
          console.error(`[FileChangeTracker] Embedding failed for ${file.path}:`, error);
          this.onEmbeddingComplete?.(file.path, false);
        }

        // Process next file
        processNext(index + 1);
      });
    };

    // Start processing
    processNext(0);
  }
}

// ============================================
// Singleton Instance Manager
// ============================================

const trackerInstances = new Map<string, FileChangeTracker>();

/**
 * Get or create a file change tracker for a project
 */
export function getFileChangeTracker(
  projectId: string,
  config?: Partial<TrackerConfig>
): FileChangeTracker {
  let tracker = trackerInstances.get(projectId);

  if (!tracker) {
    tracker = new FileChangeTracker(projectId, config);
    trackerInstances.set(projectId, tracker);
  } else if (config) {
    tracker.updateConfig(config);
  }

  return tracker;
}

/**
 * Dispose of a tracker instance
 */
export function disposeFileChangeTracker(projectId: string): void {
  const tracker = trackerInstances.get(projectId);
  if (tracker) {
    tracker.dispose();
    trackerInstances.delete(projectId);
  }
}

/**
 * Dispose of all tracker instances
 */
export function disposeAllTrackers(): void {
  for (const tracker of trackerInstances.values()) {
    tracker.dispose();
  }
  trackerInstances.clear();
}
