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
      console.warn('[generateProjectName] Edge function error:', error);
      return extractNameFromPrompt(prompt);
    }

    if (data?.name) {
      console.log('[generateProjectName] AI generated name:', data.name);
      return data.name;
    }

    return extractNameFromPrompt(prompt);
  } catch (err) {
    console.warn('[generateProjectName] Failed, using fallback:', err);
    return extractNameFromPrompt(prompt);
  }
}

/**
 * Extract a reasonable name from a prompt using pattern matching (fallback)
 */
function extractNameFromPrompt(prompt: string): string {
  const cleaned = prompt.trim().toLowerCase();

  // Common patterns to extract game type
  const patterns = [
    /(?:make|create|build|design)\s+(?:a|an|me)?\s*(.+?)(?:\s+game|\s+app|\s+with|$)/i,
    /(.+?)\s+(?:game|simulator|adventure)/i,
    /(?:game|app)\s+(?:about|with|featuring)\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      const extracted = match[1]
        .replace(/\b(a|an|the|my|with|that|like|similar|to)\b/gi, '')
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 2)
        .slice(0, 3)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      if (extracted.length >= 3) {
        return extracted;
      }
    }
  }

  // Fallback: Take first meaningful words
  const words = cleaned
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['make', 'create', 'build', 'game', 'want', 'like', 'with', 'that'].includes(w))
    .slice(0, 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1));

  return words.length > 0 ? words.join(' ') : 'Untitled Game';
}
