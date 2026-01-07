import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { AuthModal, Logo, LogoIcon } from '../components';

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

function useTypewriter(phrases: string[], typingSpeed = 80, deletingSpeed = 40, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      } else {
        const deleteTimer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(deleteTimer);
      }
    } else {
      if (displayText === currentPhrase) {
        setIsPaused(true);
      } else {
        const typeTimer = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(typeTimer);
      }
    }
  }, [displayText, phraseIndex, isDeleting, isPaused, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return displayText;
}

export function LandingPage({ onSignIn }: LandingPageProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const animatedText = useTypewriter(TYPING_SUGGESTIONS);

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    if (!inputValue) {
      setIsFocused(false);
    }
  };

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
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
            <div className="rounded-2xl bg-white/95 shadow-2xl overflow-hidden">
              {/* Input Area */}
              <div className="p-4 relative">
                {/* Animated placeholder overlay */}
                {!isFocused && !inputValue && (
                  <div className="absolute inset-0 p-4 pointer-events-none text-base text-gray-400">
                    <span>{STATIC_PREFIX}</span>
                    <span className="text-gray-600">{animatedText}</span>
                    <span className="inline-block w-0.5 h-5 bg-gray-400 ml-0.5 animate-pulse align-middle" />
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  placeholder={isFocused ? "Describe what you want to build..." : ""}
                  className="w-full resize-none bg-transparent text-gray-800 placeholder-gray-400 outline-none text-base min-h-[60px] relative z-10"
                  rows={2}
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-end px-4 py-3 border-t border-gray-100">
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              </div>
            </div>
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
