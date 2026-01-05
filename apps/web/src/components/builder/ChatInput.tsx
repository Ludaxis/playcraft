/**
 * Chat Input Component
 * Text input for sending messages to the AI with suggestions
 * Note: Credits indicator moved to CreditsPanel component
 */

import { Send, Sparkles } from 'lucide-react';

interface SuggestionChip {
  label: string;
  prompt: string;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder?: string;
  suggestions?: SuggestionChip[];
  onSuggestionClick?: (prompt: string) => void;
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
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(prompt);
    } else {
      onChange(prompt);
    }
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
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full rounded-xl bg-surface-overlay py-3 pl-4 pr-12 text-sm text-content placeholder-content-subtle outline-none ring-accent/50 transition-shadow focus:ring-2"
            disabled={disabled}
          />
          <button
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-accent p-2 text-content transition-colors hover:bg-accent-light disabled:opacity-50 disabled:hover:bg-accent"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hint text */}
      <div className="mt-2 text-right text-xs text-content-subtle">
        Press Enter to send
      </div>
    </div>
  );
}
