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
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 bg-primary-light">
        {/* Coins display */}
        <div className="flex items-center gap-1 bg-surface-light rounded-full px-2 py-0.5">
          <div className="w-5 h-5 bg-gold rounded-full flex items-center justify-center">
            <span className="text-gold-darker text-[10px] font-bold">$</span>
          </div>
          <span className="text-primary-light text-xs font-bold">{state.player.coins.toLocaleString()}</span>
        </div>

        {/* Title */}
        <h1 className="text-white text-base font-bold">Shop</h1>

        {/* Close button */}
        <button
          onClick={() => navigate('main-menu')}
          className="w-8 h-8 bg-error rounded-full flex items-center justify-center border border-error-light"
        >
          <span className="text-white text-sm font-bold">X</span>
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
          className="w-full bg-surface-light rounded-full py-2 flex items-center justify-center gap-2 border border-surface"
        >
          <span className="text-secondary text-xs font-bold">
            {showMoreOffers ? 'Show Less' : 'More Offers!'}
          </span>
          <div className="w-5 h-5 bg-surface-dark rounded-full flex items-center justify-center">
            <span className={`text-white text-xs transition-transform ${showMoreOffers ? 'rotate-180' : ''}`}>
              v
            </span>
          </div>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activePage="shop" />
    </div>
  );
}
