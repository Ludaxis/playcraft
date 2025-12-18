/**
 * Navigation and routing types
 *
 * PageId, ModalId, and EventId are derived from the centralized registry.
 * This ensures type safety and single source of truth.
 */

// Re-export types from registry
export type { PageId, ModalId, EventId } from '@/config/registry';

// Import for use in interfaces
import type { PageId, ModalId } from '@/config/registry';

// Modal ID with null for empty stack
export type ModalIdOrNull = ModalId | null;

/**
 * Typed modal parameters
 *
 * Defines expected params for modals that require them.
 * Modals not listed accept no params or optional unknown params.
 */
export interface ModalParamsMap {
  'level-start': { level?: number };
  'card-detail': { card?: unknown; setName?: string; cardId?: string };
  'member-profile': { memberId: string };
  'team-info': { teamId: string };
}

// Type helper for modal params
export type ModalParams<T extends ModalId> = T extends keyof ModalParamsMap
  ? ModalParamsMap[T]
  : Record<string, unknown> | undefined;

export interface NavigationState {
  currentPage: PageId;
  previousPage: PageId | null;
  modalStack: ModalIdOrNull[];
  pageParams: Record<string, unknown>;
}

export interface NavigationAction {
  type: 'NAVIGATE' | 'GO_BACK' | 'OPEN_MODAL' | 'CLOSE_MODAL' | 'CLOSE_ALL_MODALS';
  payload?: {
    page?: PageId;
    modal?: ModalId;
    params?: Record<string, unknown>;
  };
}
