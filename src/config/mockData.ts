/**
 * Mock Data Configuration
 *
 * Centralized mock data for the prototype.
 * Easy to modify for different demo scenarios.
 */

// Winning Streak mock data
export const winningStreakMockData = {
  current: 117,
  target: 200,
  // Dynamic end time calculation (1d 16h from now)
  getEndTime: () => new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
};

// Event timer mock (2d 20h from now)
export const getEventEndTime = () =>
  new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000);

// Shop mock data
export const shopMockData = {
  coinPacks: [
    { coins: 1000, price: '$2.98' },
    { coins: 5000, price: '$9.98' },
    { coins: 10000, price: '$19.98' },
  ],
  specialOfferItems: [
    { icon: 'ARW', count: 1 },
    { icon: 'TNT', count: 1 },
    { icon: 'HAM', count: 1 },
    { icon: 'GLV', count: 1 },
    { icon: 'INF', count: '1h' },
    { icon: 'GFT' },
  ],
  princeItems: [
    { icon: 'ARW', count: 1 },
    { icon: 'TNT', count: 1 },
    { icon: 'HAM', count: 1 },
    { icon: 'GLV', count: 1 },
    { icon: 'INF', count: '1h' },
    { icon: 'GFT' },
  ],
  queenItems: [
    { icon: 'ARW', count: 2 },
    { icon: 'TNT', count: 2 },
    { icon: 'HAM', count: 2 },
    { icon: 'GLV', count: 2 },
    { icon: 'INF', count: '12h' },
    { icon: 'GFT' },
  ],
};

// Types for shop items
export interface ShopItem {
  icon: string;
  count?: number | string;
}

export interface CoinPack {
  coins: number;
  price: string;
}
