'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';

interface CollectionSetDetailModalProps {
  onAnimatedClose?: () => void;
}

// Sample cards for each set
const setsData = [
  {
    id: 1,
    name: 'Olympics',
    cards: [
      { id: 1, name: 'Torch', collected: true },
      { id: 2, name: 'Medal', collected: true },
      { id: 3, name: 'Laurel', collected: true },
      { id: 4, name: 'Stadium', collected: false },
      { id: 5, name: 'Chariot', collected: false },
      { id: 6, name: 'Discus', collected: false },
      { id: 7, name: 'Javelin', collected: false },
      { id: 8, name: 'Wrestling', collected: false },
      { id: 9, name: 'Victory', collected: false },
    ],
    reward: 'x1',
  },
  {
    id: 2,
    name: 'Clothes',
    cards: [
      { id: 1, name: 'Toga', collected: true },
      { id: 2, name: 'Sandals', collected: true },
      { id: 3, name: 'Crown', collected: true },
      { id: 4, name: 'Robe', collected: false },
      { id: 5, name: 'Belt', collected: false },
      { id: 6, name: 'Cloak', collected: false },
      { id: 7, name: 'Boots', collected: false },
      { id: 8, name: 'Gloves', collected: false },
      { id: 9, name: 'Hat', collected: false },
    ],
    reward: 'x1',
  },
  {
    id: 3,
    name: 'Alchemy',
    cards: [
      { id: 1, name: 'Potion', collected: true },
      { id: 2, name: 'Flask', collected: true },
      { id: 3, name: 'Cauldron', collected: false },
      { id: 4, name: 'Crystal', collected: false },
      { id: 5, name: 'Scroll', collected: false },
      { id: 6, name: 'Mortar', collected: false },
      { id: 7, name: 'Herb', collected: false },
      { id: 8, name: 'Scale', collected: false },
      { id: 9, name: 'Book', collected: false },
    ],
    reward: 'x1',
  },
];

export function CollectionSetDetailModal({ onAnimatedClose }: CollectionSetDetailModalProps) {
  const { closeModal, openModal } = useNavigation();
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const currentSet = setsData[currentSetIndex];
  const collectedCount = currentSet.cards.filter(c => c.collected).length;
  const totalCards = currentSet.cards.length;

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  const handleCardClick = (card: { id: number; name: string; collected: boolean }) => {
    openModal('card-detail', { card, setName: currentSet.name });
  };

  const goToPrevious = () => {
    setCurrentSetIndex((prev) => (prev > 0 ? prev - 1 : setsData.length - 1));
  };

  const goToNext = () => {
    setCurrentSetIndex((prev) => (prev < setsData.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="relative">
      {/* Close button - Above panel top-right */}
      <button
        onClick={handleClose}
        className="absolute -top-12 -right-2 w-10 h-10 bg-bg-inverse rounded-full flex items-center justify-center border-2 border-border z-10 hover:opacity-80"
      >
        <span className="text-text-inverse font-bold text-value">X</span>
      </button>

        <div className="w-full max-w-[320px] bg-brand-muted rounded-2xl border-4 border-border-strong overflow-hidden">
        {/* Header */}
        <div className="bg-bg-inverse py-3 px-4 flex items-center justify-between">
          <button
            onClick={goToPrevious}
            className="w-8 h-8 bg-brand-muted rounded-full flex items-center justify-center border-2 border-border-strong"
          >
            <Image src="/icons/Chevron-Right.svg" alt="Previous" width={16} height={16} className="invert opacity-80 rotate-180" />
          </button>

          <h2 className="text-text-inverse text-h2">{currentSet.name}</h2>

          <button
            onClick={goToNext}
            className="w-8 h-8 bg-brand-muted rounded-full flex items-center justify-center border-2 border-border-strong"
          >
            <Image src="/icons/Chevron-Right.svg" alt="Next" width={16} height={16} className="invert opacity-80" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-brand-muted px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <div className="h-4 bg-bg-inverse rounded-full overflow-hidden">
                <div
                  className="h-full bg-border-strong rounded-full transition-all"
                  style={{ width: `${(collectedCount / totalCards) * 100}%` }}
                />
              </div>
              <span className="absolute inset-0 flex items-center justify-center text-text-inverse text-mini font-bold">
                {collectedCount}/{totalCards}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-border-strong rounded px-2 py-1">
              <span className="text-text-secondary text-value-sm">{currentSet.reward}</span>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="bg-bg-muted p-4">
          <div className="grid grid-cols-3 gap-3">
            {currentSet.cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-transform active:scale-95 ${
                  card.collected
                    ? 'bg-border-strong border-border'
                    : 'bg-brand-muted border-border-strong'
                }`}
              >
                {card.collected ? (
                  <>
                    <div className="w-10 h-10 bg-bg-muted rounded-lg flex items-center justify-center mb-1">
                      <span className="text-text-muted text-mini font-bold">{card.name.slice(0, 3).toUpperCase()}</span>
                    </div>
                    <span className="text-text-secondary text-mini font-bold">{card.name}</span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-bg-inverse rounded-lg flex items-center justify-center mb-1">
                      <span className="text-border-strong text-h3">?</span>
                    </div>
                    <span className="text-border-strong text-mini font-bold">???</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Page Dots */}
        <div className="bg-brand-muted py-3 flex justify-center gap-2">
          {setsData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSetIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSetIndex ? 'bg-bg-muted' : 'bg-bg-inverse'
              }`}
            />
          ))}
        </div>

        {/* Reward Section */}
        <div className="bg-border-strong p-3 flex items-center justify-between border-t-2 border-border">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-value">Set Reward:</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-bg-muted rounded flex items-center justify-center">
              <span className="text-text-muted text-value-sm">BST</span>
            </div>
            <span className="text-text-primary font-bold">{currentSet.reward}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
