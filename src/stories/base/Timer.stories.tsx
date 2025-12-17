import type { Meta, StoryObj } from '@storybook/react';
import { Timer } from '@/components/base';

const meta: Meta<typeof Timer> = {
  title: 'Base/Timer',
  component: Timer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact', 'badge'],
      description: 'The visual style of the timer',
    },
    endTime: {
      control: 'date',
      description: 'The end time for the countdown',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Timer>;

// Helper to create future dates
const futureDate = (hours: number, minutes: number = 0) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes);
  return date;
};

export const Default: Story = {
  args: {
    endTime: futureDate(2, 30),
  },
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    endTime: futureDate(1, 45),
  },
};

export const Badge: Story = {
  args: {
    variant: 'badge',
    endTime: futureDate(0, 30),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-text-muted mb-2">Default</p>
        <Timer endTime={futureDate(5, 30)} variant="default" />
      </div>
      <div>
        <p className="text-xs text-text-muted mb-2">Compact</p>
        <Timer endTime={futureDate(2, 15)} variant="compact" />
      </div>
      <div>
        <p className="text-xs text-text-muted mb-2">Badge</p>
        <Timer endTime={futureDate(0, 45)} variant="badge" />
      </div>
    </div>
  ),
};

export const LongDuration: Story = {
  args: {
    endTime: futureDate(48),
    variant: 'default',
  },
};

export const ShortDuration: Story = {
  args: {
    endTime: futureDate(0, 5),
    variant: 'badge',
  },
};
