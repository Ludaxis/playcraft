import type { Meta, StoryObj } from '@storybook/react';
import { EventCard } from '@/components/composed';

const meta: Meta<typeof EventCard> = {
  title: 'Composed/EventCard',
  component: EventCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    icon: {
      control: 'text',
      description: 'Icon/emoji text to display',
    },
    endTime: {
      control: 'date',
      description: 'Event end time',
    },
  },
};

export default meta;
type Story = StoryObj<typeof EventCard>;

// Helper to create future dates
const futureDate = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
};

export const Default: Story = {
  args: {
    icon: 'RP',
    endTime: futureDate(12),
    onPress: () => alert('Event pressed'),
  },
};

export const ShortTime: Story = {
  args: {
    icon: 'LR',
    endTime: futureDate(1),
    onPress: () => alert('Event pressed'),
  },
};

export const LongTime: Story = {
  args: {
    icon: 'TC',
    endTime: futureDate(48),
    onPress: () => alert('Event pressed'),
  },
};

export const NoTimer: Story = {
  args: {
    icon: 'DQ',
    endTime: null,
    onPress: () => alert('Event pressed'),
  },
};

export const EventGrid: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <EventCard
        icon="RP"
        endTime={futureDate(6)}
        onPress={() => {}}
      />
      <EventCard
        icon="LR"
        endTime={futureDate(2)}
        onPress={() => {}}
      />
      <EventCard
        icon="TC"
        endTime={futureDate(24)}
        onPress={() => {}}
      />
      <EventCard
        icon="KC"
        endTime={futureDate(12)}
        onPress={() => {}}
      />
    </div>
  ),
};

export const WithCustomIcon: Story = {
  args: {
    icon: '',
    iconElement: <span className="text-xl">$</span>,
    endTime: futureDate(8),
    onPress: () => alert('Event pressed'),
  },
};
