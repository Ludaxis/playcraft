import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * Server-side request configuration for next-intl
 *
 * This handles loading the correct messages for the requested locale.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;

  // Validate that the locale is supported, fallback to default
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
