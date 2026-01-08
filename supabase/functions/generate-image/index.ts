import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

// CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'https://playcraft.app',
  'https://www.playcraft.app',
  'https://playcraft.vercel.app',
];

const ALLOWED_PREVIEW_PATTERN = /^https:\/\/playcraft-[a-z0-9-]+\.vercel\.app$/;

function getCorsHeaders(origin: string | null): Record<string, string> {
  let allowedOrigin = ALLOWED_ORIGINS[0];

  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      allowedOrigin = origin;
    } else if (ALLOWED_PREVIEW_PATTERN.test(origin)) {
      allowedOrigin = origin;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey',
    'Access-Control-Max-Age': '86400',
  };
}

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
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

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

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Image generation API not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Gemini Imagen API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      // Use Imagen 3 via Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: enhancedPrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: aspectRatio,
              personGeneration: 'allow_adult',
              safetyFilterLevel: 'block_few',
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Imagen API error:', response.status, errorText);

        // Fallback to Gemini text model for image description if Imagen fails
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
      const prediction = data.predictions?.[0];
      if (!prediction?.bytesBase64Encoded) {
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
        imageBase64: prediction.bytesBase64Encoded,
        mimeType: prediction.mimeType || 'image/png',
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
