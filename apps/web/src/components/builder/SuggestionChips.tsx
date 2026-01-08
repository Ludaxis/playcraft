/**
 * Suggestion Chips Component
 * Quick action suggestions displayed above the chat input in Builder
 */

import { Sparkles } from 'lucide-react';

export interface Suggestion {
  label: string;
  prompt: string;
}

interface SuggestionChipsProps {
  suggestions: Suggestion[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { label: 'Add power-ups', prompt: 'Add power-up items that give special abilities' },
  { label: 'Sound effects', prompt: 'Add sound effects for game actions' },
  { label: 'Better graphics', prompt: 'Improve the visual design with animations and effects' },
];

export function SuggestionChips({
  suggestions,
  onSelect,
  disabled = false,
}: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion.prompt)}
          disabled={disabled}
          className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-3 w-3 text-accent/70 transition-colors group-hover:text-accent" />
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}
