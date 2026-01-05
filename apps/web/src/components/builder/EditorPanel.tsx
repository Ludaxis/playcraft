/**
 * Editor Panel Component
 * Code editor with file header
 */

import { Code, Loader2 } from 'lucide-react';
import { CodeEditor } from '../CodeEditor';

interface EditorPanelProps {
  selectedFile: string | null;
  fileContent: string;
  isLoading: boolean;
  onChange: (content: string) => void;
}

export function EditorPanel({
  selectedFile,
  fileContent,
  isLoading,
  onChange,
}: EditorPanelProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden border-r border-border-muted">
      {/* Editor header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border-muted bg-surface-elevated px-3">
        <div className="flex items-center gap-2 text-sm text-content-muted">
          <Code className="h-4 w-4" />
          {selectedFile ? (
            <span className="text-content">{selectedFile}</span>
          ) : (
            <span>Select a file to edit</span>
          )}
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center bg-[#0d0d0d]">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <CodeEditor
            filePath={selectedFile}
            content={fileContent}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}
