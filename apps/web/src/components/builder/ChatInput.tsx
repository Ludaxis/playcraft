/**
 * Chat Input Component
 * Text input for sending messages to the AI with suggestions
 * Includes Chat mode toggle for discussion without file edits
 */

import { useState } from 'react';
import { Send, Sparkles, MessageSquare, Code } from 'lucide-react';

export type ChatMode = 'build' | 'chat';

interface SuggestionChip {
  label: string;
  prompt: string;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (mode: ChatMode) => void;
  disabled: boolean;
  placeholder?: string;
  suggestions?: SuggestionChip[];
  onSuggestionClick?: (prompt: string) => void;
  defaultMode?: ChatMode;
}

// Default quick suggestions
const DEFAULT_SUGGESTIONS: SuggestionChip[] = [
  { label: 'Add power-ups', prompt: 'Add power-up items that give special abilities' },
  { label: 'Sound effects', prompt: 'Add sound effects for game actions' },
  { label: 'Better graphics', prompt: 'Improve the visual design with animations and effects' },
];

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = 'Describe what you want to build...',
  suggestions = DEFAULT_SUGGESTIONS,
  onSuggestionClick,
  defaultMode = 'build',
}: ChatInputProps) {
  const [mode, setMode] = useState<ChatMode>(defaultMode);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(mode);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(prompt);
    } else {
      onChange(prompt);
    }
  };

  const handleSend = () => {
    onSend(mode);
  };

  return (
    <div className="border-t border-border-muted bg-surface-elevated/50 p-3">
      {/* Quick suggestion chips */}
      <div className="mb-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion.prompt)}
            disabled={disabled}
            className="flex items-center gap-1 rounded-full border border-border bg-surface-overlay/50 px-2.5 py-1 text-xs text-content-muted transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-accent-light disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3" />
            {suggestion.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'chat' ? 'Ask a question about your code...' : placeholder}
            className="w-full resize-none rounded-xl bg-surface-overlay py-3 pl-4 pr-32 text-sm text-content placeholder-content-subtle outline-none ring-accent/50 transition-shadow focus:ring-2"
            disabled={disabled}
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />

          {/* Mode toggle and send button */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {/* Chat/Build mode toggle */}
            <div className="flex items-center rounded-lg bg-surface-base/80 p-0.5">
              <button
                onClick={() => setMode('chat')}
                disabled={disabled}
                title="Chat without making edits to your project"
                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  mode === 'chat'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button
                onClick={() => setMode('build')}
                disabled={disabled}
                title="Build mode - AI will generate and edit code"
                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  mode === 'build'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Build</span>
              </button>
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              className="rounded-lg bg-accent p-2 text-content transition-colors hover:bg-accent-light disabled:opacity-50 disabled:hover:bg-accent"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hint text */}
      <div className="mt-2 flex items-center justify-between text-xs text-content-subtle">
        <span>
          {mode === 'chat' ? (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Chat mode: Ask questions without editing files
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              Build mode: AI will generate and edit code
            </span>
          )}
        </span>
        <span>Press Enter to send</span>
      </div>
    </div>
  );
}
