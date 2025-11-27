'use client';

import { useMemo, useRef } from 'react';

interface LineNumberedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fontFamily: string;
  colors: {
    background: string;
    foreground: string;
    border: string;
    secondaryBackground: string;
  };
  className?: string;
}

export default function LineNumberedTextarea({
  value,
  onChange,
  placeholder,
  fontFamily,
  colors,
  className,
}: LineNumberedTextareaProps) {
  const lines = useMemo(() => Math.max(1, value.split('\n').length), [value]);
  const gutterRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = () => {
    if (gutterRef.current && areaRef.current) {
      gutterRef.current.scrollTop = areaRef.current.scrollTop;
    }
  };

  return (
    <div
      className={`flex h-full overflow-hidden ${className || ''}`}
      style={{ backgroundColor: colors.background }}
    >
      {/* Gutter */}
      <div
        ref={gutterRef}
        className="h-full overflow-hidden text-right select-none"
        style={{
          backgroundColor: colors.secondaryBackground,
          color: colors.foreground,
          opacity: 0.6,
          fontFamily,
          lineHeight: '21px',
          fontSize: '14px',
          paddingTop: '16px',
          paddingBottom: '16px',
          paddingLeft: '6px',
          paddingRight: '8px',
          minWidth: '40px',
          borderRight: `1px solid ${colors.border}`,
        }}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} style={{ height: '21px' }}>{i + 1}</div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={areaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        className="flex-1 h-full resize-none focus:outline-none"
        style={{
          backgroundColor: colors.background,
          color: colors.foreground,
          fontFamily,
          lineHeight: '21px',
          fontSize: '14px',
          paddingTop: '16px',
          paddingBottom: '16px',
          paddingLeft: '16px',
          paddingRight: '16px',
          border: 'none',
          outline: 'none',
        }}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
}
