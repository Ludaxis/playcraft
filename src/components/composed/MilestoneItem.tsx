'use client';

import React from 'react';
import { Card, Button } from '@/components/base';

/**
 * MilestoneItem Component
 *
 * Displays a milestone or achievement item with completion status.
 * Used in team chest, book of treasure, and album pages.
 *
 * @example
 * <MilestoneItem
 *   index={1}
 *   title="500 Stars"
 *   subtitle="Team Reward"
 *   completed={true}
 *   onClaim={() => handleClaim()}
 * />
 */

interface MilestoneItemProps {
  index: number;
  title: string;
  subtitle?: string;
  completed: boolean;
  claimed?: boolean;
  onClaim?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function MilestoneItem({
  index,
  title,
  subtitle,
  completed,
  claimed = false,
  onClaim,
  icon,
  className = '',
}: MilestoneItemProps) {
  const canClaim = completed && !claimed && onClaim;

  return (
    <Card
      padding="sm"
      className={`
        flex items-center gap-3
        ${completed && !claimed ? 'border-status-success' : ''}
        ${claimed ? 'opacity-60' : ''}
        ${className}
      `}
    >
      {/* Index or Icon */}
      <div
        className={`
          w-8 h-8
          rounded-full
          flex items-center justify-center
          font-bold text-sm
          ${completed
            ? 'bg-status-success text-text-inverse'
            : 'bg-bg-muted text-text-secondary'
          }
        `}
      >
        {completed ? (
          <CheckIcon />
        ) : icon || (
          index
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {subtitle && (
          <p className="text-xs text-text-muted">{subtitle}</p>
        )}
      </div>

      {/* Action */}
      {canClaim && (
        <Button size="sm" onClick={onClaim}>
          Claim
        </Button>
      )}

      {claimed && (
        <span className="text-xs text-text-muted font-medium">Claimed</span>
      )}
    </Card>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13L9 17L19 7" />
    </svg>
  );
}

export type { MilestoneItemProps };
