/**
 * Chat Messages Component
 * Displays chat message history with AI responses in modern UI
 * Features bullet points, card-style "Next steps" suggestions, and styled messages
 */

import { useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles, User, Check, Brain, Code, Save, AlertCircle, FolderOpen, Search, RefreshCw, Clock, FileCode, FilePlus, FileEdit, StopCircle } from 'lucide-react';
import type { ChatMessage, GenerationProgress, FileChangeInfo } from '../../types';
import { NextStepsCards } from './NextStepsCards';
import { cn } from '../../lib/utils';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;
  projectReady: boolean;
  isSettingUp: boolean;
  onSuggestionClick?: (prompt: string) => void;
  onCancelGeneration?: () => void;
}

function FeatureList({ features }: { features: string[] }) {
  if (!features || features.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-2 text-sm">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span className="text-content-muted">{feature}</span>
        </div>
      ))}
    </div>
  );
}

function MessageBubble({
  message,
  onSuggestionClick,
}: {
  message: ChatMessage;
  onSuggestionClick?: (prompt: string) => void;
}) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isAssistant = message.role === 'assistant';

  if (isSystem) {
    return (
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-surface-overlay/50 px-3 py-1 text-xs text-content-subtle">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? 'bg-surface-overlay'
            : 'bg-gradient-to-br from-accent to-secondary'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-content-muted" />
        ) : (
          <Sparkles className="h-4 w-4 text-content" />
        )}
      </div>

      {/* Message content */}
      <div className={`min-w-0 flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-accent text-content max-w-[85%]'
              : 'bg-surface-overlay text-content'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          {/* Features list for assistant messages */}
          {isAssistant && message.features && message.features.length > 0 && (
            <FeatureList features={message.features} />
          )}
        </div>

        {/* Next steps suggestions - Card style */}
        {isAssistant && message.nextSteps && message.nextSteps.length > 0 && (
          <div className="mt-4">
            <NextStepsCards
              steps={message.nextSteps}
              onStepClick={onSuggestionClick || (() => {})}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// File change item component
function FileChangeItem({ change }: { change: FileChangeInfo }) {
  const getIcon = () => {
    if (change.status === 'applying') {
      return <Loader2 className="h-3 w-3 animate-spin text-accent" />;
    }
    if (change.status === 'applied') {
      return <Check className="h-3 w-3 text-success" />;
    }
    if (change.status === 'error') {
      return <AlertCircle className="h-3 w-3 text-error" />;
    }
    switch (change.type) {
      case 'create':
        return <FilePlus className="h-3 w-3 text-success" />;
      case 'modify':
        return <FileEdit className="h-3 w-3 text-info" />;
      default:
        return <FileCode className="h-3 w-3 text-content-subtle" />;
    }
  };

  const fileName = change.path.split('/').pop() || change.path;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded text-xs',
        change.status === 'applying' && 'bg-accent/10',
        change.status === 'applied' && 'bg-success/10',
        change.status === 'error' && 'bg-error/10'
      )}
    >
      {getIcon()}
      <span className="truncate text-content-muted">{fileName}</span>
      {change.linesChanged !== undefined && (
        <span className="text-content-subtle ml-auto">
          {change.linesChanged > 0 ? '+' : ''}{change.linesChanged}
        </span>
      )}
    </div>
  );
}

// Progress indicator component with animated stages, timeout warnings, and file changes
function GenerationProgressIndicator({
  progress,
  onCancel
}: {
  progress: GenerationProgress;
  onCancel?: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [showFiles, setShowFiles] = useState(true);

  // Update elapsed time every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - progress.startedAt);
    }, 100);
    return () => clearInterval(interval);
  }, [progress.startedAt]);

  // Get icon based on stage
  const getIcon = () => {
    // Show clock icon if timeout warning
    if (progress.timeoutWarning) {
      return <Clock className="h-4 w-4 text-warning animate-pulse" />;
    }

    switch (progress.stage) {
      case 'preparing':
        return <FolderOpen className="h-4 w-4 text-accent animate-pulse" />;
      case 'analyzing':
        return <Brain className="h-4 w-4 text-accent animate-pulse" />;
      case 'generating':
        return <Code className="h-4 w-4 text-info animate-pulse" />;
      case 'processing':
        return <Sparkles className="h-4 w-4 text-accent animate-pulse" />;
      case 'applying':
        return <Save className="h-4 w-4 text-accent animate-pulse" />;
      case 'validating':
        return <Search className="h-4 w-4 text-warning animate-pulse" />;
      case 'retrying':
        return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case 'complete':
        return <Check className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-accent" />;
    }
  };

  // Format elapsed time
  const formatElapsed = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 1) return '';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const elapsedText = formatElapsed(elapsed);
  const percentComplete =
    typeof progress.completed === 'number' &&
    typeof progress.total === 'number' &&
    progress.total > 0
      ? Math.min(100, Math.round((progress.completed / progress.total) * 100))
      : null;

  // Determine message to show (timeout message takes priority)
  const displayMessage = progress.timeoutMessage || progress.message;

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-secondary">
        <Sparkles className="h-4 w-4 text-content" />
      </div>
      <div className={cn(
        "flex flex-col gap-2 rounded-2xl px-4 py-3 w-full max-w-md",
        progress.timeoutWarning ? "bg-warning/10 border border-warning/20" : "bg-surface-overlay"
      )}>
        {/* Main status line */}
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className={cn(
            "text-sm",
            progress.timeoutWarning ? "text-warning" : "text-content-muted"
          )}>
            {displayMessage}
          </span>
          {elapsedText && (
            <span className="text-xs text-content-subtle">({elapsedText})</span>
          )}
        </div>

        {/* Active item being processed */}
        {progress.activeItem && (
          <span className="text-xs text-content-subtle ml-6 truncate">
            {progress.activeItem}
          </span>
        )}

        {/* Progress bar */}
        {percentComplete !== null ? (
          <div className="ml-6 mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated/60">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progress.timeoutWarning
                  ? "bg-warning"
                  : "bg-gradient-to-r from-accent to-secondary"
              )}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        ) : (
          progress.stage !== 'complete' &&
          progress.stage !== 'error' && (
            <div className="ml-6 mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated/60">
              <div className={cn(
                "h-full w-1/3 animate-pulse rounded-full",
                progress.timeoutWarning
                  ? "bg-warning"
                  : "bg-gradient-to-r from-accent to-secondary"
              )} />
            </div>
          )
        )}

        {/* Detail/log section */}
        <div className="ml-6 flex flex-col gap-1">
          {progress.detail && (!progress.log || progress.log.length === 0) && (
            <span className="text-xs text-content-subtle">{progress.detail}</span>
          )}
          {progress.log && progress.log.length > 0 && (
            <ul className="text-xs text-content-subtle space-y-0.5">
              {progress.log.slice(-4).map((item, idx) => (
                <li key={`${item}-${idx}`} className="leading-relaxed before:mr-1 before:content-['•'] before:text-accent">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* File changes section */}
        {progress.fileChanges && progress.fileChanges.length > 0 && (
          <div className="ml-6 mt-2 border-t border-border/30 pt-2">
            <button
              onClick={() => setShowFiles(!showFiles)}
              className="flex items-center gap-1 text-xs text-content-subtle hover:text-content-muted transition-colors"
            >
              <FileCode className="h-3 w-3" />
              <span>
                {progress.fileChanges.length} file{progress.fileChanges.length !== 1 ? 's' : ''} changing
              </span>
              <span className="ml-1">{showFiles ? '▼' : '▶'}</span>
            </button>
            {showFiles && (
              <div className="mt-1.5 space-y-1 max-h-32 overflow-y-auto">
                {progress.fileChanges.map((change) => (
                  <FileChangeItem key={change.path} change={change} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Retry suggestion for timeout */}
        {progress.canRetry && progress.timeoutWarning && (
          <div className="ml-6 mt-2 text-xs text-warning">
            Tip: Try breaking your request into smaller steps
          </div>
        )}

        {/* Cancel button - always visible during generation */}
        {onCancel && progress.stage !== 'complete' && progress.stage !== 'error' && (
          <div className="ml-6 mt-3 pt-2 border-t border-border/30">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 text-xs text-content-subtle hover:text-error transition-colors px-2 py-1 rounded hover:bg-error/10"
            >
              <StopCircle className="h-3.5 w-3.5" />
              <span>Cancel generation</span>
            </button>
          </div>
        )}

        {/* Error details section */}
        {progress.stage === 'error' && progress.detail && (
          <div className="ml-6 mt-2 p-2 rounded bg-error/10 border border-error/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-error mt-0.5 shrink-0" />
              <div className="text-xs text-error">
                <p className="font-medium">Error details:</p>
                <p className="mt-1 text-error/80">{progress.detail}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatMessages({
  messages,
  isGenerating,
  generationProgress,
  projectReady,
  isSettingUp,
  onSuggestionClick,
  onCancelGeneration,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or progress updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating, generationProgress]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-auto p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSuggestionClick={onSuggestionClick}
          />
        ))}

        {/* Generating indicator with progress stages */}
        {isGenerating && generationProgress && (
          <GenerationProgressIndicator
            progress={generationProgress}
            onCancel={onCancelGeneration}
          />
        )}

        {/* Fallback generating indicator (no progress available) */}
        {isGenerating && !generationProgress && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-secondary">
              <Sparkles className="h-4 w-4 text-content" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-surface-overlay px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span className="text-sm text-content-muted">Generating your game...</span>
            </div>
          </div>
        )}

        {/* Getting started hint when no project is ready */}
        {!projectReady && !isSettingUp && messages.length === 1 && (
          <div className="mt-4 rounded-xl border border-border bg-gradient-to-b from-surface-overlay/50 to-surface-elevated/50 p-6">
            <h3 className="mb-2 font-medium text-content">Get Started</h3>
            <p className="mb-4 text-sm text-content-muted">
              Describe the game you want to build and I'll create it for you.
              Be specific about gameplay, visuals, and controls.
            </p>
            <div className="space-y-2 text-sm text-content-subtle">
              <p>Try something like:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>"Create a snake game with retro graphics"</li>
                <li>"Build a 2048 puzzle with colorful tiles"</li>
                <li>"Make a flappy bird clone with neon colors"</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
