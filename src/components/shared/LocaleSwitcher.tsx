'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';

interface LocaleSwitcherProps {
  /** Show native language names instead of English names */
  showNativeNames?: boolean;
  /** Compact mode - show only current locale code */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Language Switcher Component
 *
 * Allows users to switch between available languages.
 * Works with next-intl for seamless locale switching.
 */
export function LocaleSwitcher({
  showNativeNames = true,
  compact = false,
  className = '',
}: LocaleSwitcherProps) {
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  if (compact) {
    return (
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value as Locale)}
        disabled={isPending}
        className={`
          bg-bg-card border border-border rounded-lg px-3 py-2
          text-text-primary text-body-sm
          focus:outline-none focus:ring-2 focus:ring-brand-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label={t('language')}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {showNativeNames ? localeNames[loc] : loc.toUpperCase()}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-label text-text-primary block mb-2">
        {t('language')}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            disabled={isPending || locale === loc}
            className={`
              px-4 py-3 rounded-lg border text-body-sm
              transition-colors duration-150
              ${
                locale === loc
                  ? 'bg-bg-inverse text-text-inverse border-transparent'
                  : 'bg-bg-card text-text-primary border-border hover:bg-bg-muted'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LocaleSwitcher;
