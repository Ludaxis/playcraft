/**
 * Features Module
 *
 * Central hub for all feature modules.
 * Each feature module contains its own types, config, and logic.
 *
 * Usage:
 * import { eventConfigs } from '@/features/liveops';
 * import { currencyConfigs } from '@/features/currencies';
 */

// Re-export feature modules
export * from './liveops';
export * from './currencies';
