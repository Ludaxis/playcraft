import { useCallback, memo } from 'react';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import { getEditorTheme } from '../lib/theme';

// Configure Monaco to use CDN
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
  },
});

interface CodeEditorProps {
  filePath: string | null;
  content: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

// Get language from file extension
function getLanguage(filePath: string | null): string {
  if (!filePath) return 'plaintext';

  const ext = filePath.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'scss':
      return 'scss';
    case 'html':
      return 'html';
    case 'md':
    case 'mdx':
      return 'markdown';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'xml':
      return 'xml';
    case 'sql':
      return 'sql';
    case 'sh':
    case 'bash':
      return 'shell';
    case 'py':
      return 'python';
    default:
      return 'plaintext';
  }
}

export const CodeEditor = memo(function CodeEditor({
  filePath,
  content,
  onChange,
  readOnly = false,
  className = '',
}: CodeEditorProps) {
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    // Define custom theme using design tokens
    monaco.editor.defineTheme('playcraft-dark', getEditorTheme());

    // Set theme
    monaco.editor.setTheme('playcraft-dark');

    // Configure TypeScript/JavaScript defaults
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      // Ensure Monaco accepts our in-memory file names and keeps models in sync
      allowNonTsExtensions: true,
      allowArbitraryExtensions: true,
      strict: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      allowJs: true,
      checkJs: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      allowJs: true,
    });

    // Add React types
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module 'react' {
        export * from '@types/react';
      }`,
      'react.d.ts'
    );

    // Focus editor
    editor.focus();
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        onChange(value);
      }
    },
    [onChange]
  );

  const language = getLanguage(filePath);
  // Use the real file path so Monaco's TS worker treats the model as a real source file
  const editorPath = filePath || 'untitled.tsx';

  if (!filePath) {
    return (
      <div className={`flex h-full items-center justify-center bg-[var(--editor-bg)] text-content-subtle ${className}`}>
        Select a file to edit
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <Editor
        height="100%"
        language={language}
        value={content}
        path={editorPath}
        onChange={handleChange}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          readOnly,
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
          fontLigatures: true,
          lineHeight: 22,
          letterSpacing: 0.5,
          minimap: { enabled: true, scale: 2 },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          insertSpaces: true,
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          folding: true,
          foldingStrategy: 'indentation',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          mouseWheelZoom: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-[var(--editor-bg)] text-content-subtle">
            Loading editor...
          </div>
        }
      />
    </div>
  );
});
