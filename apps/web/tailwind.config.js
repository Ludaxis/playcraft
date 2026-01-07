/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // =======================================================================
      // COLORS
      // Reference CSS custom properties from tokens/colors.css
      // This allows runtime theming and keeps single source of truth
      // =======================================================================
      colors: {
        // Surface colors (OLED-optimized)
        surface: {
          DEFAULT: 'var(--surface-base)',
          muted: 'var(--surface-muted)',
          elevated: 'var(--surface-elevated)',
          overlay: 'var(--surface-overlay)',
          raised: 'var(--surface-raised)',
        },

        // Border colors
        border: {
          DEFAULT: 'var(--border-default)',
          muted: 'var(--border-muted)',
          emphasis: 'var(--border-emphasis)',
          accent: 'var(--border-accent)',
          focus: 'var(--border-focus)',
        },

        // Content/Text colors
        content: {
          DEFAULT: 'var(--content-primary)',
          primary: 'var(--content-primary)',
          secondary: 'var(--content-secondary)',
          tertiary: 'var(--content-tertiary)',
          muted: 'var(--content-secondary)', // Alias for backwards compat
          subtle: 'var(--content-tertiary)', // Alias for backwards compat
          disabled: 'var(--content-disabled)',
          inverse: 'var(--content-inverse)',
        },

        // Primary accent (Violet)
        accent: {
          DEFAULT: 'var(--accent-default)',
          light: 'var(--accent-hover)',
          hover: 'var(--accent-hover)',
          active: 'var(--accent-active)',
          muted: 'var(--accent-muted)',
          subtle: 'var(--accent-subtle)',
          glow: 'var(--accent-glow)',
        },

        // Secondary accent (Cyan - Gaming DNA)
        secondary: {
          DEFAULT: 'var(--secondary-default)',
          light: 'var(--secondary-hover)',
          hover: 'var(--secondary-hover)',
          active: 'var(--secondary-active)',
          muted: 'var(--secondary-muted)',
          subtle: 'var(--secondary-subtle)',
          glow: 'var(--secondary-glow)',
        },

        // Status colors
        success: {
          DEFAULT: 'var(--status-success)',
          light: 'var(--status-success-hover)',
          muted: 'var(--status-success-muted)',
          subtle: 'var(--status-success-subtle)',
        },
        error: {
          DEFAULT: 'var(--status-error)',
          light: 'var(--status-error-hover)',
          muted: 'var(--status-error-muted)',
          subtle: 'var(--status-error-subtle)',
        },
        warning: {
          DEFAULT: 'var(--status-warning)',
          light: 'var(--status-warning-hover)',
          muted: 'var(--status-warning-muted)',
          subtle: 'var(--status-warning-subtle)',
        },
        info: {
          DEFAULT: 'var(--status-info)',
          muted: 'var(--status-info-muted)',
          subtle: 'var(--status-info-subtle)',
        },

        // File icon colors
        icon: {
          typescript: 'var(--icon-typescript)',
          javascript: 'var(--icon-javascript)',
          json: 'var(--icon-json)',
          css: 'var(--icon-css)',
          html: 'var(--icon-html)',
          markdown: 'var(--icon-markdown)',
          image: 'var(--icon-image)',
          default: 'var(--icon-default)',
        },

        // Sidebar tokens
        sidebar: {
          DEFAULT: 'var(--sidebar-background)',
          foreground: 'var(--sidebar-foreground)',
          border: 'var(--sidebar-border)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          ring: 'var(--sidebar-ring)',
        },

        // shadcn/ui compatibility (Tier 3 tokens)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        input: 'var(--input)',
        ring: 'var(--ring)',

        // Chart colors
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
      },

      // =======================================================================
      // TYPOGRAPHY
      // Reference CSS custom properties from tokens/typography.css
      // =======================================================================
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
      },

      fontSize: {
        '2xs': ['var(--text-2xs)', { lineHeight: 'var(--text-2xs-line-height)' }],
        xs: ['var(--text-xs)', { lineHeight: 'var(--text-xs-line-height)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--text-sm-line-height)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--text-base-line-height)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--text-lg-line-height)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--text-xl-line-height)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--text-2xl-line-height)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--text-3xl-line-height)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--text-4xl-line-height)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--text-5xl-line-height)' }],
        '6xl': ['var(--text-6xl)', { lineHeight: 'var(--text-6xl-line-height)' }],
        '7xl': ['var(--text-7xl)', { lineHeight: 'var(--text-7xl-line-height)' }],
        '8xl': ['var(--text-8xl)', { lineHeight: 'var(--text-8xl-line-height)' }],
        // Fluid typography aliases (backwards compatibility)
        'fluid-xs': ['var(--text-xs)', { lineHeight: 'var(--text-xs-line-height)' }],
        'fluid-sm': ['var(--text-sm)', { lineHeight: 'var(--text-sm-line-height)' }],
        'fluid-base': ['var(--text-base)', { lineHeight: 'var(--text-base-line-height)' }],
        'fluid-lg': ['var(--text-lg)', { lineHeight: 'var(--text-lg-line-height)' }],
        'fluid-xl': ['var(--text-xl)', { lineHeight: 'var(--text-xl-line-height)' }],
        'fluid-2xl': ['var(--text-2xl)', { lineHeight: 'var(--text-2xl-line-height)' }],
        'fluid-3xl': ['var(--text-3xl)', { lineHeight: 'var(--text-3xl-line-height)' }],
        'fluid-4xl': ['var(--text-4xl)', { lineHeight: 'var(--text-4xl-line-height)' }],
      },

      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight: 'var(--tracking-tight)',
        normal: 'var(--tracking-normal)',
        wide: 'var(--tracking-wide)',
        wider: 'var(--tracking-wider)',
        widest: 'var(--tracking-widest)',
      },

      lineHeight: {
        none: 'var(--leading-none)',
        tight: 'var(--leading-tight)',
        snug: 'var(--leading-snug)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
        loose: 'var(--leading-loose)',
      },

      // =======================================================================
      // SPACING
      // Uses Tailwind defaults but adds semantic spacing utilities
      // =======================================================================
      spacing: {
        // Layout-specific
        'sidebar': 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-width-collapsed)',
        'header': 'var(--header-height)',
      },

      // =======================================================================
      // EFFECTS
      // Reference CSS custom properties from tokens/effects.css
      // =======================================================================
      boxShadow: {
        // Standard shadows
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        // Elevated surfaces
        elevated: 'var(--shadow-elevated)',
        'elevated-lg': 'var(--shadow-elevated-lg)',
        // Glow effects
        'glow-xs': 'var(--glow-accent-xs)',
        'glow-sm': 'var(--glow-accent-sm)',
        glow: 'var(--glow-accent)',
        'glow-lg': 'var(--glow-accent-lg)',
        'glow-xl': 'var(--glow-accent-xl)',
        'glow-cyan': 'var(--glow-secondary)',
        'glow-secondary': 'var(--glow-secondary)',
        'glow-success': 'var(--glow-success)',
        'glow-error': 'var(--glow-error)',
        'glow-warning': 'var(--glow-warning)',
        // Focus ring
        'ring-focus': 'var(--ring-focus)',
        'ring-focus-glow': 'var(--ring-focus-glow)',
      },

      backdropBlur: {
        xs: 'var(--blur-xs)',
        sm: 'var(--blur-sm)',
        md: 'var(--blur-md)',
        lg: 'var(--blur-lg)',
        xl: 'var(--blur-xl)',
        '2xl': 'var(--blur-2xl)',
        '3xl': 'var(--blur-3xl)',
      },

      // =======================================================================
      // BORDERS
      // Reference CSS custom properties from tokens/borders.css
      // =======================================================================
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        DEFAULT: 'var(--radius-DEFAULT)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        '4xl': 'var(--radius-4xl)',
        '5xl': 'var(--radius-5xl)',
        full: 'var(--radius-full)',
        // Semantic
        button: 'var(--radius-button)',
        input: 'var(--radius-input)',
        card: 'var(--radius-card)',
        modal: 'var(--radius-modal)',
      },

      // =======================================================================
      // MOTION
      // Reference CSS custom properties from tokens/motion.css
      // =======================================================================
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fastest: 'var(--duration-fastest)',
        faster: 'var(--duration-faster)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
        slowest: 'var(--duration-slowest)',
        '400': '400ms', // Backwards compat
      },

      transitionTimingFunction: {
        linear: 'var(--ease-linear)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
        spring: 'var(--ease-spring)',
        bounce: 'var(--ease-bounce)',
        smooth: 'var(--ease-smooth)',
        snappy: 'var(--ease-snappy)',
      },

      animation: {
        'fade-in': 'var(--animation-fade-in)',
        'fade-out': 'var(--animation-fade-out)',
        'slide-up': 'var(--animation-slide-up)',
        'slide-down': 'var(--animation-slide-down)',
        'slide-left': 'var(--animation-slide-left)',
        'slide-right': 'var(--animation-slide-right)',
        'scale-in': 'var(--animation-scale-in)',
        'scale-out': 'var(--animation-scale-out)',
        'glow-pulse': 'var(--animation-glow-pulse)',
        spin: 'var(--animation-spin)',
        pulse: 'var(--animation-pulse)',
        shimmer: 'var(--animation-shimmer)',
      },

      // Keyframes are now defined in motion.css, but kept here for Tailwind
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: 'var(--glow-accent-sm)' },
          '50%': { boxShadow: 'var(--glow-accent-lg)' },
        },
      },

      // =======================================================================
      // BREAKPOINTS
      // =======================================================================
      screens: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
};
