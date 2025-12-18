import { clsx, type ClassValue } from 'clsx';

/**
 * Utility for merging class names conditionally.
 * Combines clsx for conditional classes with clean output.
 *
 * @example
 * // Basic usage
 * cn('base-class', 'another-class')
 *
 * // Conditional classes
 * cn('base', isActive && 'active', isDisabled && 'disabled')
 *
 * // Object syntax
 * cn('base', { 'active': isActive, 'disabled': isDisabled })
 *
 * // Array syntax
 * cn(['base', 'another'], isActive && 'active')
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
