import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'accent', 'glow'],
      description: 'The visual style variant of the badge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Error',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Accent: Story = {
  args: {
    children: 'Accent',
    variant: 'accent',
  },
  parameters: {
    docs: {
      description: {
        story: 'Cyan gaming DNA accent variant.',
      },
    },
  },
};

export const Glow: Story = {
  args: {
    children: 'Glow Effect',
    variant: 'glow',
  },
  parameters: {
    docs: {
      description: {
        story: 'Special glow variant for highlighting important items.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="glow">Glow</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Badge variant="success">Active</Badge>
        <span className="text-sm text-content-secondary">Project is running</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="warning">Building</Badge>
        <span className="text-sm text-content-secondary">Deployment in progress</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="destructive">Failed</Badge>
        <span className="text-sm text-content-secondary">Build failed</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Draft</Badge>
        <span className="text-sm text-content-secondary">Not published</span>
      </div>
    </div>
  ),
};

export const InlineUsage: Story = {
  render: () => (
    <div className="space-y-2">
      <h4 className="text-lg font-semibold">
        Project Name <Badge variant="glow">Pro</Badge>
      </h4>
      <p className="text-content-secondary">
        This project uses the <Badge variant="accent">React</Badge> framework with{' '}
        <Badge variant="accent">TypeScript</Badge> support.
      </p>
    </div>
  ),
};
