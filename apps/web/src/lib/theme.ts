/**
 * Theme utilities for reading CSS design tokens at runtime
 * Used by external libraries (xterm, Monaco) that require hex values
 */

/**
 * Get a CSS variable value from :root
 * Falls back to provided default if variable is not set
 */
export function getCSSVariable(name: string, fallback?: string): string {
  if (typeof window === 'undefined') {
    return fallback ?? '';
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback || '';
}

/**
 * Terminal theme configuration using CSS design tokens
 * Returns xterm ITheme compatible object
 */
export function getTerminalTheme() {
  return {
    background: getCSSVariable('--terminal-bg', '#0d0d0d'),
    foreground: getCSSVariable('--terminal-fg', '#e5e5e5'),
    cursor: getCSSVariable('--terminal-cursor', '#a78bfa'),
    cursorAccent: getCSSVariable('--terminal-cursor-accent', '#0d0d0d'),
    selectionBackground: getCSSVariable('--terminal-selection', 'rgba(68, 71, 90, 0.5)'),
    black: getCSSVariable('--terminal-black', '#0d0d0d'),
    red: getCSSVariable('--terminal-red', '#ff5555'),
    green: getCSSVariable('--terminal-green', '#50fa7b'),
    yellow: getCSSVariable('--terminal-yellow', '#f1fa8c'),
    blue: getCSSVariable('--terminal-blue', '#6272a4'),
    magenta: getCSSVariable('--terminal-magenta', '#ff79c6'),
    cyan: getCSSVariable('--terminal-cyan', '#8be9fd'),
    white: getCSSVariable('--terminal-white', '#f8f8f2'),
    brightBlack: getCSSVariable('--terminal-bright-black', '#6272a4'),
    brightRed: getCSSVariable('--terminal-bright-red', '#ff6e6e'),
    brightGreen: getCSSVariable('--terminal-bright-green', '#69ff94'),
    brightYellow: getCSSVariable('--terminal-bright-yellow', '#ffffa5'),
    brightBlue: getCSSVariable('--terminal-bright-blue', '#d6acff'),
    brightMagenta: getCSSVariable('--terminal-bright-magenta', '#ff92df'),
    brightCyan: getCSSVariable('--terminal-bright-cyan', '#a4ffff'),
    brightWhite: getCSSVariable('--terminal-bright-white', '#ffffff'),
  };
}

/**
 * Monaco editor theme configuration using CSS design tokens
 * Returns Monaco IStandaloneThemeData compatible object
 */
export function getEditorTheme() {
  return {
    base: 'vs-dark' as const,
    inherit: true,
    rules: [
      { token: 'comment', foreground: getCSSVariable('--syntax-comment', '6272a4').replace('#', ''), fontStyle: 'italic' },
      { token: 'keyword', foreground: getCSSVariable('--syntax-keyword', 'ff79c6').replace('#', '') },
      { token: 'string', foreground: getCSSVariable('--syntax-string', 'f1fa8c').replace('#', '') },
      { token: 'number', foreground: getCSSVariable('--syntax-number', 'bd93f9').replace('#', '') },
      { token: 'type', foreground: getCSSVariable('--syntax-type', '8be9fd').replace('#', ''), fontStyle: 'italic' },
      { token: 'function', foreground: getCSSVariable('--syntax-function', '50fa7b').replace('#', '') },
      { token: 'variable', foreground: getCSSVariable('--syntax-variable', 'f8f8f2').replace('#', '') },
      { token: 'constant', foreground: getCSSVariable('--syntax-constant', 'bd93f9').replace('#', '') },
      { token: 'parameter', foreground: getCSSVariable('--syntax-parameter', 'ffb86c').replace('#', '') },
      { token: 'tag', foreground: getCSSVariable('--syntax-tag', 'ff79c6').replace('#', '') },
      { token: 'attribute.name', foreground: getCSSVariable('--syntax-attribute', '50fa7b').replace('#', '') },
      { token: 'attribute.value', foreground: getCSSVariable('--syntax-attribute-value', 'f1fa8c').replace('#', '') },
    ],
    colors: {
      'editor.background': getCSSVariable('--editor-bg', '#0d0d0d'),
      'editor.foreground': getCSSVariable('--editor-fg', '#f8f8f2'),
      'editor.lineHighlightBackground': getCSSVariable('--editor-line-highlight', '#1a1a2e'),
      'editor.selectionBackground': getCSSVariable('--editor-selection', '#44475a'),
      'editor.inactiveSelectionBackground': getCSSVariable('--editor-selection-inactive', '#44475a88'),
      'editorCursor.foreground': getCSSVariable('--editor-cursor', '#a78bfa'),
      'editorLineNumber.foreground': getCSSVariable('--editor-line-number', '#6272a4'),
      'editorLineNumber.activeForeground': getCSSVariable('--editor-line-number-active', '#f8f8f2'),
      'editorIndentGuide.background': getCSSVariable('--editor-indent-guide', '#282a3655'),
      'editorIndentGuide.activeBackground': getCSSVariable('--editor-indent-guide-active', '#6272a4'),
      'editorGutter.background': getCSSVariable('--editor-gutter', '#0d0d0d'),
      'editor.wordHighlightBackground': getCSSVariable('--editor-word-highlight', '#44475a55'),
      'editor.wordHighlightStrongBackground': getCSSVariable('--editor-word-highlight-strong', '#44475a88'),
      'editorBracketMatch.background': getCSSVariable('--editor-bracket-match-bg', '#44475a'),
      'editorBracketMatch.border': getCSSVariable('--editor-bracket-match-border', '#f1fa8c'),
      'scrollbar.shadow': '#0000001a',
      'scrollbarSlider.background': getCSSVariable('--editor-scrollbar', '#44475a55'),
      'scrollbarSlider.hoverBackground': getCSSVariable('--editor-scrollbar-hover', '#44475a88'),
      'scrollbarSlider.activeBackground': getCSSVariable('--editor-scrollbar-active', '#44475a'),
    },
  };
}
