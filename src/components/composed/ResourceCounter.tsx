'use client';

import React from 'react';
import Image from 'next/image';

/**
 * ResourceCounter Component
 *
 * Displays a resource (coins, lives, stars) with value and optional add button.
 * Extracted from MainMenu header for reusability.
 *
 * @example
 * <ResourceCounter type="coins" value={2500} onPress={() => navigate('shop')} showAdd />
 * <ResourceCounter type="lives" value={5} onPress={() => openModal('free-lives')} />
 */

type ResourceType = 'coins' | 'lives' | 'stars';

interface ResourceCounterProps {
  type: ResourceType;
  value: number;
  onPress?: () => void;
  showAdd?: boolean;
  className?: string;
}

const resourceConfig: Record<ResourceType, { icon: string; symbol: string }> = {
  coins: { icon: '/icons/Shopping-2.svg', symbol: '$' },
  lives: { icon: '/icons/Heart-Filled.svg', symbol: '' },
  stars: { icon: '/icons/Star-Filled.svg', symbol: '' },
};

export function ResourceCounter({
  type,
  value,
  onPress,
  showAdd = false,
  className = '',
}: ResourceCounterProps) {
  const config = resourceConfig[type];
  const Component = onPress ? 'button' : 'div';

  return (
    <Component
      onClick={onPress}
      className={`
        flex items-center gap-1
        bg-bg-muted/20
        rounded-full
        px-2 py-1
        ${onPress ? 'cursor-pointer hover:bg-bg-muted/30 active:bg-bg-muted/40' : ''}
        ${className}
      `}
    >
      {/* Icon */}
      <div className="w-5 h-5 bg-bg-muted/30 rounded-full flex items-center justify-center">
        {config.symbol ? (
          <span className="text-text-inverse text-mini font-bold">{config.symbol}</span>
        ) : (
          <Image
            src={config.icon}
            alt={type}
            width={14}
            height={14}
            className="invert opacity-80"
          />
        )}
      </div>

      {/* Value */}
      <span className="text-text-inverse text-value">
        {value.toLocaleString()}
      </span>

      {/* Add Button */}
      {showAdd && (
        <div className="w-4 h-4 bg-bg-muted/40 rounded-full flex items-center justify-center">
          <Image
            src="/icons/Add.svg"
            alt="Add"
            width={10}
            height={10}
            className="invert opacity-80"
          />
        </div>
      )}
    </Component>
  );
}

export type { ResourceCounterProps, ResourceType };
