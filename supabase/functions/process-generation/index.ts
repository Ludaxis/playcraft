import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

// =============================================================================
// PROCESS GENERATION WORKER
// =============================================================================
// This worker function processes queued AI generation jobs.
// It should be triggered by a cron job or scheduler.
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

interface GenerationJob {
  id: string;
  user_id: string;
  project_id: string | null;
  prompt: string;
  action: 'create' | 'modify' | 'fix_error';
  context: Record<string, unknown>;
  status: string;
  progress: number;
  attempts: number;
  max_attempts: number;
}

interface FileContent {
  path: string;
  content: string;
}

interface GeneratedResponse {
  message: string;
  files: FileContent[];
  explanation: string;
  needsThreeJs?: boolean;
}

// =============================================================================
// LOGGER
// =============================================================================

class Logger {
  private jobId: string;

  constructor(jobId: string) {
    this.jobId = jobId;
  }

  private log(level: string, message: string, data?: Record<string, unknown>) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'process-generation',
      jobId: this.jobId,
      message,
      ...data,
    }));
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log('error', message, data);
  }
}

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

const SYSTEM_PROMPT = `You are an expert game developer working in PlayCraft, an AI-powered game builder.
You're helping users build interactive browser games with the following tech stack:

TECH STACK:
- Vite + React 18
- TypeScript with strict mode
- Tailwind CSS for styling
- shadcn/ui components (Radix primitives)
- React Three Fiber for 3D (when needed)
- Canvas API for 2D games

PROJECT STRUCTURE (Vite + React):
\`\`\`
src/
├── main.tsx              # React entry point (DO NOT MODIFY)
├── App.tsx               # Root component with router
├── index.css             # Global styles (Tailwind)
├── pages/
│   ├── Index.tsx         # Main game page - PUT YOUR GAME HERE
│   └── NotFound.tsx      # 404 page
├── components/
│   ├── ui/               # shadcn/ui components
│   └── [feature]/        # Feature-specific components
├── hooks/
│   └── use-toast.ts      # Toast notifications
├── lib/
│   └── utils.ts          # cn() helper for classNames
└── types/
    └── index.ts          # TypeScript types
\`\`\`

CRITICAL: The main game code goes in /src/pages/Index.tsx

RESPONSE FORMAT:
Return ONLY valid JSON with this structure:
{
  "message": "Brief description of what was done",
  "files": [
    {
      "path": "/src/pages/Index.tsx",
      "content": "// Complete file content here"
    }
  ],
  "explanation": "Detailed explanation of changes and next steps",
  "needsThreeJs": false
}

IMPORTANT:
- Only include files that need to be created or modified
- Provide COMPLETE file contents, not patches
- Make sure all imports are correct
- Test that the code is syntactically valid`;

// =============================================================================
// AI GENERATION
// =============================================================================

async function callGemini(
  job: GenerationJob,
  apiKey: string,
  logger: Logger
): Promise<GeneratedResponse> {
  const startTime = Date.now();

  // Build context from job
  const context = job.context || {};
  const currentFiles = (context.currentFiles || {}) as Record<string, string>;
  const conversationHistory = (context.conversationHistory || []) as Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  const hasThreeJs = (context.hasThreeJs || false) as boolean;
  const selectedFile = context.selectedFile as string | undefined;

  // Build user prompt
  let fileContext = '';
  const importantFiles = ['/src/pages/Index.tsx', '/src/App.tsx', selectedFile];

  for (const filePath of importantFiles) {
    if (filePath && currentFiles[filePath]) {
      fileContext += `\n--- ${filePath} ---\n${currentFiles[filePath]}\n`;
    }
  }

  let conversationContext = '';
  if (conversationHistory.length > 0) {
    conversationContext = '\n\nPREVIOUS CONVERSATION:\n';
    for (const msg of conversationHistory.slice(-5)) {
      conversationContext += `${msg.role.toUpperCase()}: ${msg.content}\n`;
    }
  }

  const threeJsContext = hasThreeJs
    ? 'Three.js/React Three Fiber is ALREADY INSTALLED.'
    : 'Three.js is NOT installed yet. If this game needs 3D, set needsThreeJs: true.';

  const userPrompt = `${conversationContext}

CURRENT PROJECT FILES:
${fileContext || '(No files available - starting fresh)'}

${selectedFile ? `CURRENTLY SELECTED FILE: ${selectedFile}` : ''}

3D STATUS: ${threeJsContext}

USER REQUEST:
${job.prompt}

Generate the code changes needed. Return ONLY valid JSON with needsThreeJs boolean.`;

  // Call Gemini API with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s timeout

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 32768,
            temperature: 0.4,
            responseMimeType: 'application/json',
            // Gemini 3 Pro requires thinkingConfig - 'low' is supported (not 'minimal')
            thinkingConfig: { thinkingLevel: 'low' },
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;

    if (!response.ok) {
      logger.error('Gemini API error', {
        status: response.status,
        durationMs: duration,
      });
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!responseText) {
      throw new Error('Gemini returned empty response');
    }

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini did not return valid JSON');
      }
      parsed = JSON.parse(jsonMatch[0]);
    }

    if (!parsed.message || !Array.isArray(parsed.files)) {
      throw new Error('Response missing required fields');
    }

    logger.info('Gemini API call successful', {
      filesGenerated: parsed.files.length,
      durationMs: duration,
    });

    return {
      message: parsed.message,
      files: parsed.files,
      explanation: parsed.explanation || '',
      needsThreeJs: parsed.needsThreeJs === true,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI generation timed out after 55 seconds');
    }
    throw error;
  }
}

// =============================================================================
// JOB PROCESSING
// =============================================================================

async function processJob(
  supabase: ReturnType<typeof createClient>,
  job: GenerationJob,
  geminiApiKey: string,
  logger: Logger
): Promise<void> {
  const startTime = Date.now();

  try {
    // Update progress
    await supabase
      .from('playcraft_generation_jobs')
      .update({
        progress: 10,
        status_message: 'Preparing AI context...',
      })
      .eq('id', job.id);

    // Update progress
    await supabase
      .from('playcraft_generation_jobs')
      .update({
        progress: 30,
        status_message: 'Generating code with AI...',
      })
      .eq('id', job.id);

    // Generate code
    const result = await callGemini(job, geminiApiKey, logger);

    // Update progress
    await supabase
      .from('playcraft_generation_jobs')
      .update({
        progress: 90,
        status_message: 'Finalizing result...',
      })
      .eq('id', job.id);

    const duration = Date.now() - startTime;

    // Convert files array to Record format for result
    const filesRecord: Record<string, string> = {};
    for (const file of result.files) {
      filesRecord[file.path] = file.content;
    }

    // Mark as completed
    await supabase
      .from('playcraft_generation_jobs')
      .update({
        status: 'completed',
        progress: 100,
        status_message: 'Complete!',
        result: {
          files: filesRecord,
          message: result.message,
          explanation: result.explanation,
          needsThreeJs: result.needsThreeJs,
        },
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        model_used: 'gemini-3-pro-preview',
      })
      .eq('id', job.id);

    logger.info('Job completed successfully', {
      filesGenerated: result.files.length,
      durationMs: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Job processing failed', {
      error: errorMessage,
      attempt: job.attempts,
      maxAttempts: job.max_attempts,
      durationMs: duration,
    });

    // Determine if we should retry
    const shouldRetry = job.attempts < job.max_attempts;

    await supabase
      .from('playcraft_generation_jobs')
      .update({
        status: shouldRetry ? 'queued' : 'failed',
        progress: 0,
        status_message: shouldRetry ? 'Retrying...' : 'Failed',
        error_message: errorMessage,
        completed_at: shouldRetry ? null : new Date().toISOString(),
        duration_ms: duration,
      })
      .eq('id', job.id);

    if (shouldRetry) {
      logger.info('Job will be retried', {
        attempt: job.attempts,
        maxAttempts: job.max_attempts,
      });
    }
  }
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

Deno.serve(async (req: Request) => {
  // Only allow POST or internal invocations
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify this is an internal call (from cron or service)
  const authHeader = req.headers.get('Authorization');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!authHeader?.includes(serviceRoleKey || '')) {
    // For security, only allow service role calls
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey!, {
    auth: { persistSession: false },
  });

  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Claim a job using the database function
  const { data: job, error: claimError } = await supabase.rpc('claim_generation_job');

  if (claimError) {
    console.error('Error claiming job:', claimError);
    return new Response(JSON.stringify({ error: 'Failed to claim job', details: claimError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!job || !job.id) {
    // No jobs to process
    return new Response(JSON.stringify({ message: 'No jobs to process' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const logger = new Logger(job.id);
  logger.info('Job claimed', {
    action: job.action,
    attempt: job.attempts,
    userId: job.user_id.slice(0, 8) + '...',
  });

  // Process the job
  await processJob(supabase, job as GenerationJob, geminiApiKey, logger);

  return new Response(JSON.stringify({ processed: job.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
