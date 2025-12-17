'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import {
  type AdminConfig,
  type TabConfig,
  type ThemeConfig,
  type EventPlacement,
  defaultAdminConfig,
  allAvailableTabs,
  defaultEventPlacement,
  ADMIN_CONFIG_KEY,
} from '@/config/adminDefaults';

// State type
interface AdminState extends AdminConfig {}

// Action types
type AdminAction =
  | { type: 'SET_CONFIG'; payload: AdminConfig }
  | { type: 'UPDATE_TABS'; payload: TabConfig[] }
  | { type: 'TOGGLE_TAB'; payload: { tabId: string; enabled: boolean } }
  | { type: 'REORDER_TABS'; payload: TabConfig[] }
  | { type: 'TOGGLE_EVENT'; payload: { eventId: string; enabled: boolean } }
  | { type: 'REORDER_EVENTS'; payload: string[] }
  | { type: 'UPDATE_EVENT_PLACEMENT'; payload: EventPlacement }
  | { type: 'UPDATE_THEME'; payload: Partial<ThemeConfig> }
  | { type: 'RESET_TO_DEFAULTS' };

// Reducer
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...action.payload };

    case 'UPDATE_TABS':
      return { ...state, tabs: action.payload };

    case 'TOGGLE_TAB': {
      const { tabId, enabled } = action.payload;
      const enabledCount = state.tabs.filter(t => t.enabled).length;

      // Don't allow more than 5 enabled tabs
      if (enabled && enabledCount >= 5) {
        return state;
      }

      // Don't allow less than 1 enabled tab
      if (!enabled && enabledCount <= 1) {
        return state;
      }

      // Check if tab exists in current tabs
      const existingTab = state.tabs.find(t => t.id === tabId);

      if (existingTab) {
        // Update existing tab
        const updatedTabs = state.tabs.map(tab =>
          tab.id === tabId ? { ...tab, enabled } : tab
        );
        return { ...state, tabs: updatedTabs };
      } else if (enabled) {
        // Add new tab from allAvailableTabs
        const newTab = allAvailableTabs.find(t => t.id === tabId);
        if (newTab) {
          return { ...state, tabs: [...state.tabs, { ...newTab, enabled: true }] };
        }
      }

      return state;
    }

    case 'REORDER_TABS':
      return { ...state, tabs: action.payload };

    case 'TOGGLE_EVENT': {
      const { eventId, enabled } = action.payload;
      if (enabled) {
        // Add to enabledEvents and left side of placement
        const enabledEvents = [...state.enabledEvents, eventId];
        const eventPlacement = {
          ...state.eventPlacement,
          left: [...state.eventPlacement.left, eventId],
        };
        return { ...state, enabledEvents, eventPlacement };
      } else {
        // Remove from enabledEvents and both sides of placement
        const enabledEvents = state.enabledEvents.filter(id => id !== eventId);
        const eventPlacement = {
          left: state.eventPlacement.left.filter(id => id !== eventId),
          right: state.eventPlacement.right.filter(id => id !== eventId),
        };
        return { ...state, enabledEvents, eventPlacement };
      }
    }

    case 'REORDER_EVENTS':
      return { ...state, enabledEvents: action.payload };

    case 'UPDATE_EVENT_PLACEMENT': {
      // Also sync enabledEvents with the placement
      const enabledEvents = [...action.payload.left, ...action.payload.right];
      return { ...state, eventPlacement: action.payload, enabledEvents };
    }

    case 'UPDATE_THEME':
      return { ...state, theme: { ...state.theme, ...action.payload } };

    case 'RESET_TO_DEFAULTS':
      return { ...defaultAdminConfig };

    default:
      return state;
  }
}

// Context value type
interface AdminContextValue {
  config: AdminState;
  enabledTabs: TabConfig[];
  updateTabs: (tabs: TabConfig[]) => void;
  toggleTab: (tabId: string, enabled: boolean) => void;
  reorderTabs: (tabs: TabConfig[]) => void;
  toggleEvent: (eventId: string, enabled: boolean) => void;
  reorderEvents: (events: string[]) => void;
  updateEventPlacement: (placement: EventPlacement) => void;
  isEventEnabled: (eventId: string) => boolean;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  resetToDefaults: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

// Load config from localStorage
function loadConfig(): AdminConfig {
  if (typeof window === 'undefined') {
    return defaultAdminConfig;
  }

  try {
    const stored = localStorage.getItem(ADMIN_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return {
        ...defaultAdminConfig,
        ...parsed,
        tabs: parsed.tabs || defaultAdminConfig.tabs,
        enabledEvents: parsed.enabledEvents || defaultAdminConfig.enabledEvents,
        eventPlacement: parsed.eventPlacement || defaultEventPlacement,
        theme: { ...defaultAdminConfig.theme, ...parsed.theme },
      };
    }
  } catch (e) {
    console.error('Failed to load admin config:', e);
  }

  return defaultAdminConfig;
}

// Save config to localStorage
function saveConfig(config: AdminConfig) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save admin config:', e);
  }
}

// Apply theme to CSS variables
function applyTheme(theme: ThemeConfig) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // Map theme config to CSS variables
  const cssVarMap: Record<keyof ThemeConfig, string> = {
    primary: '--color-primary',
    primaryLight: '--color-primary-light',
    primaryDark: '--color-primary-dark',
    secondary: '--color-secondary',
    secondaryLight: '--color-secondary-light',
    secondaryDark: '--color-secondary-dark',
    accent: '--color-accent',
    accentLight: '--color-accent-light',
    accentDark: '--color-accent-dark',
    surface: '--color-surface',
    surfaceLight: '--color-surface-light',
    surfaceDark: '--color-surface-dark',
    gold: '--color-gold',
    goldLight: '--color-gold-light',
    goldDark: '--color-gold-dark',
  };

  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = cssVarMap[key as keyof ThemeConfig];
    if (cssVar) {
      root.style.setProperty(cssVar, value);
    }
  });
}

// Provider
interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [state, dispatch] = useReducer(adminReducer, defaultAdminConfig);

  // Load config from localStorage on mount
  useEffect(() => {
    const config = loadConfig();
    dispatch({ type: 'SET_CONFIG', payload: config });
    applyTheme(config.theme);
  }, []);

  // Save to localStorage and apply theme whenever state changes
  useEffect(() => {
    saveConfig(state);
    applyTheme(state.theme);
  }, [state]);

  // Get only enabled tabs, sorted by their position in allAvailableTabs
  const enabledTabs = state.tabs.filter(tab => tab.enabled);

  const updateTabs = useCallback((tabs: TabConfig[]) => {
    dispatch({ type: 'UPDATE_TABS', payload: tabs });
  }, []);

  const toggleTab = useCallback((tabId: string, enabled: boolean) => {
    dispatch({ type: 'TOGGLE_TAB', payload: { tabId, enabled } });
  }, []);

  const reorderTabs = useCallback((tabs: TabConfig[]) => {
    dispatch({ type: 'REORDER_TABS', payload: tabs });
  }, []);

  const toggleEvent = useCallback((eventId: string, enabled: boolean) => {
    dispatch({ type: 'TOGGLE_EVENT', payload: { eventId, enabled } });
  }, []);

  const reorderEvents = useCallback((events: string[]) => {
    dispatch({ type: 'REORDER_EVENTS', payload: events });
  }, []);

  const updateEventPlacement = useCallback((placement: EventPlacement) => {
    dispatch({ type: 'UPDATE_EVENT_PLACEMENT', payload: placement });
  }, []);

  const isEventEnabled = useCallback((eventId: string) => {
    return state.enabledEvents.includes(eventId);
  }, [state.enabledEvents]);

  const updateTheme = useCallback((theme: Partial<ThemeConfig>) => {
    dispatch({ type: 'UPDATE_THEME', payload: theme });
  }, []);

  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  }, []);

  return (
    <AdminContext.Provider
      value={{
        config: state,
        enabledTabs,
        updateTabs,
        toggleTab,
        reorderTabs,
        toggleEvent,
        reorderEvents,
        updateEventPlacement,
        isEventEnabled,
        updateTheme,
        resetToDefaults,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

// Hook
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
