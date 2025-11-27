'use client';

import { useState, memo, useMemo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { getThemeColors } from '@/lib/editorThemes';
import LineNumberedTextarea from '@/components/LineNumberedTextarea';
import LineNumberedPre from '@/components/LineNumberedPre';

interface IOPanelProps {
  input: string;
  onInputChange: (value: string) => void;
  stdout: string;
  expectedOutput: string;
  onExpectedChange: (value: string) => void;
  stderr: string;
  editorTheme: string;
  fontFamily: string;
  testResult: 'none' | 'accepted' | 'wrong';
}

type OutputTab = 'stdout' | 'expected' | 'stderr';

const IOPanel = memo(function IOPanel({
  input,
  onInputChange,
  stdout,
  expectedOutput,
  onExpectedChange,
  stderr,
  editorTheme,
  fontFamily,
  testResult,
}: IOPanelProps) {
  const [activeTab, setActiveTab] = useState<OutputTab>('stdout');
  
  const colors = getThemeColors(editorTheme);

  const tabs = [
    { id: 'stdout' as OutputTab, label: 'stdout' },
    { id: 'expected' as OutputTab, label: 'expected output' },
    { id: 'stderr' as OutputTab, label: 'stderr' },
  ];

  const getOutputContent = () => {
    switch (activeTab) {
      case 'stdout':
        return stdout;
      case 'expected':
        return expectedOutput;
      case 'stderr':
        return stderr;
      default:
        return '';
    }
  };

  return (
    <PanelGroup direction="vertical">
      {/* Input Section */}
      <Panel defaultSize={50} minSize={20}>
        <div className="flex flex-col h-full">
        <div 
          className="px-4 py-2"
          style={{ 
            backgroundColor: colors.secondaryBackground, 
            borderBottom: `1px solid ${colors.border}`,
            color: colors.foreground
          }}
        >
          <h3 className="text-sm font-medium">Input</h3>
        </div>
        <div className="flex-1">
          <LineNumberedTextarea
            value={input}
            onChange={onInputChange}
            placeholder="Enter input here..."
            fontFamily={fontFamily}
            colors={colors}
          />
        </div>
        </div>
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle 
        className="h-1 transition-colors cursor-row-resize" 
        style={{ backgroundColor: colors.border }}
        onMouseEnter={(e: any) => e.target.style.backgroundColor = '#3B82F6'}
        onMouseLeave={(e: any) => e.target.style.backgroundColor = colors.border}
      />

      {/* Output Section */}
      <Panel defaultSize={50} minSize={20}>
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div 
            className="flex"
            style={{ 
              backgroundColor: colors.secondaryBackground, 
              borderBottom: `1px solid ${colors.border}` 
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === tab.id ? colors.background : 'transparent',
                  color: colors.foreground,
                  borderBottom: activeTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                  opacity: activeTab === tab.id ? 1 : 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {tab.label}
                {tab.id !== 'stderr' && testResult !== 'none' && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 9999,
                      display: 'inline-block',
                      backgroundColor: testResult === 'accepted' ? '#16A34A' : '#DC2626'
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'expected' ? (
              <LineNumberedTextarea
                value={expectedOutput}
                onChange={onExpectedChange}
                placeholder="Enter expected output here..."
                fontFamily={fontFamily}
                colors={colors}
                className="h-full"
              />
            ) : (
              <LineNumberedPre
                value={getOutputContent()}
                fontFamily={fontFamily}
                colors={colors}
                className="h-full"
              />
            )}
          </div>
        </div>
      </Panel>
    </PanelGroup>
  );
});

export default IOPanel;
