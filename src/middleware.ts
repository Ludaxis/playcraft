import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Internationalization Middleware
 *
 * Handles:
 * - Locale detection from Accept-Language header
 * - URL locale prefix management
 * - Locale cookie persistence
 */
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Static files (images, fonts, etc.)
  // - Next.js internals
  matcher: ['/', '/(ar|fa|de|fr|es|zh-CN|zh-TW|ja|ko|en)/:path*'],
};
