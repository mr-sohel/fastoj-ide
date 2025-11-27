'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeEditor from '@/components/CodeEditor';
import IOPanel from '@/components/IOPanel';
import Navbar from '@/components/Navbar';
import SettingsModal from '@/components/SettingsModal';
import StatusBar from '@/components/StatusBar';
import { getThemeColors } from '@/lib/editorThemes';
import { runCppLocal } from '@/lib/runCode';

const defaultCode = `#include <bits/stdc++.h>
using namespace std;

int main() {
   // your code goes here

   return 0;
}`;

export default function Home() {
  const [code, setCode] = useState(defaultCode);
  const [input, setInput] = useState('');
  const [stdout, setStdout] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [stderr, setStderr] = useState('');
  const [testResult, setTestResult] = useState<'none' | 'accepted' | 'wrong'>('none');
  const [compileStatus, setCompileStatus] = useState<'idle' | 'compiling' | 'success' | 'error'>('idle');
  const [compileMessage, setCompileMessage] = useState<string>('');
  const [compileErrors, setCompileErrors] = useState<string>('');
  const compileTimerRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    fontFamily: 'Monaco',
    editorTheme: 'vs-dark',
  });

  // Load code and settings from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('code');
    const savedSettings = localStorage.getItem('editorSettings');
    
    if (savedCode) {
      setCode(savedCode);
    }

    if (savedSettings) {
      setEditorSettings(JSON.parse(savedSettings));
    }
    
    setMounted(true);
  }, []);

  // Save code to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('code', code);
  }, [code, mounted]);

  // Save editor settings to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('editorSettings', JSON.stringify(editorSettings));
  }, [editorSettings, mounted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B: Run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleRun();
      }
      // Ctrl+S: Save code manually
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        localStorage.setItem('code', code);
        setCompileMessage('Code saved');
        setTimeout(() => {
          if (compileStatus === 'idle') setCompileMessage('');
        }, 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, input, expectedOutput, compileStatus]);

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solution.cpp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Normalize output for comparison
  const normalize = useCallback((s: string) => 
    s.replace(/\r/g, '').split(/\n/).map(l => l.replace(/\s+$/, '')).join('\n').trim(), 
    []
  );

  const handleRun = async () => {
    if (compileTimerRef.current) {
      clearTimeout(compileTimerRef.current);
      compileTimerRef.current = null;
    }
    setCompileStatus('compiling');
    setCompileMessage('Compiling…');
    setTestResult('none');
    setStdout('');
    setStderr('');

    try {
      const res = await runCppLocal(code, input);

      // Compilation errors (only if status is CE)
      if (res.status && res.status.id === 6) {
        setStderr(res.compile_output || 'Compilation error');
        setCompileStatus('error');
        setCompileMessage('Compilation error');
        setCompileErrors(res.compile_output || '');
        setTestResult('none');
        return;
      }

      // Clear compile errors on success
      setCompileErrors('');

      // Runtime output
      setStdout(res.stdout || '');
      setStderr(res.stderr || '');

      const meta: string[] = [];
      if (res.time) meta.push(`${res.time}s`);
      if (typeof res.memory === 'number') meta.push(`${res.memory} KB`);
      const baseMsg = meta.length ? `Ran in ${meta.join(', ')}` : 'Run completed';

      // Check for runtime errors based on status, not just stderr presence
      if (res.status && res.status.id === 4) {
        setCompileStatus('error');
        setCompileMessage(`${baseMsg} • Runtime error`);
        setTestResult('none');
        return;
      }

      if (expectedOutput.trim().length > 0) {
        if (normalize(res.stdout || '') === normalize(expectedOutput)) {
          setCompileStatus('success');
          setCompileMessage(`${baseMsg} • Accepted`);
          setTestResult('accepted');
        } else {
          setCompileStatus('success');
          setCompileMessage(`${baseMsg} • Wrong Answer`);
          setTestResult('wrong');
        }
      } else {
        setCompileStatus('success');
        setCompileMessage(baseMsg);
        setTestResult('none');
      }
    } catch (err: any) {
      setCompileStatus('error');
      setCompileMessage(`Run failed: ${err?.message || 'Unknown error'}`);
      setTestResult('none');
    }
  };

  const handleCodeChange = useCallback((value: string | undefined) => {
    setCode(value || '');
  }, []);

  const handleReset = useCallback(() => {
    setCode(defaultCode);
    setInput('');
    setStdout('');
    setExpectedOutput('');
    setStderr('');
    setCompileStatus('idle');
    setCompileMessage('');
    setCompileErrors('');
    setTestResult('none');
  }, [defaultCode]);

  const handleSettingsChange = useCallback((newSettings: typeof editorSettings) => {
    setEditorSettings(newSettings);
  }, []);

  // Memoize theme colors to avoid recalculation
  const colors = useMemo(() => getThemeColors(editorSettings.editorTheme), [editorSettings.editorTheme]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: colors.background }}>
      <Navbar
        onDownload={handleDownload}
        onRun={handleRun}
        onReset={handleReset}
        onSettings={() => setIsSettingsOpen(true)}
        editorTheme={editorSettings.editorTheme}
      />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={editorSettings}
        onSettingsChange={handleSettingsChange}
        editorTheme={editorSettings.editorTheme}
      />
      
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Code Editor Panel */}
          <Panel defaultSize={60} minSize={30}>
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              fontSize={editorSettings.fontSize}
              fontFamily={editorSettings.fontFamily}
              editorTheme={editorSettings.editorTheme}
              compileErrors={compileErrors}
            />
          </Panel>
          
          {/* Resize Handle */}
          <PanelResizeHandle 
            className="w-1 transition-colors cursor-col-resize" 
            style={{ backgroundColor: colors.border }}
            onMouseEnter={(e: any) => e.target.style.backgroundColor = '#3B82F6'}
            onMouseLeave={(e: any) => e.target.style.backgroundColor = colors.border}
          />
          
          {/* I/O Panel */}
          <Panel defaultSize={40} minSize={25}>
            <IOPanel
              input={input}
              onInputChange={setInput}
              stdout={stdout}
              expectedOutput={expectedOutput}
              onExpectedChange={setExpectedOutput}
              stderr={stderr}
              editorTheme={editorSettings.editorTheme}
              fontFamily={editorSettings.fontFamily}
              testResult={testResult}
            />
          </Panel>
        </PanelGroup>
      </div>

      <StatusBar
        status={compileStatus}
        message={compileMessage}
        testResult={testResult}
        editorTheme={editorSettings.editorTheme}
      />
    </div>
  );
}
