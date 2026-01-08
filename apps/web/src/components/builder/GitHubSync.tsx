/**
 * GitHubSync Component
 *
 * Provides GitHub repository sync functionality in the Builder.
 * Allows pushing project changes and pulling updates from GitHub.
 */

import { useState, useEffect, useCallback } from 'react';
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
  listRepositories,
  createRepository,
  listBranches,
  pushToGitHub,
  pullFromGitHub,
  validateGitHubConnection,
  getGitHubUser,
  type GitHubRepository,
  type GitHubBranch,
} from '../../lib/githubService';
import { connectGitHub } from '../../lib/settingsService';

interface GitHubSyncProps {
  projectId: string;
  projectName: string;
  projectFiles: Record<string, string>;
  onFilesUpdated?: (files: Record<string, string>) => void;
}

interface SyncState {
  connected: boolean;
  repository: GitHubRepository | null;
  branch: string;
  lastSyncSha: string | null;
}

export function GitHubSync({
  projectId,
  projectName,
  projectFiles,
  onFilesUpdated,
}: GitHubSyncProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({
    connected: false,
    repository: null,
    branch: 'main',
    lastSyncSha: null,
  });

  // Create repo dialog
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  // Sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load saved sync state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`github-sync-${projectId}`);
    if (saved) {
      try {
        setSyncState(JSON.parse(saved));
      } catch {
        // Invalid saved state
      }
    }
  }, [projectId]);

  // Save sync state to localStorage
  useEffect(() => {
    if (syncState.repository) {
      localStorage.setItem(`github-sync-${projectId}`, JSON.stringify(syncState));
    }
  }, [projectId, syncState]);

  // Check connection status
  useEffect(() => {
    async function checkConnection() {
      setIsLoading(true);
      try {
        const connected = await validateGitHubConnection();
        setIsConnected(connected);

        if (connected) {
          const user = await getGitHubUser();
          setUserName(user.login);
          const repos = await listRepositories();
          setRepositories(repos);
        }
      } catch {
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  // Load branches when repository changes
  useEffect(() => {
    async function loadBranches() {
      if (!syncState.repository || !userName) return;

      try {
        const branchList = await listBranches(userName, syncState.repository.name);
        setBranches(branchList);
      } catch {
        setBranches([]);
      }
    }

    loadBranches();
  }, [syncState.repository, userName]);

  const handleConnect = useCallback(() => {
    connectGitHub();
  }, []);

  const handleSelectRepository = useCallback((repoName: string) => {
    const repo = repositories.find((r) => r.name === repoName);
    if (repo) {
      setSyncState((prev) => ({
        ...prev,
        repository: repo,
        branch: repo.defaultBranch,
        connected: true,
      }));
    }
  }, [repositories]);

  const handleCreateRepository = useCallback(async () => {
    if (!newRepoName.trim()) return;

    setIsCreatingRepo(true);
    try {
      const repo = await createRepository(
        newRepoName.trim(),
        newRepoDescription || `PlayCraft project: ${projectName}`,
        newRepoPrivate
      );

      setRepositories((prev) => [repo, ...prev]);
      setSyncState((prev) => ({
        ...prev,
        repository: repo,
        branch: repo.defaultBranch,
        connected: true,
      }));
      setShowCreateRepo(false);
      setNewRepoName('');
      setNewRepoDescription('');
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create repository',
      });
    } finally {
      setIsCreatingRepo(false);
    }
  }, [newRepoName, newRepoDescription, newRepoPrivate, projectName]);

  const handlePush = useCallback(async () => {
    if (!syncState.repository || !userName) return;

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const result = await pushToGitHub(
        userName,
        syncState.repository.name,
        syncState.branch,
        projectFiles,
        `Update from PlayCraft: ${new Date().toLocaleString()}`
      );

      if (result.success) {
        setSyncState((prev) => ({
          ...prev,
          lastSyncSha: result.commitSha || null,
        }));
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
    } finally {
      setIsSyncing(false);
    }
  }, [syncState.repository, syncState.branch, userName, projectFiles]);

  const handlePull = useCallback(async () => {
    if (!syncState.repository || !userName) return;

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const result = await pullFromGitHub(
        userName,
        syncState.repository.name,
        syncState.branch
      );

      if (result) {
        setSyncState((prev) => ({
          ...prev,
          lastSyncSha: result.sha,
        }));
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
    } finally {
      setIsSyncing(false);
    }
  }, [syncState.repository, syncState.branch, userName, onFilesUpdated]);

  const handleDisconnect = useCallback(() => {
    setSyncState({
      connected: false,
      repository: null,
      branch: 'main',
      lastSyncSha: null,
    });
    localStorage.removeItem(`github-sync-${projectId}`);
  }, [projectId]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Github className="h-4 w-4" />
        {syncState.connected ? 'Synced' : 'GitHub'}
        {syncState.connected && <Check className="h-3 w-3 text-success" />}
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
          ) : !isConnected ? (
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
                  Connected as <strong>@{userName}</strong>
                </span>
              </div>

              {/* Repository selection */}
              {!syncState.connected ? (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label>Select Repository</Label>
                    <Select onValueChange={handleSelectRepository}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a repository..." />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="max-h-48">
                          {repositories.map((repo) => (
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
                          {syncState.repository?.name}
                        </p>
                        <p className="text-sm text-content-muted">
                          Branch: {syncState.branch}
                        </p>
                      </div>
                      <a
                        href={syncState.repository?.url}
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
                        value={syncState.branch}
                        onValueChange={(v) =>
                          setSyncState((prev) => ({ ...prev, branch: v }))
                        }
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
                      {isSyncing ? (
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
                      {isSyncing ? (
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
