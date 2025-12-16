'use client';

import React from 'react';
import Image from 'next/image';
import { useAdmin } from '@/store';
import { allAvailableTabs, type TabConfig } from '@/config/adminDefaults';

export function TabManager() {
  const { config, toggleTab, reorderTabs } = useAdmin();
  const enabledCount = config.tabs.filter(t => t.enabled).length;

  const handleToggle = (tabId: string, currentlyEnabled: boolean) => {
    toggleTab(tabId, !currentlyEnabled);
  };

  const moveTab = (index: number, direction: 'up' | 'down') => {
    const enabledTabs = config.tabs.filter(t => t.enabled);
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= enabledTabs.length) return;

    const newEnabledTabs = [...enabledTabs];
    [newEnabledTabs[index], newEnabledTabs[newIndex]] = [newEnabledTabs[newIndex], newEnabledTabs[index]];

    // Merge back with disabled tabs
    const disabledTabs = config.tabs.filter(t => !t.enabled);
    reorderTabs([...newEnabledTabs, ...disabledTabs]);
  };

  const enabledTabs = config.tabs.filter(t => t.enabled);
  const disabledTabs = allAvailableTabs.filter(
    at => !config.tabs.find(t => t.id === at.id)?.enabled
  );

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="bg-surface-dark rounded-xl p-3">
        <p className="text-muted-foreground text-xs mb-2">Preview ({enabledCount}/5 tabs)</p>
        <div className="flex justify-around bg-secondary rounded-lg p-2">
          {enabledTabs.map((tab) => (
            <div key={tab.id} className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-surface-dark rounded-lg flex items-center justify-center">
                <Image src={tab.icon} alt={tab.label} width={16} height={16} className="opacity-70" />
              </div>
              <span className="text-[8px] text-muted-foreground">{tab.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enabled Tabs */}
      <div>
        <p className="text-primary text-sm font-bold mb-2">Enabled Tabs</p>
        <div className="space-y-2">
          {enabledTabs.map((tab, index) => (
            <div
              key={tab.id}
              className="flex items-center gap-3 bg-surface-light rounded-lg p-2 border border-surface"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveTab(index, 'up')}
                  disabled={index === 0}
                  className="w-5 h-5 bg-surface-dark rounded flex items-center justify-center disabled:opacity-30"
                >
                  <span className="text-primary text-xs">^</span>
                </button>
                <button
                  onClick={() => moveTab(index, 'down')}
                  disabled={index === enabledTabs.length - 1}
                  className="w-5 h-5 bg-surface-dark rounded flex items-center justify-center disabled:opacity-30"
                >
                  <span className="text-primary text-xs">v</span>
                </button>
              </div>

              {/* Icon */}
              <div className="w-10 h-10 bg-surface-dark rounded-lg flex items-center justify-center">
                <Image src={tab.icon} alt={tab.label} width={20} height={20} className="opacity-70" />
              </div>

              {/* Label */}
              <div className="flex-1">
                <p className="text-primary font-bold text-sm">{tab.label}</p>
                <p className="text-muted-foreground text-xs">{tab.page}</p>
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleToggle(tab.id, true)}
                disabled={enabledCount <= 1}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  enabledCount <= 1 ? 'bg-muted cursor-not-allowed' : 'bg-accent'
                }`}
              >
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Available Tabs */}
      {disabledTabs.length > 0 && (
        <div>
          <p className="text-primary text-sm font-bold mb-2">Available Tabs</p>
          <div className="space-y-2">
            {disabledTabs.map((tab) => (
              <div
                key={tab.id}
                className="flex items-center gap-3 bg-surface-lighter rounded-lg p-2 border border-surface opacity-70"
              >
                {/* Spacer for alignment */}
                <div className="w-5" />

                {/* Icon */}
                <div className="w-10 h-10 bg-surface-dark rounded-lg flex items-center justify-center">
                  <Image src={tab.icon} alt={tab.label} width={20} height={20} className="opacity-50" />
                </div>

                {/* Label */}
                <div className="flex-1">
                  <p className="text-muted-foreground font-bold text-sm">{tab.label}</p>
                  <p className="text-muted text-xs">{tab.page}</p>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(tab.id, false)}
                  disabled={enabledCount >= 5}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    enabledCount >= 5 ? 'bg-muted cursor-not-allowed' : 'bg-surface-dark'
                  }`}
                >
                  <div className="absolute left-1 top-1 w-4 h-4 bg-muted-foreground rounded-full" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
