/**
 * TanStack Query hooks for asset management
 *
 * Provides React Query hooks for CRUD operations on game assets
 * including 2D images and 3D models.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
  getProjectAssets,
  getAsset,
  getAssetsByCategory,
  getProjectAssetUsage,
  uploadAsset,
  updateAsset,
  deleteAsset,
  validateAssetFile,
} from '../lib/assetService';
import { getAssetManifest } from '../lib/assetManifestService';
import {
  writeAssetToContainer,
  writeAllAssetsToContainer,
  syncAssetsToContainer,
  deleteAssetFromContainer,
  type AssetWriteProgress,
} from '../lib/webContainerAssets';
import type {
  Asset,
  AssetCategory,
  CreateAssetInput,
  UpdateAssetInput,
} from '../types/assets';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch all assets for a project
 */
export function useProjectAssets(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assets.byProject(projectId ?? ''),
    queryFn: () => getProjectAssets(projectId!),
    enabled: !!projectId,
  });
}

/**
 * Fetch aggregate usage (size/count) for a project's assets
 */
export function useProjectAssetUsage(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assets.usage(projectId ?? ''),
    queryFn: () => getProjectAssetUsage(projectId!),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/**
 * Fetch a single asset by ID
 */
export function useAsset(assetId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assets.detail(assetId ?? ''),
    queryFn: () => getAsset(assetId!),
    enabled: !!assetId,
  });
}

/**
 * Fetch assets by category
 */
export function useAssetsByCategory(
  projectId: string | undefined,
  category: AssetCategory
) {
  return useQuery({
    queryKey: queryKeys.assets.byCategory(projectId ?? '', category),
    queryFn: () => getAssetsByCategory(projectId!, category),
    enabled: !!projectId,
  });
}

/**
 * Get asset manifest for AI context
 */
export function useAssetManifest(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assets.manifest(projectId ?? ''),
    queryFn: () => getAssetManifest(projectId!),
    enabled: !!projectId,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Upload a new asset
 */
export function useUploadAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      projectId,
      file,
      input,
    }: {
      userId: string;
      projectId: string;
      file: File;
      input: CreateAssetInput;
    }) => {
      const validation = validateAssetFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const result = await uploadAsset(userId, projectId, file, input);
      await writeAssetToContainer(result.asset);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.byProject(result.asset.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.manifest(result.asset.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.usage(result.asset.projectId),
      });
    },
  });
}

/**
 * Upload multiple assets at once
 */
export function useUploadMultipleAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      projectId,
      files,
      getInput,
    }: {
      userId: string;
      projectId: string;
      files: File[];
      getInput: (file: File) => CreateAssetInput;
    }) => {
      const results: Asset[] = [];
      const errors: { file: string; error: string }[] = [];

      for (const file of files) {
        try {
          const validation = validateAssetFile(file);
          if (!validation.valid) {
            errors.push({ file: file.name, error: validation.error! });
            continue;
          }

          const input = getInput(file);
          const result = await uploadAsset(userId, projectId, file, input);
          await writeAssetToContainer(result.asset);
          results.push(result.asset);
        } catch (err) {
          errors.push({
            file: file.name,
            error: err instanceof Error ? err.message : 'Upload failed',
          });
        }
      }

      return { assets: results, errors };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.byProject(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.manifest(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.usage(variables.projectId),
      });
    },
  });
}

/**
 * Update an existing asset
 */
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assetId,
      input,
    }: {
      assetId: string;
      input: UpdateAssetInput;
    }) => updateAsset(assetId, input),
    onSuccess: (updatedAsset) => {
      queryClient.setQueryData(
        queryKeys.assets.detail(updatedAsset.id),
        updatedAsset
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.byProject(updatedAsset.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.manifest(updatedAsset.projectId),
      });
    },
  });
}

/**
 * Delete an asset
 */
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: Asset) => {
      await deleteAsset(asset.id);
      await deleteAssetFromContainer(asset.publicPath);
      return asset;
    },
    onSuccess: (deletedAsset) => {
      queryClient.removeQueries({
        queryKey: queryKeys.assets.detail(deletedAsset.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.byProject(deletedAsset.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.manifest(deletedAsset.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.usage(deletedAsset.projectId),
      });
    },
  });
}

// ============================================================================
// SYNC HOOKS
// ============================================================================

/**
 * Sync all project assets to WebContainer
 */
export function useSyncAssetsToContainer() {
  return useMutation({
    mutationFn: ({
      projectId,
      onProgress,
    }: {
      projectId: string;
      onProgress?: (progress: AssetWriteProgress) => void;
    }) => syncAssetsToContainer(projectId, onProgress),
  });
}

/**
 * Write all project assets to WebContainer (force)
 */
export function useWriteAllAssetsToContainer() {
  return useMutation({
    mutationFn: ({
      projectId,
      onProgress,
    }: {
      projectId: string;
      onProgress?: (progress: AssetWriteProgress) => void;
    }) => writeAllAssetsToContainer(projectId, onProgress),
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Invalidate all asset caches for a project
 */
export function useInvalidateAssets() {
  const queryClient = useQueryClient();

  return (projectId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.assets.byProject(projectId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.assets.manifest(projectId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.assets.usage(projectId),
    });
  };
}

/**
 * Get grouped assets by category
 */
export function useGroupedAssets(projectId: string | undefined) {
  const { data: assets, ...rest } = useProjectAssets(projectId);

  const grouped = assets?.reduce(
    (acc, asset) => {
      const category = asset.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(asset);
      return acc;
    },
    {} as Record<AssetCategory, Asset[]>
  );

  return { data: grouped, assets, ...rest };
}

/**
 * Get asset statistics for a project
 */
export function useAssetStats(projectId: string | undefined) {
  const { data: assets } = useProjectAssets(projectId);

  if (!assets) {
    return null;
  }

  return {
    totalCount: assets.length,
    totalSize: assets.reduce((sum, a) => sum + a.fileSize, 0),
    by2D: assets.filter((a) => a.assetType === '2d').length,
    by3D: assets.filter((a) => a.assetType === '3d').length,
    byAudio: assets.filter((a) => a.assetType === 'audio').length,
    spriteSheets: assets.filter((a) => a.isSpriteSheet).length,
  };
}
