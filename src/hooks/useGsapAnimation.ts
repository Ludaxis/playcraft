'use client';

import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

export type AnimationType = 'slideDown' | 'slideUp' | 'slideLeft' | 'slideRight' | 'fadeIn' | 'scale';

interface AnimationConfig {
  duration?: number;
  ease?: string;
  delay?: number;
}

const defaultConfig: AnimationConfig = {
  duration: 0.4,
  ease: 'power3.out',
  delay: 0,
};

export function useModalAnimation(isOpen: boolean, config: AnimationConfig = {}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const duration = config.duration ?? defaultConfig.duration ?? 0.4;
  const ease = config.ease ?? defaultConfig.ease ?? 'power3.out';
  const delay = config.delay ?? defaultConfig.delay ?? 0;

  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;

    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (isOpen) {
      // Animate in - slide down from top
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: duration * 0.6, ease: 'power2.out' }
      );
      gsap.fromTo(
        content,
        { y: -100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration, ease, delay }
      );
    }
  }, [isOpen, duration, ease, delay]);

  const animateOut = useCallback(
    (onComplete?: () => void) => {
      if (!overlayRef.current || !contentRef.current) {
        onComplete?.();
        return;
      }

      const overlay = overlayRef.current;
      const content = contentRef.current;
      const dur = duration;

      // Animate out - slide up
      gsap.to(content, {
        y: -80,
        opacity: 0,
        scale: 0.95,
        duration: dur * 0.7,
        ease: 'power3.in',
      });
      gsap.to(overlay, {
        opacity: 0,
        duration: dur * 0.5,
        delay: dur * 0.2,
        ease: 'power2.in',
        onComplete,
      });
    },
    [duration]
  );

  return { overlayRef, contentRef, animateOut };
}

export function useTabAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef<number>(0);

  const animateTabChange = useCallback((newIndex: number, contentElement: HTMLElement | null) => {
    if (!contentElement) return;

    const prevIndex = prevIndexRef.current;
    const direction = newIndex > prevIndex ? 1 : -1;
    prevIndexRef.current = newIndex;

    // Slide animation
    gsap.fromTo(
      contentElement,
      {
        x: direction * 50,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      }
    );
  }, []);

  return { containerRef, animateTabChange };
}

export function useSlideAnimation(_direction: 'horizontal' | 'vertical' = 'horizontal') {
  void _direction; // Reserved for future axis-aware animations
  const elementRef = useRef<HTMLDivElement>(null);

  const slideIn = useCallback(
    (fromDirection: 'left' | 'right' | 'top' | 'bottom' = 'right') => {
      if (!elementRef.current) return;

      const axis = fromDirection === 'left' || fromDirection === 'right' ? 'x' : 'y';
      const distance = fromDirection === 'left' || fromDirection === 'top' ? -50 : 50;

      gsap.fromTo(
        elementRef.current,
        { [axis]: distance, opacity: 0 },
        { [axis]: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    },
    []
  );

  const slideOut = useCallback(
    (toDirection: 'left' | 'right' | 'top' | 'bottom' = 'left', onComplete?: () => void) => {
      if (!elementRef.current) {
        onComplete?.();
        return;
      }

      const axis = toDirection === 'left' || toDirection === 'right' ? 'x' : 'y';
      const distance = toDirection === 'left' || toDirection === 'top' ? -50 : 50;

      gsap.to(elementRef.current, {
        [axis]: distance,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete,
      });
    },
    []
  );

  return { elementRef, slideIn, slideOut };
}
