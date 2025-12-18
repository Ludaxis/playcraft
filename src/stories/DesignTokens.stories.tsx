import type { Meta, StoryObj } from '@storybook/react';

/**
 * Design tokens provide consistent styling across all components.
 * This page showcases the available colors, typography, and spacing.
 */
const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

/** Background color tokens used throughout the app */
export const BackgroundColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-h3 text-text-primary">Background Colors</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-bg-page">
          <code className="text-text-primary text-caption">bg-bg-page</code>
          <p className="text-text-muted text-mini mt-1">Main page background</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-bg-card">
          <code className="text-text-primary text-caption">bg-bg-card</code>
          <p className="text-text-muted text-mini mt-1">Card/panel background</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-bg-muted">
          <code className="text-text-primary text-caption">bg-bg-muted</code>
          <p className="text-text-muted text-mini mt-1">Subtle background</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-bg-inverse">
          <code className="text-text-inverse text-caption">bg-bg-inverse</code>
          <p className="text-text-inverse/70 text-mini mt-1">Inverted background</p>
        </div>
      </div>
    </div>
  ),
};

/** Text color tokens for different content types */
export const TextColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-h3 text-text-primary">Text Colors</h2>
      <div className="bg-bg-card p-4 rounded-lg border border-border space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-text-primary font-bold">Primary Text</p>
          <code className="text-text-muted text-mini">text-text-primary</code>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-text-secondary font-bold">Secondary Text</p>
          <code className="text-text-muted text-mini">text-text-secondary</code>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-text-muted font-bold">Muted Text</p>
          <code className="text-text-muted text-mini">text-text-muted</code>
        </div>
      </div>
      <div className="bg-bg-inverse p-4 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <p className="text-text-inverse font-bold">Inverse Text</p>
          <code className="text-text-inverse/70 text-mini">text-text-inverse</code>
        </div>
      </div>
    </div>
  ),
};

/** Border color tokens */
export const BorderColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-h3 text-text-primary">Border Colors</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border-2 border-border bg-bg-card">
          <code className="text-text-primary text-caption">border-border</code>
          <p className="text-text-muted text-mini mt-1">Default border</p>
        </div>
        <div className="p-4 rounded-lg border-2 border-border-strong bg-bg-card">
          <code className="text-text-primary text-caption">border-border-strong</code>
          <p className="text-text-muted text-mini mt-1">Emphasized border</p>
        </div>
      </div>
    </div>
  ),
};

/** Typography scale for headings */
export const Headings: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-h3 text-text-primary">Headings</h2>
      <div className="bg-bg-card p-4 rounded-lg border border-border space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-h1 text-text-primary">Heading 1</span>
          <code className="text-text-muted text-mini">text-h1</code>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-h2 text-text-primary">Heading 2</span>
          <code className="text-text-muted text-mini">text-h2</code>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-h3 text-text-primary">Heading 3</span>
          <code className="text-text-muted text-mini">text-h3</code>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-h4 text-text-primary">Heading 4</span>
          <code className="text-text-muted text-mini">text-h4</code>
        </div>
      </div>
    </div>
  ),
};

/** Typography scale for body text */
export const BodyText: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-h3 text-text-primary">Body Text</h2>
      <div className="bg-bg-card p-4 rounded-lg border border-border space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-body text-text-primary">Body - default size</span>
          <code className="text-text-muted text-mini">text-body</code>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-body-sm text-text-primary">Body small - secondary</span>
          <code className="text-text-muted text-mini">text-body-sm</code>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-caption text-text-primary">Caption - labels</span>
          <code className="text-text-muted text-mini">text-caption</code>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-mini text-text-primary">Mini - smallest</span>
          <code className="text-text-muted text-mini">text-mini</code>
        </div>
      </div>
    </div>
  ),
};

/** Typography scale for values and labels */
export const ValuesAndLabels: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-h3 text-text-primary">Values & Labels</h2>
      <div className="bg-bg-card p-4 rounded-lg border border-border space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-value text-text-primary">1,234</span>
          <code className="text-text-muted text-mini">text-value - numbers</code>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-value-sm text-text-primary">567</span>
          <code className="text-text-muted text-mini">text-value-sm - small numbers</code>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-label text-text-primary">LABEL TEXT</span>
          <code className="text-text-muted text-mini">text-label - uppercase</code>
        </div>
      </div>
    </div>
  ),
};

/** Border radius tokens */
export const BorderRadius: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-h3 text-text-primary">Border Radius</h2>
      <div className="flex gap-4 items-end">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-bg-muted border border-border rounded" />
          <code className="text-text-muted text-mini mt-2">rounded</code>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-bg-muted border border-border rounded-lg" />
          <code className="text-text-muted text-mini mt-2">rounded-lg</code>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-bg-muted border border-border rounded-xl" />
          <code className="text-text-muted text-mini mt-2">rounded-xl</code>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-bg-muted border border-border rounded-2xl" />
          <code className="text-text-muted text-mini mt-2">rounded-2xl</code>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-bg-muted border border-border rounded-full" />
          <code className="text-text-muted text-mini mt-2">rounded-full</code>
        </div>
      </div>
    </div>
  ),
};
