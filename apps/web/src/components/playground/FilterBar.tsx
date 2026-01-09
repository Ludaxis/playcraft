import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export type SortOption = 'plays' | 'newest' | 'name';
export type GenreFilter = 'all' | 'action' | 'puzzle' | 'adventure' | 'arcade';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeGenre: GenreFilter;
  onGenreChange: (genre: GenreFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

const genres: { value: GenreFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'action', label: 'Action' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'arcade', label: 'Arcade' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'plays', label: 'Most Played' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Alphabetical' },
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  activeGenre,
  onGenreChange,
  sortBy,
  onSortChange,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-20 border-b border-border-muted bg-surface/80 backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:px-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search games..."
            className={cn(
              'w-full rounded-xl border border-border bg-surface-elevated py-2.5 pl-10 pr-4',
              'text-sm text-content placeholder-content-tertiary',
              'outline-none transition-all',
              'focus:border-transparent focus:ring-2 focus:ring-accent focus:shadow-glow-sm'
            )}
          />
        </div>

        {/* Filter chips */}
        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          {genres.map((genre) => (
            <button
              key={genre.value}
              onClick={() => onGenreChange(genre.value)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
                activeGenre === genre.value
                  ? 'bg-accent text-content shadow-glow-sm'
                  : 'bg-surface-elevated text-content-secondary hover:bg-surface-overlay hover:text-content'
              )}
            >
              {genre.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className={cn(
            'shrink-0 rounded-xl border border-border bg-surface-elevated px-4 py-2.5',
            'text-sm text-content-secondary',
            'outline-none transition-colors',
            'hover:border-accent/30 focus:border-accent focus:ring-1 focus:ring-accent'
          )}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
