import * as React from 'react';

import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-surface-overlay px-3 py-2 text-sm text-content ring-offset-surface file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-content placeholder:text-content-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
          error
            ? 'border-error focus-visible:ring-error'
            : 'border-border hover:border-border-emphasis',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
