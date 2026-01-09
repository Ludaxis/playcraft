import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import * as esbuild from 'npm:esbuild@0.23.1';
import { join, dirname } from 'https://deno.land/std@0.224.0/path/mod.ts';

// Basic content type mapping for manifest/uploaded files
const CONTENT_TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  js: 'application/javascript',
  mjs: 'application/javascript',
  css: 'text/css',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  mp4: 'video/mp4',
  webm: 'video/webm',
  map: 'application/json',
};

function getContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

async function sha256(text: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Buffer(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface ManifestFile {
  path: string;
  size: number;
  contentType: string;
  checksum: string;
}

interface BuildArtifacts {
  files: ManifestFile[];
  blobs: { path: string; blob: Blob; contentType: string }[];
}

async function listAllFilesRecursive(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string
): Promise<string[]> {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error || !data) return [];

  const files: string[] = [];

  for (const item of data) {
    const isFolder = item.id === null;
    if (isFolder) {
      const nested = await listAllFilesRecursive(supabase, bucket, `${prefix}/${item.name}`);
      files.push(...nested);
    } else {
      files.push(`${prefix}/${item.name}`);
    }
  }

  return files;
}

async function fetchDistArtifacts(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  projectId: string
): Promise<BuildArtifacts | null> {
  const distPrefix = `${userId}/${projectId}/dist`;
  const files = await listAllFilesRecursive(supabase, 'project-files', distPrefix);
  if (files.length === 0) return null;

  const manifestFiles: ManifestFile[] = [];
  const blobs: BuildArtifacts['blobs'] = [];

  for (const fullPath of files) {
    const relativePath = fullPath.replace(`${distPrefix}/`, '');
    const { data, error } = await supabase.storage.from('project-files').download(fullPath);
    if (error || !data) continue;

    const arrayBuffer = await data.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const contentType = getContentType(relativePath);
    const checksum = await sha256Buffer(uint8);

    manifestFiles.push({
      path: relativePath,
      size: uint8.length,
      contentType,
      checksum,
    });

    blobs.push({
      path: relativePath,
      blob: new Blob([uint8], { type: contentType }),
      contentType,
    });
  }

  return { files: manifestFiles, blobs };
}

async function downloadProjectFiles(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  projectId: string
): Promise<Record<string, Uint8Array>> {
  const prefix = `${userId}/${projectId}`;
  const files = await listAllFilesRecursive(supabase, 'project-files', prefix);
  const fileMap: Record<string, Uint8Array> = {};

  for (const path of files) {
    // Skip dist/ to avoid infinite growth
    if (path.includes('/dist/')) continue;
    const relativePath = path.replace(`${prefix}/`, '');
    const { data, error } = await supabase.storage.from('project-files').download(path);
    if (error || !data) continue;
    const arrayBuffer = await data.arrayBuffer();
    fileMap[relativePath] = new Uint8Array(arrayBuffer);
  }

  return fileMap;
}

async function writeFilesToTemp(fileMap: Record<string, Uint8Array>): Promise<{ tempDir: string; entryCandidates: string[] }> {
  const tempDir = await Deno.makeTempDir({ prefix: 'publish-build-' });
  const entryCandidates: string[] = [];

  for (const [relativePath, bytes] of Object.entries(fileMap)) {
    const fullPath = join(tempDir, relativePath);
    await Deno.mkdir(dirname(fullPath), { recursive: true });
    await Deno.writeFile(fullPath, bytes);
    entryCandidates.push(relativePath);
  }

  return { tempDir, entryCandidates };
}

function resolveEntry(entryCandidates: string[]): string | null {
  const preferred = [
    'src/main.tsx',
    'src/main.ts',
    'src/index.tsx',
    'src/index.ts',
    'main.tsx',
    'main.ts',
    'index.tsx',
    'index.ts',
  ];

  for (const candidate of preferred) {
    if (entryCandidates.includes(candidate)) return candidate;
  }

  return null;
}

async function buildProjectBundle(tempDir: string, entryRelative: string): Promise<{ outDir: string; log: string }> {
  const outDir = join(tempDir, 'out');
  let log = '';

  try {
    await esbuild.build({
      entryPoints: [join(tempDir, entryRelative)],
      outfile: join(outDir, 'main.js'),
      bundle: true,
      minify: true,
      platform: 'browser',
      format: 'esm',
      target: ['es2020'],
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.env.BASE_URL': '"./"',
      },
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx',
        '.css': 'css',
        '.json': 'json',
        '.svg': 'file',
      },
      logLevel: 'info',
      logLimit: 50,
      color: false,
      write: true,
    });
    log += 'Build succeeded via esbuild\n';
  } catch (err) {
    log += `Build failed: ${err instanceof Error ? err.message : String(err)}\n`;
    throw err;
  }

  // Create index.html to load bundle if not generated
  const htmlPath = join(outDir, 'index.html');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PlayCraft Game</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>`;
  await Deno.mkdir(dirname(htmlPath), { recursive: true });
  await Deno.writeTextFile(htmlPath, html);

  return { outDir, log };
}

async function collectArtifacts(outDir: string, projectFiles: Record<string, Uint8Array>): Promise<BuildArtifacts> {
  const blobs: BuildArtifacts['blobs'] = [];
  const files: ManifestFile[] = [];

  async function walk(dir: string, base: string) {
    for await (const entry of Deno.readDir(dir)) {
      const entryPath = join(dir, entry.name);
      const relative = entryPath.replace(`${base}/`, '');
      if (entry.isDirectory) {
        await walk(entryPath, base);
      } else {
        const data = await Deno.readFile(entryPath);
        const contentType = getContentType(relative);
        const checksum = await sha256Buffer(data);
        files.push({ path: relative, size: data.length, contentType, checksum });
        blobs.push({ path: relative, blob: new Blob([data], { type: contentType }), contentType });
      }
    }
  }

  await walk(outDir, outDir);

  // Copy public/ assets if present in project files
  for (const [path, data] of Object.entries(projectFiles)) {
    if (path.startsWith('public/')) {
      const rel = path.replace('public/', '');
      const contentType = getContentType(rel);
      const checksum = await sha256Buffer(data);
      files.push({ path: rel, size: data.length, contentType, checksum });
      blobs.push({ path: rel, blob: new Blob([data], { type: contentType }), contentType });
    }
  }

  return { files, blobs };
}

function generateSlug(gameName: string, projectId: string): string {
  let slug = gameName.toLowerCase();
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  slug = slug.substring(0, 40);
  if (!slug) slug = 'game';
  const suffix = projectId.substring(0, 6);
  return `${slug}-${suffix}`;
}

// iOS-style app icon prompt
const IOS_ICON_STYLE = [
  'iOS app icon style, symbolic abstract design',
  'bold geometric shapes, clean minimal composition',
  'smooth gradient background, no text, no borders',
  'professional glossy finish, centered focal element',
  'Apple design language, premium mobile quality',
  'single bold color palette with subtle shading',
].join(', ');

interface IconGenerationResult {
  success: boolean;
  url?: string;
  error?: string;
}

async function generateAppIcon(
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  userId: string,
  projectName: string,
  projectDescription: string | null,
  geminiApiKey: string
): Promise<IconGenerationResult> {
  // Build context-aware prompt
  const conceptParts: string[] = [];
  if (projectName) conceptParts.push(projectName);
  if (projectDescription) conceptParts.push(projectDescription);

  const conceptPrompt = conceptParts.join('. ');
  const fullPrompt = conceptPrompt
    ? `${IOS_ICON_STYLE}, game concept: ${conceptPrompt}`
    : IOS_ICON_STYLE;

  try {
    // Call Gemini Image API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();

    // Extract image from response
    let imagePart: { data: string; mimeType?: string } | null = null;
    const candidates = data.candidates || [];
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
      return { success: false, error: 'No image generated' };
    }

    // Upload to published-games bucket (public)
    const mimeType = imagePart.mimeType || 'image/png';
    const extension = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `${userId}/${projectId}/icons/app-icon-${Date.now()}.${extension}`;

    // Decode base64 to binary
    const binaryString = atob(imagePart.data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const { error: uploadError } = await supabase.storage
      .from('published-games')
      .upload(fileName, bytes, {
        upsert: true,
        contentType: mimeType,
      });

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage
      .from('published-games')
      .getPublicUrl(fileName);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Icon generation timed out' };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Publish runner
 * - Claims queued publish_jobs
 * - Downloads project files from project-files bucket
 * - Builds via esbuild to a fresh bundle
 * - Uploads artifacts + manifest to published-games bucket
 * - Updates publish_versions and project pointers
 *
 * Security: requires X-Worker-Key header to match PUBLISH_WORKER_KEY env value.
 */

interface RunnerResponse {
  success: boolean;
  jobId?: string;
  message?: string;
  error?: string;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WORKER_KEY = Deno.env.get('PUBLISH_WORKER_KEY');

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  if (WORKER_KEY) {
    const headerKey = req.headers.get('x-worker-key');
    if (!headerKey || headerKey !== WORKER_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized worker' }), { status: 401 });
    }
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const body = await req.json().catch(() => ({}));
  const jobId = body?.jobId as string | undefined;

  // Claim a job: either specified jobId or oldest queued
  const jobQuery = supabase
    .from('publish_jobs')
    .select('id, project_id, user_id, status')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1);

  const { data: jobCandidate, error: jobError } = jobId
    ? await supabase
        .from('publish_jobs')
        .select('id, project_id, user_id, status')
        .eq('id', jobId)
        .maybeSingle()
    : await jobQuery.maybeSingle();

  if (jobError) {
    console.error('publish-runner select error:', jobError);
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch job' }), { status: 500 });
  }

  if (!jobCandidate) {
    return new Response(JSON.stringify({ success: true, message: 'No queued jobs' }));
  }

  const claimedJobId = jobCandidate.id as string;

  // Mark building
  await supabase
    .from('publish_jobs')
    .update({ status: 'building', progress: 10, message: 'Building bundle...' })
    .eq('id', claimedJobId);

  // Simulated build/upload work
  const versionTag = `${Date.now()}`;
  const storagePrefix = `${jobCandidate.user_id}/${jobCandidate.project_id}/versions/${versionTag}`;
  const basePath = `${jobCandidate.user_id}/${jobCandidate.project_id}`;

  // Create publish_versions record
  const { data: version, error: versionError } = await supabase
    .from('publish_versions')
    .insert({
      project_id: jobCandidate.project_id,
      user_id: jobCandidate.user_id,
      version_tag: versionTag,
      storage_prefix: storagePrefix,
      entrypoint: 'index.html',
      is_preview: false,
    })
    .select('id')
    .single();

  if (versionError || !version) {
    console.error('publish-runner version error:', versionError);
    await supabase
      .from('publish_jobs')
      .update({ status: 'failed', progress: 0, message: 'Failed to create version' })
      .eq('id', claimedJobId);

    return new Response(JSON.stringify({ success: false, error: 'Failed to create version' }), { status: 500 });
  }

  // Start icon generation in parallel (if needed)
  let iconGenerationPromise: Promise<void> | null = null;
  const geminiImageKey = Deno.env.get('GEMINI_IMAGE_API_KEY');

  // Fetch project data to check if icon exists
  const { data: projectDataForIcon } = await supabase
    .from('playcraft_projects')
    .select('name, description, thumbnail_url')
    .eq('id', jobCandidate.project_id)
    .maybeSingle();

  const needsIcon = !projectDataForIcon?.thumbnail_url;

  if (needsIcon && geminiImageKey && projectDataForIcon) {
    console.log('[publish-runner] Starting icon generation for project:', jobCandidate.project_id);

    iconGenerationPromise = (async () => {
      try {
        const result = await generateAppIcon(
          supabase,
          jobCandidate.project_id as string,
          jobCandidate.user_id as string,
          projectDataForIcon.name || 'Game',
          projectDataForIcon.description,
          geminiImageKey
        );

        if (result.success && result.url) {
          await supabase
            .from('playcraft_projects')
            .update({ thumbnail_url: result.url })
            .eq('id', jobCandidate.project_id);

          console.log('[publish-runner] Icon generated successfully:', result.url);
        } else {
          console.warn('[publish-runner] Icon generation failed:', result.error);
        }
      } catch (err) {
        console.warn('[publish-runner] Icon generation error:', err);
      }
    })();
  }

  // Build artifacts
  let artifacts: BuildArtifacts | null = null;
  let entrypoint = 'index.html';
  let buildLog = '';

  try {
    const projectFiles = await downloadProjectFiles(
      supabase,
      jobCandidate.user_id as string,
      jobCandidate.project_id as string
    );

    if (Object.keys(projectFiles).length === 0) {
      throw new Error('No project files found to build');
    }

    const { tempDir, entryCandidates } = await writeFilesToTemp(projectFiles);
    const entry = resolveEntry(entryCandidates);
    if (!entry) {
      throw new Error('No entry file found (expected src/main.tsx or similar)');
    }

    const buildResult = await buildProjectBundle(tempDir, entry);
    buildLog += buildResult.log;
    artifacts = await collectArtifacts(buildResult.outDir, projectFiles);
    entrypoint = 'index.html';
  } catch (err) {
    buildLog += `Build failed, attempting dist fallback: ${err instanceof Error ? err.message : String(err)}\n`;
    artifacts = await fetchDistArtifacts(
      supabase,
      jobCandidate.user_id as string,
      jobCandidate.project_id as string
    );
  }

  // Final fallback placeholder if no artifacts
  if (!artifacts || artifacts.files.length === 0) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PlayCraft Publish Stub</title>
  <style>
    body { background:#0b0b10; color:#e8e8f0; font-family: system-ui, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
    .card { padding:24px 28px; border-radius:16px; border:1px solid #2a2a35; background:#13131c; box-shadow:0 12px 40px rgba(0,0,0,0.35);}
    .pill { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background:#1f1f2b; color:#8b5cf6; font-weight:600; font-size:12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="pill">PlayCraft Publish Stub</div>
    <h1 style="margin:12px 0 6px;">Deployment placeholder</h1>
    <p style="margin:0; color:#a3a3b3;">Build failed. Uploaded placeholder at ${new Date().toISOString()}.</p>
  </div>
</body>
</html>`;

    artifacts = {
      files: [{
        path: 'index.html',
        size: html.length,
        contentType: 'text/html',
        checksum: await sha256(html),
      }],
      blobs: [{
        path: 'index.html',
        blob: new Blob([html], { type: 'text/html' }),
        contentType: 'text/html',
      }],
    };
    buildLog += 'Using placeholder artifact because build output was empty.\n';
  }

  if (artifacts.files.length > 0) {
    const hasIndex = artifacts.files.some(f => f.path === 'index.html');
    if (!hasIndex && artifacts.files[0]) {
      entrypoint = artifacts.files[0].path;
    }
  }

  // Upload all artifacts to published-games bucket
  await supabase
    .from('publish_jobs')
    .update({ status: 'uploading', progress: 40, message: 'Uploading artifacts...' })
    .eq('id', claimedJobId);

  for (const file of artifacts.blobs) {
    const { error: uploadError } = await supabase.storage
      .from('published-games')
      .upload(
        `${storagePrefix}/${file.path}`,
        file.blob,
        { upsert: true, contentType: file.contentType || getContentType(file.path) }
      );

    if (uploadError) {
      console.error('publish-runner upload error:', uploadError, file.path);
    }
  }

  // Write latest.json pointer (atomic pointer for edge function)
  const latestPayload = { versionTag, path: `${storagePrefix}/${entrypoint}` };
  await supabase.storage
    .from('published-games')
    .upload(
      `${basePath}/latest.json`,
      new Blob([JSON.stringify(latestPayload)], { type: 'application/json' }),
      { upsert: true, contentType: 'application/json' }
    );

  // Upload manifest.json with file metadata
  const manifest = {
    versionTag,
    entrypoint,
    files: artifacts.files,
  };

  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestHash = await sha256(manifestJson);
  const totalSize = artifacts.files.reduce((acc, f) => acc + f.size, 0);

  const { error: manifestError } = await supabase.storage
    .from('published-games')
    .upload(
      `${storagePrefix}/manifest.json`,
      new Blob([manifestJson], { type: 'application/json' }),
      { upsert: true, contentType: 'application/json' }
    );

  if (manifestError) {
    console.error('publish-runner manifest upload error:', manifestError);
  }

  // Upload build log
  const logPath = `${basePath}/logs/${versionTag}.txt`;
  await supabase.storage
    .from('published-games')
    .upload(
      logPath,
      new Blob([buildLog || 'No build log.'], { type: 'text/plain' }),
      { upsert: true, contentType: 'text/plain' }
    );

  await supabase
    .from('publish_jobs')
    .update({
      status: 'finalizing',
      progress: 85,
      message: 'Finalizing publish...',
      log_url: supabase.storage.from('published-games').getPublicUrl(logPath).data.publicUrl,
    })
    .eq('id', claimedJobId);

  // Update publish_versions with checksum/size
  await supabase
    .from('publish_versions')
    .update({
      checksum: manifestHash,
      size_bytes: totalSize,
      entrypoint,
    })
    .eq('id', version.id);

  // Update project pointer and published metadata
  const { data: projectRow } = await supabase
    .from('playcraft_projects')
    .select('name, slug')
    .eq('id', jobCandidate.project_id)
    .maybeSingle();

  const slug = projectRow?.slug || generateSlug(projectRow?.name || 'game', jobCandidate.project_id as string);
  const subdomainUrl = `https://${slug}.playcraft.games`;
  const publishedUrl = subdomainUrl;

  await supabase
    .from('playcraft_projects')
    .update({
      primary_version_id: version.id,
      slug,
      subdomain_url: subdomainUrl,
      published_url: publishedUrl,
      published_at: new Date().toISOString(),
      status: 'published',
    })
    .eq('id', jobCandidate.project_id);

  // Wait for icon generation to complete (non-blocking - failures are ignored)
  if (iconGenerationPromise) {
    await iconGenerationPromise.catch(() => {
      // Silently ignore - icon failure shouldn't affect publish
    });
  }

  // Mark job complete
  await supabase
    .from('publish_jobs')
    .update({
      status: 'published',
      progress: 100,
      message: 'Published',
      version_id: version.id,
      log_url: supabase.storage.from('published-games').getPublicUrl(logPath).data.publicUrl,
    })
    .eq('id', claimedJobId);

  const response: RunnerResponse = {
    success: true,
    jobId: claimedJobId,
    message: 'Job published',
  };

  return new Response(JSON.stringify(response), { status: 200 });
});
