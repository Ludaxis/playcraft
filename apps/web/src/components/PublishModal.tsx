/**
 * Publish Modal Component
 * Modal for publishing games with progress tracking
 */

import { useState, memo, useCallback } from 'react';
import { X, Rocket, Loader2, Check, Copy, ExternalLink, AlertCircle, Globe, Wrench } from 'lucide-react';
import { publishGame, type PublishProgress } from '../lib/publishService';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  userId: string;
  projectName: string;
  isAlreadyPublished?: boolean;
  existingUrl?: string | null;
  onPublishSuccess?: (url: string) => void;
  /** Callback to send a fix prompt to the AI. Returns promise that resolves when fix is complete. */
  onAutoFix?: (fixPrompt: string) => Promise<void>;
}

export const PublishModal = memo(function PublishModal({
  isOpen,
  onClose,
  projectId,
  userId,
  projectName,
  isAlreadyPublished = false,
  existingUrl,
  onPublishSuccess,
  onAutoFix,
}: PublishModalProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState<PublishProgress | null>(null);
  const [buildOutput, setBuildOutput] = useState<string[]>([]);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(existingUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    setError(null);
    setBuildOutput([]);
    setPublishedUrl(null);

    // Create auto-fix wrapper that waits for generation to complete
    const autoFixHandler = onAutoFix
      ? async (fixPrompt: string): Promise<boolean> => {
          try {
            await onAutoFix(fixPrompt);
            // Wait additional time for edits to be applied
            await new Promise(resolve => setTimeout(resolve, 2000));
            return true;
          } catch (err) {
            console.error('[PublishModal] Auto-fix failed:', err);
            return false;
          }
        }
      : undefined;

    const result = await publishGame({
      userId,
      projectId,
      onProgress: (p) => setProgress(p),
      onBuildOutput: (output) => setBuildOutput((prev) => [...prev.slice(-100), output]),
      onAutoFix: autoFixHandler,
      maxFixAttempts: 3, // Try up to 3 times for each phase (pre-build + build)
    });

    setIsPublishing(false);

    if (result.success && result.url) {
      setPublishedUrl(result.url);
      onPublishSuccess?.(result.url);
    } else {
      setError(result.error || 'Publishing failed');
    }
  }, [userId, projectId, onPublishSuccess, onAutoFix]);

  const handleCopyUrl = useCallback(async () => {
    if (publishedUrl) {
      await navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [publishedUrl]);

  const handleClose = useCallback(() => {
    if (!isPublishing) {
      setProgress(null);
      setBuildOutput([]);
      setError(null);
      onClose();
    }
  }, [isPublishing, onClose]);

  if (!isOpen) return null;

  const progressPercent = progress?.progress || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-border-muted bg-surface-elevated shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-muted px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-secondary">
              {publishedUrl ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <Globe className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-content">
                {publishedUrl ? 'Game Published!' : isAlreadyPublished ? 'Update Game' : 'Publish Game'}
              </h2>
              <p className="text-sm text-content-muted">{projectName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isPublishing}
            className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {publishedUrl ? (
            /* Success State */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                <Check className="h-8 w-8 text-success" />
              </div>
              <p className="mb-6 text-content-muted">
                Your game is now live! Share it with the world.
              </p>

              {/* URL Copy Box */}
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-surface-overlay p-3">
                <input
                  type="text"
                  readOnly
                  value={publishedUrl}
                  className="flex-1 bg-transparent text-sm text-content outline-none"
                />
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5 text-sm text-content-muted transition-colors hover:bg-surface hover:text-content"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-success">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex gap-3">
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-secondary px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
                >
                  <ExternalLink className="h-4 w-4" />
                  Play Game
                </a>
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-border px-4 py-3 font-medium text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
                >
                  Close
                </button>
              </div>
            </div>
          ) : isPublishing ? (
            /* Publishing State */
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  progress?.stage === 'fixing' ? 'bg-warning/20' : 'bg-accent/20'
                }`}>
                  {progress?.stage === 'fixing' ? (
                    <Wrench className="h-5 w-5 animate-pulse text-warning" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-content">{progress?.message}</p>
                  <p className="text-sm text-content-muted">
                    {progress?.stage === 'fixing' && 'AI is fixing errors automatically...'}
                    {progress?.stage === 'building' && 'Creating production build...'}
                    {progress?.stage === 'uploading' && 'Uploading to servers...'}
                    {progress?.stage === 'finalizing' && 'Almost done...'}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-overlay">
                <div
                  className="h-full bg-gradient-to-r from-accent to-secondary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Build Output */}
              {buildOutput.length > 0 && (
                <div className="max-h-40 overflow-auto rounded-xl bg-surface-elevated p-4 font-mono text-xs text-content-muted">
                  {buildOutput.slice(-15).map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all">
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : error ? (
            /* Error State */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/20">
                <AlertCircle className="h-8 w-8 text-error" />
              </div>
              <p className="mb-2 font-medium text-content">Publishing Failed</p>
              <p className="mb-6 text-sm text-content-muted">{error}</p>

              {/* Show build output on error */}
              {buildOutput.length > 0 && (
                <div className="mb-6 max-h-32 overflow-auto rounded-xl bg-surface-elevated p-4 text-left font-mono text-xs text-content-muted">
                  {buildOutput.slice(-10).map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all">
                      {line}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handlePublish}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-light"
                >
                  <Rocket className="h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-border px-4 py-3 font-medium text-content-muted transition-colors hover:bg-surface-overlay"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Initial State */
            <div>
              <p className="mb-6 text-content-muted">
                {isAlreadyPublished
                  ? 'Update your game with the latest changes. Your existing URL will stay the same.'
                  : 'Publish your game and share it with the world! Anyone can play it without signing in.'}
              </p>

              {/* Features List */}
              <div className="mb-6 space-y-3 rounded-xl border border-border bg-surface-overlay p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-accent/20 p-1">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content">Production Build</p>
                    <p className="text-xs text-content-muted">Optimized and minified for fast loading</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-accent/20 p-1">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content">Instant Sharing</p>
                    <p className="text-xs text-content-muted">Get a shareable link to your game</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-accent/20 p-1">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content">No Login Required</p>
                    <p className="text-xs text-content-muted">Anyone can play your game instantly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-accent/20 p-1">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content">Featured on PlayCraft</p>
                    <p className="text-xs text-content-muted">Your game appears on our homepage</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePublish}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-secondary py-3.5 font-medium text-white shadow-glow-sm transition-all hover:shadow-glow-md"
              >
                <Rocket className="h-5 w-5" />
                {isAlreadyPublished ? 'Update Game' : 'Publish Game'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
