/**
 * ImportFromGitHub Modal
 *
 * Allows users to import an existing GitHub repository as a new PlayCraft project.
 * Supports both repository selection and URL-based import.
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github,
  Search,
  Lock,
  Globe,
  Loader2,
  AlertCircle,
  FolderGit2,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import {
  useGitHubConnected,
  useGitHubRepositories,
  type GitHubRepository,
} from '../hooks/useGitHubConnection';
import {
  parseGitHubUrl,
  importFromGitHub,
  type ImportProgress,
} from '../lib/githubService';
import { connectGitHub } from '../lib/settingsService';

interface ImportFromGitHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportFromGitHub({ open, onOpenChange }: ImportFromGitHubProps) {
  const navigate = useNavigate();

  // GitHub connection status
  const { data: isGitHubConnected, isLoading: isCheckingAuth } = useGitHubConnected();
  const { data: repositories = [], isLoading: isLoadingRepos } = useGitHubRepositories(
    open && !!isGitHubConnected
  );

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter repositories by search query
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) {
      return repositories.slice(0, 20); // Show first 20 repos
    }

    const query = searchQuery.toLowerCase();
    return repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query)
    );
  }, [repositories, searchQuery]);

  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    if (!importProgress) return 0;
    switch (importProgress.stage) {
      case 'fetching':
        return 25;
      case 'creating':
        return 50;
      case 'writing':
        return 75;
      case 'connecting':
        return 90;
      case 'complete':
        return 100;
      default:
        return 0;
    }
  }, [importProgress]);

  const handleConnect = useCallback(() => {
    connectGitHub();
  }, []);

  const handleImportRepo = useCallback(
    async (repo: GitHubRepository) => {
      setIsImporting(true);
      setError(null);
      setImportProgress(null);

      try {
        // Extract owner from fullName (e.g., "owner/repo")
        const [owner] = repo.fullName.split('/');

        const result = await importFromGitHub(
          owner,
          repo.name,
          repo.defaultBranch,
          setImportProgress
        );

        // Navigate to the new project
        onOpenChange(false);
        navigate(`/builder/${result.projectId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Import failed');
        setImportProgress(null);
      } finally {
        setIsImporting(false);
      }
    },
    [navigate, onOpenChange]
  );

  const handleImportUrl = useCallback(async () => {
    const parsed = parseGitHubUrl(urlInput);
    if (!parsed) {
      setError('Invalid GitHub URL. Use format: github.com/owner/repo or owner/repo');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportProgress(null);

    try {
      const result = await importFromGitHub(
        parsed.owner,
        parsed.repo,
        undefined,
        setImportProgress
      );

      // Navigate to the new project
      onOpenChange(false);
      navigate(`/builder/${result.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setImportProgress(null);
    } finally {
      setIsImporting(false);
    }
  }, [urlInput, navigate, onOpenChange]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const isLoading = isCheckingAuth || isLoadingRepos;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            Import an existing GitHub repository as a new PlayCraft project
          </DialogDescription>
        </DialogHeader>

        {isImporting ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <div className="w-full space-y-2">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-center text-sm text-content-muted">
                {importProgress?.message || 'Starting import...'}
              </p>
              {importProgress?.filesProcessed !== undefined && (
                <p className="text-center text-xs text-content-tertiary">
                  {importProgress.filesProcessed} files processed
                </p>
              )}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-content-muted" />
          </div>
        ) : !isGitHubConnected ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Github className="h-12 w-12 text-content-muted" />
            <p className="text-center text-sm text-content-muted">
              Connect your GitHub account to import repositories
            </p>
            <Button onClick={handleConnect}>
              <Github className="mr-2 h-4 w-4" />
              Connect GitHub
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="github-url">Repository URL</Label>
              <div className="flex gap-2">
                <Input
                  id="github-url"
                  placeholder="github.com/owner/repo or owner/repo"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && urlInput.trim()) {
                      handleImportUrl();
                    }
                  }}
                />
                <Button
                  onClick={handleImportUrl}
                  disabled={!urlInput.trim()}
                >
                  Import
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border-muted" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface-elevated px-2 text-content-muted">
                  or select from your repositories
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Repository List */}
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {filteredRepos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-content-muted">
                    {searchQuery ? 'No repositories found' : 'No repositories available'}
                  </p>
                ) : (
                  filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => handleImportRepo(repo)}
                      className="flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-surface-overlay hover:border-accent/30"
                    >
                      <div className="mt-0.5">
                        {repo.private ? (
                          <Lock className="h-4 w-4 text-content-muted" />
                        ) : (
                          <Globe className="h-4 w-4 text-content-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-content truncate">
                            {repo.name}
                          </span>
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-content-muted hover:text-content"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        {repo.description && (
                          <p className="text-xs text-content-muted line-clamp-1 mt-0.5">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-content-tertiary">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(repo.updatedAt)}
                          </span>
                          <span className="text-content-muted">
                            {repo.defaultBranch}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error/10 p-3 text-error">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
