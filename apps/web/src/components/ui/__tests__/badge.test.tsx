import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders badge with text', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders with children', () => {
      render(
        <Badge>
          <span data-testid="child">Icon</span>
          Label
        </Badge>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Label')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant with accent styling', () => {
      render(<Badge variant="default" data-testid="badge">Default</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-accent');
    });

    it('renders secondary variant', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-surface-elevated');
    });

    it('renders destructive variant with error styling', () => {
      render(<Badge variant="destructive" data-testid="badge">Delete</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-error');
    });

    it('renders outline variant with border', () => {
      render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('border-border');
    });

    it('renders success variant', () => {
      render(<Badge variant="success" data-testid="badge">Success</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-success');
    });

    it('renders warning variant', () => {
      render(<Badge variant="warning" data-testid="badge">Warning</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-warning');
    });

    it('renders accent variant (cyan gaming DNA)', () => {
      render(<Badge variant="accent" data-testid="badge">Accent</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-secondary');
    });

    it('renders glow variant with glow effect', () => {
      render(<Badge variant="glow" data-testid="badge">Glow</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('shadow-glow-sm');
      expect(badge).toHaveClass('bg-accent-subtle');
    });
  });

  describe('Styling', () => {
    it('applies rounded-full for pill shape', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('rounded-full');
    });

    it('applies inline-flex layout', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('inline-flex', 'items-center');
    });

    it('applies text styling', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-xs');
      expect(badge).toHaveClass('font-semibold');
    });

    it('applies transition for hover effect', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('transition-colors');
    });

    it('applies padding', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('px-2.5');
      expect(badge).toHaveClass('py-0.5');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Badge className="custom-class" data-testid="badge">
          Custom
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('bg-accent'); // default variant
    });
  });

  describe('HTML Attributes', () => {
    it('passes through HTML attributes', () => {
      render(
        <Badge data-testid="badge" title="Badge title" role="status">
          Badge
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('title', 'Badge title');
      expect(badge).toHaveAttribute('role', 'status');
    });
  });
});
