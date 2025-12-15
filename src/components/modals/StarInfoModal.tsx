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
    <div className="relative w-[280px] bg-slate-500 rounded-2xl border-2 border-slate-400 overflow-hidden">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center border border-red-400 hover:bg-red-400 transition-colors z-10"
      >
        <span className="text-white text-sm font-bold">X</span>
      </button>

      {/* Header with star icon */}
      <div className="pt-4 pb-3 flex flex-col items-center">
        {/* Large Star Icon */}
        <div className="w-14 h-14 bg-slate-400 rounded-full flex items-center justify-center mb-2 border-2 border-slate-300">
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
      <div className="h-0.5 bg-slate-600 mx-3" />

      {/* Info Content */}
      <div className="p-3">
        <p className="text-slate-300 text-xs text-center mb-3">
          Complete levels to earn stars and unlock new areas!
        </p>

        {/* Star Reward Display */}
        <div className="bg-slate-400 rounded-lg p-3 border border-slate-300 mb-3">
          <div className="flex items-center justify-center gap-3">
            {/* Level Icon */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 bg-slate-500 rounded flex items-center justify-center mb-0.5">
                <span className="text-slate-300 text-sm font-bold">{player.currentLevel}</span>
              </div>
              <span className="text-slate-600 text-[10px] font-bold">Level</span>
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
              <div className="w-9 h-9 bg-slate-300 rounded-full flex items-center justify-center mb-0.5 border border-slate-200">
                <Image
                  src="/icons/Star-Filled.svg"
                  alt="Star"
                  width={20}
                  height={20}
                  className="opacity-80"
                />
              </div>
              <span className="text-slate-600 text-[10px] font-bold">+1 Star</span>
            </div>
          </div>
        </div>

        {/* Current Stars */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <span className="text-slate-300 text-xs">Current Stars:</span>
          <div className="flex items-center gap-1 bg-slate-400 rounded-full px-2 py-0.5">
            <Image
              src="/icons/Star-Filled.svg"
              alt="Star"
              width={12}
              height={12}
              className="opacity-80"
            />
            <span className="text-slate-700 text-xs font-bold">{player.stars}</span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-3 pt-0">
        <button
          onClick={handleContinue}
          className="w-full bg-slate-400 hover:bg-slate-300 rounded-lg py-2.5 border-2 border-slate-300 transition-colors"
        >
          <span className="text-slate-700 text-sm font-bold">Continue</span>
        </button>
      </div>
    </div>
  );
}
