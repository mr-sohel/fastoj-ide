'use client';

import { getThemeColors } from '@/lib/editorThemes';

interface StatusBarProps {
  status: 'idle' | 'compiling' | 'success' | 'error';
  message?: string;
  testResult?: 'none' | 'accepted' | 'wrong';
  editorTheme: string;
}

export default function StatusBar({ status, message, testResult = 'none', editorTheme }: StatusBarProps) {
  const colors = getThemeColors(editorTheme);

  const statusInfo = {
    idle: { label: 'Idle', color: '#6B7280' },
    compiling: { label: 'Compiling…', color: '#F59E0B' },
    success: { label: 'Compiled successfully', color: '#16A34A' },
    error: { label: 'Compilation failed', color: '#DC2626' },
  }[status];

  const resultInfo = testResult === 'accepted'
    ? { label: 'Accepted', color: '#16A34A' }
    : testResult === 'wrong'
      ? { label: 'Wrong Answer', color: '#DC2626' }
      : null;

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
      {/* Left: status indicator */}
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
        {message ? <span style={{ opacity: 0.8 }}>— {message}</span> : null}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: quick info */}
      <div className="flex items-center gap-4" style={{ opacity: 0.85 }}>
        {resultInfo && (
          <div className="flex items-center gap-1">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                backgroundColor: resultInfo.color,
                display: 'inline-block'
              }}
            />
            <span>{resultInfo.label}</span>
          </div>
        )}
        <span style={{ opacity: 0.7 }}>Theme: {editorTheme}</span>
      </div>
    </div>
  );
}
