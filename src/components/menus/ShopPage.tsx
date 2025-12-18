'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGame, useNavigation } from '@/store';
import { ShopPanel, CoinPackGrid } from '@/components/ui/ShopPanel';
import { BottomNavigation, FeatureDisabled } from '@/components/shared';
import { shopMockData } from '@/config/mockData';
import { isFeatureEnabled } from '@/config/features';

export function ShopPage() {
  const { state } = useGame();
  const { navigate } = useNavigation();
  const [showMoreOffers, setShowMoreOffers] = useState(false);
  const t = useTranslations('shop');
  const tCommon = useTranslations('common');

  // Feature flag check (must be after hooks)
  if (!isFeatureEnabled('SHOP')) {
    return <FeatureDisabled featureName={t('title')} />;
  }

  const { coinPacks, specialOfferItems, princeItems, queenItems } = shopMockData;

  return (
    <div className="flex flex-col h-full bg-bg-inverse">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 bg-bg-muted border-b border-border">
        {/* Coins display */}
        <div className="flex items-center gap-1 bg-bg-page rounded-full px-2 py-0.5 border border-border">
          <div className="w-5 h-5 bg-border-strong rounded-full flex items-center justify-center">
            <span className="text-text-primary text-mini">$</span>
          </div>
          <span className="text-text-primary text-value-sm">{state.player.coins.toLocaleString()}</span>
        </div>

        {/* Title */}
        <h1 className="text-text-primary text-h4">{t('title')}</h1>

        {/* Close button */}
        <button
          onClick={() => navigate('main-menu')}
          className="w-8 h-8 bg-bg-page rounded-full flex items-center justify-center border border-border hover:opacity-80"
        >
          <span className="text-text-primary text-value">X</span>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Featured Banner - Winter Pass */}
        <ShopPanel
          variant="featured"
          title={t('royalPass')}
          items={[
            { icon: 'BST', count: 8 },
            { icon: 'HRT', count: 8 },
            { icon: 'GFT' },
          ]}
          price="$14.98"
          buttonLabel={t('activate')}
        />

        {/* Special Offer Bundle */}
        <ShopPanel
          variant="bundle"
          title={t('specialOffer')}
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
              title={t('princesTreasure')}
              coins={5000}
              items={princeItems}
              price="$14.98"
            />

            {/* Queen's Treasure */}
            <ShopPanel
              variant="bundle"
              title={t('queensTreasure')}
              ribbon={t('popular')}
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
            {showMoreOffers ? tCommon('showLess') : tCommon('moreOffers')}
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
