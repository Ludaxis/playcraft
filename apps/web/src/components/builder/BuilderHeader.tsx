/**
 * Builder Header Component
 * Top navigation bar with project dropdown, view tabs, device toggles, and action buttons
 */

import type { User } from '@supabase/supabase-js';
import {
  Download,
  LogOut,
  Share2,
  Rocket,
  Crown,
  ExternalLink,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import type { WebContainerStatus } from '../../hooks/useWebContainer';
import { Avatar } from '../Avatar';
import { HeaderTabs, type BuilderViewMode } from './HeaderTabs';
import { DeviceToggle, type DeviceMode } from './DeviceToggle';
import { ProjectDropdown } from './ProjectDropdown';

interface BuilderHeaderProps {
  user: User;
  status: WebContainerStatus;
  onExport: () => void;
  onSignOut: () => void;
  onShare?: () => void;
  onPublish?: () => void;
  onUpgrade?: () => void;
  onOpenHelp?: () => void;
  isPublished?: boolean;
  isPublishLoading?: boolean;
  publishedUrl?: string;
  // View mode and device toggles
  viewMode: BuilderViewMode;
  onViewModeChange: (mode: BuilderViewMode) => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  // Code mode specific
  onCloseCodeView?: () => void;
  // Project dropdown props
  projectName: string;
  studioName?: string;
  creditsRemaining?: number;
  totalCredits?: number;
  showProjectDropdown?: boolean;
  onToggleProjectDropdown?: () => void;
  onGoToDashboard?: () => void;
  onOpenSettings?: () => void;
  onAddCredits?: () => void;
  onRenameProject?: () => void;
  onStarProject?: () => void;
  onRemixProject?: () => void;
  isProjectStarred?: boolean;
}

export function BuilderHeader({
  user,
  status,
  onExport,
  onSignOut,
  onShare,
  onPublish,
  onUpgrade,
  onOpenHelp,
  isPublished = false,
  isPublishLoading = false,
  publishedUrl,
  viewMode,
  onViewModeChange,
  deviceMode,
  onDeviceModeChange,
  onRefresh,
  isRefreshing = false,
  onCloseCodeView,
  // Project dropdown
  projectName,
  studioName = 'My Studio',
  creditsRemaining = 50,
  totalCredits = 50,
  showProjectDropdown = false,
  onToggleProjectDropdown,
  onGoToDashboard,
  onOpenSettings,
  onAddCredits,
  onRenameProject,
  onStarProject,
  onRemixProject,
  isProjectStarred = false,
}: BuilderHeaderProps) {
  // Code mode header (simplified)
  if (viewMode === 'code') {
    return (
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-muted bg-surface-elevated px-4">
        {/* Left section - Project dropdown and View tabs */}
        <div className="flex items-center gap-4">
          {/* Project Dropdown */}
          <div className="w-64">
            <ProjectDropdown
              projectName={projectName}
              studioName={studioName}
              creditsRemaining={creditsRemaining}
              totalCredits={totalCredits}
              isOpen={showProjectDropdown}
              onToggle={onToggleProjectDropdown || (() => {})}
              onGoToDashboard={onGoToDashboard || (() => {})}
              onOpenSettings={onOpenSettings}
              onAddCredits={onAddCredits}
              onRenameProject={onRenameProject}
              onStarProject={onStarProject}
              onRemixProject={onRemixProject}
              isStarred={isProjectStarred}
            />
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-border" />

          <HeaderTabs viewMode={viewMode} onViewModeChange={onViewModeChange} />
        </div>

        {/* Right section - Simplified for Code mode */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-content-subtle">Read only</span>

          {/* Upgrade button */}
          <button
            onClick={onUpgrade}
            className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 text-sm text-warning transition-colors hover:border-warning/50 hover:bg-warning/20"
          >
            Upgrade
          </button>

          {/* Close button */}
          <button
            onClick={onCloseCodeView || (() => onViewModeChange('preview'))}
            className="flex items-center gap-2 rounded-lg bg-surface-overlay px-4 py-1.5 text-sm font-medium text-content transition-colors hover:bg-surface-overlay"
          >
            Close
          </button>
        </div>
      </header>
    );
  }

  // Preview mode header (full)
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface-elevated px-4">
      {/* Left section - Project dropdown, View tabs and device toggles */}
      <div className="flex items-center gap-4">
        {/* Project Dropdown */}
        <div className="w-64">
          <ProjectDropdown
            projectName={projectName}
            studioName={studioName}
            creditsRemaining={creditsRemaining}
            totalCredits={totalCredits}
            isOpen={showProjectDropdown}
            onToggle={onToggleProjectDropdown || (() => {})}
            onGoToDashboard={onGoToDashboard || (() => {})}
            onOpenSettings={onOpenSettings}
            onAddCredits={onAddCredits}
            onRenameProject={onRenameProject}
            onStarProject={onStarProject}
            onRemixProject={onRemixProject}
            isStarred={isProjectStarred}
          />
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Preview/Code tabs */}
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
      </div>

      {/* Right section - Action buttons and user */}
      <div className="flex items-center gap-2">
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
          className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 text-sm text-warning transition-colors hover:border-warning/50 hover:bg-warning/20"
        >
          <Crown className="h-4 w-4" />
          Upgrade
        </button>

        {/* Publish button */}
        {isPublished && publishedUrl ? (
          <a
            href={publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-success-muted px-4 py-1.5 text-sm font-medium text-content transition-colors hover:bg-success"
          >
            <ExternalLink className="h-4 w-4" />
            View Live
          </a>
        ) : (
          <button
            onClick={onPublish}
            disabled={status !== 'running' || isPublishLoading}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-content transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublishLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            {isPublishLoading ? 'Preparing...' : 'Publish'}
          </button>
        )}

        {/* Separator */}
        <div className="ml-2 h-6 w-px bg-border" />

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
          title="Help & FAQ"
          data-onboarding="help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Export button */}
        <button
          onClick={onExport}
          disabled={status !== 'running'}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface-overlay/50 px-3 py-1.5 text-sm text-content-muted transition-colors hover:border-border-emphasis hover:bg-surface-overlay hover:text-content disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export
        </button>

        {/* User section */}
        <div className="ml-2 flex items-center gap-2 border-l border-border pl-4">
          <Avatar
            src={user.user_metadata?.avatar_url}
            name={user.user_metadata?.full_name || user.email}
            size="sm"
          />
          <button
            onClick={onSignOut}
            className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

