/**
 * Next Step Prediction Service
 *
 * Hybrid approach combining:
 * 1. Rule-based patterns for common contexts (fast, no API call)
 * 2. AI fallback for novel contexts (when rules don't match)
 *
 * Provides contextually relevant next action suggestions to users.
 */

import type { NextStep, ChatMessage } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface PredictionContext {
  lastUserPrompt: string;
  lastAssistantResponse: string;
  filesModified: string[];
  gameType?: string;
  hasThreeJs: boolean;
  currentErrors?: string[];
  projectState: 'empty' | 'initial' | 'iterating' | 'polishing';
}

interface PatternMatch {
  pattern: RegExp;
  weight: number;
  steps: NextStep[];
}

// ============================================================================
// RULE-BASED PATTERNS
// ============================================================================

const GAME_CREATION_PATTERNS: PatternMatch[] = [
  {
    pattern: /(?:created?|built?|made?|started?)\s+(?:a\s+)?(?:new\s+)?(?:game|project)/i,
    weight: 1.0,
    steps: [
      { label: 'Add player controls', prompt: 'Add keyboard controls for the player (arrow keys or WASD)' },
      { label: 'Add scoring system', prompt: 'Add a score counter that increases when the player achieves goals' },
      { label: 'Add game over screen', prompt: 'Add a game over screen with restart button' },
    ],
  },
  {
    pattern: /(?:simple|basic)\s+(?:game|gameplay)/i,
    weight: 0.9,
    steps: [
      { label: 'Add more features', prompt: 'Make the game more interesting with power-ups and obstacles' },
      { label: 'Improve visuals', prompt: 'Add animations and visual effects to make it more engaging' },
      { label: 'Add sound effects', prompt: 'Add sound effects for player actions and game events' },
    ],
  },
];

const FEATURE_PATTERNS: PatternMatch[] = [
  {
    pattern: /(?:added?|implemented?|created?)\s+(?:the\s+)?(?:player|character|sprite)/i,
    weight: 1.0,
    steps: [
      { label: 'Add movement', prompt: 'Add smooth movement with keyboard controls' },
      { label: 'Add animations', prompt: 'Add walking and idle animations to the player' },
      { label: 'Add collision detection', prompt: 'Add collision detection with obstacles and boundaries' },
    ],
  },
  {
    pattern: /(?:added?|implemented?)\s+(?:the\s+)?(?:score|points|scoring)/i,
    weight: 1.0,
    steps: [
      { label: 'Add high score', prompt: 'Save and display the high score' },
      { label: 'Add combo system', prompt: 'Add a combo multiplier for consecutive actions' },
      { label: 'Add leaderboard', prompt: 'Add a local leaderboard to track best scores' },
    ],
  },
  {
    pattern: /(?:added?|implemented?)\s+(?:the\s+)?(?:enemies?|obstacles?|hazards?)/i,
    weight: 1.0,
    steps: [
      { label: 'Add enemy AI', prompt: 'Make enemies follow or chase the player' },
      { label: 'Add variety', prompt: 'Add different types of enemies with unique behaviors' },
      { label: 'Add spawn system', prompt: 'Add a wave system that spawns enemies over time' },
    ],
  },
  {
    pattern: /(?:added?|implemented?)\s+(?:the\s+)?(?:menu|start\s*screen|title)/i,
    weight: 1.0,
    steps: [
      { label: 'Add settings', prompt: 'Add a settings menu with sound and difficulty options' },
      { label: 'Add instructions', prompt: 'Add a how-to-play section explaining controls' },
      { label: 'Add credits', prompt: 'Add a credits screen' },
    ],
  },
];

const BUG_FIX_PATTERNS: PatternMatch[] = [
  {
    pattern: /(?:fixed|resolved|corrected|patched)\s+(?:the\s+)?(?:bug|issue|error|problem)/i,
    weight: 1.0,
    steps: [
      { label: 'Test the fix', prompt: 'Can you verify the fix works correctly in different scenarios?' },
      { label: 'Add error handling', prompt: 'Add better error handling to prevent similar issues' },
      { label: 'Continue building', prompt: 'What should we work on next?' },
    ],
  },
  {
    pattern: /(?:auto-?fixed|automatically\s+fixed)\s+\d+\s+error/i,
    weight: 0.9,
    steps: [
      { label: 'Review changes', prompt: 'Can you explain what was changed to fix the errors?' },
      { label: 'Continue feature', prompt: 'Continue with the original feature I was building' },
    ],
  },
];

const VISUAL_PATTERNS: PatternMatch[] = [
  {
    pattern: /(?:changed?|updated?|modified?)\s+(?:the\s+)?(?:color|style|theme|appearance)/i,
    weight: 1.0,
    steps: [
      { label: 'Add more colors', prompt: 'Create a cohesive color palette with complementary colors' },
      { label: 'Add animations', prompt: 'Add subtle animations to make it feel more dynamic' },
      { label: 'Dark mode', prompt: 'Add a dark/light mode toggle' },
    ],
  },
  {
    pattern: /(?:added?|implemented?)\s+(?:the\s+)?(?:animation|transition|effect)/i,
    weight: 1.0,
    steps: [
      { label: 'More animations', prompt: 'Add more animations for other game elements' },
      { label: 'Particle effects', prompt: 'Add particle effects for explosions or impacts' },
      { label: 'Screen shake', prompt: 'Add screen shake effect for impactful moments' },
    ],
  },
];

const THREE_JS_PATTERNS: PatternMatch[] = [
  {
    pattern: /3d|three\.?js|webgl/i,
    weight: 0.8,
    steps: [
      { label: 'Add lighting', prompt: 'Add better lighting with shadows' },
      { label: 'Add camera controls', prompt: 'Add orbit controls so the user can rotate the view' },
      { label: 'Add textures', prompt: 'Add textures and materials to the 3D objects' },
    ],
  },
];

const ITERATION_PATTERNS: PatternMatch[] = [
  {
    pattern: /(?:looks?\s+good|nice|great|awesome|perfect)/i,
    weight: 0.7,
    steps: [
      { label: 'Polish further', prompt: 'What else can we improve to make it even better?' },
      { label: 'Add new feature', prompt: 'What new feature should we add next?' },
      { label: 'Optimize', prompt: 'Optimize the performance and clean up the code' },
    ],
  },
  {
    pattern: /what.*(?:else|next|more|should)/i,
    weight: 0.6,
    steps: [
      { label: 'Improve gameplay', prompt: 'Make the gameplay more challenging and engaging' },
      { label: 'Add polish', prompt: 'Add polish like sound effects, animations, and particles' },
      { label: 'Mobile support', prompt: 'Make it work well on mobile devices with touch controls' },
    ],
  },
];

const ALL_PATTERNS = [
  ...GAME_CREATION_PATTERNS,
  ...FEATURE_PATTERNS,
  ...BUG_FIX_PATTERNS,
  ...VISUAL_PATTERNS,
  ...THREE_JS_PATTERNS,
  ...ITERATION_PATTERNS,
];

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Generate next step predictions based on context
 * Uses rule-based matching first, falls back to generic suggestions
 */
export function predictNextSteps(context: PredictionContext): NextStep[] {
  const { lastAssistantResponse, filesModified, hasThreeJs, projectState } = context;

  // Check for errors first - if there are errors, suggest fixes
  if (context.currentErrors && context.currentErrors.length > 0) {
    return [
      { label: 'Fix the errors', prompt: 'Please fix these errors and explain what was wrong' },
      { label: 'Explain the errors', prompt: 'What do these errors mean and how can I avoid them?' },
    ];
  }

  // Try to match patterns in the assistant response
  const matches: Array<{ match: PatternMatch; score: number }> = [];

  for (const patternMatch of ALL_PATTERNS) {
    if (patternMatch.pattern.test(lastAssistantResponse)) {
      // Calculate score based on weight and specificity
      const score = patternMatch.weight;
      matches.push({ match: patternMatch, score });
    }
  }

  // Add Three.js specific suggestions if applicable
  if (hasThreeJs) {
    for (const patternMatch of THREE_JS_PATTERNS) {
      if (!matches.some(m => m.match === patternMatch)) {
        matches.push({ match: patternMatch, score: 0.5 });
      }
    }
  }

  // Sort by score and get top matches
  matches.sort((a, b) => b.score - a.score);

  // Collect unique steps from top matches
  const steps: NextStep[] = [];
  const seenLabels = new Set<string>();

  for (const { match } of matches) {
    for (const step of match.steps) {
      if (!seenLabels.has(step.label)) {
        steps.push(step);
        seenLabels.add(step.label);
        if (steps.length >= 3) break;
      }
    }
    if (steps.length >= 3) break;
  }

  // If no matches, provide generic suggestions based on project state
  if (steps.length === 0) {
    return getGenericSuggestions(projectState, filesModified, hasThreeJs);
  }

  return steps.slice(0, 3);
}

/**
 * Get suggestions for a new project (no context)
 */
export function getInitialSuggestions(): NextStep[] {
  return [
    { label: 'Classic arcade game', prompt: 'Create a classic arcade-style game like Snake or Breakout' },
    { label: 'Puzzle game', prompt: 'Create a puzzle game with matching or sorting mechanics' },
    { label: 'Platformer game', prompt: 'Create a 2D platformer game with a jumping character' },
  ];
}

/**
 * Get suggestions based on game type
 */
export function getSuggestionsForGameType(gameType: string): NextStep[] {
  const suggestions: Record<string, NextStep[]> = {
    platformer: [
      { label: 'Add double jump', prompt: 'Add a double jump ability' },
      { label: 'Add enemies', prompt: 'Add enemies that patrol platforms' },
      { label: 'Add collectibles', prompt: 'Add coins or gems to collect' },
    ],
    puzzle: [
      { label: 'Add timer', prompt: 'Add a countdown timer challenge mode' },
      { label: 'Add levels', prompt: 'Add multiple difficulty levels' },
      { label: 'Add hints', prompt: 'Add a hint system for stuck players' },
    ],
    arcade: [
      { label: 'Add power-ups', prompt: 'Add power-ups that give temporary abilities' },
      { label: 'Add waves', prompt: 'Add wave-based difficulty progression' },
      { label: 'Add boss fight', prompt: 'Add a boss enemy at the end' },
    ],
    shooter: [
      { label: 'Add weapons', prompt: 'Add different weapon types to choose from' },
      { label: 'Add ammo system', prompt: 'Add ammo management and reload mechanics' },
      { label: 'Add destructible environment', prompt: 'Add destructible objects in the level' },
    ],
  };

  return suggestions[gameType.toLowerCase()] || getGenericSuggestions('iterating', [], false);
}

// ============================================================================
// HELPERS
// ============================================================================

function getGenericSuggestions(
  projectState: PredictionContext['projectState'],
  filesModified: string[],
  hasThreeJs: boolean
): NextStep[] {
  if (projectState === 'empty') {
    return getInitialSuggestions();
  }

  if (projectState === 'initial') {
    return [
      { label: 'Add player controls', prompt: 'Add keyboard or mouse controls for the player' },
      { label: 'Add game logic', prompt: 'Add the core game mechanics and rules' },
      { label: 'Add visual feedback', prompt: 'Add animations and visual effects' },
    ];
  }

  if (projectState === 'polishing') {
    return [
      { label: 'Add sounds', prompt: 'Add sound effects and background music' },
      { label: 'Optimize performance', prompt: 'Optimize the game for smooth performance' },
      { label: 'Add mobile support', prompt: 'Make the game work well on mobile devices' },
    ];
  }

  // Default iterating state
  if (hasThreeJs) {
    return [
      { label: 'Improve 3D scene', prompt: 'Enhance the 3D environment with better lighting and materials' },
      { label: 'Add camera effects', prompt: 'Add camera shake, zoom, or transitions' },
      { label: 'Add interactions', prompt: 'Add more interactive 3D objects' },
    ];
  }

  return [
    { label: 'Add new feature', prompt: 'What feature should we add next?' },
    { label: 'Improve gameplay', prompt: 'Make the game more fun and engaging' },
    { label: 'Fix or polish', prompt: 'Is there anything that needs fixing or polishing?' },
  ];
}

/**
 * Determine project state from files and messages
 */
export function determineProjectState(
  files: Record<string, string>,
  messageCount: number
): PredictionContext['projectState'] {
  const fileCount = Object.keys(files).length;
  const hasGameCode = Object.values(files).some(content =>
    content.includes('useState') ||
    content.includes('useEffect') ||
    content.includes('Canvas') ||
    content.includes('game')
  );

  if (fileCount <= 1 && !hasGameCode) {
    return 'empty';
  }

  if (messageCount <= 2) {
    return 'initial';
  }

  if (messageCount > 10) {
    return 'polishing';
  }

  return 'iterating';
}

/**
 * Extract context from recent messages
 */
export function extractPredictionContext(
  messages: ChatMessage[],
  files: Record<string, string>,
  hasThreeJs: boolean,
  currentErrors?: string[]
): PredictionContext {
  const recentMessages = messages.slice(-4);
  const lastUser = recentMessages.filter(m => m.role === 'user').pop();
  const lastAssistant = recentMessages.filter(m => m.role === 'assistant').pop();

  // Find modified files from assistant messages
  const filesModified: string[] = [];
  for (const msg of recentMessages) {
    if (msg.role === 'assistant' && msg.files) {
      for (const file of msg.files) {
        if (!filesModified.includes(file.path)) {
          filesModified.push(file.path);
        }
      }
    }
  }

  return {
    lastUserPrompt: lastUser?.content || '',
    lastAssistantResponse: lastAssistant?.content || '',
    filesModified,
    hasThreeJs,
    currentErrors,
    projectState: determineProjectState(files, messages.length),
  };
}
