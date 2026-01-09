import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '../FilterBar';
import type { SortOption, GenreFilter } from '../FilterBar';

describe('FilterBar', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    activeGenre: 'all' as GenreFilter,
    onGenreChange: vi.fn(),
    sortBy: 'plays' as SortOption,
    onSortChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Input', () => {
    it('renders search input with placeholder', () => {
      render(<FilterBar {...defaultProps} />);
      expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();
    });

    it('displays current search query', () => {
      render(<FilterBar {...defaultProps} searchQuery="test search" />);
      expect(screen.getByDisplayValue('test search')).toBeInTheDocument();
    });

    it('calls onSearchChange when typing', async () => {
      const onSearchChange = vi.fn();
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} onSearchChange={onSearchChange} />);

      await user.type(screen.getByPlaceholderText('Search games...'), 'hello');
      expect(onSearchChange).toHaveBeenCalled();
    });
  });

  describe('Genre Filters', () => {
    it('renders all genre filter buttons', () => {
      render(<FilterBar {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Puzzle' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Adventure' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Arcade' })).toBeInTheDocument();
    });

    it('highlights active genre', () => {
      render(<FilterBar {...defaultProps} activeGenre="action" />);
      const actionButton = screen.getByRole('button', { name: 'Action' });
      expect(actionButton).toHaveClass('bg-accent');
    });

    it('calls onGenreChange when clicking genre', async () => {
      const onGenreChange = vi.fn();
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} onGenreChange={onGenreChange} />);

      await user.click(screen.getByRole('button', { name: 'Puzzle' }));
      expect(onGenreChange).toHaveBeenCalledWith('puzzle');
    });

    it('calls onGenreChange with all genres', async () => {
      const onGenreChange = vi.fn();
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} onGenreChange={onGenreChange} />);

      await user.click(screen.getByRole('button', { name: 'Adventure' }));
      expect(onGenreChange).toHaveBeenCalledWith('adventure');

      await user.click(screen.getByRole('button', { name: 'Arcade' }));
      expect(onGenreChange).toHaveBeenCalledWith('arcade');

      await user.click(screen.getByRole('button', { name: 'All' }));
      expect(onGenreChange).toHaveBeenCalledWith('all');
    });
  });

  describe('Sort Dropdown', () => {
    it('renders sort dropdown with all options', () => {
      render(<FilterBar {...defaultProps} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Most Played' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Newest' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Alphabetical' })).toBeInTheDocument();
    });

    it('displays current sort option', () => {
      render(<FilterBar {...defaultProps} sortBy="newest" />);
      expect(screen.getByRole('combobox')).toHaveValue('newest');
    });

    it('calls onSortChange when selecting option', async () => {
      const onSortChange = vi.fn();
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} onSortChange={onSortChange} />);

      await user.selectOptions(screen.getByRole('combobox'), 'name');
      expect(onSortChange).toHaveBeenCalledWith('name');
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <FilterBar {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('has sticky positioning class', () => {
      const { container } = render(<FilterBar {...defaultProps} />);
      expect(container.firstChild).toHaveClass('sticky');
    });

    it('has backdrop blur class', () => {
      const { container } = render(<FilterBar {...defaultProps} />);
      expect(container.firstChild).toHaveClass('backdrop-blur-md');
    });
  });
});
