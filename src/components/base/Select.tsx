'use client';

import React from 'react';

/**
 * Select Component
 *
 * A dropdown select component for choosing from a list of options.
 *
 * @example
 * <Select
 *   value={selectedValue}
 *   options={[{ value: 'en', label: 'English' }, { value: 'de', label: 'Deutsch' }]}
 *   onChange={(value) => setSelectedValue(value)}
 * />
 */

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps<T extends string = string> {
  /** Currently selected value */
  value: T;
  /** Available options */
  options: SelectOption<T>[];
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Optional label for the select */
  label?: string;
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the select is in a loading/pending state */
  loading?: boolean;
  /** Size variant */
  size?: SelectSize;
  /** Aria label for accessibility */
  'aria-label'?: string;
  /** Additional CSS classes */
  className?: string;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: 'px-3 py-1.5 text-body-sm',
  md: 'px-4 py-2.5 text-body',
  lg: 'px-4 py-3 text-body',
};

export function Select<T extends string = string>({
  value,
  options,
  onChange,
  label,
  placeholder,
  disabled = false,
  loading = false,
  size = 'md',
  'aria-label': ariaLabel,
  className = '',
}: SelectProps<T>) {
  const isDisabled = disabled || loading;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-label text-text-primary">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          disabled={isDisabled}
          aria-label={ariaLabel || label}
          className={`
            w-full
            bg-bg-card
            border-2 border-border
            rounded-xl
            text-text-primary
            appearance-none
            cursor-pointer
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
            hover:border-border-strong
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border
            ${sizeStyles[size]}
            pr-10
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Dropdown arrow icon */}
        <div
          className={`
            absolute right-3 top-1/2 -translate-y-1/2
            pointer-events-none
            transition-opacity duration-150
            ${isDisabled ? 'opacity-50' : 'opacity-100'}
          `}
        >
          {loading ? (
            <svg
              className="w-5 h-5 text-text-muted animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
