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
import { PlaygroundPage } from './pages/Playground';
import { PitchPage } from './pages/Pitch';
import { FAQPage } from './pages/FAQ';
import { HowItWorksPage } from './pages/HowItWorks';
import { PitchFaPage } from './pages/PitchFa';
import { PitchArPage } from './pages/PitchAr';
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

  // NOTE: Removed auto-redirect to last project on home page load.
  // Users should explicitly navigate to projects from the home page.
  // The cache is still used when loading a project by ID from URL.

  // Reset loadingProject if we're not on a builder route (prevents stuck loading state)
  useEffect(() => {
    if (!isOnBuilder && loadingProject) {
      console.log('[App] Resetting stuck loadingProject state');
      setLoadingProject(false);
      loadedProjectIdRef.current = null;
    }
  }, [isOnBuilder, loadingProject]);

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
    try {
      // Create project with placeholder name - AI will generate proper name in Builder
      const project = await createProject({
        name: 'Untitled Game',
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

  // Show loading spinner for auth check or when loading project on builder route
  if (loading || (loadingProject && isOnBuilder)) {
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

  // Handle /pitch route - PUBLIC, no auth required (investor pitch deck)
  if (location.pathname === '/pitch') {
    return <PitchPage />;
  }

  // Handle /pitch-fa route - PUBLIC, Persian/Farsi version
  if (location.pathname === '/pitch-fa') {
    return <PitchFaPage />;
  }

  // Handle /pitch-ar route - PUBLIC, Arabic version
  if (location.pathname === '/pitch-ar') {
    return <PitchArPage />;
  }

  // Handle /play/:gameId route - PUBLIC, no auth required
  if (location.pathname.startsWith('/play/')) {
    const gameId = location.pathname.split('/play/')[1];
    if (gameId) {
      return <PlayPage gameId={gameId} />;
    }
  }

  // Handle /playground route - PUBLIC, no auth required
  if (location.pathname === '/playground') {
    return <PlaygroundPage />;
  }

  // Handle /faq route - PUBLIC, SEO optimized FAQ page
  if (location.pathname === '/faq') {
    return <FAQPage />;
  }

  // Handle /how-it-works route - PUBLIC, SEO optimized How-To page
  if (location.pathname === '/how-it-works') {
    return <HowItWorksPage />;
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
