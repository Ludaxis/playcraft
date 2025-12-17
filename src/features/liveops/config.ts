'use client';

/**
 * LiveOps Feature Configuration
 *
 * Centralized configuration for all LiveOps events.
 * Add new events here to make them available in the app.
 */

import type { EventConfig, EventTypeId } from './types';
import type { PageId } from '@/types';

// All available events
export const eventConfigs: Record<EventTypeId, EventConfig> = {
  'royal-pass': {
    id: 'royal-pass',
    name: 'Royal Pass',
    icon: '/icons/Badge.svg',
    page: 'royal-pass',
    description: 'Complete tasks to earn premium rewards',
  },
  'sky-race': {
    id: 'sky-race',
    name: 'Sky Race',
    icon: '/icons/Lightning.svg',
    page: 'sky-race',
    description: 'Race against others to the top',
  },
  'kings-cup': {
    id: 'kings-cup',
    name: "King's Cup",
    icon: '/icons/Medal.svg',
    page: 'kings-cup',
    description: 'Compete for the royal crown',
  },
  'team-chest': {
    id: 'team-chest',
    name: 'Team Chest',
    icon: '/icons/Archive.svg',
    page: 'team-chest',
    description: 'Work with your team to unlock rewards',
  },
  'book-of-treasure': {
    id: 'book-of-treasure',
    name: 'Book of Treasure',
    icon: '/icons/Bookmark.svg',
    page: 'book-of-treasure',
    description: 'Complete chapters to find treasure',
  },
  'lightning-rush': {
    id: 'lightning-rush',
    name: 'Lightning Rush',
    icon: '/icons/Lightning.svg',
    page: 'lightning-rush',
    description: 'Quick challenges for fast rewards',
  },
  'lava-quest': {
    id: 'lava-quest',
    name: 'Lava Quest',
    icon: '/icons/Star-Filled.svg',
    page: 'lava-quest',
    description: 'Navigate through volcanic challenges',
  },
  'mission-control': {
    id: 'mission-control',
    name: 'Mission Control',
    icon: '/icons/Flag.svg',
    page: 'mission-control',
    description: 'Complete missions for special rewards',
  },
  'album': {
    id: 'album',
    name: 'Album',
    icon: '/icons/Category.svg',
    page: 'album',
    description: 'Collect cards to complete your album',
  },
  'collection': {
    id: 'collection',
    name: 'Collection',
    icon: '/icons/Archive.svg',
    page: 'collection',
    description: 'Build your royal collection',
  },
};

// Get event config by ID
export function getEventConfig(eventId: EventTypeId): EventConfig | undefined {
  return eventConfigs[eventId];
}

// Get page for an event
export function getEventPage(eventId: EventTypeId): PageId {
  return eventConfigs[eventId]?.page || 'main-menu';
}

// Get all event IDs
export function getAllEventIds(): EventTypeId[] {
  return Object.keys(eventConfigs) as EventTypeId[];
}

// Short icon labels (for compact display)
export const eventIconLabels: Record<EventTypeId, string> = {
  'royal-pass': 'RP',
  'sky-race': 'SR',
  'kings-cup': 'KC',
  'team-chest': 'TC',
  'book-of-treasure': 'BT',
  'lightning-rush': 'LR',
  'lava-quest': 'LQ',
  'mission-control': 'MC',
  'album': 'AL',
  'collection': 'CO',
};
