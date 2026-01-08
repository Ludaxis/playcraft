import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

// CORS headers - mirror the request origin for allowed domains
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey',
  'Access-Control-Max-Age': '86400',
};

interface ImageGenerationRequest {
  prompt: string;
  style?: 'pixel-art' | 'cartoon' | 'realistic' | 'anime' | 'fantasy';
  category?: 'character' | 'background' | 'item' | 'ui' | 'tile' | 'effect';
  size?: '256' | '512' | '1024';
  aspectRatio?: '1:1' | '16:9' | '9:16';
  projectId?: string;
}

interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
}

const STYLE_PROMPTS: Record<string, string> = {
  'pixel-art': 'pixel art style, 8-bit retro game graphics, crisp pixels, limited color palette',
  'cartoon': 'cartoon style, bold outlines, vibrant colors, cel-shaded, game art',
  'realistic': 'realistic digital art, detailed textures, professional game asset',
  'anime': 'anime style, Japanese game art, vibrant colors, expressive',
  'fantasy': 'fantasy art style, magical, epic game graphics, detailed illustration',
};

const CATEGORY_PROMPTS: Record<string, string> = {
  'character': 'game character sprite, full body, transparent background, suitable for 2D game',
  'background': 'game background, seamless where appropriate, atmospheric, high quality',
  'item': 'game item icon, centered, transparent background, clean design',
  'ui': 'game UI element, clean design, transparent background, modern look',
  'tile': 'game tileset piece, seamless edges, suitable for tiling, consistent style',
  'effect': 'game visual effect, particle or magic effect, transparent background',
};

function buildImagePrompt(
  userPrompt: string,
  style?: string,
  category?: string
): string {
  const parts: string[] = [];

  // Base prompt
  parts.push(userPrompt);

  // Add style
  if (style && STYLE_PROMPTS[style]) {
    parts.push(STYLE_PROMPTS[style]);
  }

  // Add category context
  if (category && CATEGORY_PROMPTS[category]) {
    parts.push(CATEGORY_PROMPTS[category]);
  }

  // Game-specific quality prompts
  parts.push('high quality, game-ready asset, clean edges');

  return parts.join(', ');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    const {
      prompt,
      style = 'pixel-art',
      category = 'character',
      size = '512',
      aspectRatio = '1:1',
    }: ImageGenerationRequest = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build enhanced prompt for game assets
    const enhancedPrompt = buildImagePrompt(prompt, style, category);
    const allowedAspectRatios = ['1:1', '16:9', '9:16'];
    const resolvedAspectRatio = allowedAspectRatios.includes(aspectRatio)
      ? aspectRatio
      : '1:1';
    const sizeToImageSize: Record<string, '1K' | '2K' | '4K'> = {
      '256': '1K',
      '512': '1K',
      '1024': '1K',
    };
    const resolvedImageSize = sizeToImageSize[size] || '1K';

    // Get Gemini Image API key (separate from code generation key)
    const geminiApiKey = Deno.env.get('GEMINI_IMAGE_API_KEY');
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Image generation API not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Gemini 3 Pro Image Preview API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: enhancedPrompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: resolvedAspectRatio,
            imageSize: resolvedImageSize,
          },
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini image API error:', response.status, errorText);

        return new Response(
          JSON.stringify({
            success: false,
            error: `Image generation failed: ${response.status}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const data = await response.json();

      // Extract image from response
      const candidates = data.candidates || [];
      let imagePart: { data: string; mimeType?: string } | null = null;

      for (const candidate of candidates) {
        const parts = candidate?.content?.parts || [];
        for (const part of parts) {
          if (part?.inlineData?.data) {
            imagePart = {
              data: part.inlineData.data as string,
              mimeType: part.inlineData.mimeType as string | undefined,
            };
            break;
          }
        }
        if (imagePart) break;
      }

      if (!imagePart) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No image generated',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const result: ImageGenerationResponse = {
        success: true,
        imageBase64: imagePart.data,
        mimeType: imagePart.mimeType || 'image/png',
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === 'AbortError') {
        return new Response(
          JSON.stringify({ success: false, error: 'Request timed out' }),
          {
            status: 504,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
