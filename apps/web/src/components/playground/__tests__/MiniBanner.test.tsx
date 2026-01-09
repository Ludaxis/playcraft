import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MiniBanner } from '../MiniBanner';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('MiniBanner', () => {
  describe('CTA Variant', () => {
    it('renders with default props', () => {
      renderWithRouter(<MiniBanner variant="cta" />);
      expect(screen.getByText('Create Your Own Game')).toBeInTheDocument();
      expect(screen.getByText('Build with AI, no coding required')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Start Building/i })).toBeInTheDocument();
    });

    it('renders custom title and description', () => {
      renderWithRouter(
        <MiniBanner
          variant="cta"
          title="Custom Title"
          description="Custom description text"
        />
      );
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description text')).toBeInTheDocument();
    });

    it('renders custom button text', () => {
      renderWithRouter(
        <MiniBanner variant="cta" buttonText="Get Started" />
      );
      expect(screen.getByRole('link', { name: /Get Started/i })).toBeInTheDocument();
    });

    it('links to custom href', () => {
      renderWithRouter(<MiniBanner variant="cta" href="/custom-path" />);
      expect(screen.getByRole('link')).toHaveAttribute('href', '/custom-path');
    });

    it('links to home by default', () => {
      renderWithRouter(<MiniBanner variant="cta" />);
      expect(screen.getByRole('link')).toHaveAttribute('href', '/');
    });
  });

  describe('Spotlight Variant', () => {
    const mockCreator = {
      name: 'John Doe',
      avatar_url: 'https://example.com/avatar.jpg',
      games_count: 12,
      total_plays: 24500,
    };

    it('renders creator name', () => {
      renderWithRouter(<MiniBanner variant="spotlight" creator={mockCreator} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders creator spotlight label', () => {
      renderWithRouter(<MiniBanner variant="spotlight" creator={mockCreator} />);
      expect(screen.getByText('Creator Spotlight')).toBeInTheDocument();
    });

    it('renders games count', () => {
      renderWithRouter(<MiniBanner variant="spotlight" creator={mockCreator} />);
      expect(screen.getByText(/12 games/)).toBeInTheDocument();
    });

    it('formats large play counts', () => {
      renderWithRouter(<MiniBanner variant="spotlight" creator={mockCreator} />);
      expect(screen.getByText(/24\.5K plays/)).toBeInTheDocument();
    });

    it('formats millions correctly', () => {
      const bigCreator = { ...mockCreator, total_plays: 2500000 };
      renderWithRouter(<MiniBanner variant="spotlight" creator={bigCreator} />);
      expect(screen.getByText(/2\.5M plays/)).toBeInTheDocument();
    });

    it('displays raw number for counts under 1000', () => {
      const smallCreator = { ...mockCreator, total_plays: 500 };
      renderWithRouter(<MiniBanner variant="spotlight" creator={smallCreator} />);
      expect(screen.getByText(/500 plays/)).toBeInTheDocument();
    });

    it('renders view profile button', () => {
      renderWithRouter(<MiniBanner variant="spotlight" creator={mockCreator} />);
      expect(screen.getByRole('link', { name: 'View Profile' })).toBeInTheDocument();
    });

    it('links to custom href', () => {
      renderWithRouter(
        <MiniBanner variant="spotlight" creator={mockCreator} href="/creator/john" />
      );
      expect(screen.getByRole('link', { name: 'View Profile' })).toHaveAttribute(
        'href',
        '/creator/john'
      );
    });

    it('handles null avatar_url', () => {
      const creatorNoAvatar = { ...mockCreator, avatar_url: null };
      renderWithRouter(<MiniBanner variant="spotlight" creator={creatorNoAvatar} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom className to CTA variant', () => {
      const { container } = renderWithRouter(
        <MiniBanner variant="cta" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies custom className to spotlight variant', () => {
      const mockCreator = { name: 'Test', games_count: 5, total_plays: 100 };
      const { container } = renderWithRouter(
        <MiniBanner variant="spotlight" creator={mockCreator} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('has rounded corners', () => {
      const { container } = renderWithRouter(<MiniBanner variant="cta" />);
      expect(container.firstChild).toHaveClass('rounded-2xl');
    });

    it('has gradient background for CTA', () => {
      const { container } = renderWithRouter(<MiniBanner variant="cta" />);
      expect(container.firstChild).toHaveClass('bg-gradient-to-r');
    });
  });
});
