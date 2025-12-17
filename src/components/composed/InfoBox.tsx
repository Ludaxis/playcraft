'use client';

import React from 'react';
import { Card, IconBox } from '@/components/base';

/**
 * InfoBox Component
 *
 * An informational box with icon and text content.
 * Used for tips, feature explanations, or status displays.
 *
 * @example
 * <InfoBox
 *   title="Bonus Bank"
 *   icon={<CoinIcon />}
 *   description="Collect bonus coins during your journey!"
 * />
 */

interface InfoBoxProps {
  title?: string;
  description: string;
  icon?: React.ReactNode;
  iconText?: string;
  variant?: 'default' | 'highlight';
  className?: string;
  children?: React.ReactNode;
}

export function InfoBox({
  title,
  description,
  icon,
  iconText,
  variant = 'default',
  className = '',
  children,
}: InfoBoxProps) {
  return (
    <Card
      className={`
        ${variant === 'highlight' ? 'border-gold bg-gold/5' : ''}
        ${className}
      `}
    >
      {title && (
        <h3 className="text-text-primary font-bold text-center mb-2">{title}</h3>
      )}

      <div className="flex items-center gap-3">
        {(icon || iconText) && (
          <IconBox
            size="lg"
            variant={variant === 'highlight' ? 'default' : 'muted'}
            className={variant === 'highlight' ? 'border-2 border-gold' : ''}
          >
            {icon || (
              <span className="text-lg font-bold">{iconText}</span>
            )}
          </IconBox>
        )}

        <p className="flex-1 text-text-secondary text-sm">
          {description}
        </p>
      </div>

      {children}
    </Card>
  );
}

export type { InfoBoxProps };
