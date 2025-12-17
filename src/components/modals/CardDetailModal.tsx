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
        className="absolute -top-10 -right-2 w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border-2 border-border hover:opacity-80"
      >
        <span className="text-text-inverse font-bold text-caption">X</span>
      </button>

        <div className="w-[200px] bg-brand-muted rounded-2xl border-4 border-border-strong overflow-hidden">
          {/* Card Header */}
          <div className="bg-bg-inverse py-2 px-3 text-center">
            <span className="text-text-muted text-value-sm">{setName}</span>
          </div>

          {/* Card Image Area */}
          <div className="p-4 flex flex-col items-center">
            {card.collected ? (
              <div className="w-20 h-20 bg-bg-muted rounded-xl flex items-center justify-center mb-3 border-2 border-border-strong">
                <span className="text-text-secondary text-h3">{card.name.slice(0, 3).toUpperCase()}</span>
              </div>
            ) : (
              <div className="w-20 h-20 bg-bg-inverse rounded-xl flex items-center justify-center mb-3 border-2 border-brand-muted">
                <span className="text-border-strong text-h1">?</span>
              </div>
            )}

            {/* Card Name */}
            <h3 className="text-text-inverse text-h3 mb-1">
              {card.collected ? card.name : '???'}
            </h3>

            {/* Rarity Stars */}
            <div className="flex gap-1 mb-2">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className={`w-4 h-4 ${card.collected ? 'bg-brand-primary' : 'bg-bg-inverse'} rounded-sm`}
                  style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
                />
              ))}
            </div>

            {/* Status */}
            <div className={`px-3 py-1 rounded-full ${card.collected ? 'bg-brand-primary' : 'bg-bg-inverse'}`}>
              <span className="text-text-inverse text-value-sm">
                {card.collected ? 'Collected' : 'Not Found'}
              </span>
            </div>
          </div>

        {/* Card Info */}
        {!card.collected && (
          <div className="bg-border-strong p-3 text-center">
            <p className="text-text-primary text-mini font-medium">
              Play levels to find this card!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
