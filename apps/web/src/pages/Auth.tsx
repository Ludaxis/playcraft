import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { LogoIcon } from '../components/Logo';

type AuthMode = 'signin' | 'signup';

interface AuthPageProps {
  mode?: AuthMode;
  onSuccess?: () => void;
}

// Google icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// GitHub icon component
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function AuthPage({ mode: initialMode = 'signup', onSuccess: _onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
    } catch {
      setError('Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
        },
      });
    } catch {
      setError('Failed to sign in with GitHub');
      setIsLoading(false);
    }
  };

  const handleEmailContinue = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch {
      setError('Failed to send login link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 bg-surface">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <LogoIcon size={48} />
          </div>

          {/* Title */}
          <h1 className="mb-2 text-3xl font-bold text-content">
            {mode === 'signup' ? 'Create your account' : 'Log in'}
          </h1>
          {mode === 'signup' && (
            <p className="mb-8 text-content-muted">Start building games with AI</p>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="relative flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-gray-800 transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
              <span className="absolute right-3 rounded bg-teal-500 px-2 py-0.5 text-xs text-white">
                Last used
              </span>
            </button>

            <button
              onClick={handleGitHubSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-gray-800 transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              <GitHubIcon className="h-5 w-5" />
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-content-muted">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email form */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-content">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
                placeholder="Email"
                className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-3 text-content placeholder-content-muted outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* Terms */}
            <p className="text-sm text-content-muted">
              By continuing, you agree to the{' '}
              <a href="/terms" className="underline hover:text-content">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-content">
                Privacy Policy
              </a>
              .
            </p>

            <button
              onClick={handleEmailContinue}
              disabled={isLoading || !email.trim()}
              className="w-full rounded-lg bg-content py-3 text-sm font-medium text-surface transition-all hover:bg-content/90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>

          {/* Toggle mode */}
          <p className="mt-6 text-center text-sm text-content-muted">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="font-medium text-content underline hover:text-teal-400"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-medium text-content underline hover:text-teal-400"
                >
                  Create your account
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right side - Gradient preview */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(6, 182, 212, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 30% 80%, rgba(236, 72, 153, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 70% 80%, rgba(236, 72, 153, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 80% 40% at 50% 60%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, #1e3a5f 0%, #2d1f4f 30%, #4a1e5c 50%, #6b2a6b 70%, #1a3a5a 100%)
          `,
        }}
      >
        {/* Preview chat box */}
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white/95 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <span className="text-gray-500">Hey PlayCraft create a puzzle game...</span>
              <button className="p-2 bg-teal-500 text-white rounded-lg">
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
