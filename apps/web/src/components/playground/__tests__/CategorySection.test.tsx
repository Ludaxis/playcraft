import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CategorySection } from '../CategorySection';
import type { PublishedGame } from '../../../types';

const mockGames: PublishedGame[] = [
  {
    id: 'game-1',
    name: 'Game One',
    description: 'First game',
    thumbnail_url: 'https://example.com/thumb1.jpg',
    play_count: 100,
    published_at: '2024-01-01',
    author_name: 'Author 1',
    author_id: 'author-1',
  },
  {
    id: 'game-2',
    name: 'Game Two',
    description: 'Second game',
    thumbnail_url: null,
    play_count: 200,
    published_at: '2024-01-02',
    author_name: 'Author 2',
    author_id: 'author-2',
  },
  {
    id: 'game-3',
    name: 'Game Three',
    description: 'Third game',
    thumbnail_url: 'https://example.com/thumb3.jpg',
    play_count: 300,
    published_at: '2024-01-03',
    author_name: 'Author 3',
    author_id: 'author-3',
  },
];

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('CategorySection', () => {
  describe('Rendering', () => {
    it('renders section title', () => {
      renderWithRouter(<CategorySection title="Trending Games" games={mockGames} />);
      expect(screen.getByText('Trending Games')).toBeInTheDocument();
    });

    it('renders all game cards', () => {
      renderWithRouter(<CategorySection title="Games" games={mockGames} />);
      expect(screen.getByText('Game One')).toBeInTheDocument();
      expect(screen.getByText('Game Two')).toBeInTheDocument();
      expect(screen.getByText('Game Three')).toBeInTheDocument();
    });

    it('returns null when no games and not loading', () => {
      const { container } = renderWithRouter(
        <CategorySection title="Empty" games={[]} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('shows loading skeleton when isLoading is true', () => {
      const { container } = renderWithRouter(
        <CategorySection title="Loading" games={[]} isLoading />
      );
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('See All Button', () => {
    it('renders See All button when onSeeAll provided', () => {
      const onSeeAll = vi.fn();
      renderWithRouter(
        <CategorySection title="Games" games={mockGames} onSeeAll={onSeeAll} />
      );
      expect(screen.getByText(/See All/)).toBeInTheDocument();
    });

    it('does not render See All button when onSeeAll not provided', () => {
      renderWithRouter(<CategorySection title="Games" games={mockGames} />);
      expect(screen.queryByText(/See All/)).not.toBeInTheDocument();
    });

    it('calls onSeeAll when clicking See All', async () => {
      const onSeeAll = vi.fn();
      const user = userEvent.setup();
      renderWithRouter(
        <CategorySection title="Games" games={mockGames} onSeeAll={onSeeAll} />
      );

      await user.click(screen.getByText(/See All/));
      expect(onSeeAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scroll Buttons', () => {
    it('renders scroll left button', () => {
      renderWithRouter(<CategorySection title="Games" games={mockGames} />);
      expect(screen.getByRole('button', { name: 'Scroll left' })).toBeInTheDocument();
    });

    it('renders scroll right button', () => {
      renderWithRouter(<CategorySection title="Games" games={mockGames} />);
      expect(screen.getByRole('button', { name: 'Scroll right' })).toBeInTheDocument();
    });
  });

  describe('Card Sizes', () => {
    it('uses medium size by default', () => {
      const { container } = renderWithRouter(
        <CategorySection title="Games" games={mockGames} />
      );
      // Check for medium size card (72x72)
      const mediumCard = container.querySelector('.h-\\[72px\\]');
      expect(mediumCard).toBeInTheDocument();
    });

    it('passes cardSize to GameCard components', () => {
      const { container } = renderWithRouter(
        <CategorySection title="Games" games={mockGames} cardSize="lg" />
      );
      // Check for large size card (96x96)
      const largeCard = container.querySelector('.h-24');
      expect(largeCard).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = renderWithRouter(
        <CategorySection title="Games" games={mockGames} className="custom-class" />
      );
      expect(container.querySelector('section')).toHaveClass('custom-class');
    });

    it('has horizontal scroll container', () => {
      const { container } = renderWithRouter(
        <CategorySection title="Games" games={mockGames} />
      );
      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('has fade gradients for scroll indication', () => {
      const { container } = renderWithRouter(
        <CategorySection title="Games" games={mockGames} />
      );
      const leftFade = container.querySelector('.bg-gradient-to-r.from-surface');
      const rightFade = container.querySelector('.bg-gradient-to-l.from-surface');
      expect(leftFade).toBeInTheDocument();
      expect(rightFade).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows component when loading even with no games', () => {
      const { container } = renderWithRouter(
        <CategorySection title="Loading" games={[]} isLoading />
      );
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('renders loading skeletons instead of game cards', () => {
      renderWithRouter(
        <CategorySection title="Loading" games={mockGames} isLoading />
      );
      // When loading, should not show actual game names
      expect(screen.queryByText('Game One')).not.toBeInTheDocument();
    });
  });
});
