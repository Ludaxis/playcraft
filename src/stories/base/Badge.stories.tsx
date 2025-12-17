import type { Meta, StoryObj } from '@storybook/react';
import { Badge, NotificationDot } from '@/components/base';

const meta: Meta<typeof Badge> = {
  title: 'Base/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'notification'],
      description: 'The visual style of the badge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'New',
  },
};

export const Notification: Story = {
  args: {
    variant: 'notification',
    children: '5',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="notification">3</Badge>
    </div>
  ),
};

export const NotificationDotExample: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="relative">
        <div className="w-10 h-10 bg-bg-muted rounded-lg flex items-center justify-center">
          Icon
        </div>
        <NotificationDot count={5} />
      </div>
      <div className="relative">
        <div className="w-10 h-10 bg-bg-muted rounded-lg flex items-center justify-center">
          Icon
        </div>
        <NotificationDot count={99} />
      </div>
      <div className="relative">
        <div className="w-10 h-10 bg-bg-muted rounded-lg flex items-center justify-center">
          Icon
        </div>
        <NotificationDot count={150} />
      </div>
    </div>
  ),
};
