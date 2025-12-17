'use client';

import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0
          rounded-full border-2 border-border
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2
          ${checked ? 'bg-bg-inverse' : 'bg-bg-muted'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5
            rounded-full bg-bg-card border border-border
            transform transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      {label && <span className="text-body-sm text-text-primary">{label}</span>}
    </label>
  );
}
