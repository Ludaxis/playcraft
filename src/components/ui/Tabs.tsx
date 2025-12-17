'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-1 p-1 bg-surface-light rounded-lg ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 px-3 py-2 text-label rounded-md transition-colors
            ${
              activeTab === tab.id
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
