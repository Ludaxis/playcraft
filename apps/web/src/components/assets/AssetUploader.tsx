/**
 * AssetUploader Component
 *
 * Drag-and-drop file upload interface for game assets (2D, 3D, audio).
 * Supports batch uploads with progress tracking and validation.
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileImage, Box, Music, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';
import { validateAssetFile } from '../../lib/assetService';
import {
  ASSET_CONFIG,
  getAssetTypeFromExtension,
  getCategoryFromExtension,
  type AssetType,
  type CreateAssetInput,
} from '../../types/assets';

interface UploadFile {
  id: string;
  file: File;
  assetType: AssetType;
  preview?: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
}

interface AssetUploaderProps {
  projectId: string;
  userId: string;
  usage?: {
    totalSizeBytes: number;
    limitBytes: number;
  };
  onUpload: (file: File, input: CreateAssetInput) => Promise<void>;
  onUploadComplete?: () => void;
  maxConcurrent?: number;
  disabled?: boolean;
}

function getFileIcon(assetType: AssetType) {
  switch (assetType) {
    case '2d':
      return FileImage;
    case '3d':
      return Box;
    case 'audio':
      return Music;
    default:
      return FileImage;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function generateFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AssetUploader({
  usage,
  onUpload,
  onUploadComplete,
  maxConcurrent = 3,
  disabled = false,
}: AssetUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingCountRef = useRef(0);

  const usedBytes = usage?.totalSizeBytes ?? 0;
  const limitBytes = usage?.limitBytes ?? ASSET_CONFIG.projectStorageLimitBytes;
  const remainingBytes = Math.max(limitBytes - usedBytes, 0);
  const usagePercent = Math.min((usedBytes / limitBytes) * 100, 100);
  const maxPerFileText = formatFileSize(ASSET_CONFIG.maxFileSize['2d']);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    setFiles((prev) => {
      const filesToAdd: UploadFile[] = [];
      const queuedBytes = prev.reduce((sum, f) => {
        if (f.status === 'pending' || f.status === 'uploading') {
          return sum + f.file.size;
        }
        return sum;
      }, 0);

      let addedBytes = 0;

      for (const file of Array.from(newFiles)) {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const assetType = getAssetTypeFromExtension(ext);
        const validation = validateAssetFile(file);

        const projectedTotal = usedBytes + queuedBytes + addedBytes + file.size;
        if (projectedTotal > limitBytes) {
          filesToAdd.push({
            id: generateFileId(),
            file,
            assetType: assetType || '2d',
            status: 'error',
            progress: 0,
            error: `Storage limit exceeded. Remaining ${formatFileSize(
              Math.max(limitBytes - (usedBytes + queuedBytes + addedBytes), 0)
            )}`,
          });
          continue;
        }

        const uploadFile: UploadFile = {
          id: generateFileId(),
          file,
          assetType: assetType || '2d',
          status: validation.valid ? 'pending' : 'error',
          progress: 0,
          error: validation.error,
        };

        if (assetType === '2d' && validation.valid) {
          const url = URL.createObjectURL(file);
          uploadFile.preview = url;
        }

        if (validation.valid) {
          addedBytes += file.size;
        }

        filesToAdd.push(uploadFile);
      }

      return [...prev, ...filesToAdd];
    });
  }, [limitBytes, usedBytes]);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setFiles((prev) => {
      prev
        .filter((f) => f.status === 'complete' || f.status === 'error')
        .forEach((f) => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });
      return prev.filter((f) => f.status === 'pending' || f.status === 'uploading');
    });
  }, []);

  const uploadFile = useCallback(
    async (uploadFile: UploadFile) => {
      const ext = '.' + uploadFile.file.name.split('.').pop()?.toLowerCase();
      const category = getCategoryFromExtension(ext);

      const input: CreateAssetInput = {
        name: uploadFile.file.name,
        displayName: uploadFile.file.name.replace(/\.[^.]+$/, ''),
        assetType: uploadFile.assetType,
        category,
      };

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 10 } : f
        )
      );

      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: 50 } : f))
        );

        await onUpload(uploadFile.file, input);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'complete' as const, progress: 100 }
              : f
          )
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: 'error' as const,
                  error: err instanceof Error ? err.message : 'Upload failed',
                }
              : f
          )
        );
      }
    },
    [onUpload]
  );

  const startUpload = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    uploadingCountRef.current = 0;

    const uploadQueue = [...pendingFiles];

    const processNext = async () => {
      while (uploadQueue.length > 0 && uploadingCountRef.current < maxConcurrent) {
        const file = uploadQueue.shift();
        if (!file) break;

        uploadingCountRef.current++;
        try {
          await uploadFile(file);
        } finally {
          uploadingCountRef.current--;
        }
      }
    };

    const workers = Array(Math.min(maxConcurrent, pendingFiles.length))
      .fill(null)
      .map(() => processNext());

    await Promise.all(workers);
    setIsUploading(false);
    onUploadComplete?.();
  }, [files, maxConcurrent, uploadFile, onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [disabled, addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        addFiles(selectedFiles);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [addFiles]
  );

  const acceptedExtensions = [
    ...ASSET_CONFIG.extensions['2d'],
    ...ASSET_CONFIG.extensions['3d'],
    ...ASSET_CONFIG.extensions.audio,
  ].join(',');

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const completedCount = files.filter((f) => f.status === 'complete').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <div className="flex flex-col gap-4">
      {limitBytes > 0 && (
        <div className="space-y-1 rounded-lg bg-surface-elevated p-3 text-xs text-content-muted">
          <div className="flex items-center justify-between">
            <span>Storage</span>
            <span>
              {formatFileSize(usedBytes)} / {formatFileSize(limitBytes)}
            </span>
          </div>
          <Progress value={usagePercent} className="h-1.5" />
          <div className="flex justify-between text-[11px] text-content-subtle">
            <span>Project limit: {formatFileSize(limitBytes)}</span>
            <span>{formatFileSize(remainingBytes)} remaining</span>
          </div>
        </div>
      )}

      <div
        className={cn(
          'relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all',
          isDragOver
            ? 'border-accent bg-accent/10'
            : 'border-border-muted bg-surface hover:border-accent/50 hover:bg-surface-elevated',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedExtensions}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <Upload
          className={cn(
            'mb-3 h-10 w-10',
            isDragOver ? 'text-accent' : 'text-content-muted'
          )}
        />
        <p className="mb-1 text-sm font-medium text-content">
          {isDragOver ? 'Drop files here' : 'Drop files or click to upload'}
        </p>
        <p className="text-xs text-content-muted">
          PNG, JPG, WebP, GIF, SVG, GLB, GLTF, MP3, WAV, OGG
        </p>
        <p className="mt-1 text-xs text-content-subtle">
          Max per file: {maxPerFileText}. Project limit: {formatFileSize(limitBytes)}.
        </p>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-content-muted">
              {pendingCount > 0 && `${pendingCount} pending`}
              {completedCount > 0 && ` • ${completedCount} complete`}
              {errorCount > 0 && ` • ${errorCount} failed`}
            </span>
            {(completedCount > 0 || errorCount > 0) && (
              <Button variant="ghost" size="sm" onClick={clearCompleted}>
                Clear completed
              </Button>
            )}
          </div>

          <div className="flex max-h-[240px] flex-col gap-2 overflow-y-auto">
            {files.map((file) => {
              const Icon = getFileIcon(file.assetType);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg bg-surface-elevated p-3"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-surface-overlay">
                      <Icon className="h-5 w-5 text-content-muted" />
                    </div>
                  )}

                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-content">
                      {file.file.name}
                    </span>
                    <span className="text-xs text-content-muted">
                      {formatFileSize(file.file.size)}
                    </span>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-1 h-1" />
                    )}
                    {file.error && (
                      <span className="mt-1 text-xs text-error">{file.error}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === 'complete' && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-error" />
                    )}
                    {(file.status === 'pending' || file.status === 'error') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="rounded p-1 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {pendingCount > 0 && (
            <Button
              onClick={startUpload}
              disabled={isUploading || disabled}
              className="mt-2"
            >
              {isUploading ? 'Uploading...' : `Upload ${pendingCount} file${pendingCount > 1 ? 's' : ''}`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
