import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders checkbox element', () => {
      render(<Checkbox aria-label="Accept terms" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders unchecked by default', () => {
      render(<Checkbox aria-label="Accept terms" />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('renders checked when defaultChecked', () => {
      render(<Checkbox aria-label="Accept terms" defaultChecked />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('Interactions', () => {
    it('toggles on click', async () => {
      const user = userEvent.setup();
      render(<Checkbox aria-label="Accept terms" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('calls onCheckedChange when toggled', async () => {
      const onCheckedChange = vi.fn();
      const user = userEvent.setup();
      render(<Checkbox aria-label="Accept terms" onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('toggles with keyboard (Space)', async () => {
      const user = userEvent.setup();
      render(<Checkbox aria-label="Accept terms" />);

      const checkbox = screen.getByRole('checkbox');
      await user.tab();
      expect(checkbox).toHaveFocus();

      await user.keyboard(' ');
      expect(checkbox).toBeChecked();
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Checkbox aria-label="Accept terms" disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('does not toggle when disabled', async () => {
      const onCheckedChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Checkbox aria-label="Accept terms" disabled onCheckedChange={onCheckedChange} />
      );

      await user.click(screen.getByRole('checkbox'));
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies border styling', () => {
      render(<Checkbox aria-label="Accept terms" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('border-border');
    });

    it('applies checked state styling', () => {
      render(<Checkbox aria-label="Accept terms" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('data-[state=checked]:bg-accent');
    });

    it('applies focus ring styling', () => {
      render(<Checkbox aria-label="Accept terms" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('focus-visible:ring-2');
      expect(checkbox).toHaveClass('focus-visible:ring-accent');
    });

    it('applies transition styling', () => {
      render(<Checkbox aria-label="Accept terms" data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toHaveClass('transition-colors');
    });
  });

  describe('Accessibility', () => {
    it('can be associated with a label', () => {
      render(
        <div>
          <label htmlFor="terms">Accept terms</label>
          <Checkbox id="terms" />
        </div>
      );
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <div>
          <Checkbox aria-label="Accept" aria-describedby="desc" data-testid="checkbox" />
          <span id="desc">Description</span>
        </div>
      );
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-describedby', 'desc');
    });
  });

  describe('Controlled Mode', () => {
    it('works with controlled checked state', () => {
      const { rerender } = render(<Checkbox aria-label="Accept terms" checked={false} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();

      rerender(<Checkbox aria-label="Accept terms" checked={true} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(
        <Checkbox aria-label="Accept terms" className="custom-class" data-testid="checkbox" />
      );
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('custom-class');
      expect(checkbox).toHaveClass('border-border');
    });
  });
});
