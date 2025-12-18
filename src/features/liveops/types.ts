/**
 * LiveOps Feature Types
 *
 * Re-exports types from the centralized registry.
 * Provides additional LiveOps-specific types.
 */

// Re-export core types from registry
export type { EventId, EventConfig, PageId } from '@/config/registry';

// Legacy type alias for backward compatibility
export type EventTypeId = import('@/config/registry').EventId;

// Active event state (runtime state, not in registry)
export interface ActiveEvent {
  id: import('@/config/registry').EventId;
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
