'use client';

/**
 * Currencies Feature Configuration
 *
 * Centralized configuration for all in-game currencies.
 */

import type { CurrencyConfig, CurrencyType } from './types';

// All available currencies
export const currencyConfigs: Record<CurrencyType, CurrencyConfig> = {
  coins: {
    id: 'coins',
    name: 'Coins',
    icon: '/icons/Shopping-2.svg',
    symbol: '$',
  },
  lives: {
    id: 'lives',
    name: 'Lives',
    icon: '/icons/Heart-Filled.svg',
    maxValue: 5,
  },
  stars: {
    id: 'stars',
    name: 'Stars',
    icon: '/icons/Star-Filled.svg',
  },
  gems: {
    id: 'gems',
    name: 'Gems',
    icon: '/icons/Diamond.svg',
  },
};

// Get currency config by type
export function getCurrencyConfig(currencyType: CurrencyType): CurrencyConfig {
  return currencyConfigs[currencyType];
}

// Format currency display value
export function formatCurrencyValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}
