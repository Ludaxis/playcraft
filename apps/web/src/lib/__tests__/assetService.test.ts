import { describe, it, expect, vi } from 'vitest';
import { validateAssetFile } from '../assetService';
import {
  isValidAssetType,
  isValidAssetCategory,
  isValidAssetFormat,
  getAssetTypeFromExtension,
  getAssetFormatFromExtension,
  getCategoryFromExtension,
  is2DAsset,
  is3DAsset,
  isAudioAsset,
  ASSET_CONFIG,
  type Asset,
} from '../../types/assets';

// Mock Supabase
const mockUpload = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockDelete = vi.fn();
const mockDownload = vi.fn();

const supabaseMock = {
  storage: {
    from: () => ({
      upload: mockUpload,
      download: mockDownload,
      remove: vi.fn(() => ({ error: null })),
      createSignedUrl: vi.fn(() => ({ data: { signedUrl: 'https://signed.url' }, error: null })),
    }),
  },
  from: () => ({
    insert: () => ({
      select: () => ({
        single: mockInsert,
      }),
    }),
    select: () => ({
      eq: () => ({
        order: () => ({
          order: mockSelect,
        }),
        single: mockSelect,
      }),
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: vi.fn(),
        }),
      }),
    }),
    delete: () => ({
      eq: mockDelete,
    }),
  }),
};

vi.mock('../supabase', () => ({
  getSupabase: () => supabaseMock,
}));

vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Asset Type Guards', () => {
  describe('isValidAssetType', () => {
    it('returns true for valid asset types', () => {
      expect(isValidAssetType('2d')).toBe(true);
      expect(isValidAssetType('3d')).toBe(true);
      expect(isValidAssetType('audio')).toBe(true);
    });

    it('returns false for invalid asset types', () => {
      expect(isValidAssetType('video')).toBe(false);
      expect(isValidAssetType('')).toBe(false);
      expect(isValidAssetType('2D')).toBe(false);
    });
  });

  describe('isValidAssetCategory', () => {
    it('returns true for valid categories', () => {
      expect(isValidAssetCategory('character')).toBe(true);
      expect(isValidAssetCategory('background')).toBe(true);
      expect(isValidAssetCategory('ui')).toBe(true);
      expect(isValidAssetCategory('item')).toBe(true);
      expect(isValidAssetCategory('tile')).toBe(true);
      expect(isValidAssetCategory('effect')).toBe(true);
      expect(isValidAssetCategory('model')).toBe(true);
      expect(isValidAssetCategory('texture')).toBe(true);
      expect(isValidAssetCategory('skybox')).toBe(true);
      expect(isValidAssetCategory('audio')).toBe(true);
    });

    it('returns false for invalid categories', () => {
      expect(isValidAssetCategory('sprite')).toBe(false);
      expect(isValidAssetCategory('')).toBe(false);
    });
  });

  describe('isValidAssetFormat', () => {
    it('returns true for valid 2D formats', () => {
      expect(isValidAssetFormat('png')).toBe(true);
      expect(isValidAssetFormat('jpg')).toBe(true);
      expect(isValidAssetFormat('jpeg')).toBe(true);
      expect(isValidAssetFormat('webp')).toBe(true);
      expect(isValidAssetFormat('gif')).toBe(true);
      expect(isValidAssetFormat('svg')).toBe(true);
    });

    it('returns true for valid 3D formats', () => {
      expect(isValidAssetFormat('glb')).toBe(true);
      expect(isValidAssetFormat('gltf')).toBe(true);
    });

    it('returns true for valid audio formats', () => {
      expect(isValidAssetFormat('mp3')).toBe(true);
      expect(isValidAssetFormat('wav')).toBe(true);
      expect(isValidAssetFormat('ogg')).toBe(true);
    });

    it('returns false for invalid formats', () => {
      expect(isValidAssetFormat('psd')).toBe(false);
      expect(isValidAssetFormat('obj')).toBe(false);
      expect(isValidAssetFormat('')).toBe(false);
    });
  });
});

describe('Asset Extension Helpers', () => {
  describe('getAssetTypeFromExtension', () => {
    it('returns 2d for image extensions', () => {
      expect(getAssetTypeFromExtension('.png')).toBe('2d');
      expect(getAssetTypeFromExtension('.jpg')).toBe('2d');
      expect(getAssetTypeFromExtension('.jpeg')).toBe('2d');
      expect(getAssetTypeFromExtension('.webp')).toBe('2d');
      expect(getAssetTypeFromExtension('.gif')).toBe('2d');
      expect(getAssetTypeFromExtension('.svg')).toBe('2d');
    });

    it('returns 3d for model extensions', () => {
      expect(getAssetTypeFromExtension('.glb')).toBe('3d');
      expect(getAssetTypeFromExtension('.gltf')).toBe('3d');
    });

    it('returns audio for audio extensions', () => {
      expect(getAssetTypeFromExtension('.mp3')).toBe('audio');
      expect(getAssetTypeFromExtension('.wav')).toBe('audio');
      expect(getAssetTypeFromExtension('.ogg')).toBe('audio');
    });

    it('returns null for unsupported extensions', () => {
      expect(getAssetTypeFromExtension('.psd')).toBe(null);
      expect(getAssetTypeFromExtension('.obj')).toBe(null);
      expect(getAssetTypeFromExtension('')).toBe(null);
    });

    it('handles uppercase extensions', () => {
      expect(getAssetTypeFromExtension('.PNG')).toBe('2d');
      expect(getAssetTypeFromExtension('.GLB')).toBe('3d');
    });
  });

  describe('getAssetFormatFromExtension', () => {
    it('returns correct format for valid extensions', () => {
      expect(getAssetFormatFromExtension('.png')).toBe('png');
      expect(getAssetFormatFromExtension('.glb')).toBe('glb');
      expect(getAssetFormatFromExtension('.mp3')).toBe('mp3');
    });

    it('returns null for invalid extensions', () => {
      expect(getAssetFormatFromExtension('.psd')).toBe(null);
    });
  });

  describe('getCategoryFromExtension', () => {
    it('returns default category based on extension', () => {
      expect(getCategoryFromExtension('.png')).toBe('character');
      expect(getCategoryFromExtension('.jpg')).toBe('background');
      expect(getCategoryFromExtension('.glb')).toBe('model');
      expect(getCategoryFromExtension('.mp3')).toBe('audio');
    });

    it('returns item for unknown extensions', () => {
      expect(getCategoryFromExtension('.unknown')).toBe('item');
    });
  });
});

describe('Asset Type Predicates', () => {
  const create2DAsset = (): Asset => ({
    id: '1',
    projectId: 'p1',
    userId: 'u1',
    name: 'test.png',
    displayName: 'Test',
    storagePath: '/path/test.png',
    publicPath: '/public/assets/test.png',
    assetType: '2d',
    category: 'character',
    format: 'png',
    mimeType: 'image/png',
    fileSize: 1024,
    width: 64,
    height: 64,
    isSpriteSheet: false,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const create3DAsset = (): Asset => ({
    ...create2DAsset(),
    assetType: '3d',
    format: 'glb',
    mimeType: 'model/gltf-binary',
  });

  const createAudioAsset = (): Asset => ({
    ...create2DAsset(),
    assetType: 'audio',
    format: 'mp3',
    mimeType: 'audio/mpeg',
  });

  it('is2DAsset returns true for 2D assets', () => {
    expect(is2DAsset(create2DAsset())).toBe(true);
    expect(is2DAsset(create3DAsset())).toBe(false);
    expect(is2DAsset(createAudioAsset())).toBe(false);
  });

  it('is3DAsset returns true for 3D assets', () => {
    expect(is3DAsset(create3DAsset())).toBe(true);
    expect(is3DAsset(create2DAsset())).toBe(false);
    expect(is3DAsset(createAudioAsset())).toBe(false);
  });

  it('isAudioAsset returns true for audio assets', () => {
    expect(isAudioAsset(createAudioAsset())).toBe(true);
    expect(isAudioAsset(create2DAsset())).toBe(false);
    expect(isAudioAsset(create3DAsset())).toBe(false);
  });
});

describe('Asset Configuration', () => {
  it('has correct max file sizes', () => {
    // All asset types have 25MB limit per Phase 1 spec
    expect(ASSET_CONFIG.maxFileSize['2d']).toBe(25 * 1024 * 1024);
    expect(ASSET_CONFIG.maxFileSize['3d']).toBe(25 * 1024 * 1024);
    expect(ASSET_CONFIG.maxFileSize['audio']).toBe(25 * 1024 * 1024);
  });

  it('has correct MIME types', () => {
    expect(ASSET_CONFIG.mimeTypes['2d']).toContain('image/png');
    expect(ASSET_CONFIG.mimeTypes['2d']).toContain('image/jpeg');
    expect(ASSET_CONFIG.mimeTypes['3d']).toContain('model/gltf-binary');
    expect(ASSET_CONFIG.mimeTypes['audio']).toContain('audio/mpeg');
  });

  it('has correct extensions', () => {
    expect(ASSET_CONFIG.extensions['2d']).toContain('.png');
    expect(ASSET_CONFIG.extensions['3d']).toContain('.glb');
    expect(ASSET_CONFIG.extensions['audio']).toContain('.mp3');
  });
});

describe('validateAssetFile', () => {
  const createMockFile = (
    name: string,
    size: number,
    type: string
  ): File => {
    const blob = new Blob([''], { type });
    return new File([blob], name, { type });
  };

  it('validates valid PNG file', () => {
    const file = createMockFile('test.png', 1024, 'image/png');
    const result = validateAssetFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('validates valid GLB file', () => {
    const file = createMockFile('model.glb', 1024, 'model/gltf-binary');
    const result = validateAssetFile(file);
    expect(result.valid).toBe(true);
  });

  it('validates valid MP3 file', () => {
    const file = createMockFile('sound.mp3', 1024, 'audio/mpeg');
    const result = validateAssetFile(file);
    expect(result.valid).toBe(true);
  });

  it('rejects unsupported file format', () => {
    const file = createMockFile('test.psd', 1024, 'image/vnd.adobe.photoshop');
    const result = validateAssetFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported file format');
  });

  it('rejects file exceeding size limit for 2D', () => {
    // 30MB exceeds 25MB limit
    const file = createMockFile('large.png', 30 * 1024 * 1024, 'image/png');
    Object.defineProperty(file, 'size', { value: 30 * 1024 * 1024 });
    const result = validateAssetFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('File too large');
  });

  it('accepts empty MIME type if extension is valid', () => {
    const file = createMockFile('test.png', 1024, '');
    const result = validateAssetFile(file);
    expect(result.valid).toBe(true);
  });
});
