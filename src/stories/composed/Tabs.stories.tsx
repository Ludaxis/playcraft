import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from '@/components/composed/Tabs';

/**
 * Tabs provide a simple way to switch between different views or content sections.
 *
 * ## Usage
 * ```tsx
 * import { Tabs } from '@/components/composed';
 *
 * const tabs = [
 *   { id: 'overview', label: 'Overview' },
 *   { id: 'details', label: 'Details' },
 * ];
 *
 * <Tabs
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 * ```
 */
const meta: Meta<typeof Tabs> = {
  title: 'Composed/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    activeTab: {
      control: 'select',
      options: ['tab1', 'tab2'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const defaultTabs = [
  { id: 'tab1', label: 'Tab 1' },
  { id: 'tab2', label: 'Tab 2' },
];

/** Default tabs with two options */
export const Default: Story = {
  args: {
    tabs: defaultTabs,
    activeTab: 'tab1',
    onTabChange: () => {},
  },
};

/** Tabs with three options */
export const ThreeTabs: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'stats', label: 'Stats' },
      { id: 'settings', label: 'Settings' },
    ],
    activeTab: 'overview',
    onTabChange: () => {},
  },
};

/** Interactive tabs with state management */
function ControlledTabs() {
  const [activeTab, setActiveTab] = useState('rewards');
  const tabs = [
    { id: 'rewards', label: 'Rewards' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="w-80 space-y-4">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="p-4 bg-bg-card rounded-lg border border-border">
        <p className="text-text-primary text-body">
          Active: <span className="font-bold">{activeTab}</span>
        </p>
      </div>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledTabs />,
};

/** Tabs with content panels */
function TabsWithContent() {
  const [activeTab, setActiveTab] = useState('daily');
  const tabs = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
  ];

  return (
    <div className="w-96 space-y-4">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="p-4 bg-bg-card rounded-lg border border-border min-h-[100px]">
        {activeTab === 'daily' && (
          <div>
            <p className="text-text-primary font-bold">Daily Challenges</p>
            <p className="text-text-muted text-body-sm">Complete 3 levels today</p>
          </div>
        )}
        {activeTab === 'weekly' && (
          <div>
            <p className="text-text-primary font-bold">Weekly Goals</p>
            <p className="text-text-muted text-body-sm">Earn 10,000 coins this week</p>
          </div>
        )}
        {activeTab === 'monthly' && (
          <div>
            <p className="text-text-primary font-bold">Monthly Rewards</p>
            <p className="text-text-muted text-body-sm">Login 20 days for bonus</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const WithContent: Story = {
  render: () => <TabsWithContent />,
};
