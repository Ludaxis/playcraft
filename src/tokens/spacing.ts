/**
 * Design Token System - Spacing
 *
 * Consistent spacing scale based on 4px base unit.
 * Use these values for margins, padding, and gaps.
 *
 * Usage:
 * - spacing.sm for small gaps (8px)
 * - spacing.md for medium gaps (16px)
 * - spacing.lg for large gaps (24px)
 */

export const spacing = {
  // Base scale (matches Tailwind)
  0: '0',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
} as const;

// Semantic spacing aliases
export const spacingAliases = {
  none: spacing[0],
  xs: spacing[1],      // 4px - Tight spacing
  sm: spacing[2],      // 8px - Small gaps
  md: spacing[4],      // 16px - Default spacing
  lg: spacing[6],      // 24px - Large gaps
  xl: spacing[8],      // 32px - Extra large
  '2xl': spacing[12],  // 48px - Section spacing
} as const;

// Padding classes
export const padding = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const;

// Gap classes
export const gap = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
} as const;

// Margin classes
export const margin = {
  none: 'm-0',
  xs: 'm-1',
  sm: 'm-2',
  md: 'm-4',
  lg: 'm-6',
  xl: 'm-8',
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingAlias = keyof typeof spacingAliases;
