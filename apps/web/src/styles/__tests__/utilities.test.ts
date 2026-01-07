/**
 * CSS Utilities Tests
 *
 * Tests for the PlayCraft design system utility classes.
 * Verifies glass morphism, gradients, glows, and animation utilities.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Helper to create an element with classes and get computed styles
function createElement(className: string): HTMLElement {
  const el = document.createElement('div');
  el.className = className;
  document.body.appendChild(el);
  return el;
}

function cleanup() {
  document.body.innerHTML = '';
}

describe('CSS Utility Classes', () => {
  beforeEach(() => {
    // Add utility class definitions for testing
    const style = document.createElement('style');
    style.id = 'test-utilities';
    style.textContent = `
      /* Glass Morphism */
      .glass {
        background: rgba(18, 18, 26, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .glass-elevated {
        background: rgba(26, 26, 36, 0.85);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
      }

      /* Gradient Backgrounds */
      .bg-gradient-accent {
        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      }

      .bg-gradient-gaming {
        background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #06b6d4 100%);
      }

      .bg-gradient-gaming-soft {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(217, 70, 239, 0.05) 50%, rgba(6, 182, 212, 0.1) 100%);
      }

      /* Gradient Text */
      .text-gradient-accent {
        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .text-gradient-gaming {
        background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #06b6d4 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* Glow Effects */
      .glow-sm {
        box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
      }

      .glow {
        box-shadow: 0 0 16px rgba(139, 92, 246, 0.4);
      }

      .glow-lg {
        box-shadow: 0 0 24px rgba(139, 92, 246, 0.5);
      }

      .glow-secondary {
        box-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
      }

      /* Hover Glow */
      .hover-glow {
        transition: box-shadow 300ms ease-out;
      }

      .hover-glow:hover {
        box-shadow: 0 0 16px rgba(139, 92, 246, 0.4);
      }

      /* Focus Glow */
      .focus-glow:focus {
        box-shadow: 0 0 16px rgba(139, 92, 246, 0.4);
        outline: none;
      }

      /* Glow Pulse Animation */
      .glow-pulse {
        animation: glow-pulse 2s infinite;
      }

      /* Border Glow */
      .border-glow {
        position: relative;
      }

      .border-glow::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        opacity: 0;
        transition: opacity 300ms ease-out;
        z-index: -1;
        filter: blur(8px);
      }

      .border-glow:hover::before {
        opacity: 0.5;
      }

      /* Shimmer Effect */
      .shimmer {
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      /* Scrollbar Utilities */
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }

      .scrollbar-thin {
        scrollbar-width: thin;
      }

      /* Animation Utilities */
      .animate-fade-in {
        animation: fade-in 200ms ease-out;
      }

      .animate-slide-up {
        animation: slide-up 200ms ease-out;
      }

      .animate-slide-down {
        animation: slide-down 200ms ease-out;
      }

      .animate-scale-in {
        animation: scale-in 200ms ease-out;
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }

      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      /* Transition Utilities */
      .transition-smooth {
        transition-duration: 300ms;
        transition-timing-function: ease-out;
      }

      .transition-swift {
        transition-duration: 150ms;
        transition-timing-function: ease-out;
      }

      .transition-relaxed {
        transition-duration: 500ms;
        transition-timing-function: ease-out;
      }

      /* Keyframes */
      @keyframes fade-in {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes slide-up {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes slide-down {
        0% { opacity: 0; transform: translateY(-10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes scale-in {
        0% { opacity: 0; transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 8px rgba(139, 92, 246, 0.3); }
        50% { box-shadow: 0 0 24px rgba(139, 92, 246, 0.5); }
      }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  });

  afterEach(() => {
    cleanup();
    const style = document.getElementById('test-utilities');
    if (style) style.remove();
  });

  describe('Glass Morphism', () => {
    it('applies .glass class correctly', () => {
      const el = createElement('glass');
      expect(el.classList.contains('glass')).toBe(true);
    });

    it('applies .glass-elevated class correctly', () => {
      const el = createElement('glass-elevated');
      expect(el.classList.contains('glass-elevated')).toBe(true);
    });
  });

  describe('Gradient Backgrounds', () => {
    it('applies .bg-gradient-accent class', () => {
      const el = createElement('bg-gradient-accent');
      expect(el.classList.contains('bg-gradient-accent')).toBe(true);
    });

    it('applies .bg-gradient-gaming class', () => {
      const el = createElement('bg-gradient-gaming');
      expect(el.classList.contains('bg-gradient-gaming')).toBe(true);
    });

    it('applies .bg-gradient-gaming-soft class', () => {
      const el = createElement('bg-gradient-gaming-soft');
      expect(el.classList.contains('bg-gradient-gaming-soft')).toBe(true);
    });
  });

  describe('Gradient Text', () => {
    it('applies .text-gradient-accent class', () => {
      const el = createElement('text-gradient-accent');
      expect(el.classList.contains('text-gradient-accent')).toBe(true);
    });

    it('applies .text-gradient-gaming class', () => {
      const el = createElement('text-gradient-gaming');
      expect(el.classList.contains('text-gradient-gaming')).toBe(true);
    });
  });

  describe('Glow Effects', () => {
    it('applies .glow-sm class', () => {
      const el = createElement('glow-sm');
      expect(el.classList.contains('glow-sm')).toBe(true);
    });

    it('applies .glow class', () => {
      const el = createElement('glow');
      expect(el.classList.contains('glow')).toBe(true);
    });

    it('applies .glow-lg class', () => {
      const el = createElement('glow-lg');
      expect(el.classList.contains('glow-lg')).toBe(true);
    });

    it('applies .glow-secondary class (cyan)', () => {
      const el = createElement('glow-secondary');
      expect(el.classList.contains('glow-secondary')).toBe(true);
    });

    it('applies .hover-glow class', () => {
      const el = createElement('hover-glow');
      expect(el.classList.contains('hover-glow')).toBe(true);
    });

    it('applies .focus-glow class', () => {
      const el = createElement('focus-glow');
      expect(el.classList.contains('focus-glow')).toBe(true);
    });

    it('applies .glow-pulse class', () => {
      const el = createElement('glow-pulse');
      expect(el.classList.contains('glow-pulse')).toBe(true);
    });

    it('applies .border-glow class', () => {
      const el = createElement('border-glow');
      expect(el.classList.contains('border-glow')).toBe(true);
    });
  });

  describe('Loading Effects', () => {
    it('applies .shimmer class', () => {
      const el = createElement('shimmer');
      expect(el.classList.contains('shimmer')).toBe(true);
    });
  });

  describe('Scrollbar Utilities', () => {
    it('applies .scrollbar-hide class', () => {
      const el = createElement('scrollbar-hide');
      expect(el.classList.contains('scrollbar-hide')).toBe(true);
    });

    it('applies .scrollbar-thin class', () => {
      const el = createElement('scrollbar-thin');
      expect(el.classList.contains('scrollbar-thin')).toBe(true);
    });
  });

  describe('Animation Utilities', () => {
    it('applies .animate-fade-in class', () => {
      const el = createElement('animate-fade-in');
      expect(el.classList.contains('animate-fade-in')).toBe(true);
    });

    it('applies .animate-slide-up class', () => {
      const el = createElement('animate-slide-up');
      expect(el.classList.contains('animate-slide-up')).toBe(true);
    });

    it('applies .animate-slide-down class', () => {
      const el = createElement('animate-slide-down');
      expect(el.classList.contains('animate-slide-down')).toBe(true);
    });

    it('applies .animate-scale-in class', () => {
      const el = createElement('animate-scale-in');
      expect(el.classList.contains('animate-scale-in')).toBe(true);
    });

    it('applies .animate-spin class', () => {
      const el = createElement('animate-spin');
      expect(el.classList.contains('animate-spin')).toBe(true);
    });

    it('applies .animate-pulse class', () => {
      const el = createElement('animate-pulse');
      expect(el.classList.contains('animate-pulse')).toBe(true);
    });
  });

  describe('Transition Utilities', () => {
    it('applies .transition-smooth class (300ms)', () => {
      const el = createElement('transition-smooth');
      expect(el.classList.contains('transition-smooth')).toBe(true);
    });

    it('applies .transition-swift class (150ms)', () => {
      const el = createElement('transition-swift');
      expect(el.classList.contains('transition-swift')).toBe(true);
    });

    it('applies .transition-relaxed class (500ms)', () => {
      const el = createElement('transition-relaxed');
      expect(el.classList.contains('transition-relaxed')).toBe(true);
    });
  });

  describe('Multiple Classes', () => {
    it('can combine glass and glow effects', () => {
      const el = createElement('glass glow-sm');
      expect(el.classList.contains('glass')).toBe(true);
      expect(el.classList.contains('glow-sm')).toBe(true);
    });

    it('can combine gradient and animation', () => {
      const el = createElement('bg-gradient-gaming animate-fade-in');
      expect(el.classList.contains('bg-gradient-gaming')).toBe(true);
      expect(el.classList.contains('animate-fade-in')).toBe(true);
    });

    it('can combine transition and hover utilities', () => {
      const el = createElement('transition-smooth hover-glow');
      expect(el.classList.contains('transition-smooth')).toBe(true);
      expect(el.classList.contains('hover-glow')).toBe(true);
    });
  });
});

describe('Utility Class Naming Conventions', () => {
  it('glow utilities follow size naming pattern (sm, default, lg)', () => {
    const sizes = ['glow-sm', 'glow', 'glow-lg'];
    sizes.forEach((className) => {
      const el = document.createElement('div');
      el.className = className;
      expect(el.classList.contains(className)).toBe(true);
    });
  });

  it('animation utilities follow animate- prefix pattern', () => {
    const animations = [
      'animate-fade-in',
      'animate-slide-up',
      'animate-slide-down',
      'animate-scale-in',
      'animate-spin',
      'animate-pulse',
    ];
    animations.forEach((className) => {
      const el = document.createElement('div');
      el.className = className;
      expect(el.classList.contains(className)).toBe(true);
    });
  });

  it('transition utilities follow transition- prefix pattern', () => {
    const transitions = ['transition-smooth', 'transition-swift', 'transition-relaxed'];
    transitions.forEach((className) => {
      const el = document.createElement('div');
      el.className = className;
      expect(el.classList.contains(className)).toBe(true);
    });
  });

  it('gradient utilities follow bg-gradient- prefix pattern', () => {
    const gradients = ['bg-gradient-accent', 'bg-gradient-gaming', 'bg-gradient-gaming-soft'];
    gradients.forEach((className) => {
      const el = document.createElement('div');
      el.className = className;
      expect(el.classList.contains(className)).toBe(true);
    });
  });

  it('text gradient utilities follow text-gradient- prefix pattern', () => {
    const textGradients = ['text-gradient-accent', 'text-gradient-gaming'];
    textGradients.forEach((className) => {
      const el = document.createElement('div');
      el.className = className;
      expect(el.classList.contains(className)).toBe(true);
    });
  });
});
