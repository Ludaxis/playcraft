/**
 * One-time function to generate icons for published games without thumbnails
 * Invoke: curl -X POST https://tbmodwkwqierftffbfdi.supabase.co/functions/v1/generate-missing-icons
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const IOS_ICON_STYLE = [
  'iOS app icon style, symbolic abstract design',
  'bold geometric shapes, clean minimal composition',
  'smooth gradient background, no text, no borders',
  'professional glossy finish, centered focal element',
  'Apple design language, premium mobile quality',
  'single bold color palette with subtle shading',
].join(', ');

async function generateIcon(
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  userId: string,
  name: string,
  description: string | null,
  geminiApiKey: string
): Promise<string | null> {
  const conceptParts: string[] = [];
  if (name) conceptParts.push(name);
  if (description) conceptParts.push(description);

  const conceptPrompt = conceptParts.join('. ');
  const fullPrompt = conceptPrompt
    ? `${IOS_ICON_STYLE}, game concept: ${conceptPrompt}`
    : IOS_ICON_STYLE;

  console.log(`Generating icon for "${name}"...`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status}`, errorText.substring(0, 200));
      return null;
    }

    const data = await response.json();

    // Extract image from response
    let imageData: string | null = null;
    const candidates = data.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate?.content?.parts || [];
      for (const part of parts) {
        if (part?.inlineData?.data) {
          imageData = part.inlineData.data as string;
          break;
        }
      }
      if (imageData) break;
    }

    if (!imageData) {
      console.error('No image in response');
      return null;
    }

    // Upload to storage
    const fileName = `${userId}/${projectId}/icons/app-icon-${Date.now()}.png`;

    // Decode base64 to binary
    const binaryString = atob(imageData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const { error: uploadError } = await supabase.storage
      .from('published-games')
      .upload(fileName, bytes, {
        upsert: true,
        contentType: 'image/png',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('published-games')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const geminiApiKey = Deno.env.get('GEMINI_IMAGE_API_KEY');

  if (!geminiApiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_IMAGE_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Finding published games without icons...');

  const { data: games, error } = await supabase
    .from('playcraft_projects')
    .select('id, name, description, user_id')
    .eq('status', 'published')
    .is('thumbnail_url', null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!games || games.length === 0) {
    return new Response(JSON.stringify({ message: 'No games without icons found', count: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`Found ${games.length} games without icons`);

  const results: Array<{ id: string; name: string; success: boolean; url?: string }> = [];

  for (const game of games) {
    console.log(`Processing: ${game.name}`);

    const iconUrl = await generateIcon(
      supabase,
      game.id,
      game.user_id,
      game.name,
      game.description,
      geminiApiKey
    );

    if (iconUrl) {
      const { error: updateError } = await supabase
        .from('playcraft_projects')
        .update({ thumbnail_url: iconUrl })
        .eq('id', game.id);

      if (updateError) {
        console.error(`Failed to update: ${updateError.message}`);
        results.push({ id: game.id, name: game.name, success: false });
      } else {
        console.log(`✓ Icon saved: ${iconUrl}`);
        results.push({ id: game.id, name: game.name, success: true, url: iconUrl });
      }
    } else {
      results.push({ id: game.id, name: game.name, success: false });
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const successCount = results.filter(r => r.success).length;

  return new Response(JSON.stringify({
    message: `Generated ${successCount}/${games.length} icons`,
    results,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
