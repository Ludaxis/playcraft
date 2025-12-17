import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toggle } from '@/components/base';

const meta: Meta<typeof Toggle> = {
  title: 'Base/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the toggle is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

// Interactive example with state
const InteractiveToggle = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <Toggle checked={checked} onChange={setChecked} />
      <span className="text-sm text-text-secondary">
        {checked ? 'On' : 'Off'}
      </span>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveToggle />,
};

// Settings-like example
const SettingsExample = () => {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(false);

  return (
    <div className="w-64 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-primary">Notifications</span>
        <Toggle checked={notifications} onChange={setNotifications} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-primary">Sound</span>
        <Toggle checked={sound} onChange={setSound} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-primary">Vibration</span>
        <Toggle checked={vibration} onChange={setVibration} />
      </div>
    </div>
  );
};

export const SettingsUsage: Story = {
  render: () => <SettingsExample />,
};
