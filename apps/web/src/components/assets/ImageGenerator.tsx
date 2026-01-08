/**
 * ImageGenerator Component
 *
 * AI-powered image generation for game assets.
 * Generates sprites, backgrounds, items, and effects with various styles.
 */

import { useState, useCallback } from 'react';
import { Sparkles, Wand2, Download, Plus, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../../lib/utils';
import {
  generateImage,
  getStyleOptions,
  getCategoryOptions,
  getPromptSuggestions,
  type ImageStyle,
  type GenerationProgress,
} from '../../lib/imageGenerationService';
import type { AssetCategory, Asset } from '../../types/assets';

interface ImageGeneratorProps {
  projectId: string;
  userId: string;
  onAssetCreated?: (asset: Asset) => void;
  onImageGenerated?: (imageBase64: string, mimeType: string) => void;
}

export function ImageGenerator({
  projectId,
  userId,
  onAssetCreated,
  onImageGenerated,
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ImageStyle>('pixel-art');
  const [category, setCategory] = useState<AssetCategory>('character');
  const [progress, setProgress] = useState<GenerationProgress>({
    status: 'idle',
    message: '',
    progress: 0,
  });
  const [generatedImage, setGeneratedImage] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styleOptions = getStyleOptions();
  const categoryOptions = getCategoryOptions();
  const suggestions = getPromptSuggestions(category);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setError(null);
    setGeneratedImage(null);

    const result = await generateImage(
      {
        prompt: prompt.trim(),
        style,
        category,
        autoUpload: false,
        projectId,
        userId,
      },
      setProgress
    );

    if (result.success && result.imageBase64 && result.mimeType) {
      setGeneratedImage({
        base64: result.imageBase64,
        mimeType: result.mimeType,
      });
      onImageGenerated?.(result.imageBase64, result.mimeType);
    } else {
      setError(result.error || 'Failed to generate image');
    }
  }, [prompt, style, category, projectId, userId, onImageGenerated]);

  const handleSaveToAssets = useCallback(async () => {
    if (!generatedImage) return;

    setProgress({
      status: 'uploading',
      message: 'Saving to project assets...',
      progress: 50,
    });

    const result = await generateImage(
      {
        prompt: prompt.trim(),
        style,
        category,
        autoUpload: true,
        projectId,
        userId,
      },
      (p) => {
        if (p.status === 'uploading' || p.status === 'complete') {
          setProgress(p);
        }
      }
    );

    if (result.success && result.asset) {
      onAssetCreated?.(result.asset);
      setGeneratedImage(null);
      setPrompt('');
      setProgress({ status: 'idle', message: '', progress: 0 });
    } else {
      setError(result.error || 'Failed to save image');
      setProgress({ status: 'error', message: result.error || 'Error', progress: 0 });
    }
  }, [generatedImage, prompt, style, category, projectId, userId, onAssetCreated]);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = `data:${generatedImage.mimeType};base64,${generatedImage.base64}`;
    link.download = `${prompt.slice(0, 30).replace(/\s+/g, '-')}.png`;
    link.click();
  }, [generatedImage, prompt]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setPrompt(suggestion);
  }, []);

  const isGenerating = progress.status === 'generating' || progress.status === 'uploading';

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="text-sm font-semibold text-content">AI Image Generator</h3>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="prompt">Describe your image</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A brave knight with silver armor..."
            rows={3}
            disabled={isGenerating}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="style">Style</Label>
            <Select
              value={style}
              onValueChange={(v) => setStyle(v as ImageStyle)}
              disabled={isGenerating}
            >
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as AssetCategory)}
              disabled={isGenerating}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isGenerating}
                className="rounded-full bg-surface-overlay px-3 py-1 text-xs text-content-muted transition-colors hover:bg-surface-elevated hover:text-content disabled:opacity-50"
              >
                {suggestion.slice(0, 25)}...
              </button>
            ))}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {progress.message || 'Generating...'}
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Image
            </>
          )}
        </Button>

        {isGenerating && (
          <Progress value={progress.progress} className="h-2" />
        )}

        {error && (
          <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
            {error}
          </div>
        )}
      </div>

      {generatedImage && (
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-lg border border-border-muted bg-surface-overlay">
            <img
              src={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`}
              alt="Generated image"
              className="h-auto w-full object-contain"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveToAssets}
              disabled={isGenerating}
              className="flex-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Save to Assets
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isGenerating}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
