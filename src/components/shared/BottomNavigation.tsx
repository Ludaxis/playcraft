'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useNavigation, useAdmin } from '@/store';
import { NavButton } from './NavButton';

interface BottomNavigationProps {
  activePage: string;
}

// Map tab IDs to translation keys
const tabTranslationKeys: Record<string, string> = {
  areas: 'areas',
  leaderboard: 'leaderboard',
  home: 'home',
  team: 'team',
  collection: 'collection',
  shop: 'shop',
  inbox: 'inbox',
  profile: 'profile',
  boosters: 'boosters',
  'daily-rewards': 'rewards',
  friends: 'friends',
};

export function BottomNavigation({ activePage }: BottomNavigationProps) {
  const { navigate } = useNavigation();
  const { enabledTabs } = useAdmin();
  const t = useTranslations('navigation');

  return (
    <div className="bg-bg-card border-t border-border">
      <div className="flex justify-around py-2 max-w-lg mx-auto">
        {enabledTabs.map((tab) => (
          <NavButton
            key={tab.id}
            icon={tab.icon}
            label={t(tabTranslationKeys[tab.id] || tab.id)}
            active={activePage === tab.page}
            onClick={() => activePage !== tab.page && navigate(tab.page)}
          />
        ))}
      </div>
    </div>
  );
}
