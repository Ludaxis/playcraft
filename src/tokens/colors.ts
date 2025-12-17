/**
 * Design Token System - Colors
 *
 * Semantic color tokens that map to CSS variables.
 * These provide a consistent, theme-aware color system.
 *
 * Usage:
 * - Import tokens for TypeScript autocomplete
 * - Use corresponding Tailwind classes in components (e.g., bg-bg-page, text-text-primary)
 * - Colors are applied via CSS variables, making theming easy
 */

// Background colors
export const bgColors = {
  page: 'bg-bg-page',       // Main page background
  card: 'bg-bg-card',       // Cards, panels, modals
  muted: 'bg-bg-muted',     // Subtle backgrounds, hover states
  inverse: 'bg-bg-inverse', // Dark backgrounds (headers, buttons)
} as const;

// Text colors
export const textColors = {
  primary: 'text-text-primary',     // Headings, important text
  secondary: 'text-text-secondary', // Body text, descriptions
  muted: 'text-text-muted',         // Hints, captions, placeholders
  inverse: 'text-text-inverse',     // Text on dark backgrounds
} as const;

// Brand colors (configurable via admin)
export const brandColors = {
  primary: 'bg-brand-primary',   // Primary buttons, headers
  hover: 'bg-brand-hover',       // Hover states
  muted: 'bg-brand-muted',       // Light brand tint
  text: 'text-brand-primary',    // Brand-colored text
} as const;

// Status colors
export const statusColors = {
  success: 'bg-status-success',
  successText: 'text-status-success',
  warning: 'bg-status-warning',
  warningText: 'text-status-warning',
  error: 'bg-status-error',
  errorText: 'text-status-error',
} as const;

// Special colors
export const specialColors = {
  gold: 'bg-gold',
  goldText: 'text-gold',
  border: 'border-border',
  borderStrong: 'border-border-strong',
} as const;

// Combined colors object for easy access
export const colors = {
  bg: bgColors,
  text: textColors,
  brand: brandColors,
  status: statusColors,
  special: specialColors,
} as const;

// Color value types for TypeScript
export type BgColor = keyof typeof bgColors;
export type TextColor = keyof typeof textColors;
export type BrandColor = keyof typeof brandColors;
export type StatusColor = keyof typeof statusColors;
