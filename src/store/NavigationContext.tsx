'use client';

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { PageId, ModalId, ModalIdOrNull, NavigationState, NavigationAction } from '@/types';

// Initial State
const initialState: NavigationState & { modalParams: Record<string, unknown> } = {
  currentPage: 'main-menu',
  previousPage: null,
  modalStack: [],
  pageParams: {},
  modalParams: {},
};

// Extended state type with modalParams
type ExtendedState = NavigationState & { modalParams: Record<string, unknown> };

// Reducer
function navigationReducer(state: ExtendedState, action: NavigationAction): ExtendedState {
  switch (action.type) {
    case 'NAVIGATE':
      if (!action.payload?.page) return state;
      return {
        ...state,
        previousPage: state.currentPage,
        currentPage: action.payload.page,
        pageParams: action.payload.params || {},
        modalStack: [],
        modalParams: {},
      };

    case 'GO_BACK':
      if (!state.previousPage) return state;
      return {
        ...state,
        currentPage: state.previousPage,
        previousPage: null,
        pageParams: {},
        modalStack: [],
        modalParams: {},
      };

    case 'OPEN_MODAL':
      if (!action.payload?.modal) return state;
      return {
        ...state,
        modalStack: [...state.modalStack, action.payload.modal],
        modalParams: action.payload.params || state.modalParams,
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
        modalParams: {},
      };

    default:
      return state;
  }
}

// Context
interface NavigationContextValue {
  state: NavigationState;
  navigate: (page: PageId, params?: Record<string, unknown>) => void;
  goBack: () => void;
  openModal: (modal: ModalId, params?: Record<string, unknown>) => void;
  closeModal: () => void;
  closeAllModals: () => void;
  currentModal: ModalIdOrNull;
  modalStack: ModalIdOrNull[];
  modalParams: Record<string, unknown>;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

// Provider
interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);

  const navigate = useCallback((page: PageId, params?: Record<string, unknown>) => {
    dispatch({ type: 'NAVIGATE', payload: { page, params } });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const openModal = useCallback((modal: ModalId, params?: Record<string, unknown>) => {
    dispatch({ type: 'OPEN_MODAL', payload: { modal, params } });
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
        modalStack: state.modalStack,
        modalParams: state.modalParams,
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
