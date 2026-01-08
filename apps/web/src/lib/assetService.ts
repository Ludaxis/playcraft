/**
 * Asset Service
 *
 * Handles asset CRUD operations for 2D and 3D game assets.
 * Supports binary file uploads to Supabase Storage.
 */

import { getSupabase } from './supabase';
import { logger } from './logger';
import {
  Asset,
  CreateAssetInput,
  UpdateAssetInput,
  AssetUploadResult,
  AssetType,
  AssetCategory,
  AssetFormat,
  ASSET_CONFIG,
  getAssetTypeFromExtension,
  getAssetFormatFromExtension,
  getCategoryFromExtension,
  type ProjectAssetUsage,
} from '../types/assets';

const COMPONENT = 'assetService';

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAssetFile(file: File): ValidationResult {
  const extension = getExtension(file.name);
  const assetType = getAssetTypeFromExtension(extension);

  if (!assetType) {
    return {
      valid: false,
      error: `Unsupported file format: ${extension}`,
    };
  }

  const maxSize = ASSET_CONFIG.maxFileSize[assetType];
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size for ${assetType} assets is ${maxSizeMB}MB`,
    };
  }

  const validMimeTypes = ASSET_CONFIG.mimeTypes[assetType];
  if (!validMimeTypes.includes(file.type) && file.type !== '') {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}`,
    };
  }

  return { valid: true };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
}

function buildStoragePath(
  userId: string,
  projectId: string,
  category: AssetCategory,
  filename: string
): string {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${projectId}/assets/${category}/${sanitizedFilename}`;
}

function buildPublicPath(category: AssetCategory, filename: string): string {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${ASSET_CONFIG.publicPathPrefix}/${category}/${sanitizedFilename}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

export async function getProjectAssetUsage(projectId: string): Promise<ProjectAssetUsage> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_project_assets')
    .select('asset_type, file_size')
    .eq('project_id', projectId);

  if (error) {
    logger.error('Failed to get project asset usage', error as Error, {
      component: COMPONENT,
      action: 'getProjectAssetUsage',
      projectId,
    });
    throw new Error(`Failed to get asset usage: ${error.message}`);
  }

  const usage: ProjectAssetUsage = {
    totalCount: 0,
    totalSize: 0,
    byType: {
      '2d': { count: 0, totalSize: 0 },
      '3d': { count: 0, totalSize: 0 },
      audio: { count: 0, totalSize: 0 },
    },
  };

  (data || []).forEach((row) => {
    const assetType = (row.asset_type as AssetType) || '2d';
    const fileSize = typeof row.file_size === 'number' ? row.file_size : 0;
    usage.totalCount += 1;
    usage.totalSize += fileSize;
    if (usage.byType[assetType]) {
      usage.byType[assetType].count += 1;
      usage.byType[assetType].totalSize += fileSize;
    }
  });

  return usage;
}

async function assertProjectStorageCapacity(projectId: string, incomingSize: number) {
  const usage = await getProjectAssetUsage(projectId);
  const limit = ASSET_CONFIG.projectStorageLimitBytes;

  if (usage.totalSize + incomingSize > limit) {
    const remaining = Math.max(limit - usage.totalSize, 0);
    const remainingText = formatBytes(remaining);

    logger.warn('Project storage limit exceeded', {
      component: COMPONENT,
      action: 'assertProjectStorageCapacity',
      projectId,
      limit,
      currentSize: usage.totalSize,
      incomingSize,
    });

    throw new Error(
      `Storage limit exceeded. Remaining capacity: ${remainingText} of ${formatBytes(limit)}.`
    );
  }

  return usage;
}

function mapDbRowToAsset(row: Record<string, unknown>): Asset {
  const storagePath = row.storage_path as string;
  const supabase = getSupabase();

  // Generate preview URL from Supabase storage
  const { data: publicUrlData } = supabase.storage
    .from(ASSET_CONFIG.bucketName)
    .getPublicUrl(storagePath);

  return {
    id: row.id as string,
    projectId: row.project_id as string,
    userId: row.user_id as string,
    name: row.name as string,
    displayName: (row.display_name as string) || (row.name as string),
    storagePath,
    publicPath: row.public_path as string,
    previewUrl: publicUrlData?.publicUrl,
    assetType: row.asset_type as AssetType,
    category: row.category as AssetCategory,
    format: row.format as AssetFormat,
    mimeType: row.mime_type as string,
    fileSize: row.file_size as number,
    width: row.width as number | undefined,
    height: row.height as number | undefined,
    isSpriteSheet: row.is_sprite_sheet as boolean,
    frameCount: row.frame_count as number | undefined,
    frameWidth: row.frame_width as number | undefined,
    frameHeight: row.frame_height as number | undefined,
    polyCount: row.poly_count as number | undefined,
    animations: row.animations as string[] | undefined,
    description: row.description as string | undefined,
    tags: (row.tags as string[]) || [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============================================================================
// UPLOAD
// ============================================================================

export async function uploadAsset(
  userId: string,
  projectId: string,
  file: File,
  input: CreateAssetInput
): Promise<AssetUploadResult> {
  const supabase = getSupabase();

  const validation = validateAssetFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const extension = getExtension(file.name);
  const assetType = input.assetType || getAssetTypeFromExtension(extension)!;
  const format = getAssetFormatFromExtension(extension)!;
  const category = input.category || getCategoryFromExtension(extension);

  const storagePath = buildStoragePath(userId, projectId, category, file.name);
  const publicPath = buildPublicPath(category, file.name);

  await assertProjectStorageCapacity(projectId, file.size);

  logger.info('Uploading asset', {
    component: COMPONENT,
    action: 'uploadAsset',
    fileName: file.name,
    assetType,
    category,
    fileSize: file.size,
  });

  const { error: uploadError } = await supabase.storage
    .from(ASSET_CONFIG.bucketName)
    .upload(storagePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });

  if (uploadError) {
    logger.error('Failed to upload asset to storage', uploadError as Error, {
      component: COMPONENT,
      action: 'uploadAsset',
      storagePath,
    });
    throw new Error(`Failed to upload asset: ${uploadError.message}`);
  }

  let dimensions: { width: number; height: number } | null = null;
  if (assetType === '2d') {
    dimensions = await getImageDimensions(file);
  }

  const { data, error: insertError } = await supabase
    .from('playcraft_project_assets')
    .insert({
      project_id: projectId,
      user_id: userId,
      name: input.name || file.name,
      display_name: input.displayName || file.name.replace(/\.[^.]+$/, ''),
      storage_path: storagePath,
      public_path: publicPath,
      asset_type: assetType,
      category,
      format,
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
      width: dimensions?.width,
      height: dimensions?.height,
      is_sprite_sheet: input.isSpriteSheet || false,
      frame_count: input.frameCount,
      frame_width: input.frameWidth,
      frame_height: input.frameHeight,
      description: input.description,
      tags: input.tags || [],
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(ASSET_CONFIG.bucketName).remove([storagePath]);

    logger.error('Failed to insert asset record', insertError as Error, {
      component: COMPONENT,
      action: 'uploadAsset',
    });
    throw new Error(`Failed to save asset: ${insertError.message}`);
  }

  const asset = mapDbRowToAsset(data);

  logger.info('Asset uploaded successfully', {
    component: COMPONENT,
    action: 'uploadAsset',
    assetId: asset.id,
    publicPath,
  });

  return {
    asset,
    storagePath,
    publicPath,
  };
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getProjectAssets(projectId: string): Promise<Asset[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_project_assets')
    .select('*')
    .eq('project_id', projectId)
    .order('category')
    .order('name');

  if (error) {
    logger.error('Failed to get project assets', error as Error, {
      component: COMPONENT,
      action: 'getProjectAssets',
      projectId,
    });
    throw new Error(`Failed to get assets: ${error.message}`);
  }

  return (data || []).map(mapDbRowToAsset);
}

export async function getAsset(assetId: string): Promise<Asset | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_project_assets')
    .select('*')
    .eq('id', assetId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    logger.error('Failed to get asset', error as Error, {
      component: COMPONENT,
      action: 'getAsset',
      assetId,
    });
    throw new Error(`Failed to get asset: ${error.message}`);
  }

  return mapDbRowToAsset(data);
}

export async function getAssetsByCategory(
  projectId: string,
  category: AssetCategory
): Promise<Asset[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_project_assets')
    .select('*')
    .eq('project_id', projectId)
    .eq('category', category)
    .order('name');

  if (error) {
    logger.error('Failed to get assets by category', error as Error, {
      component: COMPONENT,
      action: 'getAssetsByCategory',
      projectId,
      category,
    });
    throw new Error(`Failed to get assets: ${error.message}`);
  }

  return (data || []).map(mapDbRowToAsset);
}

export async function getAssetsByType(
  projectId: string,
  assetType: AssetType
): Promise<Asset[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_project_assets')
    .select('*')
    .eq('project_id', projectId)
    .eq('asset_type', assetType)
    .order('category')
    .order('name');

  if (error) {
    logger.error('Failed to get assets by type', error as Error, {
      component: COMPONENT,
      action: 'getAssetsByType',
      projectId,
      assetType,
    });
    throw new Error(`Failed to get assets: ${error.message}`);
  }

  return (data || []).map(mapDbRowToAsset);
}

// ============================================================================
// UPDATE
// ============================================================================

export async function updateAsset(
  assetId: string,
  input: UpdateAssetInput
): Promise<Asset> {
  const supabase = getSupabase();

  const updateData: Record<string, unknown> = {};

  if (input.displayName !== undefined) {
    updateData.display_name = input.displayName;
  }
  if (input.category !== undefined) {
    updateData.category = input.category;
  }
  if (input.description !== undefined) {
    updateData.description = input.description;
  }
  if (input.tags !== undefined) {
    updateData.tags = input.tags;
  }
  if (input.isSpriteSheet !== undefined) {
    updateData.is_sprite_sheet = input.isSpriteSheet;
  }
  if (input.frameCount !== undefined) {
    updateData.frame_count = input.frameCount;
  }
  if (input.frameWidth !== undefined) {
    updateData.frame_width = input.frameWidth;
  }
  if (input.frameHeight !== undefined) {
    updateData.frame_height = input.frameHeight;
  }

  const { data, error } = await supabase
    .from('playcraft_project_assets')
    .update(updateData)
    .eq('id', assetId)
    .select()
    .single();

  if (error) {
    logger.error('Failed to update asset', error as Error, {
      component: COMPONENT,
      action: 'updateAsset',
      assetId,
    });
    throw new Error(`Failed to update asset: ${error.message}`);
  }

  logger.info('Asset updated', {
    component: COMPONENT,
    action: 'updateAsset',
    assetId,
  });

  return mapDbRowToAsset(data);
}

// ============================================================================
// DELETE
// ============================================================================

export async function deleteAsset(assetId: string): Promise<void> {
  const supabase = getSupabase();

  const asset = await getAsset(assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }

  const { error: deleteDbError } = await supabase
    .from('playcraft_project_assets')
    .delete()
    .eq('id', assetId);

  if (deleteDbError) {
    logger.error('Failed to delete asset record', deleteDbError as Error, {
      component: COMPONENT,
      action: 'deleteAsset',
      assetId,
    });
    throw new Error(`Failed to delete asset: ${deleteDbError.message}`);
  }

  const { error: deleteStorageError } = await supabase.storage
    .from(ASSET_CONFIG.bucketName)
    .remove([asset.storagePath]);

  if (deleteStorageError) {
    logger.warn('Failed to delete asset from storage', {
      component: COMPONENT,
      action: 'deleteAsset',
      assetId,
      storagePath: asset.storagePath,
      error: deleteStorageError.message,
    });
  }

  logger.info('Asset deleted', {
    component: COMPONENT,
    action: 'deleteAsset',
    assetId,
  });
}

export async function deleteProjectAssets(projectId: string): Promise<number> {
  const supabase = getSupabase();

  const assets = await getProjectAssets(projectId);
  if (assets.length === 0) {
    return 0;
  }

  const { error: deleteDbError } = await supabase
    .from('playcraft_project_assets')
    .delete()
    .eq('project_id', projectId);

  if (deleteDbError) {
    logger.error('Failed to delete project assets', deleteDbError as Error, {
      component: COMPONENT,
      action: 'deleteProjectAssets',
      projectId,
    });
    throw new Error(`Failed to delete assets: ${deleteDbError.message}`);
  }

  const storagePaths = assets.map((a) => a.storagePath);
  const { error: deleteStorageError } = await supabase.storage
    .from(ASSET_CONFIG.bucketName)
    .remove(storagePaths);

  if (deleteStorageError) {
    logger.warn('Failed to delete some assets from storage', {
      component: COMPONENT,
      action: 'deleteProjectAssets',
      projectId,
      count: storagePaths.length,
    });
  }

  logger.info('Project assets deleted', {
    component: COMPONENT,
    action: 'deleteProjectAssets',
    projectId,
    count: assets.length,
  });

  return assets.length;
}

// ============================================================================
// SIGNED URLs
// ============================================================================

export async function getAssetSignedUrl(
  assetId: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = getSupabase();

  const asset = await getAsset(assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }

  const { data, error } = await supabase.storage
    .from(ASSET_CONFIG.bucketName)
    .createSignedUrl(asset.storagePath, expiresIn);

  if (error) {
    logger.error('Failed to create signed URL', error as Error, {
      component: COMPONENT,
      action: 'getAssetSignedUrl',
      assetId,
    });
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

// ============================================================================
// BINARY DATA
// ============================================================================

export async function getAssetBinaryData(assetId: string): Promise<ArrayBuffer> {
  const supabase = getSupabase();

  const asset = await getAsset(assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }

  const { data, error } = await supabase.storage
    .from(ASSET_CONFIG.bucketName)
    .download(asset.storagePath);

  if (error) {
    logger.error('Failed to download asset', error as Error, {
      component: COMPONENT,
      action: 'getAssetBinaryData',
      assetId,
    });
    throw new Error(`Failed to download asset: ${error.message}`);
  }

  return data.arrayBuffer();
}

export async function getAssetDataUrl(assetId: string): Promise<string> {
  const supabase = getSupabase();

  const asset = await getAsset(assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }

  const { data, error } = await supabase.storage
    .from(ASSET_CONFIG.bucketName)
    .download(asset.storagePath);

  if (error) {
    logger.error('Failed to download asset for data URL', error as Error, {
      component: COMPONENT,
      action: 'getAssetDataUrl',
      assetId,
    });
    throw new Error(`Failed to download asset: ${error.message}`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read asset data'));
    reader.readAsDataURL(data);
  });
}
