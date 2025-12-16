'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';

interface Tab {
  id: string;
  label: string;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
  tabBarClassName?: string;
}

export function AnimatedTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = '',
  tabBarClassName = '',
}: AnimatedTabsProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const prevTabRef = useRef<string>(activeTab);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Animate content when tab changes
  useEffect(() => {
    if (!contentRef.current || prevTabRef.current === activeTab) return;

    const prevIndex = tabs.findIndex((t) => t.id === prevTabRef.current);
    const newIndex = tabs.findIndex((t) => t.id === activeTab);
    const direction = newIndex > prevIndex ? 1 : -1;

    prevTabRef.current = activeTab;

    // Slide animation for content
    gsap.fromTo(
      contentRef.current,
      {
        x: direction * 40,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      }
    );
  }, [activeTab, tabs]);

  // Animate indicator
  useEffect(() => {
    if (!indicatorRef.current) return;

    const activeButton = tabRefs.current.get(activeTab);
    if (!activeButton) return;

    gsap.to(indicatorRef.current, {
      x: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [activeTab]);

  const handleTabClick = useCallback(
    (tabId: string) => {
      if (tabId !== activeTab) {
        onTabChange(tabId);
      }
    },
    [activeTab, onTabChange]
  );

  const setTabRef = useCallback((tabId: string, el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(tabId, el);
    }
  }, []);

  return (
    <div className={className}>
      {/* Tab Bar */}
      <div className={`bg-secondary-light px-2 py-1.5 ${tabBarClassName}`}>
        <div className="relative flex bg-secondary rounded border border-secondary-light overflow-hidden">
          {/* Sliding indicator */}
          <div
            ref={indicatorRef}
            className="absolute top-0 bottom-0 bg-surface-dark rounded transition-none"
            style={{ width: `${100 / tabs.length}%` }}
          />

          {/* Tab buttons */}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => setTabRef(tab.id, el)}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 py-1.5 text-center text-xs font-bold transition-colors relative z-10 ${
                activeTab === tab.id ? 'text-primary-light' : 'text-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// Simple tab bar without content management
interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function AnimatedTabBar({ tabs, activeTab, onTabChange, className = '' }: TabBarProps) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (!indicatorRef.current) return;

    const activeButton = tabRefs.current.get(activeTab);
    if (!activeButton) return;

    gsap.to(indicatorRef.current, {
      x: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [activeTab]);

  const setTabRef = useCallback((tabId: string, el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(tabId, el);
    }
  }, []);

  return (
    <div className={`bg-secondary-light px-2 py-1.5 ${className}`}>
      <div className="relative flex bg-secondary rounded border border-secondary-light overflow-hidden">
        {/* Sliding indicator */}
        <div
          ref={indicatorRef}
          className="absolute top-0 bottom-0 bg-surface-dark rounded"
          style={{ width: `${100 / tabs.length}%` }}
        />

        {/* Tab buttons */}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => setTabRef(tab.id, el)}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-1.5 text-center text-xs font-bold transition-colors relative z-10 ${
              activeTab === tab.id ? 'text-primary-light' : 'text-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
