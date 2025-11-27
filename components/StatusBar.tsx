'use client';

import { getThemeColors } from '@/lib/editorThemes';

interface StatusBarProps {
  status: 'idle' | 'compiling' | 'success' | 'error';
  message?: string;
  testResult?: 'none' | 'accepted' | 'wrong';
  editorTheme: string;
  executionTime?: string;
  memoryUsed?: number;
}

import { useMemo } from 'react';

export default function StatusBar({ status, message, testResult = 'none', editorTheme, executionTime, memoryUsed }: StatusBarProps) {
  const colors = useMemo(() => getThemeColors(editorTheme), [editorTheme]);

  const statusInfo = useMemo(() => ({
    idle: { label: 'Idle', color: '#6B7280' },
    compiling: { label: 'Compiling…', color: '#F59E0B' },
    success: { label: 'Compilation successful', color: '#16A34A' },
    error: { label: 'Compilation successful', color: '#DC2626' },
  }[status]), [status]);

  const resultInfo = useMemo(() => testResult === 'accepted'
    ? { label: 'Accepted', color: '#16A34A' }
    : testResult === 'wrong'
      ? { label: 'Wrong Answer', color: '#DC2626' }
      : null, [testResult]);

  // Format execution stats: "Accepted, 3ms, 2.68MB"
  const statsDisplay = useMemo(() => {
    if (!resultInfo) return undefined;
    if (!executionTime || !memoryUsed) return resultInfo.label;
    const timeMs = Math.round(parseFloat(executionTime) * 1000);
    const memMB = (memoryUsed / 1024).toFixed(2);
    return `${resultInfo.label}, ${timeMs}ms, ${memMB}MB`;
  }, [resultInfo, executionTime, memoryUsed]);

  return (
    <div
      className="h-8 w-full flex items-center px-3 text-xs select-none"
      style={{
        backgroundColor: colors.secondaryBackground,
        borderTop: `1px solid ${colors.border}`,
        color: colors.foreground,
      }}
      role="status"
      aria-live="polite"
    >
      {/* Left: compilation status */}
      <div className="flex items-center gap-2">
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 9999,
            display: 'inline-block',
            backgroundColor: statusInfo.color,
          }}
        />
        <span>{statusInfo.label}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: execution result and theme */}
      <div className="flex items-center gap-4" style={{ opacity: 0.85 }}>
        {statsDisplay && (
          <div className="flex items-center gap-1">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                backgroundColor: resultInfo!.color,
                display: 'inline-block'
              }}
            />
            <span>{statsDisplay}</span>
          </div>
        )}
        {message && <span style={{ color: '#DC2626' }}>{message}</span>}
        <span style={{ opacity: 0.7 }}>Theme: {editorTheme}</span>
      </div>
    </div>
  );
}
