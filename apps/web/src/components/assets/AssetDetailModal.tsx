/**
 * AssetDetailModal Component
 *
 * Modal dialog for viewing and editing asset metadata.
 * Supports sprite sheet configuration and category editing.
 */

import { useState, useEffect } from 'react';
import { FileImage, Box, Music, Copy, Trash2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type {
  Asset,
  AssetCategory,
  UpdateAssetInput,
} from '../../types/assets';

interface AssetDetailModalProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (assetId: string, input: UpdateAssetInput) => Promise<void>;
  onDelete?: (asset: Asset) => Promise<void>;
}

const CATEGORY_OPTIONS: { value: AssetCategory; label: string }[] = [
  { value: 'character', label: 'Character' },
  { value: 'background', label: 'Background' },
  { value: 'ui', label: 'UI Element' },
  { value: 'item', label: 'Item' },
  { value: 'tile', label: 'Tile' },
  { value: 'effect', label: 'Effect' },
  { value: 'model', label: '3D Model' },
  { value: 'texture', label: 'Texture' },
  { value: 'skybox', label: 'Skybox' },
  { value: 'audio', label: 'Audio' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAssetIcon(assetType: Asset['assetType']) {
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

export function AssetDetailModal({
  asset,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: AssetDetailModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('character');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSpriteSheet, setIsSpriteSheet] = useState(false);
  const [frameCount, setFrameCount] = useState('');
  const [frameWidth, setFrameWidth] = useState('');
  const [frameHeight, setFrameHeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (asset) {
      setDisplayName(asset.displayName);
      setCategory(asset.category);
      setDescription(asset.description || '');
      setTags(asset.tags.join(', '));
      setIsSpriteSheet(asset.isSpriteSheet);
      setFrameCount(asset.frameCount?.toString() || '');
      setFrameWidth(asset.frameWidth?.toString() || '');
      setFrameHeight(asset.frameHeight?.toString() || '');
    }
    setShowDeleteConfirm(false);
    setCopied(false);
  }, [asset]);

  const handleSave = async () => {
    if (!asset || !onUpdate) return;

    setIsSaving(true);
    try {
      const input: UpdateAssetInput = {
        displayName: displayName.trim() || asset.name,
        category,
        description: description.trim() || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isSpriteSheet,
      };

      if (isSpriteSheet && asset.assetType === '2d') {
        input.frameCount = parseInt(frameCount, 10) || undefined;
        input.frameWidth = parseInt(frameWidth, 10) || undefined;
        input.frameHeight = parseInt(frameHeight, 10) || undefined;
      }

      await onUpdate(asset.id, input);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!asset || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(asset);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyPath = () => {
    if (asset) {
      navigator.clipboard.writeText(asset.publicPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!asset) return null;

  const Icon = getAssetIcon(asset.assetType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asset Details</DialogTitle>
          <DialogDescription>
            View and edit asset properties
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-overlay">
              {asset.assetType === '2d' ? (
                <img
                  src={asset.publicPath}
                  alt={asset.displayName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Icon className="h-8 w-8 text-content-muted" />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium text-content">
                {asset.name}
              </span>
              <span className="text-xs text-content-muted">
                {formatFileSize(asset.fileSize)} • {asset.format.toUpperCase()}
              </span>
              {asset.width && asset.height && (
                <span className="text-xs text-content-muted">
                  {asset.width} × {asset.height}px
                </span>
              )}
              {asset.animations && asset.animations.length > 0 && (
                <span className="text-xs text-content-muted">
                  {asset.animations.length} animation{asset.animations.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-surface-overlay p-2">
            <code className="flex-1 truncate text-xs text-content-muted">
              {asset.publicPath}
            </code>
            <Button variant="ghost" size="sm" onClick={handleCopyPath}>
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={asset.name}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (for AI)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this asset for AI context..."
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="player, hero, main-character"
              />
            </div>

            {asset.assetType === '2d' && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="spriteSheet">Sprite Sheet</Label>
                  <Switch
                    id="spriteSheet"
                    checked={isSpriteSheet}
                    onCheckedChange={setIsSpriteSheet}
                  />
                </div>

                {isSpriteSheet && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="frameCount" className="text-xs">
                        Frames
                      </Label>
                      <Input
                        id="frameCount"
                        type="number"
                        min="1"
                        value={frameCount}
                        onChange={(e) => setFrameCount(e.target.value)}
                        placeholder="8"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="frameWidth" className="text-xs">
                        Frame W
                      </Label>
                      <Input
                        id="frameWidth"
                        type="number"
                        min="1"
                        value={frameWidth}
                        onChange={(e) => setFrameWidth(e.target.value)}
                        placeholder="32"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="frameHeight" className="text-xs">
                        Frame H
                      </Label>
                      <Input
                        id="frameHeight"
                        type="number"
                        min="1"
                        value={frameHeight}
                        onChange={(e) => setFrameHeight(e.target.value)}
                        placeholder="32"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {onDelete && (
            <>
              {showDeleteConfirm ? (
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <span className="text-sm text-content-muted">Delete?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="text-error hover:bg-error/10 hover:text-error sm:mr-auto"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </>
          )}

          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {onUpdate && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
