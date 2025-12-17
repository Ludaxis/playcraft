import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from '@/components/composed';

const meta: Meta<typeof PageHeader> = {
  title: 'Composed/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The title displayed in the header',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Page Title',
  },
};

export const WithBackButton: Story = {
  args: {
    title: 'Settings',
    onBack: () => alert('Back pressed'),
  },
};

export const WithCloseButton: Story = {
  args: {
    title: 'Shop',
    onClose: () => alert('Close pressed'),
  },
};

export const WithBothButtons: Story = {
  args: {
    title: 'Edit Profile',
    onBack: () => alert('Back pressed'),
    onClose: () => alert('Close pressed'),
  },
};

export const WithRightElement: Story = {
  args: {
    title: 'Leaderboard',
    onBack: () => alert('Back pressed'),
    rightElement: (
      <button className="px-3 py-1 text-sm bg-bg-muted/20 rounded-lg text-text-inverse">
        Filter
      </button>
    ),
  },
};

export const WithLeftElement: Story = {
  args: {
    title: 'Shop',
    onClose: () => alert('Close pressed'),
    leftElement: (
      <div className="flex items-center gap-1 px-2 py-1 bg-bg-muted/20 rounded-lg">
        <span className="text-brand-primary text-sm">$</span>
        <span className="text-text-inverse text-sm font-bold">1,250</span>
      </div>
    ),
  },
};

export const LongTitle: Story = {
  args: {
    title: 'This Is A Very Long Page Title',
    onBack: () => alert('Back pressed'),
    onClose: () => alert('Close pressed'),
  },
};
