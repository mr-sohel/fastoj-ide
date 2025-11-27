'use client';

import { Editor, OnMount } from '@monaco-editor/react';
import { useEffect, useState, useRef, memo } from 'react';
import { customThemes } from '@/lib/editorThemes';
import type * as Monaco from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  fontSize: number;
  fontFamily: string;
  editorTheme: string;
  compileErrors?: string;
}

const CodeEditor = memo(function CodeEditor({ code, onChange, fontSize, fontFamily, editorTheme, compileErrors }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register all custom themes
    Object.entries(customThemes).forEach(([themeName, themeData]) => {
      monaco.editor.defineTheme(themeName, themeData);
    });
    
    // Set the theme if it's a custom one
    if (customThemes[editorTheme]) {
      monaco.editor.setTheme(editorTheme);
    }

  };

  // Parse g++ errors and set markers
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !compileErrors) {
      // Clear markers if no errors
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monacoRef.current.editor.setModelMarkers(model, 'cpp', []);
        }
      }
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) return;

    const markers: Monaco.editor.IMarkerData[] = [];
    // Parse g++ error format: main.cpp:5:10: error: ...
    const errorRegex = /main\.cpp:(\d+):(\d+):\s+(error|warning):\s+(.+)/g;
    let match;

    while ((match = errorRegex.exec(compileErrors)) !== null) {
      const line = parseInt(match[1], 10);
      const column = parseInt(match[2], 10);
      const severity = match[3] === 'error' 
        ? monacoRef.current.MarkerSeverity.Error 
        : monacoRef.current.MarkerSeverity.Warning;
      const message = match[4].trim();

      markers.push({
        startLineNumber: line,
        startColumn: column,
        endLineNumber: line,
        endColumn: column + 1,
        message,
        severity,
      });
    }

    monacoRef.current.editor.setModelMarkers(model, 'cpp', markers);
  }, [compileErrors]);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading editor...</p>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="cpp"
      value={code}
      onChange={onChange}
      theme={editorTheme}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: fontSize,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 3,
        insertSpaces: true,
        detectIndentation: false,
        fontFamily: fontFamily,
        padding: { top: 16, bottom: 16 },
      }}
    />
  );
});

export default CodeEditor;
