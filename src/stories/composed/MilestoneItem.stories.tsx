import type { Meta, StoryObj } from '@storybook/react';
import { MilestoneItem } from '@/components/composed';

const meta: Meta<typeof MilestoneItem> = {
  title: 'Composed/MilestoneItem',
  component: MilestoneItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'gray',
      values: [{ name: 'gray', value: '#F3F4F6' }],
    },
  },
  argTypes: {
    index: {
      control: { type: 'number', min: 1 },
      description: 'Milestone number',
    },
    title: {
      control: 'text',
      description: 'Milestone title',
    },
    subtitle: {
      control: 'text',
      description: 'Milestone subtitle/reward',
    },
    completed: {
      control: 'boolean',
      description: 'Whether the milestone is completed',
    },
    claimed: {
      control: 'boolean',
      description: 'Whether the reward has been claimed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MilestoneItem>;

export const Pending: Story = {
  args: {
    index: 1,
    title: 'Reach Level 10',
    subtitle: '100 Coins',
    completed: false,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const Completed: Story = {
  args: {
    index: 2,
    title: 'Win 5 Games',
    subtitle: '50 Gems',
    completed: true,
    claimed: true,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const ReadyToClaim: Story = {
  args: {
    index: 3,
    title: 'Complete Tutorial',
    subtitle: 'Special Badge',
    completed: true,
    claimed: false,
    onClaim: () => alert('Reward claimed!'),
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const MilestoneList: Story = {
  render: () => (
    <div className="w-72 space-y-2">
      <MilestoneItem
        index={1}
        title="Complete 5 Levels"
        subtitle="500 Coins"
        completed={true}
        claimed={true}
      />
      <MilestoneItem
        index={2}
        title="Collect 100 Stars"
        subtitle="Rare Booster"
        completed={true}
        claimed={false}
        onClaim={() => {}}
      />
      <MilestoneItem
        index={3}
        title="Win 3 Team Battles"
        subtitle="Epic Chest"
        completed={false}
      />
      <MilestoneItem
        index={4}
        title="Reach Level 50"
        subtitle="Legendary Reward"
        completed={false}
      />
    </div>
  ),
};

export const EventRewards: Story = {
  render: () => (
    <div className="w-72">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Event Rewards</h3>
      <div className="space-y-2">
        <MilestoneItem
          index={1}
          title="10 Points"
          subtitle="100 Coins"
          completed={true}
          claimed={true}
        />
        <MilestoneItem
          index={2}
          title="25 Points"
          subtitle="1 Booster"
          completed={true}
          claimed={true}
        />
        <MilestoneItem
          index={3}
          title="50 Points"
          subtitle="3 Boosters"
          completed={false}
        />
        <MilestoneItem
          index={4}
          title="100 Points"
          subtitle="Grand Prize"
          completed={false}
        />
      </div>
    </div>
  ),
};
