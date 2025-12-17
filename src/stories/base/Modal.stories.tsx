import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal, Button } from '@/components/base';

const meta: Meta<typeof Modal> = {
  title: 'Base/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
      description: 'The size of the modal',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Interactive modal example
const InteractiveModal = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'full' }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size={size}>
        <Modal.Header title="Modal Title" onClose={() => setIsOpen(false)} />
        <Modal.Body>
          <p className="text-text-secondary">
            This is the modal body content. You can put any content here including forms,
            images, or other components.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: () => <InteractiveModal />,
};

export const Small: Story = {
  render: () => <InteractiveModal size="sm" />,
};

export const Large: Story = {
  render: () => <InteractiveModal size="lg" />,
};

export const FullScreen: Story = {
  render: () => <InteractiveModal size="full" />,
};

// Confirmation dialog example
const ConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Delete Item
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
        <Modal.Header title="Confirm Delete" onClose={() => setIsOpen(false)} />
        <Modal.Body>
          <p className="text-text-secondary">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const ConfirmDialog: Story = {
  render: () => <ConfirmationDialog />,
};

// Form modal example
const FormModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Form</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
        <Modal.Header title="Edit Profile" onClose={() => setIsOpen(false)} />
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter your email"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const FormExample: Story = {
  render: () => <FormModal />,
};

// Modal without footer
const SimpleInfoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Show Info</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
        <Modal.Header title="Information" onClose={() => setIsOpen(false)} />
        <Modal.Body>
          <p className="text-text-secondary">
            This is an informational modal without a footer. Click the X or outside to close.
          </p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export const WithoutFooter: Story = {
  render: () => <SimpleInfoModal />,
};
