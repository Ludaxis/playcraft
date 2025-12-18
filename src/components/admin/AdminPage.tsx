'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useNavigation, useAdmin } from '@/store';
import { TabManager } from './TabManager';
import { EventManager } from './EventManager';
import { ThemeEditor } from './ThemeEditor';

type SectionId = 'tabs' | 'events' | 'theme';

export function AdminPage() {
  const { navigate } = useNavigation();
  const { config, toggleAreaButton, resetToDefaults } = useAdmin();
  const [expandedSection, setExpandedSection] = useState<SectionId | null>('tabs');
  const t = useTranslations('admin');

  const toggleSection = (section: SectionId) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    { id: 'tabs' as const, title: t('navigationTabs'), component: TabManager },
    { id: 'events' as const, title: t('liveopsEvents'), component: EventManager },
    { id: 'theme' as const, title: t('themeColors'), component: ThemeEditor },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-inverse">
      {/* Header */}
      <div className="flex items-center justify-center px-3 py-3 bg-bg-muted relative border-b border-border">
        <h1 className="text-text-primary text-h2">{t('title')}</h1>
        <button
          onClick={() => navigate('settings')}
          className="absolute right-3 w-8 h-8 bg-bg-page rounded-full flex items-center justify-center border-2 border-border hover:opacity-80"
        >
          <span className="text-text-primary text-value">X</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Info Banner */}
        <div className="bg-bg-muted rounded-xl p-3 border border-border">
          <p className="text-text-primary text-caption font-bold mb-1">{t('prototypeAdmin')}</p>
          <p className="text-text-muted text-mini">
            {t('configureDescription')}
          </p>
        </div>

        {/* Main Menu Options */}
        <div className="bg-bg-page rounded-xl border border-border p-3">
          <p className="text-text-primary text-value mb-3">{t('mainMenuOptions')}</p>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-body-sm">{t('showAreaButton')}</span>
            <button
              onClick={() => toggleAreaButton(!config.showAreaButton)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                config.showAreaButton ? 'bg-bg-inverse' : 'bg-bg-muted'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-bg-card rounded-full transition-all ${
                  config.showAreaButton ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sections */}
        {sections.map(({ id, title, component: Component }) => (
          <div key={id} className="bg-bg-page rounded-xl border border-border overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(id)}
              className="w-full flex items-center justify-between p-3 bg-bg-card"
            >
              <span className="text-text-primary font-bold">{title}</span>
              <span className="text-text-primary text-value">
                {expandedSection === id ? '-' : '+'}
              </span>
            </button>

            {/* Section Content */}
            {expandedSection === id && (
              <div className="p-3 border-t border-border">
                <Component />
              </div>
            )}
          </div>
        ))}

        {/* Reset All */}
        <button
          onClick={resetToDefaults}
          className="w-full bg-bg-muted border-2 border-border rounded-xl py-3 hover:bg-bg-page transition-colors"
        >
          <span className="text-text-primary font-bold">{t('resetAllToDefaults')}</span>
        </button>

        {/* Version Info */}
        <div className="text-center py-2">
          <p className="text-text-muted text-mini">{t('version')}</p>
        </div>
      </div>
    </div>
  );
}
