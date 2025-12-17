import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '@/components/base';

const meta: Meta<typeof Card> = {
  title: 'Base/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'gray',
      values: [{ name: 'gray', value: '#F3F4F6' }],
    },
  },
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'The padding inside the card',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'This is a card with default styling',
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: 'Card with small padding',
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: 'Card with large padding',
  },
};

export const Clickable: Story = {
  args: {
    onPress: () => alert('Card clicked!'),
    children: 'Click me!',
  },
};

export const WithContent: Story = {
  render: () => (
    <Card className="w-64">
      <h3 className="font-bold text-text-primary mb-2">Card Title</h3>
      <p className="text-sm text-text-secondary">
        This is some content inside the card. Cards are great for grouping related information.
      </p>
    </Card>
  ),
};
