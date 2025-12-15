'use client';

import React, { useState } from 'react';
import { useGame, useNavigation } from '@/store';
import { ShopPanel, CoinPackGrid } from '@/components/ui/ShopPanel';

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
    <div className="flex flex-col h-full bg-slate-600">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 bg-slate-700">
        {/* Coins display */}
        <div className="flex items-center gap-1 bg-slate-200 rounded-full px-2 py-0.5">
          <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-yellow-700 text-[10px] font-bold">$</span>
          </div>
          <span className="text-slate-700 text-xs font-bold">{state.player.coins.toLocaleString()}</span>
        </div>

        {/* Title */}
        <h1 className="text-white text-base font-bold">Shop</h1>

        {/* Close button */}
        <button
          onClick={() => navigate('main-menu')}
          className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border border-red-400"
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
          className="w-full bg-slate-200 rounded-full py-2 flex items-center justify-center gap-2 border border-slate-300"
        >
          <span className="text-slate-600 text-xs font-bold">
            {showMoreOffers ? 'Show Less' : 'More Offers!'}
          </span>
          <div className="w-5 h-5 bg-slate-400 rounded-full flex items-center justify-center">
            <span className={`text-white text-xs transition-transform ${showMoreOffers ? 'rotate-180' : ''}`}>
              v
            </span>
          </div>
        </button>
      </div>

      {/* Bottom Navigation (visible behind) */}
      <div className="bg-slate-700 border-t border-slate-600 opacity-50">
        <div className="flex justify-around py-1.5">
          <NavPlaceholder icon="TRP" />
          <NavPlaceholder icon="CUP" />
          <NavPlaceholder icon="HOME" label="Home" />
          <NavPlaceholder icon="TEAM" />
          <NavPlaceholder icon="CARD" />
        </div>
      </div>
    </div>
  );
}

function NavPlaceholder({ icon, label }: { icon: string; label?: string }) {
  return (
    <div className="flex flex-col items-center px-2 py-0.5">
      <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
        <span className="text-slate-400 text-[8px] font-bold">{icon}</span>
      </div>
      {label && <span className="text-slate-400 text-[8px] mt-0.5">{label}</span>}
    </div>
  );
}
