/**
 * WebContainer Asset Writer
 *
 * Handles writing binary assets (images, 3D models) to the WebContainer
 * filesystem. Assets are written to /public/assets/ for serving.
 */

import { getWebContainer, bootWebContainer } from './webcontainer';
import { getAssetBinaryData, getProjectAssets } from './assetService';
import { Asset, AssetCategory, ASSET_CONFIG } from '../types/assets';
import { logger } from './logger';

const COMPONENT = 'webContainerAssets';

// ============================================================================
// DIRECTORY MANAGEMENT
// ============================================================================

async function ensureAssetDirectories(): Promise<void> {
  const instance = await bootWebContainer();

  const categories: AssetCategory[] = [
    'character',
    'background',
    'ui',
    'item',
    'tile',
    'effect',
    'model',
    'texture',
    'skybox',
    'audio',
  ];

  try {
    await instance.fs.mkdir('/public', { recursive: true });
    await instance.fs.mkdir('/public/assets', { recursive: true });

    for (const category of categories) {
      await instance.fs.mkdir(`/public/assets/${category}`, { recursive: true });
    }

    logger.debug('Asset directories created', {
      component: COMPONENT,
      action: 'ensureAssetDirectories',
    });
  } catch {
    logger.warn('Some asset directories may already exist', {
      component: COMPONENT,
      action: 'ensureAssetDirectories',
    });
  }
}

// ============================================================================
// WRITE SINGLE ASSET
// ============================================================================

export async function writeAssetToContainer(asset: Asset): Promise<void> {
  const instance = await bootWebContainer();

  try {
    const binaryData = await getAssetBinaryData(asset.id);
    const uint8Array = new Uint8Array(binaryData);

    const dirPath = asset.publicPath.substring(0, asset.publicPath.lastIndexOf('/'));
    await instance.fs.mkdir(dirPath, { recursive: true });

    await instance.fs.writeFile(asset.publicPath, uint8Array);

    logger.info('Asset written to WebContainer', {
      component: COMPONENT,
      action: 'writeAssetToContainer',
      assetId: asset.id,
      path: asset.publicPath,
      size: uint8Array.length,
    });
  } catch (err) {
    logger.error('Failed to write asset to WebContainer', err as Error, {
      component: COMPONENT,
      action: 'writeAssetToContainer',
      assetId: asset.id,
      path: asset.publicPath,
    });
    throw err;
  }
}

// ============================================================================
// WRITE ALL PROJECT ASSETS
// ============================================================================

export interface AssetWriteProgress {
  total: number;
  completed: number;
  current: string | null;
  errors: string[];
}

export async function writeAllAssetsToContainer(
  projectId: string,
  onProgress?: (progress: AssetWriteProgress) => void
): Promise<AssetWriteProgress> {
  const assets = await getProjectAssets(projectId);

  const progress: AssetWriteProgress = {
    total: assets.length,
    completed: 0,
    current: null,
    errors: [],
  };

  if (assets.length === 0) {
    return progress;
  }

  await ensureAssetDirectories();

  const instance = await bootWebContainer();

  for (const asset of assets) {
    progress.current = asset.name;
    onProgress?.(progress);

    try {
      const binaryData = await getAssetBinaryData(asset.id);
      const uint8Array = new Uint8Array(binaryData);

      const dirPath = asset.publicPath.substring(0, asset.publicPath.lastIndexOf('/'));
      await instance.fs.mkdir(dirPath, { recursive: true });

      await instance.fs.writeFile(asset.publicPath, uint8Array);

      progress.completed++;
    } catch (err) {
      const errorMsg = `Failed to write ${asset.name}: ${err instanceof Error ? err.message : 'Unknown error'}`;
      progress.errors.push(errorMsg);
      logger.error('Failed to write asset', err as Error, {
        component: COMPONENT,
        action: 'writeAllAssetsToContainer',
        assetId: asset.id,
      });
    }

    onProgress?.(progress);
  }

  progress.current = null;

  logger.info('All assets written to WebContainer', {
    component: COMPONENT,
    action: 'writeAllAssetsToContainer',
    projectId,
    total: assets.length,
    completed: progress.completed,
    errors: progress.errors.length,
  });

  return progress;
}

// ============================================================================
// DELETE ASSET FROM CONTAINER
// ============================================================================

export async function deleteAssetFromContainer(publicPath: string): Promise<void> {
  const instance = getWebContainer();
  if (!instance) {
    logger.warn('WebContainer not available for asset deletion', {
      component: COMPONENT,
      action: 'deleteAssetFromContainer',
      path: publicPath,
    });
    return;
  }

  try {
    await instance.fs.rm(publicPath);
    logger.debug('Asset deleted from WebContainer', {
      component: COMPONENT,
      action: 'deleteAssetFromContainer',
      path: publicPath,
    });
  } catch {
    logger.warn('Failed to delete asset from WebContainer', {
      component: COMPONENT,
      action: 'deleteAssetFromContainer',
      path: publicPath,
    });
  }
}

// ============================================================================
// CHECK ASSET EXISTS
// ============================================================================

export async function assetExistsInContainer(publicPath: string): Promise<boolean> {
  const instance = getWebContainer();
  if (!instance) {
    return false;
  }

  try {
    await instance.fs.readFile(publicPath);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// SYNC ASSETS (ENSURE ALL PROJECT ASSETS ARE IN CONTAINER)
// ============================================================================

export async function syncAssetsToContainer(
  projectId: string,
  onProgress?: (progress: AssetWriteProgress) => void
): Promise<AssetWriteProgress> {
  const assets = await getProjectAssets(projectId);

  const progress: AssetWriteProgress = {
    total: assets.length,
    completed: 0,
    current: null,
    errors: [],
  };

  if (assets.length === 0) {
    return progress;
  }

  await ensureAssetDirectories();

  const assetsToWrite: Asset[] = [];

  for (const asset of assets) {
    const exists = await assetExistsInContainer(asset.publicPath);
    if (!exists) {
      assetsToWrite.push(asset);
    } else {
      progress.completed++;
    }
  }

  if (assetsToWrite.length === 0) {
    logger.debug('All assets already in WebContainer', {
      component: COMPONENT,
      action: 'syncAssetsToContainer',
      projectId,
      count: assets.length,
    });
    return progress;
  }

  logger.info('Syncing missing assets to WebContainer', {
    component: COMPONENT,
    action: 'syncAssetsToContainer',
    projectId,
    total: assets.length,
    missing: assetsToWrite.length,
  });

  const instance = await bootWebContainer();

  for (const asset of assetsToWrite) {
    progress.current = asset.name;
    onProgress?.(progress);

    try {
      const binaryData = await getAssetBinaryData(asset.id);
      const uint8Array = new Uint8Array(binaryData);

      const dirPath = asset.publicPath.substring(0, asset.publicPath.lastIndexOf('/'));
      await instance.fs.mkdir(dirPath, { recursive: true });

      await instance.fs.writeFile(asset.publicPath, uint8Array);

      progress.completed++;
    } catch (err) {
      const errorMsg = `Failed to sync ${asset.name}: ${err instanceof Error ? err.message : 'Unknown error'}`;
      progress.errors.push(errorMsg);
    }

    onProgress?.(progress);
  }

  progress.current = null;

  return progress;
}

// ============================================================================
// WRITE FROM BLOB/FILE
// ============================================================================

export async function writeFileToAssetDir(
  file: File,
  category: AssetCategory
): Promise<string> {
  const instance = await bootWebContainer();

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const publicPath = `${ASSET_CONFIG.publicPathPrefix}/${category}/${sanitizedName}`;

  await ensureAssetDirectories();

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  await instance.fs.writeFile(publicPath, uint8Array);

  logger.info('File written to asset directory', {
    component: COMPONENT,
    action: 'writeFileToAssetDir',
    fileName: file.name,
    path: publicPath,
    size: uint8Array.length,
  });

  return publicPath;
}

// ============================================================================
// LIST ASSETS IN CONTAINER
// ============================================================================

export async function listContainerAssets(): Promise<string[]> {
  const instance = getWebContainer();
  if (!instance) {
    return [];
  }

  const assets: string[] = [];

  async function readDir(path: string): Promise<void> {
    try {
      const entries = await instance.fs.readdir(path, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = `${path}/${entry.name}`;
        if (entry.isDirectory()) {
          await readDir(fullPath);
        } else {
          assets.push(fullPath);
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  await readDir('/public/assets');

  return assets;
}
