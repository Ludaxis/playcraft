import { useState, useEffect } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { getSupabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import { BuilderPage } from './pages/Builder';
import { LandingPage } from './pages/Landing';
import { HomePage } from './pages/Home';
import { FeedbackPage } from './pages/Feedback';
import { PlayPage } from './pages/Play';
import { ErrorBoundary } from './components';
import { createProject, getProject, type PlayCraftProject } from './lib/projectService';

type View = 'landing' | 'home' | 'builder';

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentProject, setCurrentProject] = useState<PlayCraftProject | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle /builder/:projectId route - load project from URL on page refresh
  useEffect(() => {
    if (!user || loading) return;

    const builderMatch = location.pathname.match(/^\/builder\/([a-f0-9-]+)$/i);
    if (builderMatch && !currentProject) {
      const projectId = builderMatch[1];
      setLoadingProject(true);

      console.log('[App] Loading project from URL:', projectId);
      getProject(projectId)
        .then(project => {
          if (project) {
            console.log('[App] Loaded project:', project.name, 'with', Object.keys(project.files || {}).length, 'files');
            setCurrentProject(project);
            setCurrentView('builder');
          } else {
            console.warn('[App] Project not found:', projectId);
            navigate('/');
          }
        })
        .catch(err => {
          console.error('[App] Failed to load project:', err);
          navigate('/');
        })
        .finally(() => {
          setLoadingProject(false);
        });
    }
  }, [user, loading, location.pathname, currentProject, navigate]);

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
    setCurrentView('landing');
    navigate('/');
  };

  const handleSelectProject = (project: PlayCraftProject) => {
    setCurrentProject(project);
    setInitialPrompt(null); // Existing project, no initial prompt
    setCurrentView('builder');
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
      const project = await createProject({ name: projectName });

      // Save initial prompt to localStorage so it survives page refresh
      localStorage.setItem(`playcraft_initial_prompt_${project.id}`, prompt);

      setCurrentProject(project);
      setInitialPrompt(prompt); // Pass the initial prompt to builder
      setCurrentView('builder');
      navigate(`/builder/${project.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleBackToHome = () => {
    setCurrentProject(null);
    setInitialPrompt(null);
    setCurrentView('home');
    navigate('/');
  };

  if (loading || loadingProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          {loadingProject && (
            <p className="text-sm text-gray-400">Loading project...</p>
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

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage onSignIn={handleSignIn} />;
  }

  // Show builder for selected project or /builder/:projectId route
  if ((currentView === 'builder' && currentProject) ||
      (location.pathname.startsWith('/builder/') && currentProject)) {
    return (
      <BuilderPage
        user={user}
        project={currentProject}
        initialPrompt={initialPrompt}
        onBackToHome={handleBackToHome}
      />
    );
  }

  // Show home page (default for authenticated users)
  return (
    <HomePage
      user={user}
      onSignOut={handleSignOut}
      onSelectProject={handleSelectProject}
      onStartNewProject={handleStartNewProject}
    />
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
