'use client';

import React from 'react';

// Reusable Shop Panel Component
interface ShopPanelProps {
  variant?: 'featured' | 'offer' | 'bundle';
  title?: string;
  subtitle?: string;
  ribbon?: string;
  coins?: number;
  items?: { icon: string; count?: number | string }[];
  price: string;
  buttonLabel?: string;
  onClick?: () => void;
}

export function ShopPanel({
  variant = 'offer',
  title,
  subtitle: _subtitle, // Kept in API for future use
  ribbon,
  coins,
  items = [],
  price,
  buttonLabel = 'Buy',
  onClick,
}: ShopPanelProps) {
  void _subtitle;
  if (variant === 'featured') {
    return (
      <div className="relative bg-brand-hover rounded-2xl border-2 border-brand-muted overflow-hidden">
        {/* Title Banner */}
        {title && (
          <div className="bg-brand-primary px-4 py-2 flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-text-primary text-value-sm">♛</span>
            </div>
            <span className="text-text-inverse text-h3">{title}</span>
          </div>
        )}

        <div className="p-4 flex gap-4">
          {/* Left: Crown illustration */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <div className="absolute inset-0 bg-brand-primary rounded-xl flex items-center justify-center">
              <div className="text-4xl">👑</div>
            </div>
            {/* Badge */}
            <div className="absolute -bottom-1 -right-1 bg-brand-primary text-text-inverse text-mini px-2 py-0.5 rounded-full">
              VIP
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Benefits list */}
            <div className="space-y-1.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-bg-inverse rounded-lg px-2 py-1">
                  <div className="w-7 h-7 bg-brand-muted rounded-lg flex items-center justify-center">
                    <span className="text-text-primary text-mini">{item.icon}</span>
                  </div>
                  <span className="text-text-inverse text-label">
                    {item.count ? `x${item.count}` : 'Bonus'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom action area */}
        <div className="bg-bg-inverse px-4 py-3 flex items-center justify-between border-t border-border">
          <div className="flex flex-col">
            <span className="text-text-muted text-mini">Special Price</span>
            <span className="text-text-inverse text-h2">{price}</span>
          </div>
          <button
            onClick={onClick}
            className="bg-brand-primary hover:bg-brand-hover text-text-inverse text-button py-2.5 px-6 rounded-xl transition-all"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'bundle') {
    return (
      <div className="relative bg-bg-card rounded-lg border border-border overflow-hidden">
        {/* Ribbon */}
        {ribbon && (
          <div className="absolute top-1.5 -left-5 bg-brand-primary text-text-inverse text-mini px-6 py-0.5 -rotate-45">
            {ribbon}
          </div>
        )}

        {/* Top section - items */}
        <div className="p-2 flex gap-2">
          {/* Coins */}
          {coins && (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                <span className="text-text-inverse text-value">$</span>
              </div>
              <span className="text-text-primary text-value-sm mt-0.5">{coins.toLocaleString()}</span>
            </div>
          )}

          {/* Boosters */}
          <div className="flex-1 grid grid-cols-2 gap-0.5">
            {items.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-6 h-6 bg-bg-muted rounded flex items-center justify-center">
                  <span className="text-text-secondary text-mini">{item.icon}</span>
                </div>
                {item.count && (
                  <span className="text-text-secondary text-mini">x{item.count}</span>
                )}
              </div>
            ))}
          </div>

          {/* Special items */}
          <div className="flex flex-col gap-0.5">
            {items.slice(4).map((item, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-6 h-6 bg-bg-muted rounded flex items-center justify-center">
                  <span className="text-text-secondary text-mini">{item.icon}</span>
                </div>
                {item.count && (
                  <span className="text-text-secondary text-mini">{item.count}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section - title and price */}
        <div className="bg-brand-hover px-2 py-1.5 flex items-center justify-between">
          <span className="text-text-inverse text-value-sm">{title || 'Special Offer'}</span>
          <button
            onClick={onClick}
            className="bg-brand-primary hover:bg-brand-hover text-text-inverse text-value-sm py-1 px-3 rounded"
          >
            {price}
          </button>
        </div>
      </div>
    );
  }

  // Default: simple coin pack
  return (
    <div className="bg-bg-card rounded-lg border border-border overflow-hidden flex flex-col">
      <div className="flex-1 p-2 flex flex-col items-center justify-center">
        <div className="w-9 h-9 bg-brand-primary rounded-full flex items-center justify-center">
          <span className="text-text-inverse text-value">$</span>
        </div>
        <span className="text-text-primary text-value-sm mt-0.5">{coins?.toLocaleString()}</span>
      </div>
      <button
        onClick={onClick}
        className="bg-brand-hover hover:bg-bg-inverse text-text-inverse text-value-sm py-1.5"
      >
        {price}
      </button>
    </div>
  );
}

// Coin Pack Grid Component
interface CoinPackProps {
  packs: { coins: number; price: string; onClick?: () => void }[];
}

export function CoinPackGrid({ packs }: CoinPackProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {packs.map((pack, i) => (
        <ShopPanel key={i} coins={pack.coins} price={pack.price} onClick={pack.onClick} />
      ))}
    </div>
  );
}
