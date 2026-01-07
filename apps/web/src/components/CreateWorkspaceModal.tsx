import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useCreateWorkspace } from '../hooks/useWorkspaces';
import { LogoIcon } from './Logo';
import type { Workspace } from '../types';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (workspace: Workspace) => void;
}

export function CreateWorkspaceModal({ isOpen, onClose, onCreated }: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createWorkspace = useCreateWorkspace();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSubmitting = createWorkspace.isPending;
  const isDisabled = isSubmitting || !name.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Workspace name is required');
      return;
    }
    setError(null);
    try {
      const workspace = await createWorkspace.mutateAsync({ name: trimmed });
      onCreated?.(workspace);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/95 px-4">
      {/* Close button - top right of screen */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-6 top-6 rounded-lg p-2 text-white/40 transition-colors hover:text-white"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Modal */}
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Logo */}
          <LogoIcon size={56} />

          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-white">
              Create a Workspace
            </h1>
            <p className="text-base text-white/60">
              Create a new place to make projects or collaborate with others.
            </p>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label htmlFor="workspace-name" className="block text-sm font-medium text-white/80">
              Workspace name
            </label>
            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-[#2a2a2a] px-4 py-3 text-white placeholder-white/30 outline-none transition-all focus:border-[#8b5cf6]/50 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-[#3a3a3a] px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-[#4a4a4a] disabled:opacity-50"
            >
              Go Back
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#22d3ee] via-[#8b5cf6] to-[#d946ef] px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
