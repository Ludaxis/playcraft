import type { Meta, StoryObj } from '@storybook/react';
import { ResourceCounter } from '@/components/composed';

const meta: Meta<typeof ResourceCounter> = {
  title: 'Composed/ResourceCounter',
  component: ResourceCounter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'gray',
      values: [{ name: 'gray', value: '#374151' }],
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['coins', 'lives', 'stars'],
      description: 'The type of resource',
    },
    value: {
      control: 'number',
      description: 'The current amount',
    },
    showAdd: {
      control: 'boolean',
      description: 'Whether to show the add button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResourceCounter>;

export const Coins: Story = {
  args: {
    type: 'coins',
    value: 1250,
    showAdd: true,
  },
};

export const Lives: Story = {
  args: {
    type: 'lives',
    value: 5,
    showAdd: true,
  },
};

export const Stars: Story = {
  args: {
    type: 'stars',
    value: 42,
    showAdd: false,
  },
};

export const WithoutAddButton: Story = {
  args: {
    type: 'coins',
    value: 999,
    showAdd: false,
  },
};

export const LargeNumber: Story = {
  args: {
    type: 'coins',
    value: 999999,
    showAdd: true,
  },
};

export const AllResources: Story = {
  render: () => (
    <div className="flex gap-3">
      <ResourceCounter type="coins" value={1250} showAdd onPress={() => {}} />
      <ResourceCounter type="lives" value={5} showAdd onPress={() => {}} />
      <ResourceCounter type="stars" value={42} />
    </div>
  ),
};

export const HeaderLayout: Story = {
  render: () => (
    <div className="bg-bg-inverse p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-text-inverse font-bold">Level 42</span>
        <div className="flex gap-2">
          <ResourceCounter type="coins" value={1250} showAdd onPress={() => {}} />
          <ResourceCounter type="lives" value={5} showAdd onPress={() => {}} />
        </div>
      </div>
    </div>
  ),
};
