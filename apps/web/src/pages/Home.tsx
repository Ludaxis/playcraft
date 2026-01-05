import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  Search,
  Send,
  Gamepad2,
  Plus,
  MoreHorizontal,
  Grid3X3,
  List,
  Play,
  Sparkles,
} from 'lucide-react';
import type { PlayCraftProject } from '../lib/projectService';
import { getPublishedGames } from '../lib/publishService';
import { SettingsModal, SearchModal, Avatar, Sidebar } from '../components';
import { useSidebar } from '../hooks';
import { useProjects, useCreateProject, selectRecentProjects } from '../hooks/useProjects';
import { useUserSettings, useUsageStats } from '../hooks/useUserSettings';
import type { NavItem, PublishedGame } from '../types';

interface HomePageProps {
  user: User;
  onSignOut: () => void;
  onSelectProject: (project: PlayCraftProject) => void;
  onStartNewProject: (prompt: string) => void;
}

// Featured games made with PlayCraft
const FEATURED_GAMES = [
  {
    id: 'space-shooter',
    name: 'Space Invaders',
    author: 'Alex Chen',
    thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=300&fit=crop',
    plays: '2.4k'
  },
  {
    id: 'puzzle-quest',
    name: 'Puzzle Quest',
    author: 'Maria Santos',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&h=300&fit=crop',
    plays: '1.8k'
  },
  {
    id: 'neon-racer',
    name: 'Neon Racer',
    author: 'Jake Wilson',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
    plays: '3.1k'
  },
  {
    id: 'tower-defense',
    name: 'Tower Defense',
    author: 'Emma Liu',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
    plays: '956'
  },
];

export function HomePage({ user, onSignOut, onSelectProject, onStartNewProject }: HomePageProps) {
  // UI state
  const [inputValue, setInputValue] = useState('');
  const [activeNav, setActiveNav] = useState<NavItem>('home');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sidebar collapse state
  const { isCollapsed, toggle: toggleSidebar } = useSidebar();

  // Featured published games
  const [featuredGames, setFeaturedGames] = useState<PublishedGame[]>([]);

  // Fetch published games on mount
  useEffect(() => {
    getPublishedGames(4).then(setFeaturedGames).catch(console.error);
  }, []);

  // Data fetching with TanStack Query
  const { data: projects = [] } = useProjects();
  const { data: settings } = useUserSettings();
  const { data: usageStats } = useUsageStats();
  const createProjectMutation = useCreateProject();

  // Derived state
  const studioName = settings?.studio_name || 'My Studio';
  const isCreatingProject = createProjectMutation.isPending;

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    onStartNewProject(inputValue.trim());
  };


  const handleCreateNewProject = async () => {
    if (isCreatingProject) return;
    try {
      const project = await createProjectMutation.mutateAsync({ name: 'Untitled Game' });
      onSelectProject(project);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return then.toLocaleDateString();
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentProjects = selectRecentProjects(projects);
  const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="flex h-screen bg-surface">
      {/* Collapsible Sidebar */}
      <Sidebar
        user={user}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebar}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        recentProjects={recentProjects}
        onSelectProject={onSelectProject}
        onOpenSettings={() => setShowSettings(true)}
        onOpenSearch={() => setShowSearch(true)}
        onSignOut={onSignOut}
        showUserMenu={showUserMenu}
        onToggleUserMenu={() => setShowUserMenu(!showUserMenu)}
        studioName={studioName}
        creditsRemaining={usageStats?.creditsRemaining ?? 50}
        totalCredits={usageStats?.totalCredits ?? 50}
        onUpgrade={() => setShowSettings(true)}
      />

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {activeNav === 'projects' || activeNav === 'starred' || activeNav === 'shared' ? (
          /* Projects View */
          <div className="flex-1 overflow-y-auto bg-surface p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-content">
                  {activeNav === 'projects' ? 'Projects' : activeNav === 'starred' ? 'Starred' : 'Shared with me'}
                </h1>
                <button className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search and filters */}
            <div className="mb-6 flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-72 rounded-lg border border-border bg-surface-overlay py-2 pl-10 pr-4 text-sm text-content placeholder-content-subtle outline-none ring-accent transition-all focus:border-transparent focus:ring-2 focus:shadow-glow-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Filters */}
                <select className="rounded-lg border border-border bg-surface-overlay px-3 py-2 text-sm text-content-muted outline-none transition-colors hover:border-accent/30">
                  <option>Last edited</option>
                  <option>Name</option>
                  <option>Created</option>
                </select>
                <select className="rounded-lg border border-border bg-surface-overlay px-3 py-2 text-sm text-content-muted outline-none transition-colors hover:border-accent/30">
                  <option>Any visibility</option>
                  <option>Public</option>
                  <option>Private</option>
                </select>
                <select className="rounded-lg border border-border bg-surface-overlay px-3 py-2 text-sm text-content-muted outline-none transition-colors hover:border-accent/30">
                  <option>Any status</option>
                  <option>Draft</option>
                  <option>Building</option>
                  <option>Ready</option>
                  <option>Published</option>
                </select>

                {/* View toggle */}
                <div className="ml-2 flex rounded-lg border border-border bg-surface-overlay">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded-l-lg p-2 transition-colors ${viewMode === 'grid' ? 'bg-surface-elevated text-content' : 'text-content-muted hover:text-content'}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`rounded-r-lg p-2 transition-colors ${viewMode === 'list' ? 'bg-surface-elevated text-content' : 'text-content-muted hover:text-content'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {/* Create New Project Card */}
              <button
                onClick={handleCreateNewProject}
                disabled={isCreatingProject}
                className="group flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-transparent transition-all hover:border-content-subtle hover:bg-surface-elevated/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-content-subtle text-content-subtle transition-colors group-hover:border-content-muted group-hover:text-content-muted">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="mt-4 text-sm font-medium text-content-muted transition-colors group-hover:text-content">
                  {isCreatingProject ? 'Creating...' : 'Create new project'}
                </span>
              </button>

              {/* Project Cards */}
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group text-left"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border-muted bg-gradient-to-br from-accent-muted/30 via-secondary-muted/20 to-surface-elevated transition-all group-hover:border-accent/50 group-hover:shadow-glow-sm">
                    {project.thumbnail_url ? (
                      <img
                        src={project.thumbnail_url}
                        alt={project.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Gamepad2 className="h-16 w-16 text-border" />
                      </div>
                    )}
                  </div>

                  {/* Project info */}
                  <div className="mt-3 flex items-start gap-3">
                    <Avatar
                      src={user.user_metadata?.avatar_url}
                      name={user.user_metadata?.full_name || user.email}
                      size="sm"
                      className="h-8 w-8"
                    />
                    <div className="flex-1 overflow-hidden">
                      <h3 className="truncate font-medium text-content transition-colors group-hover:text-accent">
                        {project.name}
                      </h3>
                      <p className="text-sm text-content-subtle">
                        Edited {formatTimeAgo(project.updated_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Empty state */}
            {filteredProjects.length === 0 && searchQuery && (
              <div className="mt-12 text-center">
                <p className="text-content-muted">No projects found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : (
          /* Home View */
          <>
            {/* Gradient background area */}
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-muted/30 via-secondary-muted/20 to-surface" />
              <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" />
              <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-[100px]" />

              {/* Content */}
              <div className="relative z-10 w-full max-w-2xl px-6">
                <h1 className="mb-8 text-center text-4xl font-bold text-content">
                  Got an idea, {firstName}?
                </h1>

                {/* Input box */}
                <div className="glass-elevated rounded-2xl border border-border p-4">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Describe the game you want to create..."
                    className="w-full bg-transparent text-lg text-content placeholder-content-subtle outline-none"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Could add attach/theme buttons here */}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!inputValue.trim()}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-content transition-all hover:bg-accent-light hover:shadow-glow-sm disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Made with PlayCraft section */}
            <div className="border-t border-border-muted bg-surface-elevated/50 px-6 py-6">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-medium text-content">Made with PlayCraft</h2>
                  </div>
                  <button
                    onClick={() => setActiveNav('discover')}
                    className="text-sm text-accent transition-colors hover:text-accent-light"
                  >
                    Explore all →
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {(featuredGames.length > 0 ? featuredGames : FEATURED_GAMES).map((game) => {
                    // Handle both PublishedGame and mock game types
                    const isRealGame = 'published_url' in game;
                    const thumbnail = isRealGame
                      ? (game.thumbnail_url || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=300&fit=crop')
                      : (game as typeof FEATURED_GAMES[0]).thumbnail;
                    const author = isRealGame ? (game.author_name || 'PlayCraft Creator') : (game as typeof FEATURED_GAMES[0]).author;
                    const plays = isRealGame ? game.play_count.toLocaleString() : (game as typeof FEATURED_GAMES[0]).plays;

                    return (
                      <a
                        key={game.id}
                        href={isRealGame ? `/play/${game.id}` : '#'}
                        className="group cursor-pointer overflow-hidden rounded-xl border border-border-muted bg-surface-elevated transition-all hover:border-accent/50 hover:shadow-glow-sm"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={thumbnail}
                            alt={game.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
                            <div className="flex h-10 w-10 scale-0 items-center justify-center rounded-full bg-accent/90 text-content transition-transform group-hover:scale-100">
                              <Play className="h-5 w-5 fill-current" />
                            </div>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-content transition-colors group-hover:text-accent">
                            {game.name}
                          </h3>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-xs text-content-subtle">by {author}</span>
                            <span className="flex items-center gap-1 text-xs text-content-subtle">
                              <Play className="h-3 w-3" />
                              {plays}
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        projects={projects}
        onSelectProject={onSelectProject}
        userAvatar={user.user_metadata?.avatar_url}
        userName={user.user_metadata?.full_name}
      />
    </div>
  );
}
