/**
 * Generate icons for published games that don't have thumbnails
 * Run with: npx tsx scripts/generate-missing-icons.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tbmodwkwqierftffbfdi.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_IMAGE_API_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_IMAGE_API_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const IOS_ICON_STYLE = [
  'iOS app icon style, symbolic abstract design',
  'bold geometric shapes, clean minimal composition',
  'smooth gradient background, no text, no borders',
  'professional glossy finish, centered focal element',
  'Apple design language, premium mobile quality',
  'single bold color palette with subtle shading',
].join(', ');

async function generateIcon(projectId: string, userId: string, name: string, description: string | null): Promise<string | null> {
  const conceptParts: string[] = [];
  if (name) conceptParts.push(name);
  if (description) conceptParts.push(description);

  const conceptPrompt = conceptParts.join('. ');
  const fullPrompt = conceptPrompt
    ? `${IOS_ICON_STYLE}, game concept: ${conceptPrompt}`
    : IOS_ICON_STYLE;

  console.log(`  Generating icon for "${name}"...`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
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
      console.error(`  API error: ${response.status}`, errorText.substring(0, 200));
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
      console.error('  No image in response');
      return null;
    }

    // Upload to storage
    const fileName = `${userId}/${projectId}/icons/app-icon-${Date.now()}.png`;
    const buffer = Buffer.from(imageData, 'base64');

    const { error: uploadError } = await supabase.storage
      .from('published-games')
      .upload(fileName, buffer, {
        upsert: true,
        contentType: 'image/png',
      });

    if (uploadError) {
      console.error('  Upload error:', uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('published-games')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('  Error:', error);
    return null;
  }
}

async function main() {
  console.log('Finding published games without icons...\n');

  const { data: games, error } = await supabase
    .from('playcraft_projects')
    .select('id, name, description, user_id')
    .eq('status', 'published')
    .is('thumbnail_url', null);

  if (error) {
    console.error('Query error:', error);
    process.exit(1);
  }

  if (!games || games.length === 0) {
    console.log('No games without icons found.');
    return;
  }

  console.log(`Found ${games.length} games without icons:\n`);

  for (const game of games) {
    console.log(`Processing: ${game.name} (${game.id})`);

    const iconUrl = await generateIcon(game.id, game.user_id, game.name, game.description);

    if (iconUrl) {
      // Update the project with the icon URL
      const { error: updateError } = await supabase
        .from('playcraft_projects')
        .update({ thumbnail_url: iconUrl })
        .eq('id', game.id);

      if (updateError) {
        console.error(`  Failed to update: ${updateError.message}`);
      } else {
        console.log(`  ✓ Icon saved: ${iconUrl}\n`);
      }
    } else {
      console.log(`  ✗ Failed to generate icon\n`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\nDone!');
}

main();
