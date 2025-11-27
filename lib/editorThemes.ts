import type { editor } from 'monaco-editor';

// Helper function to get theme colors for UI elements
export function getThemeColors(themeName: string) {
  const theme = customThemes[themeName];
  
  if (!theme) {
    // Default themes
    if (themeName === 'vs') {
      return {
        background: '#FFFFFF',
        foreground: '#000000',
        secondaryBackground: '#F3F3F3',
        border: '#E5E5E5',
        hoverBackground: '#E8E8E8',
      };
    } else if (themeName === 'vs-dark') {
      return {
        background: '#1E1E1E',
        foreground: '#D4D4D4',
        secondaryBackground: '#252526',
        border: '#3E3E42',
        hoverBackground: '#2A2D2E',
      };
    } else if (themeName === 'hc-black') {
      return {
        background: '#000000',
        foreground: '#FFFFFF',
        secondaryBackground: '#0C141F',
        border: '#6FC3DF',
        hoverBackground: '#1A2332',
      };
    } else if (themeName === 'hc-light') {
      return {
        background: '#FFFFFF',
        foreground: '#000000',
        secondaryBackground: '#F2F2F2',
        border: '#0F4A85',
        hoverBackground: '#E6E6E6',
      };
    }
  }
  
  // Custom themes
  return {
    background: theme?.colors?.['editor.background'] || '#1E1E1E',
    foreground: theme?.colors?.['editor.foreground'] || '#D4D4D4',
    secondaryBackground: theme?.colors?.['editor.lineHighlightBackground'] || '#252526',
    border: theme?.colors?.['editorLineNumber.foreground'] || '#3E3E42',
    hoverBackground: theme?.colors?.['editor.selectionBackground'] || '#2A2D2E',
  };
}

export const customThemes: Record<string, editor.IStandaloneThemeData> = {
  'monokai': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '88846F', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'F92672' },
      { token: 'string', foreground: 'E6DB74' },
      { token: 'number', foreground: 'AE81FF' },
      { token: 'type', foreground: '66D9EF', fontStyle: 'italic' },
      { token: 'class', foreground: 'A6E22E' },
      { token: 'function', foreground: 'A6E22E' },
      { token: 'variable', foreground: 'F8F8F2' },
      { token: 'constant', foreground: 'AE81FF' },
      { token: 'operator', foreground: 'F92672' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#F8F8F2',
      'editor.lineHighlightBackground': '#3E3D32',
      'editorLineNumber.foreground': '#90908A',
      'editor.selectionBackground': '#49483E',
      'editor.inactiveSelectionBackground': '#49483E',
      'editorCursor.foreground': '#F8F8F0',
    },
  },
  'solarized-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '586E75', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900' },
      { token: 'string', foreground: '2AA198' },
      { token: 'number', foreground: 'D33682' },
      { token: 'type', foreground: 'B58900' },
      { token: 'class', foreground: 'B58900' },
      { token: 'function', foreground: '268BD2' },
      { token: 'variable', foreground: '839496' },
      { token: 'constant', foreground: 'CB4B16' },
    ],
    colors: {
      'editor.background': '#002B36',
      'editor.foreground': '#839496',
      'editor.lineHighlightBackground': '#073642',
      'editorLineNumber.foreground': '#586E75',
      'editor.selectionBackground': '#073642',
      'editorCursor.foreground': '#839496',
    },
  },
  'solarized-light': {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '93A1A1', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900' },
      { token: 'string', foreground: '2AA198' },
      { token: 'number', foreground: 'D33682' },
      { token: 'type', foreground: 'B58900' },
      { token: 'class', foreground: 'B58900' },
      { token: 'function', foreground: '268BD2' },
      { token: 'variable', foreground: '657B83' },
      { token: 'constant', foreground: 'CB4B16' },
    ],
    colors: {
      'editor.background': '#FDF6E3',
      'editor.foreground': '#657B83',
      'editor.lineHighlightBackground': '#EEE8D5',
      'editorLineNumber.foreground': '#93A1A1',
      'editor.selectionBackground': '#EEE8D5',
      'editorCursor.foreground': '#657B83',
    },
  },
  'gruvbox-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '928374', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'FB4934' },
      { token: 'string', foreground: 'B8BB26' },
      { token: 'number', foreground: 'D3869B' },
      { token: 'type', foreground: 'FABD2F' },
      { token: 'class', foreground: 'FABD2F' },
      { token: 'function', foreground: '8EC07C' },
      { token: 'variable', foreground: 'EBDBB2' },
      { token: 'constant', foreground: 'D3869B' },
      { token: 'operator', foreground: 'FE8019' },
    ],
    colors: {
      'editor.background': '#282828',
      'editor.foreground': '#EBDBB2',
      'editor.lineHighlightBackground': '#3C3836',
      'editorLineNumber.foreground': '#7C6F64',
      'editor.selectionBackground': '#504945',
      'editorCursor.foreground': '#EBDBB2',
    },
  },
  'gruvbox-light': {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '928374', fontStyle: 'italic' },
      { token: 'keyword', foreground: '9D0006' },
      { token: 'string', foreground: '79740E' },
      { token: 'number', foreground: '8F3F71' },
      { token: 'type', foreground: 'B57614' },
      { token: 'class', foreground: 'B57614' },
      { token: 'function', foreground: '427B58' },
      { token: 'variable', foreground: '3C3836' },
      { token: 'constant', foreground: '8F3F71' },
      { token: 'operator', foreground: 'AF3A03' },
    ],
    colors: {
      'editor.background': '#FBF1C7',
      'editor.foreground': '#3C3836',
      'editor.lineHighlightBackground': '#EBDBB2',
      'editorLineNumber.foreground': '#928374',
      'editor.selectionBackground': '#D5C4A1',
      'editorCursor.foreground': '#3C3836',
    },
  },
  'github-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8B949E', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'FF7B72' },
      { token: 'string', foreground: 'A5D6FF' },
      { token: 'number', foreground: '79C0FF' },
      { token: 'type', foreground: 'FFA657' },
      { token: 'class', foreground: 'FFA657' },
      { token: 'function', foreground: 'D2A8FF' },
      { token: 'variable', foreground: 'C9D1D9' },
      { token: 'constant', foreground: '79C0FF' },
    ],
    colors: {
      'editor.background': '#0D1117',
      'editor.foreground': '#C9D1D9',
      'editor.lineHighlightBackground': '#161B22',
      'editorLineNumber.foreground': '#6E7681',
      'editor.selectionBackground': '#264F78',
      'editorCursor.foreground': '#C9D1D9',
    },
  },
  'github-light': {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'D73A49' },
      { token: 'string', foreground: '032F62' },
      { token: 'number', foreground: '005CC5' },
      { token: 'type', foreground: '6F42C1' },
      { token: 'class', foreground: '6F42C1' },
      { token: 'function', foreground: '6F42C1' },
      { token: 'variable', foreground: '24292E' },
      { token: 'constant', foreground: '005CC5' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#24292E',
      'editor.lineHighlightBackground': '#F6F8FA',
      'editorLineNumber.foreground': '#959DA5',
      'editor.selectionBackground': '#C8E1FF',
      'editorCursor.foreground': '#24292E',
    },
  },
  'dracula': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'FF79C6' },
      { token: 'string', foreground: 'F1FA8C' },
      { token: 'number', foreground: 'BD93F9' },
      { token: 'type', foreground: '8BE9FD', fontStyle: 'italic' },
      { token: 'class', foreground: '50FA7B' },
      { token: 'function', foreground: '50FA7B' },
      { token: 'variable', foreground: 'F8F8F2' },
      { token: 'constant', foreground: 'BD93F9' },
      { token: 'operator', foreground: 'FF79C6' },
    ],
    colors: {
      'editor.background': '#282A36',
      'editor.foreground': '#F8F8F2',
      'editor.lineHighlightBackground': '#44475A',
      'editorLineNumber.foreground': '#6272A4',
      'editor.selectionBackground': '#44475A',
      'editorCursor.foreground': '#F8F8F2',
    },
  },
  'nord': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '616E88', fontStyle: 'italic' },
      { token: 'keyword', foreground: '81A1C1' },
      { token: 'string', foreground: 'A3BE8C' },
      { token: 'number', foreground: 'B48EAD' },
      { token: 'type', foreground: '8FBCBB' },
      { token: 'class', foreground: '8FBCBB' },
      { token: 'function', foreground: '88C0D0' },
      { token: 'variable', foreground: 'D8DEE9' },
      { token: 'constant', foreground: 'B48EAD' },
    ],
    colors: {
      'editor.background': '#2E3440',
      'editor.foreground': '#D8DEE9',
      'editor.lineHighlightBackground': '#3B4252',
      'editorLineNumber.foreground': '#4C566A',
      'editor.selectionBackground': '#434C5E',
      'editorCursor.foreground': '#D8DEE9',
    },
  },
};
