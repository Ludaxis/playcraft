/**
 * FEATURE FLAGS
 *
 * Toggle features on/off without changing code.
 * Set to `true` to enable, `false` to disable.
 *
 * Usage in components:
 * ```tsx
 * import { FEATURES } from '@/config/features';
 *
 * function MyComponent() {
 *   if (!FEATURES.TEAMS) return null;
 *   return <TeamFeature />;
 * }
 * ```
 */

export const FEATURES = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CORE SYSTEMS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Enable lives system (players need lives to play levels) */
  LIVES_SYSTEM: true,

  /** Enable coins currency */
  COINS_SYSTEM: true,

  /** Enable stars for area progression */
  STARS_SYSTEM: true,

  /** Enable boosters (power-ups) */
  BOOSTERS: true,

  /** Enable area/decoration meta-game */
  AREAS: true,

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL FEATURES
  // ═══════════════════════════════════════════════════════════════════════════

  /** Enable teams/clans */
  TEAMS: true,

  /** Enable friends list */
  FRIENDS: true,

  /** Enable leaderboards */
  LEADERBOARDS: true,

  /** Enable player profiles */
  PROFILES: true,

  // ═══════════════════════════════════════════════════════════════════════════
  // MONETIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  /** Enable in-app shop */
  SHOP: true,

  /** Enable in-app purchases */
  IAP: true,

  /** Enable rewarded ads */
  REWARDED_ADS: false,

  /** Enable interstitial ads */
  INTERSTITIAL_ADS: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGAGEMENT FEATURES
  // ═══════════════════════════════════════════════════════════════════════════

  /** Enable daily rewards */
  DAILY_REWARDS: true,

  /** Enable inbox/messages */
  INBOX: true,

  /** Enable push notifications (requires additional setup) */
  PUSH_NOTIFICATIONS: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // LIVEOPS EVENTS
  // Toggle which events are available in your game
  // ═══════════════════════════════════════════════════════════════════════════

  /** Royal Pass - Battle pass style progression */
  EVENT_ROYAL_PASS: true,

  /** Lightning Rush - Time-limited challenges */
  EVENT_LIGHTNING_RUSH: true,

  /** Sky Race - Race to the top */
  EVENT_SKY_RACE: true,

  /** King's Cup - Tournament competition */
  EVENT_KINGS_CUP: true,

  /** Team Chest - Cooperative rewards */
  EVENT_TEAM_CHEST: true,

  /** Lava Quest - Special quest chain */
  EVENT_LAVA_QUEST: true,

  /** Book of Treasure - Chapter-based rewards */
  EVENT_BOOK_OF_TREASURE: true,

  /** Mission Control - Daily/weekly missions */
  EVENT_MISSION_CONTROL: true,

  /** Winning Streak - Consecutive win bonuses */
  EVENT_WINNING_STREAK: true,

  /** Album - Collectible cards */
  EVENT_ALBUM: true,

  /** Collection - Item collection */
  EVENT_COLLECTION: true,

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN & DEBUG
  // ═══════════════════════════════════════════════════════════════════════════

  /** Show admin panel (for development/testing) */
  ADMIN_PANEL: true,

  /** Enable debug mode (extra logging, debug UI) */
  DEBUG_MODE: false,

  /** Enable export to PNG feature */
  EXPORT_TO_PNG: true,

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPERIMENTAL (Phase 2)
  // ═══════════════════════════════════════════════════════════════════════════

  /** New UI experiments */
  EXPERIMENTAL_UI: false,

  /** Dark mode support */
  DARK_MODE: false,

  /** Offline mode support */
  OFFLINE_MODE: false,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

/** Type for feature flag keys */
export type FeatureFlag = keyof typeof FEATURES;

/** Type for enabled features only */
export type EnabledFeature = {
  [K in FeatureFlag]: (typeof FEATURES)[K] extends true ? K : never;
}[FeatureFlag];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a feature is enabled.
 *
 * @example
 * if (isFeatureEnabled('TEAMS')) {
 *   // Show team UI
 * }
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return FEATURES[feature] === true;
}

/**
 * Check if multiple features are all enabled.
 *
 * @example
 * if (areAllFeaturesEnabled(['TEAMS', 'LEADERBOARDS'])) {
 *   // Show team leaderboard
 * }
 */
export function areAllFeaturesEnabled(features: FeatureFlag[]): boolean {
  return features.every((f) => FEATURES[f] === true);
}

/**
 * Check if any of the features are enabled.
 *
 * @example
 * if (isAnyFeatureEnabled(['REWARDED_ADS', 'INTERSTITIAL_ADS'])) {
 *   // Initialize ad SDK
 * }
 */
export function isAnyFeatureEnabled(features: FeatureFlag[]): boolean {
  return features.some((f) => FEATURES[f] === true);
}

/**
 * Get all enabled feature flags.
 *
 * @example
 * const enabled = getEnabledFeatures();
 * console.log('Enabled features:', enabled);
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return (Object.keys(FEATURES) as FeatureFlag[]).filter((f) => FEATURES[f] === true);
}

/**
 * Get all disabled feature flags.
 */
export function getDisabledFeatures(): FeatureFlag[] {
  return (Object.keys(FEATURES) as FeatureFlag[]).filter((f) => FEATURES[f] === false);
}

// =============================================================================
// REACT HOOK (for convenience)
// =============================================================================

/**
 * React hook to check feature flags.
 * Import this in components for reactive feature checks.
 *
 * @example
 * function MyComponent() {
 *   const features = useFeatures();
 *
 *   if (!features.TEAMS) return null;
 *   return <TeamUI />;
 * }
 */
export function useFeatures() {
  // Currently returns static object, but could be extended
  // to support runtime feature flag changes (A/B testing, remote config)
  return FEATURES;
}
