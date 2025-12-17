'use client';

import React from 'react';
import { useNavigation, useAdmin } from '@/store';
import { NavButton } from './NavButton';

interface BottomNavigationProps {
  activePage: string;
}

export function BottomNavigation({ activePage }: BottomNavigationProps) {
  const { navigate } = useNavigation();
  const { enabledTabs } = useAdmin();

  return (
    <div className="bg-brand-hover border-t-2 border-bg-inverse">
      <div className="flex justify-around py-2">
        {enabledTabs.map((tab) => (
          <NavButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activePage === tab.id}
            onClick={() => activePage !== tab.id && navigate(tab.page)}
          />
        ))}
      </div>
    </div>
  );
}
