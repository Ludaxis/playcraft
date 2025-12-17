/**
 * Currencies Feature Types
 *
 * Type definitions for in-game currencies.
 */

// Currency type identifiers
export type CurrencyType = 'coins' | 'lives' | 'stars' | 'gems';

// Currency configuration
export interface CurrencyConfig {
  id: CurrencyType;
  name: string;
  icon: string;
  symbol?: string;
  maxValue?: number;
}

// Currency balance
export interface CurrencyBalance {
  type: CurrencyType;
  amount: number;
  maxAmount?: number;
}
