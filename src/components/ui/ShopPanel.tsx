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
  subtitle,
  ribbon,
  coins,
  items = [],
  price,
  buttonLabel = 'Buy',
  onClick,
}: ShopPanelProps) {
  if (variant === 'featured') {
    return (
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl border-2 border-purple-400 overflow-hidden shadow-lg">
        {/* Decorative glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        {/* Title Banner with crown icon */}
        {title && (
          <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center rotate-12 shadow-md">
              <span className="text-yellow-700 text-xs font-bold">♛</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">{title}</span>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10" />
          </div>
        )}

        <div className="p-4 flex gap-4">
          {/* Left: Crown illustration */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-xl shadow-lg flex items-center justify-center">
              <div className="text-4xl">👑</div>
            </div>
            {/* Badge */}
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              VIP
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Benefits list */}
            <div className="space-y-1.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-slate-700 text-[10px] font-bold">{item.icon}</span>
                  </div>
                  <span className="text-white text-sm font-medium">
                    {item.count ? `x${item.count}` : 'Bonus'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom action area */}
        <div className="bg-black/20 px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-purple-200 text-[10px]">Special Price</span>
            <span className="text-white text-xl font-bold">{price}</span>
          </div>
          <button
            onClick={onClick}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-slate-800 font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg transition-all hover:scale-105"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'bundle') {
    return (
      <div className="relative bg-slate-300 rounded-lg border border-slate-400 overflow-hidden">
        {/* Ribbon */}
        {ribbon && (
          <div className="absolute top-1.5 -left-5 bg-slate-600 text-white text-[8px] font-bold px-6 py-0.5 -rotate-45">
            {ribbon}
          </div>
        )}

        {/* Top section - items */}
        <div className="p-2 flex gap-2">
          {/* Coins */}
          {coins && (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center">
                <span className="text-slate-700 text-sm font-bold">$</span>
              </div>
              <span className="text-slate-700 font-bold text-xs mt-0.5">{coins.toLocaleString()}</span>
            </div>
          )}

          {/* Boosters */}
          <div className="flex-1 grid grid-cols-2 gap-0.5">
            {items.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-6 h-6 bg-slate-400 rounded flex items-center justify-center">
                  <span className="text-slate-600 text-[8px] font-bold">{item.icon}</span>
                </div>
                {item.count && (
                  <span className="text-slate-600 text-[10px] font-bold">x{item.count}</span>
                )}
              </div>
            ))}
          </div>

          {/* Special items */}
          <div className="flex flex-col gap-0.5">
            {items.slice(4).map((item, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-6 h-6 bg-slate-400 rounded flex items-center justify-center">
                  <span className="text-slate-600 text-[8px] font-bold">{item.icon}</span>
                </div>
                {item.count && (
                  <span className="text-slate-600 text-[10px]">{item.count}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section - title and price */}
        <div className="bg-slate-500 px-2 py-1.5 flex items-center justify-between">
          <span className="text-white text-xs font-bold">{title || 'Special Offer'}</span>
          <button
            onClick={onClick}
            className="bg-slate-300 hover:bg-slate-200 text-slate-700 font-bold py-1 px-3 rounded text-xs"
          >
            {price}
          </button>
        </div>
      </div>
    );
  }

  // Default: simple coin pack
  return (
    <div className="bg-slate-200 rounded-lg border border-slate-300 overflow-hidden flex flex-col">
      <div className="flex-1 p-2 flex flex-col items-center justify-center">
        <div className="w-9 h-9 bg-slate-400 rounded-full flex items-center justify-center">
          <span className="text-slate-600 text-sm font-bold">$</span>
        </div>
        <span className="text-slate-700 font-bold text-xs mt-0.5">{coins?.toLocaleString()}</span>
      </div>
      <button
        onClick={onClick}
        className="bg-slate-400 hover:bg-slate-500 text-white font-bold py-1.5 text-xs"
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
