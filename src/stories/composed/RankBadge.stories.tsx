import type { Meta, StoryObj } from '@storybook/react';
import { RankBadge } from '@/components/composed';

const meta: Meta<typeof RankBadge> = {
  title: 'Composed/RankBadge',
  component: RankBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    position: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'The rank position',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'The size of the badge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RankBadge>;

export const First: Story = {
  args: {
    position: 1,
  },
};

export const Second: Story = {
  args: {
    position: 2,
  },
};

export const Third: Story = {
  args: {
    position: 3,
  },
};

export const Other: Story = {
  args: {
    position: 15,
  },
};

export const SmallSize: Story = {
  args: {
    position: 1,
    size: 'sm',
  },
};

export const TopThree: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <RankBadge position={1} />
      <RankBadge position={2} />
      <RankBadge position={3} />
    </div>
  ),
};

export const LeaderboardPreview: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      {[1, 2, 3, 4, 5].map((pos) => (
        <div
          key={pos}
          className="flex items-center gap-3 p-2 bg-bg-card rounded-lg"
        >
          <RankBadge position={pos} size="sm" />
          <span className="text-sm text-text-primary flex-1">Player {pos}</span>
          <span className="text-sm text-text-secondary">{1000 - pos * 100} pts</span>
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-text-muted mb-2">Small</p>
        <div className="flex gap-2">
          <RankBadge position={1} size="sm" />
          <RankBadge position={2} size="sm" />
          <RankBadge position={3} size="sm" />
          <RankBadge position={10} size="sm" />
        </div>
      </div>
      <div>
        <p className="text-xs text-text-muted mb-2">Medium</p>
        <div className="flex gap-2">
          <RankBadge position={1} size="md" />
          <RankBadge position={2} size="md" />
          <RankBadge position={3} size="md" />
          <RankBadge position={10} size="md" />
        </div>
      </div>
    </div>
  ),
};
