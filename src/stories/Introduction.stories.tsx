import type { Meta, StoryObj } from '@storybook/react';

/**
 * # Puzzle Kit Design System
 *
 * Welcome to the Puzzle Kit component library - a comprehensive UI system for building puzzle game interfaces.
 *
 * ## Quick Start
 *
 * ### For Designers
 * 1. **Browse Components** - Use the sidebar to explore all available components
 * 2. **Try Controls** - Each component has interactive controls to test different states
 * 3. **Test Themes** - Use the background switcher to test on different surfaces
 *
 * ### For Developers
 * ```bash
 * npm run storybook  # Run Storybook
 * npm run dev        # Run the app
 * ```
 *
 * ### Adding a New Page
 * 1. Create component in `src/components/menus/YourPage.tsx`
 * 2. Add to `PAGE_REGISTRY` in `src/config/registry.ts`
 * 3. The page is automatically available in navigation
 *
 * ### Adding a New Modal
 * 1. Create component in `src/components/modals/YourModal.tsx`
 * 2. Add to `MODAL_REGISTRY` in `src/config/registry.ts`
 * 3. Use `openModal('your-modal')` to trigger it
 */
const meta: Meta = {
  title: 'Introduction',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

export const Welcome: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-8">
        <h1 className="text-h1 text-text-primary mb-2">Puzzle Kit</h1>
        <p className="text-body text-text-secondary">A design system for puzzle games</p>
      </div>

      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-h3 text-text-primary mb-4">Component Architecture</h2>
        <div className="space-y-2 text-body-sm text-text-secondary font-mono">
          <p>src/components/</p>
          <p className="pl-4">├── base/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Atomic components</p>
          <p className="pl-4">├── composed/ &nbsp;&nbsp;# Combined components</p>
          <p className="pl-4">├── shared/ &nbsp;&nbsp;&nbsp;&nbsp;# App-wide components</p>
          <p className="pl-4">├── menus/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Full page screens</p>
          <p className="pl-4">├── modals/ &nbsp;&nbsp;&nbsp;&nbsp;# Modal dialogs</p>
          <p className="pl-4">└── liveops/ &nbsp;&nbsp;&nbsp;# LiveOps events</p>
        </div>
      </div>

      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-h3 text-text-primary mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-bg-muted rounded-lg">
            <p className="text-label text-text-primary">Base Components</p>
            <p className="text-caption text-text-muted">Button, Card, Badge, etc.</p>
          </div>
          <div className="p-4 bg-bg-muted rounded-lg">
            <p className="text-label text-text-primary">Composed Components</p>
            <p className="text-caption text-text-muted">EventCard, PageHeader, etc.</p>
          </div>
          <div className="p-4 bg-bg-muted rounded-lg">
            <p className="text-label text-text-primary">Shared Components</p>
            <p className="text-caption text-text-muted">Navigation, Boundaries</p>
          </div>
          <div className="p-4 bg-bg-muted rounded-lg">
            <p className="text-label text-text-primary">Design Tokens</p>
            <p className="text-caption text-text-muted">Colors, Typography</p>
          </div>
        </div>
      </div>
    </div>
  ),
};
