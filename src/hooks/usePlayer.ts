/**
 * usePlayer Hook
 *
 * Simplified hook for managing player state.
 * Use this instead of directly accessing GameContext for common player operations.
 *
 * @example
 * function BuyButton({ cost }: { cost: number }) {
 *   const { coins, canAfford, spendCoins } = usePlayer();
 *
 *   return (
 *     <Button
 *       disabled={!canAfford(cost)}
 *       onClick={() => spendCoins(cost)}
 *     >
 *       Buy for {cost} coins
 *     </Button>
 *   );
 * }
 */

import { useCallback, useMemo } from 'react';
import { useGame, gameActions } from '@/store';
import { playerDefaults } from '@/config/game.config';

export function usePlayer() {
  const { state, dispatch } = useGame();
  const player = state.player;

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add coins to player's balance.
   * @param amount - Number of coins to add (positive number)
   */
  const addCoins = useCallback(
    (amount: number) => {
      dispatch(gameActions.updateCoins(Math.abs(amount)));
    },
    [dispatch]
  );

  /**
   * Spend coins from player's balance.
   * @param amount - Number of coins to spend (positive number)
   * @returns true if successful, false if not enough coins
   */
  const spendCoins = useCallback(
    (amount: number): boolean => {
      const cost = Math.abs(amount);
      if (player.coins < cost) return false;
      dispatch(gameActions.updateCoins(-cost));
      return true;
    },
    [dispatch, player.coins]
  );

  /**
   * Add lives to player.
   * @param amount - Number of lives to add (capped at maxLives)
   */
  const addLives = useCallback(
    (amount: number) => {
      dispatch(gameActions.updateLives(Math.abs(amount)));
    },
    [dispatch]
  );

  /**
   * Use one life.
   * @returns true if successful, false if no lives available
   */
  const useLife = useCallback((): boolean => {
    if (player.lives <= 0) return false;
    dispatch(gameActions.updateLives(-1));
    return true;
  }, [dispatch, player.lives]);

  /**
   * Refill all lives to maximum.
   */
  const refillLives = useCallback(() => {
    dispatch(gameActions.updateLives(player.maxLives - player.lives));
  }, [dispatch, player.lives, player.maxLives]);

  /**
   * Add stars to player.
   * @param amount - Number of stars to add
   */
  const addStars = useCallback(
    (amount: number) => {
      dispatch(gameActions.updateStars(Math.abs(amount)));
    },
    [dispatch]
  );

  /**
   * Spend stars (for area tasks).
   * @param amount - Number of stars to spend
   * @returns true if successful, false if not enough stars
   */
  const spendStars = useCallback(
    (amount: number): boolean => {
      const cost = Math.abs(amount);
      if (player.stars < cost) return false;
      dispatch(gameActions.updateStars(-cost));
      return true;
    },
    [dispatch, player.stars]
  );

  /**
   * Complete current level (advances level and awards star).
   */
  const completeLevel = useCallback(() => {
    dispatch(gameActions.completeLevel());
  }, [dispatch]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  const computed = useMemo(
    () => ({
      /**
       * Check if player can afford a cost in coins.
       */
      canAfford: (cost: number) => player.coins >= cost,

      /**
       * Check if player has stars for a cost.
       */
      hasStars: (cost: number) => player.stars >= cost,

      /**
       * Whether player has any lives remaining.
       */
      hasLives: player.lives > 0,

      /**
       * Whether lives are at maximum.
       */
      livesAreFull: player.lives >= player.maxLives,

      /**
       * Lives as a percentage (0-100).
       */
      livesPercent: Math.round((player.lives / player.maxLives) * 100),

      /**
       * Whether player is at starting values (new player).
       */
      isNewPlayer: player.currentLevel <= playerDefaults.startingLevel,
    }),
    [player]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // Raw values
    coins: player.coins,
    lives: player.lives,
    maxLives: player.maxLives,
    stars: player.stars,
    level: player.currentLevel,
    area: player.currentArea,
    username: player.username,
    teamId: player.teamId,

    // Actions
    addCoins,
    spendCoins,
    addLives,
    useLife,
    refillLives,
    addStars,
    spendStars,
    completeLevel,

    // Computed
    ...computed,

    // Full player object (if needed)
    player,
  };
}

// Type export for consumers
export type UsePlayerReturn = ReturnType<typeof usePlayer>;
