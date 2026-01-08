import { describe, it, expect, vi } from 'vitest';
import {
  formatAssetManifestForPrompt,
  formatAssetManifestCompact,
  getAssetCodeSnippet,
} from '../assetManifestService';
import type { Asset, AssetManifest } from '../../types/assets';

// Mock dependencies
vi.mock('../supabase', () => ({
  getSupabase: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            order: () => ({ data: [], error: null }),
          }),
        }),
      }),
    }),
    rpc: () => ({ data: null, error: null }),
  }),
}));

vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const createMockAsset = (overrides: Partial<Asset> = {}): Asset => ({
  id: 'asset-1',
  projectId: 'project-1',
  userId: 'user-1',
  name: 'player.png',
  displayName: 'Player',
  storagePath: '/user-1/project-1/assets/character/player.png',
  publicPath: '/public/assets/character/player.png',
  assetType: '2d',
  category: 'character',
  format: 'png',
  mimeType: 'image/png',
  fileSize: 4096,
  width: 64,
  height: 64,
  isSpriteSheet: false,
  tags: ['player', 'hero'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createMockManifest = (assets: Asset[] = []): AssetManifest => {
  const categories: AssetManifest['categories'] = {
    characters: [],
    backgrounds: [],
    ui: [],
    items: [],
    tiles: [],
    effects: [],
    models: [],
    textures: [],
    skyboxes: [],
    audio: [],
  };

  for (const asset of assets) {
    const categoryMap: Record<string, keyof typeof categories> = {
      character: 'characters',
      background: 'backgrounds',
      ui: 'ui',
      item: 'items',
      tile: 'tiles',
      effect: 'effects',
      model: 'models',
      texture: 'textures',
      skybox: 'skyboxes',
      audio: 'audio',
    };
    const key = categoryMap[asset.category];
    if (key) {
      categories[key].push(asset);
    }
  }

  return {
    projectId: 'project-1',
    assets,
    categories,
    spriteSheets: assets.filter((a) => a.isSpriteSheet),
    models3d: assets.filter((a) => a.assetType === '3d'),
    totalCount: assets.length,
    totalSize: assets.reduce((sum, a) => sum + a.fileSize, 0),
  };
};

describe('formatAssetManifestForPrompt', () => {
  it('returns empty string for empty manifest', () => {
    const manifest = createMockManifest([]);
    const result = formatAssetManifestForPrompt(manifest);
    expect(result).toBe('');
  });

  it('includes header with total count and size', () => {
    const manifest = createMockManifest([createMockAsset()]);
    const result = formatAssetManifestForPrompt(manifest);
    expect(result).toContain('## AVAILABLE GAME ASSETS');
    expect(result).toContain('Total: 1 assets');
    expect(result).toContain('4.0KB');
  });

  it('formats character assets correctly', () => {
    const manifest = createMockManifest([createMockAsset()]);
    const result = formatAssetManifestForPrompt(manifest);
    expect(result).toContain('### Characters');
    expect(result).toContain('**Player**');
    expect(result).toContain('`/public/assets/character/player.png`');
    expect(result).toContain('(64×64)');
  });

  it('formats background assets correctly', () => {
    const manifest = createMockManifest([
      createMockAsset({
        category: 'background',
        name: 'forest.jpg',
        displayName: 'Forest Background',
        publicPath: '/public/assets/background/forest.jpg',
        width: 1920,
        height: 1080,
      }),
    ]);
    const result = formatAssetManifestForPrompt(manifest);
    expect(result).toContain('### Backgrounds');
    expect(result).toContain('**Forest Background**');
    expect(result).toContain('(1920×1080)');
  });

  it('formats sprite sheets with frame info', () => {
    const manifest = createMockManifest([
      createMockAsset({
        isSpriteSheet: true,
        frameCount: 8,
        frameWidth: 32,
        frameHeight: 48,
      }),
    ]);
    const result = formatAssetManifestForPrompt(manifest);
    expect(result).toContain('[8 frames, 32×48]');
  });

  it('formats 3D models with animations', () => {
    const manifest = createMockManifest([
      createMockAsset({
        assetType: '3d',
        category: 'model',
        name: 'character.glb',
        displayName: 'Character Model',
        publicPath: '/public/assets/model/character.glb',
        format: 'glb',
        animations: ['idle', 'walk', 'run'],
      }),
    ]);
    const result = formatAssetManifestForPrompt(manifest);
    expect(result).toContain('### 3D Models');
    expect(result).toContain('[Animations: idle, walk, run]');
  });

  it('includes usage instructions', () => {
    const manifest = createMockManifest([createMockAsset()]);
    const result = formatAssetManifestForPrompt(manifest);
    expect(result).toContain('### HOW TO USE ASSETS');
    expect(result).toContain('**React/JSX:**');
    expect(result).toContain('<img src=');
    expect(result).toContain('**Canvas 2D:**');
  });

  it('includes Phaser instructions for sprite sheets', () => {
    const manifest = createMockManifest([
      createMockAsset({
        isSpriteSheet: true,
        frameCount: 8,
        frameWidth: 32,
        frameHeight: 48,
      }),
    ]);
    const result = formatAssetManifestForPrompt(manifest);
    expect(result).toContain('**Phaser 3 (Sprite Sheet):**');
    expect(result).toContain('this.load.spritesheet');
    expect(result).toContain('frameWidth');
  });

  it('includes Three.js instructions for 3D models', () => {
    const manifest = createMockManifest([
      createMockAsset({
        assetType: '3d',
        category: 'model',
        format: 'glb',
      }),
    ]);
    const result = formatAssetManifestForPrompt(manifest);
    expect(result).toContain('**Three.js / React Three Fiber:**');
    expect(result).toContain('useGLTF');
  });

  it('includes important notes section', () => {
    const manifest = createMockManifest([createMockAsset()]);
    const result = formatAssetManifestForPrompt(manifest);
    expect(result).toContain('**IMPORTANT:**');
    expect(result).toContain('Always use the exact paths');
    expect(result).toContain('Preload assets');
  });
});

describe('formatAssetManifestCompact', () => {
  it('returns empty string for empty manifest', () => {
    const manifest = createMockManifest([]);
    const result = formatAssetManifestCompact(manifest);
    expect(result).toBe('');
  });

  it('formats assets in compact form', () => {
    const manifest = createMockManifest([createMockAsset()]);
    const result = formatAssetManifestCompact(manifest);
    expect(result).toContain('ASSETS:');
    expect(result).toContain('/public/assets/character/player.png (64×64)');
  });

  it('includes sprite sheet info compactly', () => {
    const manifest = createMockManifest([
      createMockAsset({
        isSpriteSheet: true,
        frameCount: 8,
        frameWidth: 32,
        frameHeight: 48,
      }),
    ]);
    const result = formatAssetManifestCompact(manifest);
    expect(result).toContain('[sprite:8f@32×48]');
  });

  it('includes animation info compactly', () => {
    const manifest = createMockManifest([
      createMockAsset({
        assetType: '3d',
        format: 'glb',
        animations: ['idle', 'walk'],
      }),
    ]);
    const result = formatAssetManifestCompact(manifest);
    expect(result).toContain('[anims:idle,walk]');
  });
});

describe('getAssetCodeSnippet', () => {
  describe('React snippets', () => {
    it('generates img tag for 2D assets', () => {
      const asset = createMockAsset();
      const snippet = getAssetCodeSnippet(asset, 'react');
      expect(snippet).toContain('<img src="/public/assets/character/player.png"');
      expect(snippet).toContain('alt="Player"');
    });

    it('generates useGLTF for 3D assets', () => {
      const asset = createMockAsset({
        assetType: '3d',
        format: 'glb',
        publicPath: '/public/assets/model/character.glb',
      });
      const snippet = getAssetCodeSnippet(asset, 'react');
      expect(snippet).toContain("import { useGLTF } from '@react-three/drei'");
      expect(snippet).toContain("useGLTF('/public/assets/model/character.glb')");
      expect(snippet).toContain('<primitive object={scene}');
    });

    it('generates audio tag for audio assets', () => {
      const asset = createMockAsset({
        assetType: 'audio',
        format: 'mp3',
        publicPath: '/public/assets/audio/sound.mp3',
      });
      const snippet = getAssetCodeSnippet(asset, 'react');
      expect(snippet).toContain('<audio src="/public/assets/audio/sound.mp3"');
    });
  });

  describe('Canvas snippets', () => {
    it('generates Image constructor for 2D assets', () => {
      const asset = createMockAsset();
      const snippet = getAssetCodeSnippet(asset, 'canvas');
      expect(snippet).toContain('const player = new Image()');
      expect(snippet).toContain("player.src = '/public/assets/character/player.png'");
    });

    it('returns empty string for 3D assets', () => {
      const asset = createMockAsset({ assetType: '3d', format: 'glb' });
      const snippet = getAssetCodeSnippet(asset, 'canvas');
      expect(snippet).toBe('');
    });
  });

  describe('Phaser snippets', () => {
    it('generates load.image for regular images', () => {
      const asset = createMockAsset();
      const snippet = getAssetCodeSnippet(asset, 'phaser');
      expect(snippet).toContain("this.load.image('player'");
      expect(snippet).toContain("'/public/assets/character/player.png'");
    });

    it('generates load.spritesheet for sprite sheets', () => {
      const asset = createMockAsset({
        isSpriteSheet: true,
        frameWidth: 32,
        frameHeight: 48,
      });
      const snippet = getAssetCodeSnippet(asset, 'phaser');
      expect(snippet).toContain("this.load.spritesheet('player'");
      expect(snippet).toContain('frameWidth: 32');
      expect(snippet).toContain('frameHeight: 48');
    });

    it('generates load.audio for audio assets', () => {
      const asset = createMockAsset({
        assetType: 'audio',
        format: 'mp3',
        publicPath: '/public/assets/audio/sound.mp3',
      });
      const snippet = getAssetCodeSnippet(asset, 'phaser');
      expect(snippet).toContain("this.load.audio('player'");
    });
  });

  describe('Three.js snippets', () => {
    it('generates GLTFLoader for 3D assets', () => {
      const asset = createMockAsset({
        assetType: '3d',
        format: 'glb',
        publicPath: '/public/assets/model/character.glb',
      });
      const snippet = getAssetCodeSnippet(asset, 'threejs');
      expect(snippet).toContain("import { GLTFLoader }");
      expect(snippet).toContain('const loader = new GLTFLoader()');
      expect(snippet).toContain("loader.load('/public/assets/model/character.glb'");
    });

    it('generates TextureLoader for 2D assets', () => {
      const asset = createMockAsset();
      const snippet = getAssetCodeSnippet(asset, 'threejs');
      expect(snippet).toContain("import { TextureLoader }");
      expect(snippet).toContain("new TextureLoader().load('/public/assets/character/player.png')");
    });
  });
});
