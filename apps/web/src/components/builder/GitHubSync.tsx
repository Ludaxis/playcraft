/**
 * GitHubSync Component
 *
 * Provides GitHub repository sync functionality in the Builder.
 * Allows pushing project changes and pulling updates from GitHub.
 *
 * Uses database-backed connection storage for persistence.
 */

import { useState, useCallback } from 'react';
import {
  Github,
  Cloud,
  CloudOff,
  Upload,
  Download,
  RefreshCw,
  Plus,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Lock,
  Globe,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import {
  useGitHubConnection,
  useGitHubUser,
  useGitHubConnected,
  useGitHubRepositories,
  useGitHubBranches,
  useConnectToRepository,
  useDeleteGitHubConnection,
  usePushToGitHub,
  usePullFromGitHub,
  useUpdateGitHubConnection,
} from '../../hooks/useGitHubConnection';
import { createRepository, type GitHubRepository } from '../../lib/githubService';
import { connectGitHub } from '../../lib/settingsService';

interface GitHubSyncProps {
  projectId: string;
  projectName: string;
  projectFiles: Record<string, string>;
  onFilesUpdated?: (files: Record<string, string>) => void;
}

export function GitHubSync({
  projectId,
  projectName,
  projectFiles,
  onFilesUpdated,
}: GitHubSyncProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Query hooks for GitHub state
  const { data: connection, isLoading: isLoadingConnection } = useGitHubConnection(projectId);
  const { data: isGitHubConnected, isLoading: isCheckingAuth } = useGitHubConnected();
  const { data: githubUser } = useGitHubUser();
  const { data: repositories = [], isLoading: isLoadingRepos } = useGitHubRepositories(
    isOpen && !!isGitHubConnected
  );
  const { data: branches = [] } = useGitHubBranches(
    connection?.repository_owner,
    connection?.repository_name,
    !!connection
  );

  // Mutation hooks
  const connectToRepo = useConnectToRepository();
  const disconnectRepo = useDeleteGitHubConnection();
  const pushToGitHub = usePushToGitHub();
  const pullFromGitHub = usePullFromGitHub();
  const updateConnection = useUpdateGitHubConnection();

  // Create repo dialog state
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  // Sync status
  const [syncMessage, setSyncMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isLoading = isLoadingConnection || isCheckingAuth || isLoadingRepos;
  const isSyncing = pushToGitHub.isPending || pullFromGitHub.isPending;

  const handleConnect = useCallback(() => {
    connectGitHub();
  }, []);

  const handleSelectRepository = useCallback(
    async (repoName: string) => {
      const repo = repositories.find((r) => r.name === repoName);
      if (repo && githubUser) {
        try {
          await connectToRepo.mutateAsync({
            projectId,
            repository: repo,
            owner: githubUser.login,
          });
          setSyncMessage({
            type: 'success',
            text: `Connected to ${repo.name}`,
          });
        } catch (error) {
          setSyncMessage({
            type: 'error',
            text: error instanceof Error ? error.message : 'Failed to connect',
          });
        }
      }
    },
    [repositories, githubUser, projectId, connectToRepo]
  );

  const handleCreateRepository = useCallback(async () => {
    if (!newRepoName.trim() || !githubUser) return;

    setIsCreatingRepo(true);
    setSyncMessage(null);

    try {
      const repo = await createRepository(
        newRepoName.trim(),
        newRepoDescription || `PlayCraft project: ${projectName}`,
        newRepoPrivate
      );

      // Connect to the newly created repo
      await connectToRepo.mutateAsync({
        projectId,
        repository: repo,
        owner: githubUser.login,
      });

      setShowCreateRepo(false);
      setNewRepoName('');
      setNewRepoDescription('');
      setSyncMessage({
        type: 'success',
        text: `Created and connected to ${repo.name}`,
      });
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create repository',
      });
    } finally {
      setIsCreatingRepo(false);
    }
  }, [newRepoName, newRepoDescription, newRepoPrivate, projectName, githubUser, projectId, connectToRepo]);

  const handlePush = useCallback(async () => {
    if (!connection) return;

    setSyncMessage(null);

    try {
      const result = await pushToGitHub.mutateAsync({
        projectId,
        connection,
        files: projectFiles,
        message: `Update from PlayCraft: ${new Date().toLocaleString()}`,
      });

      if (result.success) {
        setSyncMessage({
          type: 'success',
          text: `Pushed ${result.filesChanged} files successfully`,
        });
      } else {
        setSyncMessage({
          type: 'error',
          text: result.error || 'Push failed',
        });
      }
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Push failed',
      });
    }
  }, [connection, projectId, projectFiles, pushToGitHub]);

  const handlePull = useCallback(async () => {
    if (!connection) return;

    setSyncMessage(null);

    try {
      const result = await pullFromGitHub.mutateAsync({
        projectId,
        connection,
      });

      if (result) {
        onFilesUpdated?.(result.files);
        setSyncMessage({
          type: 'success',
          text: `Pulled ${Object.keys(result.files).length} files`,
        });
      } else {
        setSyncMessage({
          type: 'error',
          text: 'Pull failed',
        });
      }
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Pull failed',
      });
    }
  }, [connection, projectId, pullFromGitHub, onFilesUpdated]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectRepo.mutateAsync(projectId);
      setSyncMessage(null);
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to disconnect',
      });
    }
  }, [projectId, disconnectRepo]);

  const handleBranchChange = useCallback(
    async (branch: string) => {
      if (!connection) return;
      try {
        await updateConnection.mutateAsync({
          projectId,
          updates: { current_branch: branch },
        });
      } catch (error) {
        console.error('Failed to update branch:', error);
      }
    },
    [connection, projectId, updateConnection]
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Github className="h-4 w-4" />
        {connection ? 'Synced' : 'GitHub'}
        {connection && <Check className="h-3 w-3 text-success" />}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Sync
            </DialogTitle>
            <DialogDescription>
              Sync your project with a GitHub repository
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-content-muted" />
            </div>
          ) : !isGitHubConnected ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <CloudOff className="h-12 w-12 text-content-muted" />
              <p className="text-center text-sm text-content-muted">
                Connect your GitHub account to sync projects
              </p>
              <Button onClick={handleConnect}>
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Connected user */}
              <div className="flex items-center gap-2 rounded-lg bg-surface-overlay p-3">
                <Cloud className="h-4 w-4 text-success" />
                <span className="text-sm text-content">
                  Connected as <strong>@{githubUser?.login}</strong>
                </span>
              </div>

              {/* Repository selection */}
              {!connection ? (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label>Select Repository</Label>
                    <Select onValueChange={handleSelectRepository}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a repository..." />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="max-h-48">
                          {repositories.map((repo: GitHubRepository) => (
                            <SelectItem key={repo.id} value={repo.name}>
                              <div className="flex items-center gap-2">
                                {repo.private ? (
                                  <Lock className="h-3 w-3" />
                                ) : (
                                  <Globe className="h-3 w-3" />
                                )}
                                {repo.name}
                              </div>
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-surface-base px-2 text-content-muted">
                        or
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowCreateRepo(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Repository
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Connected repository */}
                  <div className="rounded-lg border border-border-muted p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-content">
                          {connection.repository_name}
                        </p>
                        <p className="text-sm text-content-muted">
                          Branch: {connection.current_branch}
                        </p>
                        {connection.last_sync_at && (
                          <p className="text-xs text-content-muted">
                            Last sync: {new Date(connection.last_sync_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <a
                        href={connection.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-content-muted hover:text-content"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {/* Branch selection */}
                  {branches.length > 1 && (
                    <div className="grid gap-2">
                      <Label>Branch</Label>
                      <Select
                        value={connection.current_branch}
                        onValueChange={handleBranchChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.name} value={branch.name}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Sync actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePush}
                      disabled={isSyncing}
                      className="flex-1"
                    >
                      {pushToGitHub.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Push
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handlePull}
                      disabled={isSyncing}
                      className="flex-1"
                    >
                      {pullFromGitHub.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Pull
                    </Button>
                  </div>

                  {/* Sync message */}
                  {syncMessage && (
                    <div
                      className={`flex items-center gap-2 rounded-lg p-3 ${
                        syncMessage.type === 'success'
                          ? 'bg-success/10 text-success'
                          : 'bg-error/10 text-error'
                      }`}
                    >
                      {syncMessage.type === 'success' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm">{syncMessage.text}</span>
                    </div>
                  )}

                  {/* Disconnect */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    className="text-content-muted"
                    disabled={disconnectRepo.isPending}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Change Repository
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Repository Dialog */}
      <Dialog open={showCreateRepo} onOpenChange={setShowCreateRepo}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Repository</DialogTitle>
            <DialogDescription>
              Create a new GitHub repository for this project
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="repoName">Repository Name</Label>
              <Input
                id="repoName"
                value={newRepoName}
                onChange={(e) =>
                  setNewRepoName(e.target.value.replace(/\s+/g, '-'))
                }
                placeholder={projectName.toLowerCase().replace(/\s+/g, '-')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="repoDesc">Description (optional)</Label>
              <Input
                id="repoDesc"
                value={newRepoDescription}
                onChange={(e) => setNewRepoDescription(e.target.value)}
                placeholder="Game built with PlayCraft"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {newRepoPrivate ? (
                  <Lock className="h-4 w-4 text-content-muted" />
                ) : (
                  <Globe className="h-4 w-4 text-content-muted" />
                )}
                <Label htmlFor="private">Private Repository</Label>
              </div>
              <Switch
                id="private"
                checked={newRepoPrivate}
                onCheckedChange={setNewRepoPrivate}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRepo(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRepository}
              disabled={!newRepoName.trim() || isCreatingRepo}
            >
              {isCreatingRepo ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
