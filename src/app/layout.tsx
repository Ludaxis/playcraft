import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Puzzle Kit',
  description: 'High-fidelity interactive prototype for puzzle game UI/UX',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Root layout that wraps locale-specific layouts.
 * The actual content and styling is handled by [locale]/layout.tsx
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
