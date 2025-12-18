/**
 * GAME CONFIGURATION
 *
 * This is the central configuration file for your puzzle game.
 * Edit the values below to customize your game without touching code.
 *
 * For game designers: This is the main file you'll edit!
 */

import type { Booster, ShopItem, DailyReward, Reward } from '@/types';

// =============================================================================
// GAME INFO
// =============================================================================

export const gameInfo = {
  name: 'Puzzle Kit',
  version: '1.0.0',
  description: 'A customizable puzzle game template',
} as const;

// =============================================================================
// PLAYER DEFAULTS
// =============================================================================

/**
 * Starting values for new players.
 * Adjust these to change game difficulty/generosity.
 */
export const playerDefaults = {
  /** Starting coins for new players */
  startingCoins: 2500,

  /** Starting lives */
  startingLives: 5,

  /** Maximum lives a player can have */
  maxLives: 5,

  /** Starting stars (used for area progression) */
  startingStars: 12,

  /** Starting level */
  startingLevel: 47,

  /** Starting area */
  startingArea: 3,

  /** Default username */
  defaultUsername: 'Player',
} as const;

// =============================================================================
// CURRENCIES
// =============================================================================

/**
 * Currency definitions.
 * Add new currencies here if your game needs them.
 */
export const currencies = {
  coins: {
    id: 'coins',
    name: 'Coins',
    icon: '/icons/Coin.svg',
    description: 'Main currency for purchases',
  },
  gems: {
    id: 'gems',
    name: 'Gems',
    icon: '/icons/Diamond.svg',
    description: 'Premium currency',
  },
  stars: {
    id: 'stars',
    name: 'Stars',
    icon: '/icons/Star.svg',
    description: 'Earned by completing levels',
  },
  lives: {
    id: 'lives',
    name: 'Lives',
    icon: '/icons/Heart.svg',
    description: 'Required to play levels',
  },
} as const;

// =============================================================================
// BOOSTERS
// =============================================================================

/**
 * Booster definitions.
 * type: 'pre-game' = selected before level starts
 * type: 'in-game' = used during gameplay
 */
export const boosterDefaults: Booster[] = [
  {
    id: 'arrow',
    name: 'Arrow',
    type: 'pre-game',
    count: 3,
    description: 'Start with an arrow on the board',
  },
  {
    id: 'tnt',
    name: 'TNT',
    type: 'pre-game',
    count: 2,
    description: 'Start with TNT on the board',
  },
  {
    id: 'light-ball',
    name: 'Light Ball',
    type: 'pre-game',
    count: 1,
    description: 'Start with a light ball',
  },
  {
    id: 'jester-hat',
    name: 'Jester Hat',
    type: 'in-game',
    count: 5,
    description: 'Shuffle all pieces',
  },
  {
    id: 'royal-hammer',
    name: 'Royal Hammer',
    type: 'in-game',
    count: 3,
    description: 'Remove any single piece',
  },
  {
    id: 'glove',
    name: 'Glove',
    type: 'in-game',
    count: 4,
    description: 'Swap any two pieces',
  },
  {
    id: 'cannon',
    name: 'Cannon',
    type: 'in-game',
    count: 2,
    description: 'Clear entire row',
  },
];

// =============================================================================
// AREAS (Game Progression)
// =============================================================================

/**
 * Area definitions for meta-game progression.
 * Each area has tasks that require stars to complete.
 */
export const areaDefaults = [
  {
    id: 1,
    name: 'Throne Room',
    tasks: [
      { id: 't1-1', name: 'Repair Floor', starsRequired: 1, completed: true },
      { id: 't1-2', name: 'Place Throne', starsRequired: 2, completed: true },
      { id: 't1-3', name: 'Hang Curtains', starsRequired: 1, completed: true },
    ],
    completed: true,
    unlocked: true,
  },
  {
    id: 2,
    name: 'Royal Garden',
    tasks: [
      { id: 't2-1', name: 'Plant Flowers', starsRequired: 1, completed: true },
      { id: 't2-2', name: 'Build Fountain', starsRequired: 2, completed: true },
      { id: 't2-3', name: 'Add Benches', starsRequired: 1, completed: true },
    ],
    completed: true,
    unlocked: true,
  },
  {
    id: 3,
    name: 'Dining Hall',
    tasks: [
      { id: 't3-1', name: 'Set Table', starsRequired: 1, completed: true },
      { id: 't3-2', name: 'Hang Chandelier', starsRequired: 2, completed: false },
      { id: 't3-3', name: 'Place Paintings', starsRequired: 2, completed: false },
      { id: 't3-4', name: 'Add Fireplace', starsRequired: 1, completed: false },
    ],
    completed: false,
    unlocked: true,
  },
  {
    id: 4,
    name: 'Library',
    tasks: [
      { id: 't4-1', name: 'Install Shelves', starsRequired: 2, completed: false },
      { id: 't4-2', name: 'Add Reading Nook', starsRequired: 2, completed: false },
      { id: 't4-3', name: 'Place Globe', starsRequired: 1, completed: false },
    ],
    completed: false,
    unlocked: false,
  },
];

// =============================================================================
// SHOP
// =============================================================================

/**
 * Shop item definitions.
 * category: 'coins' | 'booster' | 'special'
 */
export const shopDefaults: ShopItem[] = [
  // Coin Packs
  { id: 's1', category: 'coins', name: 'Handful of Coins', price: 0.99, value: 500 },
  { id: 's2', category: 'coins', name: 'Pouch of Coins', price: 2.99, value: 1800, bonus: 200 },
  { id: 's3', category: 'coins', name: 'Bag of Coins', price: 4.99, value: 3500, bonus: 500, featured: true },
  { id: 's4', category: 'coins', name: 'Chest of Coins', price: 9.99, value: 8000, bonus: 1500 },
  { id: 's5', category: 'coins', name: 'Royal Treasury', price: 19.99, value: 18000, bonus: 4000 },

  // Booster Packs
  { id: 's6', category: 'booster', name: 'Starter Pack', price: 1.99, value: 5 },
  { id: 's7', category: 'booster', name: 'Power Pack', price: 4.99, value: 15, featured: true },

  // Special Items
  { id: 's8', category: 'special', name: 'No Ads Week', price: 3.99, value: 7 },
  { id: 's9', category: 'special', name: 'VIP Bundle', price: 14.99, value: 1, featured: true },
];

// =============================================================================
// DAILY REWARDS
// =============================================================================

/**
 * Daily login rewards.
 * Players receive these for consecutive daily logins.
 */
export const dailyRewardDefaults: DailyReward[] = [
  { day: 1, reward: { type: 'coins', amount: 50 } as Reward, claimed: true, current: false },
  { day: 2, reward: { type: 'booster', amount: 1, name: 'Hammer' } as Reward, claimed: true, current: false },
  { day: 3, reward: { type: 'coins', amount: 100 } as Reward, claimed: true, current: false },
  { day: 4, reward: { type: 'lives', amount: 3 } as Reward, claimed: false, current: true },
  { day: 5, reward: { type: 'booster', amount: 2, name: 'TNT' } as Reward, claimed: false, current: false },
  { day: 6, reward: { type: 'coins', amount: 200 } as Reward, claimed: false, current: false },
  { day: 7, reward: { type: 'coins', amount: 500 } as Reward, claimed: false, current: false },
];

// =============================================================================
// TEAM DEFAULTS
// =============================================================================

/**
 * Default team configuration.
 */
export const teamDefaults = {
  maxMembers: 50,
  chestGoal: 1000,
};

// =============================================================================
// SETTINGS
// =============================================================================

/**
 * Default player settings.
 */
export const settingsDefaults = {
  music: true,
  sound: true,
  notifications: true,
  haptics: true,
  language: 'en' as const,
};

// =============================================================================
// TIME CONSTANTS (for convenience)
// =============================================================================

export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

// =============================================================================
// EXPORT ALL CONFIG
// =============================================================================

/**
 * Complete game configuration object.
 * Import this for access to all config values.
 */
export const gameConfig = {
  game: gameInfo,
  player: playerDefaults,
  currencies,
  boosters: boosterDefaults,
  areas: areaDefaults,
  shop: shopDefaults,
  dailyRewards: dailyRewardDefaults,
  team: teamDefaults,
  settings: settingsDefaults,
  time: TIME,
} as const;

export default gameConfig;
