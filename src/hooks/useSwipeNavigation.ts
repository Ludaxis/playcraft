'use client';

import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import type { PageId } from '@/types';

// Define the main navigation tabs in order
const NAV_TABS: PageId[] = ['area-tasks', 'leaderboard', 'main-menu', 'team', 'collection'];

interface SwipeConfig {
  threshold?: number; // Minimum swipe distance to trigger navigation
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

interface UseSwipeNavigationReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLElement | null>;
}

export function useSwipeNavigation(
  currentPage: PageId,
  navigate: (page: PageId) => void,
  config: SwipeConfig = {}
): UseSwipeNavigationReturn {
  const { threshold = 80, onSwipeStart, onSwipeEnd } = config;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const getCurrentTabIndex = useCallback(() => {
    return NAV_TABS.indexOf(currentPage);
  }, [currentPage]);

  const canSwipeLeft = useCallback(() => {
    const index = getCurrentTabIndex();
    return index >= 0 && index < NAV_TABS.length - 1;
  }, [getCurrentTabIndex]);

  const canSwipeRight = useCallback(() => {
    const index = getCurrentTabIndex();
    return index > 0;
  }, [getCurrentTabIndex]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Don't swipe if not on a main nav tab
    if (getCurrentTabIndex() === -1) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentX.current = e.touches[0].clientX;
    isDragging.current = true;
    isHorizontalSwipe.current = null;
    onSwipeStart?.();
  }, [getCurrentTabIndex, onSwipeStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !contentRef.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Determine if this is a horizontal or vertical swipe (only once)
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    // Only handle horizontal swipes
    if (!isHorizontalSwipe.current) return;

    touchCurrentX.current = currentX;

    // Check if swipe is allowed in this direction
    const isSwipingLeft = deltaX < 0;
    const isSwipingRight = deltaX > 0;

    if ((isSwipingLeft && !canSwipeLeft()) || (isSwipingRight && !canSwipeRight())) {
      // Add resistance when can't swipe
      gsap.set(contentRef.current, { x: deltaX * 0.2 });
    } else {
      // Follow finger with slight damping
      gsap.set(contentRef.current, { x: deltaX * 0.5 });
    }
  }, [canSwipeLeft, canSwipeRight]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !contentRef.current) return;

    isDragging.current = false;

    const deltaX = touchCurrentX.current - touchStartX.current;
    const currentIndex = getCurrentTabIndex();

    // Animate content back to center
    gsap.to(contentRef.current, {
      x: 0,
      duration: 0.3,
      ease: 'power2.out',
    });

    // Check if swipe was significant enough
    if (Math.abs(deltaX) >= threshold && isHorizontalSwipe.current) {
      if (deltaX < 0 && canSwipeLeft()) {
        // Swipe left - go to next tab
        const nextPage = NAV_TABS[currentIndex + 1];
        if (nextPage) {
          // Animate out to left
          gsap.to(contentRef.current, {
            x: -100,
            opacity: 0,
            duration: 0.15,
            ease: 'power2.in',
            onComplete: () => {
              navigate(nextPage);
              // Reset and animate in from right
              if (contentRef.current) {
                gsap.set(contentRef.current, { x: 100, opacity: 0 });
                gsap.to(contentRef.current, {
                  x: 0,
                  opacity: 1,
                  duration: 0.25,
                  ease: 'power2.out',
                });
              }
            },
          });
        }
      } else if (deltaX > 0 && canSwipeRight()) {
        // Swipe right - go to previous tab
        const prevPage = NAV_TABS[currentIndex - 1];
        if (prevPage) {
          // Animate out to right
          gsap.to(contentRef.current, {
            x: 100,
            opacity: 0,
            duration: 0.15,
            ease: 'power2.in',
            onComplete: () => {
              navigate(prevPage);
              // Reset and animate in from left
              if (contentRef.current) {
                gsap.set(contentRef.current, { x: -100, opacity: 0 });
                gsap.to(contentRef.current, {
                  x: 0,
                  opacity: 1,
                  duration: 0.25,
                  ease: 'power2.out',
                });
              }
            },
          });
        }
      }
    }

    isHorizontalSwipe.current = null;
    onSwipeEnd?.();
  }, [getCurrentTabIndex, threshold, canSwipeLeft, canSwipeRight, navigate, onSwipeEnd]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { containerRef, contentRef };
}
