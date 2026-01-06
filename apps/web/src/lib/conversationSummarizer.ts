/**
 * Conversation Summarizer
 *
 * Compresses conversation history by summarizing older messages.
 * Runs in background to avoid blocking main requests.
 */

import { getSupabase } from './supabase';
import type { ConversationSummary } from './contextBuilder';
import type { ConversationMessage } from '../types';

interface SummaryRow {
  id: string;
  project_id: string;
  summary_text: string;
  message_range_start: number;
  message_range_end: number;
  tasks_completed: string[];
  files_modified: string[];
  sequence_number: number;
  created_at: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MESSAGES_PER_SUMMARY = 10; // Summarize every 10 messages
const RECENT_MESSAGES_TO_KEEP = 5; // Keep last 5 messages in full

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Get all summaries for a project
 */
export async function getConversationSummaries(
  projectId: string
): Promise<ConversationSummary[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_conversation_summaries')
    .select('*')
    .eq('project_id', projectId)
    .order('sequence_number', { ascending: true });

  if (error) {
    console.error('[ConversationSummarizer] Failed to get summaries:', error);
    return [];
  }

  return (data || []).map((row: SummaryRow) => ({
    summary_text: row.summary_text,
    tasks_completed: row.tasks_completed || [],
    files_modified: row.files_modified || [],
    sequence_number: row.sequence_number,
  }));
}

/**
 * Get the latest summary sequence number
 */
async function getLatestSequenceNumber(projectId: string): Promise<number> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_conversation_summaries')
    .select('sequence_number')
    .eq('project_id', projectId)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return -1;
  }

  return data.sequence_number;
}

/**
 * Save a new summary
 */
async function saveSummary(
  projectId: string,
  summary: Omit<ConversationSummary, 'sequence_number'> & {
    message_range_start: number;
    message_range_end: number;
  }
): Promise<void> {
  const supabase = getSupabase();

  const sequenceNumber = (await getLatestSequenceNumber(projectId)) + 1;

  const { error } = await supabase.from('playcraft_conversation_summaries').insert({
    project_id: projectId,
    summary_text: summary.summary_text,
    message_range_start: summary.message_range_start,
    message_range_end: summary.message_range_end,
    tasks_completed: summary.tasks_completed,
    files_modified: summary.files_modified,
    sequence_number: sequenceNumber,
  });

  if (error) {
    console.error('[ConversationSummarizer] Failed to save summary:', error);
  }
}

// ============================================================================
// LOCAL SUMMARIZATION (No API call - rule-based)
// ============================================================================

/**
 * Generate a summary from messages using rule-based extraction
 * This avoids API calls for cost savings
 */
function generateLocalSummary(messages: ConversationMessage[]): {
  summary: string;
  tasks: string[];
  files: string[];
} {
  const tasks: string[] = [];
  const files = new Set<string>();
  const actions: string[] = [];

  for (const msg of messages) {
    if (msg.role === 'user') {
      // Extract what user asked for
      const userAction = extractUserAction(msg.content);
      if (userAction) {
        actions.push(userAction);
      }
    } else if (msg.role === 'assistant') {
      // Extract what was done
      const completed = extractCompletedTask(msg.content);
      if (completed) {
        tasks.push(completed);
      }

      // Extract file mentions
      const fileMatches = msg.content.match(/\/src\/[^\s'"`)]+\.tsx?/g);
      if (fileMatches) {
        fileMatches.forEach(f => files.add(f));
      }
    }
  }

  // Generate summary text
  let summary = '';
  if (tasks.length > 0) {
    summary = tasks.slice(0, 3).join('. ');
  } else if (actions.length > 0) {
    summary = `User requested: ${actions.slice(0, 3).join(', ')}`;
  } else {
    summary = `Conversation with ${messages.length} messages`;
  }

  return {
    summary,
    tasks: tasks.slice(0, 5),
    files: Array.from(files).slice(0, 10),
  };
}

/**
 * Extract user's intended action from their message
 */
function extractUserAction(content: string): string | null {
  const patterns = [
    /^(?:please\s+)?(?:can you\s+)?(?:help me\s+)?(create|make|build|add|fix|change|update|remove)\s+(.{10,60})/i,
    /^I want (?:to\s+)?(.{10,60})/i,
    /^(.{10,60})\s+(?:please|now)$/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return (match[1] + (match[2] ? ' ' + match[2] : '')).trim();
    }
  }

  // Fallback: first sentence if short enough
  const firstSentence = content.split(/[.!?]/)[0];
  if (firstSentence && firstSentence.length < 80) {
    return firstSentence.trim();
  }

  return null;
}

/**
 * Extract completed task from assistant message
 */
function extractCompletedTask(content: string): string | null {
  const patterns = [
    /^I've (.{10,80}?)(?:\.|!|$)/im,
    /^(?:Done|Created|Added|Fixed|Updated|Implemented)!?\s*(.{10,80}?)(?:\.|!|$)/im,
    /^(.{10,80}) (?:has been|is now|are now) (?:created|added|implemented|fixed)/im,
    /^(.{10,80}) (?:complete|done|ready)/im,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const task = match[1].trim();
      return task.charAt(0).toUpperCase() + task.slice(1);
    }
  }

  return null;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Check if summarization is needed and perform it
 * Should be called after each message exchange
 */
export async function checkAndSummarize(
  projectId: string,
  messages: ConversationMessage[],
  currentMessageIndex: number
): Promise<void> {
  // Get existing summaries to know where we left off
  const summaries = await getConversationSummaries(projectId);
  const lastSummarizedIndex = summaries.length > 0
    ? summaries[summaries.length - 1].sequence_number * MESSAGES_PER_SUMMARY + MESSAGES_PER_SUMMARY - 1
    : -1;

  // Check if we have enough new messages to summarize
  const unsummarizedCount = currentMessageIndex - lastSummarizedIndex;

  if (unsummarizedCount >= MESSAGES_PER_SUMMARY + RECENT_MESSAGES_TO_KEEP) {
    // Need to summarize
    const startIndex = lastSummarizedIndex + 1;
    const endIndex = currentMessageIndex - RECENT_MESSAGES_TO_KEEP;

    // Get messages to summarize
    const messagesToSummarize = messages.slice(startIndex, endIndex + 1);

    if (messagesToSummarize.length >= MESSAGES_PER_SUMMARY) {
      // Generate summary (local, no API call)
      const { summary, tasks, files } = generateLocalSummary(messagesToSummarize);

      // Save summary
      await saveSummary(projectId, {
        summary_text: summary,
        message_range_start: startIndex,
        message_range_end: endIndex,
        tasks_completed: tasks,
        files_modified: files,
      });

      console.log(
        `[ConversationSummarizer] Created summary for messages ${startIndex}-${endIndex}`
      );
    }
  }
}

/**
 * Get context-ready conversation data
 * Returns summaries + recent messages
 */
export async function getConversationContext(
  projectId: string,
  allMessages: ConversationMessage[]
): Promise<{
  summaries: string[];
  recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
}> {
  // Get stored summaries
  const summaries = await getConversationSummaries(projectId);
  const summaryTexts = summaries.map(s => s.summary_text);

  // Get recent messages (last N that aren't system messages)
  const recentMessages = allMessages
    .filter(m => m.role !== 'system')
    .slice(-RECENT_MESSAGES_TO_KEEP)
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  return {
    summaries: summaryTexts,
    recentMessages,
  };
}

/**
 * Clear all summaries for a project (e.g., when starting fresh)
 */
export async function clearConversationSummaries(projectId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_conversation_summaries')
    .delete()
    .eq('project_id', projectId);

  if (error) {
    console.error('[ConversationSummarizer] Failed to clear summaries:', error);
  }
}

/**
 * Background summarization - can be called without blocking
 */
export function summarizeInBackground(
  projectId: string,
  messages: ConversationMessage[],
  currentMessageIndex: number
): void {
  // Run summarization without waiting
  checkAndSummarize(projectId, messages, currentMessageIndex).catch(err => {
    console.error('[ConversationSummarizer] Background summarization failed:', err);
  });
}

/**
 * Get summary statistics
 */
export async function getSummaryStats(projectId: string): Promise<{
  summaryCount: number;
  messagesCompressed: number;
  oldestSummary: string | null;
  newestSummary: string | null;
}> {
  const summaries = await getConversationSummaries(projectId);

  if (summaries.length === 0) {
    return {
      summaryCount: 0,
      messagesCompressed: 0,
      oldestSummary: null,
      newestSummary: null,
    };
  }

  return {
    summaryCount: summaries.length,
    messagesCompressed: summaries.length * MESSAGES_PER_SUMMARY,
    oldestSummary: summaries[0].summary_text,
    newestSummary: summaries[summaries.length - 1].summary_text,
  };
}
