'use client';

import React, { useState, useCallback } from 'react';
import { toSvg, toPng } from 'html-to-image';
import { useNavigation } from '@/store';

type ExportFormat = 'svg' | 'png';

interface ExportButtonProps {
  targetId?: string;
}

export function ExportButton({ targetId = 'app-content' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { state } = useNavigation();

  const handleExport = useCallback(async (format: ExportFormat) => {
    const node = document.getElementById(targetId);
    if (!node) {
      console.error('Export target not found');
      return;
    }

    setIsExporting(true);

    try {
      const options = {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      };

      let dataUrl: string;

      if (format === 'svg') {
        dataUrl = await toSvg(node, options);
      } else {
        dataUrl = await toPng(node, options);
      }

      // Create download link
      const link = document.createElement('a');
      const pageName = state.currentPage || 'page';
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `${pageName}-${timestamp}.${format}`;
      link.href = dataUrl;
      link.click();

      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [targetId, state.currentPage]);

  return (
    <div className="fixed bottom-20 right-3 z-[100]">
      {/* Export Options Menu */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[160px]">
          <button
            onClick={() => handleExport('svg')}
            disabled={isExporting}
            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L18.6 7 12 9.2 5.4 7 12 4.8zM4 8.5l7 3.5v7.5l-7-3.5V8.5zm9 11V12l7-3.5v7.5l-7 3.5z"/>
            </svg>
            <div>
              <div>SVG</div>
              <div className="text-xs text-gray-400">Editable in Figma</div>
            </div>
          </button>
          <div className="h-px bg-gray-200" />
          <button
            onClick={() => handleExport('png')}
            disabled={isExporting}
            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <div>
              <div>PNG</div>
              <div className="text-xs text-gray-400">High quality image</div>
            </div>
          </button>
        </div>
      )}

      {/* Main Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`
          w-12 h-12 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-200
          ${isOpen
            ? 'bg-gray-700 rotate-45'
            : 'bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800'
          }
          ${isExporting ? 'opacity-50 cursor-wait' : ''}
        `}
        title="Export page"
      >
        {isExporting ? (
          <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        ) : isOpen ? (
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
        )}
      </button>
    </div>
  );
}
