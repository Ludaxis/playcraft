/**
 * Asset Types for PlayCraft
 *
 * Defines types for 2D and 3D game assets including sprites, backgrounds,
 * UI elements, and 3D models (GLB/GLTF).
 */

// ============================================================================
// ASSET CATEGORIES & TYPES
// ============================================================================

export type AssetType = '2d' | '3d' | 'audio';

export type AssetCategory =
  | 'character'
  | 'background'
  | 'ui'
  | 'item'
  | 'tile'
  | 'effect'
  | 'model'
  | 'texture'
  | 'skybox'
  | 'audio';

export type AssetFormat =
  // 2D formats
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'gif'
  | 'svg'
  // 3D formats
  | 'glb'
  | 'gltf'
  // Audio formats
  | 'mp3'
  | 'wav'
  | 'ogg';

// ============================================================================
// CORE ASSET INTERFACE
// ============================================================================

export interface Asset {
  id: string;
  projectId: string;
  userId: string;

  /** Original filename */
  name: string;
  /** User-friendly display name */
  displayName: string;
  /** Path in Supabase Storage */
  storagePath: string;
  /** Path in WebContainer (/public/assets/...) */
  publicPath: string;
  /** URL for previewing asset in UI (Supabase storage URL) */
  previewUrl?: string;

  /** Asset classification */
  assetType: AssetType;
  category: AssetCategory;

  /** Technical metadata */
  mimeType: string;
  fileSize: number;
  format: AssetFormat;

  /** Image dimensions (for 2D assets) */
  width?: number;
  height?: number;

  /** Sprite sheet configuration */
  isSpriteSheet: boolean;
  frameCount?: number;
  frameWidth?: number;
  frameHeight?: number;

  /** 3D model metadata */
  polyCount?: number;
  animations?: string[];

  /** AI context */
  description?: string;
  tags: string[];

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface CreateAssetInput {
  name: string;
  displayName?: string;
  assetType: AssetType;
  category: AssetCategory;
  description?: string;
  tags?: string[];

  /** Sprite sheet configuration (optional) */
  isSpriteSheet?: boolean;
  frameCount?: number;
  frameWidth?: number;
  frameHeight?: number;
}

export interface UpdateAssetInput {
  displayName?: string;
  category?: AssetCategory;
  description?: string;
  tags?: string[];

  /** Sprite sheet configuration */
  isSpriteSheet?: boolean;
  frameCount?: number;
  frameWidth?: number;
  frameHeight?: number;
}

// ============================================================================
// ASSET MANIFEST (FOR AI CONTEXT)
// ============================================================================

export interface AssetManifest {
  projectId: string;
  assets: Asset[];
  categories: {
    characters: Asset[];
    backgrounds: Asset[];
    ui: Asset[];
    items: Asset[];
    tiles: Asset[];
    effects: Asset[];
    models: Asset[];
    textures: Asset[];
    skyboxes: Asset[];
    audio: Asset[];
  };
  spriteSheets: Asset[];
  models3d: Asset[];
  totalCount: number;
  totalSize: number;
}

export interface ProjectAssetUsage {
  totalCount: number;
  totalSize: number;
  byType: Record<AssetType, { count: number; totalSize: number }>;
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

export interface AssetUploadResult {
  asset: Asset;
  storagePath: string;
  publicPath: string;
}

export interface AssetUploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

// ============================================================================
// VALIDATION & CONFIGURATION
// ============================================================================

export const ASSET_CONFIG = {
  /** Maximum file sizes by type (in bytes) */
  maxFileSize: {
    '2d': 25 * 1024 * 1024, // 25MB per file per Phase 1 spec
    '3d': 25 * 1024 * 1024,
    audio: 25 * 1024 * 1024,
  },

  /** Supported MIME types */
  mimeTypes: {
    '2d': [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ],
    '3d': [
      'model/gltf-binary',
      'model/gltf+json',
      'application/octet-stream', // GLB files often have this
    ],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  },

  /** File extensions by type */
  extensions: {
    '2d': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'],
    '3d': ['.glb', '.gltf'],
    audio: ['.mp3', '.wav', '.ogg'],
  },

  /** Default category by file extension */
  defaultCategory: {
    '.png': 'character',
    '.jpg': 'background',
    '.jpeg': 'background',
    '.webp': 'character',
    '.gif': 'effect',
    '.svg': 'ui',
    '.glb': 'model',
    '.gltf': 'model',
    '.mp3': 'audio',
    '.wav': 'audio',
    '.ogg': 'audio',
  } as Record<string, AssetCategory>,

  /** Storage bucket name */
  bucketName: 'project-assets',

  /** Public path prefix in WebContainer */
  publicPathPrefix: '/public/assets',

  /** Project-level storage quota (Phase 1 target: 1GB) */
  projectStorageLimitBytes: 1024 * 1024 * 1024,
} as const;

// ============================================================================
// HELPER FUNCTIONS (TYPE GUARDS)
// ============================================================================

export function isValidAssetType(type: string): type is AssetType {
  return ['2d', '3d', 'audio'].includes(type);
}

export function isValidAssetCategory(category: string): category is AssetCategory {
  return [
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
  ].includes(category);
}

export function isValidAssetFormat(format: string): format is AssetFormat {
  return [
    'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg',
    'glb', 'gltf',
    'mp3', 'wav', 'ogg',
  ].includes(format);
}

export function getAssetTypeFromExtension(extension: string): AssetType | null {
  const ext = extension.toLowerCase();
  if (ASSET_CONFIG.extensions['2d'].includes(ext)) return '2d';
  if (ASSET_CONFIG.extensions['3d'].includes(ext)) return '3d';
  if (ASSET_CONFIG.extensions.audio.includes(ext)) return 'audio';
  return null;
}

export function getAssetFormatFromExtension(extension: string): AssetFormat | null {
  const ext = extension.toLowerCase().replace('.', '') as AssetFormat;
  return isValidAssetFormat(ext) ? ext : null;
}

export function getCategoryFromExtension(extension: string): AssetCategory {
  const ext = extension.toLowerCase();
  return ASSET_CONFIG.defaultCategory[ext] || 'item';
}

export function is3DAsset(asset: Asset): boolean {
  return asset.assetType === '3d';
}

export function is2DAsset(asset: Asset): boolean {
  return asset.assetType === '2d';
}

export function isAudioAsset(asset: Asset): boolean {
  return asset.assetType === 'audio';
}
