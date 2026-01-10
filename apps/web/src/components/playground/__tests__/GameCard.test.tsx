import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameCard } from '../GameCard';
import type { PublishedGame } from '../../../types';

// Mock useBlobUrl to return the URL directly (bypasses async blob fetching in tests)
vi.mock('../../../hooks/useBlobUrl', () => ({
  useBlobUrl: (url: string | null | undefined) => url,
}));

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

describe('GameCard', () => {
  describe('Rendering', () => {
    it('renders game name', () => {
      render(<GameCard game={mockGame} />);
      expect(screen.getByText('Test Game')).toBeInTheDocument();
    });

    it('renders thumbnail image when provided', () => {
      render(<GameCard game={mockGame} />);
      const img = screen.getByRole('img', { name: 'Test Game' });
      expect(img).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
    });

    it('renders fallback icon when no thumbnail', () => {
      render(<GameCard game={mockGameWithoutThumbnail} />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('calls onClick with game when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<GameCard game={mockGame} onClick={handleClick} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledWith(mockGame);
    });
  });

  describe('Play Count Badge', () => {
    it('displays play count when greater than 0', () => {
      render(<GameCard game={mockGame} />);
      expect(screen.getByText('1.5K')).toBeInTheDocument();
    });

    it('does not display play count badge when 0', () => {
      render(<GameCard game={mockGameNoPlays} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('formats millions correctly', () => {
      const millionGame = { ...mockGame, play_count: 2500000 };
      render(<GameCard game={millionGame} />);
      expect(screen.getByText('2.5M')).toBeInTheDocument();
    });

    it('formats thousands correctly', () => {
      const thousandGame = { ...mockGame, play_count: 5000 };
      render(<GameCard game={thousandGame} />);
      expect(screen.getByText('5.0K')).toBeInTheDocument();
    });

    it('displays raw number for counts under 1000', () => {
      const lowGame = { ...mockGame, play_count: 500 };
      render(<GameCard game={lowGame} />);
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<GameCard game={mockGame} size="sm" />);
      const iconContainer = container.querySelector('.h-16.w-16');
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders medium size by default', () => {
      const { container } = render(<GameCard game={mockGame} />);
      const iconContainer = container.querySelector('.h-\\[72px\\].w-\\[72px\\]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders large size', () => {
      const { container } = render(<GameCard game={mockGame} size="lg" />);
      const iconContainer = container.querySelector('.h-24.w-24');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <GameCard game={mockGame} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('has hover scale effect class', () => {
      const { container } = render(<GameCard game={mockGame} />);
      const iconContainer = container.querySelector('.group-hover\\:scale-105');
      expect(iconContainer).toBeInTheDocument();
    });

    it('has iOS shine overlay', () => {
      const { container } = render(<GameCard game={mockGame} />);
      const shineOverlay = container.querySelector('.ring-white\\/10');
      expect(shineOverlay).toBeInTheDocument();
    });
  });
});
