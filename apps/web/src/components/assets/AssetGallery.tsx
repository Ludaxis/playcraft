/**
 * AssetGallery Component
 *
 * Grid display for browsing and selecting game assets.
 * Supports filtering by type and category with search functionality.
 */

import { useState, useMemo } from 'react';
import {
  Search,
  FileImage,
  Box,
  Music,
  Grid,
  List,
  Trash2,
  Copy,
  MoreVertical,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';
import type { Asset, AssetType, AssetCategory } from '../../types/assets';

type ViewMode = 'grid' | 'list';

interface AssetGalleryProps {
  assets: Asset[];
  isLoading?: boolean;
  selectedAssetId?: string | null;
  onSelectAsset?: (asset: Asset) => void;
  onDeleteAsset?: (asset: Asset) => void;
  onCopyPath?: (asset: Asset) => void;
  emptyMessage?: string;
}

const TYPE_FILTERS: { value: AssetType | 'all'; label: string; icon: typeof FileImage }[] = [
  { value: 'all', label: 'All', icon: Grid },
  { value: '2d', label: '2D', icon: FileImage },
  { value: '3d', label: '3D', icon: Box },
  { value: 'audio', label: 'Audio', icon: Music },
];

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  character: 'Characters',
  background: 'Backgrounds',
  ui: 'UI',
  item: 'Items',
  tile: 'Tiles',
  effect: 'Effects',
  model: '3D Models',
  texture: 'Textures',
  skybox: 'Skyboxes',
  audio: 'Audio',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAssetIcon(assetType: AssetType) {
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

function AssetThumbnail({ asset }: { asset: Asset }) {
  const Icon = getAssetIcon(asset.assetType);

  if (asset.assetType === '2d') {
    return (
      <img
        src={asset.publicPath}
        alt={asset.displayName}
        className="h-full w-full object-contain"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-overlay">
      <Icon className="h-8 w-8 text-content-muted" />
    </div>
  );
}

function AssetGridItem({
  asset,
  isSelected,
  onSelect,
  onDelete,
  onCopyPath,
}: {
  asset: Asset;
  isSelected: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onCopyPath?: () => void;
}) {
  return (
    <div
      className={cn(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border transition-all',
        isSelected
          ? 'border-accent ring-2 ring-accent/30'
          : 'border-border-muted hover:border-accent/50'
      )}
      onClick={onSelect}
    >
      <div className="relative aspect-square overflow-hidden bg-surface-elevated">
        <AssetThumbnail asset={asset} />

        {(onDelete || onCopyPath) && (
          <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded bg-surface-base/80 p-1 backdrop-blur-sm transition-colors hover:bg-surface-elevated"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-content" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onCopyPath && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyPath();
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy path
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="text-error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {asset.isSpriteSheet && (
          <div className="absolute bottom-1 left-1 rounded bg-accent/90 px-1.5 py-0.5 text-xs font-medium text-content">
            {asset.frameCount}f
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5 p-2">
        <span className="truncate text-sm font-medium text-content">
          {asset.displayName}
        </span>
        <span className="text-xs text-content-muted">
          {asset.width && asset.height
            ? `${asset.width}×${asset.height}`
            : formatFileSize(asset.fileSize)}
        </span>
      </div>
    </div>
  );
}

function AssetListItem({
  asset,
  isSelected,
  onSelect,
  onDelete,
  onCopyPath,
}: {
  asset: Asset;
  isSelected: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onCopyPath?: () => void;
}) {
  const Icon = getAssetIcon(asset.assetType);

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-all',
        isSelected
          ? 'border-accent bg-accent/10'
          : 'border-transparent hover:bg-surface-elevated'
      )}
      onClick={onSelect}
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-overlay">
        {asset.assetType === '2d' ? (
          <img
            src={asset.publicPath}
            alt={asset.displayName}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-5 w-5 text-content-muted" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-content">
          {asset.displayName}
        </span>
        <span className="text-xs text-content-muted">
          {CATEGORY_LABELS[asset.category]} • {formatFileSize(asset.fileSize)}
          {asset.width && asset.height && ` • ${asset.width}×${asset.height}`}
        </span>
      </div>

      {(onDelete || onCopyPath) && (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onCopyPath && (
            <button
              className="rounded p-1.5 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
              onClick={(e) => {
                e.stopPropagation();
                onCopyPath();
              }}
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              className="rounded p-1.5 text-content-muted transition-colors hover:bg-error/10 hover:text-error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AssetGallery({
  assets,
  isLoading = false,
  selectedAssetId = null,
  onSelectAsset,
  onDeleteAsset,
  onCopyPath,
  emptyMessage = 'No assets yet',
}: AssetGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (typeFilter !== 'all' && asset.assetType !== typeFilter) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          asset.displayName.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query) ||
          asset.category.toLowerCase().includes(query) ||
          asset.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [assets, typeFilter, searchQuery]);

  const handleCopyPath = (asset: Asset) => {
    if (onCopyPath) {
      onCopyPath(asset);
    } else {
      navigator.clipboard.writeText(asset.publicPath);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {TYPE_FILTERS.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.value}
                  variant={typeFilter === filter.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTypeFilter(filter.value)}
                  className="h-8 px-2.5"
                >
                  <Icon className="mr-1.5 h-3.5 w-3.5" />
                  {filter.label}
                </Button>
              );
            })}
          </div>

          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 pb-3">
        {isLoading ? (
          <LoadingSkeleton viewMode={viewMode} />
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileImage className="mb-3 h-12 w-12 text-content-muted" />
            <p className="text-sm text-content-muted">
              {searchQuery || typeFilter !== 'all'
                ? 'No matching assets found'
                : emptyMessage}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredAssets.map((asset) => (
              <AssetGridItem
                key={asset.id}
                asset={asset}
                isSelected={asset.id === selectedAssetId}
                onSelect={() => onSelectAsset?.(asset)}
                onDelete={onDeleteAsset ? () => onDeleteAsset(asset) : undefined}
                onCopyPath={() => handleCopyPath(asset)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredAssets.map((asset) => (
              <AssetListItem
                key={asset.id}
                asset={asset}
                isSelected={asset.id === selectedAssetId}
                onSelect={() => onSelectAsset?.(asset)}
                onDelete={onDeleteAsset ? () => onDeleteAsset(asset) : undefined}
                onCopyPath={() => handleCopyPath(asset)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
