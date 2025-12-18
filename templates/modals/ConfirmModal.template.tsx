/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                        CONFIRM MODAL TEMPLATE                              ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Use this for: Yes/No confirmations, destructive actions                   ║
 * ║                                                                            ║
 * ║  Features:                                                                 ║
 * ║  - Title and message                                                       ║
 * ║  - Confirm and Cancel buttons                                              ║
 * ║  - Animated open/close                                                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

'use client';

import React from 'react';
import { useModal, useModalParams } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// TODO: Update these values for your modal
// ═══════════════════════════════════════════════════════════════════════════

const MODAL_TITLE = 'Confirm Action';
const MODAL_MESSAGE = 'Are you sure you want to proceed?';
const CONFIRM_TEXT = 'Confirm';
const CANCEL_TEXT = 'Cancel';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ConfirmModalParams extends Record<string, unknown> {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  destructive?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface Props {
  onAnimatedClose?: () => void;
}

export function ConfirmModal({ onAnimatedClose }: Props) {
  const { close } = useModal();
  const params = useModalParams<ConfirmModalParams>();

  // Use params or defaults
  const title = params.title ?? MODAL_TITLE;
  const message = params.message ?? MODAL_MESSAGE;
  const confirmText = params.confirmText ?? CONFIRM_TEXT;
  const cancelText = params.cancelText ?? CANCEL_TEXT;
  const destructive = params.destructive ?? false;

  // ─────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      close();
    }
  };

  const handleConfirm = () => {
    params.onConfirm?.();
    handleClose();
  };

  const handleCancel = () => {
    handleClose();
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="w-[300px] bg-bg-card rounded-xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-2.5 px-3 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h4">{title}</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-7 h-7 bg-bg-muted rounded-full flex items-center justify-center border border-border hover:opacity-80"
        >
          <span className="text-text-primary text-value">&times;</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-body text-text-secondary text-center mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 px-4 bg-bg-muted text-text-primary rounded-lg font-bold hover:opacity-80 transition-opacity"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`
              flex-1 py-2.5 px-4 rounded-lg font-bold hover:opacity-80 transition-opacity
              ${destructive
                ? 'bg-status-error text-white'
                : 'bg-bg-inverse text-text-inverse'
              }
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default ConfirmModal;
