'use client';

import React from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';

interface GrandPrizeModalProps {
  onAnimatedClose?: () => void;
}

export function GrandPrizeModal({ onAnimatedClose }: GrandPrizeModalProps) {
  const { closeModal } = useNavigation();

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
      <div className="bg-bg-inverse py-3 px-4 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h2">Grand Prize</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-8 h-8 bg-bg-inverse rounded-full flex items-center justify-center border-2 border-border hover:opacity-80"
        >
          <span className="text-text-inverse font-bold">X</span>
        </button>
      </div>

        {/* Trophy Section */}
        <div className="bg-brand-muted p-6 flex flex-col items-center">
          {/* Large Trophy */}
          <div className="w-32 h-40 bg-border-strong rounded-xl border-4 border-border flex items-center justify-center mb-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-20 bg-bg-muted rounded-t-full border-2 border-bg-page flex items-center justify-center">
                <span className="text-brand-muted text-h1">T</span>
              </div>
              <div className="w-10 h-4 bg-bg-muted border-2 border-bg-page -mt-1" />
              <div className="w-14 h-3 bg-bg-muted border-2 border-bg-page rounded-b" />
            </div>
          </div>

          {/* Origins Badge Label */}
          <div className="bg-border-strong rounded-full px-4 py-1 mb-4">
            <span className="text-text-primary text-value">Origins Badge</span>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="bg-bg-muted p-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Coins */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-border-strong rounded-full border-2 border-border flex items-center justify-center">
                <span className="text-text-secondary text-h3">$</span>
              </div>
              <span className="text-text-secondary text-value mt-1">10000</span>
            </div>

            {/* TNT */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-border-strong rounded-full border-2 border-border flex items-center justify-center">
                <span className="text-text-secondary text-value-sm">TNT</span>
              </div>
              <span className="text-text-secondary text-value mt-1">x10</span>
            </div>

            {/* Propeller */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-border-strong rounded-full border-2 border-border flex items-center justify-center">
                <span className="text-text-secondary text-value-sm">PRP</span>
              </div>
              <span className="text-text-secondary text-value mt-1">x10</span>
            </div>

            {/* Light Ball */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-border-strong rounded-full border-2 border-border flex items-center justify-center">
                <span className="text-text-secondary text-value-sm">LB</span>
              </div>
              <span className="text-text-secondary text-value mt-1">x10</span>
            </div>
          </div>

          {/* Second Row of Rewards */}
          <div className="flex items-center justify-center gap-3 mt-3">
            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-border-strong rounded-full border-2 border-border flex items-center justify-center">
                <span className="text-text-secondary text-value-sm">ARW</span>
              </div>
              <span className="text-text-secondary text-value mt-1">x10</span>
            </div>

            {/* Cannon */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-border-strong rounded-full border-2 border-border flex items-center justify-center">
                <span className="text-text-secondary text-value-sm">CAN</span>
              </div>
              <span className="text-text-secondary text-value mt-1">x10</span>
            </div>

            {/* Jester Hat */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-border-strong rounded-full border-2 border-border flex items-center justify-center">
                <span className="text-text-secondary text-value-sm">JST</span>
              </div>
              <span className="text-text-secondary text-value mt-1">x5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
