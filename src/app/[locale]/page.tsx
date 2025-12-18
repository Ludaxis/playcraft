import { setRequestLocale } from 'next-intl/server';
import { AppShell } from '@/components/layout';
import { locales, type Locale } from '@/i18n/config';

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale as Locale);

  return <AppShell />;
}
