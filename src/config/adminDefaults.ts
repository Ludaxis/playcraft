'use client';

import type { PageId } from '@/types';

// Tab configuration interface
export interface TabConfig {
  id: string;
  icon: string;
  label: string;
  page: PageId;
  enabled: boolean;
}

// Admin configuration interface
export interface AdminConfig {
  tabs: TabConfig[];
  enabledEvents: string[];
  theme: ThemeConfig;
}

// Theme configuration
export interface ThemeConfig {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  surface: string;
  surfaceLight: string;
  surfaceDark: string;
  gold: string;
  goldLight: string;
  goldDark: string;
}

// Default tabs (current configuration)
export const defaultTabs: TabConfig[] = [
  { id: 'areas', icon: '/icons/Star-Filled.svg', label: 'Areas', page: 'area-tasks', enabled: true },
  { id: 'leaderboard', icon: '/icons/Medal.svg', label: 'Leaderboard', page: 'leaderboard', enabled: true },
  { id: 'home', icon: '/icons/Home.svg', label: 'Home', page: 'main-menu', enabled: true },
  { id: 'team', icon: '/icons/2User.svg', label: 'Team', page: 'team', enabled: true },
  { id: 'collection', icon: '/icons/Category.svg', label: 'Collection', page: 'collection', enabled: true },
];

// All available tabs that can be added
export const allAvailableTabs: TabConfig[] = [
  { id: 'areas', icon: '/icons/Star-Filled.svg', label: 'Areas', page: 'area-tasks', enabled: true },
  { id: 'leaderboard', icon: '/icons/Medal.svg', label: 'Leaderboard', page: 'leaderboard', enabled: true },
  { id: 'home', icon: '/icons/Home.svg', label: 'Home', page: 'main-menu', enabled: true },
  { id: 'team', icon: '/icons/2User.svg', label: 'Team', page: 'team', enabled: true },
  { id: 'collection', icon: '/icons/Category.svg', label: 'Collection', page: 'collection', enabled: true },
  { id: 'shop', icon: '/icons/Shopping-2.svg', label: 'Shop', page: 'shop', enabled: false },
  { id: 'inbox', icon: '/icons/Mail.svg', label: 'Inbox', page: 'inbox', enabled: false },
  { id: 'profile', icon: '/icons/Profile.svg', label: 'Profile', page: 'profile', enabled: false },
  { id: 'boosters', icon: '/icons/Fire.svg', label: 'Boosters', page: 'boosters', enabled: false },
  { id: 'daily-rewards', icon: '/icons/Star.svg', label: 'Rewards', page: 'daily-rewards', enabled: false },
  { id: 'friends', icon: '/icons/Heart.svg', label: 'Friends', page: 'friends', enabled: false },
];

// All LiveOps events
export const allEvents = [
  { id: 'royal-pass', name: 'Royal Pass', icon: '/icons/Badge.svg' },
  { id: 'sky-race', name: 'Sky Race', icon: '/icons/Lightning.svg' },
  { id: 'kings-cup', name: "King's Cup", icon: '/icons/Medal.svg' },
  { id: 'team-chest', name: 'Team Chest', icon: '/icons/Archive.svg' },
  { id: 'book-of-treasure', name: 'Book of Treasure', icon: '/icons/Bookmark.svg' },
  { id: 'lightning-rush', name: 'Lightning Rush', icon: '/icons/Lightning.svg' },
  { id: 'lava-quest', name: 'Lava Quest', icon: '/icons/Star-Filled.svg' },
  { id: 'album', name: 'Album', icon: '/icons/Category.svg' },
  { id: 'collection', name: 'Collection', icon: '/icons/Archive.svg' },
];

// Default enabled events
export const defaultEnabledEvents = ['lava-quest'];

// Default theme (Periwinkle Dream)
export const defaultTheme: ThemeConfig = {
  primary: '#6b5bc7',
  primaryLight: '#7d6dd4',
  primaryDark: '#5a4ab3',
  secondary: '#8578d9',
  secondaryLight: '#9381ff',
  secondaryDark: '#7269c4',
  accent: '#9381ff',
  accentLight: '#a899ff',
  accentDark: '#7b69e6',
  surface: '#d4d4ff',
  surfaceLight: '#e8e8ff',
  surfaceDark: '#b8b8ff',
  gold: '#ffd966',
  goldLight: '#ffe599',
  goldDark: '#f0c840',
};

// Default admin configuration
export const defaultAdminConfig: AdminConfig = {
  tabs: defaultTabs,
  enabledEvents: defaultEnabledEvents,
  theme: defaultTheme,
};

// LocalStorage key
export const ADMIN_CONFIG_KEY = 'puzzle-kit-admin-config';
