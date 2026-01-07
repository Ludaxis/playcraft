import { useState } from 'react';
import { X } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { LogoIcon } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
}

// Google icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
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

export function AuthModal({ isOpen, onClose, mode: initialMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
    // For now, just show that email auth would go here
    // Could implement magic link or redirect to full auth page
    window.location.href = `/auth?mode=${mode}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="mb-6">
          <LogoIcon size={56} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'signup' ? 'Start Building.' : 'Welcome back.'}
        </h2>
        <p className="mb-8 text-lg text-gray-400">
          {mode === 'signup' ? 'Create free account' : 'Log in to continue'}
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* OAuth buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="relative flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-800 transition-all hover:bg-gray-50 disabled:opacity-50"
          >
            <GoogleIcon className="absolute left-4 h-5 w-5" />
            Continue with Google
            <span className="absolute right-3 rounded-full border border-teal-500 px-2.5 py-0.5 text-xs font-medium text-teal-600">
              Last used
            </span>
          </button>

          <button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className="relative flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3.5 text-sm font-medium text-gray-800 transition-all hover:bg-gray-200 disabled:opacity-50"
          >
            <GitHubIcon className="absolute left-4 h-5 w-5" />
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Email button */}
        <button
          onClick={handleEmailContinue}
          disabled={isLoading}
          className="w-full rounded-lg bg-gray-900 py-3.5 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50"
        >
          Continue with email
        </button>

        {/* Terms */}
        <p className="mt-6 text-center text-sm text-gray-500">
          By continuing, you agree to the{' '}
          <a href="/terms" className="underline hover:text-gray-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-gray-700">
            Privacy Policy
          </a>
          .
        </p>

        {/* Toggle mode */}
        <p className="mt-4 text-center text-sm text-gray-500">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="font-medium text-gray-900 underline hover:text-teal-600"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="font-medium text-gray-900 underline hover:text-teal-600"
              >
                Create your account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
