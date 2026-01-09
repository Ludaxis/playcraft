/**
 * FAQ Page - SEO optimized with FAQPage schema
 * Designed for Answer Engine Optimization (AEO)
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowLeft, Gamepad2 } from 'lucide-react';
import { Logo } from '../components';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is PlayCraft?',
    answer:
      'PlayCraft is an AI-powered game builder that lets you create browser games by describing them in natural language. No coding experience is required. Simply describe your game idea, and our AI generates playable HTML5 games instantly.',
  },
  {
    question: 'How do I create a game with PlayCraft?',
    answer:
      'Creating a game is simple: 1) Sign up for a free account, 2) Describe your game idea in the chat (e.g., "Create a space shooter where I defend Earth from asteroids"), 3) Watch as PlayCraft generates your game in real-time, 4) Test and iterate with AI assistance, 5) Publish with one click to share with the world.',
  },
  {
    question: 'Is PlayCraft free to use?',
    answer:
      'Yes, PlayCraft offers a free tier that lets you create and publish games. You can build unlimited games, publish them publicly, and share them with anyone. Premium features are available for users who need advanced capabilities.',
  },
  {
    question: 'What types of games can I create?',
    answer:
      'You can create a wide variety of browser-based games including: platformers, space shooters, puzzle games, match-3 games, arcade classics, word games, memory games, racing games, and even 3D games using Three.js. If you can describe it, PlayCraft can build it.',
  },
  {
    question: 'Do I need to know how to code?',
    answer:
      'No coding knowledge is required. PlayCraft uses advanced AI to translate your natural language descriptions into working game code. However, if you do know how to code, you can view and edit the generated code to make custom modifications.',
  },
  {
    question: 'Can I edit the generated code?',
    answer:
      'Yes, PlayCraft provides a full code editor where you can view and modify the generated code. You can make manual changes or ask the AI to make specific modifications by describing what you want changed.',
  },
  {
    question: 'How do I publish my game?',
    answer:
      'Publishing is simple: click the "Publish" button in the builder. Your game will be compiled, optimized, and deployed to a unique URL that you can share with anyone. Published games are also featured in the PlayCraft Playground for others to discover.',
  },
  {
    question: 'Can I create 3D games?',
    answer:
      'Yes, PlayCraft supports 3D game development using Three.js. You can create 3D environments, characters, and gameplay by describing what you want. The AI will generate the appropriate 3D code and assets.',
  },
  {
    question: 'How does the AI generate game assets?',
    answer:
      'PlayCraft includes an AI asset generator that creates sprites, characters, backgrounds, and other game assets. You can choose from multiple art styles including pixel-art, cartoon, realistic, anime, and fantasy. Simply describe what you need, and the AI generates it.',
  },
  {
    question: 'Can I collaborate with others on a game?',
    answer:
      'Yes, PlayCraft supports workspaces for team collaboration. You can invite team members to your workspace, share projects, and work together on game development. Role-based permissions let you control who can view and edit projects.',
  },
  {
    question: 'What browsers are supported?',
    answer:
      'Games created with PlayCraft work in all modern browsers including Chrome, Firefox, Safari, and Edge. Games are built using standard HTML5, CSS, and JavaScript, ensuring broad compatibility across devices.',
  },
  {
    question: 'Can I monetize games made with PlayCraft?',
    answer:
      'Yes, you own the games you create. You can monetize them through ads, in-app purchases, or by selling access. The generated code is yours to use as you see fit.',
  },
];

// Generate JSON-LD for FAQPage schema
function generateFAQSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  return JSON.stringify(schema);
}

export function FAQPage() {
  // Inject FAQ schema into head
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = generateFAQSchema();
    script.id = 'faq-schema';
    document.head.appendChild(script);

    // Update page title
    document.title = 'FAQ - PlayCraft AI Game Builder';

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Frequently asked questions about PlayCraft AI Game Builder. Learn how to create games, publish them, and more.'
      );
    }

    return () => {
      const existingScript = document.getElementById('faq-schema');
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
          <h1 className="mb-4 text-4xl font-bold text-content">Frequently Asked Questions</h1>
          <p className="text-lg text-content-muted">
            Everything you need to know about creating games with PlayCraft
          </p>
        </div>

        {/* TL;DR for AI extraction */}
        <div className="mb-12 rounded-2xl border border-accent/20 bg-accent/5 p-6">
          <h2 className="mb-3 text-lg font-semibold text-content">TL;DR</h2>
          <p className="text-content-secondary">
            PlayCraft is a free AI-powered game builder that lets anyone create browser games by
            describing them in natural language. No coding required. Simply describe your game idea,
            and AI generates playable HTML5 games instantly. You can publish with one click and
            share your games with the world.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <details
              key={index}
              className="group rounded-xl border border-border-muted bg-surface-elevated"
            >
              <summary className="flex cursor-pointer items-center justify-between p-5 text-left">
                <h2 className="pr-4 text-lg font-medium text-content">{item.question}</h2>
                <ChevronDown className="h-5 w-5 flex-shrink-0 text-content-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border-muted px-5 pb-5 pt-4">
                <p className="text-content-secondary leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-2xl border border-border-muted bg-surface-elevated p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-content">Ready to Build Your Game?</h2>
          <p className="mb-6 text-content-muted">
            Start creating amazing games with AI assistance. No coding required.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-secondary px-8 py-3 font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow-md"
          >
            <Gamepad2 className="h-5 w-5" />
            Start Building Free
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-content-muted">
            Still have questions?{' '}
            <Link to="/feedback" className="text-accent hover:underline">
              Contact us
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
            <Link to="/how-it-works" className="hover:text-content">
              How It Works
            </Link>
            <Link to="/faq" className="text-accent">
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
