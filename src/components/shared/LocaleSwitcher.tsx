'use client';

import { useMemo, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { Select, type SelectOption, type SelectSize } from '@/components/base';

interface LocaleSwitcherProps {
  /** Show native language names instead of English names */
  showNativeNames?: boolean;
  /** Display mode - dropdown or grid of buttons */
  mode?: 'dropdown' | 'grid';
  /** Size of the select dropdown (only applies to dropdown mode) */
  size?: SelectSize;
  /** Label for the dropdown */
  label?: string;
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
  mode = 'dropdown',
  size = 'md',
  label,
  className = '',
}: LocaleSwitcherProps) {
  const t = useTranslations('settings');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  const options: SelectOption<Locale>[] = useMemo(() => {
    return locales.map((loc) => ({
      value: loc,
      label: showNativeNames ? localeNames[loc] : loc.toUpperCase(),
    }));
  }, [showNativeNames]);

  if (mode === 'dropdown') {
    return (
      <Select<Locale>
        value={locale}
        options={options}
        onChange={handleLocaleChange}
        loading={isPending}
        disabled={isPending}
        size={size}
        label={label}
        aria-label={label || t('language')}
        className={className}
      />
    );
  }

  // Grid mode (legacy)
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
