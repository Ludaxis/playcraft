import type { Meta, StoryObj } from '@storybook/react';
import { InfoBox } from '@/components/composed';

const meta: Meta<typeof InfoBox> = {
  title: 'Composed/InfoBox',
  component: InfoBox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'gray',
      values: [{ name: 'gray', value: '#F3F4F6' }],
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'highlight'],
      description: 'The visual style of the info box',
    },
    title: {
      control: 'text',
      description: 'Optional title',
    },
    description: {
      control: 'text',
      description: 'Main description text',
    },
    iconText: {
      control: 'text',
      description: 'Text to display in the icon box',
    },
  },
};

export default meta;
type Story = StoryObj<typeof InfoBox>;

export const Default: Story = {
  args: {
    variant: 'default',
    description: 'This is an informational message for the user.',
    iconText: 'i',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const Highlight: Story = {
  args: {
    variant: 'highlight',
    description: 'This is a highlighted message with a golden accent.',
    iconText: '$',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const WithTitle: Story = {
  args: {
    variant: 'default',
    title: 'Did you know?',
    description: 'You can earn bonus coins by playing daily!',
    iconText: '?',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const HighlightWithTitle: Story = {
  args: {
    variant: 'highlight',
    title: 'Bonus Bank',
    description: 'Collect bonus coins during your journey!',
    iconText: '$',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div className="w-72 space-y-3">
      <InfoBox
        variant="default"
        title="Default"
        description="This is a default info box style."
        iconText="i"
      />
      <InfoBox
        variant="highlight"
        title="Highlight"
        description="This is a highlighted info box with golden accent."
        iconText="$"
      />
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    variant: 'default',
    title: 'Event Rules',
    description:
      'Complete levels during the event period to earn points. Each level completed awards 10 points. Bonus points are awarded for completing levels without using boosters.',
    iconText: '#',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const WithCustomIcon: Story = {
  args: {
    variant: 'highlight',
    description: 'Win games to earn stars and climb the leaderboard!',
    icon: <span className="text-xl">*</span>,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};
