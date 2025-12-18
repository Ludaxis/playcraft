/**
 * useModal Hook
 *
 * Simplified hook for managing modals.
 * Use this instead of directly accessing NavigationContext for modal operations.
 *
 * @example
 * function LevelButton({ level }: { level: number }) {
 *   const { open } = useModal();
 *
 *   return (
 *     <Button onClick={() => open('level-start', { level })}>
 *       Play Level {level}
 *     </Button>
 *   );
 * }
 *
 * @example
 * function CloseButton() {
 *   const { close } = useModal();
 *   return <Button onClick={close}>Close</Button>;
 * }
 */

import { useCallback, useMemo } from 'react';
import { useNavigation } from '@/store';
import type { ModalId } from '@/config/registry';

export function useModal() {
  const {
    openModal,
    closeModal,
    closeAllModals,
    currentModal,
    modalStack,
    modalParams,
  } = useNavigation();

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Open a modal.
   * @param modalId - The modal to open
   * @param params - Optional parameters to pass to the modal
   *
   * @example
   * open('level-start', { level: 47 });
   * open('reward-claim');
   */
  const open = useCallback(
    <T extends ModalId>(modalId: T, params?: Record<string, unknown>) => {
      openModal(modalId, params);
    },
    [openModal]
  );

  /**
   * Close the current modal (top of stack).
   */
  const close = useCallback(() => {
    closeModal();
  }, [closeModal]);

  /**
   * Close all open modals.
   */
  const closeAll = useCallback(() => {
    closeAllModals();
  }, [closeAllModals]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  const computed = useMemo(
    () => ({
      /**
       * Check if a specific modal is currently open.
       */
      isOpen: (modalId: ModalId) =>
        modalStack.includes(modalId),

      /**
       * Check if the specific modal is the current (top) modal.
       */
      isCurrent: (modalId: ModalId) =>
        currentModal === modalId,

      /**
       * Whether any modal is open.
       */
      hasOpenModal: modalStack.length > 0,

      /**
       * Number of modals in the stack.
       */
      stackSize: modalStack.length,

      /**
       * Whether there are multiple modals open.
       */
      hasMultipleModals: modalStack.length > 1,
    }),
    [modalStack, currentModal]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // Actions
    open,
    close,
    closeAll,

    // Current state
    current: currentModal,
    stack: modalStack,
    params: modalParams,

    // Computed
    ...computed,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPED PARAM HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get typed parameters for the current modal.
 * Use this inside modal components to access their params.
 *
 * @example
 * function LevelStartModal() {
 *   const { level } = useModalParams<{ level?: number }>();
 *   return <div>Starting Level {level ?? 1}</div>;
 * }
 */
export function useModalParams<T extends Record<string, unknown> = Record<string, unknown>>(): T {
  const { modalParams } = useNavigation();
  return modalParams as T;
}

/**
 * Hook for checking if a specific modal is open.
 * Useful for conditional rendering outside the modal.
 *
 * @example
 * function App() {
 *   const isSettingsOpen = useIsModalOpen('settings');
 *   return <div className={isSettingsOpen ? 'blur' : ''}><Content /></div>;
 * }
 */
export function useIsModalOpen(modalId: ModalId): boolean {
  const { modalStack } = useNavigation();
  return modalStack.includes(modalId);
}

// Type exports
export type UseModalReturn = ReturnType<typeof useModal>;
