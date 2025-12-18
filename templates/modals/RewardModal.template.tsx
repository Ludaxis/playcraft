/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         REWARD MODAL TEMPLATE                              ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Use this for: Showing rewards, celebrations, achievements                 ║
 * ║                                                                            ║
 * ║  Features:                                                                 ║
 * ║  - Animated reward display                                                 ║
 * ║  - Multiple reward types                                                   ║
 * ║  - Claim button                                                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

'use client';

import React from 'react';
import { useModal, useModalParams, usePlayer } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Reward {
  type: 'coins' | 'lives' | 'stars' | 'booster';
  amount: number;
  name?: string;
  icon?: string;
}

interface RewardModalParams extends Record<string, unknown> {
  title?: string;
  subtitle?: string;
  rewards?: Reward[];
  claimText?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULTS = {
  title: 'Congratulations!',
  subtitle: 'You earned these rewards:',
  claimText: 'Claim',
  rewards: [
    { type: 'coins' as const, amount: 500, icon: '/icons/Coin.svg' },
  ],
};

const REWARD_ICONS: Record<string, string> = {
  coins: '/icons/Coin.svg',
  lives: '/icons/Heart.svg',
  stars: '/icons/Star.svg',
  booster: '/icons/Fire.svg',
};

// ═══════════════════════════════════════════════════════════════════════════
// MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface Props {
  onAnimatedClose?: () => void;
}

export function RewardModal({ onAnimatedClose }: Props) {
  const { close } = useModal();
  const { addCoins, addLives, addStars } = usePlayer();
  const params = useModalParams<RewardModalParams>();

  // Use params or defaults
  const title = params.title ?? DEFAULTS.title;
  const subtitle = params.subtitle ?? DEFAULTS.subtitle;
  const rewards = params.rewards ?? DEFAULTS.rewards;
  const claimText = params.claimText ?? DEFAULTS.claimText;

  // ─────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      close();
    }
  };

  const handleClaim = () => {
    // Apply rewards to player
    rewards.forEach((reward) => {
      switch (reward.type) {
        case 'coins':
          addCoins(reward.amount);
          break;
        case 'lives':
          addLives(reward.amount);
          break;
        case 'stars':
          addStars(reward.amount);
          break;
        case 'booster':
          // TODO: Add booster to player inventory
          console.log('Adding booster:', reward.name, reward.amount);
          break;
      }
    });

    handleClose();
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="w-[300px] bg-bg-card rounded-xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-3 px-3 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h3">{title}</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-7 h-7 bg-bg-muted rounded-full flex items-center justify-center border border-border hover:opacity-80"
        >
          <span className="text-text-primary text-value">&times;</span>
        </button>
      </div>

      {/* Decorative bar */}
      <div className="h-1 bg-gradient-to-r from-brand-muted via-brand-primary to-brand-muted" />

      {/* Content */}
      <div className="p-4">
        <p className="text-body text-text-muted text-center mb-4">
          {subtitle}
        </p>

        {/* Rewards Grid */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {rewards.map((reward, index) => (
            <RewardItem key={index} reward={reward} />
          ))}
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          className="w-full py-3 bg-bg-inverse text-text-inverse rounded-xl font-bold text-value hover:opacity-90 transition-opacity"
        >
          {claimText}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REWARD ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface RewardItemProps {
  reward: Reward;
}

function RewardItem({ reward }: RewardItemProps) {
  const icon = reward.icon ?? REWARD_ICONS[reward.type] ?? '/icons/Star.svg';

  return (
    <div className="flex flex-col items-center p-3 bg-bg-muted rounded-xl min-w-[80px]">
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-bg-card flex items-center justify-center mb-2 border-2 border-border">
        <img src={icon} alt={reward.type} className="w-6 h-6" />
      </div>

      {/* Amount */}
      <div className="text-value font-bold text-text-primary">
        +{reward.amount.toLocaleString()}
      </div>

      {/* Name */}
      <div className="text-caption text-text-muted">
        {reward.name ?? reward.type}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default RewardModal;
