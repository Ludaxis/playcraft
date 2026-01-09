import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { HeroBanner } from '../HeroBanner';
import type { PublishedGame } from '../../../types';

// Mock useBlobUrl to return the URL directly (bypasses async blob fetching in tests)
vi.mock('../../../hooks/useBlobUrl', () => ({
  useBlobUrl: (url: string | null | undefined) => url,
}));

const mockGames: PublishedGame[] = [
  {
    id: 'featured-1',
    name: 'Featured Game One',
    description: 'An amazing adventure game',
    thumbnail_url: 'https://example.com/featured1.jpg',
    play_count: 5000,
    published_at: '2024-01-01',
    author_name: 'Pro Creator',
    author_id: 'author-1',
  },
  {
    id: 'featured-2',
    name: 'Featured Game Two',
    description: 'A challenging puzzle game',
    thumbnail_url: 'https://example.com/featured2.jpg',
    play_count: 3000,
    published_at: '2024-01-02',
    author_name: 'Another Creator',
    author_id: 'author-2',
  },
  {
    id: 'featured-3',
    name: 'Featured Game Three',
    description: null,
    thumbnail_url: null,
    play_count: 1000,
    published_at: '2024-01-03',
    author_name: null,
    author_id: 'author-3',
  },
];

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('HeroBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders first game by default', () => {
      renderWithRouter(<HeroBanner games={mockGames} />);
      expect(screen.getByText('Featured Game One')).toBeInTheDocument();
      expect(screen.getByText('An amazing adventure game')).toBeInTheDocument();
    });

    it('renders Featured label', () => {
      renderWithRouter(<HeroBanner games={mockGames} />);
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('renders Play Now button', () => {
      renderWithRouter(<HeroBanner games={mockGames} />);
      expect(screen.getByRole('link', { name: /Play Now/i })).toBeInTheDocument();
    });

    it('links to correct play page', () => {
      renderWithRouter(<HeroBanner games={mockGames} />);
      expect(screen.getByRole('link', { name: /Play Now/i })).toHaveAttribute(
        'href',
        '/play/featured-1'
      );
    });

    it('renders author name when provided', () => {
      renderWithRouter(<HeroBanner games={mockGames} />);
      expect(screen.getByText('by Pro Creator')).toBeInTheDocument();
    });

    it('returns null when no games', () => {
      const { container } = renderWithRouter(<HeroBanner games={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when isLoading is true', () => {
      const { container } = renderWithRouter(<HeroBanner games={[]} isLoading />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('does not show games content when loading', () => {
      renderWithRouter(<HeroBanner games={mockGames} isLoading />);
      expect(screen.queryByText('Featured Game One')).not.toBeInTheDocument();
    });
  });

  describe('Thumbnail', () => {
    it('renders thumbnail image when provided', () => {
      renderWithRouter(<HeroBanner games={mockGames} />);
      const img = screen.getByRole('img', { name: 'Featured Game One' });
      expect(img).toHaveAttribute('src', 'https://example.com/featured1.jpg');
    });

    it('shows fallback icon when no thumbnail', async () => {
      renderWithRouter(<HeroBanner games={[mockGames[2]]} />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Dots', () => {
    it('renders navigation dots for multiple games', () => {
      renderWithRouter(<HeroBanner games={mockGames} />);
      const dots = screen.getAllByRole('button', { name: /Go to slide/i });
      expect(dots).toHaveLength(3);
    });

    it('does not render dots for single game', () => {
      renderWithRouter(<HeroBanner games={[mockGames[0]]} />);
      expect(screen.queryByRole('button', { name: /Go to slide/i })).not.toBeInTheDocument();
    });

    it('highlights active dot', () => {
      const { container } = renderWithRouter(<HeroBanner games={mockGames} />);
      const activeDot = container.querySelector('.w-6.bg-accent');
      expect(activeDot).toBeInTheDocument();
    });

    it('changes slide when clicking dot', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      renderWithRouter(<HeroBanner games={mockGames} autoRotateMs={0} />);

      await user.click(screen.getByRole('button', { name: 'Go to slide 2' }));
      expect(screen.getByText('Featured Game Two')).toBeInTheDocument();
    });
  });

  describe('Auto-rotation', () => {
    it('auto-rotates after specified interval', async () => {
      renderWithRouter(<HeroBanner games={mockGames} autoRotateMs={1000} />);

      expect(screen.getByText('Featured Game One')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('Featured Game Two')).toBeInTheDocument();
    });

    it('loops back to first slide after last', async () => {
      renderWithRouter(<HeroBanner games={mockGames} autoRotateMs={1000} />);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.getByText('Featured Game One')).toBeInTheDocument();
    });

    it('does not auto-rotate when autoRotateMs is 0', async () => {
      renderWithRouter(<HeroBanner games={mockGames} autoRotateMs={0} />);

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      expect(screen.getByText('Featured Game One')).toBeInTheDocument();
    });

    it('does not auto-rotate with single game', async () => {
      renderWithRouter(<HeroBanner games={[mockGames[0]]} autoRotateMs={1000} />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText('Featured Game One')).toBeInTheDocument();
    });
  });

  describe('Description', () => {
    it('renders description when provided', () => {
      renderWithRouter(<HeroBanner games={mockGames} />);
      expect(screen.getByText('An amazing adventure game')).toBeInTheDocument();
    });

    it('handles null description gracefully', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      renderWithRouter(<HeroBanner games={mockGames} autoRotateMs={0} />);

      await user.click(screen.getByRole('button', { name: 'Go to slide 3' }));
      expect(screen.getByText('Featured Game Three')).toBeInTheDocument();
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });
  });

  describe('Author', () => {
    it('renders author name when provided', () => {
      renderWithRouter(<HeroBanner games={mockGames} />);
      expect(screen.getByText('by Pro Creator')).toBeInTheDocument();
    });

    it('handles null author gracefully', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      renderWithRouter(<HeroBanner games={mockGames} autoRotateMs={0} />);

      await user.click(screen.getByRole('button', { name: 'Go to slide 3' }));
      expect(screen.queryByText(/^by /)).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has rounded corners', () => {
      const { container } = renderWithRouter(<HeroBanner games={mockGames} />);
      expect(container.firstChild).toHaveClass('rounded-2xl');
    });

    it('has border styling', () => {
      const { container } = renderWithRouter(<HeroBanner games={mockGames} />);
      expect(container.firstChild).toHaveClass('border');
    });

    it('has overlay gradient for text readability', () => {
      const { container } = renderWithRouter(<HeroBanner games={mockGames} />);
      const gradientOverlay = container.querySelector('.bg-gradient-to-t');
      expect(gradientOverlay).toBeInTheDocument();
    });
  });
});
