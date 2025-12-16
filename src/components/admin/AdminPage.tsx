'use client';

import React, { useState } from 'react';
import { useNavigation, useAdmin } from '@/store';
import { TabManager } from './TabManager';
import { EventManager } from './EventManager';
import { ThemeEditor } from './ThemeEditor';

type SectionId = 'tabs' | 'events' | 'theme';

export function AdminPage() {
  const { navigate } = useNavigation();
  const { resetToDefaults } = useAdmin();
  const [expandedSection, setExpandedSection] = useState<SectionId | null>('tabs');

  const toggleSection = (section: SectionId) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    { id: 'tabs' as const, title: 'Navigation Tabs', component: TabManager },
    { id: 'events' as const, title: 'LiveOps Events', component: EventManager },
    { id: 'theme' as const, title: 'Theme Colors', component: ThemeEditor },
  ];

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-center px-3 py-3 bg-primary relative">
        <h1 className="text-white text-xl font-bold">Admin Panel</h1>
        <button
          onClick={() => navigate('settings')}
          className="absolute right-3 w-8 h-8 bg-primary-light rounded-full flex items-center justify-center border-2 border-primary-dark"
        >
          <span className="text-white font-bold">X</span>
        </button>
      </div>

      {/* Divider */}
      <div className="h-1 bg-secondary-light" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Info Banner */}
        <div className="bg-accent/20 rounded-xl p-3 border border-accent/30">
          <p className="text-primary text-sm font-bold mb-1">Prototype Admin</p>
          <p className="text-muted-foreground text-xs">
            Configure tabs, events, and theme. Changes are saved automatically.
          </p>
        </div>

        {/* Sections */}
        {sections.map(({ id, title, component: Component }) => (
          <div key={id} className="bg-surface-light rounded-xl border border-surface overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(id)}
              className="w-full flex items-center justify-between p-3 bg-surface-lighter"
            >
              <span className="text-primary font-bold">{title}</span>
              <span className="text-primary text-lg">
                {expandedSection === id ? '-' : '+'}
              </span>
            </button>

            {/* Section Content */}
            {expandedSection === id && (
              <div className="p-3 border-t border-surface">
                <Component />
              </div>
            )}
          </div>
        ))}

        {/* Reset All */}
        <button
          onClick={resetToDefaults}
          className="w-full bg-error/20 border-2 border-error/30 rounded-xl py-3"
        >
          <span className="text-error font-bold">Reset All to Defaults</span>
        </button>

        {/* Version Info */}
        <div className="text-center py-2">
          <p className="text-muted text-xs">Puzzle Kit Admin v1.0</p>
        </div>
      </div>
    </div>
  );
}
