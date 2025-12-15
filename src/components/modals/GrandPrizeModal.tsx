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
    <div className="relative w-[320px] bg-slate-500 rounded-2xl border-4 border-slate-400 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-600 py-3 px-4 flex items-center justify-center relative">
        <h2 className="text-white text-xl font-bold">Grand Prize</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-red-400"
        >
          <span className="text-white font-bold">X</span>
        </button>
      </div>

        {/* Trophy Section */}
        <div className="bg-slate-500 p-6 flex flex-col items-center">
          {/* Large Trophy */}
          <div className="w-32 h-40 bg-slate-400 rounded-xl border-4 border-slate-300 flex items-center justify-center mb-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-20 bg-slate-300 rounded-t-full border-2 border-slate-200 flex items-center justify-center">
                <span className="text-slate-500 text-2xl font-bold">T</span>
              </div>
              <div className="w-10 h-4 bg-slate-300 border-2 border-slate-200 -mt-1" />
              <div className="w-14 h-3 bg-slate-300 border-2 border-slate-200 rounded-b" />
            </div>
          </div>

          {/* Origins Badge Label */}
          <div className="bg-slate-400 rounded-full px-4 py-1 mb-4">
            <span className="text-slate-700 text-sm font-bold">Origins Badge</span>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="bg-slate-300 p-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Coins */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-400 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <span className="text-slate-600 text-lg font-bold">$</span>
              </div>
              <span className="text-slate-600 text-sm font-bold mt-1">10000</span>
            </div>

            {/* TNT */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-400 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <span className="text-slate-600 text-xs font-bold">TNT</span>
              </div>
              <span className="text-slate-600 text-sm font-bold mt-1">x10</span>
            </div>

            {/* Propeller */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-400 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <span className="text-slate-600 text-xs font-bold">PRP</span>
              </div>
              <span className="text-slate-600 text-sm font-bold mt-1">x10</span>
            </div>

            {/* Light Ball */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-400 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <span className="text-slate-600 text-xs font-bold">LB</span>
              </div>
              <span className="text-slate-600 text-sm font-bold mt-1">x10</span>
            </div>
          </div>

          {/* Second Row of Rewards */}
          <div className="flex items-center justify-center gap-3 mt-3">
            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-400 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <span className="text-slate-600 text-xs font-bold">ARW</span>
              </div>
              <span className="text-slate-600 text-sm font-bold mt-1">x10</span>
            </div>

            {/* Cannon */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-400 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <span className="text-slate-600 text-xs font-bold">CAN</span>
              </div>
              <span className="text-slate-600 text-sm font-bold mt-1">x10</span>
            </div>

            {/* Jester Hat */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-400 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <span className="text-slate-600 text-xs font-bold">JST</span>
              </div>
              <span className="text-slate-600 text-sm font-bold mt-1">x5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
