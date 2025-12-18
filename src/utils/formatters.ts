/**
 * Internationalized Formatting Utilities
 *
 * Locale-aware formatters for numbers, dates, currencies, and relative time.
 * Uses the native Intl API for optimal performance and accuracy.
 */

import type { Locale } from '@/i18n/config';

/**
 * Format a number with locale-specific formatting
 *
 * @example
 * formatNumber(1234567, 'en') // "1,234,567"
 * formatNumber(1234567, 'de') // "1.234.567"
 * formatNumber(1234567, 'ar') // "١٬٢٣٤٬٥٦٧"
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a compact number (e.g., 1.2K, 3.5M)
 *
 * @example
 * formatCompactNumber(1234, 'en') // "1.2K"
 * formatCompactNumber(1234567, 'en') // "1.2M"
 */
export function formatCompactNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format currency with locale-specific formatting
 *
 * @example
 * formatCurrency(9.99, 'en', 'USD') // "$9.99"
 * formatCurrency(9.99, 'de', 'EUR') // "9,99 €"
 * formatCurrency(9.99, 'ja', 'JPY') // "￥10"
 */
export function formatCurrency(
  value: number,
  locale: Locale,
  currency = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a percentage
 *
 * @example
 * formatPercent(0.75, 'en') // "75%"
 * formatPercent(0.75, 'ar') // "٧٥٪"
 */
export function formatPercent(
  value: number,
  locale: Locale,
  decimals = 0
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date with locale-specific formatting
 *
 * @example
 * formatDate(new Date(), 'en') // "Dec 18, 2025"
 * formatDate(new Date(), 'de') // "18. Dez. 2025"
 * formatDate(new Date(), 'ar') // "١٨ ديسمبر ٢٠٢٥"
 */
export function formatDate(
  date: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Format a date as short format (MM/YYYY or locale equivalent)
 *
 * @example
 * formatShortDate(new Date(), 'en') // "12/2025"
 * formatShortDate(new Date(), 'de') // "12.2025"
 */
export function formatShortDate(
  date: Date | number | string,
  locale: Locale
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
  }).format(d);
}

/**
 * Format time with locale-specific formatting
 *
 * @example
 * formatTime(new Date(), 'en') // "3:45 PM"
 * formatTime(new Date(), 'de') // "15:45"
 * formatTime(new Date(), 'ar') // "٣:٤٥ م"
 */
export function formatTime(
  date: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 *
 * @example
 * formatRelativeTime(-2, 'day', 'en') // "2 days ago"
 * formatRelativeTime(3, 'hour', 'ar') // "خلال ٣ ساعات"
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: Locale,
  style: 'long' | 'short' | 'narrow' = 'long'
): string {
  return new Intl.RelativeTimeFormat(locale, {
    style,
    numeric: 'auto',
  }).format(value, unit);
}

/**
 * Get relative time from a date compared to now
 *
 * @example
 * getRelativeTimeFromNow(yesterdayDate, 'en') // "yesterday"
 * getRelativeTimeFromNow(lastWeekDate, 'en') // "7 days ago"
 */
export function getRelativeTimeFromNow(
  date: Date | number | string,
  locale: Locale
): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    const value = Math.floor(Math.abs(diffInSeconds) / seconds);
    if (value >= 1) {
      return formatRelativeTime(
        diffInSeconds < 0 ? value : -value,
        unit,
        locale
      );
    }
  }

  return formatRelativeTime(0, 'second', locale);
}

/**
 * Format a duration in a human-readable way
 *
 * @example
 * formatDuration(3661, 'en') // "1h 1m"
 * formatDuration(90, 'en') // "1m 30s"
 */
export function formatDuration(
  seconds: number,
  locale: Locale,
  options?: { showSeconds?: boolean }
): string {
  const { showSeconds = true } = options || {};

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${formatNumber(hours, locale)}h`);
  }
  if (minutes > 0) {
    parts.push(`${formatNumber(minutes, locale)}m`);
  }
  if (showSeconds && (secs > 0 || parts.length === 0)) {
    parts.push(`${formatNumber(secs, locale)}s`);
  }

  return parts.join(' ');
}

/**
 * Format ordinal number (1st, 2nd, 3rd, etc.)
 * Note: Full ordinal support varies by locale
 *
 * @example
 * formatOrdinal(1, 'en') // "1st"
 * formatOrdinal(2, 'en') // "2nd"
 * formatOrdinal(3, 'en') // "3rd"
 */
export function formatOrdinal(value: number, locale: Locale): string {
  // Use Intl.PluralRules for ordinal category
  const pr = new Intl.PluralRules(locale, { type: 'ordinal' });
  const rule = pr.select(value);

  // English ordinal suffixes
  if (locale === 'en') {
    const suffixes: Record<string, string> = {
      one: 'st',
      two: 'nd',
      few: 'rd',
      other: 'th',
    };
    return `${value}${suffixes[rule] || 'th'}`;
  }

  // For other locales, just return the number with locale formatting
  // Full ordinal text would require translation files
  return formatNumber(value, locale);
}

/**
 * Format a list of items with locale-aware conjunction
 *
 * @example
 * formatList(['apple', 'banana', 'orange'], 'en') // "apple, banana, and orange"
 * formatList(['apple', 'banana', 'orange'], 'ar') // "apple وbanana وorange"
 */
export function formatList(
  items: string[],
  locale: Locale,
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  return new Intl.ListFormat(locale, {
    style: 'long',
    type,
  }).format(items);
}
