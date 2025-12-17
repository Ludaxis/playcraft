import type { Meta, StoryObj } from '@storybook/react';
import { ListRow } from '@/components/composed';

const meta: Meta<typeof ListRow> = {
  title: 'Composed/ListRow',
  component: ListRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'gray',
      values: [{ name: 'gray', value: '#F3F4F6' }],
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Main name text',
    },
    subtitle: {
      control: 'text',
      description: 'Secondary text below name',
    },
    rank: {
      control: 'number',
      description: 'Rank number to display',
    },
    value: {
      control: 'text',
      description: 'Value to show on the right',
    },
    highlighted: {
      control: 'boolean',
      description: 'Whether the row is highlighted',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ListRow>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    subtitle: '1,250 points',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const WithRank: Story = {
  args: {
    rank: 1,
    name: 'Jane Smith',
    subtitle: 'Level 42',
    value: '2,450',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const WithValue: Story = {
  args: {
    name: 'Mike Johnson',
    subtitle: '980 points',
    value: '#4',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const Highlighted: Story = {
  args: {
    rank: 5,
    name: 'You',
    subtitle: '1,100 points',
    value: '1,100',
    highlighted: true,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const Clickable: Story = {
  args: {
    name: 'Sarah Wilson',
    subtitle: 'Tap to view profile',
    onPress: () => alert('Row pressed'),
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const WithOnlineStatus: Story = {
  args: {
    name: 'Team Leader',
    subtitle: 'Leader',
    online: true,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const LeaderboardExample: Story = {
  render: () => (
    <div className="w-72 space-y-2">
      <ListRow
        rank={1}
        name="Alice"
        subtitle="Level 58"
        value="2,450"
      />
      <ListRow
        rank={2}
        name="Bob"
        subtitle="Level 52"
        value="2,180"
      />
      <ListRow
        rank={3}
        name="Charlie"
        subtitle="Level 49"
        value="1,920"
      />
      <ListRow
        rank={4}
        name="You"
        subtitle="Level 45"
        value="1,650"
        highlighted
      />
      <ListRow
        rank={5}
        name="Eve"
        subtitle="Level 44"
        value="1,580"
      />
    </div>
  ),
};

export const TeamMembersExample: Story = {
  render: () => (
    <div className="w-72 space-y-2">
      <ListRow
        name="Team Leader"
        subtitle="Leader"
        online={true}
        rightElement={<span className="text-xs text-status-success">Online</span>}
      />
      <ListRow
        name="Member 1"
        subtitle="Co-Leader"
        online={true}
        rightElement={<span className="text-xs text-status-success">Online</span>}
      />
      <ListRow
        name="Member 2"
        subtitle="Member"
        online={false}
        rightElement={<span className="text-xs text-text-muted">2h ago</span>}
      />
    </div>
  ),
};
