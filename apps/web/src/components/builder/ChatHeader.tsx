/**
 * Chat Header Component
 * Header for the chat panel with project dropdown, history and copy icons
 */

import { History, Copy } from 'lucide-react';
import { ProjectDropdown } from './ProjectDropdown';

interface ChatHeaderProps {
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
  onShowHistory?: () => void;
  onCopyChat?: () => void;
}

export function ChatHeader({
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
  onShowHistory,
  onCopyChat,
}: ChatHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-muted bg-surface-elevated px-3">
      {/* Left - Project Dropdown */}
      <div className="min-w-0 flex-1">
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

      {/* Right - Action icons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onShowHistory}
          className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
          title="Chat history"
        >
          <History className="h-4 w-4" />
        </button>
        <button
          onClick={onCopyChat}
          className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
          title="Copy chat"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
