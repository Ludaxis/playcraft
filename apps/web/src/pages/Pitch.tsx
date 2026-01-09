import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { Logo } from '../components';
import {
  Gamepad2,
  Zap,
  Users,
  Target,
  TrendingUp,
  Shield,
  DollarSign,
  Rocket,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Clock,
  Code,
  Play,
  BarChart3,
  Globe,
  Building2,
  MessageSquare,
  Printer,
  Mail,
  Linkedin,
} from 'lucide-react';

// Slide data configuration
const SLIDES = [
  { id: 'title', label: 'Title' },
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
  { id: 'why-now', label: 'Why Now' },
  { id: 'product', label: 'Product' },
  { id: 'moat', label: 'Moat' },
  { id: 'competition', label: 'Competition' },
  { id: 'business-model', label: 'Business' },
  { id: 'traction', label: 'Traction' },
  { id: 'go-to-market', label: 'GTM' },
  { id: 'team', label: 'Team' },
  { id: 'ask', label: 'The Ask' },
  { id: 'thank-you', label: 'Thank You' },
];

// Competitor data from competitive-analysis-2025.md
const COMPETITORS = [
  { name: 'Lovable', focus: 'General web apps', gaming: 'Limited', color: '#ec4899' },
  { name: 'Bolt.new', focus: 'Full-stack apps', gaming: 'Limited', color: '#3b82f6' },
  { name: 'Replit', focus: 'Dev IDE + AI', gaming: 'Moderate', color: '#f59e0b' },
  { name: 'Base44', focus: 'Business apps', gaming: 'Very Limited', color: '#8b5cf6' },
];

// Pricing tiers from PRICING_STRATEGY.md (used in business model slide)
const PRICING_TIERS = [
  { name: 'Free', price: '$0', build: '25', runtime: '500', highlight: false },
  { name: 'Starter', price: '$12', build: '100', runtime: '5K', highlight: false },
  { name: 'Pro', price: '$29', build: '350', runtime: '25K', highlight: true },
  { name: 'Business', price: '$59', build: '1K', runtime: '100K', highlight: false },
] as const;
void PRICING_TIERS; // Exported for reference, will be used when pricing cards are added

export function PitchPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimating = useRef(false);

  // Navigate to a specific slide with GSAP animation
  const goToSlide = useCallback((index: number) => {
    if (isAnimating.current || index === currentSlide || index < 0 || index >= SLIDES.length) {
      return;
    }

    isAnimating.current = true;
    const currentEl = slideRefs.current[currentSlide];
    const nextEl = slideRefs.current[index];

    if (!currentEl || !nextEl) {
      isAnimating.current = false;
      return;
    }

    // Kill any existing animations on these elements
    gsap.killTweensOf(currentEl);
    gsap.killTweensOf(nextEl);

    // Simple crossfade transition
    gsap.set(nextEl, { opacity: 0, display: 'flex' });

    gsap.to(currentEl, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(currentEl, { display: 'none' });
      },
    });

    gsap.to(nextEl, {
      opacity: 1,
      duration: 0.4,
      delay: 0.15,
      ease: 'power2.out',
      onComplete: () => {
        setCurrentSlide(index);
        isAnimating.current = false;
      },
    });
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        window.history.back();
      } else if (e.key >= '1' && e.key <= '9') {
        const slideIndex = parseInt(e.key) - 1;
        if (slideIndex < SLIDES.length) {
          goToSlide(slideIndex);
        }
      } else if (e.key === '0') {
        goToSlide(9);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide]);

  // Initial animation for first slide
  useEffect(() => {
    const firstSlide = slideRefs.current[0];
    if (firstSlide) {
      gsap.set(firstSlide, { display: 'flex', opacity: 0 });
      gsap.to(firstSlide, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="pitch-deck fixed inset-0 overflow-hidden print:relative print:h-auto"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 100%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 20% 20%, rgba(0, 240, 255, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 80% 80%, rgba(255, 0, 229, 0.08) 0%, transparent 50%),
          var(--surface-base)
        `,
      }}
    >
      {/* Progress Bar */}
      <div className="pitch-nav fixed top-0 left-0 right-0 h-1 bg-surface-elevated z-50 print:hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${((currentSlide + 1) / SLIDES.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--accent-default), var(--secondary-default))',
          }}
        />
      </div>

      {/* Navigation Arrows - side on large desktop, bottom on mobile/tablet */}
      {/* Large Desktop: side arrows */}
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className={`pitch-nav fixed left-6 top-1/2 -translate-y-1/2 p-3 rounded-full border border-border-muted bg-surface-elevated/50 backdrop-blur-sm transition-all z-50 hidden lg:flex print:hidden ${
          currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface-raised hover:border-accent'
        }`}
      >
        <ChevronLeft className="w-6 h-6 text-content-secondary" />
      </button>
      <button
        onClick={nextSlide}
        disabled={currentSlide === SLIDES.length - 1}
        className={`pitch-nav fixed right-6 top-1/2 -translate-y-1/2 p-3 rounded-full border border-border-muted bg-surface-elevated/50 backdrop-blur-sm transition-all z-50 hidden lg:flex print:hidden ${
          currentSlide === SLIDES.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface-raised hover:border-accent'
        }`}
      >
        <ChevronRight className="w-6 h-6 text-content-secondary" />
      </button>

      {/* Mobile/Tablet: bottom navigation */}
      <div className="pitch-nav fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 lg:hidden print:hidden">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`p-2 rounded-full border border-border-muted bg-surface-elevated/80 backdrop-blur-sm transition-all ${
            currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'active:bg-surface-raised'
          }`}
        >
          <ChevronLeft className="w-5 h-5 text-content-secondary" />
        </button>
        <span className="text-content-tertiary text-xs font-mono min-w-[3rem] text-center">
          {currentSlide + 1} / {SLIDES.length}
        </span>
        <button
          onClick={nextSlide}
          disabled={currentSlide === SLIDES.length - 1}
          className={`p-2 rounded-full border border-border-muted bg-surface-elevated/80 backdrop-blur-sm transition-all ${
            currentSlide === SLIDES.length - 1 ? 'opacity-30 cursor-not-allowed' : 'active:bg-surface-raised'
          }`}
        >
          <ChevronRight className="w-5 h-5 text-content-secondary" />
        </button>
      </div>

      {/* Slide Counter + Print Button - large desktop only */}
      <div className="pitch-nav fixed top-6 right-6 flex items-center gap-4 z-50 hidden lg:flex print:hidden">
        <button
          onClick={() => window.print()}
          className="p-2 rounded-lg border border-border-muted bg-surface-elevated/50 backdrop-blur-sm hover:bg-surface-raised hover:border-accent transition-all"
          title="Export to PDF"
        >
          <Printer className="w-4 h-4 text-content-secondary" />
        </button>
        <span className="text-content-tertiary text-sm font-mono">
          {String(currentSlide + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </span>
      </div>

      {/* Slides Container */}
      <div className="w-full h-full">
        {/* Slide 1: Title */}
        <div
          ref={(el) => { slideRefs.current[0] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-8"
          style={{ display: 'none' }}
        >
          <div className="">
            <Logo size={48} showText={false} className="md:hidden" />
            <Logo size={64} showText={false} className="hidden md:block" />
          </div>
          <h1 className="text-4xl md:text-8xl font-bold text-content-primary mt-4 md:mt-8 tracking-tight">
            PlayCraft
          </h1>
          <p className="text-sm md:text-2xl text-content-secondary mt-3 md:mt-6 font-light text-center px-4 max-w-3xl">
            The AI game studio in a prompt—build, ship, and scale games instantly
          </p>
          <div className="mt-6 md:mt-10 flex items-center gap-2 text-content-tertiary">
            <span className="text-xs md:text-sm">Pre-seed Round</span>
            <span className="text-accent">•</span>
            <span className="text-xs md:text-sm">$500K</span>
          </div>
          <div className="mt-6 md:mt-12 text-content-tertiary text-xs md:text-sm flex items-center gap-1 md:gap-2 print:hidden">
            <span>Press</span>
            <kbd className="px-1.5 md:px-2 py-0.5 md:py-1 bg-surface-elevated rounded border border-border-muted text-xs">→</kbd>
            <span>or</span>
            <kbd className="px-1.5 md:px-2 py-0.5 md:py-1 bg-surface-elevated rounded border border-border-muted text-xs">Space</kbd>
            <span>to continue</span>
          </div>
        </div>

        {/* Slide 2: Problem */}
        <div
          ref={(el) => { slideRefs.current[1] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-4 md:mb-12">
            Game creation is <span className="text-error">broken</span>
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-8 max-w-5xl px-2">
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Clock className="w-6 h-6 md:w-12 md:h-12 text-error mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">6-12</p>
              <p className="text-content-secondary text-xs md:text-base">months to learn Unity/Unreal</p>
            </div>
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Users className="w-6 h-6 md:w-12 md:h-12 text-warning mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">3.2B</p>
              <p className="text-content-secondary text-xs md:text-base">gamers, only 1M developers</p>
            </div>
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Target className="w-6 h-6 md:w-12 md:h-12 text-magenta-400 mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">95%</p>
              <p className="text-content-secondary text-xs md:text-base">of game ideas never get built</p>
            </div>
          </div>
          <p className="mt-4 md:mt-12 text-sm md:text-xl text-content-tertiary max-w-2xl text-center px-4">
            The barrier between imagination and playable game is too high.
          </p>
        </div>

        {/* Slide 3: Solution */}
        <div
          ref={(el) => { slideRefs.current[2] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-2 md:mb-4 text-center">
            Build. Host. <span className="text-accent">Monetize.</span>
          </h2>
          <p className="text-sm md:text-xl text-content-secondary mb-4 md:mb-10 text-center px-4">
            Full-stack game platform—from prompt to profit
          </p>
          <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-4xl mb-4 md:mb-8 px-2">
            <div className="bg-surface-elevated border border-accent/30 rounded-xl md:rounded-2xl p-3 md:p-6 text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                <Code className="w-5 h-5 md:w-7 md:h-7 text-accent" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-1">Builder</h3>
              <p className="text-content-tertiary text-xs md:text-sm hidden md:block">AI code gen, live preview, Monaco editor</p>
              <p className="text-content-tertiary text-xs md:hidden">AI + Live Preview</p>
            </div>
            <div className="bg-surface-elevated border border-secondary/30 rounded-xl md:rounded-2xl p-3 md:p-6 text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-secondary/20 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                <Globe className="w-5 h-5 md:w-7 md:h-7 text-secondary" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-1">Runtime</h3>
              <p className="text-content-tertiary text-xs md:text-sm hidden md:block">Multiplayer, leaderboards, analytics</p>
              <p className="text-content-tertiary text-xs md:hidden">Multiplayer + APIs</p>
            </div>
            <div className="bg-surface-elevated border border-warning/30 rounded-xl md:rounded-2xl p-3 md:p-6 text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-warning/20 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                <DollarSign className="w-5 h-5 md:w-7 md:h-7 text-warning" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-1">Monetize</h3>
              <p className="text-content-tertiary text-xs md:text-sm hidden md:block">Ads, IAP, revenue share on hosted games</p>
              <p className="text-content-tertiary text-xs md:hidden">Ads + IAP</p>
            </div>
          </div>
          <div className="bg-surface-elevated/80 border border-accent/30 rounded-xl px-4 md:px-6 py-2 md:py-3 text-center">
            <p className="text-accent font-medium text-sm md:text-base">"If we host it, we help you monetize it"</p>
          </div>
        </div>

        {/* Slide 4: Why Now */}
        <div
          ref={(el) => { slideRefs.current[3] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-4 md:mb-12">
            Why <span className="text-accent">now</span>?
          </h2>
          <div className="grid grid-cols-3 gap-2 md:gap-8 max-w-5xl mb-4 md:mb-12 px-2">
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-6">
              <Sparkles className="w-5 h-5 md:w-10 md:h-10 text-accent mb-2 md:mb-4" />
              <h3 className="text-xs md:text-xl font-semibold text-content-primary mb-1 md:mb-2">AI Capability</h3>
              <p className="text-content-secondary text-xs md:text-base hidden md:block">LLM coding crossed the reliability threshold for game generation in 2024-2025</p>
              <p className="text-content-secondary text-xs md:hidden">LLM coding threshold crossed</p>
            </div>
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-6">
              <TrendingUp className="w-5 h-5 md:w-10 md:h-10 text-success mb-2 md:mb-4" />
              <h3 className="text-xs md:text-xl font-semibold text-content-primary mb-1 md:mb-2">Market Validation</h3>
              <p className="text-content-secondary text-xs md:text-base hidden md:block">"Vibe coding" tools proved $100M+ ARR possible in {"<"}12 months</p>
              <p className="text-content-secondary text-xs md:hidden">$100M+ ARR proven</p>
            </div>
            <div className="bg-surface-elevated/50 backdrop-blur-sm border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-6">
              <Users className="w-5 h-5 md:w-10 md:h-10 text-secondary mb-2 md:mb-4" />
              <h3 className="text-xs md:text-xl font-semibold text-content-primary mb-1 md:mb-2">Creator Demand</h3>
              <p className="text-content-secondary text-xs md:text-base hidden md:block">TikTok/YouTube creators need gamified content; Roblox proved the appetite</p>
              <p className="text-content-secondary text-xs md:hidden">Creator economy ready</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-8 bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl px-3 md:px-8 py-3 md:py-6">
            <div className="text-center">
              <p className="text-lg md:text-3xl font-bold text-content-primary">$3.9B</p>
              <p className="text-content-tertiary text-xs md:text-sm">2024</p>
            </div>
            <ArrowRight className="w-4 h-4 md:w-8 md:h-8 text-accent" />
            <div className="text-center">
              <p className="text-lg md:text-3xl font-bold text-accent">$37B</p>
              <p className="text-content-tertiary text-xs md:text-sm">2032</p>
            </div>
            <div className="text-content-secondary text-xs md:text-sm ml-2 md:ml-4">
              AI App Builder Market<br />
              <span className="text-success">32.5% CAGR</span>
            </div>
          </div>
        </div>

        {/* Slide 5: Product */}
        <div
          ref={(el) => { slideRefs.current[4] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-4 md:mb-8">
            The Product
          </h2>
          <div className="w-full max-w-5xl bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-2 md:p-4 mb-4 md:mb-8 mx-2">
            <div className="aspect-video bg-surface-raised rounded-lg md:rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Gamepad2 className="w-8 h-8 md:w-16 md:h-16 text-accent mx-auto mb-2 md:mb-4" />
                <p className="text-content-secondary text-xs md:text-base">Live Demo / Screenshot</p>
                <p className="text-content-tertiary text-xs mt-1 md:mt-2 hidden md:block">Chat + Code Editor + Live Preview</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-4xl px-2">
            <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-2 md:p-4 text-center">
              <Code className="w-5 h-5 md:w-8 md:h-8 text-accent mx-auto mb-1 md:mb-2" />
              <p className="text-content-primary text-xs md:text-sm font-medium">AI Code Gen</p>
            </div>
            <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-2 md:p-4 text-center">
              <Play className="w-5 h-5 md:w-8 md:h-8 text-success mx-auto mb-1 md:mb-2" />
              <p className="text-content-primary text-xs md:text-sm font-medium">Live Preview</p>
            </div>
            <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-2 md:p-4 text-center">
              <Gamepad2 className="w-5 h-5 md:w-8 md:h-8 text-secondary mx-auto mb-1 md:mb-2" />
              <p className="text-content-primary text-xs md:text-sm font-medium">10+ Templates</p>
            </div>
            <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-2 md:p-4 text-center">
              <Rocket className="w-5 h-5 md:w-8 md:h-8 text-warning mx-auto mb-1 md:mb-2" />
              <p className="text-content-primary text-xs md:text-sm font-medium">1-Click Deploy</p>
            </div>
          </div>
        </div>

        {/* Slide 6: Why We Win (Moat) */}
        <div
          ref={(el) => { slideRefs.current[5] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-2 md:mb-4 text-center">
            Why We <span className="text-accent">Win</span>
          </h2>
          <p className="text-sm md:text-xl text-content-secondary mb-4 md:mb-8 text-center">
            Compounding advantages competitors can't replicate
          </p>
          <div className="grid grid-cols-2 gap-2 md:gap-4 max-w-4xl px-2">
            <div className="bg-surface-elevated border border-accent/30 rounded-lg md:rounded-xl p-2.5 md:p-5">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-3">
                <div className="w-6 h-6 md:w-9 md:h-9 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 md:w-5 md:h-5 text-accent" />
                </div>
                <h3 className="text-xs md:text-base font-semibold text-content-primary">Vertical Depth</h3>
              </div>
              <p className="text-content-secondary text-xs md:text-sm hidden md:block">Gaming-native prompts, mechanics library, multiplayer defaults</p>
              <p className="text-content-secondary text-xs md:hidden">Gaming-native AI</p>
            </div>
            <div className="bg-surface-elevated border border-secondary/30 rounded-lg md:rounded-xl p-2.5 md:p-5">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-3">
                <div className="w-6 h-6 md:w-9 md:h-9 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5 text-secondary" />
                </div>
                <h3 className="text-xs md:text-base font-semibold text-content-primary">Data Flywheel</h3>
              </div>
              <p className="text-content-secondary text-xs md:text-sm hidden md:block">Build + runtime telemetry → better generation, auto-debugging</p>
              <p className="text-content-secondary text-xs md:hidden">Self-improving AI</p>
            </div>
            <div className="bg-surface-elevated border border-success/30 rounded-lg md:rounded-xl p-2.5 md:p-5">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-3">
                <div className="w-6 h-6 md:w-9 md:h-9 rounded-lg bg-success/20 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 md:w-5 md:h-5 text-success" />
                </div>
                <h3 className="text-xs md:text-base font-semibold text-content-primary">Platform Lock-in</h3>
              </div>
              <p className="text-content-secondary text-xs md:text-sm hidden md:block">Creators earning on PlayCraft have 3x retention</p>
              <p className="text-content-secondary text-xs md:hidden">Monetization stickiness</p>
            </div>
            <div className="bg-surface-elevated border border-warning/30 rounded-lg md:rounded-xl p-2.5 md:p-5">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-3">
                <div className="w-6 h-6 md:w-9 md:h-9 rounded-lg bg-warning/20 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 md:w-5 md:h-5 text-warning" />
                </div>
                <h3 className="text-xs md:text-base font-semibold text-content-primary">Pricing Power</h3>
              </div>
              <p className="text-content-secondary text-xs md:text-sm hidden md:block">Dual-credit system aligns cost with value, isolates viral costs</p>
              <p className="text-content-secondary text-xs md:hidden">Fair cost alignment</p>
            </div>
          </div>
          <p className="mt-3 md:mt-6 text-content-tertiary text-center max-w-2xl text-xs md:text-sm px-4">
            Gaming is ~5% of horizontal builders' users — not worth their investment to compete.
          </p>
        </div>

        {/* Slide 7: Competition */}
        <div
          ref={(el) => { slideRefs.current[6] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center px-4 md:px-8 py-8 md:py-20"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-4xl font-bold text-content-primary mb-4 md:mb-8">
            Competition
          </h2>

          {/* Mobile: Simplified vertical list */}
          <div className="w-full max-w-xs md:hidden px-4">
            <div className="space-y-3">
              {/* PlayCraft highlight */}
              <div className="bg-accent/20 border border-accent rounded-xl p-3 text-center">
                <div className="px-4 py-2 rounded-lg bg-accent text-white font-bold inline-block mb-2">
                  PlayCraft
                </div>
                <p className="text-xs text-content-secondary">No-Code + Game Builder</p>
                <p className="text-xs text-accent mt-1">Only player in this space</p>
              </div>

              {/* Competitors */}
              <div className="bg-surface-elevated border border-border-muted rounded-xl p-3">
                <p className="text-xs text-content-tertiary mb-2 text-center">No-Code App Builders</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {COMPETITORS.map((c) => (
                    <span
                      key={c.name}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: c.color + '25', color: c.color }}
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Traditional tools */}
              <div className="bg-surface-elevated/50 border border-border-muted rounded-xl p-3">
                <p className="text-xs text-content-tertiary mb-2 text-center">Code-First Tools</p>
                <div className="flex justify-center gap-3 text-xs text-content-tertiary/60">
                  <span>Unity</span>
                  <span>•</span>
                  <span>Godot</span>
                  <span>•</span>
                  <span>VS Code</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: 2x2 Matrix */}
          <div className="w-full max-w-2xl hidden md:block">
            <div className="relative">
              {/* Y-axis label */}
              <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex flex-col items-center text-xs text-content-tertiary">
                <span>Code-First</span>
                <div className="w-px h-16 bg-content-tertiary/30 my-2" />
                <span>No-Code</span>
              </div>

              {/* Matrix box */}
              <div className="bg-surface-elevated rounded-xl overflow-hidden h-[280px]">
                {/* 4 Quadrants */}
                <div className="grid grid-cols-2 grid-rows-2 h-full">
                  {/* Top-left: Code-first + App Builders (sparse) */}
                  <div className="flex items-center justify-center border-r border-b border-content-tertiary/20 p-4">
                    <span className="text-content-tertiary/40 text-sm">VS Code + Cursor</span>
                  </div>
                  {/* Top-right: Code-first + Game Builders */}
                  <div className="flex items-center justify-center border-b border-content-tertiary/20 p-4">
                    <span className="text-content-tertiary/40 text-sm">Unity / Godot</span>
                  </div>
                  {/* Bottom-left: No-Code + App Builders (competitors) */}
                  <div className="flex items-center justify-center border-r border-content-tertiary/20 p-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {COMPETITORS.map((c) => (
                        <span
                          key={c.name}
                          className="px-3 py-1.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: c.color + '25', color: c.color }}
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Bottom-right: No-Code + Game Builders (PlayCraft!) */}
                  <div className="flex items-center justify-center p-4">
                    <div className="px-6 py-3 rounded-xl bg-accent text-white font-bold shadow-glow">
                      PlayCraft
                    </div>
                  </div>
                </div>
              </div>

              {/* X-axis label */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-content-tertiary">
                <span>App Builders</span>
                <div className="w-20 h-px bg-content-tertiary/30" />
                <span>Game Builders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 8: Business Model */}
        <div
          ref={(el) => { slideRefs.current[7] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-2 md:mb-4">
            Revenue Model
          </h2>
          <p className="text-sm md:text-xl text-content-secondary mb-4 md:mb-8 text-center">
            SaaS + Platform Revenue Share (Roblox Model)
          </p>
          {/* Two revenue streams */}
          <div className="grid grid-cols-2 gap-2 md:gap-6 max-w-3xl mb-4 md:mb-8 px-2">
            <div className="bg-surface-elevated border border-accent/30 rounded-lg md:rounded-xl p-3 md:p-5">
              <h3 className="text-xs md:text-lg font-semibold text-accent mb-2 md:mb-3">SaaS Revenue</h3>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-content-secondary">
                <p className="flex items-center gap-1.5"><Code className="w-3 h-3 md:w-4 md:h-4 text-accent" /> Build credits</p>
                <p className="flex items-center gap-1.5"><Globe className="w-3 h-3 md:w-4 md:h-4 text-accent" /> Runtime credits</p>
                <p className="flex items-center gap-1.5"><Users className="w-3 h-3 md:w-4 md:h-4 text-accent" /> Team subscriptions</p>
              </div>
            </div>
            <div className="bg-surface-elevated border border-warning/30 rounded-lg md:rounded-xl p-3 md:p-5">
              <h3 className="text-xs md:text-lg font-semibold text-warning mb-2 md:mb-3">Platform Revenue</h3>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-content-secondary">
                <p className="flex items-center gap-1.5"><BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-warning" /> 20-30% ad rev share</p>
                <p className="flex items-center gap-1.5"><DollarSign className="w-3 h-3 md:w-4 md:h-4 text-warning" /> 20-30% IAP rev share</p>
                <p className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 md:w-4 md:h-4 text-warning" /> Marketplace commission</p>
              </div>
            </div>
          </div>
          {/* Key metrics */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-center mb-3 md:mb-6">
            <div className="bg-surface-elevated border border-border-muted rounded-lg px-2.5 md:px-5 py-1.5 md:py-3">
              <p className="text-base md:text-xl font-bold text-success">70-80%</p>
              <p className="text-content-tertiary text-xs">Gross Margin</p>
            </div>
            <div className="bg-surface-elevated border border-border-muted rounded-lg px-2.5 md:px-5 py-1.5 md:py-3">
              <p className="text-base md:text-xl font-bold text-accent">{">"}5:1</p>
              <p className="text-content-tertiary text-xs">LTV:CAC</p>
            </div>
            <div className="bg-surface-elevated border border-border-muted rounded-lg px-2.5 md:px-5 py-1.5 md:py-3">
              <p className="text-base md:text-xl font-bold text-secondary">{"<"}3mo</p>
              <p className="text-content-tertiary text-xs">Payback</p>
            </div>
          </div>
          <p className="text-content-tertiary text-xs md:text-sm text-center">
            More games → more runtime → more monetization → compounding revenue
          </p>
        </div>

        {/* Slide 9: Traction */}
        <div
          ref={(el) => { slideRefs.current[8] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-2 md:mb-4">
            Traction
          </h2>
          <p className="text-sm md:text-xl text-content-secondary mb-4 md:mb-12">
            Pre-launch — building in public
          </p>
          <div className="grid grid-cols-3 gap-2 md:gap-8 max-w-4xl mb-4 md:mb-12 px-2">
            <div className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Rocket className="w-6 h-6 md:w-12 md:h-12 text-accent mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">MVP</p>
              <p className="text-content-secondary text-xs md:text-base">Functional product built</p>
            </div>
            <div className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Gamepad2 className="w-6 h-6 md:w-12 md:h-12 text-secondary mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">10+</p>
              <p className="text-content-secondary text-xs md:text-base">Game templates ready</p>
            </div>
            <div className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-3 md:p-8 text-center">
              <Users className="w-6 h-6 md:w-12 md:h-12 text-success mx-auto mb-2 md:mb-4" />
              <p className="text-xl md:text-4xl font-bold text-content-primary mb-1 md:mb-2">—</p>
              <p className="text-content-secondary text-xs md:text-base">Waitlist (coming soon)</p>
            </div>
          </div>
          <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-3 md:p-6 max-w-2xl text-center mx-4">
            <p className="text-content-tertiary italic text-xs md:text-base">
              "Early user testimonials and metrics will be added as we gather them."
            </p>
          </div>
        </div>

        {/* Slide 10: Go-to-Market */}
        <div
          ref={(el) => { slideRefs.current[9] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-4 md:mb-12">
            Go-to-Market
          </h2>
          <div className="flex flex-row items-stretch gap-2 md:gap-8 max-w-5xl px-2">
            <div className="flex-1 bg-surface-elevated border border-accent/30 rounded-lg md:rounded-2xl p-2 md:p-6">
              <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xs md:text-base">1</div>
                <h3 className="text-xs md:text-xl font-semibold text-content-primary">Studios</h3>
              </div>
              <p className="text-content-secondary mb-2 md:mb-4 text-xs md:text-base">0-4 months</p>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-content-tertiary">
                <p className="flex items-center gap-1 md:gap-2"><Building2 className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Publisher partnerships</span><span className="md:hidden">Publishers</span></p>
                <p className="flex items-center gap-1 md:gap-2"><Zap className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Rapid prototyping deals</span><span className="md:hidden">Prototyping</span></p>
                <p className="flex items-center gap-1 md:gap-2"><Target className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">3-5 design partners</span><span className="md:hidden">Partners</span></p>
              </div>
            </div>
            <div className="flex-1 bg-surface-elevated border border-secondary/30 rounded-lg md:rounded-2xl p-2 md:p-6">
              <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xs md:text-base">2</div>
                <h3 className="text-xs md:text-xl font-semibold text-content-primary">Developers</h3>
              </div>
              <p className="text-content-secondary mb-2 md:mb-4 text-xs md:text-base">4-8 months</p>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-content-tertiary">
                <p className="flex items-center gap-1 md:gap-2"><Users className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Indie devs + modders</span><span className="md:hidden">Indies</span></p>
                <p className="flex items-center gap-1 md:gap-2"><MessageSquare className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Community growth</span><span className="md:hidden">Community</span></p>
                <p className="flex items-center gap-1 md:gap-2"><Sparkles className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Studio case studies</span><span className="md:hidden">Case studies</span></p>
              </div>
            </div>
            <div className="flex-1 bg-surface-elevated border border-warning/30 rounded-lg md:rounded-2xl p-2 md:p-6">
              <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-warning flex items-center justify-center text-white font-bold text-xs md:text-base">3</div>
                <h3 className="text-xs md:text-xl font-semibold text-content-primary">Monetize</h3>
              </div>
              <p className="text-content-secondary mb-2 md:mb-4 text-xs md:text-base">8-12 months</p>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-content-tertiary">
                <p className="flex items-center gap-1 md:gap-2"><Globe className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Games portal launch</span><span className="md:hidden">Portal</span></p>
                <p className="flex items-center gap-1 md:gap-2"><DollarSign className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Ads + IAP revenue share</span><span className="md:hidden">Ads/IAP</span></p>
                <p className="flex items-center gap-1 md:gap-2"><TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Creator payouts live</span><span className="md:hidden">Payouts</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 11: Team */}
        <div
          ref={(el) => { slideRefs.current[10] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-12"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-3 md:mb-8">
            The Team
          </h2>
          <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-4xl mb-3 md:mb-8 px-2">
            {/* Reza Hassanzadeh - Product Lead */}
            <a
              href="https://www.linkedin.com/in/reza-h/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-2 md:p-6 text-center hover:border-accent/50 transition-colors group"
            >
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 overflow-hidden bg-accent/20">
                <img src="/founders/REza.png" alt="Reza Hassanzadeh" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-0.5">Reza Hassanzadeh</h3>
              <p className="text-accent mb-1 md:mb-2 text-xs md:text-sm font-medium">Product Lead</p>
              <p className="text-content-secondary text-xs hidden md:block leading-relaxed">
                10+ years in gaming. Co-founded studios, shipped 10+ titles with 25M+ players.
              </p>
              <p className="text-content-tertiary text-xs md:hidden">25M+ players</p>
              <div className="mt-1 md:mt-2 flex items-center justify-center gap-1 text-content-tertiary group-hover:text-accent transition-colors">
                <Linkedin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs hidden md:inline">LinkedIn</span>
              </div>
            </a>

            {/* Erfan Kouzehgaran - Marketing Lead */}
            <a
              href="https://www.linkedin.com/in/erfankouzehgaran/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-2 md:p-6 text-center hover:border-secondary/50 transition-colors group"
            >
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 overflow-hidden bg-secondary/20">
                <img src="/founders/erfan.png" alt="Erfan Kouzehgaran" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-0.5">Erfan Kouzehgaran</h3>
              <p className="text-secondary mb-1 md:mb-2 text-xs md:text-sm font-medium">Marketing Lead</p>
              <p className="text-content-secondary text-xs hidden md:block leading-relaxed">
                Growth expert. Led UA campaigns driving 200K+ iOS users in 3 months.
              </p>
              <p className="text-content-tertiary text-xs md:hidden">200K+ UA</p>
              <div className="mt-1 md:mt-2 flex items-center justify-center gap-1 text-content-tertiary group-hover:text-secondary transition-colors">
                <Linkedin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs hidden md:inline">LinkedIn</span>
              </div>
            </a>

            {/* Sina Maleki - Tech Lead */}
            <a
              href="https://www.linkedin.com/in/jsinamaleki/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-elevated border border-border-muted rounded-xl md:rounded-2xl p-2 md:p-6 text-center hover:border-cyan-500/50 transition-colors group"
            >
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 overflow-hidden bg-cyan-500/20">
                <img src="/founders/sina.png" alt="Sina Maleki" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xs md:text-lg font-semibold text-content-primary mb-0.5">Sina Maleki</h3>
              <p className="text-cyan-400 mb-1 md:mb-2 text-xs md:text-sm font-medium">Tech Lead</p>
              <p className="text-content-secondary text-xs hidden md:block leading-relaxed">
                8+ years full-stack. React, React-Native, Web3. CTO experience.
              </p>
              <p className="text-content-tertiary text-xs md:hidden">8+ years dev</p>
              <div className="mt-1 md:mt-2 flex items-center justify-center gap-1 text-content-tertiary group-hover:text-cyan-400 transition-colors">
                <Linkedin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs hidden md:inline">LinkedIn</span>
              </div>
            </a>
          </div>
          <div className="bg-surface-elevated/50 border border-border-muted rounded-lg md:rounded-xl p-2.5 md:p-5 max-w-3xl text-center mx-4">
            <p className="text-content-primary font-medium mb-1 text-xs md:text-base">Why Us?</p>
            <p className="text-content-secondary text-xs md:text-sm">
              We've worked together for 6+ years building games. Combined: 25M+ players, 10+ shipped titles, and startup exits.
            </p>
          </div>
        </div>

        {/* Slide 12: The Ask */}
        <div
          ref={(el) => { slideRefs.current[11] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <h2 className="text-2xl md:text-5xl font-bold text-content-primary mb-2 md:mb-4">
            The Ask
          </h2>
          <div className="text-3xl md:text-6xl font-bold mb-2 md:mb-6">
            <span className="text-accent">$500K</span>
          </div>
          <p className="text-sm md:text-xl text-content-secondary mb-4 md:mb-8">Pre-seed Round</p>

          <div className="grid grid-cols-2 gap-2 md:gap-6 max-w-4xl mb-4 md:mb-8 px-2">
            {/* Use of Funds */}
            <div className="bg-surface-elevated border border-border-muted rounded-lg md:rounded-2xl p-3 md:p-5">
              <h3 className="text-sm md:text-base font-semibold text-content-primary mb-2 md:mb-3">Use of Funds</h3>
              <div className="space-y-1.5 md:space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-content-secondary text-xs">Engineering</span>
                  <div className="flex items-center gap-1">
                    <div className="w-10 md:w-24 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div className="w-[40%] h-full bg-accent" />
                    </div>
                    <span className="text-content-primary font-medium text-xs">40%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-content-secondary text-xs">GTM/Community</span>
                  <div className="flex items-center gap-1">
                    <div className="w-10 md:w-24 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div className="w-[25%] h-full bg-secondary" />
                    </div>
                    <span className="text-content-primary font-medium text-xs">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-content-secondary text-xs">Infrastructure</span>
                  <div className="flex items-center gap-1">
                    <div className="w-10 md:w-24 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div className="w-[20%] h-full bg-warning" />
                    </div>
                    <span className="text-content-primary font-medium text-xs">20%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-content-secondary text-xs">Security/Legal</span>
                  <div className="flex items-center gap-1">
                    <div className="w-10 md:w-24 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div className="w-[15%] h-full bg-error" />
                    </div>
                    <span className="text-content-primary font-medium text-xs">15%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Month Milestones */}
            <div className="bg-surface-elevated border border-border-muted rounded-lg md:rounded-2xl p-3 md:p-5">
              <h3 className="text-sm md:text-base font-semibold text-content-primary mb-2 md:mb-3">12-Month Milestones</h3>
              <div className="space-y-1.5 md:space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Gamepad2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent" />
                  </div>
                  <div>
                    <p className="text-content-primary font-medium text-xs">1,000 hosted games</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <DollarSign className="w-2.5 h-2.5 md:w-3 md:h-3 text-success" />
                  </div>
                  <div>
                    <p className="text-content-primary font-medium text-xs">$100K creator payouts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-secondary" />
                  </div>
                  <div>
                    <p className="text-content-primary font-medium text-xs">50K portal MAU</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-warning/20 flex items-center justify-center">
                    <Building2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-warning" />
                  </div>
                  <div>
                    <p className="text-content-primary font-medium text-xs">3-5 studio partners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Logo size={24} showText={false} className="md:hidden" />
            <Logo size={32} showText={false} className="hidden md:block" />
            <div>
              <p className="text-content-primary font-medium text-sm md:text-base">PlayCraft</p>
              <p className="text-content-tertiary text-xs md:text-sm">The AI game studio in a prompt</p>
            </div>
          </div>
        </div>

        {/* Slide 13: Thank You */}
        <div
          ref={(el) => { slideRefs.current[12] = el; }}
          className="pitch-slide absolute inset-0 flex-col items-center justify-center p-4 md:p-16"
          style={{ display: 'none' }}
        >
          <div className="mb-6 md:mb-10">
            <Logo size={56} showText={false} className="md:hidden" />
            <Logo size={80} showText={false} className="hidden md:block" />
          </div>

          <h2 className="text-3xl md:text-6xl font-bold text-content-primary mb-4 md:mb-6 text-center">
            Thank You
          </h2>

          <p className="text-lg md:text-3xl text-accent font-medium mb-6 md:mb-10 text-center px-4">
            "From idea to game in minutes."
          </p>

          <div className="bg-surface-elevated/50 border border-border-muted rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-10 text-center">
            <p className="text-content-primary font-semibold text-base md:text-xl mb-2">PlayCraft</p>
            <p className="text-content-secondary text-sm md:text-lg mb-4">The AI game studio in a prompt</p>
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <a href="mailto:playcraft@ludaxis.io" className="flex items-center gap-2 text-content-tertiary hover:text-accent transition-colors">
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">playcraft@ludaxis.io</span>
              </a>
              <a href="https://playcraft.games" className="flex items-center gap-2 text-content-tertiary hover:text-accent transition-colors">
                <Globe className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">playcraft.games</span>
              </a>
            </div>
          </div>

          <p className="text-content-tertiary text-xs md:text-sm text-center">
            Let's build the future of game creation together.
          </p>
        </div>
      </div>
    </div>
  );
}
