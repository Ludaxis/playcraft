/**
 * Preview Header Component
 * Header for the preview panel with view tabs, device toggles, and action buttons
 */

import type { User } from '@supabase/supabase-js';
import {
  Share2,
  Crown,
  ExternalLink,
  Plus,
} from 'lucide-react';
import type { WebContainerStatus } from '../../hooks/useWebContainer';
import { Avatar } from '../Avatar';
import { HeaderTabs, type BuilderViewMode } from './HeaderTabs';
import { DeviceToggle, type DeviceMode } from './DeviceToggle';

interface PreviewHeaderProps {
  user: User;
  status: WebContainerStatus;
  onShare?: () => void;
  onPublish?: () => void;
  onUpgrade?: () => void;
  isPublished?: boolean;
  publishedUrl?: string;
  // View mode and device toggles
  viewMode: BuilderViewMode;
  onViewModeChange: (mode: BuilderViewMode) => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function PreviewHeader({
  user,
  status,
  onShare,
  onPublish,
  onUpgrade,
  isPublished = false,
  publishedUrl,
  viewMode,
  onViewModeChange,
  deviceMode,
  onDeviceModeChange,
  onRefresh,
  isRefreshing = false,
}: PreviewHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-muted bg-surface-elevated px-3">
      {/* Left section - View tabs, device toggles, and add button */}
      <div className="flex items-center gap-2">
        {/* Preview/Code/etc tabs */}
        <HeaderTabs viewMode={viewMode} onViewModeChange={onViewModeChange} />

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Device toggles with refresh */}
        <DeviceToggle
          mode={deviceMode}
          onChange={onDeviceModeChange}
          onRefresh={onRefresh}
          isLoading={isRefreshing}
          disabled={status !== 'running'}
        />

        {/* Add button */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-content-muted transition-colors hover:border-border-emphasis hover:bg-surface-overlay hover:text-content"
          title="Add component"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Right section - Action buttons and user */}
      <div className="flex items-center gap-2">
        {/* User avatar */}
        <Avatar
          src={user.user_metadata?.avatar_url}
          name={user.user_metadata?.full_name || user.email}
          size="sm"
        />

        {/* Share button */}
        <button
          onClick={onShare}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface-overlay/50 px-3 py-1.5 text-sm text-content-muted transition-colors hover:border-border-emphasis hover:bg-surface-overlay hover:text-content"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        {/* Upgrade button */}
        <button
          onClick={onUpgrade}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface-overlay/50 px-3 py-1.5 text-sm text-content-muted transition-colors hover:border-border-emphasis hover:bg-surface-overlay hover:text-content"
        >
          <Crown className="h-4 w-4 text-warning" />
          Upgrade
        </button>

        {/* Publish/Update button */}
        <button
          onClick={onPublish}
          disabled={status !== 'running'}
          className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-content transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPublished ? 'Update' : 'Publish'}
        </button>

        {/* View Live button (shown when published) */}
        {isPublished && publishedUrl && (
          <a
            href={publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-success-muted px-4 py-1.5 text-sm font-medium text-content transition-colors hover:bg-success"
          >
            <ExternalLink className="h-4 w-4" />
            View Live
          </a>
        )}
      </div>
    </header>
  );
}
