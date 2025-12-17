'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { toSvg, toPng, toBlob } from 'html-to-image';
import { useNavigation } from '@/store';

type ExportFormat = 'svg' | 'png' | 'clipboard';

interface ExportButtonProps {
  targetId?: string;
}

export function ExportButton({ targetId = 'app-content' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const { state } = useNavigation();

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle component selection mode
  useEffect(() => {
    if (!isSelectMode) {
      setHoveredElement(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const exportable = findExportableParent(target);
      if (exportable && exportable.id !== 'app-content' && !exportable.closest('.export-button-container')) {
        setHoveredElement(exportable);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Ignore clicks on the export button itself
      if (target.closest('.export-button-container')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const exportable = findExportableParent(target);
      if (exportable && exportable.id !== 'app-content') {
        setSelectedElement(exportable);
        setIsSelectMode(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSelectMode(false);
        setHoveredElement(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelectMode]);

  // Find a meaningful parent element to export
  const findExportableParent = (element: HTMLElement): HTMLElement | null => {
    let current: HTMLElement | null = element;

    while (current && current.id !== 'app-content') {
      const isButton = current.tagName === 'BUTTON';
      const isCard = current.classList.contains('rounded-xl') ||
                     current.classList.contains('rounded-2xl') ||
                     current.classList.contains('rounded-lg');
      const isPanel = current.classList.contains('bg-bg-card') ||
                      current.classList.contains('bg-brand-muted') ||
                      current.classList.contains('bg-bg-muted') ||
                      current.classList.contains('bg-bg-inverse');
      const isModal = current.classList.contains('fixed') && current.classList.contains('inset-0');
      const hasRole = current.getAttribute('role') !== null;

      if (isButton || isCard || isPanel || isModal || hasRole) {
        return current;
      }

      current = current.parentElement;
    }

    return element;
  };

  const doExport = async (format: ExportFormat, element: HTMLElement) => {
    setIsExporting(true);

    try {
      const options = {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        filter: (filterNode: Element) => {
          if (filterNode instanceof HTMLElement) {
            return !filterNode.classList.contains('export-button-container') &&
                   !filterNode.classList.contains('export-dialog');
          }
          return true;
        },
      };

      console.log('Exporting element:', element.tagName, element.className);

      if (format === 'clipboard') {
        const blob = await toBlob(element, options);
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showNotification('Copied to clipboard! Paste in Figma with Cmd/Ctrl+V');
        }
      } else if (format === 'svg') {
        const dataUrl = await toSvg(element, options);
        downloadFile(dataUrl, 'svg');
      } else {
        const dataUrl = await toPng(element, options);
        downloadFile(dataUrl, 'png');
      }

      setSelectedElement(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Export failed: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPage = async (format: ExportFormat) => {
    const appContent = document.getElementById(targetId);
    if (!appContent) {
      showNotification('Export target not found');
      return;
    }

    setIsExporting(true);

    // Handle fixed position modals
    const hasModals = appContent.querySelector('.fixed.inset-0');
    const fixedElements: HTMLElement[] = [];
    let originalPosition = '';
    let originalOverflow = '';

    if (hasModals) {
      appContent.querySelectorAll('.fixed').forEach((el) => {
        if (el instanceof HTMLElement && !el.classList.contains('export-button-container')) {
          fixedElements.push(el);
          el.dataset.originalPosition = el.style.position || '';
          el.style.position = 'absolute';
        }
      });
      originalPosition = appContent.style.position;
      originalOverflow = appContent.style.overflow;
      appContent.style.position = 'relative';
      appContent.style.overflow = 'hidden';
    }

    try {
      const options = {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        filter: (filterNode: Element) => {
          if (filterNode instanceof HTMLElement) {
            return !filterNode.classList.contains('export-button-container');
          }
          return true;
        },
      };

      if (format === 'clipboard') {
        const blob = await toBlob(appContent, options);
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showNotification('Copied to clipboard! Paste in Figma with Cmd/Ctrl+V');
        }
      } else if (format === 'svg') {
        const dataUrl = await toSvg(appContent, options);
        downloadFile(dataUrl, 'svg');
      } else {
        const dataUrl = await toPng(appContent, options);
        downloadFile(dataUrl, 'png');
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Export failed: ' + (error as Error).message);
    } finally {
      // Restore fixed positions
      fixedElements.forEach((el) => {
        el.style.position = el.dataset.originalPosition || '';
        delete el.dataset.originalPosition;
      });
      if (hasModals && appContent) {
        appContent.style.position = originalPosition;
        appContent.style.overflow = originalOverflow;
      }
      setIsExporting(false);
    }
  };

  const handleComponentExport = useCallback((format: ExportFormat) => {
    if (!selectedElement) {
      showNotification('No component selected');
      return;
    }
    doExport(format, selectedElement);
  }, [selectedElement]);

  const downloadFile = (dataUrl: string, format: string) => {
    const link = document.createElement('a');
    const pageName = state.currentPage || 'page';
    const timestamp = new Date().toISOString().slice(0, 10);
    const name = selectedElement ? 'component' : pageName;
    link.download = `${name}-${timestamp}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startComponentSelection = () => {
    setIsSelectMode(true);
    setIsOpen(false);
  };

  const cancelAll = () => {
    setIsSelectMode(false);
    setSelectedElement(null);
    setHoveredElement(null);
  };

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {notification}
        </div>
      )}

      {/* Selection Mode Overlay */}
      {isSelectMode && (
        <div className="fixed inset-0 z-[150] pointer-events-none">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm">
            Click on any component to select it (ESC to cancel)
          </div>

          {hoveredElement && (
            <div
              className="absolute border-2 border-purple-500 bg-purple-500/20 rounded transition-all duration-75"
              style={{
                top: hoveredElement.getBoundingClientRect().top,
                left: hoveredElement.getBoundingClientRect().left,
                width: hoveredElement.getBoundingClientRect().width,
                height: hoveredElement.getBoundingClientRect().height,
              }}
            />
          )}
        </div>
      )}

      {/* Selected Component Export Dialog */}
      {selectedElement && (
        <div className="export-dialog fixed inset-0 z-[160] flex items-center justify-center bg-black/50" onClick={cancelAll}>
          <div className="bg-white rounded-xl shadow-2xl p-4 min-w-[300px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-3">Export Component</h3>

            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <div className="text-xs text-gray-500 mb-1">Selected:</div>
              <div className="text-sm text-gray-700 truncate font-mono">
                {selectedElement.tagName.toLowerCase()}
                {selectedElement.className && (
                  <span className="text-gray-400">.{selectedElement.className.split(' ')[0]}</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {Math.round(selectedElement.getBoundingClientRect().width)} x {Math.round(selectedElement.getBoundingClientRect().height)} px
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleComponentExport('clipboard')}
                disabled={isExporting}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                <span>{isExporting ? 'Copying...' : 'Copy to Clipboard'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleComponentExport('png')}
                disabled={isExporting}
                className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <span>{isExporting ? 'Downloading...' : 'Download PNG (3x)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleComponentExport('svg')}
                disabled={isExporting}
                className="w-full px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L18.6 7 12 9.2 5.4 7 12 4.8z"/>
                </svg>
                <span>Download SVG</span>
              </button>

              <button
                type="button"
                onClick={cancelAll}
                className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Export Button */}
      <div className="export-button-container fixed bottom-20 right-3 z-[100]">
        {isOpen && (
          <div className="absolute bottom-14 right-0 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[220px]">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase">Full Page</span>
            </div>

            <button
              type="button"
              onClick={() => handleExportPage('clipboard')}
              disabled={isExporting}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-green-50 flex items-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              <div>
                <div>Copy to Clipboard</div>
                <div className="text-xs text-green-600">Best for Figma</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleExportPage('png')}
              disabled={isExporting}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <div>
                <div>PNG (3x quality)</div>
                <div className="text-xs text-gray-400">High resolution image</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleExportPage('svg')}
              disabled={isExporting}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-3 disabled:opacity-50 border-b border-gray-200"
            >
              <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L18.6 7 12 9.2 5.4 7 12 4.8z"/>
              </svg>
              <div>
                <div>SVG</div>
                <div className="text-xs text-gray-400">Limited Figma support</div>
              </div>
            </button>

            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase">Component</span>
            </div>
            <button
              type="button"
              onClick={startComponentSelection}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              <div>
                <div>Select Component</div>
                <div className="text-xs text-gray-400">Export individual element</div>
              </div>
            </button>
          </div>
        )}

        {/* Floating Button */}
        <button
          type="button"
          onClick={() => {
            if (isSelectMode) {
              cancelAll();
            } else {
              setIsOpen(!isOpen);
            }
          }}
          disabled={isExporting}
          className={`
            w-12 h-12 rounded-full shadow-lg
            flex items-center justify-center
            transition-all duration-200
            ${isSelectMode
              ? 'bg-red-500 hover:bg-red-600'
              : isOpen
                ? 'bg-gray-700 rotate-45'
                : 'bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800'
            }
            ${isExporting ? 'opacity-50 cursor-wait' : ''}
          `}
          title={isSelectMode ? 'Cancel selection' : 'Export page or component'}
        >
          {isExporting ? (
            <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : isSelectMode ? (
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12"/>
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
    </>
  );
}
