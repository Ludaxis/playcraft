/**
 * Feedback Page
 * Form for users to submit bug reports, feature requests, and general feedback
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bug,
  Lightbulb,
  Wrench,
  HelpCircle,
  Send,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import {
  submitFeedback,
  type FeedbackType,
} from '../lib/feedbackService';
import { LogoIcon } from '../components/Logo';

const FEEDBACK_TYPES: Array<{
  id: FeedbackType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    id: 'bug',
    label: 'Bug Report',
    description: 'Something isn\'t working correctly',
    icon: Bug,
    color: 'text-error bg-error/20 border-error/30',
  },
  {
    id: 'feature',
    label: 'Feature Request',
    description: 'I have an idea for a new feature',
    icon: Lightbulb,
    color: 'text-warning bg-warning/20 border-warning/30',
  },
  {
    id: 'improvement',
    label: 'Improvement',
    description: 'Something could be better',
    icon: Wrench,
    color: 'text-info bg-info/20 border-info/30',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'General feedback or question',
    icon: HelpCircle,
    color: 'text-content-muted bg-surface-overlay/20 border-border',
  },
];

export function FeedbackPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType || !title.trim() || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitFeedback({
        type: selectedType,
        title: title.trim(),
        description: description.trim(),
      });
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedType(null);
    setTitle('');
    setDescription('');
    setIsSubmitted(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-surface-elevated">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 rounded-lg p-1.5 text-content-secondary transition-colors hover:bg-surface-overlay hover:text-content"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <LogoIcon size={32} />
            <span className="font-semibold text-white">Feedback</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        {isSubmitted ? (
          /* Success state */
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-content">
              Thank you for your feedback!
            </h1>
            <p className="mb-8 text-content-secondary">
              We appreciate you taking the time to help us improve PlayCraft.
              Your feedback helps us make the product better for everyone.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-content transition-colors hover:border-border-emphasis hover:bg-surface-overlay"
              >
                Submit another
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-neon rounded-lg px-5 py-2.5 text-sm"
              >
                Back to PlayCraft
              </button>
            </div>
          </div>
        ) : (
          /* Feedback form */
          <form onSubmit={handleSubmit}>
            <h1 className="mb-2 text-2xl font-bold text-content">
              Send us feedback
            </h1>
            <p className="mb-8 text-content-secondary">
              Help us improve PlayCraft by sharing your thoughts, reporting bugs,
              or suggesting new features.
            </p>

            {/* Error message */}
            {error && (
              <div className="mb-6 rounded-lg border border-error-muted bg-error-subtle p-4 text-sm text-error">
                {error}
              </div>
            )}

            {/* Feedback type selection */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-content">
                What type of feedback is this?
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {FEEDBACK_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`flex flex-col items-center rounded-lg border p-4 transition-all ${
                      selectedType === type.id
                        ? type.color
                        : 'border-border bg-surface-elevated/50 text-content-muted hover:border-border-emphasis'
                    }`}
                  >
                    <type.icon className="mb-2 h-6 w-6" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title input */}
            <div className="mb-4">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-content"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your feedback"
                className="w-full rounded-lg border border-border bg-surface-overlay px-4 py-2.5 text-content placeholder-content-tertiary outline-none ring-accent focus:border-transparent focus:ring-2"
              />
            </div>

            {/* Description textarea */}
            <div className="mb-6">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-content"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide as much detail as possible..."
                rows={6}
                className="w-full rounded-lg border border-border bg-surface-overlay px-4 py-2.5 text-content placeholder-content-tertiary outline-none ring-accent focus:border-transparent focus:ring-2"
              />
              <p className="mt-2 text-xs text-content-tertiary">
                {selectedType === 'bug' &&
                  'Include steps to reproduce the issue if possible.'}
                {selectedType === 'feature' &&
                  'Describe what problem this feature would solve.'}
                {selectedType === 'improvement' &&
                  'Explain what you would change and why.'}
                {selectedType === 'other' && 'Tell us what\'s on your mind.'}
              </p>
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-content-muted transition-colors hover:border-border-emphasis hover:bg-surface-overlay hover:text-content"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedType || !title.trim() || !description.trim()}
                className="btn-neon flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
