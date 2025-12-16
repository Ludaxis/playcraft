'use client';

import React from 'react';
import Image from 'next/image';
import { useGame, useNavigation } from '@/store';

interface CollectionInfoModalProps {
  onAnimatedClose?: () => void;
}

export function CollectionInfoModal({ onAnimatedClose }: CollectionInfoModalProps) {
  const { closeModal } = useNavigation();
  const { state } = useGame();
  const { player } = state;

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-4 cursor-pointer"
      onClick={handleClose}
    >
      {/* Title */}
      <h1 className="text-white text-3xl font-bold mb-8">Origins Collection</h1>

      {/* Step 1: Card Packs */}
      <div className="flex items-start gap-4 mb-2">
        <div className="flex flex-col items-center">
          {/* Card Packs Visual */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-16 bg-surface-dark rounded-lg border-2 border-surface -rotate-12 -mr-4" />
            <div className="w-14 h-18 bg-surface rounded-lg border-2 border-surface-light z-10" />
            <div className="w-12 h-16 bg-surface-dark rounded-lg border-2 border-surface rotate-12 -ml-4" />
          </div>
          <p className="text-white text-sm text-center font-medium max-w-[200px]">
            Collect card packs from events and chests!
          </p>
        </div>

        {/* Arrow */}
        <div className="mt-8">
          <Image src="/icons/Arrow-Down.svg" alt="Arrow" width={32} height={32} className="invert opacity-60 rotate-[-45deg]" />
        </div>
      </div>

      {/* Step 2: Complete Sets */}
      <div className="flex items-start gap-4 mb-2 ml-20">
        <div className="flex flex-col items-center">
          {/* Completed Set Visual */}
          <div className="w-24 h-24 bg-surface-dark rounded-xl border-4 border-surface grid grid-cols-3 gap-0.5 p-1 mb-2 relative">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-secondary-light rounded-sm" />
            ))}
            {/* Completed Badge */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-surface rounded-full px-2 py-1 flex items-center gap-1">
                <Image src="/icons/Check-Circle.svg" alt="Complete" width={14} height={14} className="opacity-80" />
                <span className="text-secondary text-[10px] font-bold">Completed!</span>
              </div>
            </div>
          </div>
          <p className="text-white text-sm text-center font-medium max-w-[200px]">
            Get cards from card packs and friends to complete sets!
          </p>
        </div>

        {/* Arrow */}
        <div className="mt-12">
          <Image src="/icons/Arrow-Down.svg" alt="Arrow" width={32} height={32} className="invert opacity-60 rotate-[45deg]" />
        </div>
      </div>

      {/* Step 3: Rewards */}
      <div className="flex flex-col items-center mb-6 -ml-20">
        {/* Trophy/Rewards Visual */}
        <div className="flex items-end justify-center mb-2">
          <div className="w-16 h-20 bg-surface-dark rounded-t-full flex items-center justify-center border-2 border-surface">
            <span className="text-secondary text-lg font-bold">TRP</span>
          </div>
          <div className="w-10 h-10 bg-secondary-light rounded-full -ml-2 -mb-1 flex items-center justify-center border-2 border-surface-dark">
            <span className="text-surface text-xs">$</span>
          </div>
        </div>
        <p className="text-white text-sm text-center font-medium max-w-[220px]">
          Complete all sets to claim collection rewards and Origins Badge!
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-surface rounded-xl p-3 flex items-center gap-3 mb-8 w-[280px]">
        {/* Avatar */}
        <div className="w-14 h-14 bg-surface-dark rounded-xl border-2 border-surface flex items-center justify-center">
          <span className="text-secondary text-xs font-bold">AVT</span>
        </div>

        {/* Badge */}
        <div className="w-10 h-12 bg-surface-dark rounded flex items-center justify-center border-2 border-surface">
          <span className="text-secondary text-[8px] font-bold">BDG</span>
        </div>

        {/* Username */}
        <span className="text-primary-light font-bold flex-1">{player.username}</span>

        {/* Level */}
        <div className="text-right">
          <div className="text-secondary-light text-xs">Level</div>
          <div className="text-primary-light text-lg font-bold">{player.currentLevel}</div>
        </div>
      </div>

      {/* Tap to Continue */}
      <p className="text-white text-xl font-bold">Tap to Continue</p>
    </div>
  );
}
