/**
 * LiveOps Feature Types
 *
 * Type definitions for LiveOps events system.
 */

import type { PageId } from '@/types';

// Event type identifiers
export type EventTypeId =
  | 'royal-pass'
  | 'sky-race'
  | 'kings-cup'
  | 'team-chest'
  | 'book-of-treasure'
  | 'lightning-rush'
  | 'lava-quest'
  | 'mission-control'
  | 'album'
  | 'collection';

// Event configuration
export interface EventConfig {
  id: EventTypeId;
  name: string;
  icon: string;
  page: PageId;
  description?: string;
}

// Active event state
export interface ActiveEvent {
  id: EventTypeId;
  endTime: Date | null;
  progress: number;
  maxProgress: number;
}

// Reward types
export type RewardType = 'coins' | 'booster' | 'lives' | 'stars' | 'card' | 'chest' | 'gift';

export interface EventReward {
  type: RewardType;
  amount: number;
  name?: string;
  icon?: string;
}
