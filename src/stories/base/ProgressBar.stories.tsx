import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from '@/components/base';

const meta: Meta<typeof ProgressBar> = {
  title: 'Base/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    current: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current progress value',
    },
    max: {
      control: { type: 'number', min: 1 },
      description: 'Maximum progress value',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The height of the progress bar',
    },
    showLabel: {
      control: 'boolean',
      description: 'Whether to show the label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    current: 50,
    max: 100,
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const WithLabel: Story = {
  args: {
    current: 7,
    max: 15,
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const AllSizes: Story = {
  render: () => (
    <div className="w-64 space-y-4">
      <div>
        <p className="text-xs text-text-muted mb-1">Small</p>
        <ProgressBar current={30} max={100} size="sm" />
      </div>
      <div>
        <p className="text-xs text-text-muted mb-1">Medium</p>
        <ProgressBar current={50} max={100} size="md" />
      </div>
      <div>
        <p className="text-xs text-text-muted mb-1">Large</p>
        <ProgressBar current={70} max={100} size="lg" />
      </div>
    </div>
  ),
};

export const ProgressStates: Story = {
  render: () => (
    <div className="w-64 space-y-4">
      <ProgressBar current={0} max={100} showLabel />
      <ProgressBar current={25} max={100} showLabel />
      <ProgressBar current={50} max={100} showLabel />
      <ProgressBar current={75} max={100} showLabel />
      <ProgressBar current={100} max={100} showLabel />
    </div>
  ),
};
