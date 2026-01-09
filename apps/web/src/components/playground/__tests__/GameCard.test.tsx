import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GameCard } from '../GameCard';
import type { PublishedGame } from '../../../types';

const mockGame: PublishedGame = {
  id: 'test-game-123',
  name: 'Test Game',
  description: 'A test game description',
  thumbnail_url: 'https://example.com/thumbnail.jpg',
  play_count: 1500,
  published_at: '2024-01-01T00:00:00Z',
  author_name: 'Test Author',
  author_id: 'author-123',
};

const mockGameWithoutThumbnail: PublishedGame = {
  ...mockGame,
  id: 'test-game-no-thumb',
  thumbnail_url: null,
};

const mockGameNoPlays: PublishedGame = {
  ...mockGame,
  id: 'test-game-no-plays',
  play_count: 0,
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('GameCard', () => {
  describe('Rendering', () => {
    it('renders game name', () => {
      renderWithRouter(<GameCard game={mockGame} />);
      expect(screen.getByText('Test Game')).toBeInTheDocument();
    });

    it('renders thumbnail image when provided', () => {
      renderWithRouter(<GameCard game={mockGame} />);
      const img = screen.getByRole('img', { name: 'Test Game' });
      expect(img).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
    });

    it('renders fallback icon when no thumbnail', () => {
      renderWithRouter(<GameCard game={mockGameWithoutThumbnail} />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('links to play page', () => {
      renderWithRouter(<GameCard game={mockGame} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/play/test-game-123');
    });
  });

  describe('Play Count Badge', () => {
    it('displays play count when greater than 0', () => {
      renderWithRouter(<GameCard game={mockGame} />);
      expect(screen.getByText('1.5K')).toBeInTheDocument();
    });

    it('does not display play count badge when 0', () => {
      renderWithRouter(<GameCard game={mockGameNoPlays} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('formats millions correctly', () => {
      const millionGame = { ...mockGame, play_count: 2500000 };
      renderWithRouter(<GameCard game={millionGame} />);
      expect(screen.getByText('2.5M')).toBeInTheDocument();
    });

    it('formats thousands correctly', () => {
      const thousandGame = { ...mockGame, play_count: 5000 };
      renderWithRouter(<GameCard game={thousandGame} />);
      expect(screen.getByText('5.0K')).toBeInTheDocument();
    });

    it('displays raw number for counts under 1000', () => {
      const lowGame = { ...mockGame, play_count: 500 };
      renderWithRouter(<GameCard game={lowGame} />);
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = renderWithRouter(<GameCard game={mockGame} size="sm" />);
      const iconContainer = container.querySelector('.h-16.w-16');
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders medium size by default', () => {
      const { container } = renderWithRouter(<GameCard game={mockGame} />);
      const iconContainer = container.querySelector('.h-\\[72px\\].w-\\[72px\\]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders large size', () => {
      const { container } = renderWithRouter(<GameCard game={mockGame} size="lg" />);
      const iconContainer = container.querySelector('.h-24.w-24');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = renderWithRouter(
        <GameCard game={mockGame} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('has hover scale effect class', () => {
      const { container } = renderWithRouter(<GameCard game={mockGame} />);
      const iconContainer = container.querySelector('.group-hover\\:scale-105');
      expect(iconContainer).toBeInTheDocument();
    });

    it('has iOS shine overlay', () => {
      const { container } = renderWithRouter(<GameCard game={mockGame} />);
      const shineOverlay = container.querySelector('.ring-white\\/10');
      expect(shineOverlay).toBeInTheDocument();
    });
  });
});
