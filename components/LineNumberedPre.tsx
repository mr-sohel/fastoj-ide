'use client';

import { useMemo, useRef } from 'react';

interface LineNumberedPreProps {
  value: string;
  fontFamily: string;
  colors: {
    background: string;
    foreground: string;
    border: string;
    secondaryBackground: string;
  };
  className?: string;
}

export default function LineNumberedPre({ value, fontFamily, colors, className }: LineNumberedPreProps) {
  const lines = useMemo(() => Math.max(1, value.split('\n').length), [value]);
  const gutterRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (gutterRef.current && contentRef.current) {
      gutterRef.current.scrollTop = contentRef.current.scrollTop || 0;
    }
  };

  return (
    <div className={`flex h-full overflow-hidden ${className || ''}`} style={{ backgroundColor: colors.background }}>
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

      {/* Content */}
      <div
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 h-full overflow-auto"
        style={{ backgroundColor: colors.background }}
      >
        <pre
          className="whitespace-pre-wrap"
          style={{
            color: colors.foreground,
            fontFamily,
            lineHeight: '21px',
            fontSize: '14px',
            paddingTop: '16px',
            paddingBottom: '16px',
            paddingLeft: '16px',
            paddingRight: '16px',
            margin: 0,
          }}
        >
          {value || <span style={{ opacity: 0.5 }}>No output yet</span>}
        </pre>
      </div>
    </div>
  );
}
