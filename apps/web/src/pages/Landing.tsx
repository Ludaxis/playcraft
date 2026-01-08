import { useState } from 'react';
import { AuthModal, Logo, LogoIcon } from '../components';
import { ChatInput } from '../components/builder/ChatInput';

const TYPING_SUGGESTIONS = [
  'puzzle game with numbers',
  'classic snake game',
  'block blast style game',
  'match 3 game with emojis',
  'space invaders clone',
  'flappy bird style game',
  'word guessing game',
  'memory card matching game',
];

const STATIC_PREFIX = 'Hey PlayCraft create a ';

interface LandingPageProps {
  onSignIn: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function LandingPage({ onSignIn }: LandingPageProps) {
  const [inputValue, setInputValue] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const handleShowSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleShowSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    // Store the prompt in localStorage before showing auth modal
    localStorage.setItem('playcraft_pending_prompt', inputValue.trim());
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
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
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Logo size={32} showText textClassName="text-white" />

          {/* Nav Links - disabled for now */}
          {/* <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Solutions</a>
            <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Enterprise</a>
            <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Pricing</a>
            <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Community</a>
            <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Discover</a>
          </nav> */}

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShowSignIn}
              className="px-4 py-2 text-sm text-white/90 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={handleShowSignUp}
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20">
        <div className="w-full max-w-3xl text-center">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
            Build something
            <br />
            <span className="text-gradient-gaming">PlayCraft</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 mb-12">
            Create games and apps by chatting with AI
          </p>

          {/* Chat Input Box */}
          <div className="relative mx-auto max-w-2xl">
            <ChatInput
              variant="landing"
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSubmit}
              placeholder="Describe what you want to build..."
              animatedPhrases={TYPING_SUGGESTIONS}
              staticPrefix={STATIC_PREFIX}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6">
        <div className="mx-auto max-w-7xl flex items-center justify-center">
          <div className="flex items-center gap-2 text-white/50">
            <LogoIcon size={16} className="opacity-50" />
            <span className="text-sm">Made with PlayCraft</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  );
}
