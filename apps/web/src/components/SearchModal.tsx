/**
 * Search Modal Component
 * Global search for projects with recent projects display
 */

import { useState, useEffect, useRef } from 'react';
import { Search, X, Gamepad2 } from 'lucide-react';
import type { PlayCraftProject } from '../lib/projectService';
import { Avatar } from './Avatar';
import { BlobImage } from './BlobImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: PlayCraftProject[];
  onSelectProject: (project: PlayCraftProject) => void;
  userAvatar?: string;
  userName?: string;
}

export function SearchModal({
  isOpen,
  onClose,
  projects,
  onSelectProject,
  userAvatar,
  userName,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    // Reset query when closing
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // This would be handled by the parent component
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter projects based on query
  const filteredProjects = query.trim()
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : projects;

  // Get recent projects (last 5)
  const recentProjects = filteredProjects.slice(0, 5);

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

  const handleSelectProject = (project: PlayCraftProject) => {
    onSelectProject(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border-muted px-5 py-4">
          <Search className="h-5 w-5 text-content-subtle" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects"
            className="flex-1 bg-transparent text-lg text-content placeholder-content-subtle outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-3">
          {recentProjects.length > 0 ? (
            <>
              <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-content-subtle">
                {query.trim() ? 'Results' : 'Recent Projects'}
              </p>
              <div className="space-y-1">
                {recentProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className="flex w-full items-center gap-3 rounded-xl bg-surface-overlay/50 p-3 text-left transition-colors hover:bg-surface-overlay"
                  >
                    {/* Thumbnail */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-accent/30 to-secondary/20">
                      {project.thumbnail_url ? (
                        <BlobImage
                          src={project.thumbnail_url}
                          alt=""
                          className="h-full w-full object-cover"
                          fallback={
                            <div className="flex h-full w-full items-center justify-center">
                              <Gamepad2 className="h-6 w-6 text-content-subtle" />
                            </div>
                          }
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Gamepad2 className="h-6 w-6 text-content-subtle" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium text-content">
                        {project.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <Avatar
                          src={userAvatar}
                          name={userName}
                          size="sm"
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-content-muted">
                          {userName || 'You'}
                        </span>
                      </div>
                    </div>

                    {/* Time */}
                    <span className="shrink-0 text-sm text-content-subtle">
                      {formatTimeAgo(project.updated_at)}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-content-muted">
                {query.trim()
                  ? `No projects found matching "${query}"`
                  : 'No recent projects'}
              </p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border-muted px-5 py-3">
          <p className="text-xs text-content-subtle">
            Press <kbd className="rounded bg-surface-overlay px-1.5 py-0.5 text-content-muted">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
