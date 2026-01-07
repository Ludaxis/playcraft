import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders with children', () => {
      render(
        <Button>
          <span data-testid="child">Child</span>
        </Button>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant with accent styling', () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-accent');
    });

    it('renders destructive variant with error styling', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-error');
    });

    it('renders outline variant with border', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-surface-elevated');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-surface-elevated');
    });

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('underline-offset-4');
    });

    it('renders accent variant (cyan gaming DNA)', () => {
      render(<Button variant="accent">Accent</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });
  });

  describe('Sizes', () => {
    it('renders default size', () => {
      render(<Button size="default">Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
    });

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11');
    });

    it('renders icon size', () => {
      render(<Button size="icon">Icon</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none');
    });

    it('has focus styles', () => {
      render(<Button>Focus</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={onClick}>Click</Button>);

      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Button onClick={onClick} disabled>
          Click
        </Button>
      );

      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('asChild', () => {
    it('renders as child element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
    });
  });

  describe('Accessibility', () => {
    it('can be focused with keyboard', async () => {
      const user = userEvent.setup();
      render(<Button>Focus me</Button>);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('can be activated with Enter key', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={onClick}>Activate</Button>);

      await user.tab();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('can be activated with Space key', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={onClick}>Activate</Button>);

      await user.tab();
      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-accent'); // default variant class
    });
  });
});
