/**
 * Centralized Registry
 *
 * Single source of truth for all pages, modals, events, and tabs.
 * Types are derived from these registries to ensure type safety.
 *
 * Usage:
 * import { PAGE_REGISTRY, EVENT_REGISTRY, MODAL_REGISTRY } from '@/config/registry';
 * import type { PageId, EventId, ModalId } from '@/config/registry';
 */

// =============================================================================
// PAGE REGISTRY
// =============================================================================

export const PAGE_REGISTRY = {
  // Main pages
  'main-menu': {
    id: 'main-menu',
    name: 'Main Menu',
    category: 'main',
  },
  'gameplay': {
    id: 'gameplay',
    name: 'Gameplay',
    category: 'main',
  },
  'shop': {
    id: 'shop',
    name: 'Shop',
    icon: '/icons/Shopping-2.svg',
    category: 'main',
  },
  'settings': {
    id: 'settings',
    name: 'Settings',
    icon: '/icons/Setting.svg',
    category: 'main',
  },
  'admin': {
    id: 'admin',
    name: 'Admin',
    category: 'admin',
  },
  'team': {
    id: 'team',
    name: 'Team',
    icon: '/icons/2User.svg',
    category: 'main',
  },
  'inbox': {
    id: 'inbox',
    name: 'Inbox',
    icon: '/icons/Mail.svg',
    category: 'main',
  },
  'leaderboard': {
    id: 'leaderboard',
    name: 'Leaderboard',
    icon: '/icons/Medal.svg',
    category: 'main',
  },
  'daily-rewards': {
    id: 'daily-rewards',
    name: 'Daily Rewards',
    icon: '/icons/Star.svg',
    category: 'main',
  },
  'profile': {
    id: 'profile',
    name: 'Profile',
    icon: '/icons/Profile.svg',
    category: 'main',
  },
  'friends': {
    id: 'friends',
    name: 'Friends',
    icon: '/icons/Heart.svg',
    category: 'main',
  },
  'boosters': {
    id: 'boosters',
    name: 'Boosters',
    icon: '/icons/Fire.svg',
    category: 'main',
  },
  'area-tasks': {
    id: 'area-tasks',
    name: 'Area Tasks',
    icon: '/icons/Star-Filled.svg',
    category: 'main',
  },
  // LiveOps event pages
  'royal-pass': {
    id: 'royal-pass',
    name: 'Royal Pass',
    icon: '/icons/Badge.svg',
    category: 'liveops',
  },
  'sky-race': {
    id: 'sky-race',
    name: 'Sky Race',
    icon: '/icons/Lightning.svg',
    category: 'liveops',
  },
  'kings-cup': {
    id: 'kings-cup',
    name: "King's Cup",
    icon: '/icons/Medal.svg',
    category: 'liveops',
  },
  'team-chest': {
    id: 'team-chest',
    name: 'Team Chest',
    icon: '/icons/Archive.svg',
    category: 'liveops',
  },
  'book-of-treasure': {
    id: 'book-of-treasure',
    name: 'Book of Treasure',
    icon: '/icons/Bookmark.svg',
    category: 'liveops',
  },
  'lightning-rush': {
    id: 'lightning-rush',
    name: 'Lightning Rush',
    icon: '/icons/Lightning.svg',
    category: 'liveops',
  },
  'lava-quest': {
    id: 'lava-quest',
    name: 'Lava Quest',
    icon: '/icons/Star-Filled.svg',
    category: 'liveops',
  },
  'mission-control': {
    id: 'mission-control',
    name: 'Mission Control',
    icon: '/icons/Flag.svg',
    category: 'liveops',
  },
  'album': {
    id: 'album',
    name: 'Album',
    icon: '/icons/Category.svg',
    category: 'liveops',
  },
  'collection': {
    id: 'collection',
    name: 'Collection',
    icon: '/icons/Archive.svg',
    category: 'liveops',
  },
  'winning-streak': {
    id: 'winning-streak',
    name: 'Winning Streak',
    icon: '/icons/Fire.svg',
    category: 'liveops',
  },
} as const;

// =============================================================================
// EVENT REGISTRY
// =============================================================================

export const EVENT_REGISTRY = {
  'royal-pass': {
    id: 'royal-pass',
    name: 'Royal Pass',
    icon: '/icons/Badge.svg',
    shortLabel: 'RP',
    page: 'royal-pass' as const,
    description: 'Complete tasks to earn premium rewards',
  },
  'sky-race': {
    id: 'sky-race',
    name: 'Sky Race',
    icon: '/icons/Lightning.svg',
    shortLabel: 'SR',
    page: 'sky-race' as const,
    description: 'Race against others to the top',
  },
  'kings-cup': {
    id: 'kings-cup',
    name: "King's Cup",
    icon: '/icons/Medal.svg',
    shortLabel: 'KC',
    page: 'kings-cup' as const,
    description: 'Compete for the royal crown',
  },
  'team-chest': {
    id: 'team-chest',
    name: 'Team Chest',
    icon: '/icons/Archive.svg',
    shortLabel: 'TC',
    page: 'team-chest' as const,
    description: 'Work with your team to unlock rewards',
  },
  'book-of-treasure': {
    id: 'book-of-treasure',
    name: 'Book of Treasure',
    icon: '/icons/Bookmark.svg',
    shortLabel: 'BT',
    page: 'book-of-treasure' as const,
    description: 'Complete chapters to find treasure',
  },
  'lightning-rush': {
    id: 'lightning-rush',
    name: 'Lightning Rush',
    icon: '/icons/Lightning.svg',
    shortLabel: 'LR',
    page: 'lightning-rush' as const,
    description: 'Quick challenges for fast rewards',
  },
  'lava-quest': {
    id: 'lava-quest',
    name: 'Lava Quest',
    icon: '/icons/Star-Filled.svg',
    shortLabel: 'LQ',
    page: 'lava-quest' as const,
    description: 'Navigate through volcanic challenges',
  },
  'mission-control': {
    id: 'mission-control',
    name: 'Mission Control',
    icon: '/icons/Flag.svg',
    shortLabel: 'MC',
    page: 'mission-control' as const,
    description: 'Complete missions for special rewards',
  },
  'album': {
    id: 'album',
    name: 'Album',
    icon: '/icons/Category.svg',
    shortLabel: 'AL',
    page: 'album' as const,
    description: 'Collect cards to complete your album',
  },
  'collection': {
    id: 'collection',
    name: 'Collection',
    icon: '/icons/Archive.svg',
    shortLabel: 'CO',
    page: 'collection' as const,
    description: 'Build your royal collection',
  },
  'winning-streak': {
    id: 'winning-streak',
    name: 'Winning Streak',
    icon: '/icons/Fire.svg',
    shortLabel: 'WS',
    page: 'winning-streak' as const,
    description: 'Keep your winning streak going',
  },
} as const;

// =============================================================================
// MODAL REGISTRY
// =============================================================================

export const MODAL_REGISTRY = {
  'level-start': { id: 'level-start', name: 'Level Start' },
  'level-complete': { id: 'level-complete', name: 'Level Complete' },
  'level-failed': { id: 'level-failed', name: 'Level Failed' },
  'purchase-confirm': { id: 'purchase-confirm', name: 'Purchase Confirm' },
  'reward-claim': { id: 'reward-claim', name: 'Reward Claim' },
  'area-complete': { id: 'area-complete', name: 'Area Complete' },
  'event-info': { id: 'event-info', name: 'Event Info' },
  'booster-select': { id: 'booster-select', name: 'Booster Select' },
  'out-of-lives': { id: 'out-of-lives', name: 'Out of Lives' },
  'help-request': { id: 'help-request', name: 'Help Request' },
  'settings': { id: 'settings', name: 'Settings' },
  'free-lives': { id: 'free-lives', name: 'Free Lives' },
  'profile-picture': { id: 'profile-picture', name: 'Profile Picture' },
  'edit-avatar': { id: 'edit-avatar', name: 'Edit Avatar' },
  'star-info': { id: 'star-info', name: 'Star Info' },
  'sign-in': { id: 'sign-in', name: 'Sign In' },
  'parental-control': { id: 'parental-control', name: 'Parental Control' },
  'privacy-policy': { id: 'privacy-policy', name: 'Privacy Policy' },
  'change-username': { id: 'change-username', name: 'Change Username' },
  'card-stars': { id: 'card-stars', name: 'Card Stars' },
  'collection-info': { id: 'collection-info', name: 'Collection Info' },
  'grand-prize': { id: 'grand-prize', name: 'Grand Prize' },
  'collection-set-detail': { id: 'collection-set-detail', name: 'Collection Set Detail' },
  'card-detail': { id: 'card-detail', name: 'Card Detail' },
  'profile': { id: 'profile', name: 'Profile' },
  'team-info': { id: 'team-info', name: 'Team Info' },
  'member-profile': { id: 'member-profile', name: 'Member Profile' },
  'weekly-contest-info': { id: 'weekly-contest-info', name: 'Weekly Contest Info' },
} as const;

// =============================================================================
// DERIVED TYPES
// =============================================================================

export type PageId = keyof typeof PAGE_REGISTRY;
export type EventId = keyof typeof EVENT_REGISTRY;
export type ModalId = keyof typeof MODAL_REGISTRY;

// Page categories for filtering
export type PageCategory = 'main' | 'liveops' | 'admin';

// Page config type
export interface PageConfig {
  id: PageId;
  name: string;
  icon?: string;
  category: PageCategory;
}

// Event config type
export interface EventConfig {
  id: EventId;
  name: string;
  icon: string;
  shortLabel: string;
  page: PageId;
  description: string;
}

// Modal config type
export interface ModalConfig {
  id: ModalId;
  name: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all page IDs
 */
export function getAllPageIds(): PageId[] {
  return Object.keys(PAGE_REGISTRY) as PageId[];
}

/**
 * Get pages by category
 */
export function getPagesByCategory(category: PageCategory): PageId[] {
  return (Object.entries(PAGE_REGISTRY) as [PageId, PageConfig][])
    .filter(([, config]) => config.category === category)
    .map(([id]) => id);
}

/**
 * Get all event IDs
 */
export function getAllEventIds(): EventId[] {
  return Object.keys(EVENT_REGISTRY) as EventId[];
}

/**
 * Get event config by ID
 */
export function getEventConfig(eventId: EventId): EventConfig {
  return EVENT_REGISTRY[eventId];
}

/**
 * Get all modal IDs
 */
export function getAllModalIds(): ModalId[] {
  return Object.keys(MODAL_REGISTRY) as ModalId[];
}

/**
 * Get page config by ID
 */
export function getPageConfig(pageId: PageId): PageConfig {
  return PAGE_REGISTRY[pageId];
}

/**
 * Get modal config by ID
 */
export function getModalConfig(modalId: ModalId): ModalConfig {
  return MODAL_REGISTRY[modalId];
}

/**
 * Check if a page ID is valid
 */
export function isValidPageId(id: string): id is PageId {
  return id in PAGE_REGISTRY;
}

/**
 * Check if an event ID is valid
 */
export function isValidEventId(id: string): id is EventId {
  return id in EVENT_REGISTRY;
}

/**
 * Check if a modal ID is valid
 */
export function isValidModalId(id: string): id is ModalId {
  return id in MODAL_REGISTRY;
}
