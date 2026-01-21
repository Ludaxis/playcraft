import { useState, useCallback, useRef, useEffect } from 'react';
import { WebContainer, FileSystemTree } from '@webcontainer/api';
import { logger } from '../lib/logger';
import {
  bootWebContainer,
  getWebContainer,
  mountFiles,
  writeFile,
  readFile,
  readAllProjectFiles,
  readDistFiles,
  mkdir,
  rm,
  spawn,
  runAndCaptureOutput,
  installDependencies,
  startDevServer,
  getFileTree,
  hasNodeModules,
  resetNodeModulesState,
  checkDependencies,
  updateDependencies,
  killAllProcesses,
  restoreFromCache,
  saveToCache,
  getProjectState,
  setProjectState,
  clearProjectState,
  type OutdatedDependency,
} from '../lib/webcontainer';

export type WebContainerStatus =
  | 'idle'
  | 'booting'
  | 'ready'
  | 'installing'
  | 'running'
  | 'error';

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

export interface UseWebContainerReturn {
  status: WebContainerStatus;
  error: string | null;
  previewUrl: string | null;
  terminalOutput: string[];
  fileTree: FileNode[];
  outdatedDeps: OutdatedDependency[];
  isCheckingDeps: boolean;
  isUpdatingDeps: boolean;

  // Actions
  boot: () => Promise<void>;
  mountProject: (files: FileSystemTree, projectId?: string) => Promise<void>;
  writeProjectFile: (path: string, contents: string) => Promise<void>;
  readProjectFile: (path: string) => Promise<string>;
  readAllFiles: () => Promise<Record<string, string>>;
  readDistFiles: () => Promise<Record<string, string>>;
  deleteFile: (path: string) => Promise<void>;
  createDirectory: (path: string) => Promise<void>;
  install: (projectId?: string) => Promise<void>;
  startDev: () => Promise<void>;
  refreshFileTree: () => Promise<void>;
  runCommand: (command: string, args?: string[]) => Promise<number>;
  runTypeCheck: () => Promise<string>;
  runESLint: () => Promise<string>;
  clearTerminal: () => void;
  checkNodeModules: () => Promise<boolean>;
  resetForNewProject: () => void;
  tryRestoreProject: (projectId: string) => boolean;
  checkOutdated: () => Promise<void>;
  updateOutdated: () => Promise<void>;
  dismissOutdated: () => void;
}

const COMPONENT = 'useWebContainer';

export function useWebContainer(): UseWebContainerReturn {
  const [status, setStatus] = useState<WebContainerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [outdatedDeps, setOutdatedDeps] = useState<OutdatedDependency[]>([]);
  const [isCheckingDeps, setIsCheckingDeps] = useState(false);
  const [isUpdatingDeps, setIsUpdatingDeps] = useState(false);

  const containerRef = useRef<WebContainer | null>(null);
  const devServerProcessIdRef = useRef<string | null>(null);
  const isBootingRef = useRef(false); // Synchronous lock to prevent race conditions
  const currentProjectIdRef = useRef<string | null>(null);

  // NOTE: We intentionally do NOT kill processes on unmount.
  // This allows the dev server to keep running when navigating away,
  // so users can return to the same project instantly.

  // Append to terminal output
  const appendOutput = useCallback((data: string) => {
    setTerminalOutput(prev => [...prev, data]);
  }, []);

  // Clear terminal
  const clearTerminal = useCallback(() => {
    setTerminalOutput([]);
  }, []);

  // Check if node_modules exists
  const checkNodeModules = useCallback(async (): Promise<boolean> => {
    return hasNodeModules();
  }, []);

  // Reset state for a new project (but keep WebContainer)
  const resetForNewProject = useCallback(() => {
    // Kill any running processes (dev server, etc.)
    const killed = killAllProcesses();
    if (killed > 0) {
      logger.debug(`Reset: killed ${killed} process(es)`, { component: COMPONENT, action: 'reset' });
    }
    devServerProcessIdRef.current = null;
    currentProjectIdRef.current = null;

    // Clear persisted project state
    clearProjectState();

    resetNodeModulesState();
    setPreviewUrl(null);
    setFileTree([]);
    setTerminalOutput([]);
    setError(null);
    setStatus('ready'); // Reset to ready state since we killed the dev server
  }, []);

  // Try to restore state for a project (returns true if already ready)
  const tryRestoreProject = useCallback((projectId: string): boolean => {
    const existingState = getProjectState();

    // Only restore if we have valid state AND the container is actually booted
    // After page refresh, the WebContainer needs to be re-booted even if sessionStorage has state
    const container = getWebContainer();
    if (!container) {
      logger.debug('Cannot restore - WebContainer not booted yet', { component: COMPONENT });
      // Clear stale state from sessionStorage
      clearProjectState();
      return false;
    }

    if (existingState && existingState.projectId === projectId && existingState.isReady) {
      logger.debug('Restoring existing project state', { component: COMPONENT, projectId });

      // Restore the state
      currentProjectIdRef.current = projectId;
      devServerProcessIdRef.current = existingState.devServerProcessId;

      if (existingState.previewUrl) {
        setPreviewUrl(existingState.previewUrl);
      }

      setStatus('running');
      return true;
    }

    // Check if switching to a different project
    if (currentProjectIdRef.current && currentProjectIdRef.current !== projectId) {
      logger.debug('Switching projects', { component: COMPONENT, from: currentProjectIdRef.current, to: projectId });
      resetForNewProject();
    }

    currentProjectIdRef.current = projectId;
    return false;
  }, [resetForNewProject]);

  // Track ongoing boot promise
  const bootPromiseRef = useRef<Promise<void> | null>(null);

  // Boot the WebContainer
  const boot = useCallback(async () => {
    // If already booted, return immediately
    if (containerRef.current) {
      logger.debug('Boot skipped - already booted', { component: COMPONENT });
      return;
    }

    // If boot is in progress, wait for it
    if (bootPromiseRef.current) {
      logger.debug('Boot in progress - waiting for completion', { component: COMPONENT });
      await bootPromiseRef.current;
      return;
    }

    if (status !== 'idle') return;

    isBootingRef.current = true;
    setStatus('booting');
    setError(null);
    appendOutput('Booting WebContainer...\n');

    // Create and store the boot promise
    bootPromiseRef.current = (async () => {
      try {
        const container = await bootWebContainer();
        containerRef.current = container;
        setStatus('ready');
        appendOutput('WebContainer ready!\n');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to boot WebContainer';
        setError(message);
        setStatus('error');
        appendOutput(`Error: ${message}\n`);
        throw err;
      } finally {
        isBootingRef.current = false;
        bootPromiseRef.current = null;
      }
    })();

    await bootPromiseRef.current;
  }, [status, appendOutput]);

  // Current project ID ref for caching
  const projectIdRef = useRef<string | null>(null);

  // Mount project files
  const mountProject = useCallback(async (files: FileSystemTree, projectId?: string) => {
    // Ensure WebContainer is booted before mounting
    if (!containerRef.current) {
      logger.debug('Container not ready, booting before mount', { component: COMPONENT });
      await boot();
      // Double-check container is available after boot
      if (!containerRef.current) {
        throw new Error('WebContainer failed to boot');
      }
    }

    // Set project ID for cache scoping
    if (projectId) {
      projectIdRef.current = projectId;
    }

    appendOutput('Mounting project files...\n');

    try {
      await mountFiles(files);
      appendOutput('Files mounted successfully!\n');
      await refreshFileTree();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mount files';
      setError(message);
      appendOutput(`Error: ${message}\n`);
      throw err;
    }
  }, [status, boot, appendOutput]);

  // Write a file
  const writeProjectFile = useCallback(async (path: string, contents: string) => {
    try {
      await writeFile(path, contents);
      await refreshFileTree();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to write file';
      setError(message);
      throw err;
    }
  }, []);

  // Read a file
  const readProjectFile = useCallback(async (path: string): Promise<string> => {
    try {
      return await readFile(path);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read file';
      setError(message);
      throw err;
    }
  }, []);

  // Read all project files (for AI context)
  const readAllFiles = useCallback(async (): Promise<Record<string, string>> => {
    try {
      return await readAllProjectFiles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read all files';
      setError(message);
      throw err;
    }
  }, []);

  // Read dist files (for publishing)
  const readDistFilesCallback = useCallback(async (): Promise<Record<string, string>> => {
    try {
      return await readDistFiles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read dist files';
      setError(message);
      throw err;
    }
  }, []);

  // Delete a file or directory
  const deleteFile = useCallback(async (path: string) => {
    try {
      await rm(path);
      await refreshFileTree();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      setError(message);
      throw err;
    }
  }, []);

  // Create a directory
  const createDirectory = useCallback(async (path: string) => {
    try {
      await mkdir(path);
      await refreshFileTree();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create directory';
      setError(message);
      throw err;
    }
  }, []);

  // Install dependencies (uses cache when available)
  const install = useCallback(async (projectId?: string) => {
    logger.debug('Install called', { component: COMPONENT, projectId });

    // Use provided projectId or fall back to ref
    const currentProjectId = projectId || projectIdRef.current;
    logger.debug('Current project ID', { component: COMPONENT, currentProjectId });

    // Check if we can skip install
    const alreadyInstalled = await hasNodeModules();
    logger.debug('Already installed check', { component: COMPONENT, alreadyInstalled });

    if (alreadyInstalled) {
      appendOutput('\nDependencies already installed, skipping npm install...\n');
      setStatus('ready');
      logger.debug('Skipping install - already installed', { component: COMPONENT });
      return;
    }

    setStatus('installing');

    // Try to restore from IndexedDB cache first
    if (currentProjectId) {
      appendOutput('\nChecking dependency cache...\n');
      logger.debug('Attempting cache restore', { component: COMPONENT });
      const restored = await restoreFromCache(currentProjectId, appendOutput);
      logger.debug('Cache restore result', { component: COMPONENT, restored });
      if (restored) {
        appendOutput('\nDependencies restored from cache!\n');
        setStatus('ready');
        logger.debug('Dependencies restored from cache', { component: COMPONENT });
        await refreshFileTree();
        return;
      }
    }

    // No cache - do full npm install
    appendOutput('\n$ npm install\n');
    logger.debug('Starting full npm install', { component: COMPONENT });

    try {
      const exitCode = await installDependencies(appendOutput);
      logger.debug('npm install completed', { component: COMPONENT, exitCode });

      if (exitCode !== 0) {
        throw new Error(`npm install failed with exit code ${exitCode}`);
      }

      setStatus('ready');
      appendOutput('\nDependencies installed!\n');

      // Cache node_modules for next time
      // Note: We await this to ensure cache is saved before user can navigate away
      if (currentProjectId) {
        try {
          await saveToCache(currentProjectId, appendOutput);
        } catch (err) {
          logger.warn('Caching failed (non-blocking)', { component: COMPONENT, error: err instanceof Error ? err.message : 'Unknown' });
        }
      }

      await refreshFileTree();
    } catch (err) {
      logger.error('Install error', err instanceof Error ? err : new Error(String(err)), { component: COMPONENT });
      const message = err instanceof Error ? err.message : 'Failed to install dependencies';
      setError(message);
      setStatus('error');
      appendOutput(`\nError: ${message}\n`);
      throw err;
    }
  }, [appendOutput]);

  // Start dev server
  const startDev = useCallback(async () => {
    logger.debug('startDev called', { component: COMPONENT });

    // Check if project is already running with dev server
    const existingState = getProjectState();
    if (existingState?.projectId === currentProjectIdRef.current &&
        existingState.isReady &&
        existingState.previewUrl) {
      logger.debug('Dev server already running, skipping start', { component: COMPONENT });
      setPreviewUrl(existingState.previewUrl);
      setStatus('running');
      return;
    }

    // Kill ALL running processes first to ensure clean slate
    // This handles zombie processes from page refreshes
    const killed = killAllProcesses();
    if (killed > 0) {
      logger.debug('Killed existing processes before starting dev server', { component: COMPONENT, killed });
    }
    devServerProcessIdRef.current = null;

    setStatus('running');
    appendOutput('\n$ npm run dev\n');

    try {
      logger.debug('Calling startDevServer', { component: COMPONENT });
      const processId = await startDevServer(
        appendOutput,
        (port, url) => {
          logger.debug('Server ready callback received', { component: COMPONENT, port, url });
          setPreviewUrl(url);
          appendOutput(`\nServer running at ${url}\n`);

          // Save project state for persistence across navigation
          if (currentProjectIdRef.current) {
            setProjectState({
              projectId: currentProjectIdRef.current,
              isReady: true,
              previewUrl: url,
              devServerProcessId: processId,
            });
            logger.debug('Saved project state', { component: COMPONENT, projectId: currentProjectIdRef.current });
          }
        }
      );
      devServerProcessIdRef.current = processId;
      logger.debug('Dev server started', { component: COMPONENT, processId });
    } catch (err) {
      logger.error('startDevServer error', err instanceof Error ? err : new Error(String(err)), { component: COMPONENT });
      const message = err instanceof Error ? err.message : 'Failed to start dev server';
      setError(message);
      setStatus('error');
      appendOutput(`\nError: ${message}\n`);
      throw err;
    }
  }, [appendOutput]);

  // Refresh file tree
  const refreshFileTree = useCallback(async () => {
    try {
      const tree = await getFileTree('/');
      setFileTree(tree as FileNode[]);
    } catch (err) {
      // Silently fail - file tree might not be ready yet
      logger.warn('Failed to refresh file tree', { component: COMPONENT, error: err instanceof Error ? err.message : 'Unknown' });
    }
  }, []);

  // Run arbitrary command
  const runCommand = useCallback(async (command: string, args: string[] = []): Promise<number> => {
    appendOutput(`\n$ ${command} ${args.join(' ')}\n`);

    try {
      const process = await spawn(command, args);

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            appendOutput(data);
          },
        })
      );

      return await process.exit;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Command failed';
      appendOutput(`Error: ${message}\n`);
      throw err;
    }
  }, [appendOutput]);

  // Run TypeScript check and return output (for validation)
  const runTypeCheck = useCallback(async (): Promise<string> => {
    try {
      const { output } = await runAndCaptureOutput('npx', ['tsc', '--noEmit'], { timeout: 60000 });
      return output;
    } catch (err) {
      // Timeout or other error - return empty string (no errors to report)
      logger.warn('TypeScript check failed', { component: COMPONENT, error: err instanceof Error ? err.message : 'Unknown' });
      return '';
    }
  }, []);

  // Run ESLint and return JSON output (for validation)
  const runESLint = useCallback(async (): Promise<string> => {
    try {
      const { output } = await runAndCaptureOutput(
        'npx',
        ['eslint', '.', '--format=json', '--ext', '.ts,.tsx', '--ignore-pattern', 'node_modules'],
        { timeout: 60000 }
      );
      return output;
    } catch (err) {
      // ESLint not available or timed out - return empty array
      logger.warn('ESLint check failed', { component: COMPONENT, error: err instanceof Error ? err.message : 'Unknown' });
      return '[]';
    }
  }, []);

  // Check if WebContainer is already booted on mount
  useEffect(() => {
    const existing = getWebContainer();
    if (existing) {
      containerRef.current = existing;
      setStatus('ready');
    }
  }, []);

  // Check for outdated dependencies
  const checkOutdated = useCallback(async () => {
    setIsCheckingDeps(true);
    try {
      const result = await checkDependencies();
      setOutdatedDeps(result.outdated);
    } catch (err) {
      logger.error('Failed to check dependencies', err instanceof Error ? err : new Error(String(err)), { component: COMPONENT });
    } finally {
      setIsCheckingDeps(false);
    }
  }, []);

  // Update all outdated dependencies
  const updateOutdated = useCallback(async () => {
    setIsUpdatingDeps(true);
    appendOutput('\n$ npm update\n');
    try {
      await updateDependencies(appendOutput);
      setOutdatedDeps([]);
      appendOutput('\nDependencies updated!\n');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update dependencies';
      appendOutput(`\nError: ${message}\n`);
    } finally {
      setIsUpdatingDeps(false);
    }
  }, [appendOutput]);

  // Dismiss outdated banner
  const dismissOutdated = useCallback(() => {
    setOutdatedDeps([]);
  }, []);

  return {
    status,
    error,
    previewUrl,
    terminalOutput,
    fileTree,
    outdatedDeps,
    isCheckingDeps,
    isUpdatingDeps,
    boot,
    mountProject,
    writeProjectFile,
    readProjectFile,
    readAllFiles,
    readDistFiles: readDistFilesCallback,
    deleteFile,
    createDirectory,
    install,
    startDev,
    refreshFileTree,
    runCommand,
    runTypeCheck,
    runESLint,
    clearTerminal,
    checkNodeModules,
    resetForNewProject,
    tryRestoreProject,
    checkOutdated,
    updateOutdated,
    dismissOutdated,
  };
}
