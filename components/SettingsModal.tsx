'use client';

import { useEffect, useRef } from 'react';
import { getThemeColors } from '@/lib/editorThemes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    fontSize: number;
    fontFamily: string;
    editorTheme: string;
  };
  onSettingsChange: (settings: {
    fontSize: number;
    fontFamily: string;
    editorTheme: string;
  }) => void;
  editorTheme: string;
}

const FONT_FAMILIES = [
  { value: 'Monaco', label: 'Monaco' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Fira Code', label: 'Fira Code' },
];

const EDITOR_THEMES = [
  { value: 'vs', label: 'Visual Studio Light' },
  { value: 'vs-dark', label: 'Visual Studio Dark' },
  { value: 'hc-black', label: 'High Contrast Dark' },
  { value: 'hc-light', label: 'High Contrast Light' },
];

// Monaco's built-in themes (these are available by default)
const MONACO_THEMES = [
  { value: 'vs', label: 'Light' },
  { value: 'vs-dark', label: 'Dark' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'solarized-dark', label: 'Solarized Dark' },
  { value: 'solarized-light', label: 'Solarized Light' },
  { value: 'gruvbox-dark', label: 'Gruvbox Dark' },
  { value: 'gruvbox-light', label: 'Gruvbox Light' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'nord', label: 'Nord' },
];

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  editorTheme,
}: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const colors = getThemeColors(editorTheme);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={modalRef}
        className="absolute top-14 right-4 rounded shadow-lg w-64 p-4 pointer-events-auto"
        style={{
          backgroundColor: colors.secondaryBackground,
          border: `1px solid ${colors.border}`,
          color: colors.foreground
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">
            Settings
          </h3>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: colors.foreground, opacity: 0.6 }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Font Size */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ opacity: 0.9 }}>
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={settings.fontSize}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  fontSize: Number(e.target.value),
                })
              }
              className="w-full h-1.5 rounded appearance-none cursor-pointer"
              style={{ backgroundColor: colors.hoverBackground }}
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ opacity: 0.9 }}>
              Font
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  fontFamily: e.target.value,
                })
              }
              className="w-full px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                color: colors.foreground
              }}
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Editor Theme */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ opacity: 0.9 }}>
              Theme
            </label>
            <select
              value={settings.editorTheme}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  editorTheme: e.target.value,
                })
              }
              className="w-full px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                color: colors.foreground
              }}
            >
              {MONACO_THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
