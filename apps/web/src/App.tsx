import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { getSupabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import { BuilderPage } from './pages/Builder';
import { LandingPage } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { HomePage } from './pages/Home';
import { FeedbackPage } from './pages/Feedback';
import { PlayPage } from './pages/Play';
import { ErrorBoundary } from './components';
import { createProject, getProject, type PlayCraftProject } from './lib/projectService';
import { useAppStore } from './stores/appStore';

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<PlayCraftProject | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const workspaceId = useAppStore((state) => state.workspaceId);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const LAST_PROJECT_CACHE_KEY = 'playcraft_last_project_id';

  // Track if we're on the builder page (derived from URL, single source of truth)
  const isOnBuilder = location.pathname.startsWith('/builder/');

  // Ref to track if we've already loaded project for current URL
  const loadedProjectIdRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Check for pending prompt after sign-in
      if (session?.user) {
        const storedPrompt = localStorage.getItem('playcraft_pending_prompt');
        if (storedPrompt) {
          setPendingPrompt(storedPrompt);
          localStorage.removeItem('playcraft_pending_prompt');
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // Check for pending prompt after sign-in
      if (session?.user) {
        const storedPrompt = localStorage.getItem('playcraft_pending_prompt');
        if (storedPrompt) {
          setPendingPrompt(storedPrompt);
          localStorage.removeItem('playcraft_pending_prompt');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle /builder/:projectId route - load project from URL
  useEffect(() => {
    if (!user || loading) return;

    const builderMatch = location.pathname.match(/^\/builder\/([a-f0-9-]+)$/i);
    if (builderMatch) {
      const projectId = builderMatch[1];

      // Skip if already loaded this project or currently loading
      if (loadedProjectIdRef.current === projectId || loadingProject) {
        return;
      }

      // Skip if we already have this project in state
      if (currentProject?.id === projectId) {
        loadedProjectIdRef.current = projectId;
        return;
      }

      loadedProjectIdRef.current = projectId;
      setLoadingProject(true);

      console.log('[App] Loading project from URL:', projectId);
      getProject(projectId)
        .then(project => {
          if (project) {
            console.log('[App] Loaded project:', project.name, 'with', Object.keys(project.files || {}).length, 'files');
            setCurrentProject(project);
            localStorage.setItem(LAST_PROJECT_CACHE_KEY, project.id);
          } else {
            console.warn('[App] Project not found:', projectId);
            loadedProjectIdRef.current = null;
            localStorage.removeItem(LAST_PROJECT_CACHE_KEY);
            navigate('/');
          }
        })
        .catch(err => {
          console.error('[App] Failed to load project:', err);
          loadedProjectIdRef.current = null;
          localStorage.removeItem(LAST_PROJECT_CACHE_KEY);
          navigate('/');
        })
        .finally(() => {
          setLoadingProject(false);
        });
    }
  }, [user, loading, location.pathname, currentProject?.id, loadingProject, navigate]);

  // Fast-path: if on home and idle, resume last project from cache
  useEffect(() => {
    if (!user || loading || loadingProject || currentProject || isOnBuilder) return;
    const cachedId = localStorage.getItem(LAST_PROJECT_CACHE_KEY);
    if (cachedId) {
      console.log('[App] Restoring last project from cache:', cachedId);
      navigate(`/builder/${cachedId}`);
    }
  }, [user, loading, loadingProject, currentProject, isOnBuilder, navigate]);

  const handleSignIn = async () => {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setCurrentProject(null);
    setInitialPrompt(null);
    localStorage.removeItem(LAST_PROJECT_CACHE_KEY);
    loadedProjectIdRef.current = null;
    navigate('/');
  };

  const handleSelectProject = (project: PlayCraftProject) => {
    // Check if selecting the same project - just navigate, don't reset state
    if (currentProject?.id === project.id) {
      console.log('[App] Returning to same project:', project.id);
      navigate(`/builder/${project.id}`);
      return;
    }

    console.log('[App] Switching to project:', project.id);
    setCurrentProject(project);
    setInitialPrompt(null);
    loadedProjectIdRef.current = project.id;
    localStorage.setItem(LAST_PROJECT_CACHE_KEY, project.id);
    navigate(`/builder/${project.id}`);
  };

  const handleStartNewProject = async (prompt: string) => {
    // Generate a project name from the prompt (first few words)
    const words = prompt.split(' ').slice(0, 4);
    const projectName = words.length > 0
      ? words.join(' ').substring(0, 50) + (prompt.length > 50 ? '...' : '')
      : 'New Game';

    try {
      // Auto-create project
      const project = await createProject({
        name: projectName,
        workspace_id: workspaceId ?? null,
        reuseDraft: true,
      });

      // Save initial prompt to localStorage so it survives page refresh
      localStorage.setItem(`playcraft_initial_prompt_${project.id}`, prompt);

      setCurrentProject(project);
      setInitialPrompt(prompt);
      loadedProjectIdRef.current = project.id;
      localStorage.setItem(LAST_PROJECT_CACHE_KEY, project.id);
      navigate(`/builder/${project.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleBackToHome = () => {
    // DON'T clear currentProject - keep it so we can return quickly
    // Just navigate to home, Builder will be hidden but kept mounted
    setInitialPrompt(null);
    navigate('/');
  };

  if (loading || loadingProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          {loadingProject && (
            <p className="text-sm text-content-secondary">Loading project...</p>
          )}
        </div>
      </div>
    );
  }

  // Handle /play/:gameId route - PUBLIC, no auth required
  if (location.pathname.startsWith('/play/')) {
    const gameId = location.pathname.split('/play/')[1];
    if (gameId) {
      return <PlayPage gameId={gameId} />;
    }
  }

  // Handle /feedback route - accessible to authenticated users
  if (location.pathname === '/feedback') {
    if (!user) {
      return <LandingPage onSignIn={handleSignIn} />;
    }
    return <FeedbackPage />;
  }

  // Handle /auth route - full page sign in/sign up
  if (location.pathname === '/auth' || location.pathname.startsWith('/auth')) {
    if (user) {
      // Already logged in, redirect to home
      navigate('/');
      return null;
    }
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') === 'signin' ? 'signin' : 'signup';
    return <AuthPage mode={mode} />;
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage onSignIn={handleSignIn} />;
  }

  // IMPORTANT: Render both HomePage and BuilderPage, control visibility with CSS
  // This prevents Builder from unmounting when navigating to home
  return (
    <>
      {/* Home page - shown when not on builder route */}
      <div style={{ display: isOnBuilder ? 'none' : 'block' }}>
        <HomePage
          user={user}
          onSignOut={handleSignOut}
          onSelectProject={handleSelectProject}
          onStartNewProject={handleStartNewProject}
          pendingPrompt={pendingPrompt}
          onPendingPromptUsed={() => setPendingPrompt(null)}
        />
      </div>

      {/* Builder page - kept mounted, hidden when on home */}
      {currentProject && (
        <div style={{ display: isOnBuilder ? 'block' : 'none' }}>
          <BuilderPage
            key={currentProject.id} // Only remount when project ID changes
            user={user}
            project={currentProject}
            initialPrompt={initialPrompt}
            onBackToHome={handleBackToHome}
          />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
