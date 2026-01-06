/**
 * Chat Messages Component
 * Displays chat message history with AI responses in modern UI
 * Features bullet points, card-style "Next steps" suggestions, and styled messages
 */

import { useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles, User, Check, Brain, Code, Save, AlertCircle, FolderOpen, Search, RefreshCw } from 'lucide-react';
import type { ChatMessage, GenerationProgress } from '../../types';
import { NextStepsCards } from './NextStepsCards';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;
  projectReady: boolean;
  isSettingUp: boolean;
  onSuggestionClick?: (prompt: string) => void;
}

function FeatureList({ features }: { features: string[] }) {
  if (!features || features.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-2 text-sm">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
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
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-accent text-content'
              : 'bg-surface-overlay text-gray-200'
          }`}
          style={{ maxWidth: isUser ? '85%' : '100%' }}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

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

// Progress indicator component with animated stages
function GenerationProgressIndicator({ progress }: { progress: GenerationProgress }) {
  const [elapsed, setElapsed] = useState(0);

  // Update elapsed time every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - progress.startedAt);
    }, 100);
    return () => clearInterval(interval);
  }, [progress.startedAt]);

  // Get icon based on stage
  const getIcon = () => {
    switch (progress.stage) {
      case 'preparing':
        return <FolderOpen className="h-4 w-4 text-accent animate-pulse" />;
      case 'analyzing':
        return <Brain className="h-4 w-4 text-purple-400 animate-pulse" />;
      case 'generating':
        return <Code className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'processing':
        return <Sparkles className="h-4 w-4 text-accent animate-pulse" />;
      case 'applying':
        return <Save className="h-4 w-4 text-accent animate-pulse" />;
      case 'validating':
        return <Search className="h-4 w-4 text-yellow-400 animate-pulse" />;
      case 'retrying':
        return <RefreshCw className="h-4 w-4 text-orange-400 animate-spin" />;
      case 'complete':
        return <Check className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
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

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-secondary">
        <Sparkles className="h-4 w-4 text-content" />
      </div>
      <div className="flex flex-col gap-1 rounded-2xl bg-surface-overlay px-4 py-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm text-content-muted">{progress.message}</span>
          {elapsedText && (
            <span className="text-xs text-content-subtle">({elapsedText})</span>
          )}
        </div>
        {progress.detail && (
          <span className="text-xs text-content-subtle ml-6">{progress.detail}</span>
        )}
        {/* Progress dots animation */}
        {progress.stage !== 'complete' && progress.stage !== 'error' && (
          <div className="flex gap-1 ml-6 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
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
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or progress updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating, generationProgress]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
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
          <GenerationProgressIndicator progress={generationProgress} />
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
