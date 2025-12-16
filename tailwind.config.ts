import type { Config } from 'tailwindcss';

/**
 * Puzzle Kit - Centralized Theme Configuration
 *
 * To change the color palette or fonts, edit this file only.
 * All components use semantic color names that reference these values.
 *
 * Color System:
 * - primary: Main dark color for headers, important elements
 * - secondary: Medium tone for containers, navigation
 * - surface: Background colors (light to dark variants)
 * - muted: Subdued text and icons
 * - border: Borders and dividers
 * - accent: Featured/highlighted elements (purple theme)
 * - gold: Premium/VIP elements
 * - success: Positive actions, confirmations
 * - error: Errors, destructive actions
 * - warning: Warnings, alerts
 */

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════════
      // COLORS - Edit these to change the entire app's color palette
      // ═══════════════════════════════════════════════════════════════════
      colors: {
        // Primary colors (dark tones)
        primary: {
          DEFAULT: '#1e293b', // slate-800
          light: '#334155',   // slate-700
          dark: '#0f172a',    // slate-900
        },

        // Secondary colors (medium tones)
        secondary: {
          DEFAULT: '#475569', // slate-600
          light: '#64748b',   // slate-500
          dark: '#334155',    // slate-700
        },

        // Surface colors (backgrounds)
        surface: {
          DEFAULT: '#cbd5e1', // slate-300
          light: '#e2e8f0',   // slate-200
          lighter: '#f1f5f9', // slate-100
          lightest: '#f8fafc', // slate-50
          dark: '#94a3b8',    // slate-400
          darker: '#64748b',  // slate-500
        },

        // Muted colors (subdued elements)
        muted: {
          DEFAULT: '#94a3b8', // slate-400
          light: '#cbd5e1',   // slate-300
          dark: '#64748b',    // slate-500
          foreground: '#64748b', // slate-500
        },

        // Border colors
        border: {
          DEFAULT: '#cbd5e1', // slate-300
          light: '#e2e8f0',   // slate-200
          dark: '#94a3b8',    // slate-400
        },

        // Accent colors (featured elements)
        accent: {
          DEFAULT: '#7c3aed', // violet-600
          light: '#8b5cf6',   // violet-500
          dark: '#6d28d9',    // violet-700
          darker: '#5b21b6',  // violet-800
          muted: '#a78bfa',   // violet-400
        },

        // Gold colors (premium/VIP)
        gold: {
          DEFAULT: '#fbbf24', // amber-400
          light: '#fcd34d',   // amber-300
          dark: '#f59e0b',    // amber-500
          darker: '#d97706',  // amber-600
        },

        // Success colors
        success: {
          DEFAULT: '#22c55e', // green-500
          light: '#4ade80',   // green-400
          dark: '#16a34a',    // green-600
        },

        // Error colors
        error: {
          DEFAULT: '#ef4444', // red-500
          light: '#f87171',   // red-400
          dark: '#dc2626',    // red-600
        },

        // Warning colors
        warning: {
          DEFAULT: '#f59e0b', // amber-500
          light: '#fbbf24',   // amber-400
          dark: '#d97706',    // amber-600
        },

        // Info colors
        info: {
          DEFAULT: '#3b82f6', // blue-500
          light: '#60a5fa',   // blue-400
          dark: '#2563eb',    // blue-600
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // FONTS - Edit these to change typography
      // ═══════════════════════════════════════════════════════════════════
      fontFamily: {
        // Primary font for all text
        sans: [
          'var(--font-sans)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Display font for headings (optional - defaults to sans)
        display: [
          'var(--font-display)',
          'var(--font-sans)',
          'system-ui',
          'sans-serif',
        ],
        // Monospace for numbers/codes
        mono: [
          'var(--font-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'monospace',
        ],
      },

      // ═══════════════════════════════════════════════════════════════════
      // SPACING & SIZING - Common values
      // ═══════════════════════════════════════════════════════════════════
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },

      // ═══════════════════════════════════════════════════════════════════
      // ANIMATIONS
      // ═══════════════════════════════════════════════════════════════════
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
