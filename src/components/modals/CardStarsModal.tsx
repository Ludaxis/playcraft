'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';

interface CardStarsModalProps {
  onAnimatedClose?: () => void;
}

export function CardStarsModal({ onAnimatedClose }: CardStarsModalProps) {
  const { closeModal } = useNavigation();
  const [showChestTooltip, setShowChestTooltip] = useState(false);

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  return (
    <div className="relative w-[320px] bg-brand-muted rounded-2xl border-4 border-border-strong overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-4 px-4 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h1">Card Stars</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border-2 border-border hover:opacity-80"
        >
          <span className="text-text-inverse font-bold">X</span>
        </button>
      </div>

        {/* Cards Display */}
        <div className="bg-bg-inverse px-4 pb-4">
          <div className="flex items-center justify-center gap-2">
            {/* Card 1 */}
            <div className="relative w-16 h-20 bg-border-strong rounded-lg border-2 border-border flex items-center justify-center -rotate-12">
              <span className="text-text-secondary text-value-sm">C1</span>
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-brand-muted rounded-full flex items-center justify-center border-2 border-border-strong">
                <span className="text-text-inverse text-mini font-bold">+1</span>
              </div>
            </div>

            {/* Card 2 (Center - Featured) */}
            <div className="relative w-20 h-24 bg-bg-muted rounded-lg border-2 border-bg-page flex flex-col items-center justify-center z-10">
              {/* Stars on top */}
              <div className="absolute -top-3 flex gap-0.5">
                <Image src="/icons/Star-Filled.svg" alt="Star" width={12} height={12} className="opacity-80" />
                <Image src="/icons/Star-Filled.svg" alt="Star" width={12} height={12} className="opacity-80" />
                <Image src="/icons/Star-Filled.svg" alt="Star" width={12} height={12} className="opacity-80" />
              </div>
              <span className="text-text-secondary text-value">Card</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-border-strong rounded-full flex items-center justify-center border-2 border-border">
                <span className="text-text-primary text-mini font-bold">+2</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative w-16 h-20 bg-border-strong rounded-lg border-2 border-border flex items-center justify-center rotate-12">
              <span className="text-text-secondary text-value-sm">C3</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-muted rounded-full flex items-center justify-center border-2 border-border-strong">
                <span className="text-text-inverse text-mini font-bold">+3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <div className="bg-bg-inverse px-4 pb-3">
          <p className="text-text-inverse text-caption text-center font-medium">
            Use your duplicate card stars to open chests!
          </p>
        </div>

        {/* Chests Section */}
        <div className="bg-bg-muted p-4">
          {/* Chest Tooltip */}
          {showChestTooltip && (
            <div className="mb-3 bg-bg-page rounded-xl border-2 border-border p-3 relative">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-border-strong rounded flex items-center justify-center">
                    <span className="text-text-secondary text-mini font-bold">4 CRD</span>
                  </div>
                </div>
                <span className="text-text-muted font-bold">+</span>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-border-strong rounded flex items-center justify-center">
                    <span className="text-text-secondary text-mini font-bold">3 CRD</span>
                  </div>
                </div>
                <span className="text-text-muted font-bold">+</span>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-border-strong rounded-full flex items-center justify-center">
                    <span className="text-text-secondary text-mini font-bold">ITM</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-border-strong rounded-full flex items-center justify-center">
                    <span className="text-text-secondary text-mini font-bold">TNT</span>
                  </div>
                </div>
                <span className="text-text-muted font-bold">+</span>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-border-strong rounded-full flex items-center justify-center">
                    <span className="text-text-secondary text-mini font-bold">BST</span>
                  </div>
                </div>
                <span className="text-text-muted font-bold">+</span>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-border-strong rounded-full flex items-center justify-center">
                    <span className="text-text-secondary text-mini font-bold">PWR</span>
                  </div>
                </div>
              </div>
              {/* Arrow pointer */}
              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-bg-page border-r-2 border-b-2 border-border transform rotate-45" />
            </div>
          )}

          {/* Chest Row 1 - Blue Chest */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowChestTooltip(!showChestTooltip)}
              className="w-16 h-16 bg-border-strong rounded-xl border-2 border-border flex items-center justify-center"
            >
              <span className="text-text-secondary text-value-sm">CHT1</span>
            </button>
            <button className="flex items-center gap-2 bg-border-strong rounded-xl px-6 py-3 border-2 border-border">
              <Image src="/icons/Star-Filled.svg" alt="Stars" width={24} height={24} className="opacity-80" />
              <span className="text-text-primary text-h2">250</span>
            </button>
          </div>

          {/* Chest Row 2 - Gold Chest */}
          <div className="flex items-center justify-between">
            <div className="w-16 h-16 bg-border-strong rounded-xl border-2 border-border flex items-center justify-center">
              <span className="text-text-secondary text-value-sm">CHT2</span>
            </div>
          <button className="flex items-center gap-2 bg-border-strong rounded-xl px-6 py-3 border-2 border-border">
            <Image src="/icons/Star-Filled.svg" alt="Stars" width={24} height={24} className="opacity-80" />
            <span className="text-text-primary text-h2">500</span>
          </button>
        </div>
      </div>
    </div>
  );
}
