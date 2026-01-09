import { getSupabase } from './supabase';
import type {
  ChatSession,
  CreateChatSessionInput,
  UpdateChatSessionInput,
  ConversationMessage,
} from '../types';

/**
 * Get all chat sessions for a project
 */
export async function getChatSessions(projectId: string): Promise<ChatSession[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_chat_sessions')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[getChatSessions] Database error:', error);
    throw new Error(`Failed to fetch chat sessions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single chat session by ID
 */
export async function getChatSession(id: string): Promise<ChatSession | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_chat_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch chat session: ${error.message}`);
  }

  return data;
}

/**
 * Create a new chat session
 */
export async function createChatSession(
  input: CreateChatSessionInput
): Promise<ChatSession> {
  const supabase = getSupabase();

  // Get current user for RLS compliance
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('playcraft_chat_sessions')
    .insert({
      user_id: user.id, // Required for RLS policy
      project_id: input.project_id,
      title: input.title,
      messages: input.messages || [],
    })
    .select()
    .single();

  if (error) {
    console.error('[createChatSession] Database error:', error);
    throw new Error(`Failed to create chat session: ${error.message}`);
  }

  console.log(`[createChatSession] Created session ${data.id} for project ${input.project_id}`);
  return data;
}

/**
 * Update a chat session
 */
export async function updateChatSession(
  id: string,
  input: UpdateChatSessionInput
): Promise<ChatSession> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_chat_sessions')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update chat session: ${error.message}`);
  }

  return data;
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(id: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_chat_sessions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete chat session: ${error.message}`);
  }
}

/**
 * Save messages to a chat session
 */
export async function saveChatSessionMessages(
  id: string,
  messages: ConversationMessage[]
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_chat_sessions')
    .update({ messages })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to save chat session messages: ${error.message}`);
  }
}

/**
 * Generate a title from the first user message (simple truncation)
 */
export function generateSessionTitle(firstMessage: string): string {
  // Truncate and clean up the message for a title
  const cleaned = firstMessage.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= 50) {
    return cleaned;
  }
  return cleaned.substring(0, 47) + '...';
}

/**
 * Generate a catchy project name from a prompt using AI
 * Falls back to smart extraction if AI call fails
 */
export async function generateProjectName(prompt: string): Promise<string> {
  const supabase = getSupabase();

  try {
    // Call the edge function with generate_name mode
    const { data, error } = await supabase.functions.invoke('generate-playcraft', {
      body: {
        prompt,
        mode: 'generate_name',
      },
    });

    if (error) {
      return extractNameFromPrompt(prompt);
    }

    if (data?.name) {
      return data.name;
    }

    return extractNameFromPrompt(prompt);
  } catch {
    return extractNameFromPrompt(prompt);
  }
}

/**
 * Game genres with keywords and creative name parts
 */
const GAME_GENRES: Record<string, { keywords: string[]; prefixes: string[]; suffixes: string[] }> = {
  shooter: {
    keywords: ['shoot', 'shooter', 'gun', 'bullet', 'blast', 'fire', 'weapon', 'enemy', 'battle'],
    prefixes: ['Cosmic', 'Stellar', 'Neon', 'Hyper', 'Mega', 'Ultra'],
    suffixes: ['Blaster', 'Strike', 'Storm', 'Force', 'Fury', 'Assault'],
  },
  platformer: {
    keywords: ['jump', 'platform', 'run', 'hop', 'climb', 'mario', 'side-scroll'],
    prefixes: ['Super', 'Pixel', 'Retro', 'Epic', 'Wild'],
    suffixes: ['Quest', 'Run', 'Dash', 'Jump', 'Adventure', 'World'],
  },
  puzzle: {
    keywords: ['puzzle', 'match', 'solve', 'logic', 'brain', 'tetris', 'block', 'tile'],
    prefixes: ['Mind', 'Logic', 'Brain', 'Puzzle', 'Smart'],
    suffixes: ['Master', 'Quest', 'Challenge', 'Logic', 'Twist', 'Box'],
  },
  racing: {
    keywords: ['race', 'racing', 'car', 'speed', 'drive', 'fast', 'vehicle', 'track'],
    prefixes: ['Turbo', 'Speed', 'Nitro', 'Hyper', 'Ultra'],
    suffixes: ['Racer', 'Rush', 'Drift', 'Chase', 'Sprint', 'Rally'],
  },
  rpg: {
    keywords: ['rpg', 'adventure', 'quest', 'hero', 'dragon', 'magic', 'sword', 'fantasy', 'dungeon'],
    prefixes: ['Epic', 'Legend', 'Shadow', 'Crystal', 'Dragon'],
    suffixes: ['Quest', 'Saga', 'Chronicles', 'Legend', 'Tale', 'Journey'],
  },
  arcade: {
    keywords: ['arcade', 'retro', 'classic', 'score', 'endless', 'survival'],
    prefixes: ['Retro', 'Pixel', 'Neon', 'Classic', 'Hyper'],
    suffixes: ['Arcade', 'Mania', 'Frenzy', 'Zone', 'Rush', 'Blast'],
  },
  space: {
    keywords: ['space', 'alien', 'star', 'galaxy', 'asteroid', 'ship', 'cosmic', 'orbit'],
    prefixes: ['Cosmic', 'Stellar', 'Galaxy', 'Star', 'Astro', 'Nova'],
    suffixes: ['Voyager', 'Explorer', 'Odyssey', 'Command', 'Fleet', 'Station'],
  },
  defense: {
    keywords: ['tower', 'defense', 'defend', 'protect', 'wave', 'enemy', 'base'],
    prefixes: ['Tower', 'Castle', 'Kingdom', 'Fort', 'Realm'],
    suffixes: ['Defense', 'Guard', 'Fortress', 'Siege', 'Stand', 'War'],
  },
  sports: {
    keywords: ['sport', 'ball', 'soccer', 'football', 'basketball', 'tennis', 'golf'],
    prefixes: ['Pro', 'Super', 'Ultimate', 'Champion', 'All-Star'],
    suffixes: ['League', 'Champion', 'Pro', 'Masters', 'Cup', 'Tournament'],
  },
  action: {
    keywords: ['action', 'fight', 'combat', 'attack', 'warrior', 'ninja', 'samurai'],
    prefixes: ['Shadow', 'Storm', 'Thunder', 'Iron', 'Steel', 'Dark'],
    suffixes: ['Warriors', 'Strike', 'Combat', 'Clash', 'Arena', 'Fighters'],
  },
};

const GENERIC_PREFIXES = ['Epic', 'Super', 'Pixel', 'Neon', 'Retro', 'Hyper', 'Mega', 'Ultra'];
const GENERIC_SUFFIXES = ['Quest', 'Adventure', 'Challenge', 'Mania', 'Rush', 'World', 'Zone', 'Arena'];

/**
 * Extract a creative game name from a prompt using pattern matching (fallback)
 */
function extractNameFromPrompt(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  // Try to detect genre from prompt
  let detectedGenre: string | null = null;
  let maxMatches = 0;

  for (const [genre, data] of Object.entries(GAME_GENRES)) {
    const matches = data.keywords.filter(keyword => lowerPrompt.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedGenre = genre;
    }
  }

  // Get prefixes and suffixes based on detected genre or use generic
  const genreData = detectedGenre ? GAME_GENRES[detectedGenre] : null;
  const prefixes = genreData?.prefixes || GENERIC_PREFIXES;
  const suffixes = genreData?.suffixes || GENERIC_SUFFIXES;

  // Try to extract a subject from the prompt
  const subjectPatterns = [
    /(?:about|with|featuring)\s+(?:a|an)?\s*(\w+)/i,
    /(\w+)\s+(?:game|adventure|quest)/i,
    /(?:make|create|build)\s+(?:a|an)?\s*(\w+)/i,
  ];

  let subject: string | null = null;
  for (const pattern of subjectPatterns) {
    const match = lowerPrompt.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      const word = match[1];
      // Skip common words
      if (!['game', 'the', 'this', 'that', 'with', 'like', 'make', 'create', 'build', 'simple'].includes(word)) {
        subject = word.charAt(0).toUpperCase() + word.slice(1);
        break;
      }
    }
  }

  // Generate name: [Prefix] [Subject?] [Suffix]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  if (subject) {
    // Use subject in name - either "Prefix Subject" or "Subject Suffix"
    return Math.random() > 0.5 ? `${prefix} ${subject}` : `${subject} ${suffix}`;
  }

  return `${prefix} ${suffix}`;
}
