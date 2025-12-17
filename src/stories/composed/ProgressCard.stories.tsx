import type { Meta, StoryObj } from '@storybook/react';
import { ProgressCard } from '@/components/composed';

const meta: Meta<typeof ProgressCard> = {
  title: 'Composed/ProgressCard',
  component: ProgressCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'gray',
      values: [{ name: 'gray', value: '#F3F4F6' }],
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Card title',
    },
    description: {
      control: 'text',
      description: 'Optional description',
    },
    current: {
      control: { type: 'number', min: 0 },
      description: 'Current progress value',
    },
    max: {
      control: { type: 'number', min: 1 },
      description: 'Maximum progress value',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressCard>;

export const Default: Story = {
  args: {
    title: 'Daily Progress',
    current: 7,
    max: 10,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const WithDescription: Story = {
  args: {
    title: 'Team Chest',
    description: 'Contribute to unlock rewards',
    current: 450,
    max: 1000,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const Complete: Story = {
  args: {
    title: 'Mission Complete',
    current: 100,
    max: 100,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const JustStarted: Story = {
  args: {
    title: 'New Challenge',
    description: 'Complete levels to progress',
    current: 0,
    max: 50,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const MultipleCards: Story = {
  render: () => (
    <div className="w-72 space-y-3">
      <ProgressCard
        title="Sky Race"
        description="Collect stars to climb"
        current={25}
        max={100}
      />
      <ProgressCard
        title="Team Chest"
        description="Team contribution"
        current={750}
        max={1000}
      />
      <ProgressCard
        title="Daily Missions"
        current={3}
        max={5}
      />
    </div>
  ),
};
