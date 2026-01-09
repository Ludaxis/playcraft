/**
 * How It Works Page - SEO optimized with HowTo schema
 * Designed for Answer Engine Optimization (AEO)
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Gamepad2,
  MessageSquare,
  Sparkles,
  Eye,
  Pencil,
  Rocket,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '../components';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Sign up for free',
    description:
      'Create your free PlayCraft account using Google sign-in. No credit card required. Get started in seconds.',
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
  {
    number: 2,
    title: 'Describe your game idea',
    description:
      'Tell PlayCraft what game you want to create using plain English. For example: "Create a space shooter where I defend Earth from asteroids" or "Make a puzzle game with falling blocks".',
    icon: <MessageSquare className="h-6 w-6" />,
    tip: 'Be specific about gameplay mechanics, art style, and controls for best results.',
  },
  {
    number: 3,
    title: 'Watch AI generate your game',
    description:
      'PlayCraft\'s AI analyzes your description and generates complete game code in real-time. You\'ll see files being created, including HTML, CSS, and JavaScript.',
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    number: 4,
    title: 'Preview and test',
    description:
      'Your game appears in the live preview panel immediately. Test the gameplay, controls, and mechanics. The preview updates in real-time as changes are made.',
    icon: <Eye className="h-6 w-6" />,
  },
  {
    number: 5,
    title: 'Iterate and refine',
    description:
      'Not quite right? Simply describe what you want changed: "Make the player move faster" or "Add a score counter". The AI will update your game accordingly. You can also edit the code directly.',
    icon: <Pencil className="h-6 w-6" />,
    tip: 'You can make unlimited iterations until your game is perfect.',
  },
  {
    number: 6,
    title: 'Publish with one click',
    description:
      'When you\'re happy with your game, click "Publish". PlayCraft compiles, optimizes, and deploys your game to a unique URL. The whole process takes seconds.',
    icon: <Rocket className="h-6 w-6" />,
  },
  {
    number: 7,
    title: 'Share with the world',
    description:
      'Copy your game\'s URL and share it anywhere. Your game is also featured in the PlayCraft Playground where players can discover and play community games.',
    icon: <Share2 className="h-6 w-6" />,
  },
];

// Generate JSON-LD for HowTo schema
function generateHowToSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create a Game with PlayCraft',
    description:
      'A step-by-step guide to creating browser games using PlayCraft AI Game Builder. No coding required.',
    totalTime: 'PT10M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Web browser (Chrome, Firefox, Safari, or Edge)',
      },
      {
        '@type': 'HowToTool',
        name: 'PlayCraft account (free)',
      },
    ],
    step: STEPS.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
      url: `https://playcraft.dev/how-it-works#step-${step.number}`,
    })),
  };
  return JSON.stringify(schema);
}

export function HowItWorksPage() {
  // Inject HowTo schema into head
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = generateHowToSchema();
    script.id = 'howto-schema';
    document.head.appendChild(script);

    // Update page title
    document.title = 'How It Works - PlayCraft AI Game Builder';

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Learn how to create browser games with PlayCraft in 7 easy steps. No coding required. Describe your game idea and AI builds it instantly.'
      );
    }

    return () => {
      const existingScript = document.getElementById('howto-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border-muted bg-surface-elevated/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo size={32} showText textClassName="text-content" />
          </Link>
          <Link
            to="/playground"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
          >
            <Gamepad2 className="h-4 w-4" />
            Play Games
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Back Link */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-content-muted hover:text-content"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Page Title */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-content">How PlayCraft Works</h1>
          <p className="text-lg text-content-muted">
            Create your first game in minutes. No coding experience required.
          </p>
        </div>

        {/* TL;DR for AI extraction */}
        <div className="mb-12 rounded-2xl border border-accent/20 bg-accent/5 p-6">
          <h2 className="mb-3 text-lg font-semibold text-content">TL;DR</h2>
          <p className="text-content-secondary">
            PlayCraft lets you create browser games in 7 simple steps: 1) Sign up free, 2) Describe
            your game idea in plain English, 3) Watch AI generate the code, 4) Preview and test, 5)
            Iterate with AI assistance, 6) Publish with one click, 7) Share your game with the
            world. The entire process can take as little as 10 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {STEPS.map((step) => (
            <div
              key={step.number}
              id={`step-${step.number}`}
              className="relative rounded-xl border border-border-muted bg-surface-elevated p-6"
            >
              {/* Step Number Badge */}
              <div className="absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-accent to-secondary text-lg font-bold text-white shadow-lg">
                {step.number}
              </div>

              <div className="ml-4">
                {/* Step Header */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    {step.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-content">{step.title}</h2>
                </div>

                {/* Step Description */}
                <p className="mb-3 text-content-secondary leading-relaxed">{step.description}</p>

                {/* Tip */}
                {step.tip && (
                  <div className="rounded-lg bg-surface-overlay p-3">
                    <p className="text-sm text-content-muted">
                      <span className="font-medium text-accent">Tip:</span> {step.tip}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Example Games Section */}
        <div className="mt-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-content">
            Games You Can Create
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Space Shooters',
              'Platformers',
              'Puzzle Games',
              'Match-3 Games',
              'Racing Games',
              'Word Games',
              'Memory Games',
              'Arcade Classics',
              '3D Games',
            ].map((gameType) => (
              <div
                key={gameType}
                className="rounded-lg border border-border-muted bg-surface-elevated p-4 text-center"
              >
                <span className="text-content-secondary">{gameType}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-2xl border border-border-muted bg-surface-elevated p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-content">Ready to Create Your Game?</h2>
          <p className="mb-6 text-content-muted">
            Join thousands of creators building games with AI. Start free today.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-secondary px-8 py-3 font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow-md"
          >
            <Gamepad2 className="h-5 w-5" />
            Start Building Free
          </Link>
        </div>

        {/* FAQ Link */}
        <div className="mt-8 text-center">
          <p className="text-content-muted">
            Have questions?{' '}
            <Link to="/faq" className="text-accent hover:underline">
              Check our FAQ
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border-muted py-6">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-content-subtle">
          <nav className="mb-4 flex justify-center gap-6">
            <Link to="/" className="hover:text-content">
              Home
            </Link>
            <Link to="/playground" className="hover:text-content">
              Playground
            </Link>
            <Link to="/how-it-works" className="text-accent">
              How It Works
            </Link>
            <Link to="/faq" className="hover:text-content">
              FAQ
            </Link>
          </nav>
          Made with{' '}
          <Link to="/" className="text-accent hover:underline">
            PlayCraft
          </Link>{' '}
          - AI-Powered Game Builder
        </div>
      </footer>
    </div>
  );
}
