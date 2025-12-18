/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                          LIST PAGE TEMPLATE                                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Use this for: Pages with scrollable lists (inbox, friends, leaderboard)  ║
 * ║                                                                            ║
 * ║  Features:                                                                 ║
 * ║  - Scrollable list with items                                              ║
 * ║  - Empty state handling                                                    ║
 * ║  - Item click handling                                                     ║
 * ║  - Header with optional action button                                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/store';
import { useModal } from '@/hooks';
import { BottomNavigation } from '@/components/shared';

// ═══════════════════════════════════════════════════════════════════════════
// TODO: Update these values for your page
// ═══════════════════════════════════════════════════════════════════════════

const PAGE_ID = 'your-list-page';
const PAGE_TITLE = 'Your List';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Define your item type
interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  badge?: string | number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA - TODO: Replace with real data
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_ITEMS: ListItem[] = [
  { id: '1', title: 'Item One', subtitle: 'Description here', icon: '/icons/Star.svg' },
  { id: '2', title: 'Item Two', subtitle: 'Another description', icon: '/icons/Heart.svg', badge: 'New' },
  { id: '3', title: 'Item Three', subtitle: 'Third item', icon: '/icons/Coin.svg', badge: 5 },
];

// ═══════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function YourListPage() {
  const { goBack, canGoBack } = useNavigation();
  const { open } = useModal();

  // TODO: Replace with real data source
  const [items] = useState<ListItem[]>(MOCK_ITEMS);

  // ─────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────

  const handleItemClick = (item: ListItem) => {
    // TODO: Handle item click (e.g., open modal, navigate)
    console.log('Item clicked:', item);
    // Example: open('item-detail', { itemId: item.id });
  };

  const handleActionClick = () => {
    // TODO: Handle header action button click
    console.log('Action clicked');
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-bg-page">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card">
        {canGoBack ? (
          <button
            onClick={goBack}
            className="w-8 h-8 rounded-full bg-bg-muted flex items-center justify-center"
          >
            <span className="text-text-primary">&larr;</span>
          </button>
        ) : (
          <div className="w-8" />
        )}

        <h1 className="text-h3 text-text-primary font-bold">{PAGE_TITLE}</h1>

        {/* Optional action button */}
        <button
          onClick={handleActionClick}
          className="w-8 h-8 rounded-full bg-bg-muted flex items-center justify-center"
        >
          <span className="text-text-primary">+</span>
        </button>
      </header>

      {/* List Content */}
      <main className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-muted flex items-center justify-center mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <h2 className="text-h4 text-text-primary mb-2">No Items Yet</h2>
            <p className="text-body text-text-muted">
              Your items will appear here.
            </p>
          </div>
        ) : (
          /* List Items */
          <div className="divide-y divide-border">
            {items.map((item) => (
              <ListItemRow
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activePage={PAGE_ID} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LIST ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ListItemRowProps {
  item: ListItem;
  onClick: () => void;
}

function ListItemRow({ item, onClick }: ListItemRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-muted transition-colors text-left"
    >
      {/* Icon */}
      {item.icon && (
        <div className="w-10 h-10 rounded-full bg-bg-muted flex items-center justify-center flex-shrink-0">
          <img src={item.icon} alt="" className="w-5 h-5" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-body font-medium text-text-primary truncate">
          {item.title}
        </div>
        {item.subtitle && (
          <div className="text-body-sm text-text-muted truncate">
            {item.subtitle}
          </div>
        )}
      </div>

      {/* Badge */}
      {item.badge && (
        <div className="px-2 py-0.5 rounded-full bg-bg-inverse text-text-inverse text-caption">
          {item.badge}
        </div>
      )}

      {/* Arrow */}
      <span className="text-text-muted">&rsaquo;</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default YourListPage;
