/**
 * Internationalization Configuration
 *
 * Defines supported locales, default locale, and RTL languages.
 */

// All supported locales
export const locales = [
  'en', // English
  'ar', // Arabic
  'fa', // Persian (Farsi)
  'de', // German
  'fr', // French
  'es', // Spanish
  'zh-CN', // Chinese (Simplified)
  'zh-TW', // Chinese (Traditional)
  'ja', // Japanese
  'ko', // Korean
] as const;

// Default locale
export const defaultLocale = 'en' as const;

// RTL (Right-to-Left) locales
export const rtlLocales = ['ar', 'fa'] as const;

// CJK (Chinese, Japanese, Korean) locales - require special font handling
export const cjkLocales = ['zh-CN', 'zh-TW', 'ja', 'ko'] as const;

// Type definitions
export type Locale = (typeof locales)[number];
export type RTLLocale = (typeof rtlLocales)[number];
export type CJKLocale = (typeof cjkLocales)[number];

/**
 * Check if a locale is RTL
 */
export function isRTL(locale: Locale): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}

/**
 * Check if a locale is CJK
 */
export function isCJK(locale: Locale): boolean {
  return (cjkLocales as readonly string[]).includes(locale);
}

/**
 * Get the text direction for a locale
 */
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Language names in their native script (for language selector)
 */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  fa: 'فارسی',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  ja: '日本語',
  ko: '한국어',
};

/**
 * Language names in English (for admin/settings)
 */
export const localeNamesEnglish: Record<Locale, string> = {
  en: 'English',
  ar: 'Arabic',
  fa: 'Persian',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  ja: 'Japanese',
  ko: 'Korean',
};
