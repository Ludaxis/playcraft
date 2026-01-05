/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // =======================================================================
      // 2026 HYPER-DIGITAL COLOR PALETTE
      // OLED-optimized, warmer zinc-based grays, dual accent system
      // =======================================================================
      colors: {
        // Surface colors (OLED-optimized darker tones)
        surface: {
          DEFAULT: '#0a0a0f', // Deep dark with subtle blue undertone
          elevated: '#12121a', // Cards, panels
          overlay: '#1a1a24', // Modals, dropdowns
          muted: '#0f0f14', // Subtle backgrounds
        },

        // Border colors (softer, warmer)
        border: {
          DEFAULT: '#2a2a35', // Softer than before
          muted: '#1e1e28', // Subtle borders
          accent: 'rgba(139, 92, 246, 0.3)', // Accent-tinted border
        },

        // Content/Text colors (off-white, zinc-based)
        content: {
          DEFAULT: '#fafafa', // Off-white (not pure white)
          muted: '#a1a1aa', // zinc-400 - secondary
          subtle: '#71717a', // zinc-500 - tertiary
          inverse: '#0a0a0f', // For light backgrounds
        },

        // Primary accent (Violet)
        accent: {
          DEFAULT: '#8b5cf6', // violet-500
          light: '#a78bfa', // violet-400 - lighter hover (2026 trend)
          glow: '#c4b5fd', // violet-300 - for glows
          muted: '#6d28d9', // violet-700 - darker variant
          subtle: 'rgba(139, 92, 246, 0.15)', // Subtle backgrounds
        },

        // Secondary accent (Cyan - gaming DNA)
        secondary: {
          DEFAULT: '#06b6d4', // cyan-500
          light: '#22d3ee', // cyan-400
          glow: '#67e8f9', // cyan-300
          muted: '#0891b2', // cyan-600
          subtle: 'rgba(6, 182, 212, 0.15)',
        },

        // Status colors (2026: softer, more accessible)
        success: {
          DEFAULT: '#4ade80', // green-400 (softer)
          light: '#86efac', // green-300
          muted: '#22c55e', // green-500
          subtle: 'rgba(74, 222, 128, 0.15)',
        },
        error: {
          DEFAULT: '#f87171', // red-400 (softer)
          light: '#fca5a5', // red-300
          muted: '#ef4444', // red-500
          subtle: 'rgba(248, 113, 113, 0.15)',
        },
        warning: {
          DEFAULT: '#fbbf24', // amber-400
          light: '#fcd34d', // amber-300
          muted: '#f59e0b', // amber-500
          subtle: 'rgba(251, 191, 36, 0.15)',
        },

        // Sidebar tokens (updated for 2026 palette)
        sidebar: {
          DEFAULT: '#0f0f14', // Darker sidebar
          foreground: '#fafafa',
          border: '#2a2a35',
          accent: '#1a1a24',
          'accent-foreground': '#fafafa',
          ring: '#8b5cf6',
        },

        // Legacy shadcn compatibility
        background: '#0a0a0f',
        foreground: '#fafafa',
        input: '#2a2a35',
        ring: '#8b5cf6',
        primary: {
          DEFAULT: '#8b5cf6',
          foreground: '#fafafa',
        },
        destructive: {
          DEFAULT: '#f87171',
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#1a1a24',
          foreground: '#a1a1aa',
        },
        popover: {
          DEFAULT: '#12121a',
          foreground: '#fafafa',
        },
        card: {
          DEFAULT: '#12121a',
          foreground: '#fafafa',
        },
      },

      // =======================================================================
      // TYPOGRAPHY - Geist + Fluid Scale
      // =======================================================================
      fontFamily: {
        sans: [
          'Geist',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'monospace',
        ],
      },

      fontSize: {
        // Fluid typography scale (2026 trend)
        'fluid-xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.5' }],
        'fluid-sm': ['clamp(0.875rem, 0.8rem + 0.35vw, 1rem)', { lineHeight: '1.5' }],
        'fluid-base': ['clamp(1rem, 0.9rem + 0.5vw, 1.125rem)', { lineHeight: '1.6' }],
        'fluid-lg': ['clamp(1.125rem, 1rem + 0.6vw, 1.25rem)', { lineHeight: '1.5' }],
        'fluid-xl': ['clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)', { lineHeight: '1.4' }],
        'fluid-2xl': ['clamp(1.5rem, 1.3rem + 1vw, 2rem)', { lineHeight: '1.3' }],
        'fluid-3xl': ['clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)', { lineHeight: '1.2' }],
        'fluid-4xl': ['clamp(2.25rem, 1.8rem + 2vw, 3rem)', { lineHeight: '1.1' }],
      },

      // =======================================================================
      // EFFECTS - Glows, Shadows, Animations
      // =======================================================================
      boxShadow: {
        // Glow effects (2026: luminous interactions)
        'glow-sm': '0 0 10px rgba(139, 92, 246, 0.2)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.25)',
        'glow-lg': '0 0 30px rgba(139, 92, 246, 0.3)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.25)',
        'glow-success': '0 0 20px rgba(74, 222, 128, 0.25)',
        'glow-error': '0 0 20px rgba(248, 113, 113, 0.25)',
        // Elevated surfaces
        'elevated': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'elevated-lg': '0 8px 40px rgba(0, 0, 0, 0.5)',
      },

      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },

      // Border radius (slightly larger for 2026)
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Animations
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // Transitions
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};
