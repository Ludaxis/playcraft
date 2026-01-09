import { WebContainer, FileSystemTree, WebContainerProcess } from '@webcontainer/api';
import {
  hasCachedNodeModules,
  cacheNodeModules,
  restoreNodeModules,
} from './indexedDBCache';

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

// Track if node_modules exists to avoid redundant installs
let nodeModulesInstalled = false;

// =============================================================================
// PROJECT STATE PERSISTENCE
// =============================================================================
// Track state per project to avoid re-setup when navigating back

interface ProjectState {
  projectId: string;
  isReady: boolean;
  previewUrl: string | null;
  devServerProcessId: string | null;
}

let currentProjectState: ProjectState | null = null;
const PROJECT_STATE_KEY = 'playcraft_project_state';

/**
 * Get the current project state (for reconnecting after navigation)
 * First checks memory, then falls back to sessionStorage
 */
export function getProjectState(): ProjectState | null {
  if (currentProjectState) {
    return currentProjectState;
  }

  // Try to restore from sessionStorage (survives refresh)
  try {
    const stored = sessionStorage.getItem(PROJECT_STATE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as ProjectState;
      currentProjectState = state;
      return state;
    }
  } catch {
    // sessionStorage not available or corrupted
  }

  return null;
}

/**
 * Set the current project state (persists to sessionStorage)
 */
export function setProjectState(state: ProjectState): void {
  currentProjectState = state;
  try {
    sessionStorage.setItem(PROJECT_STATE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage not available
  }
}

/**
 * Check if a project is already set up and running
 */
export function isProjectReady(projectId: string): boolean {
  const state = getProjectState();
  return state?.projectId === projectId && state.isReady;
}

/**
 * Clear project state (when switching projects)
 */
export function clearProjectState(): void {
  currentProjectState = null;
  try {
    sessionStorage.removeItem(PROJECT_STATE_KEY);
  } catch {
    // sessionStorage not available
  }
}

// =============================================================================
// PROCESS MANAGEMENT
// =============================================================================
// Track running processes to enable cleanup on unmount/project switch

interface TrackedProcess {
  id: string;
  process: WebContainerProcess;
  command: string;
  startedAt: number;
}

const runningProcesses = new Map<string, TrackedProcess>();
let processIdCounter = 0;

/**
 * Generate a unique process ID
 */
function generateProcessId(): string {
  return `proc-${++processIdCounter}-${Date.now()}`;
}

/**
 * Track a spawned process for later cleanup
 */
function trackProcess(process: WebContainerProcess, command: string): string {
  const id = generateProcessId();
  runningProcesses.set(id, {
    id,
    process,
    command,
    startedAt: Date.now(),
  });

  // Auto-remove when process exits
  process.exit.then(() => {
    runningProcesses.delete(id);
  }).catch(() => {
    runningProcesses.delete(id);
  });

  return id;
}

/**
 * Kill a specific process by ID
 */
export function killProcess(id: string): boolean {
  const tracked = runningProcesses.get(id);
  if (tracked) {
    try {
      tracked.process.kill();
      runningProcesses.delete(id);
      return true;
    } catch (e) {
      console.warn(`Failed to kill process ${id}:`, e);
      runningProcesses.delete(id);
      return false;
    }
  }
  return false;
}

/**
 * Kill all running processes (for cleanup on unmount/project switch)
 */
export function killAllProcesses(): number {
  let killed = 0;
  for (const [id, tracked] of runningProcesses) {
    try {
      tracked.process.kill();
      killed++;
    } catch (e) {
      console.warn(`Failed to kill process ${id}:`, e);
    }
    runningProcesses.delete(id);
  }
  return killed;
}

/**
 * Get list of running processes (for debugging/monitoring)
 */
export function getRunningProcesses(): Array<{ id: string; command: string; startedAt: number }> {
  return Array.from(runningProcesses.values()).map(({ id, command, startedAt }) => ({
    id,
    command,
    startedAt,
  }));
}

/**
 * Boot the WebContainer instance (singleton).
 * Can only be called once - subsequent calls return the same instance.
 */
export async function bootWebContainer(): Promise<WebContainer> {
  // Return existing instance if already booted
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  // Return existing promise if boot is in progress
  if (bootPromise) {
    return bootPromise;
  }

  // Start boot process
  bootPromise = (async () => {
    try {
      const instance = await WebContainer.boot();
      webcontainerInstance = instance;
      return instance;
    } catch (err) {
      // Handle "already booted" error gracefully
      if (err instanceof Error && err.message.includes('single WebContainer instance')) {
        console.warn('[WebContainer] Boot race condition detected, waiting for existing instance...');
        // Wait a bit and retry - the other boot should complete
        await new Promise(resolve => setTimeout(resolve, 100));
        if (webcontainerInstance) {
          return webcontainerInstance;
        }
      }
      bootPromise = null; // Reset so we can retry
      throw err;
    }
  })();

  return bootPromise;
}

/**
 * Get the current WebContainer instance.
 * Returns null if not booted yet.
 */
export function getWebContainer(): WebContainer | null {
  return webcontainerInstance;
}

/**
 * Mount files to the WebContainer filesystem.
 */
export async function mountFiles(files: FileSystemTree): Promise<void> {
  const instance = await bootWebContainer();
  await instance.mount(files);
}

/**
 * Write a single file to the WebContainer filesystem.
 * Automatically creates parent directories if they don't exist.
 */
export async function writeFile(path: string, contents: string): Promise<void> {
  const instance = await bootWebContainer();

  // Extract parent directory and create if needed
  const lastSlash = path.lastIndexOf('/');
  if (lastSlash > 0) {
    const dir = path.substring(0, lastSlash);
    try {
      await instance.fs.mkdir(dir, { recursive: true });
    } catch {
      // Directory might already exist, ignore error
    }
  }

  await instance.fs.writeFile(path, contents);
}

/**
 * Read a file from the WebContainer filesystem.
 */
export async function readFile(path: string): Promise<string> {
  const instance = await bootWebContainer();
  const contents = await instance.fs.readFile(path, 'utf-8');
  return contents;
}

/**
 * Read a directory from the WebContainer filesystem.
 */
export async function readDir(path: string): Promise<string[]> {
  const instance = await bootWebContainer();
  const entries = await instance.fs.readdir(path);
  return entries;
}

/**
 * Read all project source files from the WebContainer filesystem.
 * Returns a map of file paths to their contents.
 * Excludes node_modules, dist, and other non-source files.
 */
export async function readAllProjectFiles(): Promise<Record<string, string>> {
  const instance = await bootWebContainer();
  const files: Record<string, string> = {};

  // Directories to scan for source files
  const sourceDirs = ['/src'];

  // File extensions to include
  const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.html'];

  // Always include root config files
  const rootConfigs = ['package.json', 'tsconfig.json', 'tailwind.config.ts', 'vite.config.ts'];

  // Read root config files
  for (const configFile of rootConfigs) {
    try {
      const content = await instance.fs.readFile(`/${configFile}`, 'utf-8');
      files[`/${configFile}`] = content;
    } catch {
      // File doesn't exist, skip
    }
  }

  // Recursively read source directories
  async function readDirRecursive(dirPath: string): Promise<void> {
    try {
      const entries = await instance.fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = dirPath === '/' ? `/${entry.name}` : `${dirPath}/${entry.name}`;

        // Skip non-source directories
        if (entry.isDirectory()) {
          // Skip node_modules, dist, .git, etc.
          if (['node_modules', 'dist', '.git', '.next', 'build'].includes(entry.name)) {
            continue;
          }
          await readDirRecursive(fullPath);
        } else if (entry.isFile()) {
          // Check if it's a source file
          const hasSourceExt = sourceExtensions.some(ext => entry.name.endsWith(ext));
          if (hasSourceExt) {
            try {
              const content = await instance.fs.readFile(fullPath, 'utf-8');
              files[fullPath] = content;
            } catch {
              // Failed to read file, skip
            }
          }
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
  }

  // Read all source directories
  for (const dir of sourceDirs) {
    await readDirRecursive(dir);
  }

  return files;
}

/**
 * Read all files from the dist/ folder after a production build.
 * Returns a map of file paths to their contents.
 */
export async function readDistFiles(): Promise<Record<string, string>> {
  const instance = await bootWebContainer();
  const files: Record<string, string> = {};

  async function readDirRecursive(dirPath: string): Promise<void> {
    try {
      const entries = await instance.fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = `${dirPath}/${entry.name}`;

        if (entry.isDirectory()) {
          await readDirRecursive(fullPath);
        } else if (entry.isFile()) {
          try {
            // Read as binary for non-text files (images, fonts, etc.)
            const content = await instance.fs.readFile(fullPath, 'utf-8');
            files[fullPath] = content;
          } catch {
            // Failed to read file, skip
          }
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
  }

  await readDirRecursive('/dist');

  return files;
}

/**
 * Create a directory in the WebContainer filesystem.
 */
export async function mkdir(path: string): Promise<void> {
  const instance = await bootWebContainer();
  await instance.fs.mkdir(path, { recursive: true });
}

/**
 * Remove a file or directory from the WebContainer filesystem.
 */
export async function rm(path: string): Promise<void> {
  const instance = await bootWebContainer();
  await instance.fs.rm(path, { recursive: true });
}

/**
 * Spawn a process in the WebContainer.
 */
export async function spawn(
  command: string,
  args: string[] = [],
  options?: { cwd?: string }
) {
  const instance = await bootWebContainer();
  return instance.spawn(command, args, options);
}

/**
 * Run a command and capture its output (stdout + stderr).
 * Returns the combined output as a string.
 * Useful for validation commands like `tsc --noEmit`.
 */
export async function runAndCaptureOutput(
  command: string,
  args: string[] = [],
  options?: { cwd?: string; timeout?: number }
): Promise<{ output: string; exitCode: number }> {
  const instance = await bootWebContainer();
  const process = await instance.spawn(command, args, options);

  let output = '';

  // Capture output
  const outputWriter = new WritableStream({
    write(data) {
      output += data;
    },
  });

  process.output.pipeTo(outputWriter);

  // Wait for process to exit with optional timeout
  const timeout = options?.timeout || 30000; // Default 30s timeout
  const exitCode = await Promise.race([
    process.exit,
    new Promise<number>((_, reject) =>
      setTimeout(() => reject(new Error(`Command timed out after ${timeout}ms`)), timeout)
    ),
  ]);

  return { output, exitCode };
}

/**
 * Check if node_modules already exists and has content.
 * Used to skip npm install when dependencies are already installed.
 */
export async function hasNodeModules(): Promise<boolean> {
  if (nodeModulesInstalled) {
    return true;
  }

  try {
    const instance = await bootWebContainer();
    const entries = await instance.fs.readdir('/node_modules');
    // Check if there are actual packages (not just .bin or .cache)
    const hasPackages = entries.some(
      (entry) => !entry.startsWith('.') && entry !== 'node_modules'
    );
    if (hasPackages) {
      nodeModulesInstalled = true;
      return true;
    }
  } catch {
    // node_modules doesn't exist
  }
  return false;
}

/**
 * Install npm dependencies.
 * Skips if node_modules already exists.
 */
export async function installDependencies(
  onOutput?: (data: string) => void,
  forceInstall = false
): Promise<number> {
  // Check if already installed
  if (!forceInstall && await hasNodeModules()) {
    onOutput?.('Dependencies already installed, skipping npm install...\n');
    return 0;
  }

  const process = await spawn('npm', ['install']);

  if (onOutput) {
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          onOutput(data);
        },
      })
    );
  }

  const exitCode = await process.exit;

  if (exitCode === 0) {
    nodeModulesInstalled = true;
  }

  return exitCode;
}

/**
 * Reset the installed state (useful when switching projects).
 */
export function resetNodeModulesState(): void {
  nodeModulesInstalled = false;
}

/**
 * Get current package.json content
 */
async function getPackageJsonContent(): Promise<string | null> {
  try {
    const instance = await bootWebContainer();
    return await instance.fs.readFile('/package.json', 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Restore node_modules from IndexedDB cache
 * Returns true if cache was restored successfully
 * NOTE: After restore, we run `npm rebuild` to recreate .bin links
 */
export async function restoreFromCache(
  projectId: string,
  onOutput?: (data: string) => void
): Promise<boolean> {
  try {
    const packageJson = await getPackageJsonContent();
    if (!packageJson) {
      onOutput?.('[Cache] No package.json found\n');
      return false;
    }

    // Check if we have valid cached dependencies
    const hasCache = await hasCachedNodeModules(projectId, packageJson);
    if (!hasCache) {
      onOutput?.('[Cache] No valid cache found\n');
      return false;
    }

    onOutput?.('[Cache] Restoring node_modules from cache...\n');

    // Restore files from IndexedDB
    const cachedFiles = await restoreNodeModules(projectId);
    if (!cachedFiles || cachedFiles.size === 0) {
      onOutput?.('[Cache] Cache was empty\n');
      return false;
    }

    const instance = await bootWebContainer();

    // Create node_modules directory
    try {
      await instance.fs.mkdir('/node_modules', { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Restore each file
    let restoredCount = 0;
    for (const [path, content] of cachedFiles) {
      try {
        // Ensure parent directory exists
        const dir = path.substring(0, path.lastIndexOf('/'));
        if (dir && dir !== '/node_modules') {
          await instance.fs.mkdir(dir, { recursive: true });
        }

        // Write file
        if (typeof content === 'string') {
          await instance.fs.writeFile(path, content);
        } else {
          await instance.fs.writeFile(path, content);
        }
        restoredCount++;
      } catch (e) {
        // Skip files that fail to restore
        console.warn(`[Cache] Failed to restore ${path}:`, e);
      }
    }

    onOutput?.(`[Cache] Restored ${restoredCount} files from cache\n`);

    // Run npm rebuild to recreate .bin links and fix permissions
    // This is necessary because .bin directory was not cached
    onOutput?.('[Cache] Running npm rebuild to restore bin links...\n');
    try {
      const rebuildProcess = await spawn('npm', ['rebuild']);

      // Wait for rebuild to complete
      const exitCode = await rebuildProcess.exit;
      if (exitCode === 0) {
        onOutput?.('[Cache] Rebuild complete!\n');
      } else {
        console.warn('[Cache] npm rebuild exited with code:', exitCode);
        // Still mark as installed - might work anyway
      }
    } catch (rebuildErr) {
      console.error('[Cache] npm rebuild failed:', rebuildErr);
      // Continue anyway - the cache restore might still work
    }

    nodeModulesInstalled = true;
    return true;
  } catch (err) {
    console.error('[Cache] Failed to restore from cache:', err);
    onOutput?.(`[Cache] Restore failed: ${err}\n`);
    return false;
  }
}

/**
 * Cache node_modules to IndexedDB after successful install
 * NOTE: We skip .bin directories because executables need permissions
 * that are lost during cache/restore. They'll be recreated by npm rebuild.
 */
export async function saveToCache(
  projectId: string,
  onOutput?: (data: string) => void
): Promise<void> {
  try {
    const packageJson = await getPackageJsonContent();
    if (!packageJson) {
      return;
    }

    onOutput?.('[Cache] Caching node_modules for faster future loads...\n');

    const instance = await bootWebContainer();
    const files = new Map<string, Uint8Array | string>();

    // Recursively collect all files from node_modules
    async function collectFiles(dirPath: string): Promise<void> {
      try {
        const entries = await instance.fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = `${dirPath}/${entry.name}`;

          if (entry.isDirectory()) {
            // Skip .cache, .vite, and .bin directories
            // .bin contains executables that need special permissions
            if (entry.name === '.cache' || entry.name === '.vite' || entry.name === '.bin') {
              continue;
            }
            await collectFiles(fullPath);
          } else {
            try {
              // Read as binary for proper handling
              const content = await instance.fs.readFile(fullPath);
              files.set(fullPath, content);
            } catch {
              // Skip unreadable files
            }
          }
        }
      } catch {
        // Skip unreadable directories
      }
    }

    await collectFiles('/node_modules');

    if (files.size > 0) {
      await cacheNodeModules(projectId, packageJson, files);
      onOutput?.(`[Cache] Saved ${files.size} files to cache\n`);
    }
  } catch (err) {
    console.error('[Cache] Failed to save cache:', err);
    // Don't throw - caching is optional
  }
}

/**
 * Outdated dependency info
 */
export interface OutdatedDependency {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  type: 'dependencies' | 'devDependencies';
}

/**
 * Check for outdated dependencies
 */
export async function checkDependencies(): Promise<{
  outdated: OutdatedDependency[];
  hasUpdates: boolean;
}> {
  try {
    const process = await spawn('npm', ['outdated', '--json']);

    let output = '';
    await process.output.pipeTo(
      new WritableStream({
        write(data) {
          output += data;
        },
      })
    );

    // npm outdated returns exit code 1 if there are outdated packages
    await process.exit;

    if (!output.trim()) {
      return { outdated: [], hasUpdates: false };
    }

    try {
      const parsed = JSON.parse(output);
      const outdated: OutdatedDependency[] = Object.entries(parsed).map(
        ([name, info]: [string, unknown]) => {
          const dep = info as { current: string; wanted: string; latest: string; type: string };
          return {
            name,
            current: dep.current || 'unknown',
            wanted: dep.wanted || dep.current,
            latest: dep.latest || dep.current,
            type: (dep.type === 'devDependencies' ? 'devDependencies' : 'dependencies') as 'dependencies' | 'devDependencies',
          };
        }
      );
      return { outdated, hasUpdates: outdated.length > 0 };
    } catch {
      return { outdated: [], hasUpdates: false };
    }
  } catch {
    // npm outdated might not be available or fail
    return { outdated: [], hasUpdates: false };
  }
}

/**
 * Update all dependencies
 */
export async function updateDependencies(
  onOutput?: (data: string) => void
): Promise<number> {
  const process = await spawn('npm', ['update']);

  if (onOutput) {
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          onOutput(data);
        },
      })
    );
  }

  return process.exit;
}

// Track server-ready listener to avoid duplicates
let serverReadyListenerRegistered = false;
let currentServerReadyCallback: ((port: number, url: string) => void) | null = null;

/**
 * Start the dev server.
 * Returns a process ID that can be used to kill the server later.
 */
export async function startDevServer(
  onOutput?: (data: string) => void,
  onServerReady?: (port: number, url: string) => void
): Promise<string> {
  const instance = await bootWebContainer();

  // Store callback for server-ready event
  currentServerReadyCallback = onServerReady || null;

  // Register server-ready listener only once (avoid duplicates)
  if (!serverReadyListenerRegistered && onServerReady) {
    instance.on('server-ready', (port, url) => {
      if (currentServerReadyCallback) {
        currentServerReadyCallback(port, url);
      }
    });
    serverReadyListenerRegistered = true;
  }

  const process = await spawn('npm', ['run', 'dev']);
  const processId = trackProcess(process, 'npm run dev');

  if (onOutput) {
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          onOutput(data);
        },
      })
    );
  }

  // Monitor process exit for errors
  process.exit.then((exitCode) => {
    if (exitCode !== 0) {
      console.error('[WebContainer] Dev server exited with code:', exitCode);
    }
  }).catch((err) => {
    console.error('[WebContainer] Dev server process error:', err);
  });

  return processId;
}

interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileTreeNode[];
}

/**
 * Get the filesystem tree for export.
 */
export async function getFileTree(
  path: string = '/'
): Promise<FileTreeNode[]> {
  const instance = await bootWebContainer();
  const entries = await instance.fs.readdir(path, { withFileTypes: true });

  const result = [];
  for (const entry of entries) {
    // Skip node_modules and hidden files
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path === '/' ? `/${entry.name}` : `${path}/${entry.name}`;

    if (entry.isDirectory()) {
      const children = await getFileTree(fullPath);
      result.push({
        name: entry.name,
        type: 'directory' as const,
        path: fullPath,
        children,
      });
    } else {
      result.push({
        name: entry.name,
        type: 'file' as const,
        path: fullPath,
      });
    }
  }

  return result;
}
