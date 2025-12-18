import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

/**
 * Routing configuration for next-intl
 *
 * Defines how locales are handled in URLs.
 */
export const routing = defineRouting({
  // All supported locales
  locales,

  // Default locale (used when no locale is specified)
  defaultLocale,

  // Hide the default locale from URLs
  // e.g., /shop instead of /en/shop
  localePrefix: 'as-needed',
});
