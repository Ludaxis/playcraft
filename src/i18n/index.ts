/**
 * i18n Module Exports
 *
 * Central export point for all i18n utilities and configuration.
 */

// Configuration
export {
  locales,
  defaultLocale,
  rtlLocales,
  cjkLocales,
  localeNames,
  localeNamesEnglish,
  isRTL,
  isCJK,
  getDirection,
  type Locale,
  type RTLLocale,
  type CJKLocale,
} from './config';

// Routing
export { routing } from './routing';

// Navigation utilities
export { Link, redirect, usePathname, useRouter, getPathname } from './navigation';
