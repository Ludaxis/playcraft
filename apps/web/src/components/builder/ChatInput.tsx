/**
 * Chat Input Component
 * Modern chat input with unified container design
 * Features: Chat/Build mode toggle, file attachments, suggestion chips
 */

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, MessageSquare, Code, Paperclip, X, Image, FileText } from 'lucide-react';

export type ChatMode = 'build' | 'chat';

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
  disabled: boolean;
  placeholder?: string;
  suggestions?: SuggestionChip[];
  onSuggestionClick?: (prompt: string) => void;
  defaultMode?: ChatMode;
  onAttachFiles?: (files: File[]) => void;
  showAttach?: boolean;
}

// Default quick suggestions
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

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = 'Describe what you want to build...',
  suggestions = DEFAULT_SUGGESTIONS,
  onSuggestionClick,
  defaultMode = 'build',
  onAttachFiles,
  showAttach = true,
}: ChatInputProps) {
  const [mode, setMode] = useState<ChatMode>(defaultMode);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="bg-surface-elevated px-4 py-3">
      {/* Suggestion chips */}
      {suggestions.length > 0 && (
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

      {/* Main input container - unified rounded box */}
      <div className="overflow-hidden rounded-2xl border border-border-muted bg-surface-overlay">
        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
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
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={dynamicPlaceholder}
          className="w-full resize-none bg-transparent px-4 py-3 text-sm text-content placeholder-content-subtle outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          rows={1}
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3">
          {/* Left side - Attach button */}
          <div className="flex items-center gap-2">
            {showAttach && (
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
            {/* Chat/Build toggle */}
            <button
              onClick={() => setMode(mode === 'chat' ? 'build' : 'chat')}
              disabled={disabled}
              title={mode === 'chat' ? 'Chat without making edits to your project' : 'Build mode - AI will generate and edit code'}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                mode === 'chat'
                  ? 'bg-accent text-white'
                  : 'bg-accent text-white'
              }`}
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

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              title="Send message"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-content text-surface transition-all hover:bg-content/90 disabled:cursor-not-allowed disabled:bg-content-subtle disabled:opacity-50"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-2 flex items-center justify-center text-[11px] text-content-subtle">
        <span>Enter to send · Shift+Enter for new line</span>
      </div>
    </div>
  );
}
