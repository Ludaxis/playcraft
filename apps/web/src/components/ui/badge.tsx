import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent text-content hover:bg-accent-light',
        secondary:
          'border-transparent bg-surface-elevated text-content-secondary hover:bg-surface-overlay',
        destructive: 'border-transparent bg-error text-content hover:bg-error-light',
        outline: 'text-content-secondary border-border',
        success: 'border-transparent bg-success text-content hover:bg-success-light',
        warning: 'border-transparent bg-warning text-surface-base hover:bg-warning-light',
        // Gaming DNA variants
        accent: 'border-transparent bg-secondary text-content hover:bg-secondary-light',
        glow: 'border-accent/30 bg-accent-subtle text-accent shadow-glow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
