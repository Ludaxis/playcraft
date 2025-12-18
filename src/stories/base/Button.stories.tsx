import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/base';

/**
 * The Button component is the primary interactive element for user actions.
 *
 * ## Usage
 * ```tsx
 * import { Button } from '@/components/base';
 *
 * <Button variant="solid" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 *
 * ## Variants
 * - **solid/primary**: Primary actions (filled background)
 * - **outline/secondary**: Secondary actions (bordered)
 * - **ghost**: Minimal/tertiary actions (transparent)
 */
const meta: Meta<typeof Button> = {
  title: 'Base/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'primary', 'secondary'],
      description: 'The visual style of the button',
      table: {
        defaultValue: { summary: 'solid' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take full width',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/** Primary action button - use for main CTAs */
export const Solid: Story = {
  args: {
    variant: 'solid',
    children: 'Primary Button',
  },
};

/** Secondary action button - use for alternative actions */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Secondary Button',
  },
};

/** Minimal button - use for tertiary/low-emphasis actions */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

/** Small size - use in tight spaces or lists */
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

/** Large size - use for prominent CTAs */
export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

/** Full width button - use in cards or forms */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

/** Disabled state - shown when action is unavailable */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

/** All variant and size combinations */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-caption">Solid (Primary)</p>
      <div className="flex gap-4 items-center">
        <Button variant="solid" size="sm">Small</Button>
        <Button variant="solid" size="md">Medium</Button>
        <Button variant="solid" size="lg">Large</Button>
      </div>
      <p className="text-text-muted text-caption">Outline (Secondary)</p>
      <div className="flex gap-4 items-center">
        <Button variant="outline" size="sm">Small</Button>
        <Button variant="outline" size="md">Medium</Button>
        <Button variant="outline" size="lg">Large</Button>
      </div>
      <p className="text-text-muted text-caption">Ghost (Tertiary)</p>
      <div className="flex gap-4 items-center">
        <Button variant="ghost" size="sm">Small</Button>
        <Button variant="ghost" size="md">Medium</Button>
        <Button variant="ghost" size="lg">Large</Button>
      </div>
      <p className="text-text-muted text-caption">Disabled States</p>
      <div className="flex gap-4 items-center">
        <Button variant="solid" disabled>Solid</Button>
        <Button variant="outline" disabled>Outline</Button>
        <Button variant="ghost" disabled>Ghost</Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
