/**
 * Image Generation Service
 *
 * Generates game assets (sprites, backgrounds, items) using AI.
 * Integrates with the asset system for automatic upload and management.
 */

import { getSupabase } from './supabase';
import { uploadAsset } from './assetService';
import { getProjectIconContext } from './iconContextService';
import type { Asset, AssetCategory, CreateAssetInput } from '../types/assets';
import { updateProject } from './projectService';

export type ImageStyle = 'pixel-art' | 'cartoon' | 'realistic' | 'anime' | 'fantasy';
export type ImageAspectRatio = '1:1' | '16:9' | '9:16';

export interface GenerateImageOptions {
  prompt: string;
  style?: ImageStyle;
  category?: AssetCategory;
  aspectRatio?: ImageAspectRatio;
  autoUpload?: boolean;
  projectId?: string;
  userId?: string;
}

export interface GenerateImageResult {
  success: boolean;
  imageBase64?: string;
  imageBlob?: Blob;
  mimeType?: string;
  asset?: Asset;
  error?: string;
}

export interface GenerateIconResult {
  success: boolean;
  url?: string;
  asset?: Asset;
  error?: string;
}

export interface GenerationProgress {
  status: 'idle' | 'generating' | 'uploading' | 'complete' | 'error';
  message: string;
  progress: number;
}

const STYLE_LABELS: Record<ImageStyle, string> = {
  'pixel-art': 'Pixel Art',
  'cartoon': 'Cartoon',
  'realistic': 'Realistic',
  'anime': 'Anime',
  'fantasy': 'Fantasy',
};

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  character: 'Character',
  background: 'Background',
  ui: 'UI Element',
  item: 'Item',
  tile: 'Tile',
  effect: 'Effect',
  model: '3D Model',
  texture: 'Texture',
  skybox: 'Skybox',
  audio: 'Audio',
};

export function getStyleOptions(): Array<{ value: ImageStyle; label: string }> {
  return Object.entries(STYLE_LABELS).map(([value, label]) => ({
    value: value as ImageStyle,
    label,
  }));
}

export function getCategoryOptions(): Array<{ value: AssetCategory; label: string }> {
  return Object.entries(CATEGORY_LABELS)
    .filter(([value]) => !['model', 'texture', 'skybox', 'audio'].includes(value))
    .map(([value, label]) => ({
      value: value as AssetCategory,
      label,
    }));
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function generateAssetName(prompt: string, style: ImageStyle): string {
  const cleanPrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('-');

  const timestamp = Date.now().toString(36);
  return `${cleanPrompt}-${style}-${timestamp}.png`;
}

function buildIconPrompt(userPrompt: string) {
  return [
    'iOS app icon style, symbolic abstract design',
    'bold geometric shapes, clean minimal composition',
    'smooth gradient background, no text, no borders',
    'professional glossy finish, centered focal element',
    'Apple design language, premium mobile quality',
    'single bold color palette with subtle shading',
    userPrompt,
  ]
    .filter(Boolean)
    .join(', ');
}

export async function generateImage(
  options: GenerateImageOptions,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GenerateImageResult> {
  const {
    prompt,
    style = 'pixel-art',
    category = 'character',
    aspectRatio = '1:1',
    autoUpload = false,
    projectId,
    userId,
  } = options;

  try {
    onProgress?.({
      status: 'generating',
      message: 'Generating image with AI...',
      progress: 10,
    });

    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await supabase.functions.invoke('generate-image', {
      body: {
        prompt,
        style,
        category,
        aspectRatio,
        projectId,
      },
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    const data = response.data;
    if (!data.success || !data.imageBase64) {
      return { success: false, error: data.error || 'No image generated' };
    }

    onProgress?.({
      status: 'generating',
      message: 'Image generated successfully',
      progress: 70,
    });

    const mimeType = data.mimeType || 'image/png';
    const imageBlob = base64ToBlob(data.imageBase64, mimeType);

    const result: GenerateImageResult = {
      success: true,
      imageBase64: data.imageBase64,
      imageBlob,
      mimeType,
    };

    // Auto-upload to project assets if requested
    if (autoUpload && projectId && userId) {
      onProgress?.({
        status: 'uploading',
        message: 'Saving to project assets...',
        progress: 85,
      });

      const fileName = generateAssetName(prompt, style);
      const file = new File([imageBlob], fileName, { type: mimeType });

      const assetInput: CreateAssetInput = {
        name: fileName,
        displayName: prompt.slice(0, 50),
        assetType: '2d',
        category,
        description: `AI-generated: ${prompt}`,
        tags: [style, 'ai-generated'],
      };

      try {
        const asset = await uploadAsset(userId, projectId, file, assetInput);
        result.asset = asset;
      } catch (uploadError) {
        console.error('Failed to auto-upload generated image:', uploadError);
      }
    }

    onProgress?.({
      status: 'complete',
      message: 'Complete!',
      progress: 100,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onProgress?.({
      status: 'error',
      message: errorMessage,
      progress: 0,
    });
    return { success: false, error: errorMessage };
  }
}

export async function generateProjectIcon(
  projectId: string,
  userId: string,
  prompt: string
): Promise<GenerateIconResult> {
  const iconPrompt = buildIconPrompt(prompt);

  const result = await generateImage({
    prompt: iconPrompt,
    style: 'realistic',
    category: 'ui',
    aspectRatio: '1:1',
    projectId,
    userId,
  });

  if (!result.success || !result.imageBlob || !result.mimeType) {
    return { success: false, error: result.error || 'Icon generation failed' };
  }

  const fileName = `app-icon-${Date.now()}.png`;
  const file = new File([result.imageBlob], fileName, { type: result.mimeType });

  try {
    const assetInput: CreateAssetInput = {
      name: fileName,
      displayName: 'App Icon',
      assetType: '2d',
      category: 'ui',
      description: `App icon generated from prompt: ${prompt}`,
      tags: ['app-icon', 'generated'],
    };

    const asset = await uploadAsset(userId, projectId, file, assetInput);
    const url = asset.previewUrl || asset.publicPath;

    if (url) {
      await updateProject(projectId, { thumbnail_url: url });
    }

    return { success: true, url: url || undefined, asset };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return { success: false, error: message };
  }
}

export async function generateProjectIconFromContext(
  projectId: string,
  userId: string
): Promise<GenerateIconResult> {
  try {
    const { prompt } = await getProjectIconContext(projectId);
    const resolvedPrompt = prompt || 'Isometric game app icon';
    return generateProjectIcon(projectId, userId, resolvedPrompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Icon generation failed';
    return { success: false, error: message };
  }
}

export async function generateMultipleImages(
  prompts: string[],
  options: Omit<GenerateImageOptions, 'prompt'>,
  onProgress?: (index: number, total: number, result: GenerateImageResult) => void
): Promise<GenerateImageResult[]> {
  const results: GenerateImageResult[] = [];

  for (let i = 0; i < prompts.length; i++) {
    const result = await generateImage({ ...options, prompt: prompts[i] });
    results.push(result);
    onProgress?.(i + 1, prompts.length, result);

    // Small delay between requests to avoid rate limiting
    if (i < prompts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export function getPromptSuggestions(category: AssetCategory): string[] {
  const suggestions: Record<AssetCategory, string[]> = {
    character: [
      'A brave knight with silver armor and sword',
      'Cute slime monster enemy',
      'Wizard with purple robes casting a spell',
      'Ninja character in black outfit',
      'Robot companion with friendly expression',
    ],
    background: [
      'Fantasy forest with glowing mushrooms',
      'Medieval castle courtyard at sunset',
      'Space station interior with control panels',
      'Underwater coral reef scene',
      'Snowy mountain village',
    ],
    item: [
      'Golden treasure chest',
      'Health potion in glass bottle',
      'Ancient magical sword',
      'Power-up star collectible',
      'Key with ornate design',
    ],
    ui: [
      'Wooden game button with carved text',
      'Health bar with heart icon',
      'Inventory slot frame',
      'Dialog box with fantasy border',
      'Mini-map frame',
    ],
    tile: [
      'Grass tile with small flowers',
      'Stone brick floor tile',
      'Water surface tile',
      'Wooden platform tile',
      'Lava tile with glow effect',
    ],
    effect: [
      'Magic sparkle particles',
      'Explosion effect animation',
      'Healing aura glow',
      'Fire flames effect',
      'Electric shock effect',
    ],
    model: [],
    texture: [],
    skybox: [],
    audio: [],
  };

  return suggestions[category] || [];
}
