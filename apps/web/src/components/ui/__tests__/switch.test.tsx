import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../switch';

describe('Switch', () => {
  describe('Rendering', () => {
    it('renders switch element', () => {
      render(<Switch aria-label="Enable notifications" />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders unchecked by default', () => {
      render(<Switch aria-label="Enable notifications" />);
      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    it('renders checked when defaultChecked', () => {
      render(<Switch aria-label="Enable notifications" defaultChecked />);
      expect(screen.getByRole('switch')).toBeChecked();
    });
  });

  describe('Interactions', () => {
    it('toggles on click', async () => {
      const user = userEvent.setup();
      render(<Switch aria-label="Enable notifications" />);

      const switchEl = screen.getByRole('switch');
      expect(switchEl).not.toBeChecked();

      await user.click(switchEl);
      expect(switchEl).toBeChecked();

      await user.click(switchEl);
      expect(switchEl).not.toBeChecked();
    });

    it('calls onCheckedChange when toggled', async () => {
      const onCheckedChange = vi.fn();
      const user = userEvent.setup();
      render(<Switch aria-label="Enable notifications" onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByRole('switch'));
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('toggles with keyboard (Space)', async () => {
      const user = userEvent.setup();
      render(<Switch aria-label="Enable notifications" />);

      const switchEl = screen.getByRole('switch');
      await user.tab();
      expect(switchEl).toHaveFocus();

      await user.keyboard(' ');
      expect(switchEl).toBeChecked();
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Switch aria-label="Enable notifications" disabled />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('does not toggle when disabled', async () => {
      const onCheckedChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Switch aria-label="Enable notifications" disabled onCheckedChange={onCheckedChange} />
      );

      await user.click(screen.getByRole('switch'));
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies unchecked background styling', () => {
      render(<Switch aria-label="Enable notifications" data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('data-[state=unchecked]:bg-surface-overlay');
    });

    it('applies checked state styling', () => {
      render(<Switch aria-label="Enable notifications" data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('data-[state=checked]:bg-accent');
    });

    it('applies focus ring styling', () => {
      render(<Switch aria-label="Enable notifications" data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('focus-visible:ring-2');
      expect(switchEl).toHaveClass('focus-visible:ring-accent');
    });

    it('applies rounded-full for pill shape', () => {
      render(<Switch aria-label="Enable notifications" data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveClass('rounded-full');
    });

    it('applies transition styling', () => {
      render(<Switch aria-label="Enable notifications" data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveClass('transition-colors');
    });
  });

  describe('Accessibility', () => {
    it('has correct role', () => {
      render(<Switch aria-label="Enable notifications" />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('can be associated with a label', () => {
      render(
        <div>
          <label htmlFor="notifications">Enable notifications</label>
          <Switch id="notifications" />
        </div>
      );
      expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <div>
          <Switch aria-label="Enable" aria-describedby="desc" data-testid="switch" />
          <span id="desc">Description</span>
        </div>
      );
      expect(screen.getByTestId('switch')).toHaveAttribute('aria-describedby', 'desc');
    });
  });

  describe('Controlled Mode', () => {
    it('works with controlled checked state', () => {
      const { rerender } = render(<Switch aria-label="Enable notifications" checked={false} />);
      expect(screen.getByRole('switch')).not.toBeChecked();

      rerender(<Switch aria-label="Enable notifications" checked={true} />);
      expect(screen.getByRole('switch')).toBeChecked();
    });
  });

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(
        <Switch aria-label="Enable notifications" className="custom-class" data-testid="switch" />
      );
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('custom-class');
      expect(switchEl).toHaveClass('rounded-full');
    });
  });
});
