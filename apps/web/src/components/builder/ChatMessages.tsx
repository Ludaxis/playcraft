/**
 * Chat Messages Component
 * Displays chat message history with AI responses in modern UI
 * Features bullet points, card-style "Next steps" suggestions, and styled messages
 */

import { useEffect, useRef } from 'react';
import { Loader2, Sparkles, User, Check } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { NextStepsCards } from './NextStepsCards';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isGenerating: boolean;
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

export function ChatMessages({
  messages,
  isGenerating,
  projectReady,
  isSettingUp,
  onSuggestionClick,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

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

        {/* Generating indicator */}
        {isGenerating && (
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
