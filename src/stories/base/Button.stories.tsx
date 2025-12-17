import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/base';

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
      options: ['solid', 'outline'],
      description: 'The visual style of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take full width',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Solid: Story = {
  args: {
    variant: 'solid',
    children: 'Primary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Secondary Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button variant="solid" size="sm">Solid SM</Button>
        <Button variant="solid" size="md">Solid MD</Button>
        <Button variant="solid" size="lg">Solid LG</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" size="sm">Outline SM</Button>
        <Button variant="outline" size="md">Outline MD</Button>
        <Button variant="outline" size="lg">Outline LG</Button>
      </div>
    </div>
  ),
};
