import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '@/components/base';

const meta: Meta<typeof Avatar> = {
  title: 'Base/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'The size of the avatar',
    },
    name: {
      control: 'text',
      description: 'Name for initials fallback',
    },
    src: {
      control: 'text',
      description: 'Image source URL',
    },
    online: {
      control: 'boolean',
      description: 'Online status (true = green, false = gray, undefined = no indicator)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    name: 'John Doe',
  },
};

export const WithImage: Story = {
  args: {
    name: 'Jane Smith',
    src: 'https://i.pravatar.cc/150?img=5',
  },
};

export const Online: Story = {
  args: {
    name: 'Mike Johnson',
    online: true,
  },
};

export const Offline: Story = {
  args: {
    name: 'Sarah Wilson',
    online: false,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="text-center">
        <Avatar size="sm" name="Small" />
        <p className="text-xs text-text-muted mt-1">SM</p>
      </div>
      <div className="text-center">
        <Avatar size="md" name="Medium" />
        <p className="text-xs text-text-muted mt-1">MD</p>
      </div>
      <div className="text-center">
        <Avatar size="lg" name="Large" />
        <p className="text-xs text-text-muted mt-1">LG</p>
      </div>
      <div className="text-center">
        <Avatar size="xl" name="Extra Large" />
        <p className="text-xs text-text-muted mt-1">XL</p>
      </div>
    </div>
  ),
};

export const InitialsFallback: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar name="John Doe" />
      <Avatar name="Alice" />
      <Avatar name="Bob Smith" />
      <Avatar name="Charlie Brown" />
    </div>
  ),
};
