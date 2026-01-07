/**
 * Collapsible Sidebar Component
 * Animated sidebar with collapse/expand functionality
 */

import type { User } from '@supabase/supabase-js';
import {
  Home,
  Search,
  LayoutGrid,
  Star,
  Users,
  Compass,
  Gamepad2,
  BookOpen,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { SidebarItem, SidebarSection } from './SidebarItem';
import { WorkspaceDropdown } from './WorkspaceDropdown';
import { LogoIcon } from './Logo';
import type { NavItem, WorkspaceWithMembership } from '../types';

interface SidebarProps {
  user: User;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenFeedback?: () => void;
  onSignOut: () => void;
  showUserMenu: boolean;
  onToggleUserMenu: () => void;
  // Workspace dropdown props
  studioName?: string;
  plan?: 'free' | 'pro';
  creditsRemaining?: number;
  totalCredits?: number;
  onUpgrade?: () => void;
  workspaces?: WorkspaceWithMembership[];
  activeWorkspaceId?: string | null;
  onSelectWorkspace?: (workspaceId: string | null) => void;
  onCreateWorkspace?: () => void;
  isLoadingWorkspaces?: boolean;
}

export function Sidebar({
  user,
  isCollapsed,
  onToggleCollapse,
  activeNav,
  onNavChange,
  onOpenSettings,
  onOpenSearch,
  onOpenFeedback,
  onSignOut,
  showUserMenu,
  onToggleUserMenu,
  studioName = 'My Studio',
  plan = 'free',
  creditsRemaining = 50,
  totalCredits = 50,
  onUpgrade,
  workspaces = [],
  activeWorkspaceId = null,
  onSelectWorkspace,
  onCreateWorkspace,
  isLoadingWorkspaces = false,
}: SidebarProps) {
  return (
    <aside
      className={`flex flex-col border-r border-border-muted bg-surface-muted transition-all duration-300 ease-out ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo + Collapse toggle */}
      <div className="flex h-14 items-center justify-between border-b border-border-muted px-3">
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <LogoIcon size={32} className="shrink-0" />
          {!isCollapsed && (
            <span className="text-gradient-dual text-lg font-bold">
              PlayCraft
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar (⌘B)"
            className="rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-surface-overlay hover:text-content"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Collapse button when collapsed */}
      {isCollapsed && (
        <button
          onClick={onToggleCollapse}
          title="Expand sidebar (⌘B)"
          className="mx-auto my-2 rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-surface-overlay hover:text-content"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Workspace dropdown */}
      <div className="border-b border-border-muted p-3">
        <WorkspaceDropdown
          user={user}
          studioName={studioName}
          plan={plan}
          creditsRemaining={creditsRemaining}
          totalCredits={totalCredits}
          isOpen={showUserMenu}
          onToggle={onToggleUserMenu}
          onOpenSettings={onOpenSettings}
          onUpgrade={onUpgrade}
          onSignOut={onSignOut}
          collapsed={isCollapsed}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={onSelectWorkspace}
          onCreateWorkspace={onCreateWorkspace}
          isLoadingWorkspaces={isLoadingWorkspaces}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <SidebarSection title="" collapsed={isCollapsed}>
          <SidebarItem
            icon={Home}
            label="Home"
            active={activeNav === 'home'}
            collapsed={isCollapsed}
            onClick={() => onNavChange('home')}
          />
          <SidebarItem
            icon={Search}
            label="Search"
            collapsed={isCollapsed}
            onClick={onOpenSearch}
          />
        </SidebarSection>

        <SidebarSection title="Projects" collapsed={isCollapsed}>
          <SidebarItem
            icon={LayoutGrid}
            label="All projects"
            active={activeNav === 'projects'}
            collapsed={isCollapsed}
            onClick={() => onNavChange('projects')}
          />
          <SidebarItem
            icon={Star}
            label="Starred"
            active={activeNav === 'starred'}
            collapsed={isCollapsed}
            onClick={() => onNavChange('starred')}
          />
          <SidebarItem
            icon={Users}
            label="Shared with me"
            active={activeNav === 'shared'}
            collapsed={isCollapsed}
            onClick={() => onNavChange('shared')}
          />
        </SidebarSection>

        <SidebarSection title="Resources" collapsed={isCollapsed}>
          <SidebarItem
            icon={Compass}
            label="Discover"
            active={activeNav === 'discover'}
            collapsed={isCollapsed}
            onClick={() => onNavChange('discover')}
          />
          <SidebarItem
            icon={Gamepad2}
            label="Templates"
            active={activeNav === 'templates'}
            collapsed={isCollapsed}
            onClick={() => onNavChange('templates')}
          />
          <SidebarItem
            icon={BookOpen}
            label="Learn"
            collapsed={isCollapsed}
            onClick={() => window.open('https://docs.playcraft.games', '_blank')}
            external
          />
        </SidebarSection>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border-muted p-3 space-y-2">
        {/* Feedback button */}
        {onOpenFeedback && (
          <SidebarItem
            icon={MessageSquare}
            label="Feedback"
            collapsed={isCollapsed}
            onClick={onOpenFeedback}
          />
        )}

        {/* Upgrade button */}
        {!isCollapsed ? (
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center gap-3 rounded-lg bg-gradient-to-r from-accent/20 to-secondary/20 px-3 py-2.5 text-left transition-all hover:from-accent/30 hover:to-secondary/30 hover:shadow-glow-sm"
          >
            <Zap className="h-4 w-4 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-content">Upgrade to Pro</p>
              <p className="text-xs text-content-subtle">Unlock more features</p>
            </div>
          </button>
        ) : (
          <SidebarItem
            icon={Zap}
            label="Upgrade"
            collapsed={isCollapsed}
            onClick={onOpenSettings}
          />
        )}

        <SidebarItem
          icon={Settings}
          label="Settings"
          collapsed={isCollapsed}
          onClick={onOpenSettings}
        />
      </div>
    </aside>
  );
}
