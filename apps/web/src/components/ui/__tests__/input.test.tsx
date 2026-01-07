import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('applies default styling with design tokens', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('bg-surface-overlay');
      expect(input).toHaveClass('border-border');
      expect(input).toHaveClass('text-content');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('Types', () => {
    it('renders text type by default', () => {
      render(<Input data-testid="input" />);
      // Input without type defaults to text (but attribute may not be present)
      const input = screen.getByTestId('input');
      expect(input.getAttribute('type') || 'text').toBe('text');
    });

    it('renders password type', () => {
      render(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('renders email type', () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });

    it('renders number type', () => {
      render(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
      expect(screen.getByTestId('input')).toHaveClass('disabled:opacity-50');
    });

    it('handles error state', () => {
      render(<Input error data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border-error');
    });

    it('shows focus ring on focus', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('focus-visible:ring-2');
    });

    it('has hover state for border', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('hover:border-border-emphasis');
    });
  });

  describe('Interactions', () => {
    it('accepts user input', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);

      await user.type(screen.getByTestId('input'), 'Hello World');
      expect(screen.getByTestId('input')).toHaveValue('Hello World');
    });

    it('calls onChange handler', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<Input onChange={onChange} data-testid="input" />);

      await user.type(screen.getByTestId('input'), 'a');
      expect(onChange).toHaveBeenCalled();
    });

    it('calls onFocus handler', async () => {
      const onFocus = vi.fn();
      const user = userEvent.setup();
      render(<Input onFocus={onFocus} data-testid="input" />);

      await user.click(screen.getByTestId('input'));
      expect(onFocus).toHaveBeenCalled();
    });

    it('calls onBlur handler', async () => {
      const onBlur = vi.fn();
      const user = userEvent.setup();
      render(<Input onBlur={onBlur} data-testid="input" />);

      await user.click(screen.getByTestId('input'));
      await user.tab();
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('associates with label via id', () => {
      render(
        <>
          <label htmlFor="test-input">Email</label>
          <Input id="test-input" />
        </>
      );
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('supports aria-describedby for errors', () => {
      render(
        <>
          <Input aria-describedby="error" data-testid="input" />
          <span id="error">Error message</span>
        </>
      );
      expect(screen.getByTestId('input')).toHaveAttribute('aria-describedby', 'error');
    });

    it('supports aria-invalid for error state', () => {
      render(<Input aria-invalid="true" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
    });

    it('can be focused with keyboard', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);

      await user.tab();
      expect(screen.getByTestId('input')).toHaveFocus();
    });
  });

  describe('Custom Props', () => {
    it('passes through HTML attributes', () => {
      render(<Input data-testid="input" maxLength={10} autoComplete="off" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('maxLength', '10');
      expect(input).toHaveAttribute('autoComplete', 'off');
    });

    it('merges custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('bg-surface-overlay');
    });
  });
});
