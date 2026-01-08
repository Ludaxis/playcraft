/**
 * Chat Input Component
 * Unified chat input used across Landing, Home, and Builder pages
 * Features: variants for different contexts, Chat/Build toggle, file attachments, animated placeholder
 */

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, MessageSquare, Code, Paperclip, X, Image, FileText } from 'lucide-react';

export type ChatMode = 'build' | 'chat';
export type ChatInputVariant = 'landing' | 'home' | 'builder';

interface SuggestionChip {
  label: string;
  prompt: string;
}

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  file: File;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (mode: ChatMode) => void;
  disabled?: boolean;
  placeholder?: string;
  // Variant controls the overall look and features
  variant?: ChatInputVariant;
  // Builder-specific props
  suggestions?: SuggestionChip[];
  onSuggestionClick?: (prompt: string) => void;
  defaultMode?: ChatMode;
  onAttachFiles?: (files: File[]) => void;
  showAttach?: boolean;
  showModeToggle?: boolean;
  // Landing-specific props
  animatedPhrases?: string[];
  staticPrefix?: string;
}

// Default quick suggestions for builder
const DEFAULT_SUGGESTIONS: SuggestionChip[] = [
  { label: 'Add power-ups', prompt: 'Add power-up items that give special abilities' },
  { label: 'Sound effects', prompt: 'Add sound effects for game actions' },
  { label: 'Better graphics', prompt: 'Improve the visual design with animations and effects' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  return FileText;
}

// Hook for typewriter animation
function useTypewriter(phrases: string[], enabled: boolean, typingSpeed = 80, deletingSpeed = 40, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!enabled || phrases.length === 0) return;

    const currentPhrase = phrases[phraseIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      } else {
        const deleteTimer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(deleteTimer);
      }
    } else {
      if (displayText === currentPhrase) {
        setIsPaused(true);
      } else {
        const typeTimer = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(typeTimer);
      }
    }
  }, [displayText, phraseIndex, isDeleting, isPaused, phrases, enabled, typingSpeed, deletingSpeed, pauseTime]);

  return displayText;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Describe what you want to build...',
  variant = 'builder',
  suggestions = DEFAULT_SUGGESTIONS,
  onSuggestionClick,
  defaultMode = 'build',
  onAttachFiles,
  showAttach = true,
  showModeToggle = true,
  animatedPhrases = [],
  staticPrefix = '',
}: ChatInputProps) {
  const [mode, setMode] = useState<ChatMode>(defaultMode);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Animated placeholder for landing variant
  const hasAnimatedPlaceholder = variant === 'landing' && animatedPhrases.length > 0;
  const animatedText = useTypewriter(animatedPhrases, hasAnimatedPlaceholder && !isFocused && !value);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend(mode);
      }
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
    if (value.trim()) {
      onSend(mode);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newAttached = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      }));
      setAttachedFiles(prev => [...prev, ...newAttached]);
      onAttachFiles?.(files);
    }
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const dynamicPlaceholder = mode === 'chat'
    ? 'Ask a question about your code...'
    : placeholder;

  // Feature flags based on variant
  const showSuggestions = variant === 'builder' && suggestions.length > 0;
  const showAttachButton = variant === 'builder' && showAttach;
  const showModeToggleButton = variant === 'builder' && showModeToggle;
  const isLanding = variant === 'landing';

  // Style variants
  const containerStyles = isLanding
    ? 'rounded-2xl bg-white/95 shadow-2xl overflow-hidden'
    : 'overflow-hidden rounded-2xl border border-border-muted bg-surface-overlay';

  const textareaStyles = isLanding
    ? 'w-full resize-none bg-transparent text-gray-800 placeholder-gray-400 outline-none text-base'
    : 'w-full resize-none bg-transparent text-sm text-content placeholder-content-subtle outline-none disabled:cursor-not-allowed disabled:opacity-50';

  const sendButtonStyles = isLanding
    ? 'flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white transition-colors'
    : 'flex h-8 w-8 items-center justify-center rounded-full bg-content text-surface transition-all hover:bg-content/90 disabled:cursor-not-allowed disabled:bg-content-subtle disabled:opacity-50';

  return (
    <div className={isLanding ? '' : 'bg-surface-elevated px-4 py-3'}>
      {/* Suggestion chips - builder only */}
      {showSuggestions && (
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.prompt)}
              disabled={disabled}
              className="group flex items-center gap-1.5 rounded-full border border-border-muted bg-surface-overlay/60 px-3 py-1.5 text-xs text-content-muted transition-all hover:border-accent/50 hover:bg-accent/10 hover:text-accent-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3 text-accent/70 transition-colors group-hover:text-accent" />
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {/* Main input container */}
      <div className={containerStyles}>
        {/* Attached files preview - builder only */}
        {attachedFiles.length > 0 && variant === 'builder' && (
          <div className="flex flex-wrap gap-2 border-b border-border-muted px-4 py-2">
            {attachedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg bg-surface-base px-2 py-1"
                >
                  <FileIcon className="h-4 w-4 text-accent" />
                  <span className="max-w-[120px] truncate text-xs text-content">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-content-subtle">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="rounded p-0.5 text-content-subtle transition-colors hover:bg-surface-elevated hover:text-content"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Text input area */}
        <div className={isLanding ? 'p-4 relative' : 'px-4 py-3'}>
          {/* Animated placeholder overlay - landing only */}
          {hasAnimatedPlaceholder && !isFocused && !value && (
            <div className="absolute inset-0 p-4 pointer-events-none text-base text-gray-400">
              <span>{staticPrefix}</span>
              <span className="text-gray-600">{animatedText}</span>
              <span className="inline-block w-0.5 h-5 bg-gray-400 ml-0.5 animate-pulse align-middle" />
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !value && setIsFocused(false)}
            placeholder={hasAnimatedPlaceholder ? (isFocused ? dynamicPlaceholder : '') : dynamicPlaceholder}
            className={textareaStyles}
            disabled={disabled}
            rows={isLanding ? 2 : 1}
            style={{ minHeight: isLanding ? '60px' : '44px', maxHeight: '120px' }}
          />
        </div>

        {/* Bottom toolbar */}
        <div className={`flex items-center justify-between ${isLanding ? 'px-4 py-3 border-t border-gray-100' : 'px-3 pb-3'}`}>
          {/* Left side - Attach button (builder only) */}
          <div className="flex items-center gap-2">
            {showAttachButton && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.txt,.json,.md,.csv"
                />
                <button
                  onClick={handleAttachClick}
                  disabled={disabled}
                  title="Attach files"
                  className="flex items-center gap-1.5 rounded-full border border-border-muted bg-transparent px-3 py-1.5 text-xs text-content-muted transition-all hover:border-content-subtle hover:text-content disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>Attach</span>
                </button>
              </>
            )}
          </div>

          {/* Right side - Mode toggle + Send */}
          <div className="flex items-center gap-2">
            {/* Chat/Build toggle - builder only */}
            {showModeToggleButton && (
              <button
                onClick={() => setMode(mode === 'chat' ? 'build' : 'chat')}
                disabled={disabled}
                title={mode === 'chat' ? 'Chat without making edits to your project' : 'Build mode - AI will generate and edit code'}
                className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white transition-all"
              >
                {mode === 'chat' ? (
                  <>
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat</span>
                  </>
                ) : (
                  <>
                    <Code className="h-3.5 w-3.5" />
                    <span>Build</span>
                  </>
                )}
              </button>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              title="Send message"
              className={sendButtonStyles}
            >
              <ArrowUp className={isLanding ? 'h-5 w-5' : 'h-4 w-4'} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer hint - builder only */}
      {variant === 'builder' && (
        <div className="mt-2 flex items-center justify-center text-[11px] text-content-subtle">
          <span>Enter to send · Shift+Enter for new line</span>
        </div>
      )}
    </div>
  );
}
