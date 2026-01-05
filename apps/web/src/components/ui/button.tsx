import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  // 2026: Smoother transitions, glow on focus, slightly larger radius
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-surface transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:shadow-glow-sm focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // 2026: Lighter hover states, glow effects
        default: 'bg-accent text-content hover:bg-accent-light hover:shadow-glow-sm active:bg-accent',
        destructive: 'bg-error text-content hover:bg-error-light hover:shadow-glow-error active:bg-error',
        outline: 'border border-border bg-surface hover:bg-surface-elevated hover:border-accent/30 hover:text-content',
        secondary: 'bg-surface-elevated text-content hover:bg-surface-overlay hover:shadow-glow-sm',
        ghost: 'hover:bg-surface-elevated hover:text-content',
        link: 'text-accent underline-offset-4 hover:text-accent-light hover:underline',
        // 2026: New cyan accent variant for gaming DNA
        accent: 'bg-secondary text-content hover:bg-secondary-light hover:shadow-glow-cyan active:bg-secondary',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
