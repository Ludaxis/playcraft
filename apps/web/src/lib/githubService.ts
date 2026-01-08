/**
 * GitHub Service
 *
 * Handles GitHub integration for project sync.
 * Provides repository listing, creation, push, and pull operations.
 */

import { getSupabase } from './supabase';

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
  updatedAt: string;
}

export interface GitHubBranch {
  name: string;
  sha: string;
  protected: boolean;
}

export interface GitHubFile {
  path: string;
  sha: string;
  content: string;
  size: number;
}

export interface SyncStatus {
  connected: boolean;
  repository: GitHubRepository | null;
  branch: string;
  lastSyncAt: string | null;
  hasLocalChanges: boolean;
  hasRemoteChanges: boolean;
}

export interface SyncResult {
  success: boolean;
  filesChanged: number;
  commitSha?: string;
  error?: string;
}

async function getGitHubToken(): Promise<string> {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    throw new Error('GitHub not connected. Please connect your GitHub account.');
  }

  return session.provider_token;
}

async function githubFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getGitHubToken();

  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });

  return response;
}

export async function getGitHubUser(): Promise<{
  login: string;
  name: string;
  avatarUrl: string;
}> {
  const response = await githubFetch('/user');

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub user');
  }

  const data = await response.json();
  return {
    login: data.login,
    name: data.name || data.login,
    avatarUrl: data.avatar_url,
  };
}

export async function listRepositories(): Promise<GitHubRepository[]> {
  const response = await githubFetch('/user/repos?sort=updated&per_page=100');

  if (!response.ok) {
    throw new Error('Failed to list repositories');
  }

  const data = await response.json();
  return data.map((repo: Record<string, unknown>) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    private: repo.private,
    url: repo.html_url,
    cloneUrl: repo.clone_url,
    defaultBranch: repo.default_branch,
    updatedAt: repo.updated_at,
  }));
}

export async function createRepository(
  name: string,
  description: string,
  isPrivate: boolean = true
): Promise<GitHubRepository> {
  const response = await githubFetch('/user/repos', {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create repository');
  }

  const repo = await response.json();
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    private: repo.private,
    url: repo.html_url,
    cloneUrl: repo.clone_url,
    defaultBranch: repo.default_branch || 'main',
    updatedAt: repo.updated_at,
  };
}

export async function listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
  const response = await githubFetch(`/repos/${owner}/${repo}/branches`);

  if (!response.ok) {
    throw new Error('Failed to list branches');
  }

  const data = await response.json();
  return data.map((branch: Record<string, unknown>) => ({
    name: branch.name,
    sha: (branch.commit as Record<string, unknown>)?.sha,
    protected: branch.protected,
  }));
}

export async function getRepositoryContents(
  owner: string,
  repo: string,
  path: string = '',
  branch?: string
): Promise<GitHubFile[]> {
  const ref = branch ? `?ref=${branch}` : '';
  const response = await githubFetch(`/repos/${owner}/${repo}/contents/${path}${ref}`);

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error('Failed to get repository contents');
  }

  const data = await response.json();
  const files: GitHubFile[] = [];

  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    if (item.type === 'file') {
      files.push({
        path: item.path,
        sha: item.sha,
        content: item.content ? atob(item.content) : '',
        size: item.size,
      });
    } else if (item.type === 'dir') {
      const subFiles = await getRepositoryContents(owner, repo, item.path, branch);
      files.push(...subFiles);
    }
  }

  return files;
}

async function getOrCreateBranch(
  owner: string,
  repo: string,
  branch: string
): Promise<string> {
  // Try to get the branch
  const branchResponse = await githubFetch(`/repos/${owner}/${repo}/branches/${branch}`);

  if (branchResponse.ok) {
    const branchData = await branchResponse.json();
    return branchData.commit.sha;
  }

  // Branch doesn't exist, create it from main
  const mainResponse = await githubFetch(`/repos/${owner}/${repo}/branches/main`);
  if (!mainResponse.ok) {
    throw new Error('Could not find main branch');
  }

  const mainData = await mainResponse.json();
  const baseSha = mainData.commit.sha;

  // Create the new branch
  const createRefResponse = await githubFetch(`/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    }),
  });

  if (!createRefResponse.ok) {
    throw new Error('Failed to create branch');
  }

  return baseSha;
}

export async function pushToGitHub(
  owner: string,
  repo: string,
  branch: string,
  files: Record<string, string>,
  message: string
): Promise<SyncResult> {
  try {
    // Get or create branch
    const baseSha = await getOrCreateBranch(owner, repo, branch);

    // Get the base tree
    const baseTreeResponse = await githubFetch(
      `/repos/${owner}/${repo}/git/commits/${baseSha}`
    );

    if (!baseTreeResponse.ok) {
      throw new Error('Failed to get base commit');
    }

    const baseCommit = await baseTreeResponse.json();
    const baseTreeSha = baseCommit.tree.sha;

    // Create blobs for each file
    const treeItems = [];

    for (const [path, content] of Object.entries(files)) {
      // Skip node_modules and other ignored paths
      if (
        path.includes('node_modules/') ||
        path.includes('.git/') ||
        path.startsWith('dist/')
      ) {
        continue;
      }

      // Create blob
      const blobResponse = await githubFetch(`/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({
          content: btoa(unescape(encodeURIComponent(content))),
          encoding: 'base64',
        }),
      });

      if (!blobResponse.ok) {
        console.warn(`Failed to create blob for ${path}`);
        continue;
      }

      const blob = await blobResponse.json();

      treeItems.push({
        path: path.startsWith('/') ? path.slice(1) : path,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      });
    }

    if (treeItems.length === 0) {
      return { success: true, filesChanged: 0 };
    }

    // Create tree
    const treeResponse = await githubFetch(`/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    });

    if (!treeResponse.ok) {
      throw new Error('Failed to create tree');
    }

    const tree = await treeResponse.json();

    // Create commit
    const commitResponse = await githubFetch(`/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [baseSha],
      }),
    });

    if (!commitResponse.ok) {
      throw new Error('Failed to create commit');
    }

    const commit = await commitResponse.json();

    // Update branch reference
    const updateRefResponse = await githubFetch(
      `/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          sha: commit.sha,
          force: false,
        }),
      }
    );

    if (!updateRefResponse.ok) {
      throw new Error('Failed to update branch reference');
    }

    return {
      success: true,
      filesChanged: treeItems.length,
      commitSha: commit.sha,
    };
  } catch (error) {
    return {
      success: false,
      filesChanged: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function pullFromGitHub(
  owner: string,
  repo: string,
  branch: string
): Promise<{ files: Record<string, string>; sha: string } | null> {
  try {
    const files = await getRepositoryContents(owner, repo, '', branch);

    const fileMap: Record<string, string> = {};
    for (const file of files) {
      // Skip binary files and node_modules
      if (
        file.path.includes('node_modules/') ||
        file.path.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp3|wav|ogg|mp4|webm)$/i)
      ) {
        continue;
      }

      // Fetch file content if not already included
      if (!file.content) {
        const contentResponse = await githubFetch(
          `/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`
        );
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          if (contentData.content) {
            fileMap[`/${file.path}`] = atob(contentData.content);
          }
        }
      } else {
        fileMap[`/${file.path}`] = file.content;
      }
    }

    // Get latest commit SHA
    const branchResponse = await githubFetch(`/repos/${owner}/${repo}/branches/${branch}`);
    const branchData = await branchResponse.json();

    return {
      files: fileMap,
      sha: branchData.commit.sha,
    };
  } catch (error) {
    console.error('Pull from GitHub failed:', error);
    return null;
  }
}

export async function checkForRemoteChanges(
  owner: string,
  repo: string,
  branch: string,
  lastKnownSha: string
): Promise<boolean> {
  try {
    const response = await githubFetch(`/repos/${owner}/${repo}/branches/${branch}`);

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.commit.sha !== lastKnownSha;
  } catch {
    return false;
  }
}

export function isGitHubConnected(): boolean {
  // This is sync check - actual validation requires async call
  // Real check happens via validateGitHubConnection()
  return true;
}

export async function validateGitHubConnection(): Promise<boolean> {
  try {
    const user = await getGitHubUser();
    return !!user.login;
  } catch {
    return false;
  }
}
