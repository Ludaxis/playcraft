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
import {
  type ThemePreset,
  themePresets,
  defaultThemePreset,
  applyThemePreset,
} from '@/config/themePresets';

// Extended state type with preset support
interface AdminState extends AdminConfig {
  themePresetId: string;
}

// Action types
type AdminAction =
  | { type: 'SET_CONFIG'; payload: AdminState }
  | { type: 'UPDATE_TABS'; payload: TabConfig[] }
  | { type: 'TOGGLE_TAB'; payload: { tabId: string; enabled: boolean } }
  | { type: 'REORDER_TABS'; payload: TabConfig[] }
  | { type: 'TOGGLE_EVENT'; payload: { eventId: string; enabled: boolean } }
  | { type: 'REORDER_EVENTS'; payload: string[] }
  | { type: 'UPDATE_EVENT_PLACEMENT'; payload: EventPlacement }
  | { type: 'UPDATE_THEME'; payload: Partial<ThemeConfig> }
  | { type: 'SET_THEME_PRESET'; payload: string }
  | { type: 'TOGGLE_AREA_BUTTON'; payload: boolean }
  | { type: 'RESET_TO_DEFAULTS' };

// Default state with preset
const defaultState: AdminState = {
  ...defaultAdminConfig,
  themePresetId: 'grayscale',
};

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

    case 'SET_THEME_PRESET': {
      const presetId = action.payload;
      const preset = themePresets[presetId];
      if (!preset) return state;

      // Update theme with preset colors
      return {
        ...state,
        themePresetId: presetId,
        theme: {
          ...state.theme,
          primary: preset.brandPrimary,
          primaryLight: preset.brandHover,
          accent: preset.brandPrimary,
          accentLight: preset.brandMuted,
          accentDark: preset.brandHover,
        },
      };
    }

    case 'TOGGLE_AREA_BUTTON':
      return { ...state, showAreaButton: action.payload };

    case 'RESET_TO_DEFAULTS':
      return { ...defaultState };

    default:
      return state;
  }
}

// Context value type
interface AdminContextValue {
  config: AdminState;
  enabledTabs: TabConfig[];
  currentPreset: ThemePreset;
  updateTabs: (tabs: TabConfig[]) => void;
  toggleTab: (tabId: string, enabled: boolean) => void;
  reorderTabs: (tabs: TabConfig[]) => void;
  toggleEvent: (eventId: string, enabled: boolean) => void;
  reorderEvents: (events: string[]) => void;
  updateEventPlacement: (placement: EventPlacement) => void;
  isEventEnabled: (eventId: string) => boolean;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  setThemePreset: (presetId: string) => void;
  toggleAreaButton: (show: boolean) => void;
  resetToDefaults: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

// Load config from localStorage
function loadConfig(): AdminState {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const stored = localStorage.getItem(ADMIN_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return {
        ...defaultState,
        ...parsed,
        tabs: parsed.tabs || defaultAdminConfig.tabs,
        enabledEvents: parsed.enabledEvents || defaultAdminConfig.enabledEvents,
        eventPlacement: parsed.eventPlacement || defaultEventPlacement,
        theme: { ...defaultAdminConfig.theme, ...parsed.theme },
        themePresetId: parsed.themePresetId || 'grayscale',
        showAreaButton: parsed.showAreaButton ?? true,
      };
    }
  } catch (e) {
    console.error('Failed to load admin config:', e);
  }

  return defaultState;
}

// Save config to localStorage
function saveConfig(config: AdminState) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save admin config:', e);
  }
}

// Apply theme to CSS variables (legacy support)
function applyTheme(theme: ThemeConfig) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // Map theme config to CSS variables (legacy colors)
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

// Apply both preset and legacy theme
function applyFullTheme(state: AdminState) {
  const preset = themePresets[state.themePresetId] || defaultThemePreset;

  // Apply new semantic token colors from preset
  applyThemePreset(preset);

  // Apply legacy theme colors for backward compatibility
  applyTheme(state.theme);
}

// Provider
interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [state, dispatch] = useReducer(adminReducer, defaultState);

  // Load config from localStorage on mount
  useEffect(() => {
    const config = loadConfig();
    dispatch({ type: 'SET_CONFIG', payload: config });
    applyFullTheme(config);
  }, []);

  // Save to localStorage and apply theme whenever state changes
  useEffect(() => {
    saveConfig(state);
    applyFullTheme(state);
  }, [state]);

  // Get only enabled tabs, sorted by their position in allAvailableTabs
  const enabledTabs = state.tabs.filter(tab => tab.enabled);

  // Get current theme preset
  const currentPreset = themePresets[state.themePresetId] || defaultThemePreset;

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

  const setThemePreset = useCallback((presetId: string) => {
    dispatch({ type: 'SET_THEME_PRESET', payload: presetId });
  }, []);

  const toggleAreaButton = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_AREA_BUTTON', payload: show });
  }, []);

  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  }, []);

  return (
    <AdminContext.Provider
      value={{
        config: state,
        enabledTabs,
        currentPreset,
        updateTabs,
        toggleTab,
        reorderTabs,
        toggleEvent,
        reorderEvents,
        updateEventPlacement,
        isEventEnabled,
        updateTheme,
        setThemePreset,
        toggleAreaButton,
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
