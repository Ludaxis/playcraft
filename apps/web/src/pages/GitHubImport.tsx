/**
 * GitHubImport Page
 *
 * Handles URL-based GitHub imports like /github/owner/repo
 * Similar to Bolt.new's import flow.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Github,
  Loader2,
  AlertCircle,
  FolderGit2,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  importFromGitHub,
  getRepository,
  type ImportProgress,
  type GitHubRepository,
} from '../lib/githubService';
import { useGitHubConnected } from '../hooks/useGitHubConnection';
import { connectGitHub } from '../lib/settingsService';

export function GitHubImportPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse owner, repo, and branch from URL: /github/owner/repo or /github/owner/repo/tree/branch
  const { owner, repo, branch } = useMemo(() => {
    const match = location.pathname.match(/^\/github\/([^/]+)\/([^/]+)(\/tree\/(.+))?$/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        branch: match[4] || undefined,
      };
    }
    return { owner: undefined, repo: undefined, branch: undefined };
  }, [location.pathname]);

  // Auth state
  const { data: isGitHubConnected, isLoading: isCheckingAuth } = useGitHubConnected();

  // Import state
  const [repository, setRepository] = useState<GitHubRepository | null>(null);
  const [isLoadingRepo, setIsLoadingRepo] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoImportStarted, setAutoImportStarted] = useState(false);

  // Fetch repository info on mount
  useEffect(() => {
    async function fetchRepo() {
      if (!owner || !repo) {
        setError('Invalid repository URL');
        setIsLoadingRepo(false);
        return;
      }

      setIsLoadingRepo(true);
      setError(null);

      try {
        const repoInfo = await getRepository(owner, repo);
        if (repoInfo) {
          setRepository(repoInfo);
        } else {
          setError(`Repository ${owner}/${repo} not found or not accessible`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repository');
      } finally {
        setIsLoadingRepo(false);
      }
    }

    fetchRepo();
  }, [owner, repo]);

  // Calculate progress percentage
  const progressPercent = (() => {
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
  })();

  const handleImport = useCallback(async () => {
    if (!owner || !repo || !isGitHubConnected) return;

    setIsImporting(true);
    setError(null);
    setImportProgress(null);

    try {
      const result = await importFromGitHub(
        owner,
        repo,
        branch || repository?.defaultBranch,
        setImportProgress
      );

      // Navigate to the new project
      navigate(`/builder/${result.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setImportProgress(null);
      setIsImporting(false);
    }
  }, [owner, repo, branch, repository, isGitHubConnected, navigate]);

  // Auto-import when connected and repo is loaded
  useEffect(() => {
    if (
      isGitHubConnected &&
      repository &&
      !isImporting &&
      !error &&
      !autoImportStarted
    ) {
      setAutoImportStarted(true);
      handleImport();
    }
  }, [isGitHubConnected, repository, isImporting, error, autoImportStarted, handleImport]);

  const handleConnect = useCallback(() => {
    connectGitHub();
  }, []);

  const isLoading = isCheckingAuth || isLoadingRepo;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-base p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated">
            <FolderGit2 className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-content">Import from GitHub</h1>
          {owner && repo && (
            <p className="mt-2 text-content-muted">
              <span className="font-mono text-sm">
                {owner}/{repo}
                {branch && <span className="text-content-tertiary">@{branch}</span>}
              </span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="rounded-xl border border-border bg-surface-elevated p-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-sm text-content-muted">
                {isCheckingAuth ? 'Checking authentication...' : 'Loading repository...'}
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
                <AlertCircle className="h-6 w-6 text-error" />
              </div>
              <p className="text-center text-sm text-error">{error}</p>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
                {!isGitHubConnected && (
                  <Button onClick={handleConnect}>
                    <Github className="mr-2 h-4 w-4" />
                    Connect GitHub
                  </Button>
                )}
              </div>
            </div>
          ) : !isGitHubConnected ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Github className="h-12 w-12 text-content-muted" />
              <p className="text-center text-sm text-content-muted">
                Connect your GitHub account to import this repository
              </p>
              <Button onClick={handleConnect}>
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub
              </Button>
            </div>
          ) : isImporting ? (
            <div className="flex flex-col items-center gap-4 py-4">
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
          ) : repository ? (
            <div className="space-y-4">
              {/* Repository Info */}
              <div className="flex items-start gap-3">
                <Github className="mt-0.5 h-5 w-5 text-content-muted" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-content">
                      {repository.name}
                    </span>
                    <a
                      href={repository.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-content-muted hover:text-content"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  {repository.description && (
                    <p className="mt-1 text-sm text-content-muted">
                      {repository.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-content-tertiary">
                    Default branch: {repository.defaultBranch}
                  </p>
                </div>
              </div>

              <Button onClick={handleImport} className="w-full">
                <FolderGit2 className="mr-2 h-4 w-4" />
                Import Repository
              </Button>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-content-muted hover:text-content transition-colors"
          >
            <ArrowLeft className="mr-1 inline h-3 w-3" />
            Back to PlayCraft
          </Link>
        </div>
      </div>
    </div>
  );
}
