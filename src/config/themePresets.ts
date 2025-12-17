'use client';

/**
 * Wireframe Theme Presets Configuration
 *
 * Pre-defined grayscale themes for wireframe design.
 * Different gray intensity levels for visual variation while
 * maintaining the wireframe aesthetic.
 *
 * All themes use grayscale colors only - no brand colors.
 */

export interface ThemePreset {
  id: string;
  name: string;
  brandPrimary: string;
  brandHover: string;
  brandMuted: string;
  bgInverse?: string;
}

export const themePresets: Record<string, ThemePreset> = {
  // Standard wireframe - medium contrast
  wireframe: {
    id: 'wireframe',
    name: 'Wireframe (Default)',
    brandPrimary: '#333333',  // Dark gray
    brandHover: '#4D4D4D',    // Medium-dark gray
    brandMuted: '#E5E5E5',    // Light gray
    bgInverse: '#333333',     // Dark gray
  },
  // High contrast wireframe - black headers
  highContrast: {
    id: 'highContrast',
    name: 'High Contrast',
    brandPrimary: '#1A1A1A',  // Near black
    brandHover: '#333333',    // Dark gray
    brandMuted: '#F0F0F0',    // Very light gray
    bgInverse: '#1A1A1A',     // Near black
  },
  // Low contrast wireframe - softer grays
  lowContrast: {
    id: 'lowContrast',
    name: 'Low Contrast',
    brandPrimary: '#666666',  // Medium gray
    brandHover: '#808080',    // Gray
    brandMuted: '#F5F5F5',    // Near white
    bgInverse: '#666666',     // Medium gray
  },
  // Light wireframe - white headers with dark text
  light: {
    id: 'light',
    name: 'Light Mode',
    brandPrimary: '#4D4D4D',  // Medium-dark gray
    brandHover: '#666666',    // Medium gray
    brandMuted: '#F0F0F0',    // Very light gray
    bgInverse: '#4D4D4D',     // Medium-dark gray
  },
  // Dark wireframe - darker overall
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    brandPrimary: '#1A1A1A',  // Near black
    brandHover: '#2D2D2D',    // Dark gray
    brandMuted: '#CCCCCC',    // Light gray
    bgInverse: '#1A1A1A',     // Near black
  },
  // Blueprint style - slightly blue-tinted grays
  blueprint: {
    id: 'blueprint',
    name: 'Blueprint',
    brandPrimary: '#3D4852',  // Blue-gray dark
    brandHover: '#2C3640',    // Darker blue-gray
    brandMuted: '#E8ECF0',    // Blue-gray light
    bgInverse: '#3D4852',     // Blue-gray dark
  },
  // Sketch style - warm gray tones
  sketch: {
    id: 'sketch',
    name: 'Sketch',
    brandPrimary: '#4A4541',  // Warm dark gray
    brandHover: '#3A3632',    // Darker warm gray
    brandMuted: '#F5F3F0',    // Warm light gray
    bgInverse: '#4A4541',     // Warm dark gray
  },
};

// Default theme
export const defaultThemePreset = themePresets.wireframe;

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

  // Apply brand colors (grayscale)
  root.style.setProperty('--color-brand-primary', preset.brandPrimary);
  root.style.setProperty('--color-brand-hover', preset.brandHover);
  root.style.setProperty('--color-brand-muted', preset.brandMuted);

  // Apply inverse background if defined
  if (preset.bgInverse) {
    root.style.setProperty('--color-bg-inverse', preset.bgInverse);
  }
}
