'use client';

import React from 'react';
import { useNavigation } from '@/store';

interface CardDetailModalProps {
  onAnimatedClose?: () => void;
}

export function CardDetailModal({ onAnimatedClose }: CardDetailModalProps) {
  const { closeModal, modalParams } = useNavigation();

  // Get card data from modal params
  const card = modalParams?.card as { id: number; name: string; collected: boolean } | undefined;
  const setName = modalParams?.setName as string | undefined;

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  if (!card) {
    return null;
  }

  return (
    <div className="relative">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute -top-10 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-red-400"
      >
        <span className="text-white font-bold text-sm">X</span>
      </button>

        <div className="w-[200px] bg-slate-500 rounded-2xl border-4 border-slate-400 overflow-hidden">
          {/* Card Header */}
          <div className="bg-slate-600 py-2 px-3 text-center">
            <span className="text-slate-300 text-xs font-bold">{setName}</span>
          </div>

          {/* Card Image Area */}
          <div className="p-4 flex flex-col items-center">
            {card.collected ? (
              <div className="w-20 h-20 bg-slate-300 rounded-xl flex items-center justify-center mb-3 border-2 border-slate-400">
                <span className="text-slate-600 text-lg font-bold">{card.name.slice(0, 3).toUpperCase()}</span>
              </div>
            ) : (
              <div className="w-20 h-20 bg-slate-600 rounded-xl flex items-center justify-center mb-3 border-2 border-slate-500">
                <span className="text-slate-400 text-3xl font-bold">?</span>
              </div>
            )}

            {/* Card Name */}
            <h3 className="text-white text-lg font-bold mb-1">
              {card.collected ? card.name : '???'}
            </h3>

            {/* Rarity Stars */}
            <div className="flex gap-1 mb-2">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className={`w-4 h-4 ${card.collected ? 'bg-yellow-400' : 'bg-slate-600'} rounded-sm`}
                  style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
                />
              ))}
            </div>

            {/* Status */}
            <div className={`px-3 py-1 rounded-full ${card.collected ? 'bg-green-500' : 'bg-slate-600'}`}>
              <span className="text-white text-xs font-bold">
                {card.collected ? 'Collected' : 'Not Found'}
              </span>
            </div>
          </div>

        {/* Card Info */}
        {!card.collected && (
          <div className="bg-slate-400 p-3 text-center">
            <p className="text-slate-700 text-xs font-medium">
              Play levels to find this card!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
