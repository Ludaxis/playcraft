import type { Meta, StoryObj } from '@storybook/react';
import { PageSkeleton } from '@/components/shared';

/**
 * PageSkeleton provides a loading placeholder while pages are being lazy-loaded.
 * It displays animated skeleton UI that matches the app's wireframe design.
 *
 * ## Usage
 * ```tsx
 * import dynamic from 'next/dynamic';
 * import { PageSkeleton } from '@/components/shared';
 *
 * const MyPage = dynamic(
 *   () => import('./MyPage').then(m => ({ default: m.MyPage })),
 *   { loading: () => <PageSkeleton /> }
 * );
 * ```
 *
 * This component is used automatically by the AppShell for lazy-loaded pages.
 */
const meta: Meta<typeof PageSkeleton> = {
  title: 'Shared/PageSkeleton',
  component: PageSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PageSkeleton>;

/** Default loading skeleton for pages */
export const Default: Story = {
  render: () => (
    <div className="h-[600px]">
      <PageSkeleton />
    </div>
  ),
};

/** Skeleton in a mobile viewport */
export const MobileView: Story = {
  render: () => (
    <div className="w-[375px] h-[667px] mx-auto border border-border rounded-xl overflow-hidden">
      <PageSkeleton />
    </div>
  ),
};
