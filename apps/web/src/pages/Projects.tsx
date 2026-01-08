import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  Plus,
  Folder,
  Trash2,
  Clock,
  Loader2,
  LogOut,
  Gamepad2,
} from 'lucide-react';
import type { PlayCraftProject } from '../lib/projectService';
import { useProjects, useCreateProject, useDeleteProject } from '../hooks/useProjects';
import { useAppStore } from '../stores/appStore';
import { Logo } from '../components/Logo';

interface ProjectsPageProps {
  user: User;
  onSignOut: () => void;
  onSelectProject: (project: PlayCraftProject) => void;
}

export function ProjectsPage({ user, onSignOut, onSelectProject }: ProjectsPageProps) {
  // UI state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const workspaceId = useAppStore((state) => state.workspaceId);

  // Data fetching with TanStack Query
  const { data: projects = [], isLoading } = useProjects(workspaceId ?? undefined);
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  // Derived state
  const isCreating = createProjectMutation.isPending;

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || isCreating) return;

    try {
      const project = await createProjectMutation.mutateAsync({
        name: newProjectName.trim(),
        workspace_id: workspaceId ?? null,
        reuseDraft: true,
      });
      setShowNewModal(false);
      setNewProjectName('');
      onSelectProject(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this project? This cannot be undone.')) return;

    try {
      await deleteProjectMutation.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: PlayCraftProject['status']) => {
    const styles = {
      draft: 'bg-surface-overlay text-content-secondary',
      building: 'bg-warning-subtle text-warning',
      ready: 'bg-success-subtle text-success',
      published: 'bg-accent-subtle text-accent',
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-surface-elevated">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Logo size={36} showText />
            <p className="text-xs text-content-tertiary">Game Builder</p>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={user.user_metadata?.avatar_url || ''}
              alt=""
              className="h-8 w-8 rounded-full"
            />
            <button
              onClick={onSignOut}
              className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-surface-overlay hover:text-content"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Title and create button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Games</h2>
            <p className="mt-1 text-content-secondary">
              Create and manage your game projects
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-neon flex items-center gap-2 rounded-lg px-4 py-2"
          >
            <Plus className="h-5 w-5" />
            New Game
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-error-muted bg-error-subtle p-4 text-error">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : projects.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-border bg-surface-elevated p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-overlay">
              <Gamepad2 className="h-8 w-8 text-content-tertiary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              No games yet
            </h3>
            <p className="mb-6 text-content-secondary">
              Create your first game project and start building with AI
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-neon inline-flex items-center gap-2 rounded-lg px-6 py-3"
            >
              <Plus className="h-5 w-5" />
              Create Your First Game
            </button>
          </div>
        ) : (
          /* Projects grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group relative rounded-xl border border-border bg-surface-elevated p-5 text-left transition-all hover:border-accent/50 hover:bg-surface-overlay"
              >
                {/* Thumbnail or placeholder */}
                <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-surface-overlay">
                  {project.thumbnail_url ? (
                    <img
                      src={project.thumbnail_url}
                      alt={project.name}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <Folder className="h-12 w-12 text-content-tertiary" />
                  )}
                </div>

                {/* Info */}
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-white group-hover:text-secondary">
                    {project.name}
                  </h3>
                  {getStatusBadge(project.status)}
                </div>

                {project.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-content-secondary">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-1 text-xs text-content-tertiary">
                  <Clock className="h-3 w-3" />
                  <span>Updated {formatDate(project.updated_at)}</span>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteProject(e, project.id)}
                  className="absolute right-3 top-3 rounded-lg p-2 text-content-tertiary opacity-0 transition-all hover:bg-surface-overlay hover:text-error group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* New project modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Create New Game
            </h3>

            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              placeholder="Game name..."
              className="mb-4 w-full rounded-lg border border-border bg-surface-overlay px-4 py-3 text-white placeholder-content-tertiary outline-none ring-accent focus:border-transparent focus:ring-2"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setNewProjectName('');
                }}
                className="rounded-lg px-4 py-2 text-content-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
                className="btn-neon flex items-center gap-2 rounded-lg px-4 py-2 disabled:opacity-50"
              >
                {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
