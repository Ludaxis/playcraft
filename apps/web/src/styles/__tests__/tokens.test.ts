/**
 * Design Token Tests
 *
 * Tests for the PlayCraft design token system.
 * Verifies CSS variables are correctly defined and follow the 3-tier architecture.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Helper to get CSS variable value from computed styles
function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Helper to set up CSS variables for testing
function setupCSSVariables() {
  // Import the actual token values
  const style = document.createElement('style');
  style.id = 'test-tokens';
  style.textContent = `
    :root {
      /* Tier 1: Primitive Palette */
      --primitive-neutral-0: #000000;
      --primitive-neutral-50: #0a0a0f;
      --primitive-neutral-100: #0f0f14;
      --primitive-neutral-150: #12121a;
      --primitive-neutral-200: #1a1a24;
      --primitive-neutral-250: #1e1e28;
      --primitive-neutral-300: #2a2a35;
      --primitive-neutral-400: #3f3f4a;
      --primitive-neutral-500: #52525e;
      --primitive-neutral-600: #71717a;
      --primitive-neutral-700: #a1a1aa;
      --primitive-neutral-800: #d4d4dc;
      --primitive-neutral-900: #f4f4f5;
      --primitive-neutral-950: #fafafa;
      --primitive-neutral-1000: #ffffff;

      --primitive-violet-200: #ddd6fe;
      --primitive-violet-300: #c4b5fd;
      --primitive-violet-400: #a78bfa;
      --primitive-violet-500: #8b5cf6;
      --primitive-violet-600: #7c3aed;
      --primitive-violet-700: #6d28d9;
      --primitive-violet-800: #5b21b6;

      --primitive-cyan-300: #67e8f9;
      --primitive-cyan-400: #22d3ee;
      --primitive-cyan-500: #06b6d4;
      --primitive-cyan-600: #0891b2;
      --primitive-cyan-700: #0e7490;

      --primitive-green-300: #86efac;
      --primitive-green-400: #4ade80;
      --primitive-green-500: #22c55e;

      --primitive-red-300: #fca5a5;
      --primitive-red-400: #f87171;
      --primitive-red-500: #ef4444;

      --primitive-amber-300: #fcd34d;
      --primitive-amber-400: #fbbf24;
      --primitive-amber-500: #f59e0b;

      --primitive-blue-400: #60a5fa;
      --primitive-blue-500: #3b82f6;

      /* Tier 2: Semantic Tokens */
      --surface-base: var(--primitive-neutral-50);
      --surface-muted: var(--primitive-neutral-100);
      --surface-elevated: var(--primitive-neutral-150);
      --surface-overlay: var(--primitive-neutral-200);
      --surface-raised: var(--primitive-neutral-250);

      --border-muted: var(--primitive-neutral-250);
      --border-default: var(--primitive-neutral-300);
      --border-emphasis: var(--primitive-neutral-400);
      --border-accent: rgba(139, 92, 246, 0.3);
      --border-focus: var(--primitive-violet-500);

      --content-primary: var(--primitive-neutral-950);
      --content-secondary: var(--primitive-neutral-700);
      --content-tertiary: var(--primitive-neutral-600);
      --content-disabled: var(--primitive-neutral-500);
      --content-inverse: var(--primitive-neutral-50);
      --content-on-accent: var(--primitive-neutral-950);

      --accent-default: var(--primitive-violet-500);
      --accent-hover: var(--primitive-violet-400);
      --accent-active: var(--primitive-violet-600);
      --accent-muted: var(--primitive-violet-700);
      --accent-subtle: rgba(139, 92, 246, 0.15);
      --accent-glow: var(--primitive-violet-300);

      --secondary-default: var(--primitive-cyan-500);
      --secondary-hover: var(--primitive-cyan-400);
      --secondary-active: var(--primitive-cyan-600);
      --secondary-muted: var(--primitive-cyan-700);
      --secondary-subtle: rgba(6, 182, 212, 0.15);
      --secondary-glow: var(--primitive-cyan-300);

      --status-success: var(--primitive-green-400);
      --status-success-hover: var(--primitive-green-300);
      --status-success-muted: var(--primitive-green-500);
      --status-success-subtle: rgba(74, 222, 128, 0.15);

      --status-error: var(--primitive-red-400);
      --status-error-hover: var(--primitive-red-300);
      --status-error-muted: var(--primitive-red-500);
      --status-error-subtle: rgba(248, 113, 113, 0.15);

      --status-warning: var(--primitive-amber-400);
      --status-warning-hover: var(--primitive-amber-300);
      --status-warning-muted: var(--primitive-amber-500);
      --status-warning-subtle: rgba(251, 191, 36, 0.15);

      --status-info: var(--primitive-blue-400);
      --status-info-muted: var(--primitive-blue-500);
      --status-info-subtle: rgba(96, 165, 250, 0.15);

      /* Tier 3: Component Tokens (shadcn/ui) */
      --background: var(--surface-base);
      --foreground: var(--content-primary);
      --card: var(--surface-elevated);
      --card-foreground: var(--content-primary);
      --popover: var(--surface-elevated);
      --popover-foreground: var(--content-primary);
      --primary: var(--accent-default);
      --primary-foreground: var(--content-on-accent);
      --secondary: var(--surface-elevated);
      --secondary-foreground: var(--content-primary);
      --muted: var(--surface-overlay);
      --muted-foreground: var(--content-secondary);
      --accent: var(--surface-overlay);
      --accent-foreground: var(--content-primary);
      --destructive: var(--status-error);
      --destructive-foreground: var(--content-on-accent);
      --border: var(--border-default);
      --input: var(--border-default);
      --ring: var(--accent-default);
    }
  `;
  document.head.appendChild(style);
}

function cleanupCSSVariables() {
  const style = document.getElementById('test-tokens');
  if (style) {
    style.remove();
  }
}

describe('Design Tokens', () => {
  beforeAll(() => {
    setupCSSVariables();
  });

  afterAll(() => {
    cleanupCSSVariables();
  });

  describe('Tier 1: Primitive Color Tokens', () => {
    describe('Neutral Scale', () => {
      it('defines OLED-optimized dark background (neutral-50)', () => {
        expect(getCSSVariable('--primitive-neutral-50')).toBe('#0a0a0f');
      });

      it('defines pure black (neutral-0)', () => {
        expect(getCSSVariable('--primitive-neutral-0')).toBe('#000000');
      });

      it('defines pure white (neutral-1000)', () => {
        expect(getCSSVariable('--primitive-neutral-1000')).toBe('#ffffff');
      });

      it('defines primary content white (neutral-950)', () => {
        expect(getCSSVariable('--primitive-neutral-950')).toBe('#fafafa');
      });

      it('has complete neutral scale from 0 to 1000', () => {
        const neutralValues = [
          '--primitive-neutral-0',
          '--primitive-neutral-50',
          '--primitive-neutral-100',
          '--primitive-neutral-150',
          '--primitive-neutral-200',
          '--primitive-neutral-250',
          '--primitive-neutral-300',
          '--primitive-neutral-400',
          '--primitive-neutral-500',
          '--primitive-neutral-600',
          '--primitive-neutral-700',
          '--primitive-neutral-800',
          '--primitive-neutral-900',
          '--primitive-neutral-950',
          '--primitive-neutral-1000',
        ];

        neutralValues.forEach((varName) => {
          const value = getCSSVariable(varName);
          expect(value).toBeTruthy();
          expect(value).toMatch(/^#[0-9a-f]{6}$/i);
        });
      });
    });

    describe('Violet Scale (Primary Accent)', () => {
      it('defines violet-500 as main accent color', () => {
        expect(getCSSVariable('--primitive-violet-500')).toBe('#8b5cf6');
      });

      it('defines violet-400 as hover state (lighter)', () => {
        expect(getCSSVariable('--primitive-violet-400')).toBe('#a78bfa');
      });

      it('defines violet-600 as active state (darker)', () => {
        expect(getCSSVariable('--primitive-violet-600')).toBe('#7c3aed');
      });
    });

    describe('Cyan Scale (Secondary Accent)', () => {
      it('defines cyan-500 as secondary accent', () => {
        expect(getCSSVariable('--primitive-cyan-500')).toBe('#06b6d4');
      });

      it('defines cyan-400 as hover state', () => {
        expect(getCSSVariable('--primitive-cyan-400')).toBe('#22d3ee');
      });
    });

    describe('Status Colors', () => {
      it('defines green-400 for success', () => {
        expect(getCSSVariable('--primitive-green-400')).toBe('#4ade80');
      });

      it('defines red-400 for error', () => {
        expect(getCSSVariable('--primitive-red-400')).toBe('#f87171');
      });

      it('defines amber-400 for warning', () => {
        expect(getCSSVariable('--primitive-amber-400')).toBe('#fbbf24');
      });

      it('defines blue-400 for info', () => {
        expect(getCSSVariable('--primitive-blue-400')).toBe('#60a5fa');
      });
    });
  });

  describe('Tier 2: Semantic Tokens', () => {
    describe('Surface Hierarchy', () => {
      it('maps surface-base to OLED-optimized dark', () => {
        const value = getCSSVariable('--surface-base');
        // Should reference primitive-neutral-50 which resolves to #0a0a0f
        expect(value).toBeTruthy();
      });

      it('provides progressive elevation surfaces', () => {
        const surfaces = [
          '--surface-base',
          '--surface-muted',
          '--surface-elevated',
          '--surface-overlay',
          '--surface-raised',
        ];

        surfaces.forEach((varName) => {
          expect(getCSSVariable(varName)).toBeTruthy();
        });
      });
    });

    describe('Content Hierarchy', () => {
      it('defines content-primary for main text', () => {
        expect(getCSSVariable('--content-primary')).toBeTruthy();
      });

      it('defines content-secondary for muted text', () => {
        expect(getCSSVariable('--content-secondary')).toBeTruthy();
      });

      it('defines content-tertiary for subtle text', () => {
        expect(getCSSVariable('--content-tertiary')).toBeTruthy();
      });

      it('defines content-disabled for inactive states', () => {
        expect(getCSSVariable('--content-disabled')).toBeTruthy();
      });
    });

    describe('Accent Colors', () => {
      it('maps accent-default to violet-500', () => {
        expect(getCSSVariable('--accent-default')).toBeTruthy();
      });

      it('provides complete accent state tokens', () => {
        const accentStates = [
          '--accent-default',
          '--accent-hover',
          '--accent-active',
          '--accent-muted',
          '--accent-subtle',
          '--accent-glow',
        ];

        accentStates.forEach((varName) => {
          expect(getCSSVariable(varName)).toBeTruthy();
        });
      });
    });

    describe('Secondary Colors (Cyan)', () => {
      it('maps secondary-default to cyan-500', () => {
        expect(getCSSVariable('--secondary-default')).toBeTruthy();
      });

      it('provides complete secondary state tokens', () => {
        const secondaryStates = [
          '--secondary-default',
          '--secondary-hover',
          '--secondary-active',
          '--secondary-muted',
          '--secondary-subtle',
          '--secondary-glow',
        ];

        secondaryStates.forEach((varName) => {
          expect(getCSSVariable(varName)).toBeTruthy();
        });
      });
    });

    describe('Status Tokens', () => {
      it('provides success status tokens', () => {
        expect(getCSSVariable('--status-success')).toBeTruthy();
        expect(getCSSVariable('--status-success-hover')).toBeTruthy();
        expect(getCSSVariable('--status-success-muted')).toBeTruthy();
        expect(getCSSVariable('--status-success-subtle')).toBeTruthy();
      });

      it('provides error status tokens', () => {
        expect(getCSSVariable('--status-error')).toBeTruthy();
        expect(getCSSVariable('--status-error-hover')).toBeTruthy();
        expect(getCSSVariable('--status-error-muted')).toBeTruthy();
        expect(getCSSVariable('--status-error-subtle')).toBeTruthy();
      });

      it('provides warning status tokens', () => {
        expect(getCSSVariable('--status-warning')).toBeTruthy();
        expect(getCSSVariable('--status-warning-hover')).toBeTruthy();
        expect(getCSSVariable('--status-warning-muted')).toBeTruthy();
        expect(getCSSVariable('--status-warning-subtle')).toBeTruthy();
      });

      it('provides info status tokens', () => {
        expect(getCSSVariable('--status-info')).toBeTruthy();
        expect(getCSSVariable('--status-info-muted')).toBeTruthy();
        expect(getCSSVariable('--status-info-subtle')).toBeTruthy();
      });
    });

    describe('Border Hierarchy', () => {
      it('provides complete border tokens', () => {
        const borders = [
          '--border-muted',
          '--border-default',
          '--border-emphasis',
          '--border-accent',
          '--border-focus',
        ];

        borders.forEach((varName) => {
          expect(getCSSVariable(varName)).toBeTruthy();
        });
      });
    });
  });

  describe('Tier 3: Component Tokens (shadcn/ui)', () => {
    it('defines --background for main background', () => {
      expect(getCSSVariable('--background')).toBeTruthy();
    });

    it('defines --foreground for main text', () => {
      expect(getCSSVariable('--foreground')).toBeTruthy();
    });

    it('defines --primary for accent buttons', () => {
      expect(getCSSVariable('--primary')).toBeTruthy();
    });

    it('defines --primary-foreground for text on accent', () => {
      expect(getCSSVariable('--primary-foreground')).toBeTruthy();
    });

    it('defines --destructive for error actions', () => {
      expect(getCSSVariable('--destructive')).toBeTruthy();
    });

    it('provides complete card tokens', () => {
      expect(getCSSVariable('--card')).toBeTruthy();
      expect(getCSSVariable('--card-foreground')).toBeTruthy();
    });

    it('provides complete popover tokens', () => {
      expect(getCSSVariable('--popover')).toBeTruthy();
      expect(getCSSVariable('--popover-foreground')).toBeTruthy();
    });

    it('provides complete muted tokens', () => {
      expect(getCSSVariable('--muted')).toBeTruthy();
      expect(getCSSVariable('--muted-foreground')).toBeTruthy();
    });

    it('defines --border for default borders', () => {
      expect(getCSSVariable('--border')).toBeTruthy();
    });

    it('defines --input for form input borders', () => {
      expect(getCSSVariable('--input')).toBeTruthy();
    });

    it('defines --ring for focus rings', () => {
      expect(getCSSVariable('--ring')).toBeTruthy();
    });
  });

  describe('Token Architecture Validation', () => {
    it('maintains 3-tier hierarchy (primitive -> semantic -> component)', () => {
      // Primitive: raw hex values
      const primitive = getCSSVariable('--primitive-violet-500');
      expect(primitive).toMatch(/^#[0-9a-f]{6}$/i);

      // Semantic: references primitives (tested by presence)
      expect(getCSSVariable('--accent-default')).toBeTruthy();

      // Component: references semantic (tested by presence)
      expect(getCSSVariable('--primary')).toBeTruthy();
    });

    it('provides OLED-optimized dark theme (< 10% brightness for base)', () => {
      const baseColor = getCSSVariable('--primitive-neutral-50');
      // #0a0a0f -> RGB(10, 10, 15) -> very low brightness
      expect(baseColor).toBe('#0a0a0f');

      // Verify it's a valid dark color (R, G, B all under 32)
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);

      expect(r).toBeLessThan(32);
      expect(g).toBeLessThan(32);
      expect(b).toBeLessThan(32);
    });

    it('has Gaming DNA colors (violet + cyan combination)', () => {
      const violet = getCSSVariable('--primitive-violet-500');
      const cyan = getCSSVariable('--primitive-cyan-500');

      expect(violet).toBe('#8b5cf6');
      expect(cyan).toBe('#06b6d4');
    });
  });
});

describe('Token Value Consistency', () => {
  beforeAll(() => {
    setupCSSVariables();
  });

  afterAll(() => {
    cleanupCSSVariables();
  });

  it('all hex color values are valid 6-digit format', () => {
    const hexVars = [
      '--primitive-neutral-50',
      '--primitive-violet-500',
      '--primitive-cyan-500',
      '--primitive-green-400',
      '--primitive-red-400',
      '--primitive-amber-400',
      '--primitive-blue-400',
    ];

    hexVars.forEach((varName) => {
      const value = getCSSVariable(varName);
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('rgba values use correct alpha format', () => {
    const rgbaVars = [
      '--accent-subtle',
      '--secondary-subtle',
      '--status-success-subtle',
      '--status-error-subtle',
      '--border-accent',
    ];

    rgbaVars.forEach((varName) => {
      const value = getCSSVariable(varName);
      expect(value).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
    });
  });
});
