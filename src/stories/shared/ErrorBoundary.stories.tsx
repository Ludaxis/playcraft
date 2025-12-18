import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from '@/components/shared';

/**
 * ErrorBoundary catches JavaScript errors in child components and displays a fallback UI.
 *
 * ## Usage
 * ```tsx
 * import { ErrorBoundary } from '@/components/shared';
 *
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <RiskyComponent />
 * </ErrorBoundary>
 * ```
 *
 * Use this to wrap components that might throw errors (e.g., GSAP animations, canvas operations).
 */
const meta: Meta<typeof ErrorBoundary> = {
  title: 'Shared/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

/** ErrorBoundary with working child */
export const WorkingChild: Story = {
  render: () => (
    <ErrorBoundary>
      <div className="p-4 bg-bg-card rounded-lg border border-border">
        <p className="text-text-primary">This component works fine!</p>
        <p className="text-text-muted text-caption mt-2">No errors here.</p>
      </div>
    </ErrorBoundary>
  ),
};

// Component that throws an error for testing
function BrokenComponent(): never {
  throw new Error('Test error from BrokenComponent');
}

/** ErrorBoundary catching an error (default fallback) */
export const DefaultFallback: Story = {
  render: () => (
    <ErrorBoundary>
      <BrokenComponent />
    </ErrorBoundary>
  ),
};

/** ErrorBoundary with custom fallback */
export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={
        <div className="p-6 bg-bg-muted rounded-lg border border-border text-center">
          <span className="text-3xl">😅</span>
          <p className="text-text-primary font-bold mt-2">Oops!</p>
          <p className="text-text-muted text-caption">Something went wrong</p>
        </div>
      }
    >
      <BrokenComponent />
    </ErrorBoundary>
  ),
};

/** Multiple ErrorBoundaries - one fails, others work */
export const IsolatedErrors: Story = {
  render: () => (
    <div className="flex gap-4">
      <ErrorBoundary>
        <div className="p-4 bg-bg-card rounded-lg border border-border w-32">
          <p className="text-text-primary text-center">Card 1</p>
          <p className="text-text-muted text-caption text-center">Works!</p>
        </div>
      </ErrorBoundary>
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
      <ErrorBoundary>
        <div className="p-4 bg-bg-card rounded-lg border border-border w-32">
          <p className="text-text-primary text-center">Card 3</p>
          <p className="text-text-muted text-caption text-center">Also works!</p>
        </div>
      </ErrorBoundary>
    </div>
  ),
};
