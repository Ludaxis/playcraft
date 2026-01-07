import { useState, memo } from 'react';
import { X, Download, Github, Loader2, Check, ExternalLink } from 'lucide-react';
import { getFileTree, readFile } from '../lib/webcontainer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export const ExportModal = memo(function ExportModal({
  isOpen,
  onClose,
  projectName = 'playcraft-project',
}: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsExporting(true);
    setExportStatus('idle');
    setErrorMessage('');

    try {
      // Dynamic import JSZip to reduce initial bundle size
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Get all files recursively
      const files = await getFileTree('/');

      // File node type
      interface FileNode {
        name: string;
        type: 'file' | 'directory';
        path: string;
        children?: FileNode[];
      }

      // Helper function to add files to zip
      const addFilesToZip = async (
        nodes: FileNode[],
        zipFolder: typeof zip
      ) => {
        for (const node of nodes) {
          if (node.type === 'file') {
            try {
              const content = await readFile(node.path);
              // Remove leading slash for zip path
              const zipPath = node.path.startsWith('/') ? node.path.slice(1) : node.path;
              zipFolder.file(zipPath, content);
            } catch (err) {
              console.warn(`Failed to read file: ${node.path}`, err);
            }
          } else if (node.type === 'directory' && node.children) {
            await addFilesToZip(node.children, zipFolder);
          }
        }
      };

      await addFilesToZip(files, zip);

      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
    } catch (err) {
      console.error('Export failed:', err);
      setExportStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to export project');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePushToGithub = async () => {
    // TODO: Implement GitHub OAuth and push functionality
    // For now, show instructions
    setExportStatus('idle');
    setErrorMessage('GitHub integration coming soon! For now, download the ZIP and push manually.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border-muted bg-surface-elevated shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-muted px-6 py-4">
          <h2 className="text-lg font-semibold text-content">Export Project</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-content-muted hover:bg-surface-overlay hover:text-content"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="mb-6 text-sm text-content-muted">
            Export your project to continue development locally or deploy it anywhere.
          </p>

          <div className="space-y-3">
            {/* Download ZIP */}
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface-overlay p-4 text-left transition-colors hover:border-accent hover:bg-surface-overlay/80 disabled:opacity-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                {isExporting ? (
                  <Loader2 className="h-6 w-6 animate-spin text-content" />
                ) : exportStatus === 'success' ? (
                  <Check className="h-6 w-6 text-content" />
                ) : (
                  <Download className="h-6 w-6 text-content" />
                )}
              </div>
              <div>
                <p className="font-medium text-content">Download ZIP</p>
                <p className="text-sm text-content-muted">Get all project files as a zip archive</p>
              </div>
            </button>

            {/* GitHub */}
            <button
              onClick={handlePushToGithub}
              className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface-overlay p-4 text-left transition-colors hover:border-accent hover:bg-surface-overlay/80"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated">
                <Github className="h-6 w-6 text-content" />
              </div>
              <div>
                <p className="font-medium text-content">Push to GitHub</p>
                <p className="text-sm text-content-muted">Create a new repository or push to existing</p>
              </div>
            </button>
          </div>

          {/* Status messages */}
          {exportStatus === 'success' && (
            <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">
              Project exported successfully!
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 rounded-lg bg-warning/10 p-3 text-sm text-warning">
              {errorMessage}
            </div>
          )}

          {/* Quick deploy links */}
          <div className="mt-6 border-t border-border-muted pt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-content-subtle">
              Deploy to
            </p>
            <div className="flex gap-2">
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-surface-overlay px-3 py-2 text-sm text-content-muted hover:bg-surface-elevated"
              >
                <span>Vercel</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://app.netlify.com/drop"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-surface-overlay px-3 py-2 text-sm text-content-muted hover:bg-surface-elevated"
              >
                <span>Netlify</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://railway.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-surface-overlay px-3 py-2 text-sm text-content-muted hover:bg-surface-elevated"
              >
                <span>Railway</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
