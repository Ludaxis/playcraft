import { useState, useCallback, useRef, useEffect } from 'react';
import { WebContainer, FileSystemTree } from '@webcontainer/api';
import {
  bootWebContainer,
  getWebContainer,
  mountFiles,
  writeFile,
  readFile,
  readAllProjectFiles,
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
  checkOutdated: () => Promise<void>;
  updateOutdated: () => Promise<void>;
  dismissOutdated: () => void;
}

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

  // Cleanup on unmount - kill any running processes
  useEffect(() => {
    return () => {
      const killed = killAllProcesses();
      if (killed > 0) {
        console.log(`[useWebContainer] Cleanup: killed ${killed} process(es)`);
      }
    };
  }, []);

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
      console.log(`[useWebContainer] Reset: killed ${killed} process(es)`);
    }
    devServerProcessIdRef.current = null;

    resetNodeModulesState();
    setPreviewUrl(null);
    setFileTree([]);
    setTerminalOutput([]);
    setError(null);
    setStatus('ready'); // Reset to ready state since we killed the dev server
  }, []);

  // Boot the WebContainer
  const boot = useCallback(async () => {
    // Use ref for synchronous lock (React state is async)
    if (isBootingRef.current || containerRef.current) {
      console.log('[useWebContainer] Boot skipped - already booting or booted');
      return;
    }
    if (status !== 'idle') return;

    isBootingRef.current = true;
    setStatus('booting');
    setError(null);
    appendOutput('Booting WebContainer...\n');

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
    } finally {
      isBootingRef.current = false;
    }
  }, [status, appendOutput]);

  // Current project ID ref for caching
  const projectIdRef = useRef<string | null>(null);

  // Mount project files
  const mountProject = useCallback(async (files: FileSystemTree, projectId?: string) => {
    if (!containerRef.current && status !== 'ready') {
      await boot();
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
    console.log('[useWebContainer] install called with projectId:', projectId);

    // Use provided projectId or fall back to ref
    const currentProjectId = projectId || projectIdRef.current;
    console.log('[useWebContainer] currentProjectId:', currentProjectId);

    // Check if we can skip install
    const alreadyInstalled = await hasNodeModules();
    console.log('[useWebContainer] alreadyInstalled:', alreadyInstalled);

    if (alreadyInstalled) {
      appendOutput('\nDependencies already installed, skipping npm install...\n');
      setStatus('ready');
      console.log('[useWebContainer] Skipping install - already installed');
      return;
    }

    setStatus('installing');

    // Try to restore from IndexedDB cache first
    if (currentProjectId) {
      appendOutput('\nChecking dependency cache...\n');
      console.log('[useWebContainer] Attempting cache restore...');
      const restored = await restoreFromCache(currentProjectId, appendOutput);
      console.log('[useWebContainer] Cache restore result:', restored);
      if (restored) {
        appendOutput('\nDependencies restored from cache!\n');
        setStatus('ready');
        console.log('[useWebContainer] Dependencies restored from cache, status set to ready');
        await refreshFileTree();
        return;
      }
    }

    // No cache - do full npm install
    appendOutput('\n$ npm install\n');
    console.log('[useWebContainer] Starting full npm install...');

    try {
      const exitCode = await installDependencies(appendOutput);
      console.log('[useWebContainer] npm install exit code:', exitCode);

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
          console.warn('[Cache] Caching failed (non-blocking):', err);
        }
      }

      await refreshFileTree();
    } catch (err) {
      console.error('[useWebContainer] install error:', err);
      const message = err instanceof Error ? err.message : 'Failed to install dependencies';
      setError(message);
      setStatus('error');
      appendOutput(`\nError: ${message}\n`);
      throw err;
    }
  }, [appendOutput]);

  // Start dev server
  const startDev = useCallback(async () => {
    console.log('[useWebContainer] startDev called');

    // Kill ALL running processes first to ensure clean slate
    // This handles zombie processes from page refreshes
    const killed = killAllProcesses();
    if (killed > 0) {
      console.log('[useWebContainer] Killed', killed, 'existing process(es) before starting dev server');
    }
    devServerProcessIdRef.current = null;

    setStatus('running');
    appendOutput('\n$ npm run dev\n');

    try {
      console.log('[useWebContainer] Calling startDevServer...');
      const processId = await startDevServer(
        appendOutput,
        (port, url) => {
          console.log('[useWebContainer] Server ready callback received:', { port, url });
          setPreviewUrl(url);
          appendOutput(`\nServer running at ${url}\n`);
        }
      );
      devServerProcessIdRef.current = processId;
      console.log('[useWebContainer] Dev server started, processId:', processId);
    } catch (err) {
      console.error('[useWebContainer] startDevServer error:', err);
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
      console.warn('Failed to refresh file tree:', err);
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
      console.warn('[useWebContainer] TypeScript check failed:', err);
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
      console.warn('[useWebContainer] ESLint check failed:', err);
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
      console.error('Failed to check dependencies:', err);
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
    checkOutdated,
    updateOutdated,
    dismissOutdated,
  };
}
