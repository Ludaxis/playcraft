import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select } from '@/components/base';

const meta: Meta<typeof Select> = {
  title: 'Base/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the select',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the select is in a loading state',
    },
    label: {
      control: 'text',
      description: 'Optional label for the select',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Fran\u00e7ais' },
  { value: 'es', label: 'Espa\u00f1ol' },
  { value: 'ja', label: '\u65e5\u672c\u8a9e' },
  { value: 'ko', label: '\ud55c\uad6d\uc5b4' },
];

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
];

export const Default: Story = {
  args: {
    value: 'en',
    options: languageOptions,
    onChange: () => {},
  },
};

export const WithLabel: Story = {
  args: {
    value: 'en',
    options: languageOptions,
    label: 'Language',
    onChange: () => {},
  },
};

export const Small: Story = {
  args: {
    value: 'en',
    options: languageOptions,
    size: 'sm',
    label: 'Language',
    onChange: () => {},
  },
};

export const Medium: Story = {
  args: {
    value: 'en',
    options: languageOptions,
    size: 'md',
    label: 'Language',
    onChange: () => {},
  },
};

export const Large: Story = {
  args: {
    value: 'en',
    options: languageOptions,
    size: 'lg',
    label: 'Language',
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    value: 'en',
    options: languageOptions,
    disabled: true,
    label: 'Language',
    onChange: () => {},
  },
};

export const Loading: Story = {
  args: {
    value: 'en',
    options: languageOptions,
    loading: true,
    label: 'Language',
    onChange: () => {},
  },
};

// Interactive example with state
const InteractiveSelect = () => {
  const [value, setValue] = useState('en');
  return (
    <div className="w-64">
      <Select
        value={value}
        options={languageOptions}
        onChange={setValue}
        label="Select Language"
      />
      <p className="mt-4 text-sm text-text-secondary">
        Selected: <span className="text-text-primary font-medium">{value}</span>
      </p>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveSelect />,
};

// All sizes comparison
const SizesComparison = () => {
  const [value, setValue] = useState('us');
  return (
    <div className="space-y-6 w-72">
      <Select
        value={value}
        options={countryOptions}
        onChange={setValue}
        size="sm"
        label="Small"
      />
      <Select
        value={value}
        options={countryOptions}
        onChange={setValue}
        size="md"
        label="Medium"
      />
      <Select
        value={value}
        options={countryOptions}
        onChange={setValue}
        size="lg"
        label="Large"
      />
    </div>
  );
};

export const Sizes: Story = {
  render: () => <SizesComparison />,
};

// Settings-like example
const SettingsExample = () => {
  const [language, setLanguage] = useState('en');
  const [country, setCountry] = useState('us');

  return (
    <div className="w-80 space-y-6 p-4 bg-bg-card rounded-xl">
      <h3 className="text-h3 text-text-primary">Preferences</h3>
      <Select
        value={language}
        options={languageOptions}
        onChange={setLanguage}
        label="Language"
        size="lg"
      />
      <Select
        value={country}
        options={countryOptions}
        onChange={setCountry}
        label="Region"
        size="lg"
      />
    </div>
  );
};

export const SettingsUsage: Story = {
  render: () => <SettingsExample />,
};
