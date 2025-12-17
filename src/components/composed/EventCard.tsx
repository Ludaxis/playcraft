'use client';

import React from 'react';
import { Timer } from '@/components/base';

/**
 * EventCard Component
 *
 * Displays a LiveOps event button with timer.
 * Extracted from MainMenu for reusability.
 *
 * @example
 * <EventCard
 *   icon="RP"
 *   endTime={eventEndTime}
 *   onPress={() => navigate('royal-pass')}
 * />
 */

interface EventCardProps {
  icon: string;
  iconElement?: React.ReactNode;
  endTime: Date | null;
  onPress: () => void;
  className?: string;
}

export function EventCard({
  icon,
  iconElement,
  endTime,
  onPress,
  className = '',
}: EventCardProps) {
  return (
    <button
      onClick={onPress}
      className={`
        relative flex flex-col items-center
        ${className}
      `}
    >
      {/* Icon Circle */}
      <div
        className="
          w-14 h-14
          bg-bg-inverse
          rounded-full
          border-2 border-border
          shadow-lg
          flex items-center justify-center
          hover:opacity-90
          active:scale-95
          transition-all
        "
      >
        {iconElement || (
          <span className="text-text-inverse text-xs font-bold">{icon}</span>
        )}
      </div>

      {/* Timer Badge */}
      {endTime && (
        <div className="-mt-2 z-10">
          <Timer endTime={endTime} variant="badge" />
        </div>
      )}
    </button>
  );
}

export type { EventCardProps };
