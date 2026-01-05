/**
 * Header Tabs Component
 * Preview/Code tab buttons for the builder header
 */

import { Eye, Code2 } from 'lucide-react';

export type BuilderViewMode = 'preview' | 'code';

interface HeaderTabsProps {
  viewMode: BuilderViewMode;
  onViewModeChange: (mode: BuilderViewMode) => void;
}

export function HeaderTabs({ viewMode, onViewModeChange }: HeaderTabsProps) {
  return (
    <div className="flex items-center rounded-lg bg-surface-overlay/50 p-1">
      <button
        onClick={() => onViewModeChange('preview')}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          viewMode === 'preview'
            ? 'bg-surface-overlay text-content'
            : 'text-content-muted hover:text-content'
        }`}
      >
        <Eye className="h-4 w-4" />
        Preview
      </button>
      <button
        onClick={() => onViewModeChange('code')}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          viewMode === 'code'
            ? 'bg-surface-overlay text-content'
            : 'text-content-muted hover:text-content'
        }`}
      >
        <Code2 className="h-4 w-4" />
        Code
      </button>
    </div>
  );
}
