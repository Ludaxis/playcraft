'use client';

/**
 * Theme Presets Configuration
 *
 * Pre-defined color themes that can be selected in the admin dashboard.
 * Each preset defines the brand colors that will be applied via CSS variables.
 *
 * To add a new theme:
 * 1. Add a new entry to themePresets object
 * 2. Define brandPrimary, brandHover, and brandMuted colors
 * 3. The theme will automatically appear in the admin dropdown
 */

export interface ThemePreset {
  id: string;
  name: string;
  brandPrimary: string;
  brandHover: string;
  brandMuted: string;
  // Optional: override other colors
  bgInverse?: string;
}

export const themePresets: Record<string, ThemePreset> = {
  grayscale: {
    id: 'grayscale',
    name: 'Grayscale (Default)',
    brandPrimary: '#374151',  // gray-700
    brandHover: '#1F2937',    // gray-800
    brandMuted: '#E5E7EB',    // gray-200
    bgInverse: '#374151',     // gray-700
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    brandPrimary: '#6366F1',  // indigo-500
    brandHover: '#4F46E5',    // indigo-600
    brandMuted: '#E0E7FF',    // indigo-100
    bgInverse: '#4F46E5',     // indigo-600
  },
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    brandPrimary: '#3B82F6',  // blue-500
    brandHover: '#2563EB',    // blue-600
    brandMuted: '#DBEAFE',    // blue-100
    bgInverse: '#2563EB',     // blue-600
  },
  green: {
    id: 'green',
    name: 'Forest Green',
    brandPrimary: '#059669',  // emerald-600
    brandHover: '#047857',    // emerald-700
    brandMuted: '#D1FAE5',    // emerald-100
    bgInverse: '#047857',     // emerald-700
  },
  orange: {
    id: 'orange',
    name: 'Sunset Orange',
    brandPrimary: '#EA580C',  // orange-600
    brandHover: '#C2410C',    // orange-700
    brandMuted: '#FFEDD5',    // orange-100
    bgInverse: '#C2410C',     // orange-700
  },
  pink: {
    id: 'pink',
    name: 'Rose Pink',
    brandPrimary: '#DB2777',  // pink-600
    brandHover: '#BE185D',    // pink-700
    brandMuted: '#FCE7F3',    // pink-100
    bgInverse: '#BE185D',     // pink-700
  },
  teal: {
    id: 'teal',
    name: 'Teal',
    brandPrimary: '#0D9488',  // teal-600
    brandHover: '#0F766E',    // teal-700
    brandMuted: '#CCFBF1',    // teal-100
    bgInverse: '#0F766E',     // teal-700
  },
};

// Default theme
export const defaultThemePreset = themePresets.grayscale;

// Get preset by ID
export function getThemePreset(id: string): ThemePreset {
  return themePresets[id] || defaultThemePreset;
}

// Get all preset IDs for dropdown
export function getThemePresetIds(): string[] {
  return Object.keys(themePresets);
}

// Apply theme preset to document
export function applyThemePreset(preset: ThemePreset): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply brand colors
  root.style.setProperty('--color-brand-primary', preset.brandPrimary);
  root.style.setProperty('--color-brand-hover', preset.brandHover);
  root.style.setProperty('--color-brand-muted', preset.brandMuted);

  // Apply inverse background if defined
  if (preset.bgInverse) {
    root.style.setProperty('--color-bg-inverse', preset.bgInverse);
  }
}
