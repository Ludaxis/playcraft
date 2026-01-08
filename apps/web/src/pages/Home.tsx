import { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  Search,
  Gamepad2,
  Plus,
  MoreHorizontal,
  Grid3X3,
  List,
  Play,
  Trash2,
  X,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { ChatInput } from '../components/builder/ChatInput';
import type { PlayCraftProject } from '../lib/projectService';
import { getPublishedGames } from '../lib/publishService';
import { ensureDraftPool } from '../lib/projectService';
import { SettingsModal, SearchModal, Avatar, Sidebar, CreateWorkspaceModal, LogoIcon, PublishModal } from '../components';
import { useSidebar } from '../hooks';
import { useProjects, useCreateProject, useDeleteProject, useUpdateProject } from '../hooks/useProjects';
import { useWorkspaces, useCreateWorkspace } from '../hooks/useWorkspaces';
import { useUserSettings, useUsageStats } from '../hooks/useUserSettings';
import type { NavItem, PublishedGame, Workspace } from '../types';
import { useAppStore } from '../stores/appStore';

interface HomePageProps {
  user: User;
  onSignOut: () => void;
  onSelectProject: (project: PlayCraftProject) => void;
  onStartNewProject: (prompt: string) => void;
  pendingPrompt?: string | null;
  onPendingPromptUsed?: () => void;
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

export function HomePage({ user, onSignOut, onSelectProject, onStartNewProject, pendingPrompt, onPendingPromptUsed }: HomePageProps) {
  // UI state
  const [inputValue, setInputValue] = useState('');

  // Pre-fill input with pending prompt from landing page
  useEffect(() => {
    if (pendingPrompt) {
      setInputValue(pendingPrompt);
      onPendingPromptUsed?.();
    }
  }, [pendingPrompt, onPendingPromptUsed]);
  const [activeNav, setActiveNav] = useState<NavItem>('home');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const workspaceId = useAppStore((state) => state.workspaceId);
  const setWorkspaceId = useAppStore((state) => state.setWorkspaceId);

  // Delete confirmation state
  const [projectToDelete, setProjectToDelete] = useState<PlayCraftProject | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [starringProjectId, setStarringProjectId] = useState<string | null>(null);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [projectToPublish, setProjectToPublish] = useState<PlayCraftProject | null>(null);
  const draftPoolInitializedRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sidebar collapse state
  const { isCollapsed, toggle: toggleSidebar } = useSidebar();

  // Featured published games
  const [featuredGames, setFeaturedGames] = useState<PublishedGame[]>([]);

  // Fetch published games on mount
  useEffect(() => {
    getPublishedGames(4).then(setFeaturedGames).catch(console.error);
  }, []);

  // Data fetching with TanStack Query
  const { data: projects = [] } = useProjects(workspaceId ?? undefined);
  const { data: settings } = useUserSettings();
  const { data: usageStats } = useUsageStats();
  const { data: workspaces = [], isLoading: isLoadingWorkspaces } = useWorkspaces();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();
  const createWorkspaceMutation = useCreateWorkspace();

  // Set initial workspace once data is available
  useEffect(() => {
    if (!workspaceId && workspaces.length > 0) {
      setWorkspaceId(workspaces[0].workspace.id);
    }
  }, [workspaceId, workspaces, setWorkspaceId]);

  // Ensure a reusable draft exists for faster starts
  useEffect(() => {
    if (!user || draftPoolInitializedRef.current) return;
    draftPoolInitializedRef.current = true;
    ensureDraftPool().catch((err) => console.error('Failed to ensure draft pool', err));
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derived state
  const activeWorkspace = workspaces.find((w) => w.workspace.id === workspaceId)?.workspace ?? null;
  const studioName = activeWorkspace?.name || settings?.studio_name || 'My Studio';
  const isCreatingProject = createProjectMutation.isPending;
  const isDeletingProject = deleteProjectMutation.isPending;

  // Handle delete project
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProjectMutation.mutateAsync(projectToDelete.id);
      setProjectToDelete(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

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
      const project = await createProjectMutation.mutateAsync({
        name: 'Untitled Game',
        workspace_id: workspaceId ?? null,
        reuseDraft: true,
      });
      onSelectProject(project);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleCreateWorkspace = () => {
    setShowCreateWorkspace(true);
  };

  const handleWorkspaceCreated = (workspace: Workspace) => {
    setWorkspaceId(workspace.id);
  };

  const handleToggleStar = async (project: PlayCraftProject) => {
    setStarringProjectId(project.id);
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        updates: { is_starred: !project.is_starred },
      });
    } catch (err) {
      console.error('Failed to update star status:', err);
    } finally {
      setStarringProjectId(null);
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
  const starredProjects = filteredProjects.filter((p) => p.is_starred);
  const visibleProjects =
    activeNav === 'starred' ? starredProjects : filteredProjects;
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
        onOpenSettings={() => setShowSettings(true)}
        onOpenSearch={() => setShowSearch(true)}
        onSignOut={onSignOut}
        showUserMenu={showUserMenu}
        onToggleUserMenu={() => setShowUserMenu(!showUserMenu)}
        studioName={studioName}
        creditsRemaining={usageStats?.creditsRemaining ?? 50}
        totalCredits={usageStats?.totalCredits ?? 50}
        onUpgrade={() => setShowSettings(true)}
        workspaces={workspaces}
        activeWorkspaceId={workspaceId}
        onSelectWorkspace={(id) => setWorkspaceId(id)}
        onCreateWorkspace={handleCreateWorkspace}
        isLoadingWorkspaces={isLoadingWorkspaces || createWorkspaceMutation.isPending}
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
              {visibleProjects.map((project) => (
                <div key={project.id} className="group relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(project);
                    }}
                    disabled={starringProjectId === project.id}
                    aria-label={project.is_starred ? 'Unstar project' : 'Star project'}
                    className={`absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated/80 text-content-muted backdrop-blur-sm transition-all hover:bg-surface-elevated hover:text-content ${
                      starringProjectId === project.id ? 'opacity-70' : ''
                    }`}
                  >
                    {starringProjectId === project.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-content-muted/40 border-t-content" />
                    ) : (
                      <Star
                        className={`h-4 w-4 ${
                          project.is_starred ? 'text-accent' : 'text-content-muted'
                        }`}
                        fill={project.is_starred ? 'currentColor' : 'none'}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => onSelectProject(project)}
                    className="w-full text-left"
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
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToPublish(project);
                            }}
                            className="rounded-full border border-border px-3 py-1 text-xs text-content-muted transition-colors hover:border-accent/40 hover:text-content"
                          >
                            Deploy
                          </button>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Context Menu Button */}
                  <div className="absolute right-2 top-2" ref={openMenuId === project.id ? menuRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === project.id ? null : project.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated/80 text-content-muted opacity-0 backdrop-blur-sm transition-all hover:bg-surface-elevated hover:text-content group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === project.id && (
                      <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-xl">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setProjectToDelete(project);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error transition-colors hover:bg-error/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {visibleProjects.length === 0 && searchQuery && (
              <div className="mt-12 text-center">
                <p className="text-content-muted">No projects found matching "{searchQuery}"</p>
              </div>
            )}

            {visibleProjects.length === 0 && !searchQuery && (
              <div className="mt-12 text-center">
                <p className="text-content-muted">
                  {activeNav === 'starred'
                    ? 'No starred projects yet'
                    : activeNav === 'shared'
                      ? 'No shared projects yet'
                      : 'Create your first game project and start building with AI'}
                </p>
                {activeNav === 'starred' && (
                  <p className="mt-2 text-sm text-content-subtle">Tap the star on a project to keep it here.</p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Home View */
          <>
            {/* Gradient background area */}
            <div
              className="relative flex flex-1 flex-col items-center justify-center overflow-hidden"
              style={{
                background: `
                  radial-gradient(ellipse 50% 40% at 50% 90%, rgba(0, 212, 255, 0.35) 0%, transparent 60%),
                  radial-gradient(ellipse 80% 50% at 50% 70%, rgba(236, 72, 153, 0.5) 0%, transparent 60%),
                  linear-gradient(180deg, #0a1628 0%, #1a1040 35%, #3d1a5c 55%, #6b2a6b 75%, #1a1040 100%)
                `,
              }}
            >
              {/* Content */}
              <div className="relative z-10 w-full max-w-2xl px-6">
                <h1 className="mb-8 text-center text-4xl font-bold text-content">
                  Got an idea, {firstName}?
                </h1>

                {/* Input box */}
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSubmit}
                  placeholder="Describe the game you want to create..."
                />
              </div>
            </div>

            {/* Made with PlayCraft section */}
            <div className="border-t border-white/10 bg-black/30 backdrop-blur-md px-6 py-6">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LogoIcon size={16} />
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

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateWorkspace}
        onClose={() => setShowCreateWorkspace(false)}
        onCreated={handleWorkspaceCreated}
      />

      {/* Publish from home */}
      {projectToPublish && (
        <PublishModal
          isOpen={!!projectToPublish}
          onClose={() => setProjectToPublish(null)}
          projectId={projectToPublish.id}
          userId={user.id}
          projectName={projectToPublish.name}
          isAlreadyPublished={projectToPublish.status === 'published'}
          existingUrl={projectToPublish.published_url}
          onPublishSuccess={(url) => {
            setProjectToPublish({ ...projectToPublish, published_url: url, status: 'published' });
          }}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        projects={projects}
        onSelectProject={onSelectProject}
        userAvatar={user.user_metadata?.avatar_url}
        userName={user.user_metadata?.full_name}
      />

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
                <AlertTriangle className="h-6 w-6 text-error" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-content">Delete project?</h2>
                <p className="mt-1 text-sm text-content-muted">
                  This will permanently delete <strong>"{projectToDelete.name}"</strong> and all its data including files, chat history, and published games.
                </p>
              </div>
              <button
                onClick={() => setProjectToDelete(null)}
                className="rounded-lg p-1 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Warning */}
            <div className="mb-6 rounded-lg bg-error/5 p-3 text-sm text-error">
              This action cannot be undone.
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeletingProject}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-content transition-colors hover:bg-surface-overlay disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeletingProject}
                className="flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-error/90 disabled:opacity-50"
              >
                {isDeletingProject ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
