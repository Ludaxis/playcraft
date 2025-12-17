'use client';

import React from 'react';

/**
 * Toggle Component
 *
 * A simple on/off toggle switch.
 *
 * @example
 * <Toggle checked={isEnabled} onChange={setIsEnabled} label="Notifications" />
 */

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: ToggleProps) {
  return (
    <label
      className={`
        inline-flex items-center gap-3
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative
          w-11 h-6
          rounded-full
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
          ${checked ? 'bg-bg-inverse' : 'bg-border'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5
            w-5 h-5
            bg-bg-card
            rounded-full
            shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-text-primary">{label}</span>
      )}
    </label>
  );
}

export type { ToggleProps };
