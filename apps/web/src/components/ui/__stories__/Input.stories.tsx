import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../input';
import { Label } from '../label';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'The input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input has an error',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'user@example.com',
    type: 'email',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const DisabledWithValue: Story = {
  args: {
    defaultValue: 'Cannot edit this',
    disabled: true,
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Enter email...',
    error: true,
    defaultValue: 'invalid-email',
  },
};

export const WithErrorMessage: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email-error">Email</Label>
      <Input
        type="email"
        id="email-error"
        placeholder="Email"
        error
        defaultValue="invalid"
        aria-describedby="email-error-message"
      />
      <p id="email-error-message" className="text-sm text-error">
        Please enter a valid email address.
      </p>
    </div>
  ),
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter number...',
  },
};

export const File: Story = {
  args: {
    type: 'file',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Input placeholder="Default" />
      <Input placeholder="With value" defaultValue="Some text" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Error state" error />
    </div>
  ),
};
