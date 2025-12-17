/**
 * Design Token System - Typography
 *
 * Consistent typography scale for text sizes, weights, and line heights.
 * These tokens map to CSS utility classes defined in globals.css.
 *
 * Usage:
 * - Use CSS classes directly: className="text-h1 text-text-inverse"
 * - Or import these constants for programmatic use
 *
 * Typography Scale:
 * - Headings: text-h1, text-h2, text-h3, text-h4
 * - Body: text-body, text-body-sm
 * - UI: text-label, text-caption, text-button, text-button-lg
 * - Values: text-value, text-value-lg, text-value-sm
 * - Special: text-mini (for badges/tags)
 */

// CSS class names that map to globals.css typography utilities
export const typography = {
  // Headings
  h1: 'text-h1',           // 24px, bold
  h2: 'text-h2',           // 20px, bold
  h3: 'text-h3',           // 18px, bold
  h4: 'text-h4',           // 16px, bold

  // Body text
  body: 'text-body',       // 16px, normal
  bodySm: 'text-body-sm',  // 14px, normal

  // UI elements
  label: 'text-label',     // 14px, medium
  caption: 'text-caption', // 12px, normal
  button: 'text-button',   // 14px, bold
  buttonLg: 'text-button-lg', // 16px, bold

  // Values (numbers, stats, prices)
  value: 'text-value',     // 14px, bold
  valueLg: 'text-value-lg', // 18px, bold
  valueSm: 'text-value-sm', // 12px, bold

  // Mini text (badges, tags - minimum readable)
  mini: 'text-mini',       // 10px, bold, uppercase
} as const;

// Legacy exports for backwards compatibility
export const fontSize = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
} as const;

export const fontWeight = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

export const lineHeight = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
} as const;

// Legacy textStyles (use typography instead)
export const textStyles = {
  h1: typography.h1,
  h2: typography.h2,
  h3: typography.h3,
  h4: typography.h4,
  body: typography.body,
  bodySmall: typography.bodySm,
  label: typography.label,
  caption: typography.caption,
  button: typography.button,
  buttonLarge: typography.buttonLg,
  value: typography.value,
  valueLarge: typography.valueLg,
} as const;

export type Typography = keyof typeof typography;
export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type TextStyle = keyof typeof textStyles;
