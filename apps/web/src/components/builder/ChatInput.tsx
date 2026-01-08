/**
 * Chat Input Component
 * Modern, centralized text input for sending messages to the AI
 * Features: Chat/Build mode toggle, file attachments, suggestion chips
 */

import { useState, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Code, Paperclip, X, Image, FileText } from 'lucide-react';

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
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const dynamicPlaceholder = mode === 'chat'
    ? 'Ask a question about your code...'
    : placeholder;

  return (
    <div className="border-t border-border-muted bg-surface-elevated">
      {/* Suggestion chips */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-4 pt-3">
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
      <div className="px-4 py-3">
        {/* Mode toggle - centered above input */}
        <div className="mb-3 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-border-muted bg-surface-overlay/60 p-1">
            <button
              onClick={() => setMode('chat')}
              disabled={disabled}
              title="Chat without making edits to your project"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                mode === 'chat'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-content-muted hover:text-content'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </button>
            <button
              onClick={() => setMode('build')}
              disabled={disabled}
              title="Build mode - AI will generate and edit code"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                mode === 'build'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-content-muted hover:text-content'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              Build
            </button>
          </div>
        </div>

        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-border-muted bg-surface-overlay/60 px-2 py-1.5"
                >
                  <FileIcon className="h-4 w-4 text-accent" />
                  <div className="flex flex-col">
                    <span className="max-w-[120px] truncate text-xs text-content">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-content-subtle">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="rounded p-0.5 text-content-subtle transition-colors hover:bg-surface-base hover:text-content"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2">
          {/* Attach button */}
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
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-muted bg-surface-overlay/60 text-content-muted transition-all hover:border-accent/50 hover:bg-accent/10 hover:text-accent-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Text input */}
          <div className="relative flex-1">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={dynamicPlaceholder}
              className="w-full resize-none rounded-xl border border-border-muted bg-surface-overlay/60 px-4 py-3 pr-4 text-sm text-content placeholder-content-subtle outline-none transition-all focus:border-accent/50 focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            title="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-sm transition-all hover:bg-accent-light hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-accent"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Footer hint */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-content-subtle">
          <span className="flex items-center gap-1">
            {mode === 'chat' ? (
              <>
                <MessageSquare className="h-3 w-3" />
                Chat mode: Ask questions without editing files
              </>
            ) : (
              <>
                <Code className="h-3 w-3" />
                Build mode: AI will generate and edit code
              </>
            )}
          </span>
          <span className="text-content-subtle/70">
            Enter to send · Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}
