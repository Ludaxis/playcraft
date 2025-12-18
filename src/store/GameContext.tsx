'use client';

import React, { createContext, useContext, useReducer, useRef, useEffect, type ReactNode } from 'react';
import type {
  PlayerState,
  Area,
  Booster,
  LiveOpsEvent,
  Team,
  Settings,
  InboxMessage,
  DailyReward,
} from '@/types';
import {
  initialPlayerState,
  areas as initialAreas,
  boosters as initialBoosters,
  createAllLiveOpsEvents,
  team as initialTeam,
  initialSettings,
  createInboxMessages,
  dailyRewards as initialDailyRewards,
} from '@/config';

// Game State
interface GameState {
  player: PlayerState;
  areas: Area[];
  boosters: Booster[];
  events: LiveOpsEvent[];
  team: Team | null;
  settings: Settings;
  inbox: InboxMessage[];
  dailyRewards: DailyReward[];
}

// Action Types
type GameAction =
  | { type: 'UPDATE_COINS'; payload: number }
  | { type: 'UPDATE_LIVES'; payload: number }
  | { type: 'UPDATE_STARS'; payload: number }
  | { type: 'COMPLETE_LEVEL' }
  | { type: 'COMPLETE_TASK'; payload: { areaId: number; taskId: string } }
  | { type: 'USE_BOOSTER'; payload: string }
  | { type: 'ADD_BOOSTER'; payload: { id: string; count: number } }
  | { type: 'UPDATE_EVENT_PROGRESS'; payload: { eventId: string; progress: number } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'CLAIM_INBOX_MESSAGE'; payload: string }
  | { type: 'CLAIM_DAILY_REWARD'; payload: number }
  | { type: 'UPDATE_TEAM_PROGRESS'; payload: number };

// Create initial state function (deferred to avoid hydration mismatch)
function createInitialState(): GameState {
  return {
    player: initialPlayerState,
    areas: initialAreas,
    boosters: initialBoosters,
    events: createAllLiveOpsEvents(),
    team: initialTeam,
    settings: initialSettings,
    inbox: createInboxMessages(),
    dailyRewards: initialDailyRewards,
  };
}

// Placeholder state for SSR (no dates)
const placeholderState: GameState = {
  player: initialPlayerState,
  areas: initialAreas,
  boosters: initialBoosters,
  events: [],
  team: initialTeam,
  settings: initialSettings,
  inbox: [],
  dailyRewards: initialDailyRewards,
};

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

    case 'COMPLETE_TASK': {
      const { areaId, taskId } = action.payload;
      const task = state.areas
        .find((a) => a.id === areaId)
        ?.tasks.find((t) => t.id === taskId);

      if (!task || task.completed) return state;

      const newAreas = state.areas.map((area) => {
        if (area.id !== areaId) return area;

        const newTasks = area.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: true } : t
        );

        const allCompleted = newTasks.every((t) => t.completed);

        return { ...area, tasks: newTasks, completed: allCompleted };
      });

      // Unlock next area if current completed
      const currentArea = newAreas.find((a) => a.id === areaId);
      if (currentArea?.completed) {
        const nextArea = newAreas.find((a) => a.id === areaId + 1);
        if (nextArea) {
          const nextIndex = newAreas.indexOf(nextArea);
          newAreas[nextIndex] = { ...nextArea, unlocked: true };
        }
      }

      return {
        ...state,
        areas: newAreas,
        player: {
          ...state.player,
          stars: state.player.stars - task.starsRequired,
        },
      };
    }

    case 'USE_BOOSTER':
      return {
        ...state,
        boosters: state.boosters.map((b) =>
          b.id === action.payload ? { ...b, count: Math.max(0, b.count - 1) } : b
        ),
      };

    case 'ADD_BOOSTER':
      return {
        ...state,
        boosters: state.boosters.map((b) =>
          b.id === action.payload.id ? { ...b, count: b.count + action.payload.count } : b
        ),
      };

    case 'UPDATE_EVENT_PROGRESS':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.eventId
            ? { ...e, progress: Math.min(e.maxProgress, action.payload.progress) }
            : e
        ),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'CLAIM_INBOX_MESSAGE':
      return {
        ...state,
        inbox: state.inbox.map((m) =>
          m.id === action.payload ? { ...m, claimed: true } : m
        ),
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

    case 'UPDATE_TEAM_PROGRESS':
      if (!state.team) return state;
      return {
        ...state,
        team: {
          ...state.team,
          chestProgress: Math.min(state.team.chestGoal, state.team.chestProgress + action.payload),
        },
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
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // Use ref to track mount state - avoids setState in effect lint warning
  const isMounted = useRef(false);
  const [state, dispatch] = useReducer(gameReducer, placeholderState, () => {
    // Lazy initialization - only runs once
    if (typeof window !== 'undefined') {
      return createInitialState();
    }
    return placeholderState;
  });

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Show placeholder during SSR to avoid hydration mismatch
  // Check window instead of mounted ref to handle initial render
  if (typeof window === 'undefined') {
    return (
      <GameContext.Provider value={{ state: placeholderState, dispatch }}>
        {children}
      </GameContext.Provider>
    );
  }

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

// Action Creators (for convenience)
export const gameActions = {
  updateCoins: (amount: number): GameAction => ({ type: 'UPDATE_COINS', payload: amount }),
  updateLives: (amount: number): GameAction => ({ type: 'UPDATE_LIVES', payload: amount }),
  updateStars: (amount: number): GameAction => ({ type: 'UPDATE_STARS', payload: amount }),
  completeLevel: (): GameAction => ({ type: 'COMPLETE_LEVEL' }),
  completeTask: (areaId: number, taskId: string): GameAction => ({
    type: 'COMPLETE_TASK',
    payload: { areaId, taskId },
  }),
  useBooster: (boosterId: string): GameAction => ({ type: 'USE_BOOSTER', payload: boosterId }),
  addBooster: (id: string, count: number): GameAction => ({
    type: 'ADD_BOOSTER',
    payload: { id, count },
  }),
  updateEventProgress: (eventId: string, progress: number): GameAction => ({
    type: 'UPDATE_EVENT_PROGRESS',
    payload: { eventId, progress },
  }),
  updateSettings: (settings: Partial<Settings>): GameAction => ({
    type: 'UPDATE_SETTINGS',
    payload: settings,
  }),
  claimInboxMessage: (messageId: string): GameAction => ({
    type: 'CLAIM_INBOX_MESSAGE',
    payload: messageId,
  }),
  claimDailyReward: (day: number): GameAction => ({
    type: 'CLAIM_DAILY_REWARD',
    payload: day,
  }),
  updateTeamProgress: (stars: number): GameAction => ({
    type: 'UPDATE_TEAM_PROGRESS',
    payload: stars,
  }),
};
