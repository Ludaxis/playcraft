import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ConversationMessage } from '../../types';
import {
  checkAndSummarize,
  getConversationContext,
  clearConversationSummaries,
} from '../conversationSummarizer';

// In-memory Supabase mock that exercises the summarizer logic without network calls.
interface MockSummary {
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

const tableData: { conversationSummaries: MockSummary[] } = {
  conversationSummaries: [],
};

const supabaseMock = {
  from: (table: string) => {
    if (table === 'playcraft_conversation_summaries') {
      return {
        select: () => ({
          eq: () => ({
            order: (_col: string, opts?: { ascending?: boolean }) => {
              const sorted = [...tableData.conversationSummaries].sort((a, b) =>
                opts?.ascending === false
                  ? b.sequence_number - a.sequence_number
                  : a.sequence_number - b.sequence_number
              );
              return {
                data: sorted,
                error: null,
                limit: (n: number) => ({
                  single: () => {
                    const row = sorted.slice(0, n)[0];
                    return row
                      ? { data: row, error: null }
                      : { data: null, error: { message: 'not found' } };
                  },
                }),
                single: () => {
                  const row = sorted[0];
                  return row
                    ? { data: row, error: null }
                    : { data: null, error: { message: 'not found' } };
                },
              };
            },
          }),
        }),
        insert: (row: Partial<MockSummary> | Partial<MockSummary>[]) => {
          const rows = Array.isArray(row) ? row : [row];
          rows.forEach(r => {
            tableData.conversationSummaries.push({
              id: `${tableData.conversationSummaries.length + 1}`,
              ...r,
            } as MockSummary);
          });
          return { error: null };
        },
        delete: () => ({
          eq: () => {
            tableData.conversationSummaries.length = 0;
            return { error: null };
          },
        }),
      };
    }

    throw new Error(`Unexpected table ${table}`);
  },
};

vi.mock('../supabase', () => ({
  getSupabase: () => supabaseMock,
}));

describe('conversationSummarizer (Phase 1 - conversation compaction)', () => {
  beforeEach(async () => {
    tableData.conversationSummaries.length = 0;
    await clearConversationSummaries('project-1');
  });

  it('creates a summary when unsummarized messages exceed the threshold', async () => {
    const messages: ConversationMessage[] = [];

    // Build 16 messages (>= MESSAGES_PER_SUMMARY + RECENT_MESSAGES_TO_KEEP)
    for (let i = 0; i < 11; i++) {
      messages.push({
        role: 'assistant',
        content: `Created power-up system and score combo ${i}`,
      });
    }
    for (let i = 0; i < 5; i++) {
      messages.push({
        role: 'user',
        content: `Please add leaderboard entry ${i}`,
      });
    }

    await checkAndSummarize('project-1', messages, messages.length - 1);

    expect(tableData.conversationSummaries).toHaveLength(1);
    const summary = tableData.conversationSummaries[0];

    expect(summary.message_range_start).toBe(0);
    expect(summary.message_range_end).toBe(10); // 16 total - 5 recent kept in full
    expect(summary.summary_text.toLowerCase()).toContain('power-up');
    expect(summary.tasks_completed).not.toHaveLength(0);
    expect(summary.files_modified).toEqual([]);
  });

  it('returns stored summaries and the last 5 non-system messages for context', async () => {
    tableData.conversationSummaries.push({
      id: '1',
      project_id: 'project-1',
      summary_text: 'Existing summary',
      message_range_start: 0,
      message_range_end: 9,
      tasks_completed: ['Added jump'],
      files_modified: ['/src/pages/Index.tsx'],
      sequence_number: 0,
      created_at: new Date().toISOString(),
    });

    const recent: ConversationMessage[] = [
      { role: 'system', content: 'ignore me' },
      { role: 'user', content: 'Message 1' },
      { role: 'assistant', content: 'Message 2' },
      { role: 'user', content: 'Message 3' },
      { role: 'assistant', content: 'Message 4' },
      { role: 'user', content: 'Message 5' },
      { role: 'assistant', content: 'Message 6' },
    ];

    const context = await getConversationContext('project-1', recent);

    expect(context.summaries).toEqual(['Existing summary']);
    expect(context.recentMessages).toHaveLength(5); // system message filtered, last 5 kept
    expect(context.recentMessages[0].content).toBe('Message 2');
    expect(context.recentMessages[4].content).toBe('Message 6');
  });
});
