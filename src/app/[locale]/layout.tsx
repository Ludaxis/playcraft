import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Noto_Sans, Noto_Sans_Arabic, Noto_Sans_SC, Noto_Sans_JP, Noto_Sans_KR } from 'next/font/google';
import { locales, getDirection, type Locale } from '@/i18n/config';
import '../globals.css';

// Latin font (for most languages)
const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-latin',
});

// Arabic font (for Arabic and Persian)
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-arabic',
});

// Chinese Simplified font
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-chinese',
});

// Japanese font
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-japanese',
});

// Korean font
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-korean',
});

export const metadata: Metadata = {
  title: 'Puzzle Kit',
  description: 'High-fidelity interactive prototype for puzzle game UI/UX',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();

  // Get text direction
  const direction = getDirection(locale as Locale);

  // Combine all font variables
  const fontVariables = [
    notoSans.variable,
    notoSansArabic.variable,
    notoSansSC.variable,
    notoSansJP.variable,
    notoSansKR.variable,
  ].join(' ');

  // Get locale-specific font class
  const getLocaleFontClass = (loc: string): string => {
    switch (loc) {
      case 'ar':
      case 'fa':
        return 'font-arabic';
      case 'zh-CN':
      case 'zh-TW':
        return 'font-chinese';
      case 'ja':
        return 'font-japanese';
      case 'ko':
        return 'font-korean';
      default:
        return 'font-latin';
    }
  };

  return (
    <html lang={locale} dir={direction} className={fontVariables}>
      <body className={`antialiased ${getLocaleFontClass(locale)}`}>
        <NextIntlClientProvider messages={messages}>
          <div className="phone-frame">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
