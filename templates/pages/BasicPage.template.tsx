/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         BASIC PAGE TEMPLATE                                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Use this for: Simple content pages                                        ║
 * ║                                                                            ║
 * ║  To create a new page:                                                     ║
 * ║  1. Copy this file to src/components/menus/YourPageName.tsx               ║
 * ║  2. Run: npm run generate page your-page-name                              ║
 * ║     OR manually update registry.ts and AppShell.tsx                        ║
 * ║  3. Customize the content below                                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

'use client';

import React from 'react';
import { useNavigation } from '@/store';
import { usePlayer } from '@/hooks';
import { BottomNavigation } from '@/components/shared';

// ═══════════════════════════════════════════════════════════════════════════
// TODO: Update these values for your page
// ═══════════════════════════════════════════════════════════════════════════

const PAGE_ID = 'your-page-id'; // Must match registry
const PAGE_TITLE = 'Your Page Title';
const PAGE_ICON = '/icons/Star.svg';

// ═══════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function YourPageName() {
  const { goBack, canGoBack } = useNavigation();
  const { coins, stars } = usePlayer();

  return (
    <div className="flex flex-col h-full bg-bg-page">
      {/* ─────────────────────────────────────────────────────────────────────
          HEADER
          ───────────────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card">
        {/* Back Button (shown if navigated from another page) */}
        {canGoBack && (
          <button
            onClick={goBack}
            className="w-8 h-8 rounded-full bg-bg-muted flex items-center justify-center"
          >
            <span className="text-text-primary">&larr;</span>
          </button>
        )}

        {/* Page Title */}
        <h1 className="text-h3 text-text-primary font-bold flex-1 text-center">
          {PAGE_TITLE}
        </h1>

        {/* Right side placeholder (for action buttons) */}
        <div className="w-8" />
      </header>

      {/* ─────────────────────────────────────────────────────────────────────
          CONTENT
          TODO: Replace this with your page content
          ───────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-4">
        {/* Example: Player Stats */}
        <div className="bg-bg-card rounded-xl border-2 border-border p-4 mb-4">
          <h2 className="text-h4 text-text-primary mb-2">Player Stats</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <img src="/icons/Coin.svg" alt="coins" className="w-5 h-5" />
              <span className="text-text-secondary">{coins}</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/icons/Star.svg" alt="stars" className="w-5 h-5" />
              <span className="text-text-secondary">{stars}</span>
            </div>
          </div>
        </div>

        {/* Example: Simple Card */}
        <div className="bg-bg-card rounded-xl border-2 border-border p-4">
          <h2 className="text-h4 text-text-primary mb-2">Your Content Here</h2>
          <p className="text-body text-text-secondary">
            Replace this placeholder with your actual page content.
          </p>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────────────
          BOTTOM NAVIGATION
          ───────────────────────────────────────────────────────────────────── */}
      <BottomNavigation activePage={PAGE_ID} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Named export (required)
export default YourPageName;
