import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

/**
 * Root page redirects to the default locale.
 * The middleware should handle this, but this is a fallback.
 */
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
