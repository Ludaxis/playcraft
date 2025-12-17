'use client';

import React from 'react';
import { useTimer } from '@/hooks';

/**
 * Timer Component
 *
 * Displays a countdown timer with automatic updates.
 * Extracted from event buttons for reusability.
 *
 * @example
 * <Timer endTime={new Date(Date.now() + 3600000)} />
 * <Timer endTime={eventEndTime} variant="compact" />
 */

type TimerVariant = 'default' | 'compact' | 'badge';

interface TimerProps {
  endTime: Date | null;
  variant?: TimerVariant;
  className?: string;
  onExpire?: () => void;
}

export function Timer({
  endTime,
  variant = 'default',
  className = '',
  onExpire,
}: TimerProps) {
  const timer = useTimer(endTime);
  const isExpired = timer.total === 0;

  // Handle expiration
  React.useEffect(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  if (!endTime || isExpired) {
    return (
      <span className={`text-text-muted text-sm ${className}`}>
        Expired
      </span>
    );
  }

  // Format display based on remaining time
  let display: string;
  if (timer.days > 0) {
    display = `${timer.days}d ${timer.hours}h`;
  } else if (timer.hours > 0) {
    display = `${timer.hours}h ${timer.minutes}m`;
  } else {
    display = `${timer.minutes}m ${timer.seconds}s`;
  }

  if (variant === 'compact') {
    return (
      <span className={`text-text-secondary text-xs font-medium ${className}`}>
        {display}
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={`
          inline-flex items-center
          bg-bg-inverse text-text-inverse
          text-mini font-bold
          px-2 py-0.5
          rounded-full
          ${className}
        `}
      >
        {display}
      </span>
    );
  }

  // Default variant
  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center gap-1 text-text-primary font-bold">
        {timer.days > 0 && (
          <>
            <span className="text-lg">{timer.days}</span>
            <span className="text-xs text-text-muted">d</span>
          </>
        )}
        <span className="text-lg">{timer.hours.toString().padStart(2, '0')}</span>
        <span className="text-xs text-text-muted">:</span>
        <span className="text-lg">{timer.minutes.toString().padStart(2, '0')}</span>
        <span className="text-xs text-text-muted">:</span>
        <span className="text-lg">{timer.seconds.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
}

export type { TimerProps, TimerVariant };
