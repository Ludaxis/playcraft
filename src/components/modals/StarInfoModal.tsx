'use client';

import React from 'react';
import Image from 'next/image';
import { useGame, useNavigation } from '@/store';

interface StarInfoModalProps {
  onAnimatedClose?: () => void;
}

export function StarInfoModal({ onAnimatedClose }: StarInfoModalProps) {
  const { closeModal, openModal } = useNavigation();
  const { state } = useGame();
  const { player } = state;

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  const handleContinue = () => {
    handleClose();
    setTimeout(() => {
      openModal('level-start');
    }, 250);
  };

  return (
    <div className="relative w-[280px] bg-secondary-light rounded-2xl border-2 border-surface-dark overflow-hidden">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 w-7 h-7 bg-error rounded-full flex items-center justify-center border border-error-light hover:bg-error-light transition-colors z-10"
      >
        <span className="text-white text-sm font-bold">X</span>
      </button>

      {/* Header with star icon */}
      <div className="pt-4 pb-3 flex flex-col items-center">
        {/* Large Star Icon */}
        <div className="w-14 h-14 bg-surface-dark rounded-full flex items-center justify-center mb-2 border-2 border-surface">
          <Image
            src="/icons/Star-Filled.svg"
            alt="Stars"
            width={32}
            height={32}
            className="opacity-80"
          />
        </div>

        {/* Title */}
        <h2 className="text-white text-base font-bold">Earn Stars</h2>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-secondary mx-3" />

      {/* Info Content */}
      <div className="p-3">
        <p className="text-surface text-xs text-center mb-3">
          Complete levels to earn stars and unlock new areas!
        </p>

        {/* Star Reward Display */}
        <div className="bg-surface-dark rounded-lg p-3 border border-surface mb-3">
          <div className="flex items-center justify-center gap-3">
            {/* Level Icon */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 bg-secondary-light rounded flex items-center justify-center mb-0.5">
                <span className="text-surface text-sm font-bold">{player.currentLevel}</span>
              </div>
              <span className="text-secondary text-[10px] font-bold">Level</span>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <Image
                src="/icons/Arrow-Right.svg"
                alt="Arrow"
                width={18}
                height={18}
                className="opacity-60"
              />
            </div>

            {/* Star Reward */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 bg-surface rounded-full flex items-center justify-center mb-0.5 border border-surface-light">
                <Image
                  src="/icons/Star-Filled.svg"
                  alt="Star"
                  width={20}
                  height={20}
                  className="opacity-80"
                />
              </div>
              <span className="text-secondary text-[10px] font-bold">+1 Star</span>
            </div>
          </div>
        </div>

        {/* Current Stars */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <span className="text-surface text-xs">Current Stars:</span>
          <div className="flex items-center gap-1 bg-surface-dark rounded-full px-2 py-0.5">
            <Image
              src="/icons/Star-Filled.svg"
              alt="Star"
              width={12}
              height={12}
              className="opacity-80"
            />
            <span className="text-primary-light text-xs font-bold">{player.stars}</span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-3 pt-0">
        <button
          onClick={handleContinue}
          className="w-full bg-surface-dark hover:bg-surface rounded-lg py-2.5 border-2 border-surface transition-colors"
        >
          <span className="text-primary-light text-sm font-bold">Continue</span>
        </button>
      </div>
    </div>
  );
}
