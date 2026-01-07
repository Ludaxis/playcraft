import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders card with all sections', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text.</CardDescription>
          </CardHeader>
          <CardContent>Main content area</CardContent>
          <CardFooter>Footer actions</CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description text.')).toBeInTheDocument();
      expect(screen.getByText('Main content area')).toBeInTheDocument();
      expect(screen.getByText('Footer actions')).toBeInTheDocument();
    });

    it('renders card without optional sections', () => {
      render(
        <Card>
          <CardContent>Just content</CardContent>
        </Card>
      );

      expect(screen.getByText('Just content')).toBeInTheDocument();
    });

    it('renders nested content', () => {
      render(
        <Card>
          <CardContent>
            <div data-testid="nested">
              <span>Nested content</span>
            </div>
          </CardContent>
        </Card>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies surface-elevated background', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('bg-surface-elevated');
    });

    it('applies border styling', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('border-border');
    });

    it('applies rounded corners', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('rounded-xl');
    });

    it('applies shadow styling', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('shadow-elevated');
    });

    it('applies text color', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('text-content');
    });
  });

  describe('CardHeader', () => {
    it('applies flex layout', () => {
      render(
        <Card>
          <CardHeader data-testid="header">
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByTestId('header')).toHaveClass('flex', 'flex-col');
    });

    it('applies spacing', () => {
      render(
        <Card>
          <CardHeader data-testid="header">
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByTestId('header')).toHaveClass('p-6');
    });
  });

  describe('CardTitle', () => {
    it('renders as h3', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('applies typography styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle data-testid="title">Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-2xl');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('text-content');
    });
  });

  describe('CardDescription', () => {
    it('applies secondary text color', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription data-testid="desc">Description</CardDescription>
          </CardHeader>
        </Card>
      );

      expect(screen.getByTestId('desc')).toHaveClass('text-content-secondary');
    });

    it('applies small text size', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription data-testid="desc">Description</CardDescription>
          </CardHeader>
        </Card>
      );

      expect(screen.getByTestId('desc')).toHaveClass('text-sm');
    });
  });

  describe('CardContent', () => {
    it('applies padding', () => {
      render(
        <Card>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('pt-0');
    });
  });

  describe('CardFooter', () => {
    it('applies flex layout', () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );

      expect(screen.getByTestId('footer')).toHaveClass('flex', 'items-center');
    });

    it('applies padding', () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('p-6');
      expect(footer).toHaveClass('pt-0');
    });
  });

  describe('Custom className', () => {
    it('merges custom className on Card', () => {
      render(
        <Card className="custom-card" data-testid="card">
          Content
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-card');
      expect(card).toHaveClass('bg-surface-elevated');
    });

    it('merges custom className on all subcomponents', () => {
      render(
        <Card>
          <CardHeader className="custom-header" data-testid="header">
            <CardTitle className="custom-title" data-testid="title">
              Title
            </CardTitle>
            <CardDescription className="custom-desc" data-testid="desc">
              Desc
            </CardDescription>
          </CardHeader>
          <CardContent className="custom-content" data-testid="content">
            Content
          </CardContent>
          <CardFooter className="custom-footer" data-testid="footer">
            Footer
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId('header')).toHaveClass('custom-header');
      expect(screen.getByTestId('title')).toHaveClass('custom-title');
      expect(screen.getByTestId('desc')).toHaveClass('custom-desc');
      expect(screen.getByTestId('content')).toHaveClass('custom-content');
      expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref on Card', () => {
      const ref = { current: null };
      render(
        <Card ref={ref}>
          <CardContent>Content</CardContent>
        </Card>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref on CardTitle', () => {
      const ref = { current: null };
      render(
        <Card>
          <CardHeader>
            <CardTitle ref={ref}>Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
  });
});
