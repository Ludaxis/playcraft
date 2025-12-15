'use client';

import React from 'react';
import { useNavigation } from '@/store';
import { NavButton } from './NavButton';
import type { PageId } from '@/types';

interface BottomNavigationProps {
  activePage: 'areas' | 'leaderboard' | 'home' | 'team' | 'collection';
}

export function BottomNavigation({ activePage }: BottomNavigationProps) {
  const { navigate } = useNavigation();

  const navItems: { id: string; icon: string; label: string; page: PageId }[] = [
    { id: 'areas', icon: '/icons/Star-Filled.svg', label: 'Areas', page: 'area-tasks' },
    { id: 'leaderboard', icon: '/icons/Medal.svg', label: 'Leaderboard', page: 'leaderboard' },
    { id: 'home', icon: '/icons/Home.svg', label: 'Home', page: 'main-menu' },
    { id: 'team', icon: '/icons/2User.svg', label: 'Team', page: 'team' },
    { id: 'collection', icon: '/icons/Category.svg', label: 'Collection', page: 'collection' },
  ];

  return (
    <div className="bg-slate-700 border-t-2 border-slate-600">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activePage === item.id}
            onClick={() => activePage !== item.id && navigate(item.page)}
          />
        ))}
      </div>
    </div>
  );
}
