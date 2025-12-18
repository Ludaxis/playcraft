import type { Config } from 'tailwindcss';

/**
 * Puzzle Kit - Mid-Fidelity Wireframe Configuration
 *
 * Grayscale-only color palette for wireframe design.
 * All colors are shades of gray to focus on layout and structure.
 *
 * Color System (Grayscale):
 * - primary: Dark gray for headers, important elements
 * - secondary: Medium gray for containers, navigation
 * - surface: White to light gray backgrounds
 * - muted: Light gray for subdued elements
 * - border: Gray borders for structure definition
 * - All status/accent/gold colors: Grayscale variants
 */

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════════
      // WIREFRAME GRAYSCALE COLORS
      // ═══════════════════════════════════════════════════════════════════
      colors: {
        // Primary colors (dark grays)
        primary: {
          DEFAULT: '#333333', // Dark gray
          light: '#4D4D4D',   // Medium-dark gray
          dark: '#1A1A1A',    // Near black
        },

        // Secondary colors (medium grays)
        secondary: {
          DEFAULT: '#666666', // Medium gray
          light: '#808080',   // Gray
          dark: '#4D4D4D',    // Medium-dark gray
        },

        // Surface colors (light grays to white)
        surface: {
          DEFAULT: '#E5E5E5', // Light gray
          light: '#F0F0F0',   // Very light gray
          lighter: '#F5F5F5', // Near white
          lightest: '#FFFFFF', // White
          dark: '#CCCCCC',    // Medium-light gray
          darker: '#999999',  // Gray
        },

        // Muted colors (grays for subdued elements)
        muted: {
          DEFAULT: '#999999', // Gray
          light: '#CCCCCC',   // Light gray
          dark: '#666666',    // Medium gray
          foreground: '#666666',
        },

        // Border colors (grays for structure)
        border: {
          DEFAULT: '#CCCCCC', // Standard border
          light: '#E5E5E5',   // Light border
          dark: '#999999',    // Strong border
        },

        // Accent colors (grayscale - no colors in wireframes)
        accent: {
          DEFAULT: '#4D4D4D', // Dark gray
          light: '#666666',   // Medium gray
          dark: '#333333',    // Darker gray
          darker: '#1A1A1A',  // Near black
          muted: '#E5E5E5',   // Light gray
        },

        // Gold colors (grayscale for wireframes)
        gold: {
          DEFAULT: '#808080', // Gray
          light: '#B3B3B3',   // Light gray
          dark: '#666666',    // Medium gray
          darker: '#4D4D4D',  // Dark gray
        },

        // Success colors (grayscale)
        success: {
          DEFAULT: '#666666', // Gray
          light: '#808080',   // Lighter gray
          dark: '#4D4D4D',    // Darker gray
        },

        // Error colors (grayscale)
        error: {
          DEFAULT: '#4D4D4D', // Dark gray
          light: '#666666',   // Gray
          dark: '#333333',    // Darker gray
        },

        // Warning colors (grayscale)
        warning: {
          DEFAULT: '#808080', // Gray
          light: '#999999',   // Light gray
          dark: '#666666',    // Medium gray
        },

        // Info colors (grayscale)
        info: {
          DEFAULT: '#808080', // Gray
          light: '#999999',   // Light gray
          dark: '#666666',    // Medium gray
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // FONTS - Multi-script font support
      // ═══════════════════════════════════════════════════════════════════
      fontFamily: {
        // Primary font - defaults to Latin, overridden by locale
        sans: [
          'var(--font-latin)',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Display font (same as sans for consistency)
        display: [
          'var(--font-latin)',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        // Monospace for numbers/codes
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'monospace',
        ],
        // Script-specific font families
        latin: [
          'var(--font-latin)',
          'Noto Sans',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        arabic: [
          'var(--font-arabic)',
          'Noto Sans Arabic',
          'Tahoma',
          'Arial',
          'sans-serif',
        ],
        chinese: [
          'var(--font-chinese)',
          'Noto Sans SC',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
        japanese: [
          'var(--font-japanese)',
          'Noto Sans JP',
          'Hiragino Sans',
          'Yu Gothic',
          'sans-serif',
        ],
        korean: [
          'var(--font-korean)',
          'Noto Sans KR',
          'Malgun Gothic',
          'Apple SD Gothic Neo',
          'sans-serif',
        ],
      },

      // ═══════════════════════════════════════════════════════════════════
      // SPACING & SIZING - Consistent wireframe values
      // ═══════════════════════════════════════════════════════════════════
      borderRadius: {
        'sm': '0.125rem',   // 2px - minimal
        'DEFAULT': '0.25rem', // 4px - standard
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem',    // 24px
        'full': '9999px',
      },

      // ═══════════════════════════════════════════════════════════════════
      // ANIMATIONS - Subtle for wireframes
      // ═══════════════════════════════════════════════════════════════════
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'fade-out': 'fadeOut 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
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
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
