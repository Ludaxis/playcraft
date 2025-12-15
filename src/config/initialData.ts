// Initial game state and mock data
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

// Time constants
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const initialPlayerState: PlayerState = {
  coins: 2500,
  lives: 5,
  maxLives: 5,
  stars: 12,
  currentLevel: 47,
  currentArea: 3,
  teamId: 'team-1',
  username: 'Player',
};

export const areas: Area[] = [
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

export const boosters: Booster[] = [
  { id: 'b1', name: 'Arrow', type: 'pre-game', count: 3, description: 'Start with an arrow on the board' },
  { id: 'b2', name: 'TNT', type: 'pre-game', count: 2, description: 'Start with TNT on the board' },
  { id: 'b3', name: 'Light Ball', type: 'pre-game', count: 1, description: 'Start with a light ball' },
  { id: 'b4', name: 'Jester Hat', type: 'in-game', count: 5, description: 'Shuffle all pieces' },
  { id: 'b5', name: 'Royal Hammer', type: 'in-game', count: 3, description: 'Remove any single piece' },
  { id: 'b6', name: 'Glove', type: 'in-game', count: 4, description: 'Swap any two pieces' },
  { id: 'b7', name: 'Cannon', type: 'in-game', count: 2, description: 'Clear entire row' },
];

// Factory function to create events with current timestamps (called client-side only)
// Currently only Lava Quest is enabled
export function createAllLiveOpsEvents(): LiveOpsEvent[] {
  const now = Date.now();
  return [
    {
      id: 'ev6',
      type: 'lava-quest',
      name: 'Lava Quest',
      active: true,
      endTime: new Date(now + 6 * HOUR),
      progress: 2,
      maxProgress: 10,
      rewards: [{ type: 'coins', amount: 10000 }],
    },
  ];
}

// Disabled LiveOps events (for future use)
/*
export function createAllLiveOpsEventsFullList(): LiveOpsEvent[] {
  const now = Date.now();
  return [
    { id: 'ev1', type: 'royal-pass', name: 'Royal Pass', active: true, endTime: new Date(now + 12 * DAY), progress: 450, maxProgress: 1000, rewards: [{ type: 'coins', amount: 500 }, { type: 'booster', amount: 2, name: 'TNT' }] },
    { id: 'ev2', type: 'sky-race', name: 'Sky Race', active: true, endTime: new Date(now + 2 * DAY), progress: 8, maxProgress: 15, rewards: [{ type: 'coins', amount: 1000 }] },
    { id: 'ev3', type: 'kings-cup', name: "King's Cup", active: true, endTime: new Date(now + 5 * DAY), progress: 2500, maxProgress: 10000, rewards: [{ type: 'booster', amount: 5, name: 'Hammer' }] },
    { id: 'ev4', type: 'team-chest', name: 'Team Chest', active: true, endTime: new Date(now + 3 * DAY), progress: 750, maxProgress: 1000, rewards: [{ type: 'coins', amount: 2000 }] },
    { id: 'ev5', type: 'lightning-rush', name: 'Lightning Rush', active: true, endTime: new Date(now + 1 * HOUR), progress: 3, maxProgress: 5, rewards: [{ type: 'lives', amount: 3 }] },
    { id: 'ev6', type: 'lava-quest', name: 'Lava Quest', active: true, endTime: new Date(now + 6 * HOUR), progress: 2, maxProgress: 10, rewards: [{ type: 'coins', amount: 10000 }] },
    { id: 'ev7', type: 'album', name: 'Summer Album', active: true, endTime: new Date(now + 30 * DAY), progress: 45, maxProgress: 135, rewards: [{ type: 'card', amount: 1, name: 'Rare Card' }] },
    { id: 'ev8', type: 'book-of-treasure', name: 'Book of Treasure', active: true, endTime: new Date(now + 7 * DAY), progress: 12, maxProgress: 50, rewards: [{ type: 'coins', amount: 3000 }] },
    { id: 'ev9', type: 'collection', name: 'Royal Collection', active: true, endTime: new Date(now + 14 * DAY), progress: 9, maxProgress: 10, rewards: [{ type: 'coins', amount: 5000 }] },
  ];
}
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
  maxMembers: 50,
  weeklyStars: 1575,
  rank: 234,
  chestProgress: 750,
  chestGoal: 1000,
};

export const shopItems: ShopItem[] = [
  { id: 's1', category: 'coins', name: 'Handful of Coins', price: 0.99, value: 500 },
  { id: 's2', category: 'coins', name: 'Pouch of Coins', price: 2.99, value: 1800, bonus: 200 },
  { id: 's3', category: 'coins', name: 'Bag of Coins', price: 4.99, value: 3500, bonus: 500, featured: true },
  { id: 's4', category: 'coins', name: 'Chest of Coins', price: 9.99, value: 8000, bonus: 1500 },
  { id: 's5', category: 'coins', name: 'Royal Treasury', price: 19.99, value: 18000, bonus: 4000 },
  { id: 's6', category: 'booster', name: 'Starter Pack', price: 1.99, value: 5 },
  { id: 's7', category: 'booster', name: 'Power Pack', price: 4.99, value: 15, featured: true },
  { id: 's8', category: 'special', name: 'No Ads Week', price: 3.99, value: 7 },
  { id: 's9', category: 'special', name: 'VIP Bundle', price: 14.99, value: 1, featured: true },
];

export const initialSettings: Settings = {
  music: true,
  sound: true,
  notifications: true,
  haptics: true,
  language: 'en',
};

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
      timestamp: new Date(now - 2 * HOUR),
    },
    {
      id: 'msg3',
      type: 'news',
      title: 'New Event!',
      content: 'Lightning Rush is now available!',
      claimed: true,
      timestamp: new Date(now - 1 * DAY),
    },
  ];
}

export const dailyRewards: DailyReward[] = [
  { day: 1, reward: { type: 'coins', amount: 50 }, claimed: true, current: false },
  { day: 2, reward: { type: 'booster', amount: 1, name: 'Hammer' }, claimed: true, current: false },
  { day: 3, reward: { type: 'coins', amount: 100 }, claimed: true, current: false },
  { day: 4, reward: { type: 'lives', amount: 3 }, claimed: false, current: true },
  { day: 5, reward: { type: 'booster', amount: 2, name: 'TNT' }, claimed: false, current: false },
  { day: 6, reward: { type: 'coins', amount: 200 }, claimed: false, current: false },
  { day: 7, reward: { type: 'coins', amount: 500 }, claimed: false, current: false },
];
