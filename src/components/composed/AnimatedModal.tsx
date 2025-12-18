'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useNavigation } from '@/store';

interface AnimatedModalProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  width?: string;
}

export function AnimatedModal({
  children,
  className = '',
  onClose,
  width = 'w-[320px]',
}: AnimatedModalProps) {
  const { closeModal } = useNavigation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);

  // Animate in on mount
  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;

    const overlay = overlayRef.current;
    const content = contentRef.current;

    // Set initial state
    gsap.set(overlay, { opacity: 0 });
    gsap.set(content, { y: -80, opacity: 0, scale: 0.92 });

    // Animate in
    gsap.to(overlay, {
      opacity: 1,
      duration: 0.25,
      ease: 'power2.out',
    });
    gsap.to(content, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.2)',
      delay: 0.05,
    });
  }, []);

  const handleClose = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const doClose = () => {
      if (onClose) {
        onClose();
      } else {
        closeModal();
      }
    };

    if (!overlayRef.current || !contentRef.current) {
      doClose();
      return;
    }

    const overlay = overlayRef.current;
    const content = contentRef.current;

    // Animate out - slide up
    gsap.to(content, {
      y: -60,
      opacity: 0,
      scale: 0.95,
      duration: 0.25,
      ease: 'power3.in',
    });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      delay: 0.1,
      ease: 'power2.in',
      onComplete: doClose,
    });
  }, [closeModal, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        handleClose();
      }
    },
    [handleClose]
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleOverlayClick}
    >
      <div
        ref={contentRef}
        className={`${width} bg-bg-card rounded-xl border-2 border-border overflow-hidden ${className}`}
      >
        {/* eslint-disable-next-line react-hooks/refs -- React.Children.map callback doesn't access refs */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ onClose?: () => void }>, {
              onClose: handleClose,
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

// Modal Header with close button
interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function ModalHeader({ title, onClose, showCloseButton = true }: ModalHeaderProps) {
  return (
    <>
      <div className="bg-brand-hover py-2.5 px-3 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h4">{title}</h2>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-2 w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border-2 border-border hover:opacity-80 transition-opacity"
          >
            <span className="text-text-inverse text-value">X</span>
          </button>
        )}
      </div>
      <div className="h-0.5 bg-brand-muted" />
    </>
  );
}
