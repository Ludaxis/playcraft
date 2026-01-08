/**
 * Chat Input Component
 * Unified chat input used across Landing, Home, and Builder pages
 * All features available everywhere - auth required callback for unauthenticated users
 */

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, MessageSquare, Code, Paperclip, X, Image, FileText } from 'lucide-react';

export type ChatMode = 'build' | 'chat';

// Image data to send to AI
export interface ChatImage {
  data: string; // base64 encoded
  mimeType: string;
  name: string;
}

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  file: File;
  base64?: string; // Cached base64 data for images
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (mode: ChatMode, images?: ChatImage[]) => void;
  disabled?: boolean;
  placeholder?: string;
  defaultMode?: ChatMode;
  onAttachFiles?: (files: File[]) => void;
  // Auth callback - called when unauthenticated user tries to use a feature
  onAuthRequired?: () => void;
  // Landing-specific props
  animatedPhrases?: string[];
  staticPrefix?: string;
}

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
  defaultMode = 'build',
  onAttachFiles,
  onAuthRequired,
  animatedPhrases = [],
  staticPrefix = '',
}: ChatInputProps) {
  const [mode, setMode] = useState<ChatMode>(defaultMode);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragCounterRef = useRef(0);

  // Animated placeholder
  const hasAnimatedPlaceholder = animatedPhrases.length > 0;
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
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (!value.trim()) return;

    if (onAuthRequired) {
      // Store prompt and trigger auth
      localStorage.setItem('playcraft_pending_prompt', value.trim());
      onAuthRequired();
      return;
    }

    // Extract images from attached files
    const images: ChatImage[] = attachedFiles
      .filter(f => f.type.startsWith('image/') && f.base64)
      .map(f => ({
        data: f.base64!,
        mimeType: f.type,
        name: f.name,
      }));

    // Clear attached files after sending
    setAttachedFiles([]);

    // Send with images if any
    onSend(mode, images.length > 0 ? images : undefined);
  };

  const handleAttachClick = () => {
    if (onAuthRequired) {
      onAuthRequired();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Process files and convert images to base64
      const newAttached: AttachedFile[] = await Promise.all(
        files.map(async (file) => {
          const attached: AttachedFile = {
            name: file.name,
            type: file.type,
            size: file.size,
            file,
          };

          // Convert images to base64 for AI analysis
          if (file.type.startsWith('image/')) {
            try {
              const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  // Remove data URL prefix to get pure base64
                  const result = reader.result as string;
                  const base64Data = result.split(',')[1];
                  resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
              attached.base64 = base64;
            } catch (err) {
              console.warn('Failed to convert image to base64:', err);
            }
          }

          return attached;
        })
      );

      setAttachedFiles(prev => [...prev, ...newAttached]);

      // Still call onAttachFiles for non-image files (asset upload)
      const nonImageFiles = files.filter(f => !f.type.startsWith('image/'));
      if (nonImageFiles.length > 0) {
        onAttachFiles?.(nonImageFiles);
      }
    }
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Process files (shared by file input and drag/drop)
  const processFiles = async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      // Non-image files go to asset upload
      onAttachFiles?.(files);
      return;
    }

    // Process images for AI
    const newAttached: AttachedFile[] = await Promise.all(
      imageFiles.map(async (file) => {
        const attached: AttachedFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          file,
        };

        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          attached.base64 = base64;
        } catch (err) {
          console.warn('Failed to convert image to base64:', err);
        }

        return attached;
      })
    );

    setAttachedFiles(prev => [...prev, ...newAttached]);

    // Handle non-image files
    const nonImageFiles = files.filter(f => !f.type.startsWith('image/'));
    if (nonImageFiles.length > 0) {
      onAttachFiles?.(nonImageFiles);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (onAuthRequired) {
      onAuthRequired();
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const dynamicPlaceholder = mode === 'chat'
    ? 'Ask a question about your code...'
    : placeholder;

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative"
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-accent bg-accent/10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-accent">
            <Image className="h-8 w-8" />
            <span className="text-sm font-medium">Drop images here</span>
          </div>
        </div>
      )}

      {/* Main input container */}
      <div className={`overflow-hidden rounded-2xl border bg-black/40 backdrop-blur-xl transition-colors ${isDragging ? 'border-accent' : 'border-white/10'}`}>
        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
          <div className="border-b border-white/10 px-4 py-2">
            {/* AI vision indicator */}
            {attachedFiles.some(f => f.type.startsWith('image/')) && (
              <div className="mb-2 flex items-center gap-1.5 text-[11px] text-accent">
                <Image className="h-3 w-3" />
                <span>📸 {attachedFiles.filter(f => f.type.startsWith('image/')).length} image(s) will be sent to AI for analysis</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              const isImage = file.type.startsWith('image/');
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1 ${isImage ? 'bg-accent/20 ring-1 ring-accent/30' : 'bg-white/10'}`}
                  title={isImage ? 'This image will be sent to AI' : undefined}
                >
                  <FileIcon className={`h-4 w-4 ${isImage ? 'text-accent' : 'text-white/70'}`} />
                  <span className="max-w-[120px] truncate text-xs text-white">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-white/50">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="rounded p-0.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* Text input area */}
        <div className="relative px-4 py-3">
          {/* Animated placeholder overlay */}
          {hasAnimatedPlaceholder && !isFocused && !value && (
            <div className="pointer-events-none absolute inset-0 px-4 py-3 text-base text-white/50">
              <span>{staticPrefix}</span>
              <span className="text-white/70">{animatedText}</span>
              <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-white/50 align-middle" />
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
            className="w-full resize-none bg-transparent text-base text-white placeholder-white/40 outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            rows={1}
            style={{ minHeight: '28px', maxHeight: '120px' }}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3">
          {/* Left side - Attach button */}
          <div className="flex items-center gap-2">
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
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-transparent px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span>Attach</span>
            </button>
          </div>

          {/* Right side - Mode toggle + Send */}
          <div className="flex items-center gap-2">
            {/* Chat/Build toggle */}
            <button
              onClick={() => setMode(mode === 'chat' ? 'build' : 'chat')}
              disabled={disabled}
              title={mode === 'chat' ? 'Chat without making edits to your project' : 'Build mode - AI will generate and edit code'}
              className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-accent-light"
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black transition-all hover:bg-white disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-2 flex items-center justify-center text-[11px] text-white/40">
        <span>Enter to send · Shift+Enter for new line</span>
      </div>
    </div>
  );
}
