/**
 * GitHub Connector Panel
 * Connect/disconnect GitHub account for project sync
 */

import { Github, Loader2 } from 'lucide-react';
import { useConnectGitHub, useDisconnectGitHub, useUserSettings } from '../../hooks/useUserSettings';

export function GitHubPanel() {
  const { data: settings, isLoading } = useUserSettings();
  const { mutate: connectGitHub, isPending: isConnecting } = useConnectGitHub();
  const { mutate: disconnectGitHub, isPending: isDisconnecting } = useDisconnectGitHub();

  if (isLoading || !settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-light" />
      </div>
    );
  }

  const githubConnected = settings.connected_accounts?.github;

  const handleConnectGitHub = () => {
    if (isConnecting) return;
    connectGitHub();
  };

  const handleDisconnectGitHub = () => {
    if (isDisconnecting) return;
    disconnectGitHub();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-content">GitHub</h2>
      <p className="mt-1 text-content-muted">
        Sync your project 2-way with GitHub to collaborate at source.
      </p>

      <div className="mt-8">
        <h3 className="font-medium text-content">Connected account</h3>
        <p className="mt-1 text-sm text-content-muted">
          Add your GitHub account to manage connected organizations.
        </p>

        {githubConnected ? (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-surface-overlay p-4">
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-content" />
              <div>
                <p className="text-sm font-medium text-content">
                  {githubConnected.username}
                </p>
                <p className="text-xs text-content-muted">
                  Connected{' '}
                  {new Date(githubConnected.connected_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnectGitHub}
              disabled={isDisconnecting}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-content-muted hover:bg-surface-elevated disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectGitHub}
            disabled={isConnecting}
            className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface-overlay px-4 py-2.5 text-content hover:bg-surface-elevated disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Github className="h-5 w-5" />
            {isConnecting ? 'Connecting...' : 'Connect GitHub'}
          </button>
        )}

        {/* GitHub Features Info */}
        <div className="mt-8 space-y-4">
          <h3 className="font-medium text-content">What you can do with GitHub</h3>
          <ul className="space-y-3 text-sm text-content-muted">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>
                Push your game code directly to a GitHub repository
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>
                Pull changes from your repo to continue editing in PlayCraft
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>
                Collaborate with team members using Git workflows
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>
                Deploy your game using GitHub Actions or other CI/CD
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
