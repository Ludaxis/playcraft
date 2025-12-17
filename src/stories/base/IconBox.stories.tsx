import type { Meta, StoryObj } from '@storybook/react';
import { IconBox } from '@/components/base';

const meta: Meta<typeof IconBox> = {
  title: 'Base/IconBox',
  component: IconBox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The size of the icon box',
    },
    shape: {
      control: 'select',
      options: ['square', 'rounded', 'circle'],
      description: 'The shape of the icon box',
    },
    variant: {
      control: 'select',
      options: ['default', 'muted', 'inverse'],
      description: 'The visual variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconBox>;

export const Default: Story = {
  args: {
    children: '$',
  },
};

export const Circle: Story = {
  args: {
    shape: 'circle',
    children: '$',
  },
};

export const Inverse: Story = {
  args: {
    variant: 'inverse',
    children: '$',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconBox size="xs">XS</IconBox>
      <IconBox size="sm">SM</IconBox>
      <IconBox size="md">MD</IconBox>
      <IconBox size="lg">LG</IconBox>
      <IconBox size="xl">XL</IconBox>
    </div>
  ),
};

export const AllShapes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconBox shape="square">Sq</IconBox>
      <IconBox shape="rounded">Rd</IconBox>
      <IconBox shape="circle">Ci</IconBox>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconBox variant="default">Def</IconBox>
      <IconBox variant="muted">Mut</IconBox>
      <IconBox variant="inverse">Inv</IconBox>
    </div>
  ),
};
