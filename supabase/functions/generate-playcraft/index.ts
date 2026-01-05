import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.57.4';

// =============================================================================
// SECURITY CONFIGURATION
// =============================================================================

// Allowed origins for CORS - STRICT whitelist only
// DO NOT allow wildcard patterns for production security
const ALLOWED_ORIGINS = [
  // Local development
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  // Production domains
  'https://playcraft.app',
  'https://www.playcraft.app',
  // Vercel production deployment (specific subdomain only)
  'https://playcraft.vercel.app',
];

// Preview deployments allowed pattern (Vercel preview URLs)
// Only allow playcraft-* prefixed preview deployments
const ALLOWED_PREVIEW_PATTERN = /^https:\/\/playcraft-[a-z0-9-]+\.vercel\.app$/;

// Rate limiting configuration (enforced via database)
const RATE_LIMIT = {
  MAX_TOKENS_PER_REQUEST: 32768,
  MAX_PROMPT_LENGTH: 10000, // Characters
};

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Check if origin is in strict whitelist
  let allowedOrigin = ALLOWED_ORIGINS[0]; // Default to first allowed origin

  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      allowedOrigin = origin;
    } else if (ALLOWED_PREVIEW_PATTERN.test(origin)) {
      // Allow only playcraft-prefixed Vercel preview deployments
      allowedOrigin = origin;
    }
    // Otherwise, fall back to default (won't match, request will fail CORS)
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey, Apikey',
    'Access-Control-Max-Age': '86400',
  };
}

// =============================================================================
// RATE LIMITING (Database-backed for persistence across instances)
// =============================================================================

interface RateLimitResult {
  allowed: boolean;
  minuteRemaining: number;
  hourlyRemaining: number;
  dailyRemaining: number;
  retryAfter: number;
  error?: string;
}

interface CreditCheckResult {
  hasCredits: boolean;
  dailyRequestsRemaining: number;
  monthlyRequestsRemaining: number;
  error?: string;
}

async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<RateLimitResult> {
  try {
    // Use database function for atomic rate limit check
    const { data, error } = await supabase.rpc('check_and_increment_rate_limit', {
      p_user_id: userId,
      p_endpoint: 'generate',
    });

    if (error) {
      console.error('[rate-limit] Database error:', error.message);
      // Fail open but log - we don't want to block users on DB issues
      // In production, consider fail-closed with alerting
      return {
        allowed: true,
        minuteRemaining: 10,
        hourlyRemaining: 100,
        dailyRemaining: 500,
        retryAfter: 0,
      };
    }

    const result = data?.[0];
    if (!result) {
      console.warn('[rate-limit] No result from rate limit check');
      return {
        allowed: true,
        minuteRemaining: 10,
        hourlyRemaining: 100,
        dailyRemaining: 500,
        retryAfter: 0,
      };
    }

    if (!result.allowed) {
      const limitType = result.minute_remaining === 0 ? 'minute' :
                       result.hourly_remaining === 0 ? 'hourly' : 'daily';
      return {
        allowed: false,
        minuteRemaining: result.minute_remaining,
        hourlyRemaining: result.hourly_remaining,
        dailyRemaining: result.daily_remaining,
        retryAfter: result.retry_after_seconds,
        error: `Rate limit exceeded (${limitType}). Please try again later.`,
      };
    }

    return {
      allowed: true,
      minuteRemaining: result.minute_remaining,
      hourlyRemaining: result.hourly_remaining,
      dailyRemaining: result.daily_remaining,
      retryAfter: 0,
    };
  } catch (e) {
    console.error('[rate-limit] Exception:', e);
    // Fail open on unexpected errors
    return {
      allowed: true,
      minuteRemaining: 10,
      hourlyRemaining: 100,
      dailyRemaining: 500,
      retryAfter: 0,
    };
  }
}

async function checkUserCredits(
  supabase: SupabaseClient,
  userId: string
): Promise<CreditCheckResult> {
  try {
    const { data, error } = await supabase.rpc('check_user_credits', {
      p_user_id: userId,
    });

    if (error) {
      console.error('[credits] Database error:', error.message);
      // Fail open but log
      return { hasCredits: true, dailyRequestsRemaining: 100, monthlyRequestsRemaining: 2000 };
    }

    const result = data?.[0];
    if (!result) {
      return { hasCredits: true, dailyRequestsRemaining: 100, monthlyRequestsRemaining: 2000 };
    }

    if (!result.has_credits) {
      return {
        hasCredits: false,
        dailyRequestsRemaining: result.daily_requests_remaining,
        monthlyRequestsRemaining: result.monthly_requests_remaining,
        error: result.daily_requests_remaining === 0
          ? 'Daily request limit reached. Resets at midnight UTC.'
          : 'Monthly request limit reached. Please upgrade your plan.',
      };
    }

    return {
      hasCredits: true,
      dailyRequestsRemaining: result.daily_requests_remaining,
      monthlyRequestsRemaining: result.monthly_requests_remaining,
    };
  } catch (e) {
    console.error('[credits] Exception:', e);
    return { hasCredits: true, dailyRequestsRemaining: 100, monthlyRequestsRemaining: 2000 };
  }
}

async function recordUsage(
  supabase: SupabaseClient,
  userId: string,
  tokensUsed: number
): Promise<void> {
  try {
    await supabase.rpc('record_usage', {
      p_user_id: userId,
      p_tokens_used: tokensUsed,
    });
  } catch (e) {
    console.error('[usage] Failed to record usage:', e);
    // Non-blocking - don't fail the request if usage tracking fails
  }
}

// =============================================================================
// LOGGING UTILITIES (Sanitized)
// =============================================================================

function sanitizeForLogging(text: string, maxLength: number = 50): string {
  // Truncate and remove potential sensitive data
  const sanitized = text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD]')
    .replace(/password\s*[:=]\s*\S+/gi, 'password:[REDACTED]')
    .replace(/api[_-]?key\s*[:=]\s*\S+/gi, 'apikey:[REDACTED]')
    .replace(/token\s*[:=]\s*\S+/gi, 'token:[REDACTED]')
    .slice(0, maxLength);

  return sanitized + (text.length > maxLength ? '...' : '');
}

function hashUserId(userId: string): string {
  // Simple hash for logging (not cryptographic, just for privacy)
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).slice(0, 8);
}

interface FileContent {
  path: string;
  content: string;
}

// Legacy request format
interface GenerateRequest {
  prompt: string;
  currentFiles?: Record<string, string>; // Current project files
  selectedFile?: string; // Currently selected file path
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  hasThreeJs?: boolean; // Whether Three.js is already installed
  isFirstPrompt?: boolean; // Is this the first prompt (need to determine template)?
  templateId?: string; // Which template is being used (e.g., 'vite-game-shell')
}

// New context-aware request format
interface ContextAwareRequest extends GenerateRequest {
  projectId?: string;
  useSmartContext?: boolean;
  contextPackage?: {
    projectMemory: {
      project_summary: string | null;
      game_type: string | null;
      tech_stack: string[];
      completed_tasks: Array<{ task: string; timestamp: string }>;
      file_importance: Record<string, number>;
      key_entities: Array<{ name: string; type: string; file: string }>;
    } | null;
    conversationSummaries: string[];
    recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
    relevantFiles: Array<{
      path: string;
      content: string;
      relevanceScore: number;
      relevanceReason: string;
    }>;
    changedSinceLastRequest: string[];
    fileTree: string[];
    estimatedTokens: number;
  };
}

interface GeneratedResponse {
  message: string;
  files: FileContent[];
  explanation: string;
  needsThreeJs?: boolean; // Signal to add Three.js template
}

const SYSTEM_PROMPT = `You are an expert game developer working in PlayCraft, an AI-powered game builder.
You're helping users build interactive browser games with the following tech stack:

TECH STACK:
- Vite + React 18
- TypeScript with strict mode
- Tailwind CSS for styling
- shadcn/ui components (Radix primitives)
- React Three Fiber for 3D (when needed)
- Canvas API for 2D games

3D DETECTION:
Analyze the user's request carefully. Set "needsThreeJs": true if ANY of these apply:
- User mentions: 3D, three.js, WebGL, Three, R3F, React Three Fiber
- Game types that are inherently 3D: first-person, third-person, 3D platformer, racing game with 3D graphics
- User asks for: 3D models, 3D objects, 3D scene, 3D environment, 3D characters
- Features like: orbit controls, 3D camera, perspective view, 3D physics

For 2D games (platformers, puzzle, arcade, card games, board games), use Canvas API or DOM-based rendering.
Do NOT use Three.js for simple 2D games - it adds unnecessary complexity.

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
│   ├── ui/               # shadcn/ui components (button, card, input, progress, sonner)
│   └── [feature]/        # Feature-specific components
├── hooks/
│   └── use-toast.ts      # Toast notifications
├── lib/
│   └── utils.ts          # cn() helper for classNames
└── types/
    └── index.ts          # TypeScript types
\`\`\`

CRITICAL: The main game code goes in /src/pages/Index.tsx - this is your primary file.

AVAILABLE IMPORTS:
- '@/components/ui/button' - Button with variants (default, destructive, outline, secondary, ghost, link)
- '@/components/ui/card' - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- '@/components/ui/input' - Input field
- '@/components/ui/progress' - Progress bar
- '@/components/ui/sonner' - Toaster for notifications
- '@/hooks/use-toast' - useToast hook
- '@/lib/utils' - cn() for className merging
- '@react-three/fiber', '@react-three/drei', 'three' - 3D graphics (only if hasThreeJs is true)
- 'lucide-react' - Icons
- 'react-router-dom' - useLocation, Link, useNavigate

DESIGN STYLE:
- Dark theme with purple/violet accent colors
- Use Tailwind classes: bg-gray-900, bg-gray-800, text-white, border-gray-700
- Accent: violet-500, violet-600, fuchsia-500
- Rounded corners: rounded-lg, rounded-xl
- Shadows: shadow-lg, shadow-xl

CRITICAL RULES:
1. Main game logic goes in /src/pages/Index.tsx
2. Use TypeScript with proper types
3. Use Tailwind classes for styling (no inline styles)
4. Keep components small and focused
5. Use the existing UI components from @/components/ui
6. DO NOT modify main.tsx or App.tsx unless absolutely necessary
7. For Canvas games, use useRef and useEffect for the canvas element

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

Set "needsThreeJs": true ONLY if the game requires 3D graphics (Three.js/R3F).
For 2D games using Canvas or DOM, set it to false.

IMPORTANT:
- Only include files that need to be created or modified
- Provide COMPLETE file contents, not patches
- Make sure all imports are correct
- Test that the code is syntactically valid
- The main entry point is /src/pages/Index.tsx, NOT /src/app/page.tsx`;

// Game Shell Template specific prompt
const GAME_SHELL_PROMPT = `You are an expert game developer working in PlayCraft with the GAME SHELL template.
This template provides a complete mobile game UI with menus, shop, leaderboard, LiveOps events.
YOUR JOB: Generate ONLY the core gameplay logic that plugs into the GameplayPage.

ARCHITECTURE:
┌─────────────────────────────────────────────────┐
│           GAME SHELL (Already Built)            │
├─────────────────────────────────────────────────┤
│  MainMenu, Settings, Shop, Leaderboard          │
│  Teams, Friends, Daily Rewards, Profile         │
│  LiveOps: RoyalPass, SkyRace, TeamChest        │
│  27+ Modals (rewards, purchases, level, etc.)  │
├─────────────────────────────────────────────────┤
│         GAMEPLAY SLOT (You Generate)            │
│    (Snake, Puzzle, Match-3, Rhythm, etc.)      │
└─────────────────────────────────────────────────┘

CRITICAL: You only modify /src/pages/GameplayPage.tsx and create game components.
DO NOT recreate menus, settings, shop, leaderboard - they already exist!

GAMEPLAY PAGE STRUCTURE:
\`\`\`tsx
// /src/pages/GameplayPage.tsx
import { useGame, gameActions } from '../store/GameContext';
import { useNavigation } from '../store/NavigationContext';

export function GameplayPage() {
  const { state, dispatch } = useGame();
  const { openModal, goBack } = useNavigation();

  // Call when player wins the level
  const handleWin = (score: number, stars: number) => {
    dispatch(gameActions.updateCoins(score));
    dispatch(gameActions.completeLevel());
    openModal('level-complete');
  };

  // Call when player loses
  const handleLose = () => {
    dispatch(gameActions.updateLives(-1));
    openModal(state.player.lives <= 1 ? 'out-of-lives' : 'level-failed');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-purple-900 to-indigo-950">
      {/* Your game HUD */}
      <div className="p-4 flex justify-between">
        <span>Level {state.player.currentLevel}</span>
        <span>Score: 0</span>
      </div>

      {/* === YOUR GAME GOES HERE === */}
      <div className="flex-1 relative">
        {/* Generate game board, canvas, or game UI here */}
        {/* Call handleWin(score, stars) on victory */}
        {/* Call handleLose() on defeat */}
      </div>

      {/* Pause/back button */}
      <button onClick={goBack}>Pause</button>
    </div>
  );
}
\`\`\`

AVAILABLE STATE (from useGame):
- state.player.coins: number
- state.player.lives: number (0-5)
- state.player.stars: number
- state.player.currentLevel: number
- state.player.maxLevel: number
- state.boosters: { hammer: number, shuffle: number, undo: number, extraMoves: number }
- state.settings: { soundEnabled: boolean, musicEnabled: boolean, vibrationEnabled: boolean }

AVAILABLE ACTIONS:
- dispatch(gameActions.updateCoins(amount))
- dispatch(gameActions.updateLives(delta)) // -1 or +1
- dispatch(gameActions.updateStars(delta))
- dispatch(gameActions.completeLevel())
- dispatch(gameActions.useBoosters(type, amount))
- dispatch(gameActions.updateSettings({ soundEnabled: false }))

AVAILABLE NAVIGATION:
- openModal('level-complete' | 'level-failed' | 'out-of-lives' | 'booster-select')
- goBack() // Return to main menu
- goTo('shop' | 'settings' | 'leaderboard') // Navigate to page

GAME TYPES TO GENERATE:
1. Match-3 puzzle (swap gems to match 3+)
2. Word games (find words, crossword)
3. Rhythm games (tap to the beat)
4. Snake/arcade (arrow keys or swipe)
5. Tower defense (place units)
6. Clicker/idle (tap for progress)
7. Memory match (flip cards)
8. Number puzzles (Sudoku, 2048)

FILE STRUCTURE:
\`\`\`
src/
├── pages/
│   └── GameplayPage.tsx    # MAIN FILE TO MODIFY
├── components/
│   └── game/               # CREATE YOUR GAME COMPONENTS HERE
│       ├── GameBoard.tsx
│       ├── Tile.tsx
│       └── GameHUD.tsx
├── hooks/
│   └── useGameLogic.ts     # Game-specific hooks
└── store/                  # ALREADY EXISTS - DO NOT MODIFY
    ├── GameContext.tsx
    └── NavigationContext.tsx
\`\`\`

RESPONSE FORMAT:
Return ONLY valid JSON:
{
  "message": "Created [game type] gameplay",
  "files": [
    { "path": "/src/pages/GameplayPage.tsx", "content": "..." },
    { "path": "/src/components/game/GameBoard.tsx", "content": "..." }
  ],
  "explanation": "Detailed explanation of game mechanics",
  "needsThreeJs": false
}

CRITICAL RULES:
1. ONLY modify GameplayPage.tsx and create components in /src/components/game/
2. DO NOT modify store files, shell components, or other pages
3. Always call handleWin/handleLose to integrate with the shell
4. Use Tailwind CSS matching the shell theme (purple/indigo gradient, dark theme)
5. Game must be playable with touch (mobile) and mouse/keyboard (desktop)
6. Include game over detection that triggers handleWin or handleLose
7. Use state.player.currentLevel to adjust difficulty`;

// Build context using smart context package (new system)
function buildSmartContextPrompt(
  contextPackage: ContextAwareRequest['contextPackage'],
  prompt: string,
  hasThreeJs: boolean
): string {
  if (!contextPackage) return '';

  const parts: string[] = [];

  // 1. Project Memory (if available)
  if (contextPackage.projectMemory) {
    const mem = contextPackage.projectMemory;
    const memoryParts: string[] = [];

    if (mem.project_summary) {
      memoryParts.push(`Project: ${mem.project_summary}`);
    }
    if (mem.game_type) {
      memoryParts.push(`Type: ${mem.game_type}`);
    }
    if (mem.tech_stack.length > 0) {
      memoryParts.push(`Tech: ${mem.tech_stack.join(', ')}`);
    }
    if (mem.completed_tasks.length > 0) {
      const recentTasks = mem.completed_tasks.slice(0, 5).map(t => t.task);
      memoryParts.push(`Recent work: ${recentTasks.join('; ')}`);
    }

    if (memoryParts.length > 0) {
      parts.push('PROJECT CONTEXT:\n' + memoryParts.join('\n'));
    }
  }

  // 2. Conversation Summaries (compressed history)
  if (contextPackage.conversationSummaries.length > 0) {
    parts.push('CONVERSATION HISTORY:\n' + contextPackage.conversationSummaries.join('\n'));
  }

  // 3. Recent Messages (last 5 in full)
  if (contextPackage.recentMessages.length > 0) {
    const recentContext = contextPackage.recentMessages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');
    parts.push('RECENT CONVERSATION:\n' + recentContext);
  }

  // 4. Relevant Files (smart-selected)
  if (contextPackage.relevantFiles.length > 0) {
    const fileContext = contextPackage.relevantFiles
      .map(f => `--- ${f.path} (${f.relevanceReason}) ---\n${f.content}`)
      .join('\n\n');
    parts.push('RELEVANT FILES:\n' + fileContext);
  }

  // 5. Changed Files (for awareness)
  if (contextPackage.changedSinceLastRequest.length > 0) {
    parts.push('RECENTLY CHANGED: ' + contextPackage.changedSinceLastRequest.join(', '));
  }

  // 6. File Tree (awareness of full project)
  if (contextPackage.fileTree.length > 0) {
    parts.push('ALL PROJECT FILES:\n' + contextPackage.fileTree.join('\n'));
  }

  // 7. 3D Status
  const threeJsContext = hasThreeJs
    ? 'Three.js/React Three Fiber is ALREADY INSTALLED.'
    : 'Three.js is NOT installed. Set needsThreeJs: true if 3D is needed.';
  parts.push('3D STATUS: ' + threeJsContext);

  // 8. User Request
  parts.push(`USER REQUEST:\n${prompt}`);

  // 9. Instructions
  parts.push('Generate ONLY the necessary code changes. Return valid JSON with needsThreeJs boolean.');

  return parts.join('\n\n');
}

async function callGemini(
  prompt: string,
  currentFiles: Record<string, string>,
  selectedFile: string | undefined,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  apiKey: string,
  hasThreeJs: boolean = false,
  templateId: string = 'vite-starter',
  contextPackage?: ContextAwareRequest['contextPackage']
): Promise<GeneratedResponse> {
  // Select the appropriate system prompt based on template
  const systemPrompt = templateId === 'vite-game-shell' ? GAME_SHELL_PROMPT : SYSTEM_PROMPT;

  let userPrompt: string;

  // Use smart context if provided
  if (contextPackage && contextPackage.relevantFiles.length > 0) {
    userPrompt = buildSmartContextPrompt(contextPackage, prompt, hasThreeJs);

    console.log(
      `[generate] Using smart context: ${contextPackage.relevantFiles.length} files, ~${contextPackage.estimatedTokens} tokens`
    );
  } else {
    // Legacy context building
    let fileContext = '';
    const importantFiles = templateId === 'vite-game-shell'
      ? [
          '/src/pages/GameplayPage.tsx',
          '/src/store/GameContext.tsx',
          '/src/store/NavigationContext.tsx',
          selectedFile,
        ]
      : [
          '/src/pages/Index.tsx',
          '/src/App.tsx',
          '/src/main.tsx',
          selectedFile,
        ];
    const filteredFiles = importantFiles.filter(Boolean);

    for (const filePath of filteredFiles) {
      if (filePath && currentFiles[filePath]) {
        fileContext += `\n--- ${filePath} ---\n${currentFiles[filePath]}\n`;
      }
    }

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nPREVIOUS CONVERSATION:\n';
      for (const msg of conversationHistory.slice(-5)) {
        conversationContext += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      }
    }

    const threeJsContext = hasThreeJs
      ? 'Three.js/React Three Fiber is ALREADY INSTALLED. You can use @react-three/fiber, @react-three/drei, and three imports.'
      : 'Three.js is NOT installed yet. If this game needs 3D, set needsThreeJs: true and the system will install it.';

    userPrompt = `${conversationContext}

CURRENT PROJECT FILES:
${fileContext || '(No files available - starting fresh)'}

${selectedFile ? `CURRENTLY SELECTED FILE: ${selectedFile}` : ''}

3D STATUS: ${threeJsContext}

USER REQUEST:
${prompt}

Generate the code changes needed. Return ONLY valid JSON with needsThreeJs boolean.`;
  }

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
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 32768, // Increased from 16K - Gemini 3 supports up to 65K
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
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
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to find JSON in response:', responseText.slice(0, 500));
      throw new Error('Gemini did not return valid JSON');
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  if (!parsed.message || !Array.isArray(parsed.files)) {
    throw new Error('Response missing required fields');
  }

  return {
    message: parsed.message,
    files: parsed.files,
    explanation: parsed.explanation || '',
    needsThreeJs: parsed.needsThreeJs === true,
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // ==========================================================================
    // AUTHENTICATION
    // ==========================================================================
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // RATE LIMITING (Database-backed)
    // ==========================================================================
    const rateLimit = await checkRateLimit(supabase, user.id);
    if (!rateLimit.allowed) {
      console.warn(`[rate-limit] Exceeded for user ${hashUserId(user.id)}: ${rateLimit.error}`);
      return new Response(
        JSON.stringify({
          error: rateLimit.error,
          retryAfter: rateLimit.retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.retryAfter),
            'X-RateLimit-Minute-Remaining': String(rateLimit.minuteRemaining),
            'X-RateLimit-Hourly-Remaining': String(rateLimit.hourlyRemaining),
            'X-RateLimit-Daily-Remaining': String(rateLimit.dailyRemaining),
          },
        }
      );
    }

    // ==========================================================================
    // CREDIT/USAGE CHECK
    // ==========================================================================
    const credits = await checkUserCredits(supabase, user.id);
    if (!credits.hasCredits) {
      console.warn(`[credits] Exhausted for user ${hashUserId(user.id)}: ${credits.error}`);
      return new Response(
        JSON.stringify({
          error: credits.error,
          dailyRemaining: credits.dailyRequestsRemaining,
          monthlyRemaining: credits.monthlyRequestsRemaining,
        }),
        {
          status: 402, // Payment Required
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Credits-Daily-Remaining': String(credits.dailyRequestsRemaining),
            'X-Credits-Monthly-Remaining': String(credits.monthlyRequestsRemaining),
          },
        }
      );
    }

    // ==========================================================================
    // API KEY CHECK
    // ==========================================================================
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // INPUT VALIDATION
    // ==========================================================================
    const {
      prompt,
      currentFiles = {},
      selectedFile,
      conversationHistory = [],
      hasThreeJs = false,
      templateId = 'vite-starter',
      useSmartContext = false,
      contextPackage,
    }: ContextAwareRequest = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate prompt length (spend guard)
    if (prompt.length > RATE_LIMIT.MAX_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({
          error: `Prompt too long. Maximum ${RATE_LIMIT.MAX_PROMPT_LENGTH} characters allowed.`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ==========================================================================
    // SANITIZED LOGGING
    // ==========================================================================
    const contextInfo = useSmartContext && contextPackage
      ? `smart_context=true files=${contextPackage.relevantFiles.length} tokens=~${contextPackage.estimatedTokens}`
      : `smart_context=false files=${Object.keys(currentFiles).length}`;

    console.log(
      `[generate] user=${hashUserId(user.id)} template=${templateId} ${contextInfo} prompt_len=${prompt.length} preview="${sanitizeForLogging(prompt)}"`
    );

    // ==========================================================================
    // GENERATE CODE
    // ==========================================================================
    const generated = await callGemini(
      prompt,
      currentFiles,
      selectedFile,
      conversationHistory,
      geminiApiKey,
      hasThreeJs,
      templateId,
      useSmartContext ? contextPackage : undefined
    );

    // Estimate tokens used (rough estimate: 4 chars per token for output)
    const estimatedTokens = Math.ceil(
      (prompt.length + JSON.stringify(generated).length) / 4
    );

    // Record usage for billing/tracking (non-blocking)
    recordUsage(supabase, user.id, estimatedTokens);

    console.log(
      `[generate] user=${hashUserId(user.id)} files_generated=${generated.files.length} tokens=~${estimatedTokens} success=true`
    );

    return new Response(JSON.stringify(generated), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-RateLimit-Minute-Remaining': String(rateLimit.minuteRemaining),
        'X-RateLimit-Daily-Remaining': String(rateLimit.dailyRemaining),
        'X-Credits-Daily-Remaining': String(credits.dailyRequestsRemaining - 1),
      },
    });
  } catch (error) {
    // Sanitize error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[generate] error="${sanitizeForLogging(errorMessage, 100)}"`);

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
