/**
 * FAQ Modal Component
 * Searchable FAQ with categories and accordion items
 */

import { useState, useMemo } from 'react';
import {
  X,
  Search,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { FAQ_CATEGORIES, ALL_FAQ_ITEMS } from '../data/faqContent';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
  onStartTour?: () => void;
}

export function FAQModal({
  isOpen,
  onClose,
  onOpenFeedback,
  onStartTour,
}: FAQModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Filter FAQ items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    return ALL_FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Toggle expanded state for an item
  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border-muted bg-surface-elevated">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-muted p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <HelpCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-content">Help & FAQ</h2>
              <p className="text-sm text-content-subtle">Find answers to common questions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border-muted p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full rounded-lg border border-border bg-surface-overlay py-2.5 pl-10 pr-4 text-sm text-content placeholder-content-subtle outline-none ring-accent focus:border-transparent focus:ring-2"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems ? (
            // Search results
            <div className="space-y-2">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-content-muted">No results found for "{searchQuery}"</p>
                  <p className="mt-2 text-sm text-content-subtle">
                    Try different keywords or browse categories below
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-3 text-sm text-content-subtle">
                    Found {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
                  </p>
                  {filteredItems.map((item) => (
                    <FAQItem
                      key={item.id}
                      question={item.question}
                      answer={item.answer}
                      category={item.category}
                      isExpanded={expandedItems.has(item.id)}
                      onToggle={() => toggleItem(item.id)}
                    />
                  ))}
                </>
              )}
            </div>
          ) : (
            // Browse by category
            <div className="space-y-4">
              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3">
                {onStartTour && (
                  <button
                    onClick={() => {
                      onClose();
                      onStartTour();
                    }}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface-overlay/50 p-4 text-left transition-colors hover:border-accent/50 hover:bg-surface-overlay"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20">
                      <Compass className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-content">Take a tour</p>
                      <p className="text-sm text-content-subtle">Learn the basics</p>
                    </div>
                  </button>
                )}
                {onOpenFeedback && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFeedback();
                    }}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface-overlay/50 p-4 text-left transition-colors hover:border-accent/50 hover:bg-surface-overlay"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/20">
                      <MessageSquare className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="font-medium text-content">Send feedback</p>
                      <p className="text-sm text-content-subtle">Report issues or ideas</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-2">
                {FAQ_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      setActiveCategory(
                        activeCategory === category.id ? null : category.id
                      )
                    }
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeCategory === category.id
                        ? 'bg-accent text-content'
                        : 'bg-surface-overlay text-content-muted hover:bg-surface-elevated hover:text-content'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Category content */}
              {FAQ_CATEGORIES.filter(
                (cat) => !activeCategory || cat.id === activeCategory
              ).map((category) => (
                <div key={category.id} className="space-y-2">
                  {!activeCategory && (
                    <h3 className="text-sm font-medium text-content-muted">
                      {category.name}
                    </h3>
                  )}
                  {category.items.map((item) => (
                    <FAQItem
                      key={item.id}
                      question={item.question}
                      answer={item.answer}
                      isExpanded={expandedItems.has(item.id)}
                      onToggle={() => toggleItem(item.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-muted p-4">
          <p className="text-center text-sm text-content-subtle">
            Can't find what you're looking for?{' '}
            {onOpenFeedback ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenFeedback();
                }}
                className="text-accent hover:text-accent-light"
              >
                Send us feedback
              </button>
            ) : (
              <span className="text-content-muted">Contact support</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  category?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, category, isExpanded, onToggle }: FAQItemProps) {
  return (
    <div className="rounded-lg border border-border-muted bg-surface-overlay/30 transition-colors hover:border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-content-subtle transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
        <div className="flex-1">
          <p className="font-medium text-content">{question}</p>
          {category && !isExpanded && (
            <span className="mt-1 inline-block rounded-full bg-surface-overlay px-2 py-0.5 text-xs text-content-subtle">
              {category}
            </span>
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-border-muted px-4 py-3 pl-11">
          <p className="text-sm leading-relaxed text-content-muted">{answer}</p>
        </div>
      )}
    </div>
  );
}
