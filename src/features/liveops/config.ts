/**
 * LiveOps Feature Configuration
 *
 * Re-exports event configurations from the centralized registry.
 * Provides helper functions for working with events.
 */

import {
  EVENT_REGISTRY,
  getAllEventIds,
  getEventConfig,
  isValidEventId,
  type EventId,
  type EventConfig,
  type PageId,
} from '@/config/registry';

// Re-export from registry for backward compatibility
export { EVENT_REGISTRY as eventConfigs };
export { getAllEventIds, getEventConfig, isValidEventId };
export type { EventId, EventConfig };

/**
 * Get page for an event
 */
export function getEventPage(eventId: EventId): PageId {
  return EVENT_REGISTRY[eventId].page;
}

/**
 * Get short label for an event (for compact display)
 */
export function getEventShortLabel(eventId: EventId): string {
  return EVENT_REGISTRY[eventId].shortLabel;
}

/**
 * Get all event short labels as a map
 */
export const eventIconLabels: Record<EventId, string> = getAllEventIds().reduce(
  (acc, id) => {
    acc[id] = EVENT_REGISTRY[id].shortLabel;
    return acc;
  },
  {} as Record<EventId, string>
);
