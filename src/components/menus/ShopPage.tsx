'use client';

import React, { useState } from 'react';
import { useGame, useNavigation } from '@/store';
import { ShopPanel, CoinPackGrid } from '@/components/ui/ShopPanel';
import { BottomNavigation } from '@/components/shared';

export function ShopPage() {
  const { state } = useGame();
  const { navigate } = useNavigation();
  const [showMoreOffers, setShowMoreOffers] = useState(false);

  const coinPacks = [
    { coins: 1000, price: '$2.98' },
    { coins: 5000, price: '$9.98' },
    { coins: 10000, price: '$19.98' },
  ];

  const specialOfferItems = [
    { icon: 'ARW', count: 1 },
    { icon: 'TNT', count: 1 },
    { icon: 'HAM', count: 1 },
    { icon: 'GLV', count: 1 },
    { icon: 'INF', count: '1h' },
    { icon: 'GFT' },
  ];

  const princeItems = [
    { icon: 'ARW', count: 1 },
    { icon: 'TNT', count: 1 },
    { icon: 'HAM', count: 1 },
    { icon: 'GLV', count: 1 },
    { icon: 'INF', count: '1h' },
    { icon: 'GFT' },
  ];

  const queenItems = [
    { icon: 'ARW', count: 2 },
    { icon: 'TNT', count: 2 },
    { icon: 'HAM', count: 2 },
    { icon: 'GLV', count: 2 },
    { icon: 'INF', count: '12h' },
    { icon: 'GFT' },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-inverse">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 bg-brand-hover">
        {/* Coins display */}
        <div className="flex items-center gap-1 bg-bg-page rounded-full px-2 py-0.5">
          <div className="w-5 h-5 bg-gold rounded-full flex items-center justify-center">
            <span className="text-gold-darker text-mini">$</span>
          </div>
          <span className="text-text-primary text-value-sm">{state.player.coins.toLocaleString()}</span>
        </div>

        {/* Title */}
        <h1 className="text-text-inverse text-h4">Shop</h1>

        {/* Close button */}
        <button
          onClick={() => navigate('main-menu')}
          className="w-8 h-8 bg-status-error rounded-full flex items-center justify-center border border-error-light"
        >
          <span className="text-text-inverse text-value">X</span>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Featured Banner - Winter Pass */}
        <ShopPanel
          variant="featured"
          title="Royal Pass"
          items={[
            { icon: 'BST', count: 8 },
            { icon: 'HRT', count: 8 },
            { icon: 'GFT' },
          ]}
          price="$14.98"
          buttonLabel="Activate"
        />

        {/* Special Offer Bundle */}
        <ShopPanel
          variant="bundle"
          title="Special Offer"
          coins={2000}
          items={specialOfferItems}
          price="$2.98"
        />

        {/* Coin Packs Row */}
        {!showMoreOffers && <CoinPackGrid packs={coinPacks} />}

        {/* More Offers Section (expanded) */}
        {showMoreOffers && (
          <>
            {/* Prince's Treasure */}
            <ShopPanel
              variant="bundle"
              title="Prince's Treasure"
              coins={5000}
              items={princeItems}
              price="$14.98"
            />

            {/* Queen's Treasure */}
            <ShopPanel
              variant="bundle"
              title="Queen's Treasure"
              ribbon="Popular"
              coins={10000}
              items={queenItems}
              price="$29.98"
            />
          </>
        )}

        {/* More Offers Button */}
        <button
          onClick={() => setShowMoreOffers(!showMoreOffers)}
          className="w-full bg-bg-card rounded-full py-2 flex items-center justify-center gap-2 border border-border"
        >
          <span className="text-text-primary text-value-sm">
            {showMoreOffers ? 'Show Less' : 'More Offers!'}
          </span>
          <span className={`text-text-secondary text-caption transition-transform ${showMoreOffers ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activePage="shop" />
    </div>
  );
}
