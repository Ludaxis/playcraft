import type { PageId } from '@/types';
import { EVENT_REGISTRY, getAllEventIds } from '@/config/registry';

// Tab configuration interface
export interface TabConfig {
  id: string;
  icon: string;
  label: string;
  page: PageId;
  enabled: boolean;
}

// Event placement configuration
// Uses string[] for backward compatibility with localStorage
export interface EventPlacement {
  left: string[];
  right: string[];
}

// Admin configuration interface
export interface AdminConfig {
  tabs: TabConfig[];
  enabledEvents: string[]; // Uses string[] for backward compatibility with localStorage
  eventPlacement: EventPlacement;
  theme: ThemeConfig;
  showAreaButton: boolean;
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

/**
 * All LiveOps events - derived from registry
 * Use this for UI that needs to list all available events
 */
export const allEvents = getAllEventIds().map(id => ({
  id,
  name: EVENT_REGISTRY[id].name,
  icon: EVENT_REGISTRY[id].icon,
}));

// Default enabled events
export const defaultEnabledEvents: string[] = ['royal-pass', 'lava-quest', 'mission-control', 'lightning-rush'];

// Default event placement
export const defaultEventPlacement: EventPlacement = {
  left: ['royal-pass', 'mission-control', 'lightning-rush', 'lava-quest'],
  right: [],
};

// Default wireframe theme (Pure Grayscale)
export const defaultTheme: ThemeConfig = {
  primary: '#333333',      // Dark gray
  primaryLight: '#4D4D4D', // Medium-dark gray
  primaryDark: '#1A1A1A',  // Near black
  secondary: '#666666',    // Medium gray
  secondaryLight: '#808080', // Gray
  secondaryDark: '#4D4D4D',  // Medium-dark gray
  accent: '#4D4D4D',       // Dark gray (no colors in wireframes)
  accentLight: '#E5E5E5',  // Light gray
  accentDark: '#333333',   // Dark gray
  surface: '#F5F5F5',      // Light gray
  surfaceLight: '#FFFFFF', // White
  surfaceDark: '#CCCCCC',  // Medium-light gray
  gold: '#808080',         // Gray (no gold in wireframes)
  goldLight: '#B3B3B3',    // Light gray
  goldDark: '#666666',     // Medium gray
};

// Default admin configuration
export const defaultAdminConfig: AdminConfig = {
  tabs: defaultTabs,
  enabledEvents: defaultEnabledEvents,
  eventPlacement: defaultEventPlacement,
  theme: defaultTheme,
  showAreaButton: true,
};

// LocalStorage key
export const ADMIN_CONFIG_KEY = 'puzzle-kit-admin-config';
