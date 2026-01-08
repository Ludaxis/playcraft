/**
 * AssetPanel Component
 *
 * Main panel for asset management in the Builder sidebar.
 * Combines uploader, gallery, AI generator, and detail modal.
 */

import { useState, useCallback } from 'react';
import { Upload, FolderOpen, Sparkles } from 'lucide-react';
import { AssetUploader } from './AssetUploader';
import { AssetGallery } from './AssetGallery';
import { AssetDetailModal } from './AssetDetailModal';
import { ImageGenerator } from './ImageGenerator';
import {
  useProjectAssets,
  useUploadAsset,
  useUpdateAsset,
  useDeleteAsset,
  useInvalidateAssets,
} from '../../hooks/useAssets';
import type { Asset, CreateAssetInput, UpdateAssetInput } from '../../types/assets';

type PanelView = 'gallery' | 'upload' | 'generate';

interface AssetPanelProps {
  projectId: string | undefined;
  userId: string | undefined;
  onAssetSelect?: (asset: Asset) => void;
}

export function AssetPanel({ projectId, userId, onAssetSelect }: AssetPanelProps) {
  const [view, setView] = useState<PanelView>('gallery');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data: assets = [], isLoading } = useProjectAssets(projectId);
  const uploadAsset = useUploadAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();
  const invalidateAssets = useInvalidateAssets();

  const handleUpload = useCallback(
    async (file: File, input: CreateAssetInput) => {
      if (!userId || !projectId) return;
      await uploadAsset.mutateAsync({ userId, projectId, file, input });
    },
    [userId, projectId, uploadAsset]
  );

  const handleUploadComplete = useCallback(() => {
    setView('gallery');
  }, []);

  const handleSelectAsset = useCallback(
    (asset: Asset) => {
      setSelectedAsset(asset);
      setDetailModalOpen(true);
      onAssetSelect?.(asset);
    },
    [onAssetSelect]
  );

  const handleUpdateAsset = useCallback(
    async (assetId: string, input: UpdateAssetInput) => {
      await updateAsset.mutateAsync({ assetId, input });
    },
    [updateAsset]
  );

  const handleDeleteAsset = useCallback(
    async (asset: Asset) => {
      await deleteAsset.mutateAsync(asset);
      setDetailModalOpen(false);
      setSelectedAsset(null);
    },
    [deleteAsset]
  );

  const handleCopyPath = useCallback((asset: Asset) => {
    navigator.clipboard.writeText(asset.publicPath);
  }, []);

  const handleAssetCreated = useCallback(
    () => {
      if (projectId) {
        invalidateAssets(projectId);
      }
      setView('gallery');
    },
    [projectId, invalidateAssets]
  );

  if (!projectId || !userId) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-content-muted">No project selected</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-border-muted">
        <button
          onClick={() => setView('gallery')}
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
            view === 'gallery'
              ? 'border-b-2 border-accent text-content'
              : 'text-content-muted hover:text-content'
          }`}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Assets
        </button>
        <button
          onClick={() => setView('upload')}
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
            view === 'upload'
              ? 'border-b-2 border-accent text-content'
              : 'text-content-muted hover:text-content'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
        <button
          onClick={() => setView('generate')}
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
            view === 'generate'
              ? 'border-b-2 border-accent text-content'
              : 'text-content-muted hover:text-content'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Generate
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {view === 'gallery' ? (
          <AssetGallery
            assets={assets}
            isLoading={isLoading}
            selectedAssetId={selectedAsset?.id}
            onSelectAsset={handleSelectAsset}
            onDeleteAsset={handleDeleteAsset}
            onCopyPath={handleCopyPath}
            emptyMessage="No assets yet. Upload files or generate with AI."
          />
        ) : view === 'upload' ? (
          <div className="p-3">
            <AssetUploader
              projectId={projectId}
              userId={userId}
              onUpload={handleUpload}
              onUploadComplete={handleUploadComplete}
              disabled={uploadAsset.isPending}
            />
          </div>
        ) : (
          <ImageGenerator
            projectId={projectId}
            userId={userId}
            onAssetCreated={handleAssetCreated}
          />
        )}
      </div>

      <AssetDetailModal
        asset={selectedAsset}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onUpdate={handleUpdateAsset}
        onDelete={handleDeleteAsset}
      />
    </div>
  );
}
