/**
 * Vite Game Shell Template
 *
 * A complete mobile game UI shell with menus, settings, shop, leaderboard,
 * teams, daily rewards, and LiveOps events. The gameplay area is a "slot"
 * where AI-generated game logic plugs in.
 *
 * Based on Royal Match UI/UX patterns.
 */

import { FileSystemTree } from '@webcontainer/api';

export const viteGameShellTemplate: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'playcraft-game-shell',
          private: true,
          version: '0.0.0',
          type: 'module',
          scripts: {
            dev: 'vite --host --port 3000',
            build: 'tsc -b && vite build',
            preview: 'vite preview',
          },
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            gsap: '^3.12.5',
            clsx: '^2.1.1',
            'tailwind-merge': '^2.5.2',
            i18next: '^23.11.5',
            'react-i18next': '^14.1.2',
          },
          devDependencies: {
            '@types/react': '^18.3.3',
            '@types/react-dom': '^18.3.0',
            '@vitejs/plugin-react': '^4.3.1',
            autoprefixer: '^10.4.20',
            postcss: '^8.4.47',
            tailwindcss: '^3.4.11',
            typescript: '^5.5.3',
            vite: '^5.4.1',
            eslint: '^9.9.0',
            '@eslint/js': '^9.9.0',
            'typescript-eslint': '^8.3.0',
            'eslint-plugin-react-hooks': '^5.1.0',
          },
        },
        null,
        2
      ),
    },
  },
  'vite.config.ts': {
    file: {
      contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
  },
})
`,
    },
  },
  'tsconfig.json': {
    file: {
      contents: JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
            baseUrl: '.',
            paths: {
              '@/*': ['./src/*'],
            },
          },
          include: ['src'],
          references: [{ path: './tsconfig.node.json' }],
        },
        null,
        2
      ),
    },
  },
  'tsconfig.node.json': {
    file: {
      contents: JSON.stringify(
        {
          compilerOptions: {
            composite: true,
            skipLibCheck: true,
            module: 'ESNext',
            moduleResolution: 'bundler',
            allowSyntheticDefaultImports: true,
            strict: true,
          },
          include: ['vite.config.ts'],
        },
        null,
        2
      ),
    },
  },
  'tailwind.config.js': {
    file: {
      contents: `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Game shell colors
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1e1b4b',
          foreground: '#e0e7ff',
        },
        background: '#0f0d1a',
        surface: '#1a1625',
        'surface-elevated': '#252136',
        border: '#2d2640',
        muted: '#6b7280',
        gold: '#fbbf24',
        success: '#22c55e',
        danger: '#ef4444',
      },
      fontFamily: {
        game: ['system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        game: '1rem',
      },
    },
  },
  plugins: [],
}
`,
    },
  },
  'postcss.config.js': {
    file: {
      contents: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,
    },
  },
  'eslint.config.js': {
    file: {
      contents: `import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
)
`,
    },
  },
  'index.html': {
    file: {
      contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/game-icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#0f0d1a" />
    <title>PlayCraft Game</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
  },
  public: {
    directory: {
      'game-icon.svg': {
        file: {
          contents: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#6366f1"/>
  <path d="M30 35h40v30H30z" fill="#fff" opacity="0.9"/>
  <circle cx="40" cy="50" r="8" fill="#6366f1"/>
  <circle cx="60" cy="50" r="8" fill="#6366f1"/>
</svg>`,
        },
      },
    },
  },
  src: {
    directory: {
      'errorBridge.ts': {
        file: {
          contents: `/**
 * Error Bridge - Captures runtime errors and sends them to parent window
 * This enables PlayCraft to detect and auto-fix runtime issues
 */

// Only run if we're in an iframe (PlayCraft preview)
if (window.parent !== window) {
  // Capture console.error
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    try {
      window.parent.postMessage({
        type: 'playcraft-console-error',
        payload: {
          level: 'error',
          message: args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '),
          timestamp: Date.now(),
        },
      }, '*');
    } catch {
      // Ignore postMessage errors
    }
    originalError.apply(console, args);
  };

  // Capture console.warn
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    try {
      window.parent.postMessage({
        type: 'playcraft-console-warn',
        payload: {
          level: 'warn',
          message: args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '),
          timestamp: Date.now(),
        },
      }, '*');
    } catch {
      // Ignore postMessage errors
    }
    originalWarn.apply(console, args);
  };

  // Capture uncaught errors
  window.onerror = (message, source, line, col, error) => {
    try {
      window.parent.postMessage({
        type: 'playcraft-runtime-error',
        payload: {
          message: String(message),
          source: source || '',
          line: line || 0,
          col: col || 0,
          stack: error?.stack || '',
          timestamp: Date.now(),
        },
      }, '*');
    } catch {
      // Ignore postMessage errors
    }
    return false; // Let default handler run too
  };

  // Capture unhandled promise rejections
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    try {
      const reason = event.reason;
      window.parent.postMessage({
        type: 'playcraft-unhandled-rejection',
        payload: {
          message: reason?.message || String(reason),
          stack: reason?.stack || '',
          timestamp: Date.now(),
        },
      }, '*');
    } catch {
      // Ignore postMessage errors
    }
  };
}

export {};
`,
        },
      },
      'main.tsx': {
        file: {
          contents: `// Error bridge must be imported first to capture early errors
import './errorBridge'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
`,
        },
      },
      'App.tsx': {
        file: {
          contents: `import { GameProvider } from './store/GameContext'
import { NavigationProvider } from './store/NavigationContext'
import { AppShell } from './shell/AppShell'
import './i18n'

export function App() {
  return (
    <GameProvider>
      <NavigationProvider>
        <AppShell />
      </NavigationProvider>
    </GameProvider>
  )
}
`,
        },
      },
      'index.css': {
        file: {
          contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }

  html, body, #root {
    @apply h-full bg-background text-white antialiased;
  }

  body {
    @apply overflow-hidden;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* Hide scrollbars but keep functionality */
  ::-webkit-scrollbar {
    display: none;
  }

  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

@layer utilities {
  .safe-area-inset {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
`,
        },
      },
      'vite-env.d.ts': {
        file: {
          contents: `/// <reference types="vite/client" />
`,
        },
      },
      // i18n Configuration
      'i18n.ts': {
        file: {
          contents: `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      play: 'Play',
      shop: 'Shop',
      ranks: 'Ranks',
      settings: 'Settings',
      profile: 'Profile',

      // Game
      level: 'Level',
      lives: 'Lives',
      coins: 'Coins',
      stars: 'Stars',
      moves: 'Moves',

      // Actions
      start: 'Start',
      retry: 'Retry',
      continue: 'Continue',
      claim: 'Claim',
      buy: 'Buy',
      cancel: 'Cancel',

      // Results
      levelComplete: 'Level Complete!',
      levelFailed: 'Level Failed',
      outOfLives: 'Out of Lives!',
      greatJob: 'Great job!',

      // Shop
      bestValue: 'Best Value',
      popular: 'Popular',
      limitedTime: 'Limited Time',

      // Events
      royalPass: 'Royal Pass',
      skyRace: 'Sky Race',
      teamChest: 'Team Chest',
      dailyRewards: 'Daily Rewards',

      // Settings
      music: 'Music',
      sound: 'Sound Effects',
      notifications: 'Notifications',
      haptics: 'Haptic Feedback',

      // Time
      remaining: 'remaining',
      days: 'd',
      hours: 'h',
      minutes: 'm',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
`,
        },
      },
      // Types
      types: {
        directory: {
          'index.ts': {
            file: {
              contents: `// Game State Types
export interface PlayerState {
  coins: number;
  lives: number;
  maxLives: number;
  stars: number;
  currentLevel: number;
  username: string;
}

export interface Booster {
  id: string;
  name: string;
  type: 'pre-game' | 'in-game';
  count: number;
  icon: string;
}

export interface Settings {
  music: boolean;
  sound: boolean;
  notifications: boolean;
  haptics: boolean;
  language: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  level: number;
  rank: number;
  avatar?: string;
}

export interface DailyReward {
  day: number;
  reward: { type: 'coins' | 'booster' | 'lives'; amount: number };
  claimed: boolean;
  current: boolean;
}

export interface LiveOpsEvent {
  id: string;
  name: string;
  icon: string;
  endTime: Date | null;
  progress: number;
  maxProgress: number;
}

// Navigation Types
export type PageId =
  | 'main-menu'
  | 'gameplay'
  | 'shop'
  | 'settings'
  | 'leaderboard'
  | 'team'
  | 'profile'
  | 'daily-rewards'
  | 'inbox'
  | 'friends'
  | 'royal-pass'
  | 'sky-race'
  | 'team-chest';

export type ModalId =
  | 'level-start'
  | 'level-complete'
  | 'level-failed'
  | 'out-of-lives'
  | 'settings'
  | 'profile'
  | 'reward-claim'
  | 'booster-select'
  | 'purchase-confirm';

export type ModalIdOrNull = ModalId | null;

export interface NavigationState {
  currentPage: PageId;
  previousPage: PageId | null;
  modalStack: ModalIdOrNull[];
}
`,
            },
          },
        },
      },
      // Store
      store: {
        directory: {
          'index.ts': {
            file: {
              contents: `export { GameProvider, useGame, gameActions } from './GameContext';
export { NavigationProvider, useNavigation } from './NavigationContext';
`,
            },
          },
          'GameContext.tsx': {
            file: {
              contents: `import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { PlayerState, Booster, Settings, LiveOpsEvent, DailyReward } from '@/types';

// Game State
interface GameState {
  player: PlayerState;
  boosters: Booster[];
  settings: Settings;
  events: LiveOpsEvent[];
  dailyRewards: DailyReward[];
}

// Initial state
const initialState: GameState = {
  player: {
    coins: 2500,
    lives: 5,
    maxLives: 5,
    stars: 127,
    currentLevel: 42,
    username: 'Player',
  },
  boosters: [
    { id: 'hammer', name: 'Hammer', type: 'in-game', count: 3, icon: '🔨' },
    { id: 'bomb', name: 'Bomb', type: 'in-game', count: 2, icon: '💣' },
    { id: 'lightning', name: 'Lightning', type: 'in-game', count: 1, icon: '⚡' },
    { id: 'shuffle', name: 'Shuffle', type: 'pre-game', count: 5, icon: '🔀' },
    { id: 'extra-moves', name: '+5 Moves', type: 'pre-game', count: 2, icon: '➕' },
  ],
  settings: {
    music: true,
    sound: true,
    notifications: true,
    haptics: true,
    language: 'en',
  },
  events: [
    { id: 'royal-pass', name: 'Royal Pass', icon: '👑', endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), progress: 750, maxProgress: 1000 },
    { id: 'sky-race', name: 'Sky Race', icon: '🏃', endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), progress: 45, maxProgress: 100 },
  ],
  dailyRewards: Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    reward: { type: i === 6 ? 'booster' : 'coins' as const, amount: (i + 1) * 100 },
    claimed: i < 2,
    current: i === 2,
  })),
};

// Action Types
type GameAction =
  | { type: 'UPDATE_COINS'; payload: number }
  | { type: 'UPDATE_LIVES'; payload: number }
  | { type: 'UPDATE_STARS'; payload: number }
  | { type: 'COMPLETE_LEVEL' }
  | { type: 'USE_BOOSTER'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'CLAIM_DAILY_REWARD'; payload: number };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_COINS':
      return {
        ...state,
        player: { ...state.player, coins: Math.max(0, state.player.coins + action.payload) },
      };
    case 'UPDATE_LIVES':
      return {
        ...state,
        player: {
          ...state.player,
          lives: Math.min(state.player.maxLives, Math.max(0, state.player.lives + action.payload)),
        },
      };
    case 'UPDATE_STARS':
      return {
        ...state,
        player: { ...state.player, stars: Math.max(0, state.player.stars + action.payload) },
      };
    case 'COMPLETE_LEVEL':
      return {
        ...state,
        player: {
          ...state.player,
          currentLevel: state.player.currentLevel + 1,
          stars: state.player.stars + 1,
        },
      };
    case 'USE_BOOSTER':
      return {
        ...state,
        boosters: state.boosters.map((b) =>
          b.id === action.payload ? { ...b, count: Math.max(0, b.count - 1) } : b
        ),
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'CLAIM_DAILY_REWARD':
      return {
        ...state,
        dailyRewards: state.dailyRewards.map((d) => ({
          ...d,
          claimed: d.day <= action.payload ? true : d.claimed,
          current: d.day === action.payload + 1,
        })),
      };
    default:
      return state;
  }
}

// Context
interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

// Provider
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Action creators
export const gameActions = {
  updateCoins: (amount: number): GameAction => ({ type: 'UPDATE_COINS', payload: amount }),
  updateLives: (amount: number): GameAction => ({ type: 'UPDATE_LIVES', payload: amount }),
  updateStars: (amount: number): GameAction => ({ type: 'UPDATE_STARS', payload: amount }),
  completeLevel: (): GameAction => ({ type: 'COMPLETE_LEVEL' }),
  useBooster: (boosterId: string): GameAction => ({ type: 'USE_BOOSTER', payload: boosterId }),
  updateSettings: (settings: Partial<Settings>): GameAction => ({ type: 'UPDATE_SETTINGS', payload: settings }),
  claimDailyReward: (day: number): GameAction => ({ type: 'CLAIM_DAILY_REWARD', payload: day }),
};
`,
            },
          },
          'NavigationContext.tsx': {
            file: {
              contents: `import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { PageId, ModalId, ModalIdOrNull, NavigationState } from '@/types';

// Initial State
const initialState: NavigationState = {
  currentPage: 'main-menu',
  previousPage: null,
  modalStack: [],
};

// Action Types
type NavigationAction =
  | { type: 'NAVIGATE'; payload: { page: PageId } }
  | { type: 'GO_BACK' }
  | { type: 'OPEN_MODAL'; payload: { modal: ModalId } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'CLOSE_ALL_MODALS' };

// Reducer
function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        previousPage: state.currentPage,
        currentPage: action.payload.page,
        modalStack: [],
      };
    case 'GO_BACK':
      if (!state.previousPage) return state;
      return {
        ...state,
        currentPage: state.previousPage,
        previousPage: null,
        modalStack: [],
      };
    case 'OPEN_MODAL':
      return {
        ...state,
        modalStack: [...state.modalStack, action.payload.modal],
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modalStack: state.modalStack.slice(0, -1),
      };
    case 'CLOSE_ALL_MODALS':
      return {
        ...state,
        modalStack: [],
      };
    default:
      return state;
  }
}

// Context
interface NavigationContextValue {
  state: NavigationState;
  navigate: (page: PageId) => void;
  goBack: () => void;
  openModal: (modal: ModalId) => void;
  closeModal: () => void;
  closeAllModals: () => void;
  currentModal: ModalIdOrNull;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

// Provider
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);

  const navigate = useCallback((page: PageId) => {
    dispatch({ type: 'NAVIGATE', payload: { page } });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const openModal = useCallback((modal: ModalId) => {
    dispatch({ type: 'OPEN_MODAL', payload: { modal } });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const closeAllModals = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_MODALS' });
  }, []);

  const currentModal = state.modalStack[state.modalStack.length - 1] || null;
  const canGoBack = state.previousPage !== null;

  return (
    <NavigationContext.Provider
      value={{
        state,
        navigate,
        goBack,
        openModal,
        closeModal,
        closeAllModals,
        currentModal,
        canGoBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

// Hook
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
`,
            },
          },
        },
      },
      // Lib utilities
      lib: {
        directory: {
          'utils.ts': {
            file: {
              contents: `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatTime(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return days + 'd ' + (hours % 24) + 'h';
  }
  return hours + 'h ' + minutes + 'm';
}
`,
            },
          },
        },
      },
      // Shell components
      shell: {
        directory: {
          'AppShell.tsx': {
            file: {
              contents: `import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useNavigation } from '@/store';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { ModalManager } from './ModalManager';
import { PageRouter } from './PageRouter';
import type { PageId } from '@/types';

const NAV_PAGES: PageId[] = ['shop', 'main-menu', 'leaderboard'];

export function AppShell() {
  const { state } = useNavigation();
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef<PageId>(state.currentPage);

  // Animate page transitions
  useEffect(() => {
    if (prevPageRef.current === state.currentPage) return;
    if (!contentRef.current) return;

    const prevIndex = NAV_PAGES.indexOf(prevPageRef.current);
    const currentIndex = NAV_PAGES.indexOf(state.currentPage);

    // Slide animation for nav pages
    if (prevIndex !== -1 && currentIndex !== -1) {
      const direction = currentIndex > prevIndex ? 1 : -1;
      gsap.fromTo(
        contentRef.current,
        { x: direction * 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
    } else {
      // Fade for other transitions
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }
      );
    }

    prevPageRef.current = state.currentPage;
  }, [state.currentPage]);

  const showBottomNav = NAV_PAGES.includes(state.currentPage);

  return (
    <div className="h-full flex flex-col bg-background safe-area-inset">
      <Header />
      <main ref={contentRef} className="flex-1 overflow-hidden">
        <PageRouter />
      </main>
      {showBottomNav && <BottomNav />}
      <ModalManager />
    </div>
  );
}
`,
            },
          },
          'Header.tsx': {
            file: {
              contents: `import { useGame, useNavigation } from '@/store';
import { formatNumber } from '@/lib/utils';

export function Header() {
  const { state } = useGame();
  const { navigate, canGoBack, goBack, state: navState } = useNavigation();
  const { player } = state;

  const showBackButton = canGoBack && navState.currentPage !== 'main-menu';

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <button
            onClick={goBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-elevated"
          >
            ←
          </button>
        ) : (
          <button
            onClick={() => navigate('profile')}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold"
          >
            {player.username[0].toUpperCase()}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Lives */}
        <div className="flex items-center gap-1 bg-surface-elevated px-2 py-1 rounded-full">
          <span className="text-red-500">❤️</span>
          <span className="text-sm font-medium">{player.lives}</span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 bg-surface-elevated px-2 py-1 rounded-full">
          <span className="text-yellow-500">⭐</span>
          <span className="text-sm font-medium">{player.stars}</span>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-1 bg-surface-elevated px-2 py-1 rounded-full">
          <span className="text-gold">🪙</span>
          <span className="text-sm font-medium">{formatNumber(player.coins)}</span>
          <button className="ml-1 w-4 h-4 bg-success rounded-full text-xs flex items-center justify-center">+</button>
        </div>
      </div>
    </header>
  );
}
`,
            },
          },
          'BottomNav.tsx': {
            file: {
              contents: `import { useNavigation } from '@/store';
import { cn } from '@/lib/utils';
import type { PageId } from '@/types';

interface NavItem {
  id: PageId;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'shop', icon: '🛒', label: 'Shop' },
  { id: 'main-menu', icon: '🎮', label: 'Play' },
  { id: 'leaderboard', icon: '🏆', label: 'Ranks' },
];

export function BottomNav() {
  const { state, navigate } = useNavigation();

  return (
    <nav className="flex items-center justify-around px-4 py-2 bg-surface border-t border-border">
      {NAV_ITEMS.map((item) => {
        const isActive = state.currentPage === item.id;
        const isMain = item.id === 'main-menu';

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all',
              isActive && 'bg-primary/20',
              isMain && 'relative -mt-6'
            )}
          >
            <span
              className={cn(
                'text-2xl transition-transform',
                isMain && 'bg-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30',
                isActive && !isMain && 'scale-110'
              )}
            >
              {item.icon}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                isActive ? 'text-primary' : 'text-muted'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
`,
            },
          },
          'PageRouter.tsx': {
            file: {
              contents: `import { Suspense, lazy } from 'react';
import { useNavigation } from '@/store';
import { MainMenu } from '@/pages/MainMenu';
import { GameplayPage } from '@/pages/GameplayPage';

// Lazy load non-essential pages
const ShopPage = lazy(() => import('@/pages/ShopPage').then(m => ({ default: m.ShopPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const DailyRewardsPage = lazy(() => import('@/pages/DailyRewardsPage').then(m => ({ default: m.DailyRewardsPage })));

// LiveOps Event Pages
const RoyalPassPage = lazy(() => import('@/pages/events/RoyalPassPage').then(m => ({ default: m.RoyalPassPage })));
const SkyRacePage = lazy(() => import('@/pages/events/SkyRacePage').then(m => ({ default: m.SkyRacePage })));
const TeamChestPage = lazy(() => import('@/pages/events/TeamChestPage').then(m => ({ default: m.TeamChestPage })));

function PageSkeleton() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function PageRouter() {
  const { state } = useNavigation();

  const renderPage = () => {
    switch (state.currentPage) {
      case 'main-menu':
        return <MainMenu />;
      case 'gameplay':
        return <GameplayPage />;
      case 'shop':
        return <ShopPage />;
      case 'settings':
        return <SettingsPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'profile':
        return <ProfilePage />;
      case 'daily-rewards':
        return <DailyRewardsPage />;
      // LiveOps Events
      case 'royal-pass':
        return <RoyalPassPage />;
      case 'sky-race':
        return <SkyRacePage />;
      case 'team-chest':
        return <TeamChestPage />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <Suspense fallback={<PageSkeleton />}>
      {renderPage()}
    </Suspense>
  );
}
`,
            },
          },
          'ModalManager.tsx': {
            file: {
              contents: `import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useNavigation } from '@/store';
import { LevelStartModal } from '@/modals/LevelStartModal';
import { LevelCompleteModal } from '@/modals/LevelCompleteModal';
import { LevelFailedModal } from '@/modals/LevelFailedModal';
import { OutOfLivesModal } from '@/modals/OutOfLivesModal';
import { SettingsModal } from '@/modals/SettingsModal';

export function ModalManager() {
  const { currentModal, closeModal } = useNavigation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentModal && overlayRef.current && contentRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'back.out(1.2)' }
      );
    }
  }, [currentModal]);

  if (!currentModal) return null;

  const handleClose = () => {
    if (overlayRef.current && contentRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.15 });
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 10,
        duration: 0.15,
        onComplete: closeModal,
      });
    } else {
      closeModal();
    }
  };

  const renderModal = () => {
    switch (currentModal) {
      case 'level-start':
        return <LevelStartModal onClose={handleClose} />;
      case 'level-complete':
        return <LevelCompleteModal onClose={handleClose} />;
      case 'level-failed':
        return <LevelFailedModal onClose={handleClose} />;
      case 'out-of-lives':
        return <OutOfLivesModal onClose={handleClose} />;
      case 'settings':
        return <SettingsModal onClose={handleClose} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div ref={contentRef} className="relative z-10 w-full max-w-sm">
        {renderModal()}
      </div>
    </div>
  );
}
`,
            },
          },
        },
      },
      // Pages
      pages: {
        directory: {
          'MainMenu.tsx': {
            file: {
              contents: `import { useGame, useNavigation } from '@/store';
import { formatTime } from '@/lib/utils';

export function MainMenu() {
  const { state } = useGame();
  const { navigate, openModal } = useNavigation();
  const { player, events } = state;

  const handlePlay = () => {
    openModal('level-start');
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-auto">
      {/* Events Row */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {events.map((event) => (
          <button
            key={event.id}
            className="flex-shrink-0 bg-surface-elevated rounded-xl p-3 min-w-[120px]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{event.icon}</span>
              <span className="text-xs font-medium truncate">{event.name}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5 mb-1">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: ((event.progress / event.maxProgress) * 100) + '%' }}
              />
            </div>
            {event.endTime && (
              <span className="text-xs text-muted">
                {formatTime(event.endTime.getTime() - Date.now())}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => navigate('daily-rewards')}
          className="flex-shrink-0 bg-gold/20 border border-gold/50 rounded-xl p-3 min-w-[100px]"
        >
          <span className="text-2xl block mb-1">🎁</span>
          <span className="text-xs font-medium text-gold">Daily</span>
        </button>
      </div>

      {/* Level Roadmap */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-4">
          {[player.currentLevel + 2, player.currentLevel + 1, player.currentLevel].map((level, i) => (
            <div
              key={level}
              className={'flex items-center justify-center rounded-full transition-all ' + (
                i === 2
                  ? 'w-20 h-20 bg-primary shadow-lg shadow-primary/30'
                  : i === 1
                  ? 'w-14 h-14 bg-surface-elevated'
                  : 'w-10 h-10 bg-surface opacity-50'
              )}
            >
              <span className={'font-bold ' + (i === 2 ? 'text-2xl' : i === 1 ? 'text-lg' : 'text-sm')}>
                {level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Play Button */}
      <div className="mt-4">
        <button
          onClick={handlePlay}
          className="w-full py-4 bg-primary hover:bg-primary/90 rounded-2xl font-bold text-xl shadow-lg shadow-primary/30 transition-all active:scale-98"
        >
          ▶ Play Level {player.currentLevel}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => navigate('settings')}
          className="w-12 h-12 bg-surface-elevated rounded-full flex items-center justify-center"
        >
          ⚙️
        </button>
        <button
          onClick={() => navigate('inbox')}
          className="w-12 h-12 bg-surface-elevated rounded-full flex items-center justify-center relative"
        >
          ✉️
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-xs flex items-center justify-center">3</span>
        </button>
      </div>
    </div>
  );
}
`,
            },
          },
          'GameplayPage.tsx': {
            file: {
              contents: `/**
 * GAMEPLAY PAGE
 *
 * This is the "slot" where AI-generated game logic plugs in.
 * The shell provides:
 * - Header with resources (lives, coins, stars)
 * - GameplayHUD with level info and moves
 * - handleWin/handleLose callbacks for game completion
 * - Booster integration
 *
 * AI should implement the <GameBoard> component with actual game mechanics.
 */

import { useGame, useNavigation, gameActions } from '@/store';

export function GameplayPage() {
  const { state, dispatch } = useGame();
  const { openModal, navigate } = useNavigation();
  const { player, boosters } = state;

  // Call this when the player wins
  const handleWin = (score: number = 100, stars: number = 1) => {
    dispatch(gameActions.updateCoins(score));
    dispatch(gameActions.updateStars(stars));
    dispatch(gameActions.completeLevel());
    openModal('level-complete');
  };

  // Call this when the player loses
  const handleLose = () => {
    dispatch(gameActions.updateLives(-1));
    if (state.player.lives <= 1) {
      openModal('out-of-lives');
    } else {
      openModal('level-failed');
    }
  };

  // Use a booster
  const handleUseBooster = (boosterId: string) => {
    const booster = boosters.find(b => b.id === boosterId);
    if (booster && booster.count > 0) {
      dispatch(gameActions.useBooster(boosterId));
      // TODO: Apply booster effect in game
    }
  };

  const inGameBoosters = boosters.filter(b => b.type === 'in-game' && b.count > 0);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Gameplay HUD */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface">
        <button
          onClick={() => navigate('main-menu')}
          className="w-8 h-8 flex items-center justify-center bg-surface-elevated rounded-full"
        >
          ✕
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Level</span>
          <span className="text-lg font-bold">{player.currentLevel}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted">Moves</span>
          <span className="text-lg font-bold text-gold">25</span>
        </div>
      </div>

      {/* ============================================== */}
      {/* GAMEPLAY AREA - AI GENERATES GAME LOGIC HERE */}
      {/* ============================================== */}
      <div className="flex-1 relative overflow-hidden">
        <GameBoard
          level={player.currentLevel}
          onWin={handleWin}
          onLose={handleLose}
        />
      </div>

      {/* Booster Bar */}
      {inGameBoosters.length > 0 && (
        <div className="flex justify-center gap-3 p-3 bg-surface border-t border-border">
          {inGameBoosters.map((booster) => (
            <button
              key={booster.id}
              onClick={() => handleUseBooster(booster.id)}
              className="relative w-12 h-12 bg-surface-elevated rounded-xl flex items-center justify-center text-2xl"
            >
              {booster.icon}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center font-bold">
                {booster.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * GAME BOARD COMPONENT
 *
 * This is a placeholder. AI should replace this with actual game logic.
 *
 * Props:
 * - level: Current level number
 * - onWin: Call when player completes the level (optionally pass score and stars)
 * - onLose: Call when player fails the level
 *
 * Examples of games that can be implemented:
 * - Match-3 puzzle (like Candy Crush)
 * - Block puzzle (like Tetris)
 * - Word game
 * - Card game
 * - Arcade game
 */
interface GameBoardProps {
  level: number;
  onWin: (score?: number, stars?: number) => void;
  onLose: () => void;
}

function GameBoard({ level, onWin, onLose }: GameBoardProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🎮</div>
      <h2 className="text-xl font-bold mb-2">Level {level}</h2>
      <p className="text-muted mb-8 max-w-xs">
        This is where the game goes! Ask the AI to implement your game mechanics here.
      </p>

      {/* Demo buttons for testing */}
      <div className="flex gap-4">
        <button
          onClick={() => onWin(150, 3)}
          className="px-6 py-3 bg-success rounded-xl font-bold"
        >
          🏆 Win
        </button>
        <button
          onClick={onLose}
          className="px-6 py-3 bg-danger rounded-xl font-bold"
        >
          💔 Lose
        </button>
      </div>
    </div>
  );
}
`,
            },
          },
          'ShopPage.tsx': {
            file: {
              contents: `import { useGame } from '@/store';
import { formatNumber } from '@/lib/utils';

const COIN_PACKS = [
  { id: 'coins-1', coins: 1000, price: '$0.99', popular: false },
  { id: 'coins-2', coins: 5000, price: '$4.99', popular: true },
  { id: 'coins-3', coins: 15000, price: '$9.99', popular: false },
  { id: 'coins-4', coins: 50000, price: '$19.99', popular: false },
];

export function ShopPage() {
  const { state } = useGame();
  const { boosters } = state;

  return (
    <div className="h-full overflow-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shop</h1>

      {/* Special Offer */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
            ⏰ Limited Time
          </span>
          <span className="text-lg font-bold">$4.99</span>
        </div>
        <h3 className="text-lg font-bold mb-2">Starter Pack</h3>
        <div className="flex gap-2">
          {boosters.slice(0, 3).map((b) => (
            <div key={b.id} className="bg-white/20 rounded-xl p-2 text-center">
              <span className="text-2xl">{b.icon}</span>
              <span className="text-xs block">x5</span>
            </div>
          ))}
          <div className="bg-white/20 rounded-xl p-2 text-center">
            <span className="text-2xl">🪙</span>
            <span className="text-xs block">1000</span>
          </div>
        </div>
      </div>

      {/* Coins Section */}
      <h2 className="text-lg font-bold mb-3">Coins</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {COIN_PACKS.map((pack) => (
          <button
            key={pack.id}
            className={'relative bg-surface-elevated rounded-xl p-4 text-center ' + (pack.popular ? 'ring-2 ring-gold' : '')}
          >
            {pack.popular && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-bold px-2 py-0.5 rounded-full">
                Best Value
              </span>
            )}
            <span className="text-3xl block mb-1">🪙</span>
            <span className="text-lg font-bold block">{formatNumber(pack.coins)}</span>
            <span className="text-sm text-primary font-medium">{pack.price}</span>
          </button>
        ))}
      </div>

      {/* Boosters Section */}
      <h2 className="text-lg font-bold mb-3">Boosters</h2>
      <div className="space-y-2">
        {boosters.map((booster) => (
          <div
            key={booster.id}
            className="flex items-center justify-between bg-surface-elevated rounded-xl p-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{booster.icon}</span>
              <div>
                <span className="font-medium block">{booster.name}</span>
                <span className="text-xs text-muted">You have: {booster.count}</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary rounded-lg text-sm font-medium">
              🪙 200
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
            },
          },
          'SettingsPage.tsx': {
            file: {
              contents: `import { useGame, useNavigation, gameActions } from '@/store';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { state, dispatch } = useGame();
  const { goBack } = useNavigation();
  const { settings } = state;

  const handleToggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      dispatch(gameActions.updateSettings({ [key]: !settings[key] }));
    }
  };

  return (
    <div className="h-full overflow-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={goBack} className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center">
          ←
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Audio Settings */}
        <div className="bg-surface-elevated rounded-xl p-4">
          <h2 className="text-sm font-medium text-muted mb-3">Audio</h2>
          <div className="space-y-3">
            <ToggleRow
              icon="🎵"
              label="Music"
              enabled={settings.music}
              onToggle={() => handleToggle('music')}
            />
            <ToggleRow
              icon="🔊"
              label="Sound Effects"
              enabled={settings.sound}
              onToggle={() => handleToggle('sound')}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface-elevated rounded-xl p-4">
          <h2 className="text-sm font-medium text-muted mb-3">Notifications</h2>
          <div className="space-y-3">
            <ToggleRow
              icon="🔔"
              label="Push Notifications"
              enabled={settings.notifications}
              onToggle={() => handleToggle('notifications')}
            />
            <ToggleRow
              icon="📳"
              label="Haptic Feedback"
              enabled={settings.haptics}
              onToggle={() => handleToggle('haptics')}
            />
          </div>
        </div>

        {/* Account */}
        <div className="bg-surface-elevated rounded-xl p-4">
          <h2 className="text-sm font-medium text-muted mb-3">Account</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between py-2">
              <span>🔗 Connect Account</span>
              <span className="text-muted">→</span>
            </button>
            <button className="w-full flex items-center justify-between py-2">
              <span>📋 Privacy Policy</span>
              <span className="text-muted">→</span>
            </button>
            <button className="w-full flex items-center justify-between py-2">
              <span>📄 Terms of Service</span>
              <span className="text-muted">→</span>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-muted mt-8">
          <p>Version 1.0.0</p>
          <p>Made with PlayCraft ⚡</p>
        </div>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  icon: string;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ icon, label, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'w-12 h-7 rounded-full transition-colors relative',
          enabled ? 'bg-primary' : 'bg-border'
        )}
      >
        <div
          className={cn(
            'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}
`,
            },
          },
          'LeaderboardPage.tsx': {
            file: {
              contents: `import { useState } from 'react';
import { useGame } from '@/store';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types';

const TABS = ['Global', 'Friends', 'Team'] as const;

// Mock data
const MOCK_LEADERBOARD: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => ({
  id: 'user-' + (i + 1),
  username: i === 5 ? 'You' : 'Player' + (i + 1),
  level: 100 - i * 3,
  rank: i + 1,
}));

export function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Global');
  const { state } = useGame();

  const userRank = MOCK_LEADERBOARD.findIndex(e => e.username === 'You') + 1;

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 p-2 bg-surface">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab ? 'bg-primary' : 'bg-surface-elevated'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Your Rank Card */}
      <div className="mx-4 my-3 bg-primary/20 border border-primary rounded-xl p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold">
            {state.player.username[0]}
          </div>
          <div className="flex-1">
            <span className="font-medium">{state.player.username}</span>
            <span className="text-sm text-muted block">Level {state.player.currentLevel}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">#{userRank}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-auto px-4">
        {MOCK_LEADERBOARD.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              'flex items-center gap-3 py-3 border-b border-border',
              entry.username === 'You' && 'bg-primary/10 -mx-4 px-4'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
              entry.rank === 1 ? 'bg-gold text-black' :
              entry.rank === 2 ? 'bg-gray-400 text-black' :
              entry.rank === 3 ? 'bg-amber-700' : 'bg-surface-elevated'
            )}>
              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
            </div>
            <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center">
              {entry.username[0]}
            </div>
            <div className="flex-1">
              <span className={cn('font-medium', entry.username === 'You' && 'text-primary')}>
                {entry.username}
              </span>
            </div>
            <span className="text-sm text-muted">Lvl {entry.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
            },
          },
          'ProfilePage.tsx': {
            file: {
              contents: `import { useGame, useNavigation } from '@/store';
import { formatNumber } from '@/lib/utils';

export function ProfilePage() {
  const { state } = useGame();
  const { goBack } = useNavigation();
  const { player } = state;

  return (
    <div className="h-full overflow-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={goBack} className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center">
          ←
        </button>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      {/* Avatar & Name */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl font-bold mb-3">
          {player.username[0].toUpperCase()}
        </div>
        <h2 className="text-xl font-bold">{player.username}</h2>
        <span className="text-muted">Level {player.currentLevel}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface-elevated rounded-xl p-4 text-center">
          <span className="text-2xl block mb-1">⭐</span>
          <span className="text-lg font-bold block">{player.stars}</span>
          <span className="text-xs text-muted">Stars</span>
        </div>
        <div className="bg-surface-elevated rounded-xl p-4 text-center">
          <span className="text-2xl block mb-1">🏆</span>
          <span className="text-lg font-bold block">{player.currentLevel - 1}</span>
          <span className="text-xs text-muted">Levels Won</span>
        </div>
        <div className="bg-surface-elevated rounded-xl p-4 text-center">
          <span className="text-2xl block mb-1">🔥</span>
          <span className="text-lg font-bold block">7</span>
          <span className="text-xs text-muted">Day Streak</span>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-surface-elevated rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-muted mb-3">Resources</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪙</span>
              <span>Coins</span>
            </div>
            <span className="font-bold">{formatNumber(player.coins)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">❤️</span>
              <span>Lives</span>
            </div>
            <span className="font-bold">{player.lives} / {player.maxLives}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full bg-surface-elevated rounded-xl p-4 flex items-center justify-between">
          <span>✏️ Edit Profile</span>
          <span className="text-muted">→</span>
        </button>
        <button className="w-full bg-surface-elevated rounded-xl p-4 flex items-center justify-between">
          <span>🎨 Change Avatar</span>
          <span className="text-muted">→</span>
        </button>
      </div>
    </div>
  );
}
`,
            },
          },
          'DailyRewardsPage.tsx': {
            file: {
              contents: `import { useGame, useNavigation, gameActions } from '@/store';
import { cn } from '@/lib/utils';

export function DailyRewardsPage() {
  const { state, dispatch } = useGame();
  const { goBack } = useNavigation();
  const { dailyRewards } = state;

  const currentDay = dailyRewards.find(d => d.current);

  const handleClaim = () => {
    if (currentDay) {
      dispatch(gameActions.claimDailyReward(currentDay.day));
      // Also give the reward
      if (currentDay.reward.type === 'coins') {
        dispatch(gameActions.updateCoins(currentDay.reward.amount));
      } else if (currentDay.reward.type === 'lives') {
        dispatch(gameActions.updateLives(currentDay.reward.amount));
      }
    }
  };

  return (
    <div className="h-full overflow-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={goBack} className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center">
          ←
        </button>
        <h1 className="text-2xl font-bold">Daily Rewards</h1>
      </div>

      <p className="text-center text-muted mb-6">
        Come back every day to claim your rewards!
      </p>

      {/* Calendar Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {dailyRewards.map((day) => (
          <div
            key={day.day}
            className={cn(
              'relative rounded-xl p-3 text-center transition-all',
              day.claimed ? 'bg-success/20 border border-success' :
              day.current ? 'bg-primary/20 border-2 border-primary' :
              'bg-surface-elevated opacity-60'
            )}
          >
            {day.claimed && (
              <span className="absolute top-1 right-1 text-success text-sm">✓</span>
            )}
            <span className="text-xs text-muted block mb-1">Day {day.day}</span>
            <span className="text-2xl block mb-1">
              {day.reward.type === 'coins' ? '🪙' :
               day.reward.type === 'lives' ? '❤️' : '🎁'}
            </span>
            <span className="text-sm font-bold">
              {day.reward.type === 'booster' ? 'Booster' : day.reward.amount}
            </span>
          </div>
        ))}
      </div>

      {/* Claim Button */}
      {currentDay && !currentDay.claimed && (
        <button
          onClick={handleClaim}
          className="w-full py-4 bg-primary rounded-2xl font-bold text-lg shadow-lg shadow-primary/30"
        >
          Claim Day {currentDay.day} Reward
        </button>
      )}

      {currentDay?.claimed && (
        <div className="text-center py-4 bg-surface-elevated rounded-2xl">
          <span className="text-muted">Come back tomorrow for more rewards!</span>
        </div>
      )}
    </div>
  );
}
`,
            },
          },
          // LiveOps Event Pages
          events: {
            directory: {
              'RoyalPassPage.tsx': {
                file: {
                  contents: `import { useState } from 'react';
import { useGame, useNavigation } from '@/store';
import { formatTime } from '@/lib/utils';

interface PassReward {
  id: number;
  freeReward: { icon: string; amount: string };
  premiumReward: { icon: string; amount: string };
  unlocked: boolean;
  freeClaimed: boolean;
}

const PASS_DATA: PassReward[] = [
  { id: 1, freeReward: { icon: '🪙', amount: '100' }, premiumReward: { icon: '💣', amount: 'x2' }, unlocked: true, freeClaimed: true },
  { id: 2, freeReward: { icon: '⚡', amount: 'x1' }, premiumReward: { icon: '🎁', amount: 'x1' }, unlocked: true, freeClaimed: true },
  { id: 3, freeReward: { icon: '🪙', amount: '200' }, premiumReward: { icon: '❤️', amount: '∞30m' }, unlocked: true, freeClaimed: false },
  { id: 4, freeReward: { icon: '🔨', amount: 'x1' }, premiumReward: { icon: '🪙', amount: '500' }, unlocked: false, freeClaimed: false },
  { id: 5, freeReward: { icon: '🪙', amount: '300' }, premiumReward: { icon: '🎁', amount: 'x2' }, unlocked: false, freeClaimed: false },
];

export function RoyalPassPage() {
  const { state } = useGame();
  const { goBack } = useNavigation();
  const [isActivated, setIsActivated] = useState(false);

  const event = state.events.find(e => e.id === 'royal-pass');
  const progress = event ? (event.progress / event.maxProgress) * 100 : 0;
  const currentStage = PASS_DATA.filter(p => p.unlocked).length;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="bg-gradient-to-b from-purple-600 to-purple-800 p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goBack} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">←</button>
          <h1 className="text-xl font-bold">Royal Pass</h1>
          <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">?</button>
        </div>
        {event?.endTime && (
          <div className="text-center text-sm opacity-80 mb-3">⏱ {formatTime(event.endTime.getTime() - Date.now())} remaining</div>
        )}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center rotate-12">⭐</div>
          <div className="flex-1">
            <div className="h-5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full" style={{ width: progress + '%' }} />
            </div>
          </div>
          <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center font-bold">{currentStage}</div>
        </div>
      </div>
      {!isActivated && (
        <div className="px-4 -mt-3 relative z-10">
          <button onClick={() => setIsActivated(true)} className="w-full py-3 bg-gold text-black rounded-xl font-bold shadow-lg">
            Activate Royal Pass - $9.99
          </button>
        </div>
      )}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex text-center text-sm text-muted mb-2">
          <div className="flex-1">Free</div>
          <div className="w-12"></div>
          <div className="flex-1 text-gold font-medium">Premium</div>
        </div>
        {PASS_DATA.map((reward) => (
          <div key={reward.id} className="flex items-center gap-2 mb-3">
            <div className={'flex-1 p-3 rounded-xl border-2 ' + (reward.freeClaimed ? 'bg-success/20 border-success' : reward.unlocked ? 'bg-surface-elevated border-border' : 'bg-surface border-border opacity-50')}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">{reward.freeReward.icon}</span>
                <span className="text-sm font-medium">{reward.freeReward.amount}</span>
              </div>
            </div>
            <div className={'w-10 h-10 rounded-lg rotate-45 flex items-center justify-center font-bold ' + (reward.unlocked ? 'bg-success' : 'bg-surface-elevated')}>
              <span className="-rotate-45">{reward.id}</span>
            </div>
            <div className={'flex-1 p-3 rounded-xl border-2 relative ' + (isActivated && reward.unlocked ? 'bg-surface-elevated border-gold' : 'bg-surface border-border opacity-50')}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">{reward.premiumReward.icon}</span>
                <span className="text-sm font-medium">{reward.premiumReward.amount}</span>
              </div>
              {!isActivated && <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded text-xs flex items-center justify-center">🔒</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
                },
              },
              'SkyRacePage.tsx': {
                file: {
                  contents: `import { useState, useEffect } from 'react';
import { useGame, useNavigation } from '@/store';

interface Competitor { id: string; name: string; score: number; isPlayer?: boolean; rank?: number; }

export function SkyRacePage() {
  const { state } = useGame();
  const { goBack, navigate } = useNavigation();
  const [playerScore, setPlayerScore] = useState(135);
  const [isCompeting, setIsCompeting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const competitors: Competitor[] = [
    { id: '1', name: 'SpeedKing', score: playerScore + 45 },
    { id: '2', name: 'You', score: playerScore, isPlayer: true },
    { id: '3', name: 'RacerX', score: playerScore - 20 },
    { id: '4', name: 'SwiftOne', score: playerScore - 55 },
    { id: '5', name: 'Blazer', score: playerScore - 80 },
  ].sort((a, b) => b.score - a.score).map((c, i) => ({ ...c, rank: i + 1 }));

  const playerRank = competitors.find(c => c.isPlayer)?.rank || 2;

  useEffect(() => {
    if (!isCompeting) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [isCompeting]);

  const formatTimeLeft = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return mins + ':' + secs.toString().padStart(2, '0');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="bg-gradient-to-b from-orange-500 to-red-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goBack} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">←</button>
          <h1 className="text-xl font-bold">Sky Race</h1>
          <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">?</button>
        </div>
        <p className="text-center text-sm opacity-90">Race against 5 players in 30 minutes!</p>
      </div>
      {!isCompeting ? (
        <div className="flex-1 p-4 flex flex-col">
          <div className="bg-surface-elevated rounded-xl p-4 mb-4">
            <h3 className="font-bold mb-2">How It Works</h3>
            <ul className="text-sm text-muted space-y-2">
              <li>🎮 Play levels to earn points</li>
              <li>⚡ Use power-ups for bonus points</li>
              <li>🏆 Top 3 win prizes!</li>
            </ul>
          </div>
          <div className="bg-surface-elevated rounded-xl p-4 mb-4">
            <h3 className="font-bold mb-3">Prizes</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>🥇 1st</span><span className="font-bold">500 🪙</span></div>
              <div className="flex justify-between"><span>🥈 2nd</span><span className="font-bold">200 🪙</span></div>
              <div className="flex justify-between"><span>🥉 3rd</span><span className="font-bold">100 🪙</span></div>
            </div>
          </div>
          <button onClick={() => setIsCompeting(true)} className="mt-auto w-full py-4 bg-primary rounded-2xl font-bold text-lg">Join Competition</button>
        </div>
      ) : (
        <div className="flex-1 p-4 flex flex-col">
          <div className="bg-surface-elevated rounded-xl p-4 mb-4 text-center">
            <span className="text-muted text-sm">Time Remaining</span>
            <div className="text-3xl font-bold text-gold">{formatTimeLeft()}</div>
          </div>
          <div className="bg-primary/20 border border-primary rounded-xl p-4 mb-4">
            <div className="flex justify-between">
              <div><span className="text-sm text-muted">Your Score</span><div className="text-2xl font-bold">{playerScore} 👏</div></div>
              <div className="text-right"><span className="text-sm text-muted">Rank</span><div className="text-2xl font-bold">#{playerRank}</div></div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setPlayerScore(s => s + 10)} className="flex-1 py-2 bg-surface-elevated rounded-lg text-sm">+10</button>
              <button onClick={() => setPlayerScore(s => s + 25)} className="flex-1 py-2 bg-surface-elevated rounded-lg text-sm">+25</button>
            </div>
          </div>
          <div className="bg-surface-elevated rounded-xl overflow-hidden flex-1">
            <div className="px-4 py-2 bg-surface font-bold border-b border-border">Leaderboard</div>
            <div className="divide-y divide-border">
              {competitors.map((c) => (
                <div key={c.id} className={'flex items-center gap-3 px-4 py-3 ' + (c.isPlayer ? 'bg-primary/10' : '')}>
                  <div className={'w-8 h-8 rounded-full flex items-center justify-center font-bold ' + (c.rank === 1 ? 'bg-gold text-black' : 'bg-surface')}>{c.rank}</div>
                  <div className="flex-1 font-medium">{c.name}</div>
                  <div className="font-bold">{c.score} 👏</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => navigate('gameplay')} className="w-full py-4 bg-primary rounded-2xl font-bold text-lg mt-4">Play to Earn</button>
        </div>
      )}
    </div>
  );
}
`,
                },
              },
              'TeamChestPage.tsx': {
                file: {
                  contents: `import { useGame, useNavigation, gameActions } from '@/store';

const TEAM_MEMBERS = [
  { id: '1', name: 'You', contributed: 45, avatar: '👤' },
  { id: '2', name: 'StarPlayer', contributed: 38, avatar: '⭐' },
  { id: '3', name: 'GameMaster', contributed: 32, avatar: '🎮' },
  { id: '4', name: 'ProGamer', contributed: 28, avatar: '🏆' },
];

const CHEST_REWARDS = [
  { milestone: 50, reward: '100 🪙', claimed: true },
  { milestone: 100, reward: '💣 x2', claimed: true },
  { milestone: 200, reward: '500 🪙', claimed: false },
  { milestone: 300, reward: '🎁 Mystery', claimed: false },
];

export function TeamChestPage() {
  const { state, dispatch } = useGame();
  const { goBack } = useNavigation();

  const totalContributed = TEAM_MEMBERS.reduce((sum, m) => sum + m.contributed, 0);
  const currentMilestone = CHEST_REWARDS.find(r => !r.claimed) || CHEST_REWARDS[CHEST_REWARDS.length - 1];
  const progress = Math.min(100, (totalContributed / currentMilestone.milestone) * 100);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="bg-gradient-to-b from-blue-500 to-blue-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goBack} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">←</button>
          <h1 className="text-xl font-bold">Team Chest</h1>
          <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">?</button>
        </div>
        <p className="text-center text-sm opacity-90">Work together to unlock rewards!</p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-surface-elevated rounded-xl p-4 mb-4 text-center">
          <div className="text-5xl mb-2">📦</div>
          <div className="mb-2"><span className="text-2xl font-bold">{totalContributed}</span><span className="text-muted"> / {currentMilestone.milestone}</span></div>
          <div className="h-4 bg-surface rounded-full overflow-hidden mb-2">
            <div className="h-full bg-primary rounded-full" style={{ width: progress + '%' }} />
          </div>
          <span className="text-sm text-muted">Next: {currentMilestone.reward}</span>
        </div>
        <div className="bg-surface-elevated rounded-xl p-4 mb-4">
          <h3 className="font-bold mb-3">Milestones</h3>
          <div className="space-y-2">
            {CHEST_REWARDS.map((r, i) => (
              <div key={i} className={'flex items-center justify-between p-2 rounded-lg ' + (r.claimed ? 'bg-success/20' : totalContributed >= r.milestone ? 'bg-gold/20' : '')}>
                <div className="flex items-center gap-2">
                  <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm ' + (r.claimed ? 'bg-success' : 'bg-surface')}>{r.claimed ? '✓' : r.milestone}</div>
                  <span>{r.reward}</span>
                </div>
                {!r.claimed && totalContributed >= r.milestone && <button className="px-3 py-1 bg-gold text-black rounded-lg text-sm font-bold">Claim</button>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface-elevated rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-surface font-bold border-b border-border">Team</div>
          <div className="divide-y divide-border">
            {TEAM_MEMBERS.map((m) => (
              <div key={m.id} className={'flex items-center gap-3 px-4 py-3 ' + (m.name === 'You' ? 'bg-primary/10' : '')}>
                <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-xl">{m.avatar}</div>
                <div className="flex-1 font-medium">{m.name}</div>
                <div className="font-bold">{m.contributed} ⭐</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 bg-surface border-t border-border">
        <button onClick={() => state.player.stars > 0 && dispatch(gameActions.updateStars(-1))} disabled={state.player.stars <= 0} className="w-full py-4 bg-primary rounded-2xl font-bold text-lg disabled:opacity-50">
          Contribute ⭐ ({state.player.stars} available)
        </button>
      </div>
    </div>
  );
}
`,
                },
              },
            },
          },
        },
      },
      // Modals
      modals: {
        directory: {
          'LevelStartModal.tsx': {
            file: {
              contents: `import { useGame, useNavigation } from '@/store';

interface LevelStartModalProps {
  onClose: () => void;
}

export function LevelStartModal({ onClose }: LevelStartModalProps) {
  const { state } = useGame();
  const { navigate, closeAllModals } = useNavigation();
  const { player, boosters } = state;

  const preGameBoosters = boosters.filter(b => b.type === 'pre-game' && b.count > 0);

  const handlePlay = () => {
    closeAllModals();
    navigate('gameplay');
  };

  return (
    <div className="bg-surface rounded-3xl p-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-bold">
          {player.currentLevel}
        </div>
        <h2 className="text-xl font-bold">Level {player.currentLevel}</h2>
        <p className="text-muted text-sm">Match 3 or more to win!</p>
      </div>

      {/* Objectives */}
      <div className="bg-surface-elevated rounded-xl p-4 mb-4">
        <h3 className="text-sm font-medium text-muted mb-2">Objectives</h3>
        <div className="flex justify-center gap-4">
          <div className="text-center">
            <span className="text-2xl">🔵</span>
            <span className="text-sm font-bold block">×20</span>
          </div>
          <div className="text-center">
            <span className="text-2xl">🔴</span>
            <span className="text-sm font-bold block">×15</span>
          </div>
        </div>
      </div>

      {/* Boosters */}
      {preGameBoosters.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted mb-2">Power-Ups</h3>
          <div className="flex justify-center gap-3">
            {preGameBoosters.map((b) => (
              <button
                key={b.id}
                className="w-14 h-14 bg-surface-elevated rounded-xl flex flex-col items-center justify-center"
              >
                <span className="text-xl">{b.icon}</span>
                <span className="text-xs text-muted">{b.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-surface-elevated rounded-xl font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handlePlay}
          className="flex-1 py-3 bg-primary rounded-xl font-bold"
        >
          ▶ Play
        </button>
      </div>
    </div>
  );
}
`,
            },
          },
          'LevelCompleteModal.tsx': {
            file: {
              contents: `import { useGame, useNavigation } from '@/store';

interface LevelCompleteModalProps {
  onClose: () => void;
}

export function LevelCompleteModal({ onClose }: LevelCompleteModalProps) {
  const { state } = useGame();
  const { navigate, closeAllModals } = useNavigation();
  const { player } = state;

  const handleContinue = () => {
    closeAllModals();
    navigate('main-menu');
  };

  return (
    <div className="bg-surface rounded-3xl p-6 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
      <p className="text-muted mb-6">Great job!</p>

      {/* Stars */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3].map((star) => (
          <span key={star} className="text-4xl">
            {star <= 3 ? '⭐' : '☆'}
          </span>
        ))}
      </div>

      {/* Rewards */}
      <div className="bg-surface-elevated rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-muted mb-3">Rewards</h3>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <span className="text-2xl">🪙</span>
            <span className="font-bold block">+150</span>
          </div>
          <div className="text-center">
            <span className="text-2xl">⭐</span>
            <span className="font-bold block">+1</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-4 bg-primary rounded-2xl font-bold text-lg"
      >
        Continue
      </button>
    </div>
  );
}
`,
            },
          },
          'LevelFailedModal.tsx': {
            file: {
              contents: `import { useGame, useNavigation, gameActions } from '@/store';

interface LevelFailedModalProps {
  onClose: () => void;
}

export function LevelFailedModal({ onClose }: LevelFailedModalProps) {
  const { state, dispatch } = useGame();
  const { navigate, closeAllModals } = useNavigation();
  const { player } = state;

  const handleRetry = () => {
    if (player.lives > 0) {
      dispatch(gameActions.updateLives(-1));
      closeAllModals();
      navigate('gameplay');
    }
  };

  const handleQuit = () => {
    closeAllModals();
    navigate('main-menu');
  };

  return (
    <div className="bg-surface rounded-3xl p-6 text-center">
      <div className="text-6xl mb-4">😢</div>
      <h2 className="text-2xl font-bold mb-2">Level Failed</h2>
      <p className="text-muted mb-6">Don't give up!</p>

      {/* Lives remaining */}
      <div className="bg-surface-elevated rounded-xl p-4 mb-6">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">❤️</span>
          <span className="font-bold">{player.lives} lives remaining</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleQuit}
          className="flex-1 py-3 bg-surface-elevated rounded-xl font-medium"
        >
          Quit
        </button>
        <button
          onClick={handleRetry}
          disabled={player.lives <= 0}
          className="flex-1 py-3 bg-primary rounded-xl font-bold disabled:opacity-50"
        >
          ❤️ Retry
        </button>
      </div>
    </div>
  );
}
`,
            },
          },
          'OutOfLivesModal.tsx': {
            file: {
              contents: `import { useNavigation } from '@/store';

interface OutOfLivesModalProps {
  onClose: () => void;
}

export function OutOfLivesModal({ onClose }: OutOfLivesModalProps) {
  const { navigate, closeAllModals } = useNavigation();

  const handleGoHome = () => {
    closeAllModals();
    navigate('main-menu');
  };

  return (
    <div className="bg-surface rounded-3xl p-6 text-center">
      <div className="text-6xl mb-4">💔</div>
      <h2 className="text-2xl font-bold mb-2">Out of Lives!</h2>
      <p className="text-muted mb-6">Wait for lives to refill or get more</p>

      {/* Timer */}
      <div className="bg-surface-elevated rounded-xl p-4 mb-4">
        <span className="text-muted text-sm block mb-1">Next life in</span>
        <span className="text-2xl font-bold">29:45</span>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <button className="w-full py-3 bg-primary rounded-xl font-bold flex items-center justify-center gap-2">
          <span>❤️ Get Full Lives</span>
          <span className="text-sm opacity-80">🪙 100</span>
        </button>
        <button className="w-full py-3 bg-success rounded-xl font-bold flex items-center justify-center gap-2">
          <span>📺 Watch Ad</span>
          <span className="text-sm opacity-80">+1 ❤️</span>
        </button>
        <button className="w-full py-3 bg-surface-elevated rounded-xl font-bold flex items-center justify-center gap-2">
          <span>👥 Ask Friends</span>
        </button>
        <button
          onClick={handleGoHome}
          className="w-full py-3 text-muted"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
`,
            },
          },
          'SettingsModal.tsx': {
            file: {
              contents: `import { useGame, gameActions } from '@/store';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { state, dispatch } = useGame();
  const { settings } = state;

  const handleToggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      dispatch(gameActions.updateSettings({ [key]: !settings[key] }));
    }
  };

  return (
    <div className="bg-surface rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Settings</h2>
        <button onClick={onClose} className="text-2xl">✕</button>
      </div>

      <div className="space-y-4">
        <ToggleRow
          icon="🎵"
          label="Music"
          enabled={settings.music}
          onToggle={() => handleToggle('music')}
        />
        <ToggleRow
          icon="🔊"
          label="Sound"
          enabled={settings.sound}
          onToggle={() => handleToggle('sound')}
        />
        <ToggleRow
          icon="📳"
          label="Haptics"
          enabled={settings.haptics}
          onToggle={() => handleToggle('haptics')}
        />
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 bg-primary rounded-xl font-bold mt-6"
      >
        Done
      </button>
    </div>
  );
}

interface ToggleRowProps {
  icon: string;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ icon, label, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'w-12 h-7 rounded-full transition-colors relative',
          enabled ? 'bg-primary' : 'bg-border'
        )}
      >
        <div
          className={cn(
            'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}
`,
            },
          },
        },
      },
    },
  },
};

export default viteGameShellTemplate;
