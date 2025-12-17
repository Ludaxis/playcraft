'use client';

import React, { useEffect } from 'react';

/**
 * Modal Component
 *
 * Base modal with backdrop, keyboard support, and consistent styling.
 *
 * @example
 * <Modal isOpen={isOpen} onClose={handleClose}>
 *   <Modal.Header title="Title" onClose={handleClose} />
 *   <Modal.Body>Content here</Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={handleClose}>Close</Button>
 *   </Modal.Footer>
 * </Modal>
 */

type ModalSize = 'sm' | 'md' | 'lg' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children: React.ReactNode;
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full mx-4',
};

export function Modal({
  isOpen,
  onClose,
  size = 'md',
  children,
  className = '',
}: ModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`
          relative
          w-full
          ${sizeStyles[size]}
          bg-bg-card
          rounded-2xl
          border-2 border-border
          overflow-hidden
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}

// Modal Header
interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  className?: string;
}

function ModalHeader({ title, onClose, className = '' }: ModalHeaderProps) {
  return (
    <div
      className={`
        flex items-center justify-between
        px-4 py-3
        border-b border-border
        ${className}
      `}
    >
      <h2 className="text-value font-bold text-text-primary">{title}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-bg-inverse flex items-center justify-center hover:opacity-80"
        >
          <span className="text-text-inverse font-bold">X</span>
        </button>
      )}
    </div>
  );
}

// Modal Body
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

// Modal Footer
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div
      className={`
        flex gap-2
        px-4 py-3
        border-t border-border
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Attach sub-components
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export type { ModalProps, ModalSize, ModalHeaderProps, ModalBodyProps, ModalFooterProps };
