/**
 * Initial Game State
 *
 * This file creates the initial state for the game.
 * Configuration values come from game.config.ts - edit that file to customize!
 */

import type {
  PlayerState,
  Area,
  Booster,
  LiveOpsEvent,
  Team,
  ShopItem,
  Settings,
  InboxMessage,
  DailyReward,
} from '@/types';

import {
  playerDefaults,
  boosterDefaults,
  areaDefaults,
  shopDefaults,
  dailyRewardDefaults,
  settingsDefaults,
  teamDefaults,
  TIME,
} from './game.config';

// =============================================================================
// PLAYER STATE
// =============================================================================

/**
 * Initial player state.
 * Values come from game.config.ts playerDefaults.
 */
export const initialPlayerState: PlayerState = {
  coins: playerDefaults.startingCoins,
  lives: playerDefaults.startingLives,
  maxLives: playerDefaults.maxLives,
  stars: playerDefaults.startingStars,
  currentLevel: playerDefaults.startingLevel,
  currentArea: playerDefaults.startingArea,
  teamId: 'team-1',
  username: playerDefaults.defaultUsername,
};

// =============================================================================
// AREAS
// =============================================================================

/**
 * Game areas (meta-game progression).
 * Defined in game.config.ts areaDefaults.
 */
export const areas: Area[] = areaDefaults;

// =============================================================================
// BOOSTERS
// =============================================================================

/**
 * Available boosters.
 * Defined in game.config.ts boosterDefaults.
 */
export const boosters: Booster[] = boosterDefaults;

// =============================================================================
// LIVEOPS EVENTS
// =============================================================================

/**
 * Factory function to create events with current timestamps.
 * Called client-side only to avoid hydration mismatch.
 */
export function createAllLiveOpsEvents(): LiveOpsEvent[] {
  const now = Date.now();

  return [
    {
      id: 'ev6',
      type: 'lava-quest',
      name: 'Lava Quest',
      active: true,
      endTime: new Date(now + 6 * TIME.HOUR),
      progress: 2,
      maxProgress: 10,
      rewards: [{ type: 'coins', amount: 10000 }],
    },
  ];
}

/**
 * Full list of LiveOps events (for reference/testing).
 * Uncomment and use createAllLiveOpsEventsFullList() if needed.
 */
export function createAllLiveOpsEventsFullList(): LiveOpsEvent[] {
  const now = Date.now();

  return [
    {
      id: 'ev1',
      type: 'royal-pass',
      name: 'Royal Pass',
      active: true,
      endTime: new Date(now + 12 * TIME.DAY),
      progress: 450,
      maxProgress: 1000,
      rewards: [
        { type: 'coins', amount: 500 },
        { type: 'booster', amount: 2, name: 'TNT' },
      ],
    },
    {
      id: 'ev2',
      type: 'sky-race',
      name: 'Sky Race',
      active: true,
      endTime: new Date(now + 2 * TIME.DAY),
      progress: 8,
      maxProgress: 15,
      rewards: [{ type: 'coins', amount: 1000 }],
    },
    {
      id: 'ev3',
      type: 'kings-cup',
      name: "King's Cup",
      active: true,
      endTime: new Date(now + 5 * TIME.DAY),
      progress: 2500,
      maxProgress: 10000,
      rewards: [{ type: 'booster', amount: 5, name: 'Hammer' }],
    },
    {
      id: 'ev4',
      type: 'team-chest',
      name: 'Team Chest',
      active: true,
      endTime: new Date(now + 3 * TIME.DAY),
      progress: 750,
      maxProgress: 1000,
      rewards: [{ type: 'coins', amount: 2000 }],
    },
    {
      id: 'ev5',
      type: 'lightning-rush',
      name: 'Lightning Rush',
      active: true,
      endTime: new Date(now + 1 * TIME.HOUR),
      progress: 3,
      maxProgress: 5,
      rewards: [{ type: 'lives', amount: 3 }],
    },
    {
      id: 'ev6',
      type: 'lava-quest',
      name: 'Lava Quest',
      active: true,
      endTime: new Date(now + 6 * TIME.HOUR),
      progress: 2,
      maxProgress: 10,
      rewards: [{ type: 'coins', amount: 10000 }],
    },
    {
      id: 'ev7',
      type: 'album',
      name: 'Summer Album',
      active: true,
      endTime: new Date(now + 30 * TIME.DAY),
      progress: 45,
      maxProgress: 135,
      rewards: [{ type: 'card', amount: 1, name: 'Rare Card' }],
    },
    {
      id: 'ev8',
      type: 'book-of-treasure',
      name: 'Book of Treasure',
      active: true,
      endTime: new Date(now + 7 * TIME.DAY),
      progress: 12,
      maxProgress: 50,
      rewards: [{ type: 'coins', amount: 3000 }],
    },
    {
      id: 'ev9',
      type: 'collection',
      name: 'Royal Collection',
      active: true,
      endTime: new Date(now + 14 * TIME.DAY),
      progress: 9,
      maxProgress: 10,
      rewards: [{ type: 'coins', amount: 5000 }],
    },
    {
      id: 'ev10',
      type: 'mission-control',
      name: 'Mission Control',
      active: true,
      endTime: new Date(now + 7 * TIME.DAY),
      progress: 3,
      maxProgress: 10,
      rewards: [{ type: 'coins', amount: 2500 }],
    },
    {
      id: 'ev11',
      type: 'winning-streak',
      name: 'Winning Streak',
      active: true,
      endTime: new Date(now + 3 * TIME.DAY),
      progress: 2,
      maxProgress: 7,
      rewards: [{ type: 'booster', amount: 3, name: 'Hammer' }],
    },
  ];
}

// =============================================================================
// TEAM
// =============================================================================

/**
 * Default team data.
 */
export const team: Team = {
  id: 'team-1',
  name: 'Royal Champions',
  members: [
    { id: 'm1', username: 'Player', level: 47, contributedStars: 125, online: true },
    { id: 'm2', username: 'KingArthur', level: 89, contributedStars: 340, online: true },
    { id: 'm3', username: 'QueenBee', level: 156, contributedStars: 520, online: false },
    { id: 'm4', username: 'RoyalKnight', level: 72, contributedStars: 210, online: true },
    { id: 'm5', username: 'DukeMaster', level: 103, contributedStars: 380, online: false },
  ],
  maxMembers: teamDefaults.maxMembers,
  weeklyStars: 1575,
  rank: 234,
  chestProgress: 750,
  chestGoal: teamDefaults.chestGoal,
};

// =============================================================================
// SHOP
// =============================================================================

/**
 * Shop items.
 * Defined in game.config.ts shopDefaults.
 */
export const shopItems: ShopItem[] = shopDefaults;

// =============================================================================
// SETTINGS
// =============================================================================

/**
 * Default player settings.
 * Defined in game.config.ts settingsDefaults.
 */
export const initialSettings: Settings = settingsDefaults;

// =============================================================================
// INBOX
// =============================================================================

/**
 * Factory function to create inbox messages with current timestamps.
 */
export function createInboxMessages(): InboxMessage[] {
  const now = Date.now();

  return [
    {
      id: 'msg1',
      type: 'reward',
      title: 'Daily Bonus',
      content: 'Claim your daily reward!',
      claimed: false,
      reward: { type: 'coins', amount: 100 },
      timestamp: new Date(now),
    },
    {
      id: 'msg2',
      type: 'team',
      title: 'Team Request',
      content: 'StarPlayer wants to join your team',
      claimed: false,
      timestamp: new Date(now - 2 * TIME.HOUR),
    },
    {
      id: 'msg3',
      type: 'news',
      title: 'New Event!',
      content: 'Lightning Rush is now available!',
      claimed: true,
      timestamp: new Date(now - 1 * TIME.DAY),
    },
  ];
}

// =============================================================================
// DAILY REWARDS
// =============================================================================

/**
 * Daily rewards configuration.
 * Defined in game.config.ts dailyRewardDefaults.
 */
export const dailyRewards: DailyReward[] = dailyRewardDefaults;
