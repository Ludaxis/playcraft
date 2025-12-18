/**
 * useEvent Hook
 *
 * Simplified hook for managing LiveOps event state.
 * Use this for displaying and updating event progress.
 *
 * @example
 * function EventProgress({ eventId }: { eventId: string }) {
 *   const { name, progress, maxProgress, percentComplete, isComplete, addProgress } = useEvent(eventId);
 *
 *   return (
 *     <div>
 *       <h3>{name}</h3>
 *       <ProgressBar value={percentComplete} />
 *       <span>{progress}/{maxProgress}</span>
 *       {!isComplete && <Button onClick={() => addProgress(1)}>+1</Button>}
 *     </div>
 *   );
 * }
 */

import { useCallback, useMemo } from 'react';
import { useGame, gameActions } from '@/store';
import type { EventId } from '@/config/registry';
import type { LiveOpsEvent } from '@/types';

interface UseEventOptions {
  /** If true, returns null values instead of throwing when event not found */
  optional?: boolean;
}

export function useEvent(eventId: EventId | string, options: UseEventOptions = {}) {
  const { state, dispatch } = useGame();

  // Find the event
  const event = useMemo(
    () => state.events.find((e) => e.id === eventId || e.type === eventId),
    [state.events, eventId]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add progress to the event.
   * @param amount - Amount to add (capped at maxProgress)
   */
  const addProgress = useCallback(
    (amount: number) => {
      if (!event) return;
      const newProgress = Math.min(event.maxProgress, event.progress + amount);
      dispatch(gameActions.updateEventProgress(event.id, newProgress));
    },
    [dispatch, event]
  );

  /**
   * Set progress to a specific value.
   * @param value - New progress value (capped at maxProgress)
   */
  const setProgress = useCallback(
    (value: number) => {
      if (!event) return;
      const newProgress = Math.max(0, Math.min(event.maxProgress, value));
      dispatch(gameActions.updateEventProgress(event.id, newProgress));
    },
    [dispatch, event]
  );

  /**
   * Reset progress to 0.
   */
  const resetProgress = useCallback(() => {
    if (!event) return;
    dispatch(gameActions.updateEventProgress(event.id, 0));
  }, [dispatch, event]);

  /**
   * Complete the event (set to max progress).
   */
  const complete = useCallback(() => {
    if (!event) return;
    dispatch(gameActions.updateEventProgress(event.id, event.maxProgress));
  }, [dispatch, event]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  // Static computed values (don't depend on time)
  const staticComputed = useMemo(() => {
    if (!event) {
      return {
        percentComplete: 0,
        isComplete: false,
        hasRewards: false,
      };
    }
    return {
      percentComplete: Math.round((event.progress / event.maxProgress) * 100),
      isComplete: event.progress >= event.maxProgress,
      hasRewards: event.rewards.length > 0,
    };
  }, [event]);

  // Time-based values should be computed using useTimer hook in components
  // Pass event.endTime to useTimer for accurate countdown
  const computed = {
    ...staticComputed,
    // isActive and time values should be derived from useTimer in the component
    isActive: event?.active ?? false,
    timeRemaining: 0, // Use useTimer hook for accurate countdown
    timeRemainingFormatted: '--:--', // Use useTimer hook for accurate countdown
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLE MISSING EVENT
  // ═══════════════════════════════════════════════════════════════════════════

  if (!event) {
    if (options.optional) {
      return {
        exists: false,
        id: eventId,
        name: null,
        type: null,
        progress: 0,
        maxProgress: 0,
        rewards: [],
        active: false,
        endTime: null,
        addProgress: () => {},
        setProgress: () => {},
        resetProgress: () => {},
        complete: () => {},
        ...computed,
        event: null,
      };
    }
    // For non-optional, return safe defaults (won't crash)
    return {
      exists: false,
      id: eventId,
      name: `Event ${eventId}`,
      type: eventId,
      progress: 0,
      maxProgress: 100,
      rewards: [],
      active: false,
      endTime: null,
      addProgress: () => {},
      setProgress: () => {},
      resetProgress: () => {},
      complete: () => {},
      ...computed,
      event: null,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // Meta
    exists: true,

    // Raw values
    id: event.id,
    name: event.name,
    type: event.type,
    progress: event.progress,
    maxProgress: event.maxProgress,
    rewards: event.rewards,
    active: event.active,
    endTime: event.endTime,

    // Actions
    addProgress,
    setProgress,
    resetProgress,
    complete,

    // Computed
    ...computed,

    // Full event object (if needed)
    event,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all active events.
 *
 * @example
 * const activeEvents = useActiveEvents();
 * return activeEvents.map(event => <EventCard key={event.id} event={event} />);
 */
export function useActiveEvents(): LiveOpsEvent[] {
  const { state } = useGame();

  // Filter by active flag only - time-based filtering should be done in components
  // using useTimer hook for accurate countdown
  return useMemo(() => {
    return state.events.filter((event) => event.active);
  }, [state.events]);
}

/**
 * Get all events (active and inactive).
 */
export function useAllEvents(): LiveOpsEvent[] {
  const { state } = useGame();
  return state.events;
}

// Type exports
export type UseEventReturn = ReturnType<typeof useEvent>;
