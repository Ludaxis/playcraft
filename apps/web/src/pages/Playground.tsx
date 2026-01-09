import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Wand2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  HeroBanner,
  CategorySection,
  MiniBanner,
  FilterBar,
  GameCard,
} from '../components/playground';
import type { SortOption, GenreFilter } from '../components/playground';
import { LogoIcon } from '../components';
import {
  getFeaturedGames,
  getTrendingGames,
  getNewReleases,
  getPublishedGames,
  searchGames,
} from '../lib/publishService';
import type { PublishedGame } from '../types';

// Mock creator for spotlight (can be replaced with real data later)
const FEATURED_CREATOR = {
  name: 'Alex Chen',
  avatar_url: null,
  games_count: 12,
  total_plays: 24500,
};

export function PlaygroundPage() {
  const navigate = useNavigate();

  // Enable page scrolling (override global overflow:hidden on html)
  useEffect(() => {
    const html = document.documentElement;
    const originalOverflow = html.style.overflow;
    html.style.overflow = 'auto';
    return () => {
      html.style.overflow = originalOverflow;
    };
  }, []);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<GenreFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('plays');

  // Data state
  const [featuredGames, setFeaturedGames] = useState<PublishedGame[]>([]);
  const [trendingGames, setTrendingGames] = useState<PublishedGame[]>([]);
  const [newReleases, setNewReleases] = useState<PublishedGame[]>([]);
  const [allGames, setAllGames] = useState<PublishedGame[]>([]);
  const [searchResults, setSearchResults] = useState<PublishedGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [featured, trending, releases, all] = await Promise.all([
          getFeaturedGames(5),
          getTrendingGames(12),
          getNewReleases(12),
          getPublishedGames(50),
        ]);
        setFeaturedGames(featured);
        setTrendingGames(trending);
        setNewReleases(releases);
        setAllGames(all);
      } catch (err) {
        console.error('Failed to fetch games:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchGames(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Filter and sort games
  const filteredGames = useMemo(() => {
    let games = searchQuery.trim() ? searchResults : allGames;

    // Filter by genre (for now, filter by name/description containing genre keyword)
    if (activeGenre !== 'all') {
      const genreKeywords: Record<string, string[]> = {
        action: ['action', 'shooter', 'fight', 'battle', 'combat', 'war'],
        puzzle: ['puzzle', 'match', 'brain', 'logic', 'strategy', 'tetris'],
        adventure: ['adventure', 'explore', 'quest', 'rpg', 'story', 'journey'],
        arcade: ['arcade', 'classic', 'retro', 'score', 'endless', 'runner'],
      };
      const keywords = genreKeywords[activeGenre] || [];
      games = games.filter((game) => {
        const searchText = `${game.name} ${game.description || ''}`.toLowerCase();
        return keywords.some((kw) => searchText.includes(kw));
      });
    }

    // Sort
    const sorted = [...games];
    switch (sortBy) {
      case 'plays':
        sorted.sort((a, b) => (b.play_count || 0) - (a.play_count || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
          const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return sorted;
  }, [allGames, searchResults, searchQuery, activeGenre, sortBy]);

  // Show filtered view when searching or filtering
  const showFilteredView = searchQuery.trim() || activeGenre !== 'all';

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 50% 30% at 50% 0%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(0, 240, 255, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 20% 80%, rgba(255, 0, 229, 0.08) 0%, transparent 50%),
          var(--surface-base)
        `,
      }}
    >
      {/* Header */}
      <header className="border-b border-border-muted bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-content transition-colors hover:text-accent"
          >
            <LogoIcon size={28} />
            <span className="text-xl font-bold">Playground</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-content-secondary sm:flex">
              <Gamepad2 className="h-5 w-5" />
              <span className="text-sm">Discover amazing games</span>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="accent"
              size="sm"
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">Create Game</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeGenre={activeGenre}
        onGenreChange={setActiveGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 pb-16">
        {showFilteredView ? (
          /* Filtered/Search Results View */
          <div className="px-4 py-8 md:px-8">
            <h2 className="mb-6 text-xl font-bold text-content">
              {searchQuery.trim()
                ? `Search results for "${searchQuery}"`
                : `${activeGenre.charAt(0).toUpperCase() + activeGenre.slice(1)} Games`}
            </h2>

            {isSearching || isLoading ? (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-[72px] w-[72px] animate-pulse rounded-[16px] bg-surface-elevated" />
                    <div className="h-3 w-16 animate-pulse rounded bg-surface-elevated" />
                  </div>
                ))}
              </div>
            ) : filteredGames.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {filteredGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Gamepad2 className="mb-4 h-16 w-16 text-content-muted" />
                <p className="text-lg font-medium text-content-secondary">
                  No games found
                </p>
                <p className="mt-1 text-sm text-content-muted">
                  Try a different search or filter
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Default Browse View */
          <>
            {/* Hero Banner */}
            <div className="py-6">
              <HeroBanner games={featuredGames} isLoading={isLoading} />
            </div>

            {/* Trending Now */}
            <CategorySection
              title="Trending Now"
              games={trendingGames}
              isLoading={isLoading}
              onSeeAll={() => {
                setSortBy('plays');
                setActiveGenre('all');
                setSearchQuery('');
              }}
            />

            {/* Create Your Game CTA */}
            <MiniBanner variant="cta" href="/" />

            {/* New Releases */}
            <CategorySection
              title="New Releases"
              games={newReleases}
              isLoading={isLoading}
              onSeeAll={() => {
                setSortBy('newest');
                setActiveGenre('all');
                setSearchQuery('');
              }}
            />

            {/* Creator Spotlight */}
            <MiniBanner variant="spotlight" creator={FEATURED_CREATOR} />

            {/* Editor's Picks (using featured games) */}
            <CategorySection
              title="Editor's Picks"
              games={featuredGames}
              isLoading={isLoading}
            />

            {/* Action Games */}
            <CategorySection
              title="Action Games"
              games={allGames.filter((g) => {
                const text = `${g.name} ${g.description || ''}`.toLowerCase();
                return ['action', 'shooter', 'fight', 'battle'].some((kw) =>
                  text.includes(kw)
                );
              })}
              isLoading={isLoading}
              onSeeAll={() => setActiveGenre('action')}
            />

            {/* Create CTA 2 */}
            <MiniBanner
              variant="cta"
              title="Build Anything You Imagine"
              description="From simple puzzles to epic adventures"
              buttonText="Get Started"
              href="/"
            />

            {/* Puzzle & Strategy */}
            <CategorySection
              title="Puzzle & Strategy"
              games={allGames.filter((g) => {
                const text = `${g.name} ${g.description || ''}`.toLowerCase();
                return ['puzzle', 'match', 'brain', 'strategy'].some((kw) =>
                  text.includes(kw)
                );
              })}
              isLoading={isLoading}
              onSeeAll={() => setActiveGenre('puzzle')}
            />

            {/* Adventure & RPG */}
            <CategorySection
              title="Adventure & RPG"
              games={allGames.filter((g) => {
                const text = `${g.name} ${g.description || ''}`.toLowerCase();
                return ['adventure', 'explore', 'quest', 'rpg', 'story'].some((kw) =>
                  text.includes(kw)
                );
              })}
              isLoading={isLoading}
              onSeeAll={() => setActiveGenre('adventure')}
            />

            {/* Arcade Classics */}
            <CategorySection
              title="Arcade Classics"
              games={allGames.filter((g) => {
                const text = `${g.name} ${g.description || ''}`.toLowerCase();
                return ['arcade', 'classic', 'retro', 'score', 'endless'].some((kw) =>
                  text.includes(kw)
                );
              })}
              isLoading={isLoading}
              onSeeAll={() => setActiveGenre('arcade')}
            />

            {/* All Games */}
            <CategorySection
              title="All Games"
              games={allGames.slice(0, 20)}
              isLoading={isLoading}
              onSeeAll={() => {
                setActiveGenre('all');
                setSortBy('plays');
              }}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-muted bg-surface/80 py-6 text-center backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 text-content-muted">
          <LogoIcon size={16} />
          <span className="text-sm">Made with PlayCraft</span>
        </div>
      </footer>
    </div>
  );
}
