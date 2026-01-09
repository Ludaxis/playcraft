/**
 * Builder Page
 * Main game development IDE with modern UI:
 * - Chat panel on left with AI suggestions
 * - Tab-based view (Preview OR Code) on right
 * - Device toggles and view tabs in header
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { AlertTriangle, Image } from 'lucide-react';
import { Preview, ExportModal, PublishModal } from '../components';
import {
  EditorPanel,
  FileBrowserPanel,
  ResizablePanels,
  ChatHeader,
  PreviewHeader,
  ChatMessages,
  ChatInput,
  CreditsPanel,
  ChatHistory,
  SuggestionChips,
  type ChatMode,
  type ChatImage,
} from '../components/builder';
import { AssetPanel } from '../components/assets';
import type { BuilderViewMode } from '../components/builder/HeaderTabs';
import type { DeviceMode } from '../components/builder/DeviceToggle';
import { useWebContainer, usePlayCraftChat, usePreviewErrors, useFileChangeTracker, useSyncAssetsToContainer, useUploadMultipleAssets } from '../hooks';
import { viteStarterTemplate } from '../templates';
import { applyGeneratedFiles, applyGeneratedEdits } from '../lib/playcraftService';
import type { FileEdit } from '../lib/editApplyService';
import {
  updateProject,
  updateProjectStatus,
  saveProjectFiles,
  saveProjectFilesImmediate,
  type PlayCraftProject,
} from '../lib/projectService';
import {
  getChatSessions,
  createChatSession,
  saveChatSessionMessages,
  generateSessionTitle,
} from '../lib/chatSessionService';
import { getUserSettings } from '../lib/settingsService';
import { indexProjectFiles, getIndexingStatus } from '../lib/embeddingIndexer';
import { scanProjectForMemory } from '../lib/memoryUpdater';
import { getProjectMemory } from '../lib/projectMemoryService';
import type { ChatSession, ConversationMessage } from '../types';
import type { PreviewError } from '../lib/codeValidator';
import type { FileSystemTree } from '@webcontainer/api';

// Convert flat file map to WebContainer FileSystemTree
function filesToFileSystemTree(files: Record<string, string>): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const [filePath, content] of Object.entries(files)) {
    const parts = filePath.replace(/^\//, '').split('/');
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts[i];
      if (!current[dir]) {
        current[dir] = { directory: {} };
      }
      const node = current[dir];
      if ('directory' in node) {
        current = node.directory;
      }
    }

    const fileName = parts[parts.length - 1];
    current[fileName] = { file: { contents: content } };
  }

  return tree;
}

// Debounce function for auto-save
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

interface BuilderPageProps {
  user: User;
  project: PlayCraftProject;
  initialPrompt?: string | null;
  onBackToHome: () => void;
}

export function BuilderPage({
  user,
  project: initialProject,
  initialPrompt: initialPromptProp,
  onBackToHome,
}: BuilderPageProps) {
  // Project state - initialProject from App.tsx is already fresh (loaded via getProject)
  const [project, setProject] = useState<PlayCraftProject>(initialProject);
  // No need to re-fetch - App.tsx already loaded fresh data before mounting Builder
  const isLoadingProject = false;

  // Voyage API key for semantic search
  const [voyageApiKey, setVoyageApiKey] = useState<string | undefined>();

  // Recover initial prompt from localStorage if not provided as prop
  // This handles page refresh case
  const [initialPrompt, setInitialPrompt] = useState<string | null>(() => {
    if (initialPromptProp) return initialPromptProp;
    // Try to recover from localStorage
    const stored = localStorage.getItem(`playcraft_initial_prompt_${initialProject.id}`);
    if (stored) {
      console.log('[Builder] Recovered initial prompt from localStorage');
      return stored;
    }
    return null;
  });

  // Clear localStorage prompt after it's been used (do this in effect after sending)
  const clearStoredPrompt = () => {
    localStorage.removeItem(`playcraft_initial_prompt_${initialProject.id}`);
  };

  // Log project info on mount (no state update needed - useState already has initialProject)
  useEffect(() => {
    console.log('[Builder] Project mounted with', Object.keys(initialProject.files || {}).length, 'files');
  }, []);

  // Load Voyage API key from settings for semantic search
  useEffect(() => {
    getUserSettings()
      .then(settings => {
        if (settings?.voyage_api_key) {
          setVoyageApiKey(settings.voyage_api_key);
          console.log('[Builder] Voyage API key loaded for semantic search');
        }
      })
      .catch(err => {
        console.warn('[Builder] Failed to load settings:', err);
      });
  }, []);

  // Trigger initial embedding indexing when project loads and API key is available
  useEffect(() => {
    if (!voyageApiKey || !project.id || isLoadingProject) return;

    // Check if project needs indexing
    getIndexingStatus(project.id)
      .then(status => {
        if (status.needsIndexing && project.files) {
          console.log(`[Builder] Starting background indexing: ${status.pendingFiles} files pending`);
          indexProjectFiles(project.id, project.files, voyageApiKey)
            .then(result => {
              if (result.filesIndexed > 0) {
                console.log(`[Builder] Indexed ${result.filesIndexed} files, ${result.chunksCreated} chunks`);
              }
            })
            .catch(err => {
              console.warn('[Builder] Indexing failed:', err);
            });
        }
      })
      .catch(err => {
        console.warn('[Builder] Failed to check indexing status:', err);
      });
  }, [voyageApiKey, project.id, project.files, isLoadingProject]);

  // Scan project for memory population when project loads
  useEffect(() => {
    if (!project.id || isLoadingProject || !project.files) return;

    // Check if project needs memory population
    getProjectMemory(project.id)
      .then(memory => {
        if (!memory || !memory.project_summary) {
          console.log('[Builder] Starting background memory scan for project');
          scanProjectForMemory(project.id, project.files)
            .then(() => {
              console.log('[Builder] Project memory scan complete');
            })
            .catch(err => {
              console.warn('[Builder] Memory scan failed:', err);
            });
        }
      })
      .catch(err => {
        console.warn('[Builder] Failed to check project memory:', err);
      });
  }, [project.id, project.files, isLoadingProject]);

  // WebContainer state
  const {
    status,
    previewUrl,
    fileTree,
    boot,
    mountProject,
    writeProjectFile,
    readProjectFile,
    readAllFiles,
    readDistFiles,
    install,
    startDev,
    refreshFileTree,
    runCommand,
    runTypeCheck,
    runESLint,
    tryRestoreProject,
  } = useWebContainer();

  // UI state - modern split view
  const [viewMode, setViewMode] = useState<BuilderViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [projectReady, setProjectReady] = useState(false);
  const [hasThreeJs, setHasThreeJs] = useState(project.has_three_js);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const isSettingUpRef = useRef(false); // Synchronous lock to prevent race conditions
  const projectReadyRef = useRef(false); // Track projectReady for async callbacks
  const setupCompletedForProjectRef = useRef<string | null>(null); // Track which project we've set up
  const [initialPromptProcessed, setInitialPromptProcessed] = useState(false);
  const [creditsDismissed, setCreditsDismissed] = useState(false);
  const [chatPanelTab, setChatPanelTab] = useState<'chat' | 'history' | 'assets'>('chat');

  // Chat session state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [activeSessionMessages, setActiveSessionMessages] = useState<ConversationMessage[]>([]);
  const [isLoadingChatSessions, setIsLoadingChatSessions] = useState(true);

  // Project dropdown state
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [studioName, setStudioName] = useState('My Studio');

  // Track files in memory for saving to database
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({});

  // Preview errors from iframe
  const [previewErrors, setPreviewErrors] = useState<PreviewError[]>([]);

  // Track last AI generation for outcome feedback
  const lastAiGenerationRef = useRef<{ files: string[]; timestamp: number } | null>(null);

  // Queue for files generated before WebContainer is ready
  const pendingFilesRef = useRef<Array<{ path: string; content: string }>>([]);

  // File change tracker for live memory refresh
  const { trackChange, trackBatchChanges } = useFileChangeTracker({
    projectId: project.id,
    voyageApiKey,
    enableEmbedding: !!voyageApiKey,
    onHashesUpdated: (paths) => {
      console.log(`[Builder] File hashes updated: ${paths.length} files`);
    },
    onEmbeddingComplete: (path, success) => {
      if (success) {
        console.log(`[Builder] Live embedding complete: ${path}`);
      }
    },
  });

  // Preview error listener
  const { clearErrors: clearPreviewErrors } = usePreviewErrors({
    onError: (error) => {
      console.warn('[Preview Error]', error.type, error.message);
      setPreviewErrors(prev => [...prev.slice(-9), error]); // Keep last 10
    },
    logToConsole: false, // We handle logging ourselves
  });

  // Asset sync hook
  const syncAssets = useSyncAssetsToContainer();

  // Asset upload hook for chat input attachments
  const uploadAssets = useUploadMultipleAssets();

  // Sync assets to WebContainer when project is ready
  useEffect(() => {
    if (projectReady && project.id) {
      console.log('[Builder] Syncing assets to WebContainer...');
      syncAssets.mutate({
        projectId: project.id,
        onProgress: (progress) => {
          if (progress.current === progress.total) {
            console.log(`[Builder] Asset sync complete: ${progress.total} assets`);
          }
        },
      });
    }
  }, [projectReady, project.id]);

  // Sync projectFiles when project data loads
  useEffect(() => {
    if (!isLoadingProject && project.files) {
      console.log('[Builder] Syncing projectFiles from loaded project:', Object.keys(project.files).length, 'files');
      setProjectFiles(project.files);
    }
  }, [isLoadingProject, project.files]);

  // Keep projectReadyRef in sync with projectReady state
  useEffect(() => {
    projectReadyRef.current = projectReady;
  }, [projectReady]);

  // Load chat sessions when project loads
  useEffect(() => {
    const loadChatSessions = async () => {
      if (isLoadingProject) return;

      try {
        console.log('[Builder] Loading chat sessions for project:', project.id);
        const sessions = await getChatSessions(project.id);
        setChatSessions(sessions);

        // Set active session from project or use the most recent one
        let activeSession: ChatSession | undefined;
        if (project.active_chat_session_id && sessions.find(s => s.id === project.active_chat_session_id)) {
          setActiveChatSessionId(project.active_chat_session_id);
          activeSession = sessions.find(s => s.id === project.active_chat_session_id);
        } else if (sessions.length > 0) {
          setActiveChatSessionId(sessions[0].id);
          activeSession = sessions[0];
        }

        // Load messages from the active session
        if (activeSession && activeSession.messages && activeSession.messages.length > 0) {
          console.log('[Builder] Restoring', activeSession.messages.length, 'messages from session:', activeSession.title);
          setActiveSessionMessages(activeSession.messages);
        }

        console.log('[Builder] Loaded', sessions.length, 'chat sessions');
      } catch (err) {
        console.error('[Builder] Failed to load chat sessions:', err);
      } finally {
        setIsLoadingChatSessions(false);
      }
    };

    loadChatSessions();
  }, [isLoadingProject, project.id, project.active_chat_session_id]);

  // Load user settings (for studio name)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getUserSettings();
        setStudioName(settings.studio_name || 'My Studio');
      } catch (err) {
        console.error('[Builder] Failed to load settings:', err);
      }
    };
    loadSettings();
  }, []);

  // Debounced save to database
  const debouncedSaveFiles = useCallback(
    debounce((files: Record<string, string>) => {
      console.log('[Builder] Saving files to database...');
      saveProjectFiles(project.id, files).catch((err) => {
        console.error('[Builder] Failed to save files:', err);
      });
    }, 2000),
    [project.id]
  );

  // Upgrade to Three.js
  const upgradeToThreeJs = useCallback(async () => {
    if (hasThreeJs) return;

    addSystemMessage('Adding Three.js dependencies...');
    try {
      await runCommand('npm', [
        'install',
        '@react-three/fiber',
        '@react-three/drei',
        'three',
        '@types/three',
      ]);
      setHasThreeJs(true);
      await updateProject(project.id, { has_three_js: true });
      addSystemMessage('Three.js installed! You can now use 3D graphics.');
    } catch (err) {
      addSystemMessage(
        `Failed to install Three.js: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }, [hasThreeJs, runCommand, project.id]);

  // AI Chat hook with file generation callback
  const { messages, isGenerating, generationProgress, sendMessage: sendAiMessage, addSystemMessage, suggestions } =
    usePlayCraftChat({
      projectId: project.id,
      readFile: readProjectFile,
      readAllFiles,
      hasThreeJs,
      onNeedsThreeJs: upgradeToThreeJs,
      initialMessages: activeSessionMessages,
      runTypeCheck,
      runESLint,
      enableAutoFix: true,
      maxRetries: 3,
      voyageApiKey,
      previewErrors,
      clearPreviewErrors: () => {
        clearPreviewErrors();
        setPreviewErrors([]);
      },
      // Update project name when AI generates a game with a proper title in code
      onGameNameDetected: async (detectedName) => {
        // Always update if current name is placeholder or looks auto-generated
        const isPlaceholder = project.name === 'Untitled Game' || project.name === 'New Game';
        const looksAutoGenerated = /^(I want|Make|Create|Build|A |An |The )/i.test(project.name);

        if (isPlaceholder || looksAutoGenerated) {
          console.log('[Builder] Updating project name from code title:', detectedName);
          try {
            await updateProject(project.id, { name: detectedName });
            setProject(prev => ({ ...prev, name: detectedName }));
          } catch (err) {
            console.warn('[Builder] Failed to update project name:', err);
          }
        }
      },
      onFilesGenerated: async (files) => {
        // Update in-memory file state
        const updatedFiles = { ...projectFiles };
        const trackedFiles: Array<{ path: string; content: string }> = [];
        for (const file of files) {
          const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
          updatedFiles[normalizedPath] = file.content;
          trackedFiles.push({ path: normalizedPath, content: file.content });
        }
        setProjectFiles(updatedFiles);

        // Save immediately after AI generation (bypasses throttle - critical for persistence!)
        console.log('[Builder] Saving AI-generated files to database:', files.length, 'new files');
        try {
          await saveProjectFilesImmediate(project.id, updatedFiles);
          console.log('[Builder] AI-generated files saved successfully');
        } catch (err) {
          console.error('[Builder] Failed to save AI-generated files:', err);
        }

        // Check if WebContainer is ready to receive files
        if (projectReadyRef.current) {
          // Apply files to WebContainer immediately
          console.log('[Builder] WebContainer ready, applying files immediately');
          await applyGeneratedFiles(files, writeProjectFile);
          await refreshFileTree();

          // Track AI-generated files for live memory refresh
          trackBatchChanges(trackedFiles, 'ai-generation');

          // Clear preview errors when new code is generated
          clearPreviewErrors();
          setPreviewErrors([]);
        } else {
          // Queue files for later - will be applied when project is ready
          console.log('[Builder] WebContainer not ready, queuing', files.length, 'files for later');
          pendingFilesRef.current = [...pendingFilesRef.current, ...trackedFiles];
        }

        // Track AI-generated files for outcome feedback
        lastAiGenerationRef.current = {
          files: files.map(f => f.path.startsWith('/') ? f.path : `/${f.path}`),
          timestamp: Date.now(),
        };
      },
      // Handle edit mode (search/replace for small changes)
      onEditsGenerated: async (edits: FileEdit[], readFile: (path: string) => Promise<string | null>) => {
        console.log('[Builder] Applying', edits.length, 'edits in edit mode');

        const result = await applyGeneratedEdits(edits, readFile, writeProjectFile);
        await refreshFileTree();

        if (result.success) {
          // Update in-memory file state - need to re-read modified files
          const updatedFiles = { ...projectFiles };
          const modifiedPaths = new Set(edits.map(e => e.file.startsWith('/') ? e.file : `/${e.file}`));
          const trackedFiles: Array<{ path: string; content: string }> = [];

          for (const path of modifiedPaths) {
            const content = await readProjectFile(path);
            if (content) {
              updatedFiles[path] = content;
              trackedFiles.push({ path, content });
            }
          }
          setProjectFiles(updatedFiles);

          // Track AI-edited files for live memory refresh
          if (trackedFiles.length > 0) {
            trackBatchChanges(trackedFiles, 'ai-edit');
          }

          // Track AI-edited files for outcome feedback
          lastAiGenerationRef.current = {
            files: Array.from(modifiedPaths),
            timestamp: Date.now(),
          };

          // Clear preview errors when new code is generated
          clearPreviewErrors();
          setPreviewErrors([]);

          // Save immediately (bypasses throttle - critical for persistence!)
          console.log('[Builder] Saving edited files to database');
          try {
            await saveProjectFilesImmediate(project.id, updatedFiles);
            console.log('[Builder] Edited files saved successfully');
          } catch (err) {
            console.error('[Builder] Failed to save edited files:', err);
          }
        }

        return result;
      },
    });

  // Save conversation to active chat session when messages change
  useEffect(() => {
    const saveToSession = async () => {
      // Only save if we have at least one user message (actual chat interaction)
      const userMessages = messages.filter(m => m.role === 'user');
      if (userMessages.length === 0) return;

      const conversation: ConversationMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        if (activeChatSessionId) {
          // Update existing session
          await saveChatSessionMessages(activeChatSessionId, conversation);
        } else {
          // Create new session with first user message as title
          const title = generateSessionTitle(userMessages[0].content);

          const newSession = await createChatSession({
            project_id: project.id,
            title,
            messages: conversation,
          });

          setActiveChatSessionId(newSession.id);
          setChatSessions(prev => [newSession, ...prev]);

          // Update project's active session
          await updateProject(project.id, { active_chat_session_id: newSession.id });
          // Note: Project renaming happens in onGameNameDetected callback after code generation
        }
      } catch (err) {
        console.error('[Builder] Failed to save conversation to session:', err);
      }
    };

    saveToSession();
  }, [messages, project.id, activeChatSessionId]);

  // Start project - restore saved files or use fresh template
  const startProject = useCallback(async () => {
    // GUARD 1: Check if already setting up (synchronous ref check)
    if (isSettingUpRef.current) {
      console.log('[Builder] startProject early return - already setting up');
      return;
    }

    // GUARD 2: Check if setup already completed for this project
    if (setupCompletedForProjectRef.current === project.id) {
      console.log('[Builder] startProject early return - setup already completed for this project');
      if (!projectReady) {
        setProjectReady(true);
        projectReadyRef.current = true;
      }
      return;
    }

    // GUARD 3: Check React state (might be stale, but still useful)
    if (projectReady) {
      console.log('[Builder] startProject early return - project already ready');
      return;
    }

    // Try to restore existing project state (skip full setup if already running)
    if (tryRestoreProject(project.id)) {
      console.log('[Builder] Project restored from existing state - skipping full setup');
      setProjectReady(true);
      projectReadyRef.current = true;
      setupCompletedForProjectRef.current = project.id;
      await refreshFileTree();
      addSystemMessage('Welcome back! Your project is ready.');
      return;
    }

    console.log('[Builder] startProject called', { isSettingUp, projectReady });

    isSettingUpRef.current = true;
    setIsSettingUp(true);

    // Check if project has saved files
    const hasSavedFiles = Object.keys(project.files || {}).length > 0;
    console.log('[Builder] hasSavedFiles:', hasSavedFiles, 'files count:', Object.keys(project.files || {}).length);

    if (hasSavedFiles) {
      addSystemMessage('Restoring your project...');
    } else {
      addSystemMessage('Setting up your game development environment...');
    }

    try {
      // Only update status if not already published (preserve published state)
      if (project.status !== 'published') {
        await updateProjectStatus(project.id, 'building');
      }

      if (status === 'idle') {
        console.log('[Builder] Booting WebContainer...');
        await boot();
        console.log('[Builder] WebContainer booted');
      }

      if (hasSavedFiles) {
        // Restore saved files merged with template (to ensure package.json exists)
        console.log('[Builder] Restoring saved files:', Object.keys(project.files).length);

        // First mount the template to ensure all required files (package.json, etc.)
        await mountProject(viteStarterTemplate.files, project.id);
        console.log('[Builder] Template base mounted');

        // Then overlay the saved files (user modifications take precedence)
        const savedFilesTree = filesToFileSystemTree(project.files);
        await mountProject(savedFilesTree, project.id);
        console.log('[Builder] Saved files overlaid');
      } else {
        // Mount fresh template
        console.log('[Builder] Mounting fresh template');
        await mountProject(viteStarterTemplate.files, project.id);

        // Save template files to database immediately (not debounced)
        const templateFiles: Record<string, string> = {};
        const extractFiles = (tree: FileSystemTree, prefix = '') => {
          for (const [name, node] of Object.entries(tree)) {
            const path = prefix ? `${prefix}/${name}` : name;
            if ('file' in node) {
              templateFiles[`/${path}`] = typeof node.file.contents === 'string'
                ? node.file.contents
                : new TextDecoder().decode(node.file.contents);
            } else if ('directory' in node) {
              extractFiles(node.directory, path);
            }
          }
        };
        extractFiles(viteStarterTemplate.files);
        setProjectFiles(templateFiles);

        // Save immediately - this is important for persistence!
        console.log('[Builder] Saving template files to database:', Object.keys(templateFiles).length, 'files');
        try {
          await saveProjectFiles(project.id, templateFiles);
          console.log('[Builder] Template files saved successfully');
        } catch (err) {
          console.error('[Builder] Failed to save template files:', err);
        }
      }

      addSystemMessage('Setting up dependencies...');
      console.log('[Builder] Calling install...');
      await install(project.id);
      console.log('[Builder] Install complete, calling startDev...');
      addSystemMessage('Starting development server...');
      await startDev();
      console.log('[Builder] startDev complete');

      setProjectReady(true);
      projectReadyRef.current = true;
      setupCompletedForProjectRef.current = project.id; // Mark this project as set up
      isSettingUpRef.current = false;
      setIsSettingUp(false);
      // Only update status if not already published (preserve published state)
      if (project.status !== 'published') {
        await updateProjectStatus(project.id, 'ready');
      }
      console.log('[Builder] Project setup complete for:', project.id);

      if (hasSavedFiles) {
        addSystemMessage('Project restored! Continue building your game.');
      } else {
        addSystemMessage('Ready! Describe the game you want to build.');
      }
    } catch (err) {
      console.error('[Builder] startProject error:', err);
      isSettingUpRef.current = false;
      setIsSettingUp(false);
      // Only reset to draft if not published (preserve published state)
      if (project.status !== 'published') {
        await updateProjectStatus(project.id, 'draft');
      }
      addSystemMessage(
        `Error: ${err instanceof Error ? err.message : 'Something went wrong'}`
      );
    }
  }, [
    isSettingUp,
    projectReady,
    status,
    boot,
    mountProject,
    install,
    startDev,
    project.id,
    project.files,
    addSystemMessage,
    tryRestoreProject,
    refreshFileTree,
  ]);

  // Auto-start project on page load (restore saved files or use fresh template)
  useEffect(() => {
    // Wait for project to finish loading
    if (isLoadingProject) return;
    // Skip if initial prompt is provided (handled by separate effect)
    if (initialPrompt) return;
    // Skip if already setting up or ready
    if (isSettingUp || projectReady) return;

    const hasSavedFiles = Object.keys(project.files || {}).length > 0;
    console.log('[Builder] Auto-starting project with', hasSavedFiles ? Object.keys(project.files).length : 0, 'saved files');
    startProject();
  }, [isLoadingProject, project.files, isSettingUp, projectReady, initialPrompt, startProject]);

  // Handle initial prompt from home page - auto-start project AND send prompt in parallel
  // This runs both setup and AI generation concurrently for better perceived performance
  useEffect(() => {
    if (initialPrompt && !initialPromptProcessed && !isSettingUp && !projectReady) {
      setInitialPromptProcessed(true);

      // Start project setup (npm install, etc.)
      startProject();

      // Send prompt to Gemini immediately - don't wait for setup!
      // The AI generation (~30s) runs in parallel with npm install (~2min)
      // Files will be applied once both are complete
      const hasUserMessage = messages.some(m => m.role === 'user');
      if (!hasUserMessage) {
        console.log('[Builder] Sending initial prompt IN PARALLEL with setup:', initialPrompt.substring(0, 50) + '...');
        sendAiMessage(initialPrompt, undefined);
        // Clear the stored prompt after sending
        clearStoredPrompt();
        // Clear the state to prevent re-sending
        setInitialPrompt(null);
      }
    }
  }, [initialPrompt, initialPromptProcessed, isSettingUp, projectReady, messages, startProject, sendAiMessage]);

  // Apply pending files once WebContainer is ready
  useEffect(() => {
    const applyPendingFiles = async () => {
      if (projectReady && pendingFilesRef.current.length > 0) {
        console.log('[Builder] Applying', pendingFilesRef.current.length, 'pending files to WebContainer');
        const filesToApply = pendingFilesRef.current;
        pendingFilesRef.current = []; // Clear immediately to prevent duplicate processing

        try {
          // Apply each file to WebContainer
          for (const file of filesToApply) {
            await writeProjectFile(file.path, file.content);
          }
          await refreshFileTree();

          // Track for memory refresh
          trackBatchChanges(filesToApply, 'ai-generation');

          // Clear preview errors
          clearPreviewErrors();
          setPreviewErrors([]);

          console.log('[Builder] Pending files applied successfully');
        } catch (err) {
          console.error('[Builder] Failed to apply pending files:', err);
        }
      }
    };

    applyPendingFiles();
  }, [projectReady, writeProjectFile, refreshFileTree, trackBatchChanges, clearPreviewErrors]);

  // Load file content when selected
  useEffect(() => {
    if (!selectedFile) {
      setFileContent('');
      return;
    }

    const loadFile = async () => {
      setIsFileLoading(true);
      try {
        const content = await readProjectFile(selectedFile);
        setFileContent(content);
      } catch (err) {
        console.error('Failed to load file:', err);
        setFileContent('// Failed to load file');
      } finally {
        setIsFileLoading(false);
      }
    };

    loadFile();
  }, [selectedFile, readProjectFile]);

  // Handle file content changes
  const handleFileChange = useCallback(
    async (newContent: string) => {
      setFileContent(newContent);
      if (selectedFile) {
        try {
          // Save to WebContainer
          await writeProjectFile(selectedFile, newContent);

          // Update in-memory state and save to database
          const normalizedPath = selectedFile.startsWith('/') ? selectedFile : `/${selectedFile}`;
          setProjectFiles((prev) => {
            const updated = { ...prev, [normalizedPath]: newContent };
            debouncedSaveFiles(updated);
            return updated;
          });

          // Track file change for live memory refresh
          trackChange(normalizedPath, newContent, 'user-edit');

          // Track user edits to AI-generated files for outcome feedback
          if (lastAiGenerationRef.current) {
            const { files: aiFiles, timestamp } = lastAiGenerationRef.current;
            const timeSinceGeneration = Date.now() - timestamp;

            // If user edits an AI-generated file within 5 minutes, record feedback
            if (timeSinceGeneration < 5 * 60 * 1000 && aiFiles.includes(normalizedPath)) {
              console.log('[Builder] User edited AI-generated file:', normalizedPath);
              // Note: We don't have the outcomeId here directly - this is tracked via the service
              // The outcome was already recorded in usePlayCraftChat
              // We could add a callback from usePlayCraftChat to get the outcomeId
            }
          }
        } catch (err) {
          console.error('Failed to save file:', err);
        }
      }
    },
    [selectedFile, writeProjectFile, debouncedSaveFiles, trackChange]
  );

  // Handle send message from input
  const handleSendMessage = useCallback(async (mode: ChatMode, images?: ChatImage[]) => {
    if (!inputValue.trim() || isGenerating || isSettingUp) return;

    const prompt = inputValue.trim();
    setInputValue('');
    const chatOnly = mode === 'chat';

    // Convert ChatImage to ImageAttachment format
    const imageAttachments = images?.map(img => ({
      data: img.data,
      mimeType: img.mimeType,
      name: img.name,
    }));

    if (!projectReady) {
      await startProject();
      // Wait for project to be ready, then send message
      setTimeout(() => {
        sendAiMessage(prompt, selectedFile || undefined, chatOnly, imageAttachments);
      }, 100);
    } else {
      await sendAiMessage(prompt, selectedFile || undefined, chatOnly, imageAttachments);
    }
  }, [
    inputValue,
    isGenerating,
    isSettingUp,
    projectReady,
    startProject,
    sendAiMessage,
    selectedFile,
  ]);

  // Handle suggestion click - send the prompt directly
  const handleSuggestionClick = useCallback(async (prompt: string) => {
    if (isGenerating || isSettingUp) return;

    if (!projectReady) {
      await startProject();
      setTimeout(() => {
        sendAiMessage(prompt, selectedFile || undefined);
      }, 100);
    } else {
      await sendAiMessage(prompt, selectedFile || undefined);
    }
  }, [isGenerating, isSettingUp, projectReady, startProject, sendAiMessage, selectedFile]);

  // Handle file attachments from chat input - upload to asset system
  const handleAttachFiles = useCallback(async (files: File[]) => {
    if (!project.id || files.length === 0) return;

    try {
      await uploadAssets.mutateAsync({
        userId: user.id,
        projectId: project.id,
        files,
        getInput: (file) => ({
          name: file.name,
          displayName: file.name.replace(/\.[^.]+$/, ''),
        }),
      });
      addSystemMessage(`Uploaded ${files.length} file${files.length > 1 ? 's' : ''} to project assets.`);
    } catch (err) {
      console.error('Failed to upload files:', err);
      addSystemMessage(`Failed to upload files: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [project.id, user.id, uploadAssets, addSystemMessage]);

  // Show file in editor when selected from file tree
  const handleSelectFile = useCallback((file: string | null) => {
    setSelectedFile(file);
  }, []);

  // Handle refresh from header
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Handle publish - build, save files, then open modal
  const handlePublish = useCallback(async () => {
    try {
      // Step 1: Save source files to Storage
      const currentFiles = await readAllFiles();
      if (Object.keys(currentFiles).length > 0) {
        console.log('[Builder] Saving', Object.keys(currentFiles).length, 'source files before publish');
        await saveProjectFilesImmediate(project.id, currentFiles);
      }

      // Step 2: Run production build in WebContainer
      console.log('[Builder] Running production build...');
      const buildExitCode = await runCommand('npm', ['run', 'build']);

      if (buildExitCode === 0) {
        // Step 3: Read and upload dist/ files using dedicated function
        console.log('[Builder] Build succeeded, reading dist files...');
        const distFiles = await readDistFiles();

        if (Object.keys(distFiles).length > 0) {
          console.log('[Builder] Uploading', Object.keys(distFiles).length, 'dist files');
          await saveProjectFilesImmediate(project.id, distFiles);
        } else {
          console.warn('[Builder] No dist files found after build');
        }
      } else {
        console.warn('[Builder] Build failed with exit code:', buildExitCode);
        // Continue anyway - publish-runner will try its own build or show placeholder
      }
    } catch (err) {
      console.error('[Builder] Failed to prepare for publish:', err);
      // Continue to publish modal anyway
    }
    setShowPublishModal(true);
  }, [project.id, readAllFiles, readDistFiles, runCommand]);

  // Handle add credits (placeholder)
  const handleAddCredits = useCallback(() => {
    console.log('Add credits clicked - TODO: Implement credits flow');
  }, []);

  // Handle dismiss credits
  const handleDismissCredits = useCallback(() => {
    setCreditsDismissed(true);
  }, []);

  // Handle selecting a chat session from history
  const handleSelectChatSession = useCallback(async (session: ChatSession) => {
    console.log('[Builder] Switching to chat session:', session.id, session.title);
    setActiveChatSessionId(session.id);

    // Update project's active session
    await updateProject(project.id, { active_chat_session_id: session.id });

    // Load session messages into chat
    if (session.messages && session.messages.length > 0) {
      console.log('[Builder] Loading', session.messages.length, 'messages from session');
      setActiveSessionMessages(session.messages);
    } else {
      setActiveSessionMessages([]);
    }
  }, [project.id]);

  // Handle creating a new chat session
  const handleNewChat = useCallback(async () => {
    console.log('[Builder] Creating new chat session');
    // Clear the active session - a new one will be created when the first message is sent
    setActiveChatSessionId(null);

    // Update project to clear active session
    await updateProject(project.id, { active_chat_session_id: null });

    // Clear messages to start fresh
    setActiveSessionMessages([]);
  }, [project.id]);

  // Project dropdown handlers
  const handleRenameProject = useCallback(() => {
    const newName = prompt('Enter new project name:', project.name);
    if (newName && newName !== project.name) {
      updateProject(project.id, { name: newName })
        .then(() => {
          setProject(prev => ({ ...prev, name: newName }));
        })
        .catch(err => {
          console.error('[Builder] Failed to rename project:', err);
        });
    }
  }, [project.id, project.name]);

  const handleStarProject = useCallback(() => {
    const newStarred = !project.is_starred;
    updateProject(project.id, { is_starred: newStarred })
      .then(() => {
        setProject(prev => ({ ...prev, is_starred: newStarred }));
      })
      .catch(err => {
        console.error('[Builder] Failed to star/unstar project:', err);
      });
  }, [project.id, project.is_starred]);

  const handleRemixProject = useCallback(() => {
    // TODO: Implement remix (duplicate) project functionality
    console.log('[Builder] Remix project clicked');
  }, []);

  // Copy chat to clipboard - must be before early return
  const handleCopyChat = useCallback(() => {
    const chatText = messages
      .map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(chatText);
  }, [messages]);

  // Handle selecting a chat session and switching to chat tab
  const handleSelectSessionAndSwitchTab = useCallback((session: ChatSession) => {
    handleSelectChatSession(session);
    setChatPanelTab('chat');
  }, [handleSelectChatSession]);

  // Handle new chat and switching to chat tab
  const handleNewChatAndSwitchTab = useCallback(() => {
    handleNewChat();
    setChatPanelTab('chat');
  }, [handleNewChat]);

  // Handle suggestion click in chat
  const handleChatSuggestionClick = useCallback((prompt: string) => {
    setInputValue(prompt);
  }, []);

  // Show loading while fetching fresh project data or setting up
  if (isLoadingProject || (isSettingUp && !projectReady)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md text-center">
          {/* Loading spinner */}
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-3 border-accent/30 border-t-accent" />

          {/* Status message */}
          <h2 className="mb-2 text-xl font-semibold text-content">
            {isLoadingProject ? 'Loading project...' : 'Setting up your environment...'}
          </h2>

          {/* Show user's prompt if they just submitted one */}
          {initialPrompt && (
            <div className="mt-6 rounded-xl border border-border-muted bg-surface-elevated p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-content-subtle">
                Your request
              </p>
              <p className="text-sm text-content-muted line-clamp-3">
                "{initialPrompt}"
              </p>
              <p className="mt-3 text-xs text-accent">
                Will be processed once setup is complete...
              </p>
            </div>
          )}

          {/* Progress hints */}
          {isSettingUp && (
            <div className="mt-6 space-y-2 text-sm text-content-subtle">
              <p className={status === 'booting' ? 'text-gradient-gaming-glow' : ''}>
                {status === 'booting' ? '▶' : '✓'} Starting container...
              </p>
              <p className={status === 'installing' ? 'text-gradient-gaming-glow' : status === 'running' ? '' : 'opacity-50'}>
                {status === 'installing' ? '▶' : status === 'running' || status === 'ready' ? '✓' : '○'} Installing dependencies...
              </p>
              <p className={status === 'running' ? 'text-gradient-gaming-glow' : 'opacity-50'}>
                {status === 'running' ? '▶' : '○'} Starting dev server...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Left Panel Content - Chat section with its own header
  const leftPanelContent = (
    <div className="flex h-full flex-col bg-surface-elevated">
      {/* Chat Header */}
      <ChatHeader
        projectName={project.name}
        studioName={studioName}
        creditsRemaining={50}
        totalCredits={50}
        showProjectDropdown={showProjectDropdown}
        onToggleProjectDropdown={() => setShowProjectDropdown(!showProjectDropdown)}
        onGoToDashboard={onBackToHome}
        onOpenSettings={() => console.log('Open settings')}
        onAddCredits={() => console.log('Add credits')}
        onRenameProject={handleRenameProject}
        onStarProject={handleStarProject}
        onRemixProject={handleRemixProject}
        isProjectStarred={project.is_starred}
        onShowHistory={() => setChatPanelTab(chatPanelTab === 'history' ? 'chat' : 'history')}
        onCopyChat={handleCopyChat}
      />

      {/* Tab Switcher */}
      <div className="flex shrink-0 border-b border-border-muted">
        <button
          onClick={() => setChatPanelTab('chat')}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            chatPanelTab === 'chat'
              ? 'border-b-2 border-accent text-content'
              : 'text-content-muted hover:text-content'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setChatPanelTab('history')}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            chatPanelTab === 'history'
              ? 'border-b-2 border-accent text-content'
              : 'text-content-muted hover:text-content'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setChatPanelTab('assets')}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            chatPanelTab === 'assets'
              ? 'border-b-2 border-accent text-content'
              : 'text-content-muted hover:text-content'
          }`}
        >
          <Image className="h-3.5 w-3.5" />
          Assets
        </button>
      </div>

      {/* Tab Content */}
      {chatPanelTab === 'chat' ? (
        <>
          {/* Chat messages */}
          <ChatMessages
            messages={messages}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            projectReady={projectReady}
            isSettingUp={isSettingUp}
            onSuggestionClick={handleChatSuggestionClick}
          />

          {/* Credits panel */}
          <CreditsPanel
            creditsRemaining={50}
            onAddCredits={handleAddCredits}
            onDismiss={handleDismissCredits}
            isDismissed={creditsDismissed}
          />

          {/* Chat input */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            disabled={isGenerating}
            onAttachFiles={handleAttachFiles}
          />

          {/* Suggestion chips */}
          <div className="px-4 pt-2 pb-3">
            <SuggestionChips
              suggestions={suggestions}
              onSelect={handleSuggestionClick}
              disabled={isGenerating}
            />
          </div>
        </>
      ) : chatPanelTab === 'history' ? (
        /* History tab - Chat sessions list */
        <div className="flex-1 overflow-auto">
          <ChatHistory
            sessions={chatSessions}
            activeSessionId={activeChatSessionId}
            onSelectSession={handleSelectSessionAndSwitchTab}
            onNewChat={handleNewChatAndSwitchTab}
            isLoading={isLoadingChatSessions}
          />
        </div>
      ) : (
        /* Assets tab - Asset management panel */
        <AssetPanel
          projectId={project.id}
          userId={user.id}
        />
      )}
    </div>
  );

  // Right Panel Content - Preview/Code section with its own header
  const rightPanelContent = (
    <div className="flex h-full flex-col bg-surface">
      {/* Preview Header */}
      <PreviewHeader
        user={user}
        status={status}
        onShare={() => console.log('Share clicked')}
        onPublish={handlePublish}
        onUpgrade={() => console.log('Upgrade clicked')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
        onRefresh={handleRefresh}
        isRefreshing={status === 'installing' || status === 'booting'}
        isPublished={project.status === 'published'}
        publishedUrl={project.published_url}
      />

      {/* Main Content */}
      {viewMode === 'code' ? (
        /* Code mode: File Browser + Editor */
        <div className="flex flex-1 overflow-hidden">
          <FileBrowserPanel
            files={fileTree}
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
          />
          <EditorPanel
            selectedFile={selectedFile}
            fileContent={fileContent}
            isLoading={isFileLoading}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        /* Preview mode */
        <div className="flex-1 overflow-hidden">
          <Preview
            url={previewUrl}
            isLoading={status === 'installing' || status === 'booting'}
            deviceMode={deviceMode}
            refreshKey={refreshKey}
          />
        </div>
      )}

      {/* Bottom Bar - Status + Error indicator */}
      <div className="flex h-10 shrink-0 items-center justify-between border-t border-border-muted bg-surface-elevated px-4">
        <div className="flex items-center gap-2">
          {/* Preview errors indicator */}
          {previewErrors.length > 0 && (
            <div
              className="flex items-center gap-1.5 rounded-lg bg-error/20 px-2 py-1 text-xs text-error cursor-pointer hover:bg-error/30 transition-all"
              onClick={() => {
                // Show the most recent error in console for now
                const latestError = previewErrors[previewErrors.length - 1];
                console.error('[Preview Error Details]', latestError);
              }}
              title={previewErrors[previewErrors.length - 1]?.message || 'Runtime errors detected'}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {previewErrors.length} error{previewErrors.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="text-xs text-content-subtle">
          {status === 'running' ? 'Server running' : status}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface">
      {/* Resizable split layout - Chat on left, Preview on right */}
      <ResizablePanels
        leftPanel={leftPanelContent}
        rightPanel={rightPanelContent}
        defaultLeftWidth={420}
        minLeftWidth={320}
        maxLeftWidth={600}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        projectId={project.id}
        projectName={project.name}
        isAlreadyPublished={project.status === 'published'}
        existingUrl={project.published_url}
        onPublishSuccess={(url) => {
          // Update local project state with published info
          setProject(prev => ({
            ...prev,
            status: 'published',
            published_url: url,
            published_at: new Date().toISOString(),
          }));
        }}
      />
    </div>
  );
}
