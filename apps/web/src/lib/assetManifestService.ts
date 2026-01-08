/**
 * Asset Manifest Service
 *
 * Generates asset manifests for AI context injection.
 * Provides formatted asset information that helps AI understand
 * available assets and how to use them in code.
 */

import { getSupabase } from './supabase';
import { logger } from './logger';
import {
  Asset,
  AssetManifest,
  AssetCategory,
  is2DAsset,
  is3DAsset,
  isAudioAsset,
} from '../types/assets';
import { getProjectAssets } from './assetService';

const COMPONENT = 'assetManifestService';

// ============================================================================
// MANIFEST GENERATION
// ============================================================================

export async function getAssetManifest(projectId: string): Promise<AssetManifest> {
  const assets = await getProjectAssets(projectId);

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
    const categoryKey = getCategoryKey(asset.category);
    if (categoryKey && categories[categoryKey]) {
      categories[categoryKey].push(asset);
    }
  }

  const spriteSheets = assets.filter((a) => a.isSpriteSheet);
  const models3d = assets.filter((a) => is3DAsset(a));
  const totalSize = assets.reduce((sum, a) => sum + a.fileSize, 0);

  return {
    projectId,
    assets,
    categories,
    spriteSheets,
    models3d,
    totalCount: assets.length,
    totalSize,
  };
}

function getCategoryKey(
  category: AssetCategory
): keyof AssetManifest['categories'] | null {
  const mapping: Record<AssetCategory, keyof AssetManifest['categories']> = {
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
  return mapping[category] || null;
}

// ============================================================================
// AI PROMPT FORMATTING
// ============================================================================

export function formatAssetManifestForPrompt(manifest: AssetManifest): string {
  if (manifest.totalCount === 0) {
    return '';
  }

  const lines: string[] = [
    '## AVAILABLE GAME ASSETS',
    '',
    `Total: ${manifest.totalCount} assets (${formatFileSize(manifest.totalSize)})`,
    '',
  ];

  if (manifest.categories.characters.length > 0) {
    lines.push('### Characters');
    for (const asset of manifest.categories.characters) {
      lines.push(formatAssetLine(asset));
    }
    lines.push('');
  }

  if (manifest.categories.backgrounds.length > 0) {
    lines.push('### Backgrounds');
    for (const asset of manifest.categories.backgrounds) {
      lines.push(formatAssetLine(asset));
    }
    lines.push('');
  }

  if (manifest.categories.items.length > 0) {
    lines.push('### Items');
    for (const asset of manifest.categories.items) {
      lines.push(formatAssetLine(asset));
    }
    lines.push('');
  }

  if (manifest.categories.tiles.length > 0) {
    lines.push('### Tiles');
    for (const asset of manifest.categories.tiles) {
      lines.push(formatAssetLine(asset));
    }
    lines.push('');
  }

  if (manifest.categories.ui.length > 0) {
    lines.push('### UI Elements');
    for (const asset of manifest.categories.ui) {
      lines.push(formatAssetLine(asset));
    }
    lines.push('');
  }

  if (manifest.categories.effects.length > 0) {
    lines.push('### Effects');
    for (const asset of manifest.categories.effects) {
      lines.push(formatAssetLine(asset));
    }
    lines.push('');
  }

  if (manifest.models3d.length > 0) {
    lines.push('### 3D Models');
    for (const asset of manifest.models3d) {
      lines.push(formatAssetLine(asset));
    }
    lines.push('');
  }

  if (manifest.categories.textures.length > 0) {
    lines.push('### Textures');
    for (const asset of manifest.categories.textures) {
      lines.push(formatAssetLine(asset));
    }
    lines.push('');
  }

  if (manifest.categories.skyboxes.length > 0) {
    lines.push('### Skyboxes');
    for (const asset of manifest.categories.skyboxes) {
      lines.push(formatAssetLine(asset));
    }
    lines.push('');
  }

  if (manifest.categories.audio.length > 0) {
    lines.push('### Audio');
    for (const asset of manifest.categories.audio) {
      lines.push(formatAssetLine(asset));
    }
    lines.push('');
  }

  lines.push('### HOW TO USE ASSETS');
  lines.push('');
  lines.push('**React/JSX:**');
  lines.push('```jsx');
  lines.push('<img src="/assets/characters/player.png" alt="Player" />');
  lines.push('```');
  lines.push('');
  lines.push('**Canvas 2D:**');
  lines.push('```javascript');
  lines.push('const img = new Image();');
  lines.push("img.src = '/assets/characters/player.png';");
  lines.push('img.onload = () => ctx.drawImage(img, x, y);');
  lines.push('```');
  lines.push('');

  if (manifest.spriteSheets.length > 0) {
    lines.push('**Phaser 3 (Sprite Sheet):**');
    lines.push('```javascript');
    lines.push('// In preload():');
    lines.push("this.load.spritesheet('player', '/assets/characters/player.png', {");
    lines.push('  frameWidth: 32,');
    lines.push('  frameHeight: 48');
    lines.push('});');
    lines.push('```');
    lines.push('');
  }

  if (manifest.models3d.length > 0) {
    lines.push('**Three.js / React Three Fiber:**');
    lines.push('```jsx');
    lines.push("import { useGLTF } from '@react-three/drei';");
    lines.push('');
    lines.push('function Model() {');
    lines.push("  const { scene } = useGLTF('/assets/models/character.glb');");
    lines.push('  return <primitive object={scene} />;');
    lines.push('}');
    lines.push('```');
    lines.push('');
  }

  lines.push('**IMPORTANT:**');
  lines.push('1. Always use the exact paths shown above');
  lines.push('2. Preload assets before using them');
  lines.push('3. For sprite sheets, use the provided frame dimensions');

  return lines.join('\n');
}

function formatAssetLine(asset: Asset): string {
  const parts: string[] = [`- **${asset.displayName}**: \`${asset.publicPath}\``];

  if (is2DAsset(asset) && asset.width && asset.height) {
    parts.push(`(${asset.width}×${asset.height})`);
  }

  if (asset.isSpriteSheet && asset.frameCount) {
    parts.push(`[${asset.frameCount} frames, ${asset.frameWidth}×${asset.frameHeight}]`);
  }

  if (is3DAsset(asset) && asset.animations && asset.animations.length > 0) {
    parts.push(`[Animations: ${asset.animations.join(', ')}]`);
  }

  if (asset.description) {
    parts.push(`- ${asset.description}`);
  }

  return parts.join(' ');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ============================================================================
// COMPACT FORMAT (for token efficiency)
// ============================================================================

export function formatAssetManifestCompact(manifest: AssetManifest): string {
  if (manifest.totalCount === 0) {
    return '';
  }

  const lines: string[] = ['ASSETS:'];

  for (const asset of manifest.assets) {
    let line = `${asset.publicPath}`;

    if (is2DAsset(asset) && asset.width && asset.height) {
      line += ` (${asset.width}×${asset.height})`;
    }

    if (asset.isSpriteSheet && asset.frameCount) {
      line += ` [sprite:${asset.frameCount}f@${asset.frameWidth}×${asset.frameHeight}]`;
    }

    if (is3DAsset(asset) && asset.animations && asset.animations.length > 0) {
      line += ` [anims:${asset.animations.join(',')}]`;
    }

    lines.push(line);
  }

  return lines.join('\n');
}

// ============================================================================
// DATABASE FUNCTION (for server-side use)
// ============================================================================

export async function getAssetManifestFromDb(
  projectId: string
): Promise<AssetManifest | null> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase.rpc('get_project_asset_manifest', {
      p_project_id: projectId,
    });

    if (error) {
      logger.warn('Failed to get asset manifest from DB function', {
        component: COMPONENT,
        action: 'getAssetManifestFromDb',
        projectId,
        error: error.message,
      });
      return null;
    }

    return data as AssetManifest;
  } catch (err) {
    logger.error('Error calling asset manifest function', err as Error, {
      component: COMPONENT,
      action: 'getAssetManifestFromDb',
      projectId,
    });
    return null;
  }
}

// ============================================================================
// CODE SNIPPETS FOR SPECIFIC ENGINES
// ============================================================================

export function getAssetCodeSnippet(
  asset: Asset,
  engine: 'react' | 'canvas' | 'phaser' | 'threejs'
): string {
  switch (engine) {
    case 'react':
      if (is2DAsset(asset)) {
        return `<img src="${asset.publicPath}" alt="${asset.displayName}" />`;
      }
      if (is3DAsset(asset)) {
        return [
          `import { useGLTF } from '@react-three/drei';`,
          `const { scene } = useGLTF('${asset.publicPath}');`,
          `<primitive object={scene} />`,
        ].join('\n');
      }
      if (isAudioAsset(asset)) {
        return `<audio src="${asset.publicPath}" />`;
      }
      return '';

    case 'canvas':
      if (is2DAsset(asset)) {
        return [
          `const ${sanitizeVarName(asset.displayName)} = new Image();`,
          `${sanitizeVarName(asset.displayName)}.src = '${asset.publicPath}';`,
        ].join('\n');
      }
      return '';

    case 'phaser':
      if (is2DAsset(asset)) {
        const key = sanitizeVarName(asset.displayName);
        if (asset.isSpriteSheet && asset.frameWidth && asset.frameHeight) {
          return [
            `// In preload():`,
            `this.load.spritesheet('${key}', '${asset.publicPath}', {`,
            `  frameWidth: ${asset.frameWidth},`,
            `  frameHeight: ${asset.frameHeight}`,
            `});`,
          ].join('\n');
        }
        return `this.load.image('${key}', '${asset.publicPath}');`;
      }
      if (isAudioAsset(asset)) {
        const key = sanitizeVarName(asset.displayName);
        return `this.load.audio('${key}', '${asset.publicPath}');`;
      }
      return '';

    case 'threejs':
      if (is3DAsset(asset)) {
        return [
          `import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';`,
          `const loader = new GLTFLoader();`,
          `loader.load('${asset.publicPath}', (gltf) => {`,
          `  scene.add(gltf.scene);`,
          `});`,
        ].join('\n');
      }
      if (is2DAsset(asset)) {
        return [
          `import { TextureLoader } from 'three';`,
          `const texture = new TextureLoader().load('${asset.publicPath}');`,
        ].join('\n');
      }
      return '';

    default:
      return '';
  }
}

function sanitizeVarName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^[0-9]/, '_$&')
    .toLowerCase();
}
