import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../dialog';

describe('Dialog', () => {
  describe('Rendering', () => {
    it('renders trigger button', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('does not render content initially', () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(screen.queryByText('Title')).not.toBeInTheDocument();
    });

    it('renders content when open', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog description text.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog description text.')).toBeInTheDocument();
    });

    it('renders all dialog sections', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Header Title</DialogTitle>
            </DialogHeader>
            <div>Content Area</div>
            <DialogFooter>Footer Area</DialogFooter>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Header Title')).toBeInTheDocument();
      expect(screen.getByText('Content Area')).toBeInTheDocument();
      expect(screen.getByText('Footer Area')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('opens on trigger click', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));
      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
      });
    });

    it('closes on close button click', async () => {
      const user = userEvent.setup();
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogClose data-testid="close-btn">Close</DialogClose>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      await user.click(screen.getByTestId('close-btn'));
      await waitFor(() => {
        expect(screen.queryByText('Title')).not.toBeInTheDocument();
      });
    });

    it('closes on X button click', async () => {
      const user = userEvent.setup();
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      // Find the close button by its sr-only text
      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find((btn) => btn.querySelector('.sr-only'));
      expect(xButton).toBeTruthy();
      await user.click(xButton!);
      await waitFor(() => {
        expect(screen.queryByText('Title')).not.toBeInTheDocument();
      });
    });

    it('closes on Escape key', async () => {
      const user = userEvent.setup();
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByText('Title')).not.toBeInTheDocument();
      });
    });

    it('calls onOpenChange when state changes', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Styling', () => {
    it('applies design token classes to content', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="content">
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('bg-surface-elevated');
      expect(content).toHaveClass('border-border');
    });

    it('applies animation classes', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="content">
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('data-[state=open]:animate-scale-in');
    });

    it('applies shadow styling', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent data-testid="content">
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('shadow-elevated-lg');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      const dialog = screen.getByRole('dialog');
      // Radix Dialog uses role="dialog" and provides aria attributes
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('role', 'dialog');
    });

    it('has close button with accessible label', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      // The close button has sr-only "Close" text for screen readers
      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find((btn) => btn.querySelector('.sr-only'));
      expect(xButton).toBeTruthy();
      expect(xButton!.querySelector('.sr-only')?.textContent).toBe('Close');
    });
  });

  describe('Controlled Mode', () => {
    it('works with controlled open state', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Controlled Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Controlled Title')).toBeInTheDocument();
    });

    it('does not show content when controlled open is false', () => {
      render(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>Hidden Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Hidden Title')).not.toBeInTheDocument();
    });
  });
});
