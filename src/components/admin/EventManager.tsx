'use client';

import React from 'react';
import Image from 'next/image';
import { useAdmin } from '@/store';
import { allEvents } from '@/config/adminDefaults';

export function EventManager() {
  const { config, toggleEvent, isEventEnabled } = useAdmin();
  const enabledCount = config.enabledEvents.length;

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        {enabledCount} event{enabledCount !== 1 ? 's' : ''} enabled
      </p>

      <div className="space-y-2">
        {allEvents.map((event) => {
          const enabled = isEventEnabled(event.id);

          return (
            <div
              key={event.id}
              className={`flex items-center gap-3 rounded-lg p-2 border transition-colors ${
                enabled
                  ? 'bg-surface-light border-surface'
                  : 'bg-surface-lighter border-surface opacity-60'
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                enabled ? 'bg-accent' : 'bg-surface-dark'
              }`}>
                <Image
                  src={event.icon}
                  alt={event.name}
                  width={20}
                  height={20}
                  className={enabled ? 'brightness-0 invert' : 'opacity-50'}
                />
              </div>

              {/* Name */}
              <div className="flex-1">
                <p className={`font-bold text-sm ${enabled ? 'text-primary' : 'text-muted-foreground'}`}>
                  {event.name}
                </p>
                <p className="text-muted text-xs">{event.id}</p>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleEvent(event.id, !enabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  enabled ? 'bg-accent' : 'bg-surface-dark'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                    enabled ? 'right-1 bg-white' : 'left-1 bg-muted-foreground'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
